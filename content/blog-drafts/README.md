# Blog drafts — not published

These five JSON files are **drafts only**. They are not live on the website and must not be published until the site owner approves.

They are excluded from Vercel deploys via `.vercelignore`.

## Files

| Slug | Intent |
|---|---|
| `website-packages-kenya` | Compare Starter / Business / Commerce / Custom with confirmed prices |
| `ecommerce-website-kenya` | Commerce package, preparation and order flow |
| `custom-web-application-kenya` | When a website is no longer enough, scoped from KSh 150,000 |
| `website-redesign-kenya` | 8 signs it is time plus budget guidance |
| `whatsapp-business-website-kenya` | Turning WhatsApp enquiries into customers without bots |

M-Pesa integration was deliberately left out because it is not yet confirmed as a service Thomas offers. `website-redesign-kenya` was added instead because `contact.html?service=website-redesign` already exists on the live site.

## Data shape

Each file matches the admin `posts` save payload exactly:

```text
title, title_sw, slug, excerpt, excerpt_sw, content, content_sw,
cover_url, tags, status, published_at, seo_title, seo_description
```

All are `status: draft` and `published_at: null`.

## Import

1. Open `/admin.html` and sign in.
2. Go to **Blog** → **Add article**.
3. Copy each field from the JSON into the matching admin field.
4. Keep **Status = Draft** and leave **Published at** blank.
5. Review both English and Kiswahili text before saving.

Publishing, sitemap changes and Google Search Console indexing requests still require explicit owner approval.
