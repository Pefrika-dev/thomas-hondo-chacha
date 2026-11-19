/* ==========================================================================
   Applies supabase/analytics.sql to the live project.

   Two ways to run it:
     1. SUPABASE_ACCESS_TOKEN in .env.local  (Management API, used here)
     2. paste supabase/analytics.sql into the Supabase SQL editor

   The token is read from .env.local, never printed, and .env.local is
   gitignored. Revoke the token in Supabase when you are done with it.

   Usage: node scripts/apply-analytics.mjs
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const REF = 'pumbpmgclnxisfkdaanm';
const SQL = fs.readFileSync(path.join(ROOT, 'supabase', 'analytics.sql'), 'utf8');
const SHELL = fs.readFileSync(path.join(ROOT, 'api', '_lib', 'shell.js'), 'utf8');
const SUPABASE_URL = SHELL.match(/"supabaseUrl":\s*"([^"]+)"/)[1];
const PUBLISHABLE = SHELL.match(/"supabaseKey":\s*"([^"]+)"/)[1];

function readEnv() {
  const file = path.join(ROOT, '.env.local');
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

async function tableExists() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/analytics_events?select=id&limit=1`, {
    headers: { apikey: PUBLISHABLE, Authorization: `Bearer ${PUBLISHABLE}` },
  });
  const body = await res.text();
  if (res.status === 200) return { exists: true };
  if (/PGRST205|42P01|does not exist/.test(body)) return { exists: false };
  return { exists: false, unexpected: `${res.status} ${body.slice(0, 200)}` };
}

const env = readEnv();
const token = env.SUPABASE_ACCESS_TOKEN;

if (!token) {
  console.error('No SUPABASE_ACCESS_TOKEN found in .env.local.');
  console.error('');
  console.error('Either:');
  console.error('  a) Supabase dashboard -> SQL Editor -> paste supabase/analytics.sql -> Run');
  console.error('  b) create a token at https://supabase.com/dashboard/account/tokens');
  console.error('     then add this line to .env.local (gitignored):');
  console.error('     SUPABASE_ACCESS_TOKEN=sbp_...');
  console.error('     and run this script again. It never prints the token.');
  process.exit(1);
}

console.log(`Applying supabase/analytics.sql to project ${REF} ...`);

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: SQL }),
});

const text = await res.text();
console.log(`management API: ${res.status}`);
if (!res.ok) {
  console.error(text.slice(0, 600));
  process.exit(1);
}

// Give PostgREST a moment to refresh its schema cache, then prove the table is live.
let state = await tableExists();
for (let i = 0; i < 6 && !state.exists; i++) {
  await new Promise((r) => setTimeout(r, 2000));
  state = await tableExists();
}

if (state.exists) {
  console.log('analytics_events is live and readable by the API.');
} else {
  console.log('SQL accepted, but the table is not visible yet.');
  if (state.unexpected) console.log('response:', state.unexpected);
  process.exit(1);
}
