# A Plus Charge — Backend specification

> Hand this to a backend developer. It describes every piece of the current backend (Supabase-hosted) so the same shape can be rebuilt on any stack — Node + Postgres, Django, Rails, .NET, whatever. No source-side ties to the current provider.
>
> **Golden rule:** the frontend has been decoupled from any specific provider. It reads Supabase URL / anon key from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. If you host your own Postgres instead of Supabase, add a small REST/RPC layer that mimics the current call shapes (documented below) and change the client to call that instead. The domain model doesn't move.

---

## 1. High-level architecture

```
┌──────────────────────────────┐
│   Browser (React 18 + Vite)  │
│   www.apluscharge.com        │
└──────────┬───────────────────┘
           │  HTTPS
┌──────────▼───────────────────┐
│   Backend                    │
│   1. Postgres 15+ (data)     │
│   2. Auth service (JWT)      │
│   3. Object storage (S3-like)│
│   4. Optional: cron for      │
│      report emails, backups  │
└──────────────────────────────┘
```

**Two independent surfaces:**

1. **Public surface** — anyone, no login. Read published blog posts, active stations, visible CMS content. Submit partner/investor enquiry forms.
2. **Admin surface** — authenticated admin only. CRUD every table above, upload/manage images, view enquiries.

**Security boundary is the API/row-policy layer.** The browser holds a "publishable" key that only grants what the public surface should see. Admins authenticate to get an elevated JWT that permits writes. If you're re-implementing without Supabase's Row Level Security, put an equivalent check into every write endpoint (`if (!user.isAdmin) throw 403`).

---

## 2. Auth model

- **Users** live in an `auth.users`-equivalent table (email + password hash + UUID primary key + optional metadata).
- **Roles** are separate: `public.user_roles(user_id UUID → auth.users, role ENUM('admin','user'))`. A user can be plain (`user` role, or no row) or `admin`.
- **Every write endpoint** requires an authenticated user with the `admin` role. The `has_role(user_id, role)` helper (see §5) is called from every RLS policy today.
- **JWT claims** — the current setup uses Supabase's default JWT (contains `sub` = user_id, `role` = 'authenticated' or 'anon'). The application derives "is this user admin?" from the `user_roles` table. Replicate that: the JWT alone must NOT carry the admin flag; the role check hits the DB every request. (This lets you revoke admin instantly.)
- **Session lifetime** — refresh token flow, tokens stored in `localStorage` on the browser. Standard.
- **Password reset flow** — email-based, standard token link. Supabase provides this; a self-hosted stack needs a small `POST /auth/reset-password` + email dispatch.

**Admin bootstrap** — the first admin is seeded by hand: after the first user signs up via `/admin/login`, run
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<the new auth.users.id>', 'admin');
```

---

## 3. Database schema

All tables use `uuid` PK with `gen_random_uuid()` default, timestamptz `created_at` + `updated_at` (updated via trigger). Enum `app_role` = `{'admin','user'}`.

### 3.1 `user_roles`

Role assignments. Separate table from the users table so a user can hold multiple roles later.

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → auth.users(id) ON DELETE CASCADE | |
| role | `app_role` NOT NULL | |
| created_at | timestamptz DEFAULT now() | |
| UNIQUE(user_id, role) | | prevents duplicate admin rows |

**Access rules:**
- `SELECT`: user can see their own row (`user_id = current_user()`)
- `INSERT`: admin only (has_role check)
- `UPDATE`, `DELETE`: admin only

---

### 3.2 `blog_posts`

The CMS-managed blog surface at `/blog`.

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| title | text NOT NULL | |
| slug | text NOT NULL UNIQUE | url-safe, e.g. `what-is-ev-charging` |
| excerpt | text NOT NULL | 1-2 sentence card blurb |
| content | text NOT NULL | HTML, already-sanitized by the RichTextEditor before insert |
| featured_image | text | absolute URL, points at storage bucket |
| author_id | uuid FK → auth.users(id) ON DELETE SET NULL | |
| status | text NOT NULL DEFAULT 'draft' | `'draft'` or `'published'` |
| published_at | timestamptz | set when status flips to published |
| tags | text[] | free-form array |
| meta_description | text | 160 char SEO description |
| meta_keywords | text[] | optional SEO keywords |
| created_at, updated_at | timestamptz | updated_at set by trigger |

**Indexes:** `status`, `published_at DESC`, `slug` (from UNIQUE).

**Access rules:**
- `SELECT`: `status='published'` visible to everyone, otherwise admin only
- `INSERT`, `UPDATE`, `DELETE`: admin only

---

### 3.3 `charging_stations`

The map data at `/find-charger`, editable from `/admin/charging-stations`.

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | station display name |
| address | text NOT NULL | street address |
| city | text NOT NULL | |
| state | text NOT NULL | |
| district | text | optional finer geography |
| pin_code | text | optional postal code |
| latitude | numeric(10,8) NOT NULL | pin position |
| longitude | numeric(11,8) NOT NULL | |
| charger_type | text NOT NULL | free-form, current values: `'AC'`, `'DC'` |
| connector_type | text NOT NULL | e.g. `'CCS2'`, `'Type 2'`, `'CHAdeMO'` |
| power_output | text NOT NULL | e.g. `'60 kW'`, `'7.4 kW'` |
| total_chargers | int NOT NULL DEFAULT 1 | ports at this station |
| available_chargers | int NOT NULL DEFAULT 1 | live availability (currently manual) |
| price_per_unit | numeric(10,2) | ₹/kWh, nullable |
| amenities | text[] | `['Restroom','Wi-Fi','Cafe']` |
| station_type | text DEFAULT 'Public' | `'Public'` or `'Residential'` |
| status | text NOT NULL DEFAULT 'active' | `'active'` or `'inactive'` |
| created_by | uuid FK → auth.users(id) ON DELETE SET NULL | audit |
| created_at, updated_at | timestamptz | |

**Indexes:** `status`, `city`, `charger_type`, `station_type`.

**Access rules:**
- `SELECT`: `status='active'` visible to everyone, otherwise admin only
- `INSERT`, `UPDATE`, `DELETE`: admin only

---

### 3.4 `partner_enquiries`

Public "become our partner" form submissions.

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL, CHECK(char_length BETWEEN 2 AND 200) | |
| email | text NOT NULL, CHECK(valid email regex) | |
| phone | text NOT NULL, CHECK(digits/dashes, 7-20 chars) | |
| location_lat | numeric | pin picked on map |
| location_lng | numeric | |
| location_address | text | reverse-geocoded human address |
| charger_type | text | which model the enquirer wants |
| message | text, CHECK(char_length ≤ 4000) | |
| status | text NOT NULL DEFAULT 'pending' | `'pending'` / `'contacted'` / `'closed'` |
| created_at, updated_at | timestamptz | |

**Indexes:** `status`, `created_at DESC`.

**Access rules:**
- `INSERT`: anonymous with rate limit (see §5)
- `SELECT`, `UPDATE`, `DELETE`: admin only

---

### 3.5 `investor_enquiries`

Same shape as partner_enquiries but for investor page.

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL, CHECK(2-200) | |
| email | text NOT NULL, CHECK(valid email) | |
| phone | text NOT NULL, CHECK(7-20) | |
| organization | text | |
| city | text | |
| investor_type | text | e.g. "Family Office", "VC" |
| investment_range | text | e.g. "₹50L–1Cr" |
| status | text NOT NULL DEFAULT 'pending' | |
| created_at, updated_at | timestamptz | |

**Indexes:** `status`, `created_at DESC`.

**Access rules:** same as partner_enquiries.

---

### 3.6 `site_settings`

Feature-flag / page-visibility store. One row per settings namespace.

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| setting_key | text NOT NULL UNIQUE | e.g. `'visibility'` |
| setting_value | jsonb NOT NULL DEFAULT '{}' | arbitrary object |
| created_at, updated_at | timestamptz | |

**Current single row:**
```jsonb
{
  "pages":    { "about": true, "services": true, "blog": true, "partner": true, "invest": true },
  "sections": { "home_map": true, "home_benefits": true, "home_testimonials": true,
                "home_faq": true, "home_app_download": true, "about_team": true, "about_timeline": true }
}
```

**Access rules:**
- `SELECT`: only rows where `setting_key IN ('visibility')` are public; everything else admin-only.
- `INSERT`, `UPDATE`, `DELETE`: admin only.

The frontend `useSiteSettings()` hook fetches the `visibility` row on mount and gates each page/section behind those flags. Admins editing `/admin/dashboard` see the toggle UI.

---

### 3.7 CMS content tables

Seven tables share the same shape: admin-editable, `visible` flag, `sort_order`, public reads only when visible. Frontend `/admin/content` provides tabbed CRUD for all seven.

Common columns on every one:
- `id` uuid PK
- `sort_order` int NOT NULL DEFAULT 0
- `visible` bool NOT NULL DEFAULT true
- `created_at`, `updated_at` timestamptz

**Common access rules:**
- `SELECT`: `visible=true` for anyone, else admin only
- `INSERT`, `UPDATE`, `DELETE`: admin only

#### 3.7.1 `partners`
Client + partner logos scrolling on Home.
- `name` text NOT NULL
- `logo_url` text (points at storage bucket)
- `website_url` text
- `type` text NOT NULL DEFAULT 'partner' CHECK(type IN ('client','partner','both'))

#### 3.7.2 `statistics`
Animated counters on Home ("50+ chargers", "97% uptime").
- `label` text NOT NULL
- `value` text NOT NULL
- `suffix` text (`+`, `%`)
- `icon` text (lucide icon name)

#### 3.7.3 `testimonials`
Customer quotes on Home / About.
- `name` text NOT NULL
- `role` text
- `location` text
- `image_url` text
- `rating` int NOT NULL DEFAULT 5 CHECK(rating BETWEEN 1 AND 5)
- `review` text NOT NULL

#### 3.7.4 `team_members`
About page team section.
- `name` text NOT NULL
- `role` text NOT NULL
- `image_url` text
- `bio` text
- `highlight` text (short quote/tagline)
- `linkedin_url` text
- `youtube_url` text

#### 3.7.5 `faqs`
FAQ accordion.
- `question` text NOT NULL
- `answer` text NOT NULL
- `category` text (optional grouping)

#### 3.7.6 `services_catalog`
Charger models catalog at `/services`.
- `slug` text UNIQUE (`'l1-3.3kw'`, `'dc-60kw'`)
- `name` text NOT NULL
- `charger_type` text (`AC`/`DC`)
- `power` text (`'3.3 kW'`)
- `price` text (`'₹15,000'`)
- `warranty` text (`'2 years'`)
- `description` text
- `features` text[] NOT NULL DEFAULT '{}'
- `ideal_for` text
- `image_url` text

#### 3.7.7 `journey_milestones`
About-page timeline.
- `year` text NOT NULL (`'2024'`)
- `title` text NOT NULL
- `description` text NOT NULL
- `icon` text (lucide icon name, e.g. `'Rocket'`)
- `color` text (tailwind gradient, e.g. `'from-blue-500 to-cyan-500'`)

---

## 4. Storage

**One bucket: `public-assets`.** Bucket is public-read (files accessible via direct URL without auth), admin-write only.

- Blog featured images → `public-assets/blog/{timestamp}-{random}.{ext}`
- Team headshots → `public-assets/team/...`
- Partner logos → `public-assets/partners/...`
- Testimonial avatars → `public-assets/testimonials/...`
- Service catalog images → `public-assets/services/...`
- CMS uploads generally → `public-assets/uploads/...`

**Upload rules enforced client-side and re-enforced server-side:**
- Max size: 10 MB
- Accepted types (magic-byte validated, not extension): `image/png`, `image/jpeg`, `image/gif`, `image/webp`, `image/avif`
- File is renamed to `{timestamp}-{random}.{detected-ext}` before upload (prevents disguised uploads)

**Access rules:**
- `SELECT` (object read): open — the bucket is public
- `INSERT`, `UPDATE`, `DELETE`: admin only
- `LIST` (bucket listing API): admin only (prevents anonymous enumeration)

---

## 5. Server-side functions / RPCs

### 5.1 `has_role(user_id uuid, role app_role) → bool`

Immutable helper used inside every RLS policy. Returns true if that user has the role.

```sql
CREATE FUNCTION has_role(_user_id uuid, _role app_role) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role
  );
$$;
```

Non-Postgres equivalent: an `isAdmin(userId)` service function called from every write endpoint.

### 5.2 `enquiry_rate_limit_ok(email text, hours int, max int) → bool`

Prevents form spam. Returns true when the email has submitted fewer than `max` enquiries across both `partner_enquiries` and `investor_enquiries` in the last `hours` hours. Called inside the anonymous-insert policy on both enquiry tables.

```sql
CREATE FUNCTION enquiry_rate_limit_ok(_email text, _hours int DEFAULT 1, _max int DEFAULT 3)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (
    SELECT COUNT(*) FROM (
      SELECT 1 FROM partner_enquiries
        WHERE email = _email AND created_at > now() - (_hours || ' hours')::interval
      UNION ALL
      SELECT 1 FROM investor_enquiries
        WHERE email = _email AND created_at > now() - (_hours || ' hours')::interval
    ) c
  ) < _max;
$$;
```

Non-Postgres equivalent: a middleware on the two `POST` enquiry endpoints that runs `SELECT COUNT` before the insert. **Default: 3 submissions per email per hour, across both forms.**

### 5.3 `update_updated_at_column()` trigger

`BEFORE UPDATE` trigger set on every table that has an `updated_at` column. Just sets `NEW.updated_at = now()`.

---

## 6. Data validation / CHECK constraints

Defence-in-depth so a bad client can't submit garbage.

- `blog_posts.status` — enforce `IN ('draft','published')` (client-side only currently; add CHECK when rebuilding)
- `charging_stations.status` — `IN ('active','inactive')` (client-side only currently)
- `charging_stations.station_type` — `IN ('Public','Residential')`
- `partner_enquiries.email`, `investor_enquiries.email` — regex `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`
- `partner_enquiries.phone`, `investor_enquiries.phone` — regex `^\+?[0-9 \-]{7,20}$`
- `partner_enquiries.name`, `investor_enquiries.name` — `char_length BETWEEN 2 AND 200`
- `partner_enquiries.message` — `char_length ≤ 4000`
- `testimonials.rating` — `BETWEEN 1 AND 5`
- `partners.type` — `IN ('client','partner','both')`

Zod schemas on the frontend re-validate the same rules pre-submit; treat both as required.

---

## 7. API surface the frontend expects

The frontend talks to the current backend via the Supabase JS SDK, which is just a thin wrapper around PostgREST (REST) + `/auth/v1/*` + `/storage/v1/*`. If you rebuild without Supabase, expose these operations. Method-and-path shape below is a suggestion — what matters is the semantics.

### 7.1 Public read endpoints

| Endpoint | Returns |
|---|---|
| `GET /api/blog_posts?status=published&order=published_at.desc[&slug=eq.X]` | list or single post |
| `GET /api/charging_stations?status=active` | station list for map |
| `GET /api/partners?visible=true&order=sort_order` | logo strip |
| `GET /api/statistics?visible=true&order=sort_order` | animated counters |
| `GET /api/testimonials?visible=true&order=sort_order` | carousel |
| `GET /api/team_members?visible=true&order=sort_order` | about-page team |
| `GET /api/faqs?visible=true&order=sort_order` | FAQ accordion |
| `GET /api/services_catalog?visible=true&order=sort_order` | services page |
| `GET /api/journey_milestones?visible=true&order=sort_order` | about-page timeline |
| `GET /api/site_settings?setting_key=eq.visibility` | one row, visibility JSON |

### 7.2 Public write endpoints

| Endpoint | Body | Rules |
|---|---|---|
| `POST /api/partner_enquiries` | `{name,email,phone,location_lat,location_lng,location_address,charger_type,message}` | Rate limit 3/email/hour across both enquiry tables. Trip on honeypot field `website_url`. |
| `POST /api/investor_enquiries` | `{name,email,phone,organization,city,investor_type,investment_range}` | Same rate limit. |

### 7.3 Auth endpoints

| Endpoint | Purpose |
|---|---|
| `POST /auth/signin` | email + password → access + refresh JWT |
| `POST /auth/signout` | invalidate session |
| `POST /auth/refresh` | refresh access token |
| `GET /auth/user` | current user + basic profile |

### 7.4 Admin endpoints (JWT with `admin` role required)

All the following operations against every table listed above:
- `POST /api/{table}` — create row
- `PATCH /api/{table}?id=eq.X` — partial update
- `DELETE /api/{table}?id=eq.X` — delete

Plus:
- `GET /api/partner_enquiries`, `GET /api/investor_enquiries` — admin-only reads of all rows
- `POST /storage/public-assets/{path}` — multipart file upload
- `DELETE /storage/public-assets/{path}` — remove file
- `GET /storage/public-assets/list?prefix=blog/` — list files (admin-only)
- `GET /storage/public-assets/{path}` — public read (no auth)

---

## 8. What's editable from the admin UI

The `/admin` surface is the operator control panel. Every page below is behind admin auth. All data hits the same tables described above.

### 8.1 `/admin/login`
Sign-in form. Only method into `/admin/*`.

### 8.2 `/admin/dashboard`
- Overview cards linking to each admin section.
- **Page / section visibility toggles** — writes to `site_settings.visibility`. Every toggle here instantly hides that page or homepage section from the live site (client reads `site_settings` on load).
- Logout.

### 8.3 `/admin/charging-stations`
Full CRUD for `charging_stations`.
- Add / edit / delete a station with all fields (name, address, city, state, district, pin_code, lat, lng, charger_type, connector_type, power_output, total_chargers, price_per_unit, amenities, station_type, status).
- Interactive map to pick lat/lng.
- List view with search/filter by status.

### 8.4 `/admin/blogs`
Full CRUD for `blog_posts`.
- Rich text editor (`RichTextEditor` component) for the `content` field; DOMPurify sanitizes before save.
- Image upload for `featured_image` (goes to `public-assets/blog/`).
- Toggle `status` between draft and published.
- Slug auto-generated from title, editable.
- Tags + meta_description + meta_keywords editable.
- List view with search + status filter + delete.

### 8.5 `/admin/enquiries`
Read-only + status management for `partner_enquiries` and `investor_enquiries`.
- Two tabs, one per table.
- Table view sortable by created_at.
- Change `status` (`pending` → `contacted` → `closed`).
- Delete row.
- View full submission in a modal.

### 8.6 `/admin/content`
Tabbed CMS for the seven content tables: **partners · statistics · testimonials · team_members · faqs · services_catalog · journey_milestones**.

For each tab:
- List view with drag/click sort order.
- Add / edit / delete rows.
- Image upload for `image_url` / `logo_url` fields (goes to `public-assets/<table>/`).
- `visible` toggle to hide a row from the public site without deleting it.
- Seed / restore-defaults action per tab (see §9).

**Special columns per tab:**
- `partners` — `type` dropdown (client / partner / both) and `logo_url` uploader
- `statistics` — `icon` = lucide icon name (dropdown of available icons)
- `testimonials` — star rating picker (1-5)
- `team_members` — LinkedIn + YouTube links, `highlight` for the pull-quote
- `services_catalog` — `features` as tag-input, `slug` auto-generated
- `journey_milestones` — `icon` (lucide name) + `color` (tailwind gradient class picker)

---

## 9. Seed data

The current schema seeds default rows into every CMS table when the table is empty, so the site never renders blank sections on a fresh install. The developer rebuilding this backend should either:

- **Port the seeds** from `supabase/migrations/20260417120000_content_management.sql` and `20260417180000_partners_type_and_timeline.sql` — those files contain the exact `INSERT ... WHERE NOT EXISTS` blocks.
- **Or ship the frontend `siteDefaults.ts` fallbacks** — `src/lib/siteDefaults.ts` in this repo contains the same defaults hardcoded so the site still renders if the CMS tables are empty. The `/admin/content` page has a "Seed defaults" button per tab that copies the fallback into the database.

Either way, first admin login should see the site fully populated.

---

## 10. Non-functional requirements

- **Uptime target:** 99%+ (marketing site — a lost minute is not catastrophic but consistent downtime hurts SEO).
- **Backups:** daily Postgres logical backup, 30-day retention. Weekly restore drill.
- **CORS:** allow origins `https://www.apluscharge.com`, `https://apluscharge.com`, `https://apluscharge.in`, plus preview URLs for the chosen host. Reject everything else.
- **Rate limiting (transport):** 30 req/min per IP for public endpoints; higher for admins on their own JWT.
- **Idempotency:** admin writes are not idempotent-keyed today; nice-to-have for a future rebuild.
- **Timezone:** all timestamps are UTC in storage. Rendering uses browser locale.
- **Locale:** English (en-IN). No i18n today.
- **Observability:** log every admin write with `{user_id, table, row_id, action, at}`. Non-admin submissions (enquiries) similarly logged.

---

## 11. Environment variables the frontend needs

Whatever backend you build, the frontend needs these three env vars set at build time (Vite substitutes them at bundle time):

```
VITE_SUPABASE_URL           # base URL of the API / storage service
VITE_SUPABASE_PUBLISHABLE_KEY   # the public/anon key
VITE_SUPABASE_PROJECT_ID    # subdomain component of the URL (used for asset URLs)
```

If you rebuild with a different provider or self-host, you can either:

- **Keep the env names** (they're arbitrary strings) and put your own values in — least invasive change to the frontend.
- **Rename them and update `src/integrations/supabase/client.ts`** to construct whatever client SDK your backend needs.

The frontend already fails loud on boot when either value is missing, so misconfiguration is caught at deploy time.

---

## 12. Migration runbook from current Supabase

If the developer is starting from the current Supabase project rather than blank:

1. `pg_dump --data-only --schema=public $OLD_DB_URL` → `psql $NEW_DB_URL`
2. Copy every file from `public-assets` bucket → new object storage (script at `scripts/migrate-storage.mjs` in this repo).
3. Export users from `auth.users` (Supabase dashboard has a JSON export) → import into new auth store.
4. Re-add the admin `user_roles` row for the first admin.
5. Point the frontend env vars at the new backend.
6. Flip DNS.

Full step-by-step in `MIGRATION.md` in this repo.

---

## 13. Reference: files in the current codebase

Where to look for each concern when reading the frontend:

| Concern | File |
|---|---|
| Supabase client + env handling | `src/integrations/supabase/client.ts` |
| Generated table types | `src/integrations/supabase/types.ts` |
| Blog list | `src/pages/Blog.tsx` |
| Blog post detail | `src/pages/BlogPost.tsx` |
| Station map | `src/components/ChargingStationsMap.tsx`, `src/pages/FindCharger.tsx` |
| Partner enquiry form | `src/pages/Partner.tsx` |
| Investor enquiry form | `src/pages/Invest.tsx` |
| Site-settings hook | `src/hooks/useSiteSettings.tsx` |
| CMS content hooks | inline in each admin page |
| Storage upload helper | `src/lib/storage.ts` |
| HTML sanitizer | `src/lib/sanitize.ts` |
| Anti-spam (honeypot + throttle) | `src/lib/antiSpam.ts` |
| Default seed data | `src/lib/siteDefaults.ts` |
| Admin login | `src/pages/AdminLogin.tsx` |
| Admin dashboard + visibility | `src/pages/AdminDashboard.tsx` |
| Admin CRUD pages | `src/pages/AdminBlogs.tsx`, `AdminChargingStations.tsx`, `AdminContent.tsx`, `AdminEnquiries.tsx` |

---

## Appendix A. Full SQL reference

Every migration lives in `supabase/migrations/` in this repo, timestamp-ordered:

1. `20251111214923_remix_migration_from_pg_dump.sql` — base schema (blog, stations, roles, auth wire-up)
2. `20251121083944` — `station_type`, `district`, `pin_code` added to `charging_stations`
3. `20251215082815` — `partner_enquiries`, `investor_enquiries`
4. `20260107084124` — `site_settings`
5. `20260108075300` — CHECK constraints on enquiries + (buggy) rate-limit policy (later replaced)
6. `20260417120000_content_management.sql` — the 6 CMS tables + storage bucket + seeds
7. `20260417172348` — repeat/idempotent version of the content-management migration
8. `20260417180000_partners_type_and_timeline.sql` — `partners.type` + `journey_milestones` + seed
9. `20260420120000_hardening.sql` — indexes, `enquiry_rate_limit_ok`, FKs, correct rate-limit policies
10. `20260421100000_security_fixes.sql` — drop stale buggy policies, admin-only user_roles delete, site_settings whitelist read, storage bucket admin-only list
11. `20260627210753_...` — later hardening pass, idempotent

The developer can either apply all files in order to a fresh Postgres (Supabase-compatible or plain), or read the final consolidated state and translate to their ORM of choice. All the RLS policies are documented in these files verbatim.
