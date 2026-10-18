# Admin setup (one time, by hand)

Do these in the existing Supabase project. Do not create a new project.

1. **Disable public sign-ups.** Dashboard → Authentication → Sign In / Providers. Turn off "Allow new users to sign up".
2. **Create the admin user.** Dashboard → Authentication → Users → Add user. Use an email you control and a strong password. Store the password in your password manager, not in this repository.
3. **Copy the user's UUID** from the Users list.
4. **Grant admin rights.** Run this in the SQL editor, replacing the placeholder:

   ```sql
   insert into public.admins (user_id) values ('PUT-THE-UUID-HERE');
   ```

5. **Confirm.** Sign in later at `/admin`. Non-admin accounts get no editing access.

Apply the migrations to the cloud project from a terminal you control:

```bash
npx supabase link --project-ref falfbvhczftquacsnpkx
npx supabase db push
```
