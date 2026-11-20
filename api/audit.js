/* ==========================================================================
   Free website speed, security & SEO checker.

   Validates every destination before fetching so this endpoint cannot be used
   to probe private networks (SSRF), follows redirects safely, measures
   response time, and returns plain-English checks plus a score. No data stored.
   ========================================================================== */
const dns = require('dns').promises;
const net = require('net');
const crypto = require('crypto');

const TIMEOUT_MS = 10000;
const MAX_REDIRECTS = 5;
const MAX_BODY_BYTES = 1024 * 1024;
const MAX_INPUT_LENGTH = 300;
const ALLOWED_ORIGINS = new Set([
  'https://www.thomashondochacha.co.ke',
  'https://thomashondochacha.co.ke',
  'https://thomas-hondo-chacha.vercel.app'
]);
const UA = 'Mozilla/5.0 (compatible; THC-SiteAudit/1.0; +https://www.thomashondochacha.co.ke)';
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 12;
const hits = new Map();

const COPY = {
  overallGood: 'Good', overallWarn: 'Needs attention', overallBad: 'Poor',
  invalidUrl: 'Enter a valid website address, for example example.co.ke.',
  blockedUrl: 'For safety, this checker cannot scan localhost, private network addresses or cloud metadata addresses.',
  dnsBlocked: 'That website name points to a private or blocked address, so the scan was stopped for safety.',
  dnsFail: 'We could not verify that website address. Check the spelling and try again.',
  timeout: 'The website took too long to respond (over 10 seconds). Visitors may experience the same delay.',
  fetchFail: 'We could not reach that website. It may be offline, blocking our checker, or refusing secure connections.',
  httpError: 'The website returned HTTP {status}, so we could not inspect the page. Fix the server error first.',
  redirectLimit: 'The website redirected too many times. Please check its redirect rules.',
  notHtml: 'The page did not return readable HTML, so the Google basics could not be checked.',
  ssl: {
    label: 'SSL / HTTPS encryption',
    pass: 'Your site uses HTTPS. Information passing between a visitor and your website is encrypted.',
    fail: 'The final address still uses http://. A padlock is missing and browsers may warn visitors that the site is not secure.',
    fix: 'Install an SSL certificate and redirect all http:// traffic to https://.'
  },
  speed: {
    label: 'Server speed',
    fast: 'The homepage responded in {ms} ms. That is fast and comfortable for visitors.',
    average: 'The homepage responded in {ms} ms. That is acceptable, but a faster host or caching would improve it.',
    slow: 'The homepage took {ms} ms to respond. Many visitors will leave before the page appears.',
    fix: 'Use caching, compress images, remove heavy scripts and consider faster hosting or a CDN.'
  },
  hsts: {
    label: 'HSTS protection',
    pass: 'HSTS is enabled. Browsers are told to always use HTTPS on future visits.',
    fail: 'HSTS is missing or too short. Attackers can still try to downgrade a visitor back to insecure http://.',
    fix: 'Add a Strict-Transport-Security header with a max-age of at least 6 months.'
  },
  xfo: {
    label: 'Clickjacking protection',
    pass: 'X-Frame-Options is set. Your pages cannot be silently embedded in another website.',
    fail: 'X-Frame-Options is missing. Another site could frame your pages and trick visitors into clicking hidden buttons.',
    fix: 'Send X-Frame-Options: SAMEORIGIN or DENY from your server.'
  },
  xcto: {
    label: 'Content-type protection',
    pass: 'X-Content-Type-Options is set. Browsers will not guess file types incorrectly.',
    fail: 'X-Content-Type-Options is missing. Browsers may misread files, which can create security problems.',
    fix: 'Send X-Content-Type-Options: nosniff from your server.'
  },
  csp: {
    label: 'Content Security Policy',
    pass: 'A Content Security Policy is present. It limits what scripts and resources may run on the page.',
    fail: 'There is no Content Security Policy. Malicious scripts have more room to run if another weakness appears.',
    fix: 'Add a Content-Security-Policy header that allows only the sources your site really uses.'
  },
  title: {
    label: 'Page title tag',
    pass: 'A page title is present. Search results and browser tabs can describe your site clearly.',
    fail: 'No page title was found. Google may show a weak or automatic title instead of your business name.',
    fix: 'Add a unique <title> tag to every page.'
  },
  description: {
    label: 'Meta description',
    pass: 'A meta description is present. Search engines can show a useful summary under your link.',
    fail: 'No meta description was found. Google will choose its own snippet, which may not sell your service well.',
    fix: 'Add a meta name="description" of about 150 characters to each page.'
  },
  viewport: {
    label: 'Mobile viewport',
    pass: 'A viewport meta tag is present, so the page can scale correctly on phones.',
    fail: 'No viewport tag was found. Mobile visitors may see a tiny desktop layout and leave.',
    fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to every page.'
  }
};

function t(key, values) {
  let node = COPY;
  key.split('.').forEach((part) => { if (node) node = node[part]; });
  let out = typeof node === 'string' ? node : key;
  if (values) {
    out = out.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match
    );
  }
  return out;
}

function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max);
}

function isBlockedIPv4(address) {
  const p = address.split('.').map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const a = p[0], b = p[1];
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 192 && b === 0) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true;
  return false;
}

function isBlockedIPv6(address) {
  const a = address.toLowerCase();
  if (a === '::' || a === '::1') return true;
  if (/^::ffff:/.test(a)) return isBlockedIPv4(a.slice(7));
  if (/^f[cd]/.test(a)) return true;
  if (/^fe[89ab]/.test(a)) return true;
  if (/^ff/.test(a)) return true;
  if (/^2001:db8/.test(a)) return true;
  return false;
}

function addressIsBlocked(address) {
  const raw = String(address || '').replace(/^\[|\]$/g, '');
  if (net.isIPv4(raw)) return isBlockedIPv4(raw);
  if (net.isIPv6(raw)) return isBlockedIPv6(raw);
  return true;
}

async function assertSafeHost(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (!host) throw new Error(t('invalidUrl'));
  if (host === 'localhost' || host.endsWith('.localhost') ||
      host.endsWith('.local') || host.endsWith('.internal') ||
      host === 'metadata.google.internal') {
    throw new Error(t('blockedUrl'));
  }
  if (net.isIP(host) && addressIsBlocked(host)) throw new Error(t('blockedUrl'));

  let addresses;
  try {
    addresses = await dns.lookup(host, { all: true, verbatim: true });
  } catch (error) {
    throw new Error(t('dnsFail'));
  }
  if (!addresses.length || addresses.some((entry) => addressIsBlocked(entry.address))) {
    throw new Error(t('dnsBlocked'));
  }
}

function normaliseInput(value) {
  let raw = clean(value, MAX_INPUT_LENGTH);
  if (!raw) throw new Error(t('invalidUrl'));
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) && !/^https?:\/\//i.test(raw)) {
    throw new Error(t('invalidUrl'));
  }
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  let url;
  try {
    url = new URL(raw);
  } catch (error) {
    throw new Error(t('invalidUrl'));
  }
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || !url.hostname) {
    throw new Error(t('invalidUrl'));
  }
  return url;
}

async function readLimitedBody(response) {
  if (!response.body || !response.body.getReader) return '';
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (total < MAX_BODY_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    const allowed = Math.min(value.length, MAX_BODY_BYTES - total);
    chunks.push(Buffer.from(value.subarray(0, allowed)));
    total += allowed;
    if (allowed < value.length) break;
  }
  try { await reader.cancel(); } catch (error) { /* already closed */ }
  return Buffer.concat(chunks).toString('utf8');
}

async function fetchSafely(startUrl) {
  let current = startUrl;
  const started = process.hrtime.bigint();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      await assertSafeHost(current.hostname);
      let response;
      try {
        response = await fetch(current.toString(), {
          method: 'GET',
          redirect: 'manual',
          signal: controller.signal,
          headers: {
            'User-Agent': UA,
            'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5'
          }
        });
      } catch (error) {
        if (controller.signal.aborted) throw new Error(t('timeout'));
        throw new Error(t('fetchFail'));
      }

      const location = response.headers.get('location');
      if ([301, 302, 303, 307, 308].includes(response.status) && location) {
        if (response.body) {
          try { await response.body.cancel(); } catch (error) { /* noop */ }
        }
        if (hop === MAX_REDIRECTS) throw new Error(t('redirectLimit'));
        let next;
        try {
          next = new URL(location, current);
        } catch (error) {
          throw new Error(t('invalidUrl'));
        }
        if (!/^https?:$/.test(next.protocol)) throw new Error(t('blockedUrl'));
        current = next;
        continue;
      }

      const ms = Math.round(Number(process.hrtime.bigint() - started) / 1e6);
      return { response: response, finalUrl: current, responseTimeMs: ms };
    }
    throw new Error(t('redirectLimit'));
  } finally {
    clearTimeout(timer);
  }
}

function check(id, group, label, status, points, maxPoints, detail, fix) {
  return { id, group, label, status, points, maxPoints, detail, fix };
}

function buildChecks(response, finalUrl, responseTimeMs, html) {
  const headers = response.headers;
  const checks = [];
  const secure = finalUrl.protocol === 'https:';

  checks.push(check('ssl', 'Security', t('ssl.label'), secure ? 'pass' : 'fail',
    secure ? 15 : 0, 15,
    secure ? t('ssl.pass') : t('ssl.fail'),
    secure ? '' : t('ssl.fix')));

  const speedKey = responseTimeMs < 1000 ? 'fast' : (responseTimeMs <= 2500 ? 'average' : 'slow');
  const speedStatus = speedKey === 'fast' ? 'pass' : (speedKey === 'average' ? 'warn' : 'fail');
  const speedPoints = speedKey === 'fast' ? 20 : (speedKey === 'average' ? 12 : 4);
  checks.push(check('speed', 'Speed', t('speed.label'), speedStatus, speedPoints, 20,
    t('speed.' + speedKey, { ms: responseTimeMs }),
    speedKey === 'fast' ? '' : t('speed.fix')));

  const hsts = headers.get('strict-transport-security') || '';
  const hstsAge = parseInt((hsts.match(/max-age\s*=\s*(\d+)/i) || [])[1], 10);
  const hstsOk = secure && Number.isFinite(hstsAge) && hstsAge >= 15552000;
  checks.push(check('hsts', 'Security', t('hsts.label'), hstsOk ? 'pass' : 'fail',
    hstsOk ? 10 : 0, 10,
    hstsOk ? t('hsts.pass') : t('hsts.fail'),
    hstsOk ? '' : t('hsts.fix')));

  const xfo = (headers.get('x-frame-options') || '').toLowerCase();
  const xfoOk = /deny|sameorigin|allow-from/.test(xfo);
  checks.push(check('xfo', 'Security', t('xfo.label'), xfoOk ? 'pass' : 'fail',
    xfoOk ? 10 : 0, 10,
    xfoOk ? t('xfo.pass') : t('xfo.fail'),
    xfoOk ? '' : t('xfo.fix')));

  const xcto = (headers.get('x-content-type-options') || '').toLowerCase();
  const xctoOk = xcto.indexOf('nosniff') !== -1;
  checks.push(check('xcto', 'Security', t('xcto.label'), xctoOk ? 'pass' : 'fail',
    xctoOk ? 10 : 0, 10,
    xctoOk ? t('xcto.pass') : t('xcto.fail'),
    xctoOk ? '' : t('xcto.fix')));

  const csp = headers.get('content-security-policy') || '';
  const cspOk = csp.trim().length > 0;
  checks.push(check('csp', 'Security', t('csp.label'), cspOk ? 'pass' : 'fail',
    cspOk ? 10 : 0, 10,
    cspOk ? t('csp.pass') : t('csp.fail'),
    cspOk ? '' : t('csp.fix')));

  const hasHtml = Boolean(html) && /<html[\s>]/i.test(html);
  const patterns = {
    title: /<title\b[^>]*>\s*\S[\s\S]*?<\/title\s*>/i,
    description: /<meta\b[^>]*\bname\s*=\s*["']description["'][^>]*>/i,
    viewport: /<meta\b[^>]*\bname\s*=\s*["']viewport["'][^>]*>/i
  };
  const points = { title: 8, description: 9, viewport: 8 };
  ['title', 'description', 'viewport'].forEach((id) => {
    const found = hasHtml && patterns[id].test(html);
    checks.push(check(id, 'Google basics', t(id + '.label'), found ? 'pass' : 'fail',
      found ? points[id] : 0, points[id],
      !hasHtml ? t('notHtml') : (found ? t(id + '.pass') : t(id + '.fail')),
      found || !hasHtml ? '' : t(id + '.fix')));
  });

  return checks;
}

function throttle(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = forwarded || (req.socket && req.socket.remoteAddress) || '';
  const key = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 24);
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
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    res.status(403).json({ ok: false, error: 'Origin not allowed' });
    return;
  }
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }
  if (!throttle(req)) {
    res.status(429).json({ ok: false, error: 'Too many scans. Please try again in a few minutes.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (error) { body = null; }
  }
  if (!body || typeof body !== 'object') {
    res.status(400).json({ ok: false, error: 'Invalid request body' });
    return;
  }

  let startUrl;
  try {
    startUrl = normaliseInput(body.url);
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
    return;
  }

  let scan;
  try {
    scan = await fetchSafely(startUrl);
  } catch (error) {
    const validationErrors = [
      t('invalidUrl'), t('blockedUrl'), t('dnsBlocked'), t('dnsFail'), t('redirectLimit')
    ];
    const status = validationErrors.indexOf(error.message) !== -1 ? 400 : 200;
    res.status(status).json({ ok: false, error: error.message });
    return;
  }

  const response = scan.response;
  if (response.status >= 400) {
    res.status(200).json({
      ok: false,
      error: t('httpError', { status: response.status }),
      finalUrl: scan.finalUrl.toString(),
      responseTimeMs: scan.responseTimeMs
    });
    return;
  }

  const html = await readLimitedBody(response);
  const checks = buildChecks(response, scan.finalUrl, scan.responseTimeMs, html);
  const score = checks.reduce((sum, item) => sum + item.points, 0);
  const overall = score >= 80 ? t('overallGood') : (score >= 50 ? t('overallWarn') : t('overallBad'));

  res.status(200).json({
    ok: true,
    scannedUrl: startUrl.toString(),
    finalUrl: scan.finalUrl.toString(),
    domain: scan.finalUrl.hostname,
    responseTimeMs: scan.responseTimeMs,
    httpStatus: response.status,
    checkedAt: new Date().toISOString(),
    score: score,
    overallLabel: overall,
    summary: {
      passed: checks.filter((item) => item.status === 'pass').length,
      warnings: checks.filter((item) => item.status === 'warn').length,
      failed: checks.filter((item) => item.status === 'fail').length,
      total: checks.length
    },
    checks: checks,
    failedIssues: checks.filter((item) => item.status !== 'pass').map((item) => item.label)
  });
};
