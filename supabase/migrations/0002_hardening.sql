-- 0002: hardening, the destination_url rename, and admin-only click totals.
-- Runs after 0001_init.sql, which stays exactly as written in the brief.

-- 1. Rename the affiliate column and add the affiliate flag.
alter table public.products rename column affiliate_url to destination_url;
alter table public.products
  add column is_affiliate boolean not null default false;

-- Stronger https check than "like 'https://%'": no whitespace, something after the scheme.
alter table public.products
  add constraint destination_url_https
  check (destination_url ~ '^https://[^[:space:]]+$');
alter table public.products
  add constraint image_url_https
  check (image_url is null or image_url ~ '^https://[^[:space:]]+$');

-- 2. record_click must return the renamed column. Its grants are restated below.
create or replace function public.record_click(p_slug text)
returns text language sql security definer set search_path = ''
as $$
  update public.products
     set click_count = click_count + 1
   where slug = p_slug and is_published
  returning destination_url;
$$;

revoke execute on function public.record_click(text) from public, anon, authenticated;
grant  execute on function public.record_click(text) to service_role;

-- 3. is_admin is only needed by signed-in users. The admin check runs as authenticated.
revoke execute on function public.is_admin() from public, anon;
grant  execute on function public.is_admin() to authenticated;

-- 4. Table privileges: start from zero, then grant column by column.
revoke all on public.products from anon, authenticated;
revoke all on public.admins    from anon, authenticated;

-- Anon: published product content only. No click counts, no destination URL.
grant select (id, slug, name, description, review, image_url, is_affiliate,
              display_order, is_published, created_at, updated_at)
  on public.products to anon;

-- Authenticated: row access is still decided by RLS. click_count is excluded
-- here on purpose: admins read it through admin_click_totals(), and non-admins
-- get no click data at all.
grant select (id, slug, name, description, review, image_url, destination_url,
              is_affiliate, display_order, is_published, created_at, updated_at)
  on public.products to authenticated;

-- Writes are limited to editable columns. click_count and updated_at are never writable.
grant insert (slug, name, description, review, image_url, destination_url,
              is_affiliate, display_order, is_published)
  on public.products to authenticated;
grant update (slug, name, description, review, image_url, destination_url,
              is_affiliate, display_order, is_published)
  on public.products to authenticated;

-- 5. updated_at changes only when an editable field changes.
-- record_click changes only click_count, so the timestamp stays put for counter-only updates.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if (new.slug, new.name, new.description, new.review, new.image_url,
      new.destination_url, new.is_affiliate, new.display_order, new.is_published)
     is distinct from
     (old.slug, old.name, old.description, old.review, old.image_url,
      old.destination_url, old.is_affiliate, old.display_order, old.is_published)
  then
    new.updated_at := now();
  else
    new.updated_at := old.updated_at;
  end if;
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- 6. Admin-only click totals. The function does the is_admin check itself,
-- so authenticated non-admins cannot read click_count even though the
-- column grant excludes it.
create or replace function public.admin_click_totals()
returns table (id uuid, click_count bigint)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'not an administrator' using errcode = '42501';
  end if;
  return query select p.id, p.click_count from public.products p;
end;
$$;

revoke execute on function public.admin_click_totals() from public, anon;
grant  execute on function public.admin_click_totals() to authenticated;
