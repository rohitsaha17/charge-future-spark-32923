// Client for the self-hosted Express API (../change-suture-backend).
//
// Replaces `@supabase/supabase-js`. Two things Supabase used to do for us that
// we now do here: keep the session in localStorage, and silently refresh an
// expired access token before retrying the request. Everything else was just a
// query builder over HTTP, which is what the typed methods at the bottom are.

const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000/api'
).replace(/\/+$/, '');

const ACCESS_TOKEN_KEY = 'apc_access_token';
const REFRESH_TOKEN_KEY = 'apc_refresh_token';

/** Thrown for any non-2xx response. `code` mirrors the API's error code so
 *  callers can branch on `conflict` the way they used to on Postgres `23505`. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// --- session storage -------------------------------------------------------
// Wrapped because localStorage throws in private mode on some browsers, and a
// storage failure should degrade to "logged out", not crash the page.

const readToken = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeTokens = (accessToken: string | null, refreshToken: string | null) => {
  try {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Session simply won't persist across reloads.
  }
};

export const getAccessToken = () => readToken(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => readToken(REFRESH_TOKEN_KEY);
export const clearSession = () => writeTokens(null, null);

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  email_confirmed_at: string | null;
  created_at: string;
}

interface SessionResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

// --- request plumbing ------------------------------------------------------

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Multipart uploads set their own Content-Type boundary. */
  formData?: FormData;
  auth?: boolean;
  signal?: AbortSignal;
}

/**
 * Concurrent 401s would otherwise each fire their own refresh and invalidate
 * one another — the API rotates refresh tokens, so only the first would win.
 * Sharing one in-flight promise means they all wait on the same refresh.
 */
let refreshInFlight: Promise<boolean> | null = null;

const refreshSession = async (): Promise<boolean> => {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        clearSession();
        return false;
      }
      const session = (await res.json()) as SessionResponse;
      writeTokens(session.access_token, session.refresh_token);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
};

const parseBody = async (res: Response): Promise<unknown> => {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, formData, auth = false, signal } = options;

  const send = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (auth) {
      const token = getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: formData ?? (body === undefined ? undefined : JSON.stringify(body)),
      signal,
    });
  };

  let res: Response;
  try {
    res = await send();
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
    throw new ApiError(0, 'network_error', 'Could not reach the server. Is the API running?');
  }

  // One retry, and only for an authenticated request whose token we can renew.
  if (res.status === 401 && auth && getRefreshToken()) {
    if (await refreshSession()) {
      res = await send();
    }
  }

  const payload = await parseBody(res);

  if (!res.ok) {
    const error = (payload as { error?: { code?: string; message?: string; details?: unknown } })
      ?.error;
    throw new ApiError(
      res.status,
      error?.code ?? 'error',
      error?.message ?? `Request failed with status ${res.status}`,
      error?.details
    );
  }

  return payload as T;
};

// --- typed surface ---------------------------------------------------------

export type Row = Record<string, any>;

export const auth = {
  async login(email: string, password: string): Promise<AuthUser> {
    const session = await request<SessionResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    writeTokens(session.access_token, session.refresh_token);
    return session.user;
  },

  async logout(): Promise<void> {
    const refresh_token = getRefreshToken();
    try {
      await request('/auth/logout', { method: 'POST', auth: true, body: { refresh_token } });
    } catch {
      // The local session is dropped either way — a failed revoke must not
      // leave the user stuck on a page they can no longer use.
    }
    clearSession();
  },

  /** Resolves to null when signed out, so callers can branch without a try. */
  async me(): Promise<AuthUser | null> {
    if (!getAccessToken() && !getRefreshToken()) return null;
    try {
      return await request<AuthUser>('/auth/me', { auth: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
        return null;
      }
      throw err;
    }
  },

  async isAdmin(): Promise<boolean> {
    const user = await auth.me();
    return !!user?.roles.includes('admin');
  },

  forgotPassword(email: string) {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  resetPassword(token: string, password: string) {
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    });
  },
};

export const blog = {
  listPublished: () => request<Row[]>('/blog'),
  getBySlug: (slug: string) =>
    request<{ post: Row; related: Row[] }>(`/blog/${encodeURIComponent(slug)}`),
  listAll: () => request<Row[]>('/admin/blog', { auth: true }),
  create: (data: Row) => request<Row>('/admin/blog', { method: 'POST', body: data, auth: true }),
  update: (id: string, data: Row) =>
    request<Row>(`/admin/blog/${id}`, { method: 'PATCH', body: data, auth: true }),
  remove: (id: string) => request<void>(`/admin/blog/${id}`, { method: 'DELETE', auth: true }),
};

export const stations = {
  listActive: () => request<Row[]>('/stations'),
  listAll: () => request<Row[]>('/admin/stations', { auth: true }),
  create: (data: Row) => request<Row>('/admin/stations', { method: 'POST', body: data, auth: true }),
  update: (id: string, data: Row) =>
    request<Row>(`/admin/stations/${id}`, { method: 'PATCH', body: data, auth: true }),
  remove: (id: string) => request<void>(`/admin/stations/${id}`, { method: 'DELETE', auth: true }),
};

/** URL slugs for the seven CMS resources, as the API exposes them. */
export type CmsResource =
  | 'partners'
  | 'statistics'
  | 'testimonials'
  | 'team-members'
  | 'faqs'
  | 'services'
  | 'journey-milestones';

export const cms = {
  listVisible: (resource: CmsResource) => request<Row[]>(`/${resource}`),
  listAll: (resource: CmsResource) => request<Row[]>(`/admin/${resource}`, { auth: true }),
  /** An array creates several rows in one call (the CMS "populate defaults" button). */
  create: (resource: CmsResource, data: Row | Row[]) =>
    request<Row | Row[]>(`/admin/${resource}`, { method: 'POST', body: data, auth: true }),
  update: (resource: CmsResource, id: string, data: Row) =>
    request<Row>(`/admin/${resource}/${id}`, { method: 'PATCH', body: data, auth: true }),
  remove: (resource: CmsResource, id: string) =>
    request<void>(`/admin/${resource}/${id}`, { method: 'DELETE', auth: true }),
};

export type EnquiryKind = 'partners' | 'investors';

export const enquiries = {
  submitPartner: (data: Row) =>
    request<Row>('/enquiries/partner', { method: 'POST', body: data }),
  submitInvestor: (data: Row) =>
    request<Row>('/enquiries/investor', { method: 'POST', body: data }),
  list: (kind: EnquiryKind) => request<Row[]>(`/admin/enquiries/${kind}`, { auth: true }),
  updateStatus: (kind: EnquiryKind, id: string, status: string) =>
    request<Row>(`/admin/enquiries/${kind}/${id}`, {
      method: 'PATCH',
      body: { status },
      auth: true,
    }),
  remove: (kind: EnquiryKind, id: string) =>
    request<void>(`/admin/enquiries/${kind}/${id}`, { method: 'DELETE', auth: true }),
};

export interface VisibilityPayload {
  pages: Record<string, boolean>;
  sections: Record<string, boolean>;
}

export const siteSettings = {
  get: () => request<VisibilityPayload>('/site-settings'),
  update: (data: Partial<VisibilityPayload>) =>
    request<VisibilityPayload>('/admin/site-settings', {
      method: 'PATCH',
      body: data,
      auth: true,
    }),
};

export interface UploadResponse {
  url: string;
  path: string;
  filename: string;
  size: number;
  content_type: string;
}

export const uploads = {
  upload(file: File, folder = 'uploads') {
    const form = new FormData();
    form.append('folder', folder);
    form.append('file', file);
    return request<UploadResponse>('/admin/uploads', {
      method: 'POST',
      formData: form,
      auth: true,
    });
  },
  remove: (path: string) =>
    request<void>(`/admin/uploads/${path.split('/').map(encodeURIComponent).join('/')}`, {
      method: 'DELETE',
      auth: true,
    }),
};

export const health = () => request<{ status: string }>('/health');

export const api = { auth, blog, stations, cms, enquiries, siteSettings, uploads, health };
export { API_URL };
export default api;
