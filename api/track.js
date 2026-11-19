/* ==========================================================================
   First-party event collector.
   Receives one small JSON payload from js/telemetry.js and appends a row to
   Supabase. It never reads or returns visitor data, and it degrades silently:
   if the table has not been created yet, or Supabase is down, the visitor's
   page is unaffected.

   Deliberately not stored: raw IP, full user agent, cookies, form contents.
   ========================================================================== */
const crypto = require('crypto');
const shell = require('./_lib/shell.js');

const EVENTS = new Set([
  'page_view',
  'whatsapp_click',
  'cta_click',
  'contact_click',
  'social_click',
  'enquiry_submit',
  'chat_open',
]);

const MAX_BODY = 4096;
const LIMITS = {
  path: 300,
  referrer_host: 200,
  source: 120,
  medium: 120,
  campaign: 120,
  placement: 120,
  lang: 12,
  device: 20,
  session_id: 64,
};

/* Best-effort in-memory throttle. Serverless instances are recycled, so this
   is a speed bump against accidental loops, not a security control. */
const hits = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 120;

function text(value, max) {
  if (typeof value !== 'string') return null;
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return clean ? clean.slice(0, max) : null;
}

function visitorHash(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = forwarded || (req.socket && req.socket.remoteAddress) || '';
  const agent = String(req.headers['user-agent'] || '');
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ANALYTICS_SALT || 'thc-analytics-v1';
  return crypto.createHash('sha256').update(`${ip}|${agent}|${day}|${salt}`).digest('hex').slice(0, 32);
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') {
    try { return Promise.resolve(JSON.parse(req.body)); } catch { return Promise.resolve(null); }
  }
  return new Promise((resolve) => {
    let raw = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) { resolve(null); req.destroy(); return; }
      raw += chunk;
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch { resolve(null); }
    });
    req.on('error', () => resolve(null));
  });
}

function allow(key) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(key, { start: now, count: 1 });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_PER_WINDOW;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false });
    return;
  }

  const length = Number(req.headers['content-length'] || 0);
  if (length > MAX_BODY) {
    res.status(413).json({ ok: false });
    return;
  }

  const body = await readBody(req);
  if (!body || typeof body !== 'object' || !EVENTS.has(body.event)) {
    res.status(400).json({ ok: false });
    return;
  }

  const path = text(body.path, LIMITS.path);
  if (!path || path[0] !== '/') {
    res.status(400).json({ ok: false });
    return;
  }

  const hash = visitorHash(req);
  if (!allow(hash)) {
    res.status(429).json({ ok: false });
    return;
  }

  const row = {
    event: body.event,
    path: path.split('?')[0].split('#')[0],
    referrer_host: text(body.referrer_host, LIMITS.referrer_host),
    source: text(body.source, LIMITS.source),
    medium: text(body.medium, LIMITS.medium),
    campaign: text(body.campaign, LIMITS.campaign),
    placement: text(body.placement, LIMITS.placement),
    lang: text(body.lang, LIMITS.lang),
    device: text(body.device, LIMITS.device),
    session_id: text(body.session_id, LIMITS.session_id),
    visitor_hash: hash,
    metadata: {},
  };

  /* Never let an analytics failure surface to the visitor. */
  try {
    const response = await fetch(`${shell.supabaseUrl}/rest/v1/analytics_events`, {
      method: 'POST',
      headers: {
        apikey: shell.supabaseKey,
        Authorization: `Bearer ${shell.supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!response.ok) {
      console.warn('analytics insert rejected', response.status);
    }
  } catch (error) {
    console.warn('analytics insert failed', error && error.message);
  }

  res.status(204).end();
};
