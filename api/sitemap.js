/* ==========================================================================
   Live sitemap endpoint.
   Rewrite: /sitemap.xml → /api/sitemap

   Queries the published CMS rows on every request (through Vercel's CDN cache),
   so a post published in the admin appears in the sitemap without a rebuild.
   If Supabase is unreachable, the build-time snapshot in shell.js is used so
   /sitemap.xml never returns an error or an empty document.
   ========================================================================== */
const shell = require('./_lib/shell.js');

const SITE = shell.siteUrl;

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const dayStamp = (value, fallback) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toISOString().slice(0, 10)
    : fallback;
};

async function rows(query) {
  const response = await fetch(`${shell.supabaseUrl}/rest/v1/${query}`, {
    headers: { apikey: shell.supabaseKey, Authorization: `Bearer ${shell.supabaseKey}` },
  });
  if (!response.ok) throw new Error(`CMS ${response.status}`);
  return response.json();
}

function xml(posts, projects, today) {
  const staticPages = [
    ['/', '1.0', 'weekly'],
    ['/services.html', '0.9', 'monthly'],
    ['/projects.html', '0.9', 'weekly'],
    ['/blog.html', '0.8', 'weekly'],
    ['/about.html', '0.7', 'monthly'],
    ['/contact.html', '0.8', 'monthly'],
  ];

  const entries = staticPages.map(([loc, priority, freq]) => ({
    loc: SITE + loc, lastmod: today, priority, freq,
  }));

  posts.forEach((post) => entries.push({
    loc: `${SITE}/blog/${encodeURIComponent(post.slug)}`,
    lastmod: dayStamp(post.updated_at || post.published_at, today),
    priority: '0.8', freq: 'monthly',
  }));

  projects.forEach((project) => entries.push({
    loc: `${SITE}/work/${encodeURIComponent(project.slug)}`,
    lastmod: dayStamp(project.updated_at || project.created_at, today),
    priority: '0.7', freq: 'monthly',
  }));

  const body = entries.map((e) =>
    `  <url>\n    <loc>${esc(e.loc)}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n` +
    `    <changefreq>${e.freq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
  ).join('\n');

  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<!-- Generated at request time by api/sitemap.js from published CMS rows. -->\n' +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

module.exports = async (req, res) => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  let posts;
  let projects;
  let live = true;

  try {
    const [postRows, projectRows] = await Promise.all([
      rows('posts?select=slug,published_at,updated_at&status=eq.published&order=published_at.desc'),
      rows('projects?select=slug,created_at,updated_at&published=eq.true&order=sort_order.asc,created_at.desc'),
    ]);
    posts = postRows.filter((p) => p.slug && (!p.published_at || new Date(p.published_at) <= now));
    projects = projectRows.filter((p) => p.slug);
  } catch (error) {
    live = false;
    posts = shell.posts || [];
    projects = shell.projects || [];
  }

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
  res.setHeader('X-Robots-Tag', 'all');
  if (!live) res.setHeader('X-Sitemap-Source', 'build-snapshot');
  res.status(200).send(xml(posts, projects, today));
};
