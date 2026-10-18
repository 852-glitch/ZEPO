-- LOCAL DEVELOPMENT ONLY.
-- `supabase db reset` runs this file on the local stack. The cloud project never runs it:
-- `supabase db push` applies migrations only. Nothing here is production content.
--
-- Local test accounts (local stack only):
--   admin:  admin@local.test   / local-admin-pass-123   (listed in public.admins)
--   member: member@local.test  / local-member-pass-123  (not an admin)
--
-- Local test rows all use slugs starting with "local-test-" and names starting with "[בדיקה מקומית]".

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'authenticated', 'authenticated', 'admin@local.test',
   extensions.crypt('local-admin-pass-123', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'authenticated', 'authenticated', 'member@local.test',
   extensions.crypt('local-member-pass-123', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '', '');

insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at, last_sign_in_at) values
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@local.test"}', 'email', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   '{"sub":"22222222-2222-2222-2222-222222222222","email":"member@local.test"}', 'email', now(), now(), now());

insert into public.admins (user_id) values ('11111111-1111-1111-1111-111111111111');

insert into public.products (slug, name, description, review, image_url, destination_url, is_affiliate, display_order, is_published) values
  ('local-test-published-one', '[בדיקה מקומית] מוצר מפורסם א',
   'תיאור בדיקה למוצר מפורסם. הטקסט אינו מוצר אמיתי.',
   E'שורה ראשונה של ביקורת בדיקה.\n\nפסקה שנייה עם <b>תגית</b> שמוצגת כטקסט רגיל.',
   null, 'https://example.com/local-test-one', false, 1, true),
  ('local-test-published-two', '[בדיקה מקומית] מוצר מפורסם ב',
   'תיאור בדיקה נוסף. הקישור מוביל לדומיין שמור לדוגמאות.',
   null, null, 'https://example.com/local-test-two', true, 2, true),
  ('local-test-draft', '[בדיקה מקומית] טיוטה',
   'מוצר טיוטה. לא אמור להופיע באתר הציבורי.',
   null, null, 'https://example.com/local-test-draft', false, 3, false);
