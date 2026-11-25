/* ==========================================================================
   Publish hook → Google Search Console sitemap submission.

   This does NOT request indexing for individual URLs (Google does not allow
   that for ordinary pages). It calls the supported Search Console API method
   `sitemaps.submit`, which asks Google to re-read the sitemap that already
   contains every published post/project.

   Secrets are read only from Vercel environment variables:
     GSC_SERVICE_ACCOUNT_JSON  (required, Hidden/Secret)
     GSC_SITE_URL              (optional, default sc-domain:thomashondochacha.co.ke)
     GSC_SITEMAP_URL           (optional, default https://www.thomashondochacha.co.ke/sitemap.xml)
     GSC_ALLOWED_SITES         (optional, comma-separated extra properties)

   No secret is stored in this repository.
   ========================================================================== */
const crypto = require('crypto');

const SUPABASE_URL = 'https://pumbpmgclnxisfkdaanm.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_dbDtzuRs1Ll8QZDYskQKSg_8LfoeDhD';
const ADMIN_EMAIL = 'thomashondochacha@gmail.com';

const ALLOWED_ORIGINS = new Set([
  'https://www.thomashondochacha.co.ke',
  'https://thomashondochacha.co.ke',
  'https://thomas-hondo-chacha.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

const SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:thomashondochacha.co.ke';
const SITEMAP_URL = process.env.GSC_SITEMAP_URL || 'https://www.thomashondochacha.co.ke/sitemap.xml';
const ALLOWED_SITES = new Set([
  SITE_URL,
  ...String(process.env.GSC_ALLOWED_SITES || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
]);
const SERVICE_ACCOUNT_JSON = process.env.GSC_SERVICE_ACCOUNT_JSON || '';

function b64url(value) {
  return Buffer.from(value).toString('base64url');
}

function parseServiceAccount(raw) {
  const text = String(raw || '').trim();
  if (!text) throw new Error('GSC_SERVICE_ACCOUNT_JSON is empty.');

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    /* A Vercel secret may contain real newlines inside the private_key
       string. Repair only that field, then parse again. */
    const match = text.match(/"private_key"\s*:\s*"([\s\S]*?)"/);
    if (!match) throw new Error('GSC_SERVICE_ACCOUNT_JSON is not valid JSON.');
    const escapedKey = match[1].replace(/\r?\n/g, '\\n');
    const repaired =
      text.slice(0, match.index) +
      `"private_key":"${escapedKey}"` +
      text.slice(match.index + match[0].length);
    try {
      parsed = JSON.parse(repaired);
    } catch (repairError) {
      throw new Error('GSC_SERVICE_ACCOUNT_JSON is not valid JSON.');
    }
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('Service account JSON needs client_email and private_key.');
  }
  parsed.private_key = String(parsed.private_key).replace(/\\n/g, '\n');
  return parsed;
}

async function googleAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }));
  const unsigned = `${header}.${claims}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(unsigned)
    .sign(serviceAccount.private_key)
    .toString('base64url');

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: `${unsigned}.${signature}`
  }).toString();

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!response.ok) throw new Error(`Google OAuth ${response.status}`);

  const data = await response.json().catch(() => ({}));
  if (!data.access_token) throw new Error('Google OAuth returned no access token.');
  return data.access_token;
}

async function submitSitemap(accessToken, siteUrl) {
  const endpoint =
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}` +
    `/sitemaps/${encodeURIComponent(SITEMAP_URL)}`;

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Length': '0'
    }
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Search Console sitemap submission failed (${response.status}).`);
  }
  return true;
}

async function verifyAdmin(req) {
  const auth = String(req.headers.authorization || '');
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
  if (!bearer || bearer === SUPABASE_PUBLISHABLE_KEY) {
    return { ok: false, status: 401, error: 'Admin session expired. Sign in again.' };
  }

  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${bearer}` }
    });
  } catch (error) {
    return { ok: false, status: 503, error: 'Could not verify the admin session.' };
  }
  if (!response.ok) {
    return { ok: false, status: 401, error: 'Admin session expired. Sign in again.' };
  }

  const user = await response.json().catch(() => ({}));
  if (!user || typeof user.email !== 'string' || user.email.toLowerCase() !== ADMIN_EMAIL) {
    return { ok: false, status: 403, error: 'This account is not allowed to submit sitemaps.' };
  }
  return { ok: true };
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8').trim();
  if (!text) return {};
  return JSON.parse(text);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const origin = String(req.headers.origin || '');
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({ ok: false, error: 'Origin not allowed' });
  }
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Use POST.' });
  }

  const auth = await verifyAdmin(req);
  if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error });

  if (!SERVICE_ACCOUNT_JSON) {
    return res.status(503).json({ ok: false, error: 'GSC_SERVICE_ACCOUNT_JSON is not configured in Vercel yet.' });
  }

  let body = {};
  try {
    body = await readBody(req);
  } catch (error) {
    return res.status(400).json({ ok: false, error: 'Invalid JSON body.' });
  }

  const siteUrl = body.siteUrl ? String(body.siteUrl) : SITE_URL;
  if (!ALLOWED_SITES.has(siteUrl)) {
    return res.status(400).json({ ok: false, error: 'siteUrl is not on the allowlist.' });
  }

  try {
    const serviceAccount = parseServiceAccount(SERVICE_ACCOUNT_JSON);
    const accessToken = await googleAccessToken(serviceAccount);
    await submitSitemap(accessToken, siteUrl);
    return res.status(200).json({
      ok: true,
      submitted: true,
      siteUrl,
      feedpath: SITEMAP_URL
    });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error.message });
  }
};
