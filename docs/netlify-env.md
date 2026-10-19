# Netlify environment variables (prepared, not yet applied)

Set these in Netlify: Site configuration → Environment variables. Do not deploy until hosting credits allow it.

| Variable | Value | Secret? | Used by |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://falfbvhczftquacsnpkx.supabase.co` | No (public) | Browser and server reads (anon) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the **anon** key from the Supabase dashboard (Project Settings → API) | No (public, anon only) | Public pages, admin sign-in |
| `SUPABASE_URL` | `https://falfbvhczftquacsnpkx.supabase.co` | No | `/go/[slug]` route handler |
| `SUPABASE_SERVICE_ROLE_KEY` | the **service_role** key from the same dashboard page | **Yes. Never add a `NEXT_PUBLIC_` prefix.** | `/go/[slug]` route handler only |
| `NEXT_PUBLIC_LINKEDIN_URL` | optional. Default is already set in `src/config/site.ts` | No | Contact link |

Notes:

- `SITE_URL`: the production URL is not known yet, and the code does not read a `SITE_URL` variable. Nothing is set for it. Use the `netlify.app` address after the first deployment, and let me know if you want canonical links added.
- `DEMO_PREVIEW` must **not** be set in Netlify. Demo mode is for local preview only, and Netlify sets `CONTEXT=production` anyway.
- Do not copy any local keys from `.env.local` into Netlify.
