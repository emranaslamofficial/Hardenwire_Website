# Hardenwire: Cybersecurity & Privacy Publication (frontend v1)

**Hardenwire** (`hardenwire.com`) is an independent cybersecurity and privacy
publication. This repository holds the complete static frontend: 43 pages,
12 full launch articles, working search and filters, and a design system
built for a library of hundreds or thousands of articles.

| Deliverable | Where |
|---|---|
| Brand & domain research | [docs/brand-and-domain.md](docs/brand-and-domain.md) |
| SEO keyword strategy & content plan | [docs/seo-strategy.md](docs/seo-strategy.md) |
| Article source files (12) | [content/articles/](content/articles/) |
| Policy pages source | [content/pages/](content/pages/) |
| Site generator | [_build/](_build/) |
| Built website | project root (`index.html` and so on) |

---

## 1. Brand

- **Selected:** Hardenwire, **hardenwire.com**. Not registered according to
  the Verisign RDAP registry (HTTP 404), checked twice on 18 Nov 2026.
  **Nothing was purchased.** Register it soon and run a trademark search first.
- **Alternatives (all available at time of check):** veilstead.com,
  shieldlore.com, guardlore.com, sentrylore.com, bastionjournal.com,
  bastionreview.com, veilreview.com, privacycourier.com, hardenreview.com,
  veilbrief.com.
- About 150 names were tested. Method, rationale and the taken-names list
  are in [docs/brand-and-domain.md](docs/brand-and-domain.md).

**Identity:** a classic, professional editorial style on pure white. The wordmark sets "Harden" in ink and "wire" in red, beside an H monogram whose crossbar extends as a "wire" (also the favicon). Palette: ink `#14181f`, white, neutral greys, and one true red accent `#c8102e` (no yellow or cream). Type (default "Editorial" preset): *Playfair Display* headlines, *Lora* article text, *Inter* interface. Switchable in the admin panel. No italics are used. Full dark mode is included.

## 2. SEO

[docs/seo-strategy.md](docs/seo-strategy.md) contains the market analysis,
positioning, site architecture, nine keyword clusters (about 40 keywords with
intent, estimated difficulty, article type, title, secondary keywords,
questions, internal links and priority), a launch internal-linking map and a
six-month publishing plan. **Difficulty figures are editorial estimates, not
tool data.** Validate them in Ahrefs, Semrush or Search Console.

## 3. Content

There are 12 original articles of 1,200–1,600 words each, written in
deliberately varied formats: annotated specimen, ranked comparison, numbered
checklist, myth vs reality, decision guide, hour-by-hour timeline, symptom
table, scenario plus 3-2-1 plan, per-browser walkthrough, weekend plan and
scam-script walkthrough. Each has an SEO title, meta description, slug,
primary and secondary keywords, category, author, dates, reading time, key
takeaways, callouts, FAQ (with FAQPage schema), sources, related articles and
internal links.

| Article | Category |
|---|---|
| Passkeys Explained | Password Security |
| How to Spot a Phishing Email | Phishing & Scams |
| Two-Factor Authentication Methods, Ranked | Password Security |
| How to Secure Your Home Router | Network Security |
| Is Public Wi-Fi Safe? | Online Safety |
| Do You Actually Need a VPN? | VPN |
| What to Do After a Data Breach | Identity Protection |
| Is Your Phone Infected? | Mobile Security |
| Ransomware at Home | Malware |
| Browser Privacy Settings | Browser Security |
| Reduce Your Digital Footprint | Data Privacy |
| Tech Support Scams | Phishing & Scams |

## 4. Website

**Pages (43):** home, all guides (filterable), search, topics index,
12 category pages, 12 articles, authors and 4 author profiles, resources,
newsletter, about, contact, editorial policy, corrections policy, privacy
policy, terms, HTML directory and 404.

**Working features:** sticky header with a Topics mega menu, a search panel
with live suggestions (`/` shortcut, arrow keys), an accessible mobile drawer
with focus trap and Esc, and a dark/light toggle. Search results at
`search.html?q=` use weighted ranking with category facets. Filters on
`articles.html` cover category, reading time, tags and sort, and are mirrored
in the URL. Articles have a reading progress bar, a sticky TOC with active
section, share buttons, copy link, a mobile bottom bar with a contents sheet
and native share, and FAQ accordions. Newsletter and contact forms have
validation.

## 5. Technical SEO

- One H1 per page, semantic HTML5, breadcrumbs everywhere, and descriptive
  alt text on every image (verified by script).
- Unique `<title>`, meta description, canonical, Open Graph and Twitter/X
  tags on every page.
- JSON-LD: `Article`, `BreadcrumbList`, `FAQPage`, `Organization`, `WebSite`
  plus `SearchAction`, `CollectionPage`/`ItemList`, and `ProfilePage`.
- `sitemap.xml` (41 URLs with `lastmod`), `robots.txt`, `site.webmanifest`.
  The search page is `noindex,follow`.
- Performance: no frameworks, about 25 KB of unminified hand-written JavaScript in total (plus a 9 KB data file),
  deferred scripts, lazy-loaded images with explicit dimensions (no layout
  shift), SVG illustrations, `font-display: swap` and preconnect.

> Note: Google currently shows FAQ rich results only for a limited set of
> sites. The FAQ schema is still valid and harmless.

## 6. File structure

```
/index.html, articles.html, search.html, categories.html, authors.html,
 resources.html, newsletter.html, about.html, contact.html, directory.html,
 editorial-policy.html, corrections-policy.html, privacy-policy.html,
 terms.html, 404.html                ← GENERATED pages
/articles/*.html                     ← GENERATED article pages
/category/*.html                     ← GENERATED category pages
/authors/*.html                      ← GENERATED author profiles
/css/main.css                        tokens, base, header, cards, home, pages, footer
/css/article.css                     article layout, prose, callouts, TOC, FAQ
/css/responsive.css                  breakpoints: 4K → laptop → tablet → phone, print
/js/articles-data.js                 GENERATED article index (stand-in for an API)
/js/articles.js                      ArticleService: the data layer (search, load, URLs)
/js/main.js                          header, menus, theme, forms, share, progress, TOC
/js/search.js                        search results page
/js/filters.js                       listing filters and sort
/assets/images/articles|categories   GENERATED SVG editorial illustrations
/assets/icons/                       favicon and logo
/sitemap.xml, robots.txt, site.webmanifest   GENERATED
/content/articles/*.html             ← EDIT HERE: JSON front matter + HTML body
/content/pages/*.html                ← EDIT HERE: about and policy pages
/_build/data.mjs                     brand, categories, authors, nav, briefings, resources
/_build/templates.mjs                reusable components (header, footer, card, breadcrumb…)
/_build/illustrations.mjs            cover-art generator
/_build/build.mjs                    page assembly, schema, sitemap
/docs/                               brand and SEO strategy
/server.mjs                          backend: static server, form API, admin API
/admin/                              admin panel (index.html, admin.css, admin.js)
/data/                               PRIVATE: subscribers, messages, settings, admin hash
```

**Never edit generated files by hand.** Edit `content/` or `_build/`, then
rebuild. Internal links in content use placeholders checked at build time:
`{{a:article-slug}}`, `{{c:category-slug}}`, `{{p:page.html}}`. A broken link
fails the build.

## 7. Running locally (site + admin panel)

Requires **Node.js 18+**. There is nothing to install.

```bash
node server.mjs
```

- Website: http://localhost:3000
- Admin panel: http://localhost:3000/admin/

On the **first run** the server generates an admin password and saves it to
`data/admin-password.txt`. Log in, change it under **Settings → Admin
password** (the file is then deleted automatically). You can also set one
yourself with an environment variable: `ADMIN_PASSWORD=your-long-password node server.mjs`.

Use a different port with `PORT=8080 node server.mjs`.

To rebuild the static pages by hand (for example after editing a file in
`content/`):

```bash
node _build/build.mjs
```

## 8. Admin panel & backend

`server.mjs` is a small, dependency-free Node server. It serves the
website, receives form submissions and powers the admin panel in `/admin/`.

| Admin section | What it does |
|---|---|
| **Dashboard** | Counts of posts, subscribers and messages, plus the latest messages |
| **Posts** | List, create, edit and delete articles. Fields: headline, standfirst, meta description, HTML body, category, author, dates, tags, takeaways, FAQ, sources, homepage placement, Unsplash photo with credit. **Publishing rebuilds the whole site automatically.** If a post would break the build (for example a link to a post that doesn't exist), nothing is saved and the error is shown |
| **Messages** | Everything sent from the Contact page. Mark read or unread, reply by email, delete |
| **Subscribers** | Every newsletter sign-up, with date and source page. Remove, or **Export CSV** to import into Mailchimp, Brevo, ConvertKit and similar services |
| **Settings** | Switch the site's **typography** between four presets (Editorial, Classic, Bookish, Modern), change the admin password, rebuild the site |

**Storage:** plain JSON files in `/data` (`subscribers.json`,
`messages.json`, `settings.json`, `admin.json`). The server never serves this
folder. **Back it up**, and never commit it to a public repository, because it
holds subscriber emails and the password hash.

**Security built in:** scrypt-hashed password, HttpOnly + SameSite=Strict
session cookie (8 hours), CSRF header and origin check on every admin
change, login rate limiting (5 per minute) and form rate limiting, input
validation and length limits, path-traversal protection, private folders
blocked, and all user-submitted text shown in the admin as plain text (never
HTML).

**Not included (by design, to keep it small):** sending the newsletter
itself (export the CSV to an email provider), multiple admin users, and image
uploads (photos come from Unsplash by ID).

### Photos

Articles use free-licence photos from **Unsplash**, loaded from Unsplash's
CDN in responsive sizes (480–1600 px, `srcset`) and credited under each
article as the Unsplash licence asks. To change a photo, open it on
unsplash.com, copy the image address, and paste it into the post's photo
field in the admin panel. Posts without a photo fall back to a generated
illustration.

## 9. Future development

| Concern | Today | Upgrade path |
|---|---|---|
| Storage | JSON files in `/data` | Replace `load()` and `save()` in **server.mjs** with SQLite, MySQL or Postgres. The API and admin UI stay the same |
| Content | `content/articles/*.html` | Keep it, or replace `readPost()` and `parseFile()` with a database or headless CMS |
| Newsletter sending | CSV export | Call your email provider's API from the `/api/subscribe` handler |
| Article data on the site | `js/articles-data.js` | `CONFIG.endpoint` in **js/articles.js** can point at a live `/api/articles` |
| Templates | `_build/templates.mjs` | Each function maps 1:1 to a WordPress or PHP partial if you migrate |
| Hosting | `node server.mjs` | Any Node host (Render, Railway, Fly.io, a VPS) behind HTTPS. Static-only hosting works for the site, but the forms and admin need the Node server |

## Before launch: checklist

- [ ] Register **hardenwire.com** and run a trademark search.
- [ ] **Replace placeholder authors** (`_build/data.mjs`) with real
      contributors. Never publish invented people or credentials.
- [ ] Have a professional review the privacy policy and terms (both are
      templates). Mention that you store subscriber emails and contact
      messages.
- [ ] Change the admin password and keep `/data` backed up and private.
- [ ] Serve the site over **HTTPS** in production. Session cookies and
      logins must never travel over plain HTTP.
- [ ] Re-verify every settings path in the articles against current OS and
      browser versions, and check every external source link.
