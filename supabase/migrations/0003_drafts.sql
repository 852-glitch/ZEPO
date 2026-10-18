-- 0003: a draft may omit the destination and description. Publication always requires both.
-- Applied after 0002_hardening.sql. Nothing here is applied to the cloud project yet.

alter table public.products alter column destination_url drop not null;

-- A published product must have a destination and a non-empty description.
-- The destination_url_https check from 0002 still applies whenever a destination is set.
alter table public.products
  add constraint published_requires_destination
  check (is_published = false or destination_url is not null);

alter table public.products
  add constraint published_requires_description
  check (is_published = false or char_length(btrim(description)) > 0);
