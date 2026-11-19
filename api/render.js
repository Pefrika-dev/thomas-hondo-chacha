/* ==========================================================================
   Server-rendered article and case-study pages.
   Rewrites: /blog/:slug → /api/render?type=post&slug=:slug
             /work/:slug → /api/render?type=project&slug=:slug
   A crawler receives the full article, a unique title, a canonical and
   Article/BreadcrumbList JSON-LD. A visitor still gets the live CMS overlay
   afterwards, so publishing in the admin remains instant.
   If Supabase is unreachable the untouched page shell is served instead, so
   the browser renders the content exactly as it did before this existed.
   ========================================================================== */
const shell = require('./_lib/shell.js');

const SITE = shell.siteUrl;
const SLUG = /^[a-z0-9][a-z0-9-]{0,119}$/i;
const ARROW = '<svg class="icon icon--arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg>';

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const splitList = (value) => String(value || '').split(',').map((s) => s.trim()).filter(Boolean);

const dateLabel = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
};

const paragraphs = (text) =>
  String(text || '').split(/\n{2,}/).filter((p) => p.trim())
    .map((p) => '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>').join('');

const jsonLd = (data) =>
  '<script type="application/ld+json">' + JSON.stringify(data).replace(/</g, '\\u003c') + '</script>';

function breadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

/* Every shell asset is root-relative so the page works at /blog/<slug>. */
const absolutise = (html) => html.replace(/(href|src)="(?!https?:|mailto:|tel:|#|\/|data:)/g, '$1="/');

function head(html, meta) {
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`);
  out = out.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(meta.description)}">`);
  out = out.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${esc(meta.canonical)}" id="canonical-url">`);
  out = out.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(meta.title)}">`);
  out = out.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(meta.description)}">`);
  if (meta.noindex) out = out.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex, follow">');

  const extra = [
    `<meta property="og:url" content="${esc(meta.canonical)}">`,
    `<meta property="og:image" content="${esc(meta.image)}">`,
    `<meta property="og:image:alt" content="${esc(meta.title)}">`,
    `<meta name="twitter:title" content="${esc(meta.title)}">`,
    `<meta name="twitter:description" content="${esc(meta.description)}">`,
    `<meta name="twitter:image" content="${esc(meta.image)}">`,
  ];
  if (meta.published) {
    extra.push(`<meta property="article:published_time" content="${esc(meta.published)}">`);
    extra.push(`<meta property="article:modified_time" content="${esc(meta.modified || meta.published)}">`);
    extra.push('<meta property="article:author" content="Thomas Hondo Chacha">');
  }
  extra.push(jsonLd(meta.structured));
  extra.push(jsonLd(meta.crumb));
  return out.replace('</head>', extra.join('\n  ') + '\n</head>');
}

function crumbText(html, label) {
  return html.replace(/<span aria-current="page"[^>]*>[^<]*<\/span>/, `<span aria-current="page">${esc(label)}</span>`);
}

function withCanonical(html, canonical) {
  return html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${esc(canonical)}" id="canonical-url">`);
}

function moreArticles(currentSlug) {
  const others = shell.posts.filter((p) => p.slug !== currentSlug).slice(0, 3);
  if (!others.length) return '';
  return (
    '<aside class="post-more" aria-label="More articles">' +
    '<h2 class="post-more__title">More from the blog</h2><ul class="post-more__list">' +
    others.map((p) => `<li><a class="text-link" href="${SITE}/blog/${encodeURIComponent(p.slug)}">${esc(p.title)}${ARROW}</a></li>`).join('') +
    '</ul></aside>'
  );
}

const CTA =
  '<div class="post-cta"><p>Need a website or web application for your business?</p>' +
  `<a class="btn" href="/contact.html">Start a project${ARROW}</a>` +
  '<a class="btn btn--ghost" href="https://wa.me/254705023432" target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a></div>';

function renderPost(post) {
  const canonical = `${SITE}/blog/${encodeURIComponent(post.slug)}`;
  const title = post.seo_title || post.title || post.slug;
  const description = post.seo_description || post.excerpt ||
    String(post.content || '').replace(/\s+/g, ' ').trim().slice(0, 155);
  const image = post.cover_url || `${SITE}/assets/images/og-cover.png`;
  const tags = splitList(post.tags);
  const cover = post.cover_url
    ? `<img class="post-cover" src="${esc(post.cover_url)}" alt="${esc(post.title)}" loading="eager" decoding="async">`
    : '';

  const body =
    `<p class="post-meta">${esc(dateLabel(post.published_at))}</p>` +
    `<h1 class="post-title">${esc(post.title)}</h1>` +
    (post.excerpt ? `<p class="post-lede">${esc(post.excerpt)}</p>` : '') +
    cover +
    `<div class="post-content">${paragraphs(post.content)}</div>` +
    (tags.length ? `<div class="post-tags">${tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : '') +
    CTA + moreArticles(post.slug) +
    `<div class="post-back"><a class="text-link" href="/blog.html">Back to all articles${ARROW}</a></div>`;

  let html = absolutise(shell.post);
  html = head(html, {
    title: `${title} — Thomas Hondo Chacha`,
    description,
    canonical,
    image,
    published: post.published_at,
    modified: post.updated_at,
    structured: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description,
      image,
      datePublished: post.published_at,
      dateModified: post.updated_at || post.published_at,
      inLanguage: 'en-KE',
      keywords: tags.join(', '),
      author: { '@type': 'Person', name: 'Thomas Hondo Chacha', url: `${SITE}/about.html` },
      publisher: { '@type': 'Person', name: 'Thomas Hondo Chacha', url: SITE },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    },
    crumb: breadcrumb([
      { name: 'Home', url: `${SITE}/` },
      { name: 'Blog', url: `${SITE}/blog.html` },
      { name: post.title },
    ]),
  });
  html = crumbText(html, post.title);
  return html.replace(/(<article[^>]*data-post[^>]*>)[\s\S]*?(<\/article>)/, `$1\n      ${body}\n    $2`);
}

function renderProject(project) {
  const canonical = `${SITE}/work/${encodeURIComponent(project.slug)}`;
  const title = project.title || project.slug;
  const description = project.summary ||
    String(project.description || '').replace(/\s+/g, ' ').trim().slice(0, 155);
  const image = project.cover_url || `${SITE}/assets/images/og-cover.png`;
  const tech = splitList(project.technologies);
  const cover = project.cover_url
    ? `<img class="project-detail__cover" src="${esc(project.cover_url)}" alt="${esc(title)}" loading="eager" decoding="async">`
    : '';
  const actions =
    (project.demo_url ? `<a class="btn" href="${esc(project.demo_url)}" target="_blank" rel="noopener noreferrer">Open live site</a>` : '') +
    (project.source_url ? `<a class="btn btn--ghost" href="${esc(project.source_url)}" target="_blank" rel="noopener noreferrer">View source</a>` : '');

  const body =
    `<p class="project-detail__meta">${esc(project.category || '')} · ${esc(project.status || '')}</p>` +
    `<h1 class="project-detail__title">${esc(title)}</h1>` +
    (project.summary ? `<p class="project-detail__summary">${esc(project.summary)}</p>` : '') +
    `<div class="project-detail__actions">${actions}</div>` +
    cover +
    `<div class="project-detail__body">${paragraphs(project.description)}</div>` +
    (tech.length ? `<div class="project-detail__tech">${tech.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : '') +
    CTA +
    `<div class="project-detail__back"><a class="text-link" href="/projects.html">Back to all projects${ARROW}</a></div>`;

  let html = absolutise(shell.project);
  html = head(html, {
    title: `${title} — case study by Thomas Hondo Chacha`,
    description,
    canonical,
    image,
    modified: project.updated_at,
    structured: {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: title,
      description,
      url: canonical,
      image,
      dateModified: project.updated_at || project.created_at,
      inLanguage: 'en-KE',
      keywords: tech.join(', '),
      creator: { '@type': 'Person', name: 'Thomas Hondo Chacha', url: `${SITE}/about.html` },
    },
    crumb: breadcrumb([
      { name: 'Home', url: `${SITE}/` },
      { name: 'Projects', url: `${SITE}/projects.html` },
      { name: title },
    ]),
  });
  html = crumbText(html, title);
  return html.replace(/(<article[^>]*data-project[^>]*>)[\s\S]*?(<\/article>)/, `$1\n      ${body}\n    $2`);
}

async function fetchRow(type, slug) {
  const query = type === 'post'
    ? `posts?select=*&status=eq.published&slug=eq.${encodeURIComponent(slug)}&limit=1`
    : `projects?select=*&published=eq.true&slug=eq.${encodeURIComponent(slug)}&limit=1`;
  const response = await fetch(`${shell.supabaseUrl}/rest/v1/${query}`, {
    headers: { apikey: shell.supabaseKey, Authorization: `Bearer ${shell.supabaseKey}` },
  });
  if (!response.ok) throw new Error(`CMS ${response.status}`);
  const rows = await response.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

module.exports = async (req, res) => {
  const type = req.query && req.query.type === 'project' ? 'project' : 'post';
  const slug = String((req.query && req.query.slug) || '');
  const base = type === 'post' ? shell.post : shell.project;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (!SLUG.test(slug)) {
    res.setHeader('X-Robots-Tag', 'noindex, follow');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
    res.status(404).send(absolutise(shell.notFound));
    return;
  }

  try {
    const row = await fetchRow(type, slug);
    if (!row) {
      res.setHeader('X-Robots-Tag', 'noindex, follow');
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
      res.status(404).send(absolutise(shell.notFound));
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
    res.status(200).send(type === 'post' ? renderPost(row) : renderProject(row));
  } catch (error) {
    /* Supabase unavailable: serve the shell so the browser CMS bridge renders
       the page exactly as it did before server rendering existed. The canonical
       still points at the clean URL so a transient outage cannot create a
       duplicate-content signal. */
    const clean = `${SITE}/${type === 'post' ? 'blog' : 'work'}/${encodeURIComponent(slug)}`;
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30');
    res.status(200).send(withCanonical(absolutise(base), clean));
  }
};
