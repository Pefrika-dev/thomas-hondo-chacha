/* ==========================================================================
   Daily Lead Radar — legitimate public-source lead discovery.

   Source: OpenStreetMap via Nominatim's public search endpoint (open data,
   free, no API key). Optional phone/email come only from the same public
   listing or the business's own public website.

   Rules enforced here:
   * admin session or Vercel cron secret required
   * maximum 5 saved leads per East-Africa day
   * phone required; email is never invented
   * every lead keeps its public source URL
   * dedupe by source + OpenStreetMap object id
   * no scraping Google, Facebook, or private/prohibited directories
   ========================================================================== */
const crypto = require('crypto');
const dns = require('dns').promises;
const net = require('net');

const SUPABASE_URL = 'https://pumbpmgclnxisfkdaanm.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_dbDtzuRs1Ll8QZDYskQKSg_8LfoeDhD';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || '';
const ADMIN_EMAIL = 'thomashondochacha@gmail.com';

const ALLOWED_ORIGINS = new Set([
  'https://www.thomashondochacha.co.ke',
  'https://thomashondochacha.co.ke',
  'https://thomas-hondo-chacha.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_UA = 'THC-LeadRadar/1.0 (+https://www.thomashondochacha.co.ke; thomashondochacha@gmail.com)';

const SEARCHES = [
  { label: 'Mombasa', query: 'hotel Mombasa Kenya' },
  { label: 'Nairobi', query: 'hotel Nairobi Kenya' },
  { label: 'Nakuru', query: 'hotel Nakuru Kenya' },
  { label: 'Kisumu', query: 'hotel Kisumu Kenya' },
  { label: 'Eldoret', query: 'hotel Eldoret Kenya' },
  { label: 'Thika', query: 'hotel Thika Kenya' },
  { label: 'Kisii', query: 'hotel Kisii Kenya' },
  { label: 'Migori', query: 'hotel Migori Kenya' },
  { label: 'Mombasa', query: 'restaurants in Mombasa Kenya' },
  { label: 'Nairobi', query: 'restaurants in Nairobi Kenya' },
  { label: 'Kisumu', query: 'restaurants in Kisumu Kenya' },
  { label: 'Mombasa', query: 'pharmacy Mombasa Kenya' },
  { label: 'Kakamega', query: 'pharmacy Kakamega Kenya' },
  { label: 'Migori', query: 'pharmacy Migori Kenya' }
];

const MAX_LEADS_PER_DAY = 5;
const MAX_SEARCH_REQUESTS = 5;
const MAX_CONTACT_LOOKUPS = 12;
const NOMINATIM_DELAY_MS = 1100;
const CONTACT_TIMEOUT_MS = 4000;
const UA = NOMINATIM_UA;

const SOURCE_ID_PREFIX = { node: 'n', way: 'w', relation: 'r' };
const SOCIAL_HOSTS = new Set([
  'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'tiktok.com',
  'wa.me', 'api.whatsapp.com', 'linktr.ee'
]);
const GENERIC_NAMES = new Set([
  'hotel', 'hotels', 'lodge', 'restaurant', 'restaurants', 'pharmacy', 'pharmacies',
  'hardware', 'shop', 'shops', 'guest house', 'guesthouse', 'bar', 'cafe', 'supermarket',
  'school', 'clinic', 'hospital', 'office', 'business', 'company', 'limited', 'ltd'
]);

function isGenericName(value) {
  const name = String(value || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  return name.length < 3 || GENERIC_NAMES.has(name);
}

function isSocialHost(hostname) {
  const host = String(hostname || '').toLowerCase();
  for (const domain of SOCIAL_HOSTS) {
    if (host === domain || host.endsWith('.' + domain)) return true;
  }
  return false;
}

const TYPE_LABELS = {
  'hardware': 'Hardware shop',
  'supermarket': 'Supermarket',
  'convenience': 'Convenience shop',
  'clothes': 'Clothing shop',
  'shoes': 'Shoe shop',
  'beauty': 'Beauty shop',
  'hairdresser': 'Salon / barber',
  'restaurant': 'Restaurant',
  'cafe': 'Cafe',
  'fast food': 'Fast food',
  'pharmacy': 'Pharmacy',
  'bank': 'Bank',
  'hotel': 'Hotel',
  'guest house': 'Guesthouse',
  'fuel': 'Fuel station',
  'school': 'School',
  'college': 'College',
  'hospital': 'Hospital / clinic',
  'clinic': 'Clinic',
  'office': 'Office',
  'accountant': 'Accountancy office',
  'lawyer': 'Legal office',
  'carpenter': 'Carpentry',
  'electrician': 'Electrical services',
  'metal construction': 'Metal works',
  'tailor': 'Tailoring'
};

function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function nairobiDate() {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const pick = (type) => (parts.find((part) => part.type === type) || {}).value || '';
    return `${pick('year')}-${pick('month')}-${pick('day')}`;
  } catch (error) {
    return new Date().toISOString().slice(0, 10);
  }
}

function dayOfYear() {
  const date = new Date();
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000);
}

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    res.status(403).json({ ok: false, error: 'Origin not allowed' });
    return false;
  }
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Cron-Secret');
  return true;
}

async function verifyAdmin(req) {
  const auth = String(req.headers.authorization || '');
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
  const cronHeader = String(req.headers['x-cron-secret'] || '').trim();

  if (!bearer && !cronHeader) {
    return { ok: false, status: 401, error: 'Sign in to the admin first.' };
  }

  if (CRON_SECRET && (safeEqual(bearer, CRON_SECRET) || safeEqual(cronHeader, CRON_SECRET))) {
    return { ok: true, cron: true, token: '' };
  }

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

  let user;
  try { user = await response.json(); } catch (error) { return { ok: false, status: 401, error: 'Invalid admin session.' }; }
  if (!user || typeof user.email !== 'string' || user.email.toLowerCase() !== ADMIN_EMAIL) {
    return { ok: false, status: 403, error: 'This account is not allowed to scan leads.' };
  }
  return { ok: true, cron: false, token: bearer };
}

function writeHeaders(token) {
  const useService = Boolean(SERVICE_ROLE_KEY);
  const key = useService ? SERVICE_ROLE_KEY : SUPABASE_PUBLISHABLE_KEY;
  const auth = useService ? SERVICE_ROLE_KEY : token;
  return {
    apikey: key,
    Authorization: `Bearer ${auth}`,
    'Content-Type': 'application/json'
  };
}

async function countToday(date, token) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/outreach_leads?select=id&scan_date=eq.${encodeURIComponent(date)}&limit=100`,
    { headers: writeHeaders(token) }
  );
  if (!response.ok) throw new Error(`Supabase count failed (${response.status})`);
  const rows = await response.json();
  return Array.isArray(rows) ? rows.length : 0;
}

async function existingSourceIds(ids, token) {
  const found = new Set();
  if (!ids.length) return found;
  const list = ids.map((id) => encodeURIComponent(id)).join(',');
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/outreach_leads?select=source_id&source_id=in.(${list})&limit=500`,
    { headers: writeHeaders(token) }
  );
  if (!response.ok) throw new Error(`Supabase dedupe lookup failed (${response.status})`);
  const rows = await response.json();
  if (Array.isArray(rows)) rows.forEach((row) => found.add(row.source_id));
  return found;
}

async function existingPhones(phones, token) {
  const found = new Set();
  if (!phones.length) return found;
  const list = phones.map((phone) => encodeURIComponent(phone)).join(',');
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/outreach_leads?select=phone&phone=in.(${list})&limit=500`,
    { headers: writeHeaders(token) }
  );
  if (!response.ok) throw new Error(`Supabase phone dedupe lookup failed (${response.status})`);
  const rows = await response.json();
  if (Array.isArray(rows)) rows.forEach((row) => { if (row.phone) found.add(row.phone); });
  return found;
}

async function insertLeads(leads, token) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/outreach_leads?on_conflict=source,source_id`, {
    method: 'POST',
    headers: Object.assign(writeHeaders(token), {
      Prefer: 'return=representation,resolution=ignore-duplicates'
    }),
    body: JSON.stringify(leads)
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error('Outreach lead insert failed:', response.status, detail.slice(0, 300));
    throw new Error('Could not save the leads.');
  }
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

/* ---------- public website contact lookup, SSRF-safe ---------- */
function isBlockedIPv4(address) {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const a = parts[0], b = parts[1];
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 192 && b === 0) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  return a >= 224;
}

function isBlockedIPv6(address) {
  const value = address.toLowerCase();
  if (value === '::' || value === '::1') return true;
  if (/^::ffff:/.test(value)) return isBlockedIPv4(value.slice(7));
  if (/^f[cd]/.test(value)) return true;
  if (/^fe[89ab]/.test(value)) return true;
  if (/^ff/.test(value)) return true;
  return /^2001:db8/.test(value);
}

function addressIsBlocked(address) {
  const raw = String(address || '').replace(/^\[|\]$/g, '');
  if (net.isIPv4(raw)) return isBlockedIPv4(raw);
  if (net.isIPv6(raw)) return isBlockedIPv6(raw);
  return true;
}

async function assertSafeHost(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (!host) throw new Error('Invalid website');
  if (host === 'localhost' || host.endsWith('.localhost') ||
      host.endsWith('.local') || host.endsWith('.internal') ||
      host === 'metadata.google.internal') {
    throw new Error('Blocked website');
  }
  if (net.isIP(host) && addressIsBlocked(host)) throw new Error('Blocked website');
  let addresses;
  try {
    addresses = await dns.lookup(host, { all: true, verbatim: true });
  } catch (error) {
    throw new Error('Website not found');
  }
  if (!addresses.length || addresses.some((entry) => addressIsBlocked(entry.address))) {
    throw new Error('Blocked website');
  }
}

function normaliseWebsite(value) {
  let raw = clean(value, 300).replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^www\./i, '');
  raw = raw.split(/[/?#]/)[0];
  if (!raw || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(raw)) throw new Error('Invalid website');
  const url = new URL('https://' + raw + '/');
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || !url.hostname) {
    throw new Error('Invalid website');
  }
  if (isSocialHost(url.hostname)) throw new Error('Social profile only');
  return url;
}

async function readLimitedBody(response, maxBytes) {
  if (!response.body || !response.body.getReader) return '';
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    const allowed = Math.min(value.length, maxBytes - total);
    chunks.push(Buffer.from(value.subarray(0, allowed)));
    total += allowed;
    if (allowed < value.length) break;
  }
  try { await reader.cancel(); } catch (error) { /* already closed */ }
  return Buffer.concat(chunks).toString('utf8');
}

function extractEmail(html) {
  const text = html.replace(/&#64;/gi, '@').replace(/\[at\]/gi, '@');
  const pattern = /(?:mailto:\s*)?([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
  const rejected = [
    'example.', 'domain.', 'yourdomain', 'email.com', 'test.com', 'sentry.',
    'noreply', 'no-reply', 'donotreply', 'wixpress', 'godaddy', 'localhost'
  ];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const email = match[1].toLowerCase().replace(/[.,;)]+$/, '');
    if (email.length > 200 || email.indexOf('..') !== -1) continue;
    if (rejected.some((word) => email.indexOf(word) !== -1)) continue;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) continue;
    return email;
  }
  return '';
}

function extractPhone(html) {
  const telLinks = html.match(/href\s*=\s*["']tel:[^"']+/gi) || [];
  for (const link of telLinks) {
    const phone = normalisePhone(link.replace(/^.*tel:/i, ''));
    if (phone) return phone;
  }
  const text = html.replace(/\s+/g, ' ');
  const pattern = /(?:\+?254|0)[17][\s().-]?\d{3}[\s().-]?\d{3}/g;
  const matches = text.match(pattern) || [];
  for (const candidate of matches) {
    const phone = normalisePhone(candidate);
    if (phone) return phone;
  }
  return '';
}

async function fetchPublicContact(website) {
  let url;
  try { url = normaliseWebsite(website); } catch (error) { return { phone: '', email: '', source: '' }; }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONTACT_TIMEOUT_MS);
  try {
    for (let hop = 0; hop <= 3; hop += 1) {
      await assertSafeHost(url.hostname);
      let response;
      try {
        response = await fetch(url.toString(), {
          method: 'GET', redirect: 'manual', signal: controller.signal,
          headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5' }
        });
      } catch (error) {
        break;
      }
      const location = response.headers.get('location');
      if ([301, 302, 303, 307, 308].includes(response.status) && location) {
        if (response.body) { try { await response.body.cancel(); } catch (error) { /* noop */ } }
        let next;
        try { next = new URL(location, url); } catch (error) { break; }
        if (!/^https?:$/.test(next.protocol)) break;
        url = next;
        continue;
      }
      if (!response.ok) break;
      const html = await readLimitedBody(response, 160 * 1024);
      return { phone: extractPhone(html), email: extractEmail(html), source: url.toString() };
    }
  } catch (error) {
    /* A failed public lookup never blocks the lead. */
  } finally {
    clearTimeout(timer);
  }
  return { phone: '', email: '', source: '' };
}

/* ---------- Nominatim / OpenStreetMap discovery ---------- */
function normalisePhone(value) {
  const parts = clean(value, 160).split(/[;,/]/);
  for (const part of parts) {
    const digits = part.replace(/[^\d+]/g, '').replace(/\+/g, '');
    let local = '';
    if (/^0[17]\d{8}$/.test(digits)) local = '254' + digits.slice(1);
    else if (/^254[17]\d{8}$/.test(digits)) local = digits;
    else if (/^[17]\d{8}$/.test(digits)) local = '254' + digits;
    else continue;
    return '+' + local;
  }
  return '';
}

function validEmail(value) {
  const email = clean(value, 200).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : '';
}

function locationOf(item, search) {
  const address = item.address || {};
  const bits = [];
  const add = (value) => {
    const text = clean(value, 80);
    if (text && bits.indexOf(text) === -1) bits.push(text);
  };
  add(address.road);
  add(address.suburb || address.neighbourhood || address.quarter);
  add(address.city || address.town || address.village);
  add(address.state);
  if (!bits.length || bits[bits.length - 1] !== 'Kenya') add('Kenya');
  return bits.join(', ').slice(0, 200) || search.label;
}

function businessType(item) {
  const tags = item.extratags || {};
  const category = clean(item.category, 40).toLowerCase();
  const genericCategory = ['amenity', 'shop', 'tourism', 'office', 'craft', 'healthcare', 'leisure', 'building'].indexOf(category) !== -1;
  const raw = clean(
    tags.shop || tags.amenity || tags.office || tags.craft || tags.tourism || tags.healthcare ||
    (category && !genericCategory ? category : '') || item.type,
    80
  ).replace(/_/g, ' ');
  if (!raw || raw === 'yes' || raw === 'no') return 'Local business';
  if (TYPE_LABELS[raw]) return TYPE_LABELS[raw];
  return raw.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function applyService(lead) {
  if (!lead.website) {
    lead.signal = 'Public listing shows a phone number but no website.';
    lead.service_type = 'Simple website';
    lead.service_opportunity = 'No public website is listed in the source. A small mobile-first site with WhatsApp enquiry buttons would make this business easier to find and contact.';
  } else if (!lead.email) {
    lead.signal = 'Public listing has a website but no public email address.';
    lead.service_type = 'Contact page';
    lead.service_opportunity = 'A website is listed publicly, but no public email was found. Add a clear contact page and enquiry routing so customers can reach the business directly.';
  } else {
    lead.signal = 'Public listing has a website and a public email address.';
    lead.service_type = 'Website enquiry flow';
    lead.service_opportunity = 'A website and public email are listed. Improve the enquiry flow so messages reach the owner quickly and enquiries are not missed.';
  }
  return lead;
}

function leadScore(lead) {
  return (lead.phone ? 4 : 0) + (lead.email ? 2 : 0) + (lead.website ? 1 : 0);
}

function buildCandidate(item, search, date) {
  if (!item || !SOURCE_ID_PREFIX[item.osm_type] || !item.osm_id) return null;
  const tags = item.extratags || {};
  const businessName = clean(item.name, 180);
  if (!businessName || isGenericName(businessName)) return null;

  const prefix = SOURCE_ID_PREFIX[item.osm_type];
  const sourceId = `${prefix}-${item.osm_id}`;
  const sourceUrl = `https://www.openstreetmap.org/${item.osm_type}/${item.osm_id}`;
  const phone = normalisePhone(tags.phone || tags['contact:phone']);
  const email = validEmail(tags.email || tags['contact:email']);
  let website = '';
  try { website = normaliseWebsite(tags.website || tags['contact:website']).toString(); } catch (error) { /* keep blank */ }

  const lead = {
    scan_date: date,
    source: 'openstreetmap',
    source_id: sourceId,
    source_url: sourceUrl,
    business_name: businessName,
    phone: phone,
    phone_source_url: phone ? sourceUrl : '',
    email: email,
    email_source_url: email ? sourceUrl : '',
    website: website,
    location: locationOf(item, search),
    business_type: businessType(item),
    service_type: '',
    service_opportunity: '',
    signal: '',
    status: 'new',
    notes: ''
  };
  return applyService(lead);
}

async function fetchNominatim(search) {
  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', search.query);
  url.searchParams.set('limit', '40');
  url.searchParams.set('extratags', '1');
  url.searchParams.set('addressdetails', '1');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': NOMINATIM_UA, 'Accept': 'application/json' },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Nominatim returned ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Nominatim returned unexpected data');
    return data;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async (req, res) => {
  if (!cors(req, res)) return;
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const isGet = req.method === 'GET';
  const isPost = req.method === 'POST';
  if (!isGet && !isPost) {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const auth = await verifyAdmin(req);
  if (!auth.ok) {
    res.status(auth.status).json({ ok: false, error: auth.error });
    return;
  }
  /* Vercel Cron calls this route with GET. A browser must always use POST. */
  if (isGet && !auth.cron) {
    res.status(405).json({ ok: false, error: 'Use the Scan today button.' });
    return;
  }
  if (auth.cron && !SERVICE_ROLE_KEY) {
    res.status(503).json({ ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY is not configured for scheduled scans.' });
    return;
  }

  const date = nairobiDate();

  try {
    const todayCount = await countToday(date, auth.token);
    if (todayCount >= MAX_LEADS_PER_DAY) {
      res.status(200).json({
        ok: true, added: 0, todayCount: todayCount, capReached: true, leads: [],
        message: `Today's ${MAX_LEADS_PER_DAY} leads are already saved.`
      });
      return;
    }

    const start = dayOfYear() % SEARCHES.length;
    const scannedSearches = [];
    const seen = new Set();
    const candidates = [];

    for (let i = 0; i < SEARCHES.length && scannedSearches.length < MAX_SEARCH_REQUESTS && candidates.length < 200; i += 1) {
      const search = SEARCHES[(start + i) % SEARCHES.length];
      if (scannedSearches.length) await sleep(NOMINATIM_DELAY_MS);
      let items;
      try {
        items = await fetchNominatim(search);
      } catch (error) {
        continue;
      }
      scannedSearches.push(search.label + ': ' + search.query);
      for (const item of items) {
        if (!item || !item.osm_type || !item.osm_id) continue;
        const key = `${item.osm_type}-${item.osm_id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const lead = buildCandidate(item, search, date);
        if (lead) candidates.push(lead);
      }
    }

    if (!candidates.length) {
      res.status(200).json({
        ok: true, added: 0, todayCount: todayCount, capReached: false, leads: [], scannedSearches: [],
        message: 'No public listings were returned by today’s rotated sources. Saved leads remain available below. Try again tomorrow.'
      });
      return;
    }

    candidates.sort((a, b) => leadScore(b) - leadScore(a));
    const existing = await existingSourceIds(candidates.map((lead) => lead.source_id), auth.token);
    const existingPhoneSet = await existingPhones(
      candidates.map((lead) => lead.phone).filter(Boolean),
      auth.token
    );

    const seenPhones = new Set();
    const seenNames = new Set();
    const fresh = [];
    for (const lead of candidates) {
      if (existing.has(lead.source_id)) continue;
      if (lead.phone) {
        if (existingPhoneSet.has(lead.phone) || seenPhones.has(lead.phone)) continue;
        seenPhones.add(lead.phone);
      } else {
        const nameKey = lead.business_name.toLowerCase() + '|' + lead.location.toLowerCase();
        if (seenNames.has(nameKey)) continue;
        seenNames.add(nameKey);
      }
      fresh.push(lead);
    }
    const pool = fresh.slice(0, 30);

    if (!pool.length) {
      res.status(200).json({
        ok: true, added: 0, todayCount: todayCount, capReached: false, leads: [], scannedSearches: [],
        message: 'Today’s rotated sources contain no new phone-verified leads. Saved leads remain available below. Try again tomorrow.'
      });
      return;
    }

    let lookups = 0;
    for (const lead of pool) {
      if (lookups >= MAX_CONTACT_LOOKUPS || !lead.website || (lead.phone && lead.email)) continue;
      const found = await fetchPublicContact(lead.website);
      if (found.phone && !lead.phone) {
        lead.phone = found.phone;
        lead.phone_source_url = found.source;
      }
      if (found.email && !lead.email) {
        lead.email = found.email;
        lead.email_source_url = found.source;
      }
      applyService(lead);
      lookups += 1;
    }

    const usable = pool.filter((lead) => lead.phone)
      .sort((a, b) => leadScore(b) - leadScore(a))
      .slice(0, MAX_LEADS_PER_DAY - todayCount);

    if (!usable.length) {
      res.status(200).json({
        ok: true, added: 0, todayCount: todayCount, capReached: false, leads: [], scannedSearches: scannedSearches,
        message: 'No new phone-verified lead was found in today’s rotated sources. Saved leads remain available below. Try again tomorrow.'
      });
      return;
    }

    const inserted = await insertLeads(usable, auth.token);
    const added = inserted.length;

    res.status(200).json({
      ok: true,
      added: added,
      todayCount: todayCount + added,
      capReached: todayCount + added >= MAX_LEADS_PER_DAY,
      scannedSearches: scannedSearches,
      leads: inserted,
      message: added
        ? `Saved ${added} new public lead${added === 1 ? '' : 's'}. Review each source before sending anything.`
        : 'No new leads were saved after deduplication.'
    });
  } catch (error) {
    console.error('Daily Lead Radar failed:', error && error.message);
    res.status(500).json({ ok: false, error: 'The lead scan failed. Please try again.' });
  }
};
