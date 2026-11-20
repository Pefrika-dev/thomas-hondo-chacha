/* ==========================================================================
   Thomas Hondo Chacha — build step
   Reads the published CMS rows and emits the parts a crawler cannot execute:
     1. api/_lib/shell.js   page shells + public CMS config for the renderer
     2. blog.html           a server-rendered article list between the markers
     3. projects.html       a server-rendered case-study list between the markers
   /sitemap.xml is served live by api/sitemap.js (rewrite in vercel.json), so
   newly published posts appear without a rebuild.
   The browser CMS overlay still runs afterwards, so publishing in the admin
   stays instant for visitors. Run: node build.mjs
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { optimiseImageUrl } = require('./lib/images.js');

const root = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://www.thomashondochacha.co.ke';

const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, text) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text, 'utf8');
};

/* The publishable key is public by design (RLS-protected, already shipped to
   every browser in js/cms-public.js). Read it from that one source so the
   server and the client can never drift apart. */
const bridge = read('js/cms-public.js');
const supabaseUrl = (bridge.match(/var SUPABASE_URL = "([^"]+)"/) || [])[1];
const supabaseKey = (bridge.match(/var SUPABASE_KEY = "([^"]+)"/) || [])[1];
if (!supabaseUrl || !supabaseKey) throw new Error('js/cms-public.js: cannot read the public CMS config');

async function rows(query) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  });
  if (!response.ok) throw new Error(`CMS ${query} → ${response.status}`);
  return response.json();
}

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

const excerptOf = (post) =>
  post.excerpt || String(post.content || '').replace(/[#*_>`[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, 170);

const ARROW = '<svg class="icon icon--arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg>';

function blogCard(post) {
  const url = `${SITE}/blog/${encodeURIComponent(post.slug)}`;
  const title = post.title || post.slug;
  const cover = post.cover_url
    ? `<a class="blog-card__media" href="${esc(url)}"><img src="${esc(optimiseImageUrl(post.cover_url, 640))}" alt="${esc(title)}" width="640" height="360" loading="lazy" decoding="async"></a>`
    : '';
  const tags = splitList(post.tags).map((tag) => `<span>${esc(tag)}</span>`).join('');
  return (
    `<article class="blog-card">` +
    cover +
    `<div class="blog-card__body">` +
    `<p class="blog-card__meta">${esc(dateLabel(post.published_at))}</p>` +
    `<h2 class="blog-card__title"><a href="${esc(url)}">${esc(title)}</a></h2>` +
    `<p class="blog-card__excerpt">${esc(excerptOf(post))}</p>` +
    (tags ? `<div class="blog-card__tags">${tags}</div>` : '') +
    `<a class="text-link" href="${esc(url)}">Read article${ARROW}</a>` +
    `</div></article>`
  );
}

const STATUS_LABEL = {
  demo: 'Working demonstration',
  concept: 'Concept design',
  development: 'In development',
  live: 'Live website',
  completed: 'Completed',
};

function projectCard(project) {
  const url = `${SITE}/work/${encodeURIComponent(project.slug)}`;
  const title = project.title || project.slug;
  const category = project.category || 'Project';
  const cover = project.cover_url || `${SITE}/assets/images/project-portfolio.svg`;
  const tech = splitList(project.technologies).map((t) => `<li>${esc(t)}</li>`).join('');
  const external = project.demo_url
    ? `<a class="project-card__external" href="${esc(project.demo_url)}" target="_blank" rel="noopener noreferrer">Open live site<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg></a>`
    : '';
  return (
    `<article class="project-card reveal" data-project-card data-project-id="${esc(project.id)}" data-project-type="${project.status === 'concept' ? 'concept' : 'website'}">` +
    `<a class="project-card__visual" href="${esc(url)}">` +
    `<span class="project-card__image-wrap"><img class="project-card__image" src="${esc(optimiseImageUrl(cover, 640))}" alt="${esc(title)}" width="640" height="480" loading="lazy" decoding="async"></span>` +
    `<span class="project-card__visual-top"><span class="project-card__visual-tag">${esc(category)}</span>` +
    `<span class="status status--${esc(project.status || 'development')}">${esc(STATUS_LABEL[project.status] || project.status || '')}</span></span>` +
    `<span class="project-card__image-note">Illustrative visual</span>` +
    `</a>` +
    `<div class="project-card__body">` +
    `<div class="project-card__meta"><span>${esc(category)}</span></div>` +
    `<h3 class="project-card__title"><a href="${esc(url)}">${esc(title)}</a></h3>` +
    `<p class="project-card__description">${esc(project.summary || '')}</p>` +
    (tech ? `<ul class="project-card__tech" aria-label="Technology stack">${tech}</ul>` : '') +
    `<div class="project-card__footer"><a class="text-link" href="${esc(url)}">View case study${ARROW}</a>${external}</div>` +
    `</div></article>`
  );
}

function inject(file, name, html) {
  const source = read(file);
  const start = `<!--thc:${name}:start-->`;
  const end = `<!--thc:${name}:end-->`;
  const a = source.indexOf(start);
  const b = source.indexOf(end);
  if (a === -1 || b === -1 || b < a) throw new Error(`${file}: missing ${start} / ${end} markers`);
  write(file, source.slice(0, a + start.length) + '\n' + html + '\n          ' + source.slice(b));
}

const posts = (await rows('posts?select=*&status=eq.published&order=published_at.desc'))
  .filter((p) => p.slug && (!p.published_at || new Date(p.published_at) <= new Date()));
const projects = (await rows('projects?select=*&published=eq.true&order=sort_order.asc,created_at.desc'))
  .filter((p) => p.slug);

if (!posts.length) throw new Error('No published posts returned — refusing to write an empty sitemap');

write('api/_lib/shell.js',
  '/* Generated by build.mjs. Do not edit by hand. */\n' +
  'module.exports = ' + JSON.stringify({
    siteUrl: SITE,
    supabaseUrl,
    supabaseKey,
    generatedAt: new Date().toISOString(),
    post: read('post.html'),
    project: read('project.html'),
    notFound: read('404.html'),
    posts: posts.map((p) => ({ slug: p.slug, title: p.title, published_at: p.published_at, updated_at: p.updated_at })),
    projects: projects.map((p) => ({ slug: p.slug, title: p.title, updated_at: p.updated_at })),
  }, null, 2) + ';\n');

inject('blog.html', 'blog-list', posts.map(blogCard).join('\n          '));
inject('projects.html', 'project-list', projects.map(projectCard).join('\n          '));

console.log(`build: ${posts.length} articles, ${projects.length} case studies`);
console.log(`build: sitemap served live at /sitemap.xml (${posts.length + projects.length + 6} URLs)`);
console.log('build: api/_lib/shell.js, blog.html, projects.html written');
