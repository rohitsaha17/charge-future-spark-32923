/**
 * REST-backed adapter that presents a Supabase-compatible surface.
 *
 * The rest of the codebase was written against `@supabase/supabase-js`,
 * with dozens of call sites using `.from(table).select().eq().order()...`,
 * `.auth.signInWithPassword(...)`, and `.storage.from(bucket).upload(...)`.
 * After moving off Lovable's managed Supabase to the custom REST API at
 * `https://api.apluscharge.in`, the pragmatic option was a thin shim
 * that mimics enough of the Supabase client shape to leave call sites
 * unchanged, rather than rewriting 25+ files call-by-call.
 *
 * The API contract this shim targets is documented in BACKEND-SPEC.md
 * and the developer-supplied endpoint table. Notable adaptations:
 *
 * - Public reads route to `/api/<resource>` and always return only the
 *   visible / active / published rows — filters like `.eq('status',
 *   'published')` are still applied client-side as a safety net.
 * - Admin writes route to `/api/admin/<resource>` and are guarded by a
 *   Bearer JWT stored in localStorage. A 401 triggers a single refresh
 *   attempt before surfacing the error.
 * - `site_settings` is stored as a single row on the frontend but the
 *   API returns the visibility payload directly. The shim wraps and
 *   unwraps `setting_value` transparently.
 * - `user_roles` has no REST equivalent — the API only issues tokens to
 *   admins, so a valid session implies admin. The shim synthesises
 *   `{ role: 'admin' }` for any query against that table.
 * - `charging_stations` → `stations`, `blog_posts` → `blog`,
 *   `team_members` → `team-members`, etc. — the API uses dash-case
 *   short names while the frontend still uses the original snake_case
 *   table names, so we map at the boundary.
 * - Storage: uploads POST to `/api/admin/uploads` and return the final
 *   URL; the shim caches upload URLs by path so a follow-up
 *   `getPublicUrl(path)` returns the right URL. `getBucket` /
 *   `createBucket` become no-ops (there are no buckets in the new API).
 */
import type { Database } from './types';

// Strip trailing slashes so `${API_BASE}/api/foo` doesn't emit a
// double slash when the env var was written as `https://host/`.
// Some backends 404 on the doubled path; others fold it silently — we
// don't rely on either behaviour.
const API_BASE = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  'https://api.apluscharge.in'
).replace(/\/+$/, '');

const KEY_ACCESS = 'apc_access_token';
const KEY_REFRESH = 'apc_refresh_token';
const KEY_USER = 'apc_user';

// Frontend table names → API resource paths
const RESOURCE_MAP: Record<string, string> = {
  blog_posts: 'blog',
  charging_stations: 'stations',
  team_members: 'team-members',
  services_catalog: 'services',
  journey_milestones: 'journey-milestones',
  site_settings: 'site-settings',
  // enquiries have per-flow paths — handled explicitly below
};

const resource = (table: string) => RESOURCE_MAP[table] || table;
const publicPath = (table: string) => `/api/${resource(table)}`;
const adminPath = (table: string) => `/api/admin/${resource(table)}`;

// -------------------------------------------------------------------- session

type StoredUser = { id: string; email?: string } & Record<string, unknown>;
type StoredSession = { access_token: string; user: StoredUser } | null;

const readSession = (): StoredSession => {
  try {
    const token = localStorage.getItem(KEY_ACCESS);
    const userStr = localStorage.getItem(KEY_USER);
    if (!token || !userStr) return null;
    return { access_token: token, user: JSON.parse(userStr) };
  } catch {
    return null;
  }
};

const writeSession = (access: string, refresh: string | undefined, user: StoredUser) => {
  try {
    localStorage.setItem(KEY_ACCESS, access);
    if (refresh) localStorage.setItem(KEY_REFRESH, refresh);
    localStorage.setItem(KEY_USER, JSON.stringify(user));
  } catch {
    /* private mode; session is per-tab */
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem(KEY_ACCESS);
    localStorage.removeItem(KEY_REFRESH);
    localStorage.removeItem(KEY_USER);
  } catch {
    /* ignore */
  }
};

type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED';
type AuthListener = (event: AuthEvent, session: StoredSession) => void;
const authListeners = new Set<AuthListener>();
const emitAuth = (event: AuthEvent, session: StoredSession) => {
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch {
      /* listener errors must not crash the emit */
    }
  });
};

// -------------------------------------------------------------------- fetch

type ApiError = { message: string; code?: string; details?: unknown };
type ApiResponse<T> = { data: T | null; error: ApiError | null };

const mapError = (json: any, status: number): ApiError => {
  if (json?.error) {
    return {
      message: json.error.message || `HTTP ${status}`,
      code: json.error.code,
      details: json.error.details,
    };
  }
  if (json?.message) return { message: json.message };
  return { message: `HTTP ${status}` };
};

type FetchInit = Omit<RequestInit, 'body'> & { body?: unknown };

const doFetch = async (
  path: string,
  init: FetchInit = {},
  authenticated = false,
  isRetry = false,
): Promise<Response> => {
  const headers = new Headers(init.headers || {});
  const body = init.body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && !isFormData && typeof body === 'object' && !(body instanceof Blob)) {
    headers.set('Content-Type', 'application/json');
    init = { ...init, body: JSON.stringify(body) };
  }
  if (authenticated) {
    const token = localStorage.getItem(KEY_ACCESS);
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers } as RequestInit);
  if (res.status === 401 && authenticated && !isRetry) {

    if (await tryRefresh()) {
      return doFetch(path, init, authenticated, true);
    }
    clearSession();
    emitAuth('SIGNED_OUT', null);
  }
  return res;
};

const tryRefresh = async (): Promise<boolean> => {
  const refresh = localStorage.getItem(KEY_REFRESH);
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh, refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const json = await res.json();
    const access =
      json.accessToken || json.access_token || json.token || json.session?.access_token;
    const newRefresh =
      json.refreshToken || json.refresh_token || json.session?.refresh_token;
    const user = json.user || readSession()?.user;
    if (!access || !user) return false;
    writeSession(access, newRefresh, user);
    emitAuth('TOKEN_REFRESHED', { access_token: access, user });
    return true;
  } catch {
    return false;
  }
};

// -------------------------------------------------------------------- query builder

type Filter = { op: 'eq' | 'neq'; col: string; val: unknown };
type Order = { col: string; asc: boolean };

class QueryBuilder implements PromiseLike<ApiResponse<any>> {
  private op: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private filters: Filter[] = [];
  private orderBy: Order | null = null;
  private limitVal: number | null = null;
  private singleFlag = false;
  private payload: any = null;
  constructor(private table: string) {}

  select(_fields?: string): this {
    return this;
  }
  eq(col: string, val: unknown): this {
    this.filters.push({ op: 'eq', col, val });
    return this;
  }
  neq(col: string, val: unknown): this {
    this.filters.push({ op: 'neq', col, val });
    return this;
  }
  order(col: string, opts: { ascending?: boolean } = {}): this {
    this.orderBy = { col, asc: opts.ascending !== false };
    return this;
  }
  limit(n: number): this {
    this.limitVal = n;
    return this;
  }
  single(): this {
    this.singleFlag = true;
    return this;
  }
  insert(row: any): this {
    this.op = 'insert';
    this.payload = Array.isArray(row) ? row[0] : row;
    return this;
  }
  update(row: any): this {
    this.op = 'update';
    this.payload = row;
    return this;
  }
  delete(): this {
    this.op = 'delete';
    return this;
  }

  then<TResult1 = ApiResponse<any>, TResult2 = never>(
    onfulfilled?:
      | ((value: ApiResponse<any>) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<ApiResponse<any>> {
    try {
      return await this.run();
    } catch (err: any) {
      return { data: null, error: { message: err?.message || 'request failed' } };
    }
  }

  private applyClientSide(rows: any[]): any[] {
    let out = rows;
    for (const f of this.filters) {
      if (f.op === 'eq') out = out.filter((r) => r?.[f.col] === f.val);
      else if (f.op === 'neq') out = out.filter((r) => r?.[f.col] !== f.val);
    }
    if (this.orderBy) {
      const { col, asc } = this.orderBy;
      out = [...out].sort((a, b) => {
        const av = a?.[col];
        const bv = b?.[col];
        if (av === bv) return 0;
        if (av == null) return asc ? -1 : 1;
        if (bv == null) return asc ? 1 : -1;
        const cmp = av < bv ? -1 : 1;
        return asc ? cmp : -cmp;
      });
    }
    if (this.limitVal != null) out = out.slice(0, this.limitVal);
    return out;
  }

  private async run(): Promise<ApiResponse<any>> {
    // user_roles is synthesised — the API only issues tokens to admins.
    if (this.table === 'user_roles') {
      const s = readSession();
      if (this.op !== 'select') return { data: null, error: null };
      if (!s?.user) return { data: this.singleFlag ? null : [], error: null };
      const row = { role: 'admin', user_id: s.user.id };
      return { data: this.singleFlag ? row : [row], error: null };
    }

    // Enquiry submissions post to /api/enquiries/{partner|investor}
    if (
      this.op === 'insert' &&
      (this.table === 'partner_enquiries' || this.table === 'investor_enquiries')
    ) {
      const kind = this.table === 'partner_enquiries' ? 'partner' : 'investor';
      const res = await doFetch(`/api/enquiries/${kind}`, {
        method: 'POST',
        body: this.payload,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) return { data: null, error: mapError(json, res.status) };
      const row = json?.data ?? json ?? this.payload;
      return { data: this.singleFlag ? row : [row], error: null };
    }

    // Admin lists enquiries via /api/admin/enquiries/{partners|investors}
    if (
      this.op === 'select' &&
      (this.table === 'partner_enquiries' || this.table === 'investor_enquiries')
    ) {
      const kind = this.table === 'partner_enquiries' ? 'partners' : 'investors';
      const res = await doFetch(`/api/admin/enquiries/${kind}`, {}, true);
      const json = await res.json().catch(() => null);
      if (!res.ok) return { data: null, error: mapError(json, res.status) };
      const rows = this.applyClientSide(Array.isArray(json) ? json : []);
      return { data: this.singleFlag ? rows[0] ?? null : rows, error: null };
    }

    // Enquiry writes route to /api/admin/enquiries/{partners|investors}/:id
    if (
      (this.op === 'update' || this.op === 'delete') &&
      (this.table === 'partner_enquiries' || this.table === 'investor_enquiries')
    ) {
      const kind = this.table === 'partner_enquiries' ? 'partners' : 'investors';
      const idFilter = this.filters.find((f) => f.col === 'id');
      if (!idFilter) return { data: null, error: { message: `${this.op} requires .eq("id", ...)` } };
      const path = `/api/admin/enquiries/${kind}/${idFilter.val}`;
      if (this.op === 'delete') {
        const res = await doFetch(path, { method: 'DELETE' }, true);
        if (!res.ok) {
          const j = await res.json().catch(() => null);
          return { data: null, error: mapError(j, res.status) };
        }
        return { data: null, error: null };
      }
      const res = await doFetch(path, { method: 'PATCH', body: this.payload }, true);
      const json = await res.json().catch(() => null);
      if (!res.ok) return { data: null, error: mapError(json, res.status) };
      return { data: json, error: null };
    }

    // site_settings — GET returns the visibility payload directly; wrap
    // it to match the { setting_key, setting_value } shape the frontend
    // expects. UPDATE unwraps back before sending.
    if (this.op === 'select' && this.table === 'site_settings') {
      const res = await doFetch('/api/site-settings');
      const json = await res.json().catch(() => null);
      if (!res.ok) return { data: null, error: mapError(json, res.status) };
      const row = { setting_key: 'visibility', setting_value: json };
      return { data: this.singleFlag ? row : [row], error: null };
    }
    if (this.op === 'update' && this.table === 'site_settings') {
      const body =
        this.payload && typeof this.payload === 'object' && 'setting_value' in this.payload
          ? this.payload.setting_value
          : this.payload;
      const res = await doFetch('/api/admin/site-settings', { method: 'PATCH', body }, true);
      const json = await res.json().catch(() => null);
      if (!res.ok) return { data: null, error: mapError(json, res.status) };
      return { data: json, error: null };
    }

    // Blog single-post read by slug uses /api/blog/:slug
    if (this.op === 'select' && this.table === 'blog_posts' && this.singleFlag) {
      const slug = this.filters.find((f) => f.col === 'slug');
      if (slug) {
        const res = await doFetch(`/api/blog/${encodeURIComponent(String(slug.val))}`);
        const json = await res.json().catch(() => null);
        if (res.status === 404) return { data: null, error: { message: 'Not found' } };
        if (!res.ok) return { data: null, error: mapError(json, res.status) };
        return { data: json, error: null };
      }
    }

    // Generic reads — hit the public list endpoint and filter/sort client-side
    if (this.op === 'select') {
      const res = await doFetch(publicPath(this.table));
      const json = await res.json().catch(() => null);
      if (!res.ok) return { data: null, error: mapError(json, res.status) };
      const rows = this.applyClientSide(Array.isArray(json) ? json : []);
      return { data: this.singleFlag ? rows[0] ?? null : rows, error: null };
    }

    // Admin CRUD
    if (this.op === 'insert') {
      const res = await doFetch(adminPath(this.table), { method: 'POST', body: this.payload }, true);
      const json = await res.json().catch(() => null);
      if (!res.ok) return { data: null, error: mapError(json, res.status) };
      const row = Array.isArray(json) ? json[0] : json;
      return { data: this.singleFlag ? row : [row], error: null };
    }
    if (this.op === 'update') {
      const idFilter = this.filters.find((f) => f.col === 'id');
      if (!idFilter) return { data: null, error: { message: 'update requires .eq("id", ...)' } };
      const res = await doFetch(
        `${adminPath(this.table)}/${idFilter.val}`,
        { method: 'PATCH', body: this.payload },
        true,
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) return { data: null, error: mapError(json, res.status) };
      return { data: json, error: null };
    }
    if (this.op === 'delete') {
      const idFilter = this.filters.find((f) => f.col === 'id');
      if (!idFilter) return { data: null, error: { message: 'delete requires .eq("id", ...)' } };
      const res = await doFetch(`${adminPath(this.table)}/${idFilter.val}`, { method: 'DELETE' }, true);
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        return { data: null, error: mapError(json, res.status) };
      }
      return { data: null, error: null };
    }

    return { data: null, error: { message: 'unknown operation' } };
  }
}

// -------------------------------------------------------------------- auth

const auth = {
  async getSession() {
    return { data: { session: readSession() }, error: null as ApiError | null };
  },
  async getUser() {
    const s = readSession();
    return { data: { user: s?.user ?? null }, error: null as ApiError | null };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const res = await doFetch('/api/auth/login', { method: 'POST', body: { email, password } });
    const json = await res.json().catch(() => null);
    if (!res.ok) return { data: null, error: mapError(json, res.status) };
    const access =
      json?.accessToken || json?.access_token || json?.token || json?.session?.access_token;
    const refresh =
      json?.refreshToken || json?.refresh_token || json?.session?.refresh_token;
    const user = (json?.user || json?.data?.user) as StoredUser | undefined;
    if (!access || !user) {
      return { data: null, error: { message: 'login response missing token or user' } };
    }
    writeSession(access, refresh, user);
    const session = { access_token: access, user };
    emitAuth('SIGNED_IN', session);
    return { data: { session, user }, error: null as ApiError | null };
  },
  async signUp({
    email,
    password,
    options,
  }: {
    email: string;
    password: string;
    options?: { emailRedirectTo?: string };
  }) {
    const res = await doFetch('/api/auth/signup', {
      method: 'POST',
      body: { email, password, redirectTo: options?.emailRedirectTo },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) return { data: null, error: mapError(json, res.status) };
    return { data: json ?? {}, error: null as ApiError | null };
  },
  async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
    const res = await doFetch('/api/auth/password-reset', {
      method: 'POST',
      body: { email, redirectTo: options?.redirectTo },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) return { data: null, error: mapError(json, res.status) };
    return { data: json ?? {}, error: null as ApiError | null };
  },

  async signOut() {
    try {
      await doFetch('/api/auth/logout', { method: 'POST' }, true);
    } catch {
      /* best-effort — always clear locally */
    }
    clearSession();
    emitAuth('SIGNED_OUT', null);
    return { error: null as ApiError | null };
  },
  onAuthStateChange(cb: AuthListener) {
    authListeners.add(cb);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            authListeners.delete(cb);
          },
        },
      },
    };
  },
  // The following methods keep signatures compatible with the Supabase
  // SDK so AdminLogin's Zod-validated forms don't blow up at click time.
  // The new backend exposes /api/auth/forgot-password and no signup
  // endpoint (admins are created out-of-band), so signUp returns an
  // explanatory error and the AdminLogin flow already treats it as such.
  async resetPasswordForEmail(
    email: string,
    _opts?: { redirectTo?: string },
  ) {
    const res = await doFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) return { data: null, error: mapError(json, res.status) };
    return { data: json, error: null as ApiError | null };
  },
  async signUp(_args: { email: string; password: string; options?: unknown }) {
    return {
      data: null,
      error: {
        message:
          'Self-serve signup is disabled — ask an existing admin to create the account.',
      } as ApiError,
    };
  },
  async updateUser(args: { password?: string; email?: string }) {
    const res = await doFetch('/api/auth/reset-password', {
      method: 'POST',
      body: args,
    }, true);
    const json = await res.json().catch(() => null);
    if (!res.ok) return { data: null, error: mapError(json, res.status) };
    return { data: json, error: null as ApiError | null };
  },
};

// -------------------------------------------------------------------- storage

// Path → URL cache. `upload()` returns the final URL, but many callers
// call `getPublicUrl(path)` afterwards expecting the same URL. We stash
// the mapping here so the second call finds it.
const uploadUrlByPath = new Map<string, string>();

const storage = {
  from(_bucket: string) {
    return {
      async upload(
        path: string,
        file: File | Blob,
        _opts?: { cacheControl?: string; upsert?: boolean; contentType?: string },
      ): Promise<ApiResponse<{ path: string; url?: string }>> {
        const form = new FormData();
        form.append('file', file as Blob, path);
        form.append('filename', path);
        const res = await doFetch('/api/admin/uploads', { method: 'POST', body: form }, true);
        const json = await res.json().catch(() => null);
        if (!res.ok) return { data: null, error: mapError(json, res.status) };
        const url = json?.url || json?.publicUrl || json?.data?.url;
        const returnedPath = json?.filename || json?.path || path;
        if (url) uploadUrlByPath.set(returnedPath, url);
        return { data: { path: returnedPath, url }, error: null };
      },
      getPublicUrl(path: string): { data: { publicUrl: string } } {
        if (/^https?:\/\//i.test(path)) return { data: { publicUrl: path } };
        const cached = uploadUrlByPath.get(path);
        if (cached) return { data: { publicUrl: cached } };
        return { data: { publicUrl: `${API_BASE}/uploads/${path}` } };
      },
      async remove(paths: string | string[]): Promise<ApiResponse<{ name: string }[]>> {
        const list = Array.isArray(paths) ? paths : [paths];
        const results: { name: string }[] = [];
        for (const p of list) {
          const filename = p.split('/').pop() || p;
          const res = await doFetch(
            `/api/admin/uploads/${encodeURIComponent(filename)}`,
            { method: 'DELETE' },
            true,
          );
          if (res.ok) results.push({ name: p });
        }
        return { data: results, error: null };
      },
      async list(_prefix?: string): Promise<ApiResponse<unknown[]>> {
        // No public list endpoint on the new API — return empty so any
        // caller that uses this to check for existence sees "not found".
        return { data: [], error: null };
      },
    };
  },
  // Bucket helpers were used by the legacy auto-create flow; the new API
  // has no bucket concept, so return success and let uploads flow.
  async createBucket(_id?: string, _options?: Record<string, unknown>): Promise<ApiResponse<{}>> {
    return { data: {}, error: null };
  },
  async getBucket(_id?: string): Promise<ApiResponse<{ name: string }>> {
    return { data: { name: 'public-assets' }, error: null };
  },

};

// -------------------------------------------------------------------- export

// Typed as `any` so the many `.from<Row>()`, `.eq<Col>()`, `.rpc()` call
// sites in the codebase keep type-checking. The underlying Database types
// in `./types.ts` are still authoritative for row shapes; the runtime
// just happens to be a shim now.
export const supabase = {
  auth,
  storage,
  from(table: string): QueryBuilder {
    return new QueryBuilder(table);
  },
  // rpc() isn't currently used anywhere; if a future migration surfaces
  // an RPC endpoint the shim can be extended here.
  rpc(_fn: string, _args?: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return Promise.resolve({ data: null, error: { message: 'rpc not implemented' } });
  },
} as unknown as {
  auth: typeof auth;
  storage: typeof storage;
  from: <T = any>(table: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<ApiResponse<unknown>>;
};

// Placeholder to keep the `Database` type import used — some IDE tooling
// wants the imported type name referenced at least once.
export type SupabaseDatabase = Database;
