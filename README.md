# AI Products Showcase

A small, free site where people publish finished AI products. The public site is in Hebrew (right-to-left). The administration area is in English. Each product page has an affiliate-style link that counts outbound clicks through `/go/[slug]`.

## Stack

- Next.js 16 (App Router) with TypeScript and plain CSS. No Tailwind.
- Supabase: Postgres, Auth, and row-level security (RLS). One project.
- Netlify for hosting. The only server code is the `/go/[slug]` route handler and the admin server actions.
- Self-hosted Heebo font. No third-party font or script requests.

## Routes

| Route | Who | What |
|---|---|---|
| `/` | public | Published products, ordered by `display_order` then `slug` |
| `/p/[slug]` | public | One published product. Missing or unpublished slugs return 404 |
| `/go/[slug]` | public | Resolves the destination, counts one click, redirects 302. `HEAD` does not count |
| `/legal/privacy`, `/legal/affiliate`, `/legal/terms` | public | Hebrew legal drafts. Not reviewed by a lawyer yet |
| `/admin/login` | admin | Email and password sign-in (Supabase Auth) |
| `/admin` | admin | Product list with recorded clicks and publish toggles |
| `/admin/products/new`, `/admin/products/[id]` | admin | Product editor |

## Adding a product (manual workflow)

Products are found and entered by hand. There is no scraping, automated import, AI extraction, browser extension, or second CMS.

1. Find an AI product online.
2. Open `/admin` and choose **Add product**.
3. Enter the name and a slug (for example `ai-writing-helper`). Add a short description, an optional review, an optional https image URL, and the https destination URL.
4. Check **This is an affiliate link** only if the destination earns commission for us.
5. Choose **Save draft** (hidden from visitors) or **Save and publish**.
6. Edit any product later, including its destination, without changing code or redeploying. A destination change takes effect on the next click. Recorded clicks are kept.

Rules the editor enforces:

- A draft needs only a name and slug.
- Publishing requires a description and a valid https destination URL. The database enforces the same rule (migration `0003`).
- A review and an image are optional, even for published products.

Editorial rule: a listing we find ourselves does not mean the product owner partnered with us or endorsed the site. Do not present a product's own claims as our experience, and do not say we tested a product unless we did.

Recorded clicks count total outbound clicks through `/go/slug` across a product's destination history. They are not affiliate conversions, sales, or unique visitors. No commission reporting exists in this project.

Contact: the site links to the LinkedIn profile configured in `src/config/site.ts`. The contact copy does not promise that a product will be listed.

## Design

The public site is an editorial index: paper and ink with one vermilion accent, a type-led hero, a numbered section bar, a numbered list of products whose rows fill with ink on hover or keyboard focus, one oversized disclosure sentence, a contact band, and a giant footer wordmark. The product page has an ink title and a sticky "ticket" with the link to the product. No third-party imagery, text, or branding is used.

- **Motion** is CSS-only: page enter, hero line reveal, scroll-linked progress bar, hero curve and reveals, row fill, and a drawing underline on the section bar. Everything is switched off by `prefers-reduced-motion`, and no content depends on hover. The full spec (states, durations, accessibility) is in `docs/interaction-design.md`.
- **Styles** are plain CSS: `globals.css` (tokens, fonts, buttons), `public.css` (Hebrew public site), and `admin.css` (admin area). There are no inline styles, because the CSP forbids them.
- **Fonts** are self-hosted: Heebo (text and UI) and Frank Ruhl Libre (display headings), both under the SIL Open Font License.

## Security model

- The browser only ever holds the anon key. The service-role key is read on the server in one file, `src/lib/supabase/service.ts`, and is imported only by the `/go` route handler.
- Row-level security decides access. The database migration `supabase/migrations/0002_hardening.sql` restricts columns: anonymous visitors cannot read `click_count` or `destination_url`, and no one except `record_click` can change `click_count`.
- Click counts are written only by `record_click`, which only the service role can call.
- Admin pages and server actions call `requireAdmin()`, which validates the session with `getUser()` and then checks `is_admin()`. `src/proxy.ts` adds a first-line redirect for signed-out and non-admin visitors. It does not replace the checks on the pages and actions.
- Every page has a per-request Content-Security-Policy nonce. `script-src` and `style-src` allow only the site itself plus that nonce. `frame-ancestors 'none'`. Also `Referrer-Policy: strict-origin-when-cross-origin` and `X-Content-Type-Options: nosniff`.
- Product text is rendered as plain text. Nothing uses `dangerouslySetInnerHTML`.
- Affiliate links use `rel="sponsored noopener noreferrer"`.
- `/go` returns a redirect even when the counter fails or takes longer than 1 second. The 1-second limit is in `src/lib/go.ts`.

## Local development

1. Install Docker Desktop, then run `npm install`.
2. Start the local Supabase stack and apply the migrations and local seed data:

   ```bash
   npx supabase start
   npx supabase db reset
   ```

3. Copy `.env.example` to `.env.local`. Use the local URL and keys printed by `npx supabase status`. Never copy local keys to a deployment.
4. Run `npm run dev`.

`supabase/seed.sql` creates two local test accounts and rows with `local-test-` slugs. The seed runs only on the local stack. `supabase db push` applies migrations only, so the cloud project never receives these accounts.

- Admin: `admin@local.test` / `local-admin-pass-123`
- Member (not an admin): `member@local.test` / `local-member-pass-123`

## Tests

```bash
npm test                # unit tests: product form rules and /go logic, with injected failures
npm run test:integration # /go route handlers against the local database (refuses non-local URLs)
npm run test:db          # pgTAP: RLS, column grants, click-count and updated_at behavior
npm run typecheck
npm run lint
```

## Admin setup and deployment

- `docs/admin-setup.md`: disable public sign-ups, create the admin user, insert its UUID into `public.admins`, and apply migrations to the cloud project.
- `docs/netlify-setup.md`: connect the repository to Netlify and set the environment variables.

## Free-tier limits (read before launch)

- **Supabase Free.** The official pricing page lists 500 MB of database storage, 5 GB of egress, 50,000 monthly active users, and two active projects. A free project pauses after one week without activity. While it is paused, every product page and every `/go` link fails until someone restores the project from the dashboard.
- **No automated backups on Supabase Free.** Export `products` to SQL before each migration, and keep the migrations in git.
- **Netlify Free.** Third-party sources report a monthly credit pool, and say the site pauses when it is used up. Check Netlify's official pricing page before launch. Every page request and every `/go` redirect uses compute.
- **Click counts are not unique visitors or purchases.** There is no IP-based rate limit, and IP addresses are not stored, so bots and link previews can inflate counts.
- **Logs.** Netlify and Supabase may record IP addresses in their own logs. This project does not record them.

## Known limitations

- Admin sign-in has no second factor in v1.
- The legal pages are drafts. A lawyer must review them before launch.
- Changing the slug of a published product breaks existing `/p/` and `/go/` links. The editor requires an explicit confirmation.
- `ProductCard.tsx` is an unused component left from an earlier version. Nothing imports it.
