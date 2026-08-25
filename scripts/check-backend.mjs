// Backend smoke test. Run: npm run verify:backend
//
// Answers three questions the app itself cannot answer for you:
//   1. Is VITE_API_URL set, and does the API respond at all?
//   2. Does every endpoint the app reads exist and return data to an
//      anonymous visitor? A missing route shows up as a 404, not as an empty
//      list — those are very different bugs and worth separating.
//   3. Are anonymous WRITES actually refused? This is the one that matters.
//      With Supabase RLS gone, the `requireAdmin` middleware is the only thing
//      between the open internet and the CMS, so we assert the denial rather
//      than assuming it.
//
// Read-only apart from the write probes, which are EXPECTED to fail. A probe
// that unexpectedly succeeds is reported as a critical finding.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// --- env -------------------------------------------------------------------
// Vite loads .env itself at build time; this script runs under plain node, so
// parse it here rather than adding a dotenv dependency for one file.
function loadEnv() {
  const env = { ...process.env };
  for (const name of ['.env.local', '.env']) {
    const p = join(root, name);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (!m) continue;
      const [, key, raw] = m;
      // A real process env var always wins over the file.
      if (process.env[key] !== undefined) continue;
      env[key] = raw.trim().replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

const env = loadEnv();
const API_URL = (env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

let failures = 0;
let critical = 0;

const ok = (msg) => console.log(`  ok    ${msg}`);
const bad = (msg) => {
  failures += 1;
  console.log(`  FAIL  ${msg}`);
};
const alarm = (msg) => {
  critical += 1;
  console.log(`  ALARM ${msg}`);
};

const get = async (path) => {
  try {
    const res = await fetch(`${API_URL}${path}`);
    const body = await res.json().catch(() => null);
    return { status: res.status, body };
  } catch (err) {
    return { status: 0, body: null, error: err.message };
  }
};

console.log(`\nChecking ${API_URL}\n`);

// --- 1. reachable ----------------------------------------------------------
console.log('Connectivity');
const health = await get('/health');
if (health.status === 0) {
  bad(`cannot reach the API (${health.error})`);
  console.log(
    `\nStart it with:\n  cd ../change-suture-backend && npm run dev\n` +
      `Or point VITE_API_URL at a deployed instance.\n`
  );
  process.exit(1);
}
if (health.status === 200) ok('GET /health');
else bad(`GET /health returned ${health.status}`);

// --- 2. public reads -------------------------------------------------------
console.log('\nPublic reads');
const listEndpoints = [
  '/blog',
  '/stations',
  '/partners',
  '/statistics',
  '/testimonials',
  '/team-members',
  '/faqs',
  '/services',
  '/journey-milestones',
];

for (const path of listEndpoints) {
  const res = await get(path);
  if (res.status !== 200) {
    bad(`GET ${path} returned ${res.status}`);
  } else if (!Array.isArray(res.body)) {
    bad(`GET ${path} did not return an array`);
  } else if (res.body.length === 0) {
    // Empty is valid but usually means the seed was never run, which looks
    // identical to "broken" from the browser.
    ok(`GET ${path} (empty — run \`npm run seed\` in the backend to populate)`);
  } else {
    ok(`GET ${path} (${res.body.length} rows)`);
  }
}

const settings = await get('/site-settings');
if (settings.status === 200 && settings.body?.pages && settings.body?.sections) {
  ok('GET /site-settings');
} else {
  bad(`GET /site-settings returned ${settings.status}`);
}

// --- 3. anonymous writes must be refused -----------------------------------
console.log('\nAuthorization (these MUST be refused)');
const probes = [
  ['GET', '/admin/blog'],
  ['GET', '/admin/stations'],
  ['GET', '/admin/enquiries/partners'],
  ['GET', '/admin/partners'],
  ['POST', '/admin/faqs'],
  ['POST', '/admin/uploads'],
  ['PATCH', '/admin/site-settings'],
  ['DELETE', '/admin/blog/00000000-0000-0000-0000-000000000000'],
];

for (const [method, path] of probes) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify({}),
    });
    if (res.status === 401 || res.status === 403) {
      ok(`${method} ${path} refused (${res.status})`);
    } else {
      alarm(`${method} ${path} was NOT refused — returned ${res.status}`);
    }
  } catch (err) {
    bad(`${method} ${path} probe failed: ${err.message}`);
  }
}

// A public enquiry POST should be reachable but reject junk at validation,
// which proves the route exists without creating a record.
const enquiryProbe = await fetch(`${API_URL}/enquiries/partner`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'x', email: 'not-an-email', phone: '1' }),
});
if (enquiryProbe.status === 400) ok('POST /enquiries/partner validates input (400)');
else if (enquiryProbe.status === 429) ok('POST /enquiries/partner is rate limited (429)');
else bad(`POST /enquiries/partner returned ${enquiryProbe.status}, expected 400`);

// --- summary ---------------------------------------------------------------
console.log(`\n${'-'.repeat(60)}`);
if (critical > 0) {
  console.log(
    `${critical} CRITICAL finding(s): an /api/admin route answered an anonymous ` +
      `caller. Check requireAuth/requireAdmin on the admin router.`
  );
  process.exit(1);
}
if (failures > 0) {
  console.log(`${failures} check(s) failed.`);
  process.exit(1);
}
console.log('Backend looks healthy.');
