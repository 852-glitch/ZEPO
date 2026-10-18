# Netlify setup (one time, by hand)

1. **Push the code to GitHub** from a terminal you control, after you have reviewed it.
2. **Create a Netlify site** from the GitHub repository. Netlify detects Next.js, so no custom build settings are needed.
3. **Set environment variables** in Netlify (Site configuration → Environment variables):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://falfbvhczftquacsnpkx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the anon key from the Supabase dashboard
   - `SUPABASE_SERVICE_ROLE_KEY` = the service-role key (server only, used by `/go` on Day 3). Never add it with a `NEXT_PUBLIC_` prefix.
4. **Deploy**, then check the deployed URL:
   - The security headers are present.
   - Published products load.
   - Drafts do not appear.
