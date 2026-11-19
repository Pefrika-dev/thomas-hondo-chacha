# Growth roadmap — thomashondochacha.co.ke

Audit date: 2026-11-08. Auditor: engineering + growth work performed on the live site and
this repository (`main`, commit `289de1a`). Every finding below was read from the live
response or from a file in this repo; nothing is estimated unless it says so.

Priority order requested by the owner: **qualified leads → WhatsApp enquiries → conversion
rate → Google organic traffic → genuine social engagement.** The modules below are ordered
by expected revenue per hour of work, not by the order of the phases in the brief.

---

## 1. What the site already has (do not rebuild)

| Asset | Evidence |
| --- | --- |
| 11 published articles, buyer-intent titles | Supabase `posts?status=published` returns 11 rows, e.g. `how-much-does-a-website-cost-in-kenya`, `website-vs-web-application-kenya`, `why-your-business-needs-its-own-website` |
| 7 published projects incl. real local clients | Supabase `projects?published=true`: Jofa Hotel, Suna Motor Bazaar, Radio Togotane, Daima Communications, Marowa Store Hardware, Pefrika, Personal Portfolio |
| Working enquiry pipeline | `contact.html` → `api/submit-contact.js` → Supabase `contact_submissions`; admin Submissions tab with total/today/week counts |
| WhatsApp on every page | `wa.me/254705023432` appears 3× home, 8× services, 3× contact, 2× about, 2× projects, 1× blog; floating button `js/whatsapp-float.js` |
| Bilingual EN/SW, dark mode, AI chat | `js/language.js` (449 keys/language), `js/ai-chat.js` → `api/ai-chat.js` (Gemini, rate-limited) |
| Lean static shell | Brotli on; the served HTML has zero `<img>` and all main scripts `defer`. At runtime the CMS injects project covers, one of which is a 307 KB third-party `image.thum.io` screenshot — 62% of the 497 KiB actually transferred. |
| Lighthouse mobile baseline (2026-11-08) | **Performance 49**, Accessibility 100, Best Practices 100, SEO 100. FCP 3.6 s, LCP 4.1 s, TBT 1,270 ms, CLS 0.033, Speed Index 6.9 s. Main-thread 9.2 s (Style & Layout 5.55 s). 33 requests / 497 KiB on the wire. Render-blocking: `css/style.css` (150 ms) and the Google Fonts stylesheet (923 ms). Largest single asset: a 307 KB `image.thum.io` screenshot of the Jofa demo. Cloudflare Insights beacon is injected at the edge (not in the repo). |
| Indexing started | Google already returns `/`, `/about.html`, `/projects.html`, `/project.html` |
| Search Console verification file present | `google9875c11804e2a13e.html` |

## 2. Audit findings, ranked by money left on the table

### F1 — The entire content library is invisible to crawlers (critical, organic)
- `blog.html` as served contains **0** links to `post.html?slug=…`. A crawler following links
  from the blog index reaches none of the 11 articles.
- `post.html?slug=how-much-does-a-website-cost-in-kenya` serves `<title>Article — Thomas Hondo
  Chacha</title>`, **0** occurrences of the article title, **0** `<h1>`, and no article body.
  Same for `project.html?slug=jofa` (0 occurrences of "Jofa").
- No `<noscript>` fallback on `blog.html`, `post.html`, `project.html`.
- Consequence: 11 already-written, keyword-targeted articles and 7 case studies produce
  almost no organic entry points. This is the cheapest large win available.

### F2 — Sitemap describes a site that no longer exists (critical, organic)
- `sitemap.xml` lists 12 URLs: **1** article and **5** projects, all `lastmod 2026-10-25`.
  Reality: 11 articles, 7 projects, latest content 2026-11-01.
- 10 articles and 2 projects are absent; every `lastmod` is stale, so Google has no signal
  that anything changed.

### F3 — No first-party measurement (critical, blocks all other KPIs)
- No GA4, no gtag, no GTM, no first-party event endpoint. `README.md:29,584` and
  `js/language.js:395` state there is no tracking.
- A Cloudflare Insights beacon **is** injected at the edge (visible in the Lighthouse network
  log, absent from the repo). It can count page views at the proxy; it cannot count WhatsApp
  clicks, enquiries, conversions or lead source.
- WhatsApp clicks, form submissions and sources are **not countable today**. Until first-party
  events exist, no conversion claim can be verified — including any claim made by this roadmap.

### F4 — Metadata sells a portfolio, not a service (high, organic + conversion)
- Titles: `Services — Thomas Hondo Chacha, Software Engineer`, `Projects — …`, `Blog — …`.
  None contains a buyer keyword or a place. Target terms ("website developers in Kenya",
  "hotel website development Kenya", "website developer in Migori/Nairobi") appear in no
  `<title>`, no `<h1>`, no description.
- JSON-LD is a single `Person` block **duplicated identically on six pages**. No `WebSite`,
  `ProfessionalService`/`Organization`, `Service`, `Offer`, `BreadcrumbList`, `Article`,
  `FAQPage`. No `hreflang` despite a full Kiswahili translation.
- `post.html`/`project.html` set canonical from `window.location.href` (`post.html:156-161`),
  which leaks preview hosts and stray query params.

### F5 — No offer a buyer can say yes to (high, conversion + leads)
- No prices, no packages, no scope/timeline table, no FAQ, no testimonials, no response-time
  promise anywhere in the served HTML (grep for `KSh`, `package`, `testimonial`, `faq`,
  `guarantee` returns nothing but one prose sentence on services).
- Hero copy is abstract: "Turning ideas into functional digital products", "Useful software",
  "Clarity first". A hotel owner searching "hotel website Kenya" gets no hotel-specific answer.
- No industry landing pages for the sectors the owner actually sells to (hotels, schools,
  churches, clinics, hardware, retail, radio, NGOs) — despite having built demos for exactly
  those sectors.

### F6 — Enquiry form is unprotected and inconsistent (medium, lead quality)
- `api/submit-contact.js` has no honeypot, no captcha, no rate limit (unlike `api/ai-chat.js`).
- Phone is marked required in the UI and enforced by `js/contact.js`, but the HTML input has
  no `required` and the API does not require it → inconsistent lead records.
- `js/contact.js:1-5,176,249` still contains dead WhatsApp/email-draft code from a removed
  flow; `README.md` §9 still documents a review panel that no longer exists.

### F7 — Two project renderers fight each other (medium, correctness)
- `js/cms-public.js` and `js/projects.js` both write `[data-projects-grid]` and both listen
  for `thc:languagechange`; `projects.js` registers second, so **switching language repaints
  the hardcoded five-project list over the live CMS content** on every page that has a grid.

### F8 — Smaller defects (low)
- `404.html:37,129` load `css/ai-chat.css` and `js/ai-chat.js` by relative path while every
  other 404 asset is root-relative → they break on nested missing URLs.
- `marked.min.js` is loaded on `post.html:151` and `project.html:151` but never used;
  `admin.html:114` claims "Content supports Markdown" while `cms-public.js:277,478` escapes it.
- Admin submissions table has 7 `<th>` for 8 `<td>` (Delete column unlabelled).
- Cache-busting `?v=` is inconsistent (`404.html:35-36` none, `contact.html:391` stale).
- `README.md` is materially stale: claims "no backend", five pages, a `vercel.app` domain and
  "no third-party JavaScript" — all contradicted by the running site.

### F9 — Mobile performance is the weakest measured score (high, organic + conversion)
- Lighthouse mobile Performance **49**. TBT 1,270 ms; main-thread work 9.2 s, of which
  **5.55 s is Style & Layout** — the CSS/animation cost dominates, not script evaluation
  (757 ms). 13 `backdrop-filter`, 13 `filter`, 46 `box-shadow`, 46 `transition` declarations
  across 113 KB of CSS.
- The Google Fonts stylesheet is render-blocking (923 ms estimated saving); `css/style.css`
  adds 150 ms. Fonts are not self-hosted or preloaded.
- A 307 KB `image.thum.io` screenshot of the Jofa demo is fetched at runtime as a project
  cover: a third-party dependency that is slow, uncacheable beyond 24 h, and can disappear.
- Speed is a ranking factor and a conversion factor: on a Kenyan mobile connection a 6.9 s
  Speed Index loses the enquiry before the CTA is seen.

### Not problems (verified, leave alone)
- No broken local assets: all 32 referenced same-origin URLs on home/services/contact return 200.
- Compression, `defer`, preconnect and HTTPS/HSTS are already correct.
- `robots.txt` correctly disallows `/admin.html` and `/api/`; admin is `noindex,nofollow`.

---

## 3. The profitable opportunity

The owner already has the two things that are expensive to acquire: **published buyer-intent
content** and **real local case studies**. Neither is reachable by a search engine, and
neither is connected to a measurable offer. The revenue path is therefore:

1. Make the existing 11 articles + 7 case studies crawlable and internally linked (F1, F2).
2. Put a concrete, priced, sector-specific offer in front of the visitor and make the
   WhatsApp action one tap and measurable (F5, F3).
3. Work the warm list first: the businesses Thomas has **already built demos for** are
   pre-qualified prospects with a deliverable in hand, not cold names.
4. Only then publish new content and social posts, each pointing at a tracked landing page.

Cold mass outreach is explicitly out of scope: no scraping-derived private contacts, no
bulk messaging, no purchased engagement. Outreach is one-to-one, approval-gated, and uses
only publicly published business contact details.

---

## 4. KPIs — baseline, target, and how each is measured

Baselines marked **unknown** are unknown because no analytics exists (F3). They become
measurable in Module 3; targets before that date are commitments to instrument, not claims.

| # | KPI | Baseline (2026-11-08) | 30 days | 90 days | Measurement source |
| --- | --- | --- | --- | --- | --- |
| K1 | Crawlable article URLs | 1 of 11 in sitemap; 0 server-rendered | 11 of 11 server-rendered + in sitemap | 20+ | `curl` the served HTML; `sitemap.xml` diff |
| K2 | Crawlable project URLs | 5 of 7 in sitemap; 0 server-rendered | 7 of 7 | 10+ | same |
| K3 | Indexed pages (Google) | 4 observed in search | 12+ | 25+ | Search Console → Indexing → Pages (owner runs GSC) |
| K4 | Organic clicks / month | unknown | instrumented | +50% vs first full month | GSC Performance; first-party `page_view` with `source=organic` |
| K5 | WhatsApp enquiry clicks / month | unknown | instrumented | ≥ 25 | first-party `whatsapp_click` events, admin Growth tab |
| K6 | Enquiry form submissions / month | unknown (rows exist, uncounted by date) | instrumented | ≥ 12 | `contact_submissions` + `enquiry_submit` events |
| K7 | Visitor → enquiry conversion | unknown | instrumented | ≥ 3.0% | (K5+K6) / unique visitors, admin Growth tab |
| K8 | Qualified leads in pipeline | 0 tracked | ≥ 15 recorded | ≥ 40 | `leads` table, admin Leads tab |
| K9 | Proposals sent → replies | not tracked | tracked | ≥ 30% reply | `leads.status` + `outreach_log` (approval-gated) |
| K10 | Paid clients from the site | not tracked | tracked | ≥ 2 | `leads.status = won` + `value_ksh` |
| K11 | Lighthouse mobile SEO | 100 (home); article pages unmeasured | ≥ 95 on article pages | ≥ 95 | `lighthouse --only-categories=seo` |
| K12 | Lighthouse mobile Performance | **49** (TBT 1,270 ms, SI 6.9 s) | ≥ 75 | ≥ 90 | `lighthouse` mobile, same throttling |
| K13 | Genuine social engagement | unknown | instrumented | ≥ 5% engagement rate on owned posts | UTM-tagged links → `social_click` events; platform-native counts only |

**Rule:** no KPI is reported as "improved" until the measuring instrument exists and has
collected real data. Module 3 is therefore a prerequisite for reporting, not a nice-to-have.

---

## 5. Modules, in build order

Each module ends with a local test pass and a **deploy approval gate**. Nothing is published,
no prospect is contacted, and no money is spent without the owner's explicit approval.

### Module 1 — Search visibility foundation (moves K1, K2, K3, K11)
- `build.mjs`: read published `posts`/`projects` from Supabase at build time and emit fully
  server-rendered `blog/<slug>.html` and `work/<slug>.html` (real `<title>`, description,
  canonical, OG image, `<h1>`, article body, `Article`/`CreativeWork` + `BreadcrumbList` JSON-LD).
- Keep `post.html` / `project.html` working; 301 the legacy `?slug=` URLs to the clean ones.
- Server-render the article list into `blog.html` and the project list into `projects.html`
  so crawlers get internal links; the existing client-side CMS overlay keeps admin publishing
  instant for human visitors.
- Generate `sitemap.xml` from real content with real `lastmod`.
- Rewrite home/services/contact/about titles, descriptions and H1s around buyer keywords and
  place names; add `WebSite`, `ProfessionalService` (with `areaServed`), `Service` and
  `BreadcrumbList` schema; add `hreflang` for the existing EN/SW pages.
- Fix F7 (single project renderer), F8 (404 paths, unused `marked`, table header, `?v=`).
- Acceptance: `curl` each generated URL returns the article text and a unique title; sitemap
  contains every published row; `node build.mjs` is repeatable and idempotent; local server
  shows no console errors; Lighthouse SEO ≥ 95.

### Module 1b — Mobile performance (moves K12; protects conversion on slow connections)
- Self-host the three font families (or preload the stylesheet and `font-display: swap`) so
  the 923 ms render-blocking font request disappears; keep the existing type choices.
- Replace the runtime `image.thum.io` screenshot cover with a locally stored, compressed
  WebP/AVIF still of the same demo, sized 1200×900, `loading="lazy"`, explicit width/height.
  No third-party image dependency on the critical path.
- Load `js/ai-chat.js` and its CSS only when the chat launcher is first opened (it is 23 KB
  JS + 13 KB CSS that most visitors never use).
- Reduce the Style & Layout cost: audit the 13 `backdrop-filter` and 13 `filter` uses, keep
  them only where they are visible, and gate decorative animation behind
  `prefers-reduced-motion` (already partly present).
- Acceptance: re-run the same Lighthouse mobile command; Performance ≥ 75 with no regression
  in Accessibility/Best Practices/SEO; no visual change to the design.

### Module 2 — Offer and conversion (moves K5, K6, K7, K8)
- Three clear packages with scope, timeline and price **only where the owner confirms the
  price** — otherwise "from" ranges are left as an explicit pending decision, never invented.
- Sector landing pages for the sectors Thomas has already built for: hotels & lodges,
  schools & academies, churches, clinics, hardware & retail, radio stations, NGOs. Each links
  to the matching real case study and carries one tracked WhatsApp CTA.
- FAQ block (real questions from the existing articles) + `FAQPage` schema.
- One primary CTA above the fold on every page: "Get a quote on WhatsApp", with a truthful
  response-time line only if the owner confirms it.
- Harden the enquiry form: honeypot + server-side rate limit, consistent phone requirement,
  remove dead draft code, add UTM/source capture so each lead records where it came from.
- Acceptance: form submit stores a row with source fields; spam payload is rejected; every
  WhatsApp link carries a placement identifier; mobile tap targets ≥ 44 px.

### Module 3 — First-party analytics + Growth dashboard (moves K4–K7, K13; unlocks reporting)
- `api/track.js` + a small `js/telemetry.js`: `page_view`, `whatsapp_click`, `enquiry_submit`,
  `cta_click`, `social_click`, `chat_open`. First-party, no cookies required, IP truncated,
  honour `DNT`, no third-party ad scripts. Supabase table `analytics_events`.
- New admin **Growth** tab: visitors/unique visitors, daily + monthly series, top pages,
  sources, WhatsApp clicks, enquiries, conversion rate, charts with directly labelled series.
- Optional GA4 + Search Console wiring behind a settings field the owner fills in; the site
  works fully without it.
- Acceptance: events appear in the table within seconds; dashboard numbers reconcile with
  raw SQL counts; no event fires for admin pages; blocking the endpoint degrades silently.

### Module 4 — Lead pipeline + approval-gated outreach (moves K8, K9, K10)
- `leads` table + admin **Leads** tab: business, sector, location, public contact, source,
  status (new → qualified → proposal → won/lost), value, next follow-up date, notes.
- Seed it only with **verified** prospects: the businesses Thomas has already built demos for,
  plus publicly listed businesses whose contact details are published on their own site or
  listing. Every row stores its evidence URL. No invented contacts.
- Outreach drafter: generates a personalised message per lead; **nothing sends automatically**.
  The owner approves, then sends manually from their own WhatsApp/email. Every approved send
  is logged for follow-up.
- Acceptance: a lead can be created, edited, filtered, advanced and exported; drafts render
  with real merged fields; no code path sends a message without an explicit approval record.

### Module 5 — Content + social engine, approval-gated (moves K4, K13)
- 90-day editorial calendar built from the keyword gaps the audit exposes, each item mapped
  to a target query, a sector landing page and a CTA.
- Admin **Content** tab: draft article + Facebook/LinkedIn/Instagram captions + YouTube
  description, all UTM-tagged, all in a `pending approval` state until the owner publishes.
- Weekly growth report: real numbers from Module 3, week-over-week deltas, top pages,
  pipeline movement, and three recommended actions. Generated on demand, never auto-posted.
- Acceptance: a draft can be approved and exported; UTM parameters survive into the analytics
  events; the weekly report reconciles with the dashboard.

### Module 6 — Hardening, documentation and handover
- Rewrite `README.md` to match reality (backend, CMS, domains, deploy, build, tracking).
- Add `npm test`-style checks: build idempotence, sitemap coverage, JSON-LD validity, link
  resolution, metadata uniqueness, no secrets in client files.
- Record the deploy runbook and the approval gates.

---

## 6. Approval gates (owner action required)

| Gate | Needed before |
| --- | --- |
| G1 | Deploying any module to production (`git push` / Vercel) |
| G2 | Confirming prices, packages, response times, testimonials — none are invented |
| G3 | Contacting any prospect, even one already known. **Approved 2026-11-19:** approved contacts in `outreach/messages.md`, sent manually by the owner, one business at a time. Unverified contacts stay excluded. |
| G4 | Publishing any article or social post |
| G5 | Spending any advertising money |
| G6 | Adding GA4/GSC IDs or any third-party script |

## 7. Explicitly out of scope

Fake traffic, click farms, bots, purchased followers, artificial clicks, scraped private
contact data, bulk unsolicited messaging, and any claim of growth that the instrumentation
does not support.

## 8. Progress log

- **2026-11-19 — Packages live (Module 2, partial).** Owner-confirmed prices published on services.html: Starter from KSh 25,000, Business from KSh 55,000, Commerce from KSh 120,000, Custom from KSh 150,000. Six-question pricing FAQ, Service/OfferCatalog + FAQPage schema, one tracked WhatsApp CTA per package, English and Kiswahili. Verified in production (2 columns at 800 px, no overflow, no console errors). Add-ons and payment terms are published in the FAQ.
- **2026-11-19 — Module 1 live.** /blog/<slug> and /work/<slug> now return 200 with server-rendered content, unique metadata, Article/CreativeWork + BreadcrumbList JSON-LD. Unknown slugs return 404 + noindex. Legacy ?slug= URLs 308-redirect. Verified in production and in a browser (no console errors, no loading flash).
- **2026-11-19 — Module 3 code shipped.** api/track.js, js/telemetry.js, supabase/analytics.sql and an admin Growth tab. Events are only stored after the owner runs supabase/analytics.sql in Supabase. No cookies, DNT respected, IP never stored.
- **2026-11-19 — Outreach approved (G3).** Owner approved contact with the ten leads that have verified or supplied details. `outreach/README.md` holds the rules and daily sequence, `outreach/messages.md` the English and Kiswahili text per lead, `outreach/tracker.csv` the log. Nothing sends automatically; Thomas sends from his own WhatsApp or email. Unverified contacts (Excel Academy, Tina Beauty Hub, PreMara, Kehancha Mixed, Anjego, Funguo, Victory Fabricators) remain excluded.
- **2026-11-19 — Analytics still blocked.** `public.analytics_events` does not exist (PostgREST returns PGRST205). No Supabase management token or database credential exists on this machine, and DDL cannot be run with the publishable key. The table must be created by running `supabase/analytics.sql` in the Supabase SQL editor, or by supplying a management token.
