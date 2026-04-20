# APlus Charge — Marketing + Ops site

Single-page React app for [apluscharge.com](https://apluscharge.com) / [apluscharge.in](https://apluscharge.in) covering:

- Public marketing surface (Home, About, Services, Invest, Partner, Blog)
- Public charger-locator map (MapLibre + Esri World Street Map tiles)
- Partner & investor lead-capture forms (Supabase, rate-limited server-side)
- Admin CMS for stations, blog posts, enquiries, and site content (partners, testimonials, team, services, timeline, stats, FAQs)
- Page/section visibility toggles (feature flags stored in `site_settings`)

Auto-deployed from `main` via [Lovable](https://lovable.dev/projects/af11daf9-edc1-4daf-afb4-edae18648fe9).

## Quick start

```sh
npm i
cp .env.example .env   # fill in your Supabase project values
npm run dev            # http://localhost:8080
```

Full setup and architecture reference: [BOOTSTRAP.md](./BOOTSTRAP.md).

## Stack

| Area | Choice |
| --- | --- |
| Framework | React 18 + TypeScript + Vite (SWC) |
| Routing | react-router-dom v6 with lazy-loaded route chunks |
| UI | Tailwind CSS + shadcn/ui (Radix primitives) + Framer Motion |
| Data | Supabase (Postgres + Auth + Storage + RLS), TanStack Query |
| Maps | MapLibre GL + Esri World Street Map tiles + Photon geocoder |
| Forms | react-hook-form + Zod |
| Sanitisation | DOMPurify (blog HTML) |

## Scripts

```sh
npm run dev       # vite dev server (port 8080)
npm run build     # production build → dist/
npm run lint      # eslint
npx tsc --noEmit  # type-check (CI runs this)
```

## Environment

See [`.env.example`](./.env.example). The Supabase anon key is a public credential; all security is enforced via RLS.

## Deployment

Pushes to `main` auto-deploy via Lovable. CI (`.github/workflows/ci.yml`) runs lint, type-check, and build on every push and PR.

## Supabase

Migrations live in `supabase/migrations/`. Apply with `supabase db push` or via the Supabase dashboard. The most recent hardening migration adds CHECK constraints on enquiry tables, an `enquiry_rate_limit_ok()` SECURITY DEFINER function enforced via RLS, and indexes on every filter column the app hits.
