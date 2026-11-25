/* Temporary publishing helper. Removed after the five approved drafts go live. */
const crypto = require('crypto');

const SUPABASE_URL = 'https://pumbpmgclnxisfkdaanm.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const TEMP_TOKEN = process.env.TEMP_PUBLISH_TOKEN || '';

const ALLOWED_FIELDS = [
  'title', 'title_sw', 'slug', 'excerpt', 'excerpt_sw',
  'content', 'content_sw', 'cover_url', 'tags',
  'status', 'published_at', 'seo_title', 'seo_description'
];

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function headers() {
  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: 'Bearer ' + SERVICE_ROLE_KEY,
    'Content-Type': 'application/json'
  };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const auth = req.headers.authorization || '';
  const candidate = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!TEMP_TOKEN || !safeEqual(candidate, TEMP_TOKEN)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  if (!SERVICE_ROLE_KEY) {
    return res.status(503).json({ ok: false, error: 'Service key not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = null; }
  }
  const posts = body && Array.isArray(body.posts) ? body.posts : [];
  if (!posts.length || posts.length > 20) {
    return res.status(400).json({ ok: false, error: 'Provide between 1 and 20 posts' });
  }

  const clean = [];
  for (const post of posts) {
    if (!post || typeof post.slug !== 'string' || !/^[a-z0-9-]+$/.test(post.slug) ||
        typeof post.title !== 'string' || !post.title.trim() ||
        typeof post.content !== 'string' || !post.content.trim()) {
      return res.status(400).json({ ok: false, error: 'Invalid post payload' });
    }
    const row = {};
    for (const key of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(post, key)) row[key] = post[key];
    }
    row.slug = post.slug;
    row.title = post.title.trim();
    row.content = post.content;
    row.status = 'published';
    clean.push(row);
  }

  try {
    const slugs = clean.map((p) => p.slug);
    const encoded = slugs.map((s) => encodeURIComponent(s)).join(',');
    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/posts?select=slug&slug=in.(${encoded})`,
      { headers: headers() }
    );
    if (!existingRes.ok) throw new Error('Existing-slug lookup failed: ' + existingRes.status);
    const existingRows = await existingRes.json();
    const existing = new Set(existingRows.map((r) => r.slug));
    const toInsert = clean.filter((p) => !existing.has(p.slug));

    if (toInsert.length) {
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
        method: 'POST',
        headers: { ...headers(), Prefer: 'return=representation' },
        body: JSON.stringify(toInsert)
      });
      if (!insertRes.ok) {
        const detail = await insertRes.text();
        throw new Error('Insert failed: ' + insertRes.status + ' ' + detail);
      }
    }

    return res.status(200).json({
      ok: true,
      inserted: toInsert.map((p) => p.slug),
      skipped: slugs.filter((s) => existing.has(s))
    });
  } catch (error) {
    console.error('publish-posts error:', error && error.message ? error.message : error);
    return res.status(500).json({ ok: false, error: 'Publishing failed' });
  }
};
