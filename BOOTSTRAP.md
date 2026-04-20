# Bootstrap guide

Everything you need to clone, run, and ship this project.

## 1. Prerequisites

- **Node 20+** — Vite 5 dropped Node 16 support; 20 LTS is what CI runs.
- **npm 10+** (ships with Node 20).
- A Supabase project — free tier is fine. We use Postgres, Auth, Storage, and RLS policies.

```sh
node --version   # v20.x
npm --version    # 10.x
```

## 2. Clone + install

```sh
git clone git@github.com:rohitsaha17/charge-future-spark-32923.git
cd charge-future-spark-32923
npm ci   # use ci (not install) to match the lockfile exactly
```

## 3. Environment

```sh
cp .env.example .env
```

Fill in:

| Variable | Where to find it |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API → `anon` `public` key |
| `VITE_SUPABASE_PROJECT_ID` | The subdomain segment of the Supabase URL |

The anon key is intentionally shipped in the client bundle — security is enforced by RLS, not by hiding the key.

## 4. Database setup

```sh
# From the project root, with supabase CLI linked to your project:
supabase link --project-ref <your-ref>
supabase db push                  # applies every file in supabase/migrations/
```

Or paste the SQL files from `supabase/migrations/` into the Supabase dashboard → SQL Editor in timestamp order. The `20260420120000_hardening.sql` file is the most important — it sets up rate limiting, CHECK constraints, and indexes the app relies on.

### Create your first admin user

1. Sign up a user via `/admin/login` (or Supabase dashboard).
2. In Supabase SQL editor:

    ```sql
    insert into public.user_roles (user_id, role)
    values ('<auth.users.id for that user>', 'admin');
    ```

3. Visit `/admin/login` and log in — you should land on `/admin/dashboard`.

## 5. Run

```sh
npm run dev            # http://localhost:8080 with HMR
npm run build          # production bundle → dist/
npm run preview        # serve the built bundle on :4173
```

## 6. Project layout

```
src/
├── components/       # Shared UI (Navigation, Footer, ErrorBoundary, maps, forms)
│   ├── admin/        # CMS-only widgets (image upload, CRUD dialogs)
│   └── ui/           # shadcn/ui primitives (auto-generated, don't hand-edit)
├── pages/            # Route-level components. One per entry in App.tsx.
├── hooks/            # useSiteSettings, useIsMobile, useToast, etc.
├── lib/              # Non-React utilities
│   ├── sanitize.ts   # DOMPurify wrapper for blog HTML
│   ├── storage.ts    # Supabase Storage helper (auto-bucket + magic-byte validation)
│   ├── antiSpam.ts   # Honeypot + throttle for public forms
│   ├── siteDefaults.ts # Fallbacks when CMS tables are empty
│   └── utils.ts      # clsx/tailwind-merge helper
├── integrations/
│   └── supabase/     # Typed client + generated DB types
├── assets/           # Bundled images (webp) — run through compression first
└── App.tsx           # Router + providers + chunk-warming
supabase/
└── migrations/       # Timestamp-ordered SQL. Never edit applied migrations in place.
```

## 7. Testing

Vitest scaffold with tests for `sanitize`, `antiSpam`, and the Partner ROI calculator. Run with `npm test` (once Vitest is wired in).

## 8. Deployment

- **Automatic:** Every push to `main` triggers a Lovable build and deploy.
- **Manual:** `npm run build` → upload `dist/` to any static host (Netlify, Vercel, S3+CloudFront).
- **CI:** `.github/workflows/ci.yml` runs lint + `tsc --noEmit` + build on every push and PR.

## 9. Security checklist for new features

- [ ] New Supabase tables have RLS enabled and explicit policies (no `USING (true)` for anon reads).
- [ ] Any form accepting text from the public goes through `antiSpam.ts` and has CHECK constraints on the DB.
- [ ] Any dangerously-set HTML comes from `sanitize.ts` — never concatenate user input into markup directly.
- [ ] New external origins are added to the `connect-src` / `img-src` / `script-src` allowlist in `index.html`.
- [ ] Service role key is **never** imported into a Vite file (those end up in the bundle).

## 10. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Blank page after login | Run the `user_roles` insert above — without an admin row, the dashboard redirects to `/`. |
| `bucket not found` on image upload | `lib/storage.ts` auto-creates the bucket on first use; if it fails, create `blog-images` / `site-content` manually in Supabase Storage. |
| Map shows blank tiles | Check the CSP `connect-src` / `img-src` entries in `index.html` match the tile provider host. |
| Intro video replays every page | It's per-tab (`sessionStorage.introPlayed`), not per-visit — opening a new tab replays it by design. |
