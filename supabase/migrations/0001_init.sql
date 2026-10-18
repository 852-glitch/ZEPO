create table public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  name          text not null check (char_length(name) between 1 and 120),
  description   text not null check (char_length(description) <= 2000),
  review        text check (char_length(review) <= 2000),
  image_url     text check (image_url like 'https://%'),
  affiliate_url text not null check (affiliate_url like 'https://%'),
  display_order int  not null default 0,
  is_published  boolean not null default false,
  click_count   bigint not null default 0 check (click_count >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;  -- no policies: no client access

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where user_id = (select auth.uid())) $$;

alter table public.products enable row level security;

create policy "public reads published" on public.products
  for select to anon, authenticated using (is_published);

create policy "admin reads all" on public.products
  for select to authenticated using ((select public.is_admin()));

create policy "admin writes" on public.products
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create or replace function public.record_click(p_slug text)
returns text language sql security definer set search_path = ''
as $$
  update public.products
     set click_count = click_count + 1
   where slug = p_slug and is_published
  returning affiliate_url;
$$;

revoke execute on function public.record_click(text) from public, anon, authenticated;
grant  execute on function public.record_click(text) to service_role;
