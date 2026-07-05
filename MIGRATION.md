# Migrating off Lovable

This runbook moves the site + database off Lovable's managed hosting to
self-owned accounts. Everything on the code side has been prepped so no
source edits are needed — you swap env vars and re-deploy.

**Time budget:** ~90 minutes end-to-end. Zero downtime is possible if you
switch DNS last.

---

## What Lovable currently provides

| Piece | Where it lives now | Where it goes |
|---|---|---|
| Static build + hosting | Lovable (auto-deploys on `main`) | Vercel / Netlify / Cloudflare Pages (all free) |
| Postgres + Auth + Storage | Supabase project `hliwejekiwgnrkhbmaun` (Lovable-managed) | A Supabase project you own (free tier fits) |
| CDN + DNS | Cloudflare (already yours) | Cloudflare (unchanged) |
| Domains | apluscharge.com, apluscharge.in | unchanged |

The website's code is already provider-agnostic: `src/integrations/supabase/client.ts` reads env vars only, `index.html` uses a `*.supabase.co` wildcard in its CSP, and Vite injects the Supabase preconnect from `VITE_SUPABASE_URL` at build time.

---

## Phase 1 — Stand up the new Supabase project (~20 min)

### 1.1 Create the project

1. Sign up / log in at [supabase.com](https://supabase.com).
2. New Project → pick a region close to your users (**Singapore** for India, or **Mumbai** if available in your plan). Name it something like `apluscharge-prod`.
3. Set a strong database password and store it in a password manager.

### 1.2 Grab the connection details

From the new project dashboard:

- **Project Settings → API → Project URL** → save as `NEW_SUPABASE_URL`
- **Project Settings → API → `anon` `public` key** → save as `NEW_SUPABASE_ANON_KEY`
- **Project Settings → API → `service_role` key** (⚠ secret) → save as `NEW_SUPABASE_SERVICE_KEY` — used only for one-off data migration
- **Project Settings → Database → Connection string (URI)** → save as `NEW_DB_URL`

Do the same for the OLD Lovable project (`hliwejekiwgnrkhbmaun.supabase.co`):

- Sign in as the Lovable-linked email; the project should be visible.
- If Lovable's dashboard exposes a Supabase link, use it. Otherwise from Supabase → Project Settings, capture `OLD_SUPABASE_URL`, `OLD_SUPABASE_SERVICE_KEY`, `OLD_DB_URL`.

### 1.3 Apply the schema

The repository already contains every migration in `supabase/migrations/`. Apply them to the new project:

```bash
npm install -g supabase
supabase login
supabase link --project-ref <new-project-ref>
supabase db push
```

`<new-project-ref>` is the subdomain of the new Supabase URL. `supabase db push` runs every SQL file in `supabase/migrations/` in timestamp order.

Verify: in the Supabase dashboard → Database → Tables, confirm you see `blog_posts`, `charging_stations`, `partner_enquiries`, `investor_enquiries`, `site_settings`, `user_roles`, `partners`, `statistics`, `testimonials`, `team_members`, `faqs`, `services_catalog`, `journey_milestones`.

---

## Phase 2 — Migrate the data (~15 min)

Three data classes need moving: relational tables, storage files, and auth users.

### 2.1 Relational tables — pg_dump / pg_restore

```bash
# Dump every public-schema table from the old project (data only,
# --data-only skips the schema which we already applied above)
pg_dump \
  "$OLD_DB_URL" \
  --data-only \
  --schema=public \
  --no-owner \
  --no-privileges \
  --disable-triggers \
  -f old-data.sql

# Load it into the new project. Triggers are disabled during load so
# updated_at defaults don't overwrite the original timestamps.
psql "$NEW_DB_URL" -f old-data.sql
```

If your table has an FK to `auth.users`, migrate users first (Phase 2.3) or use `SET session_replication_role = replica;` to defer FK checks — the `--disable-triggers` flag in the dump handles this automatically.

### 2.2 Storage files

Run the migration script:

```bash
SOURCE_URL=$OLD_SUPABASE_URL \
SOURCE_SERVICE_KEY=$OLD_SUPABASE_SERVICE_KEY \
DEST_URL=$NEW_SUPABASE_URL \
DEST_SERVICE_KEY=$NEW_SUPABASE_SERVICE_KEY \
node scripts/migrate-storage.mjs
```

It lists every bucket on the source, re-creates each on the destination with the same `public`/`private` setting, then copies every object. Re-running is safe — existing objects are skipped.

### 2.3 Auth users

Supabase doesn't expose a one-shot users export, but the dashboard has one:

1. Old project → **Authentication → Users → three-dot menu → Export users** → downloads `users.json`.
2. New project → **Authentication → Users → Import users** → upload the JSON.

Users keep their UIDs, which matches the FK references you just restored. Users will need to reset passwords on first login unless you paid for Supabase's password-hash export (Team plan).

If passwords are a blocker, an alternative is to invite users individually — for a marketing site with only one or two admins, this is often faster.

### 2.4 Re-add the admin role

Once your admin user is in the new project, run in the SQL editor:

```sql
insert into public.user_roles (user_id, role)
values ('<the auth.users.id for your admin>', 'admin');
```

Verify by logging into `/admin/login` on the new build (Phase 4).

---

## Phase 3 — Pick a new host (~10 min)

The repo ships with configs for the three common free options. Pick one; the others' config files sit unused without conflict.

### Option A — Vercel (recommended for React SPAs)

1. [vercel.com](https://vercel.com/) → Add New… → Project → import from GitHub → select `rohitsaha17/charge-future-spark-32923`.
2. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
3. Environment Variables (Production, Preview, Development):
   - `VITE_SUPABASE_URL` = `<NEW_SUPABASE_URL>`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `<NEW_SUPABASE_ANON_KEY>`
   - `VITE_SUPABASE_PROJECT_ID` = the subdomain of the URL
4. Deploy. Vercel gives you `<project>.vercel.app` immediately.

`vercel.json` (already committed) handles SPA fallback, cache headers, and basic security headers.

### Option B — Netlify

1. [app.netlify.com](https://app.netlify.com/) → Add new site → Import from Git → GitHub → this repo.
2. Build command: `npm run build`, Publish directory: `dist`.
3. Site settings → Environment variables → add the same three `VITE_SUPABASE_*` values.
4. Deploy. `netlify.toml` and `public/_redirects` (both committed) take care of the SPA fallback and headers.

### Option C — Cloudflare Pages

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → this repo.
2. Build command: `npm run build`, Build output directory: `dist`, Framework: `Vite`.
3. Environment variables (Production): the three `VITE_SUPABASE_*` values.
4. `public/_redirects` and `public/_headers` (both committed) handle SPA + cache/security.

---

## Phase 4 — Test before flipping DNS (~15 min)

While the site still serves from Lovable at your real domain, hit the new host's temporary URL (e.g. `apluscharge-abc.vercel.app`) and verify:

- [ ] Home renders, hero image loads
- [ ] Find a Charger map loads stations (data from new Supabase)
- [ ] `/blog` list shows posts, individual post pages open
- [ ] Partner form submits successfully (test with a real email, then delete)
- [ ] `/admin/login` → your admin account works
- [ ] Admin CMS shows partners, stats, testimonials, etc. (from migrated data)
- [ ] Image upload in AdminBlogs works (bucket + write policies)
- [ ] `/sitemap.xml` returns the index with the two children
- [ ] `/llms.txt` and `/pricing.md` return

If anything looks wrong, fix at the new host without touching DNS — traffic is still on Lovable.

---

## Phase 5 — Flip DNS (~5 min, then propagation wait)

At Cloudflare DNS:

1. Find the CNAME/A records for `apluscharge.com` (and `www.apluscharge.com`) that currently point at Lovable's edge.
2. Change them to point at the new host:
   - **Vercel:** CNAME to `cname.vercel-dns.com`
   - **Netlify:** CNAME to `<yoursite>.netlify.app`
   - **Cloudflare Pages:** stays in the same dashboard — add the custom domain from the Pages project settings and DNS is auto-configured.
3. In the new host's dashboard, add `apluscharge.com` and `www.apluscharge.com` as custom domains and let it issue Let's Encrypt SSL (auto, 1–5 min).
4. Optionally add `apluscharge.in` too, and remove the 302 redirect to `.com` if you want the `.in` domain to serve directly.

DNS propagation is typically < 5 minutes on Cloudflare's proxied records, up to 24 hours worst case. During the window some visitors hit the old Lovable host, others the new one — both are backed by the *new* Supabase after Phase 2, so no data goes to the wrong place as long as you complete Phase 2 before Phase 5.

---

## Phase 6 — Clean up (~10 min)

- Delete the Lovable project from your Lovable account so you're not billed for it.
- In the new host's dashboard, verify the deploy pipeline is watching the correct branch (`main`).
- Remove `lovable-tagger` from `package.json` if you want to drop the last Lovable dependency (it's dev-only, harmless if left).
- (Optional) Delete the OLD Supabase project after ~30 days if you're confident nothing was missed. Until then, keep it as a read-only fallback.
- Update GitHub Actions env-var references if you added the Supabase values there for CI (`.github/workflows/ci.yml` uses placeholders that will keep working).

---

## Rollback

If anything breaks:

- **App broken, DNS not switched yet:** just don't flip DNS. The old Lovable site keeps serving.
- **App broken after DNS switch:** revert the Cloudflare DNS record to Lovable's edge (30-second TTL). Site is back within minutes.
- **Data lost or partial:** the old Supabase project is untouched by the migration — nothing was destructively moved. Re-run Phase 2.

---

## What you don't need to change

- Cloudflare account and existing DNS records (only the CNAME to Lovable moves)
- Domain registrations
- The GitHub repo itself
- Any Google Ads / GTM IDs
- Any of the code

## Free-tier limits worth knowing

| Service | Free tier ceiling | Comfortable ceiling? |
|---|---|---|
| Supabase | 500 MB DB, 1 GB storage, 50 MB egress/day, 2 GB bandwidth, 50k MAUs | Yes, for a marketing site with a few thousand daily visitors |
| Vercel | 100 GB bandwidth/month, unlimited requests | Yes |
| Netlify | 100 GB bandwidth/month, 300 build minutes | Yes |
| Cloudflare Pages | Unlimited bandwidth, 500 builds/month | Yes — most generous of the three |

If you outgrow free, Supabase Pro is $25/mo and any of the hosts step up around $20/mo — call it $50/mo total for a site that generates real revenue.
