-- RLS and grant tests for the products schema (pgTAP).
-- Run with: npx supabase test db
-- Everything runs inside one transaction and is rolled back at the end.

begin;
create extension if not exists pgtap with schema extensions;
select plan(39);

-- Fixtures, inserted as postgres (bypasses RLS). seed.sql adds local accounts and rows,
-- so clear the tables first. Everything is rolled back at the end.
delete from public.admins;
delete from public.products;

insert into auth.users (id, aud, role, email) values
  ('00000000-0000-0000-0000-00000000000a', 'authenticated', 'authenticated', 'admin@test.local'),
  ('00000000-0000-0000-0000-00000000000b', 'authenticated', 'authenticated', 'user@test.local');

insert into public.admins (user_id) values ('00000000-0000-0000-0000-00000000000a');

insert into public.products (slug, name, description, destination_url, is_published, display_order, updated_at)
values
  ('pub-one',   'Published', 'desc', 'https://example.com/pub',   true,  1, '2000-01-01T00:00:00Z'),
  ('draft-one', 'Draft',     'desc', 'https://example.com/draft', false, 2, '2000-01-01T00:00:00Z');

-- Switch the session identity the way PostgREST does.
create or replace function pg_temp.become(p_role text, p_uid uuid default null)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', p_role)::text, true);
  perform set_config('request.jwt.claim.sub', coalesce(p_uid::text, ''), true);
  execute format('set local role %I', p_role);
end;
$$;

-- A. Anonymous visitor
select pg_temp.become('anon');

select ok(
  not exists (select 1 from public.products where slug = 'draft-one'),
  'anon cannot read a draft row');
select is(
  (select count(*)::int from public.products), 1,
  'anon sees only the published row');
select throws_ok($$select click_count from public.products$$, '42501', null,
  'anon cannot read click_count');
select throws_ok($$select destination_url from public.products$$, '42501', null,
  'anon cannot read destination_url');
select throws_ok($$update public.products set name = 'x' where slug = 'pub-one'$$, '42501', null,
  'anon cannot update products');
select throws_ok($$insert into public.products (slug, name, description, destination_url)
                   values ('anon-one', 'A', 'd', 'https://example.com/a')$$, '42501', null,
  'anon cannot insert products');
select throws_ok($$select public.record_click('pub-one')$$, '42501', null,
  'anon cannot call record_click');
select throws_ok($$select * from public.admins$$, '42501', null,
  'anon cannot read admins');
select throws_ok($$select public.is_admin()$$, '42501', null,
  'anon cannot call is_admin');
select throws_ok($$select * from public.admin_click_totals()$$, '42501', null,
  'anon cannot call admin_click_totals');

-- B. Signed-in user who is not an admin
select pg_temp.become('authenticated', '00000000-0000-0000-0000-00000000000b');

select is(public.is_admin(), false, 'non-admin is not reported as admin');
select is(
  (select count(*)::int from public.products), 1,
  'non-admin sees only the published row');
select throws_ok($$select click_count from public.products$$, '42501', null,
  'non-admin cannot read click_count');
select throws_ok($$select * from public.admin_click_totals()$$, '42501', null,
  'non-admin cannot call admin_click_totals');
select throws_ok($$insert into public.products (slug, name, description, destination_url)
                   values ('user-one', 'U', 'd', 'https://example.com/u')$$, '42501', null,
  'non-admin cannot insert products');
select lives_ok($$update public.products set name = 'hacked' where slug = 'pub-one'$$,
  'non-admin update is accepted by Postgres');

reset role;
select is(
  (select name from public.products where slug = 'pub-one'), 'Published',
  'non-admin update changed nothing (RLS filters it to zero rows)');

-- C. Admin
select pg_temp.become('authenticated', '00000000-0000-0000-0000-00000000000a');

select is(public.is_admin(), true, 'admin is reported as admin');
select is(
  (select count(*)::int from public.products), 2,
  'admin reads drafts and published rows');
select lives_ok($$insert into public.products (slug, name, description, destination_url, display_order)
                   values ('new-one', 'New', 'd', 'https://example.com/new', 3)$$,
  'admin can create a product');
select lives_ok($$update public.products set name = 'Published edited' where slug = 'pub-one'$$,
  'admin can edit a product');
select lives_ok($$update public.products set is_published = true where slug = 'draft-one'$$,
  'admin can publish a product');
select lives_ok($$update public.products set is_published = false where slug = 'draft-one'$$,
  'admin can unpublish a product');
select throws_ok($$update public.products set click_count = 999 where slug = 'pub-one'$$, '42501', null,
  'admin cannot write click_count directly');
select is(
  (select count(*)::int from public.admin_click_totals()), 3,
  'admin can read click totals for every product');

-- D. Counter path and updated_at behavior
-- Clicks run as service_role, the only role allowed to call record_click.
reset role;
set local role service_role;
select is(public.record_click('pub-one'), 'https://example.com/pub',
  'record_click returns the destination for a published slug');
select is(public.record_click('draft-one'), null,
  'record_click returns null for an unpublished slug');
select is(public.record_click('no-such-slug'), null,
  'record_click returns null for an unknown slug');
reset role;

select is(
  (select click_count from public.products where slug = 'pub-one'), 1::bigint,
  'record_click increments the counter');

-- Plant an old timestamp, then check that a counter-only update leaves it alone.
alter table public.products disable trigger products_set_updated_at;
update public.products set updated_at = '2000-01-01T00:00:00Z' where slug = 'pub-one';
alter table public.products enable trigger products_set_updated_at;

set local role service_role;
select lives_ok($$select public.record_click('pub-one')$$, 'counter-only increment succeeds');
reset role;

select is(
  (select updated_at from public.products where slug = 'pub-one'),
  '2000-01-01T00:00:00Z'::timestamptz,
  'counter-only updates leave updated_at unchanged');

-- An editable change does move updated_at forward.
select pg_temp.become('authenticated', '00000000-0000-0000-0000-00000000000a');
select lives_ok($$update public.products set name = 'Published again' where slug = 'pub-one'$$,
  'admin edit is applied again');
reset role;
select ok(
  (select updated_at from public.products where slug = 'pub-one') > '2000-01-02T00:00:00Z'::timestamptz,
  'editable changes move updated_at forward');

-- E. Constraints
select throws_ok($$insert into public.products (slug, name, description, destination_url)
                   values ('http-one', 'H', 'd', 'http://example.com')$$, '23514', null,
  'http destination URLs are rejected');

-- F. Drafts without a destination, and destination changes
select pg_temp.become('authenticated', '00000000-0000-0000-0000-00000000000a');
select lives_ok($$insert into public.products (slug, name, description, is_published)
                   values ('draft-no-dest', 'No destination yet', '', false)$$,
  'admin can save a draft with no destination');
select throws_ok($$update public.products set is_published = true where slug = 'draft-no-dest'$$, '23514', null,
  'a product without a destination cannot be published');
reset role;

-- Changing the destination keeps the recorded clicks, and redirects use the new destination.
update public.products set click_count = 5 where slug = 'pub-one';
select pg_temp.become('authenticated', '00000000-0000-0000-0000-00000000000a');
select lives_ok($$update public.products set destination_url = 'https://example.com/pub-new' where slug = 'pub-one'$$,
  'admin can change a destination');
reset role;
select is((select click_count from public.products where slug = 'pub-one'), 5::bigint,
  'changing the destination keeps recorded clicks');
set local role service_role;
select is(public.record_click('pub-one'), 'https://example.com/pub-new',
  'redirects use the new destination after a change');
reset role;

select * from finish();
rollback;
