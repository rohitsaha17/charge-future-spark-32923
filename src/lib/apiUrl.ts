/**
 * Where the frontend talks to the API.
 *
 * Resolved through one function so the build-time consumer (vite.config.ts,
 * which emits the preconnect hint and widens the CSP) and the runtime consumer
 * (src/lib/api.ts) can never disagree. They did once: a production build ran
 * without VITE_API_URL, so both fell back to the dev default and the deploy
 * shipped a bundle calling http://localhost:4000 behind a CSP that allowed
 * only http://localhost:4000 — every admin login on the live site failed with
 * a blocked request rather than a bad-credentials error.
 *
 * Precedence: VITE_API_URL, then the production host, then localhost.
 */
export const DEV_API_URL = 'http://localhost:4000/api';
export const PROD_API_URL = 'https://api.apluscharge.in/api';

export const resolveApiUrl = (
  configured: string | undefined,
  isProduction: boolean
): string =>
  (configured?.trim() || (isProduction ? PROD_API_URL : DEV_API_URL)).replace(/\/+$/, '');
