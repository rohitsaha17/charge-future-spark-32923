# Bootstrap guide

Everything you need to clone, run, and ship this project.

## 1. Prerequisites

- **Node 20+** — Vite 5 dropped Node 16 support; 20 LTS is what CI runs.
- **npm 10+** (ships with Node 20).
- The backend API in `../change-suture-backend`, running. It needs a MongoDB
  connection string (Atlas free tier is fine) and, for image uploads, any
  S3-compatible bucket. See that folder's `README.md`.

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

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | Base URL of the backend API, including the `/api` prefix. Local: `http://localhost:4000/api` |

There is no key to ship in the bundle any more. Authorization happens
server-side: public endpoints are genuinely public, and every `/api/admin/*`
route requires a JWT carrying the `admin` role.

## 4. Backend setup

The API and its database live in `../change-suture-backend`. From that folder:

```sh
npm install
cp .env.example .env   # fill in DATABASE_URL + the two JWT secrets
npm run migrate        # creates indexes and collection validators
npm run seed           # loads the default site content (idempotent)
npm run dev            # http://localhost:4000
```

### Create your first admin user

There is no self-serve signup route. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in
the backend's `.env`, then:

```sh
npm run seed:admin
```

That creates the account, marks the email confirmed, and grants the `admin`
role in one step. Re-running it resets that account's password, which is also
the recovery path if the admin password is lost.

### Verify it all works

From this folder, with the API running:

```sh
npm run verify:backend
```

Checks the API is reachable, that every endpoint the site reads returns data,
and — most importantly — that anonymous **writes are refused** on every
`/api/admin/*` route. Exits non-zero on any failure, so it works in CI.

The backend has a fuller check of its own (`npm run verify` over there), which
exercises every endpoint including the authenticated ones.

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
│   ├── api.ts        # Typed client for the backend API (JWT + auto-refresh)
│   ├── storage.ts    # Image upload helper (magic-byte validation)
│   ├── antiSpam.ts   # Honeypot + throttle for public forms
│   ├── siteDefaults.ts # Fallbacks when CMS tables are empty
│   └── utils.ts      # clsx/tailwind-merge helper
├── assets/           # Bundled images (webp) — run through compression first
└── App.tsx           # Router + providers + chunk-warming
```

The `supabase/` folder is dead weight kept for reference only — the SQL
migrations there record the schema history this project moved off. Nothing
in `src/` reads them.

## 7. Testing

Vitest scaffold with tests for `sanitize`, `antiSpam`, and the Partner ROI calculator. Run with `npm test` (once Vitest is wired in).

## 8. Deployment

- **Manual:** `npm run build` → upload `dist/` to any static host. `netlify.toml` and `vercel.json` are checked in and ready.
- **Env vars:** set `VITE_API_URL` in the host's dashboard — it is read at
  *build* time, so a deploy without it ships a bundle pointing at
  `http://localhost:4000/api`. The API must be deployed separately and must
  list the site's origin in its `CORS_ORIGINS`.
- **CI:** `.github/workflows/ci.yml` runs lint + `tsc --noEmit` + build on every push and PR.

## 9. One-time backend settings

These live in the backend's `.env` and are worth a second look before going
live (the full list is in its `README.md`):

1. **JWT secrets** — replace both with fresh random values:
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
2. **`CORS_ORIGINS`** — the real site origin(s). Never `*` in production.
3. **`EXPOSE_RESET_TOKEN=false`** — and wire a mail transport, or password
   reset links only ever reach the server log.
4. **Enquiry rate limits** — `ENQUIRY_MAX_PER_EMAIL` / `ENQUIRY_MAX_PER_IP`.
   The defaults (3/hour per email, 10/hour per IP) suit this site's traffic;
   revisit if real submissions start getting blocked.

## 10. Security checklist for new features

- [ ] New collections are reachable only through a route under `/api/admin`, or
      the public handler filters to `visible`/`published`/`active` rows.
- [ ] Any form accepting text from the public goes through `antiSpam.ts` on the
      client AND a Zod schema plus a `$jsonSchema` validator on the server.
      The browser checks are for feedback; the server ones are the control.
- [ ] Any dangerously-set HTML comes from `sanitize.ts` — never concatenate user input into markup directly.
- [ ] New external origins are added to the `connect-src` / `img-src` / `script-src` allowlist in `index.html`. (The API origin is injected automatically by the `api-preconnect` plugin in `vite.config.ts`.)
- [ ] No backend secret is ever imported into a Vite file — anything prefixed
      `VITE_` ends up in the shipped bundle. The API's JWT and S3 credentials
      belong only in the backend's `.env`.

## 11. Troubleshooting

| Symptom | Fix |
| --- | --- |
| "Could not reach the server" on every request | The API isn't running, or `VITE_API_URL` points at the wrong port. Start it: `cd ../change-suture-backend && npm run dev`. |
| Requests blocked by CORS in the console | The site's origin isn't in the API's `CORS_ORIGINS`. Add it in the backend `.env` and restart. |
| Login succeeds, then redirects to `/` | The account has no `admin` role. Re-run `npm run seed:admin` in the backend for that email. |
| Sections render bundled defaults instead of CMS content | The collections are empty — run `npm run seed` in the backend. |
| `503` with "Storage bucket does not exist" on upload | Create the bucket named by `S3_BUCKET` on your storage provider, or point `S3_BUCKET` at an existing one. |
| Uploaded images 404 or are blocked by CSP | The API serves them at `/api/uploads/*`; check `VITE_API_URL` is set so `vite.config.ts` adds that origin to `img-src`. |
| Map shows blank tiles | Check the CSP `connect-src` / `img-src` entries in `index.html` match the tile provider host. |
| Intro video replays every page | It's per-tab (`sessionStorage.introPlayed`), not per-visit — opening a new tab replays it by design. |
