-- 0004: destination lookup for /go that does not need the service-role key.
-- Returns a destination only for a published product. The same URL is already visible to
-- anyone who follows /go, so this exposes nothing new. record_click stays service_role only.

create or replace function public.get_destination(p_slug text)
returns text language sql stable security definer set search_path = ''
as $$
  select destination_url from public.products where slug = p_slug and is_published
$$;

revoke execute on function public.get_destination(text) from public;
grant  execute on function public.get_destination(text) to anon, authenticated;
