# Thomas Hondo Chacha — Personal Website

A complete, bilingual personal website for **Thomas Hondo Chacha**, a software engineer in Kenya. It presents services, project case studies and direct contact routes in English and Kiswahili, with light and dark themes.

The site is built with **HTML5, CSS3 and vanilla JavaScript**. It has no build step, no framework and no backend.

**Live site:** [https://thomas-hondo-chacha.vercel.app/](https://thomas-hondo-chacha.vercel.app/)\
**Source repository:** [https://github.com/Pefrika-dev/thomas-hondo-chacha](https://github.com/Pefrika-dev/thomas-hondo-chacha)

---

## 1. What is included

- Five main pages plus a styled 404 page:
  - `index.html` — home, introduction, featured work, services, process and contact call to action.
  - `about.html` — profile, approach, tools and current areas of exploration.
  - `projects.html` — filterable project catalogue with honest status labels and case-study dialogs.
  - `services.html` — six service areas, working process and scope guidance.
  - `contact.html` — contact channels, enquiry form, message review and direct contact links.
  - `404.html` — styled “page not found” page.
- Full **English / Kiswahili** interface, including navigation, project copy, form labels, validation messages, page titles and meta descriptions.
- Remembered **language** and **theme** preferences using LocalStorage.
- **Light and dark themes**, with the operating-system preference used on a first visit.
- Responsive layouts for phones, tablets and desktop.
- Project case-study dialogs with hash deep links such as `projects.html#project-jofa`.
- A contact form that validates locally and prepares a message for WhatsApp or email. **It does not send email from the website.**
- SEO metadata, Open Graph and Twitter cards, JSON-LD for the homepage, `sitemap.xml`, `robots.txt`, web manifest, favicon and PNG icons.
- Accessibility work: skip link, landmarks, keyboard navigation, visible focus, Escape handling, reduced-motion support, high-contrast support and a native `<dialog>`.
- No analytics, tracking scripts or third-party JavaScript.

---

## 2. Folder structure

```text
My Official Website/
├── index.html
├── about.html
├── projects.html
├── services.html
├── contact.html
├── 404.html
├── css/
│   ├── style.css        Design tokens, base styles, layout, header, hero, footer
│   ├── components.css   Cards, buttons, forms, modal, project and contact components
│   └── responsive.css   Breakpoints, mobile navigation, reduced-size layouts
├── js/
│   ├── theme.js         Pre-paint theme selection and persistence
│   ├── language.js      English/Kiswahili dictionary and language controller
│   ├── projects.js      Project facts, filters, cards, dialog and deep links
│   ├── contact.js       Form validation, message preparation and contact links
│   └── main.js          Shared navigation, reveals, year, WhatsApp links
├── assets/
│   ├── icons/           SVG favicon, source icon and PNG app icons
│   └── images/          Open Graph image, profile photo and five project interface studies
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── vercel.json          Production security headers for Vercel
├── .gitignore
└── README.md
```

All paths are relative, so the site can be hosted in a domain root or a subfolder.

---

## 3. Run the site locally

The site is static, but a local HTTP server is recommended so that LocalStorage, the manifest and relative links behave consistently.

From this folder, run one of the following:

```powershell
# Python 3
python -m http.server 8080 --bind 127.0.0.1
```

```powershell
# Node.js (if installed)
npx serve .
```

Then open:

```text
http://127.0.0.1:8080/
```

Opening `index.html` directly from the file system also works for most content, but browser storage rules for `file://` URLs vary. Use a local server for final checks.

There is no install step, build command or package dependency for the website itself.

---

## 4. Update contact details first

The current details are:

| Channel | Value |
| --- | --- |
| Phone (display) | `0705023432` |
| Phone (international) | `+254705023432` |
| WhatsApp | `https://wa.me/254705023432` |
| Email | `thomashondochacha@gmail.com` |

To change any of these, update **all** of the following:

1. **JavaScript constants**
   - `js/main.js` → `WHATSAPP_NUMBER`
   - `js/contact.js` → `PHONE_INTERNATIONAL` and `EMAIL_ADDRESS`
2. **HTML links and visible text**
   - `index.html`, `about.html`, `projects.html`, `services.html`, `contact.html`
   - Search for `0705023432`, `+254705023432`, `254705023432` and `thomashondochacha@gmail.com`.
3. **Homepage structured data**
   - The `application/ld+json` block in `index.html` contains `email` and `telephone`.
4. **Translation strings**
   - `js/language.js` contains phone text in `common.callNumber`, `contactPage.asideCall` and related contact copy. Update both the English and Kiswahili values.

Quick way to find every occurrence in PowerShell:

```powershell
Select-String -Path *.html,js\*.js -Pattern "0705023432|254705023432|thomashondochacha@gmail.com"
```

After editing, reload the page and test the phone link, WhatsApp link and email link.

---

## 5. Edit page content

Most visible copy is not written directly in the HTML. It lives in the translation dictionary in `js/language.js`:

- **English:** `translations.en`
- **Kiswahili:** `translations.sw`

HTML elements use keys such as:

```html
<h1 data-i18n-html="home.heroTitle">Turning ideas into functional digital products.</h1>
```

The language controller supports these attributes:

| Attribute | What it changes |
| --- | --- |
| `data-i18n` | Element text content |
| `data-i18n-html` | Element HTML (used for `<em>` emphasis) |
| `data-i18n-placeholder` | Input placeholder |
| `data-i18n-aria-label` | `aria-label` |
| `data-i18n-title` | `title` attribute |

To change a sentence:

1. Find the matching key in the HTML or by searching `js/language.js`.
2. Update the English value.
3. Update the same key in the Kiswahili dictionary.
4. Keep placeholders such as `{count}`, `{name}` and `{language}` exactly as written.

The English text inside the HTML is a readable fallback for no-JavaScript visitors and for browsers before scripts run. Keep it roughly in sync with the English dictionary value.

### Page titles and descriptions

Each page has static English metadata in its `<head>`, and `js/language.js` updates it at runtime when the language changes. The `meta` section of the dictionary holds the English and Kiswahili titles and descriptions.

If you change a page title or description, update both:

- the static `<head>` metadata in the HTML page;
- the `meta.<page>.title` / `meta.<page>.description` values in both languages.

---

## 6. Add or edit projects

Project facts are separated from project copy.

### Project facts: `js/projects.js`

Each object in the `projects` array contains:

```js
{
  id: "jofa",
  title: "Jofa Hotel Website",
  type: "website",          // "website" or "concept"
  status: "demo",           // "live", "demo", "concept" or "development"
  featured: true,           // shows on the homepage
  cover: "assets/images/project-jofa.svg",
  technologies: ["HTML5", "CSS3", "JavaScript"],
  service: "website-design",
  links: {
    demo: null,
    source: null,
    internal: null
  }
}
```

- `featured: true` adds the project to the homepage’s featured grid.
- `service` controls the preselected service on the contact page when a visitor chooses “Discuss a project” from the case study.
- Only add `demo`, `source` or `internal` links when a real public URL exists. Do not use placeholder links.
- If a link is present, the card and dialog display it automatically.

### Project copy: `js/language.js`

Add a matching entry under `projectData.<id>` in **both** languages:

```js
projectData: {
  example: {
    category: "Hospitality website",
    alt: "Illustrative interface study for the example project",
    summary: "One or two sentences shown on the card.",
    problem: "The problem the interface addresses.",
    solution: "The approach taken.",
    features: [
      "First feature",
      "Second feature"
    ],
    limitations: "What this project is not, and what it does not claim.",
    availability: "No public demo or source link is configured for this project."
  }
}
```

### Profile photo

The About page uses a real portrait of Thomas Hondo Chacha. Optimised copies live in `assets/images/`:

- `thomas-hondo-chacha-640.webp` and `thomas-hondo-chacha-960.webp` for modern browsers;
- `thomas-hondo-chacha-960.jpg` as the fallback.

The `<picture>` element supplies the responsive sources, and the image's `alt` text is translated through the `about.photoAlt` dictionary key.

If you replace the portrait:

1. Keep a similar portrait aspect ratio so the face is not cropped awkwardly.
2. Export WebP versions at 640 px and 960 px wide, plus a JPEG fallback.
3. Update the `srcset`, `width`, `height` and `sizes` values in `about.html`.
4. Update `about.photoAlt` in both languages if the new photo shows something different.
5. Confirm you have permission to publish the photo.

### Project images

The existing project images are **illustrative interface studies**, not screenshots of deployed client sites. This is stated on the cards and in each case study.

If you replace an image:

- use a 4:3 image around 1200 × 900 pixels;
- keep the `alt` text accurate;
- update the “Illustrative interface study” label only if the image really is a screenshot of a live project;
- keep the honest status labels and limitations accurate.

### Project statuses

The site supports four statuses:

| Status key | Displayed as | Use it when |
| --- | --- | --- |
| `live` | Live website | A real public website is deployed and reachable. |
| `demo` | Working demonstration | A functional front-end demonstration exists, but it is not a live client deployment. |
| `concept` | Concept design | The work is an interface direction or design exploration. |
| `development` | In development | The project is still being built or refined. |

At the time of writing, the catalogue contains two working demonstrations, one concept, and two projects in development. **No project is presented as live.**

### Adding a project: checklist

1. Add the project object to `js/projects.js`.
2. Add `projectData.<id>` copy in English and Kiswahili.
3. Add the cover image under `assets/images/`.
4. Confirm the status and limitations are accurate.
5. Add public links only if they exist.
6. Reload `projects.html` and test the filter, card, dialog, deep link and contact button.

---

## 7. Language system

- Storage key: `thc-language`
- Default: English (`en`)
- Supported: English (`en`) and Kiswahili (`sw`)
- The controller updates `<html lang>`, the page title, the meta description, Open Graph title/description and language-button labels.
- A custom event, `thc:languagechange`, lets other scripts refresh generated content. Projects, navigation labels, form messages, WhatsApp prefills and the review panel listen for it.

### Adding a translation

1. Add the key to `translations.en`.
2. Add the same key to `translations.sw` with the same structure.
3. Use it in HTML with a `data-i18n*` attribute, or read it in JavaScript with `window.Language.t("key")`.
4. Keep interpolation placeholders unchanged.

The two dictionaries currently contain **449 keys each**. A missing key falls back to the English dictionary, but it is still better to keep both dictionaries complete.

### Translating new project copy

Project copy is nested under `projectData.<id>`. Arrays such as `features` must contain the same number of items in both languages.

---

## 8. Theme system

- Storage key: `thc-theme`
- Values: `light` or `dark`
- On a first visit, the site follows the operating-system colour preference.
- `js/theme.js` runs synchronously in the `<head>` before the stylesheets, so the correct theme is applied before the page paints.
- Once a visitor chooses a theme, that choice is stored and the site stops following the OS setting.

Colours are defined as CSS custom properties in `css/style.css`:

- `:root` contains the light theme tokens.
- `[data-theme="dark"]` contains the dark theme overrides.

When adding a component, use the existing tokens (`--bg`, `--ink`, `--ink-soft`, `--accent`, `--line`, etc.) instead of hard-coded colours. This keeps both themes consistent.

The theme buttons use `data-theme-value="light"` and `data-theme-value="dark"` and are wired automatically.

---

## 9. Contact form behaviour

The form is intentionally **local-only**:

1. It validates name, email, optional phone, project type, description and preferred contact method in the browser.
2. It prepares a plain-text message and displays it in a review panel.
3. The visitor can:
   - open WhatsApp with the message prefilled;
   - open an email draft with the subject and body prefilled;
   - copy the message;
   - return to the form to edit it.
4. Nothing is submitted to a server by this website.
5. Form values are not written to LocalStorage. They exist only in the current page.
6. Only the language and theme preferences are stored.

This is why the interface says “Your message is ready to review” and “Nothing has been sent yet.” Keep that wording accurate unless you add a real backend.

### Service deep links

Service cards link to the contact page with a query string:

```text
contact.html?service=website-design
```

Supported values:

- `website-design`
- `landing-page`
- `web-application`
- `website-redesign`
- `api-integration`
- `technical-support`
- `other`

`js/contact.js` preselects the matching option. If you add a service, add a matching `<option>` to `contact.html` and use the same value in the service link.

### Adding real form delivery

If you later connect the form to a backend or form service:

- update the privacy note and the form message so they describe what is actually sent and stored;
- add server-side validation and spam protection;
- do not claim delivery succeeded unless the server confirms it;
- test error, success and offline states.

No backend is included in this project.

---

## 10. SEO, the production domain and the 404 page

### Production domain

The site is live at **https://thomas-hondo-chacha.vercel.app/**. Canonical links, `og:url`, the Open Graph and Twitter images, `sitemap.xml` and `robots.txt` all use this hostname.

If you attach a custom domain in Vercel, replace the hostname in:

- canonical links and `og:url` in all six HTML pages;
- `og:image` and `twitter:image` URLs;
- `sitemap.xml`;
- `robots.txt`.

Find them with:

```powershell
Select-String -Path *.html,sitemap.xml,robots.txt -Pattern "https://thomas-hondo-chacha.vercel.app"
```

Absolute URLs are required for social previews and sitemaps. If the site moves into a subfolder, update those paths as well.

### Metadata files

- `sitemap.xml` lists the five indexable pages. Update `lastmod` after meaningful content changes and remove pages you do not want indexed.
- `robots.txt` allows crawling and points to the live sitemap.
- `404.html` is served by most static hosts for missing pages. Some hosts need an explicit error-document setting; see the deployment section.
- `404.html` is marked `noindex, follow` and intentionally has no canonical URL.
- The homepage includes JSON-LD `Person` structured data. Update it if the name, role, email or phone changes.

### Open Graph image

`assets/images/og-cover.png` is 1200 × 630 pixels. Replace it with a new image of the same size if the branding changes, then update the image URL if the filename changes.

### Favicons

- `assets/icons/favicon.svg` — browser tab icon.
- `assets/icons/icon-192.png` and `icon-512.png` — manifest icons.
- `assets/icons/apple-touch-icon.png` — 180 × 180 Apple touch icon.
- `assets/icons/icon.svg` — editable source-style icon.

---

## 11. Deployment

### Live deployment

- **GitHub:** [Pefrika-dev/thomas-hondo-chacha](https://github.com/Pefrika-dev/thomas-hondo-chacha)
- **Vercel project:** [pefrika/thomas-hondo-chacha](https://vercel.com/pefrika/thomas-hondo-chacha)
- **Production URL:** [https://thomas-hondo-chacha.vercel.app/](https://thomas-hondo-chacha.vercel.app/)

The Vercel project is connected to the GitHub repository. Pushing to the `main` branch creates a new production deployment automatically. There is no build step: Vercel serves the repository files as a static site, and `vercel.json` adds basic security headers.

### Netlify

1. Drag the folder into Netlify, or connect the repository.
2. Leave the build command empty.
3. Set the publish directory to the folder containing `index.html`.
4. Netlify serves `404.html` automatically for unknown paths.

### Vercel

The project is already deployed. To recreate it from scratch:

1. Import the GitHub repository into Vercel.
2. Choose **Other** as the framework preset.
3. Leave the build command empty and use the repository root as the output directory.
4. Deploy. Vercel serves `404.html` for missing paths automatically.
5. Add a custom domain under **Project → Settings → Domains** if needed, then update the SEO hostname as described above.

### GitHub Pages

1. Push the files to a repository.
2. Enable Pages for the chosen branch and folder.
3. GitHub Pages serves `404.html` automatically.
4. If the site lives at `username.github.io/repository/`, update all absolute SEO URLs to include that subpath.

### Traditional hosting / cPanel

1. Upload the files to the public web root (often `public_html`).
2. Confirm that `index.html` is the directory index.
3. Configure the server to use `404.html` for missing pages.

Example for Apache `.htaccess`:

```apache
ErrorDocument 404 /404.html
```

Example for Nginx:

```nginx
error_page 404 /404.html;
```

After deployment:

- test every page and internal link over HTTPS;
- test the phone, WhatsApp and email links on a real phone;
- update the SEO hostname everywhere if you attach a custom domain;
- submit `sitemap.xml` in Google Search Console or Bing Webmaster Tools if desired;
- check the social preview with a tool such as the Facebook Sharing Debugger or LinkedIn Post Inspector.

---

## 12. Accessibility notes

Implemented features include:

- a skip link that becomes visible on keyboard focus;
- semantic landmarks (`header`, `nav`, `main`, `footer`);
- one `<h1>` per page and a logical heading order;
- visible focus styles;
- keyboard-operable navigation, filters and project cards;
- a mobile menu that closes with Escape and returns focus to the toggle;
- a native `<dialog>` for case studies, with Escape and close-button support;
- `aria-expanded`, `aria-pressed`, `aria-current`, `aria-invalid` and live regions where appropriate;
- descriptive `alt` text and fixed image dimensions;
- minimum-contrast colour tokens for the light theme;
- `prefers-reduced-motion` support;
- Windows high-contrast (`forced-colors`) support;
- form errors linked to their fields, with focus moved to the first invalid field.

When editing, keep button and link text meaningful, preserve the skip link, and test the site with a keyboard.

---

## 13. Testing performed

The following checks were actually run during development:

- **Automated browser checks** with Chrome via Playwright at widths **1440, 1180, 820, 390 and 320 pixels**:
  - all six pages loaded with no console errors or page errors;
  - no horizontal page overflow at any tested width;
  - the mobile menu opened, closed with Escape, locked background scrolling and returned focus to the toggle;
  - the language switch changed `<html lang>`, page copy, titles and metadata, and survived a reload;
  - the theme switch changed the theme and survived a reload;
  - a dark OS preference produced the dark theme on a first visit;
  - reduced-motion mode revealed all content immediately;
  - the skip link received focus on the first Tab press.
- **Projects**
  - five cards rendered;
  - the concept filter showed one card and updated the count;
  - the “All work” filter restored five cards;
  - a card opened its case-study dialog and set `#project-...`;
  - Escape closed the dialog and cleared the hash;
  - direct links such as `projects.html#project-togotane` opened the correct case study.
- **Contact**
  - empty and malformed submissions produced field errors and focused the first invalid field;
  - a valid submission opened the review panel and moved focus to its heading;
  - the WhatsApp link contained an encoded message with the entered name;
  - the email link contained the subject and body;
  - “Back to the form” restored focus and kept the entered values;
  - reset cleared the values, errors and review panel;
  - service query values preselected the correct project type.
- **Lighthouse** in Chrome:
  - Accessibility and Best Practices scored **100** on all six pages in the light theme;
  - SEO scored **100** on the five indexable pages; `404.html` is deliberately `noindex`, so its SEO score is lower;
  - the homepage also scored **100** in Accessibility, Best Practices and SEO in the dark theme;
  - no Lighthouse failures were reported for the indexable pages.
- **Static checks**
  - all local `href` and `src` targets exist;
  - no duplicate IDs on any page;
  - every image has an `alt` attribute and width/height;
  - every page has one `<h1>`, a viewport tag and a meta description;
  - English and Kiswahili dictionaries have matching key counts (449 each);
  - no page has inline `style` attributes;
  - the manifest, sitemap and robots files parse correctly;
  - all SVG assets parse as XML.

### Not tested

The following were **not** tested and should be checked before a public launch:

- Safari, Firefox, Edge or older browser versions;
- physical iOS or Android devices;
- screen readers such as NVDA, JAWS or VoiceOver;
- real WhatsApp or email delivery (the site only prepares drafts);
- production hosting, HTTPS, redirects or server-side 404 configuration;
- search-engine indexing or social-platform preview rendering;
- slow-network performance or Core Web Vitals in the field;
- print styles.

These are honest limitations of the checks performed here, not claims that those areas are broken.

---

## 14. Browser support and dependencies

The site targets current evergreen browsers. It uses:

- native `<dialog>`;
- `IntersectionObserver`;
- CSS custom properties, `color-mix()` and `clamp()`;
- `matchMedia`;
- LocalStorage with graceful fallbacks.

Very old browsers may not support every visual feature, but content remains readable.

The only external dependency is **Google Fonts**, loaded with `@import` at the top of `css/style.css`:

- Manrope
- Instrument Serif
- IBM Plex Mono

Fallback font stacks are defined for each family. If you need a fully offline or privacy-first build, download the font files and self-host them, then replace the `@import` with `@font-face` rules.

No JavaScript libraries, CSS frameworks, analytics or tracking scripts are used.

---

## 15. Maintenance checklist

Before publishing:

- [ ] If using a custom domain, update the production hostname in all HTML, `sitemap.xml` and `robots.txt`.
- [ ] Confirm the phone, WhatsApp and email links.
- [ ] Confirm every project status and limitation is accurate.
- [ ] Add public links only where they really exist.
- [ ] Replace the Open Graph image if branding changes.
- [ ] Test the site on a phone and with a keyboard.
- [ ] Test the form review and both draft links.
- [ ] Check the 404 page on the live host.
- [ ] Run a final link check after deployment.

After content changes:

- [ ] Update both language dictionaries.
- [ ] Keep English HTML fallback text in sync.
- [ ] Update `lastmod` in `sitemap.xml` if the change is meaningful.
- [ ] Re-test the project filters and dialog deep links.

---

## 16. Ownership

Website content, layout and interface studies: **Thomas Hondo Chacha**.

The profile photo on the About page was supplied by Thomas Hondo Chacha.

The project images are original illustrative interface studies created for this site. They are not screenshots presented as deployed client work.

Fonts are provided by Google Fonts under their respective open font licences. No third-party JavaScript is bundled.
