// ---------------------------------------------------------------------------
// Reusable components. Each function maps 1:1 to a future CMS partial:
//   WordPress: template-parts/*.php · Headless: React/Vue/Astro components.
// All functions are pure: data in, HTML string out.
// ---------------------------------------------------------------------------
import { SITE, CATEGORIES, NAV, catBySlug, authorBySlug, FONT_PRESETS } from './data.mjs';

// Active font preset (set once per build from data/settings.json)
let FONT = FONT_PRESETS.editorial;
let FONT_KEY = 'editorial';
export const setTheme = (key) => { if (FONT_PRESETS[key]) { FONT = FONT_PRESETS[key]; FONT_KEY = key; } };

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const fmtDate = (iso) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export const rel = (depth) => (p = '') => '../'.repeat(depth) + p;

// ---------- Icons (inline, stroke-based, 24px grid) ----------
const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  x: '<path d="M4 4l16 16M20 4 4 20"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
  facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8a0 0 0 0 1 0 0z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
  warn: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17v.01"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 15A8 8 0 1 1 9 4a6.5 6.5 0 0 0 11 11z"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
};
export const icon = (name, cls = 'icon') =>
  `<svg class="${cls}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

// ---------- Brand ----------
export const logoMark = (size = 30) =>
  `<svg class="logo__mark" viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true"><rect width="32" height="32" rx="7" fill="var(--c-ink)"/><path d="M10 8v16M19 8v16" stroke="var(--c-paper)" stroke-width="3.2" stroke-linecap="round"/><path d="M10 16h9" stroke="var(--c-paper)" stroke-width="3.2"/><path d="M19 16h4.5l1.5-2.5" stroke="var(--c-accent)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;

export const logo = (r, tag = 'a') =>
  `<${tag} class="logo" ${tag === 'a' ? `href="${r('index.html')}" aria-label="${SITE.name} home"` : ''}>${logoMark()}<span class="logo__word">Harden<span>wire</span></span></${tag}>`;

// ---------- Small atoms ----------
export const badge = (r, slug, cls = '') => {
  const c = catBySlug[slug];
  return `<a class="badge badge--${c.tone} ${cls}" href="${r('category/' + slug + '.html')}">${esc(c.name)}</a>`;
};

export const meta = (a, { author = true } = {}) =>
  `<p class="meta">${author ? `<span class="meta__author">${esc(authorBySlug[a.author].name)}</span><span class="meta__dot" aria-hidden="true"></span>` : ''}<time datetime="${a.updated || a.published}">${fmtDate(a.updated || a.published)}</time><span class="meta__dot" aria-hidden="true"></span><span>${a.readingTime} min read</span></p>`;

// Photos come from Unsplash's CDN (free licence) and are cropped to 16:9 at
// several widths. Without a photo, the generated SVG cover is used.
export const photoUrl = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${Math.round(w * 9 / 16)}&q=80`;
export const imageUrl = (a, r = (p) => p) => (a.photo ? photoUrl(a.photo) : r('assets/images/articles/' + a.slug + '.svg'));
export const img = (r, a, { cls = '', eager = false, sizes = '(max-width: 760px) 100vw, (max-width: 1240px) 60vw, 820px' } = {}) => {
  const load = eager ? 'fetchpriority="high"' : 'loading="lazy"';
  if (a.photo) {
    const set = [480, 800, 1200, 1600].map((w) => `${photoUrl(a.photo, w)} ${w}w`).join(', ');
    return `<img class="${cls}" src="${photoUrl(a.photo)}" srcset="${set}" sizes="${sizes}" alt="${esc(a.imageAlt)}" width="1200" height="675" ${load} decoding="async">`;
  }
  return `<img class="${cls}" src="${r('assets/images/articles/' + a.slug + '.svg')}" alt="${esc(a.imageAlt)}" width="1200" height="675" ${load} decoding="async">`;
};
export const credit = (a) => a.photo && a.photoCredit
  ? `Photo: <a href="https://unsplash.com/@${esc(a.photoCredit)}?utm_source=hardenwire&amp;utm_medium=referral" rel="noopener" target="_blank">@${esc(a.photoCredit)}</a> on <a href="https://unsplash.com/?utm_source=hardenwire&amp;utm_medium=referral" rel="noopener" target="_blank">Unsplash</a>`
  : 'Illustration: Hardenwire';

// ---------- Cards (one source of truth: also mirrored in js/search.js) ----------
export function card(r, a, { variant = 'default', headingLevel = 3, showDek = true, eager = false } = {}) {
  const h = `h${headingLevel}`;
  const url = r('articles/' + a.slug + '.html');
  const dataAttrs = `data-cats="${[a.category, ...a.also].join(' ')}" data-tags="${esc(a.tags.join('|'))}" data-date="${a.published}" data-updated="${a.updated}" data-pop="${a.popularity}" data-read="${a.readingTime}"`;
  if (variant === 'text') {
    return `<article class="card card--text">${badge(r, a.category, 'badge--plain')}<${h} class="card__title"><a href="${url}">${esc(a.title)}</a></${h}>${meta(a)}</article>`;
  }
  return `<article class="card card--${variant}" ${dataAttrs}>
  <a class="card__media" href="${url}" tabindex="-1" aria-hidden="true">${img(r, a, { eager })}</a>
  <div class="card__body">
    ${badge(r, a.category)}
    <${h} class="card__title"><a href="${url}">${esc(a.title)}</a></${h}>
    ${showDek ? `<p class="card__dek">${esc(a.dek)}</p>` : ''}
    ${meta(a)}
  </div>
</article>`;
}

export const numberedList = (r, list, headingLevel = 3) =>
  `<ol class="ranked">${list.map((a, i) => `<li class="ranked__item"><span class="ranked__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><${'h' + headingLevel} class="ranked__title"><a href="${r('articles/' + a.slug + '.html')}">${esc(a.title)}</a></${'h' + headingLevel}><p class="meta">${esc(catBySlug[a.category].name)}<span class="meta__dot" aria-hidden="true"></span>${a.readingTime} min read</p></div></li>`).join('')}</ol>`;

export const sectionHead = (title, { href, linkText = 'View all', kicker, id } = {}) =>
  `<header class="section-head">${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ''}<h2 class="section-head__title"${id ? ` id="${id}"` : ''}>${esc(title)}</h2>${href ? `<a class="section-head__link" href="${href}">${esc(linkText)} ${icon('arrow')}</a>` : ''}</header>`;

export const breadcrumb = (r, items) =>
  `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${items
    .map((it, i) => (i === items.length - 1 ? `<li aria-current="page">${esc(it.name)}</li>` : `<li><a href="${r(it.href)}">${esc(it.name)}</a></li>`))
    .join('')}</ol></nav>`;

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: SITE.url + '/' + it.href.replace(/^index\.html$/, '') })),
});

export const avatar = (author, size = 48) => {
  const initials = author.name.split(' ').map((p) => p[0]).join('').slice(0, 2);
  return `<span class="avatar" style="--s:${size}px" aria-hidden="true">${esc(initials)}</span>`;
};

export const newsletterBox = (r, { variant = 'band', heading = 'The Hardenwire Briefing', id = 'nl' } = {}) => `
<section class="newsletter newsletter--${variant}" aria-labelledby="${id}-title">
  <div class="newsletter__inner">
    <div class="newsletter__copy">
      <p class="kicker">Free weekly newsletter</p>
      <h2 class="newsletter__title" id="${id}-title">${esc(heading)}</h2>
      <p>One email every Thursday: the scams going around, the settings worth changing, and one guide worth your time. No sponsors and no tracking pixels.</p>
    </div>
    <form class="newsletter__form js-subscribe" novalidate>
      <label class="sr-only" for="${id}-email">Email address</label>
      <div class="field-row">
        <input id="${id}-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
        <button class="btn btn--accent" type="submit">Subscribe</button>
      </div>
      <p class="form-note" role="status" aria-live="polite">Unsubscribe in one click. Read our <a href="${r('privacy-policy.html')}">privacy policy</a>.</p>
    </form>
  </div>
</section>`;

// ---------- Header / footer ----------
function topicsMenu(r) {
  const hubs = CATEGORIES.filter((c) => !c.parent);
  return `<div class="mega" id="mega-topics" hidden>
  <div class="mega__inner container">
    ${hubs
      .map(
        (h) => `<div class="mega__col">
      <a class="mega__hub" href="${r('category/' + h.slug + '.html')}">${esc(h.name)} ${icon('arrow')}</a>
      <p class="mega__desc">${esc(h.short)}</p>
      <ul>${CATEGORIES.filter((c) => c.parent === h.slug).map((c) => `<li><a href="${r('category/' + c.slug + '.html')}">${esc(c.name)}</a></li>`).join('')}</ul>
    </div>`
      )
      .join('')}
    <div class="mega__col mega__col--aside">
      <p class="mega__hub">Start here</p>
      <ul>
        <li><a href="${r('articles/passkeys-explained.html')}">Passkeys, explained</a></li>
        <li><a href="${r('articles/how-to-spot-a-phishing-email.html')}">Spotting a phishing email</a></li>
        <li><a href="${r('articles/secure-your-home-router.html')}">Securing your router</a></li>
      </ul>
      <a class="btn btn--ghost btn--sm" href="${r('categories.html')}">All topics</a>
    </div>
  </div>
</div>`;
}

export function header(r, active = '') {
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header" id="top">
  <div class="container site-header__inner">
    ${logo(r)}
    <nav class="primary-nav" aria-label="Primary">
      <ul>
        <li><button class="primary-nav__btn js-mega" type="button" aria-expanded="false" aria-controls="mega-topics">Topics ${icon('chevron', 'icon icon--sm')}</button></li>
        ${NAV.map((n) => `<li><a href="${r(n.href)}"${active === n.slug ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`).join('')}
      </ul>
    </nav>
    <div class="site-header__actions">
      <button class="theme-toggle js-theme" type="button" aria-label="Toggle dark mode">${icon('moon', 'icon icon--moon')}${icon('sun', 'icon icon--sun')}</button>
      <button class="icon-btn js-search-open" type="button" aria-label="Search" aria-controls="search-panel" aria-expanded="false">${icon('search')}</button>
      <a class="btn btn--ink btn--sm site-header__cta" href="${r('newsletter.html')}">Subscribe</a>
      <button class="icon-btn menu-btn js-menu-open" type="button" aria-label="Open menu" aria-controls="mobile-menu" aria-expanded="false">${icon('menu')}</button>
    </div>
  </div>
  ${topicsMenu(r)}
  <div class="search-panel" id="search-panel" hidden>
    <div class="container">
      <form class="search-panel__form" action="${r('search.html')}" method="get" role="search">
        <label class="sr-only" for="hdr-q">Search Hardenwire</label>
        ${icon('search')}
        <input id="hdr-q" name="q" type="search" placeholder="Search guides: phishing, passkeys, VPN…" autocomplete="off" class="js-live-search" aria-describedby="hdr-q-hint">
        <button class="icon-btn js-search-close" type="button" aria-label="Close search">${icon('close')}</button>
      </form>
      <p id="hdr-q-hint" class="sr-only">Suggestions appear as you type. Press Enter for all results.</p>
      <ul class="search-panel__results js-live-results" role="listbox" aria-label="Suggestions"></ul>
      <p class="search-panel__popular">Popular: <a href="${r('search.html?q=phishing')}">phishing</a> <a href="${r('search.html?q=passkey')}">passkeys</a> <a href="${r('search.html?q=vpn')}">VPN</a> <a href="${r('search.html?q=router')}">router</a> <a href="${r('search.html?q=data%20breach')}">data breach</a></p>
    </div>
  </div>
</header>
<div class="mobile-menu" id="mobile-menu" hidden>
  <div class="mobile-menu__panel" role="dialog" aria-modal="true" aria-label="Menu">
    <div class="mobile-menu__head">${logo(r)}<button class="icon-btn js-menu-close" type="button" aria-label="Close menu">${icon('close')}</button></div>
    <form class="mobile-menu__search" action="${r('search.html')}" method="get" role="search"><label class="sr-only" for="mm-q">Search</label>${icon('search')}<input id="mm-q" name="q" type="search" placeholder="Search Hardenwire"></form>
    <nav aria-label="Mobile">
      ${CATEGORIES.filter((c) => !c.parent)
        .map(
          (h) => `<details class="mm-group"><summary>${esc(h.name)} ${icon('chevron', 'icon icon--sm')}</summary><ul><li><a href="${r('category/' + h.slug + '.html')}">All ${esc(h.name.toLowerCase())}</a></li>${CATEGORIES.filter((c) => c.parent === h.slug).map((c) => `<li><a href="${r('category/' + c.slug + '.html')}">${esc(c.name)}</a></li>`).join('')}</ul></details>`
        )
        .join('')}
      <ul class="mm-links">
        <li><a href="${r('articles.html')}">All guides</a></li>
        <li><a href="${r('resources.html')}">Resources</a></li>
        <li><a href="${r('authors.html')}">Authors</a></li>
        <li><a href="${r('about.html')}">About</a></li>
        <li><a href="${r('contact.html')}">Contact</a></li>
      </ul>
    </nav>
    <a class="btn btn--accent btn--block" href="${r('newsletter.html')}">Get the weekly Briefing</a>
  </div>
</div>`;
}

export function footer(r, popular) {
  const hubs = CATEGORIES.filter((c) => !c.parent);
  return `<footer class="site-footer">
  <div class="container">
    <div class="site-footer__top">
      <div class="site-footer__brand">
        ${logo(r)}
        <p>${esc(SITE.description)}</p>
        <a class="btn btn--outline-light btn--sm" href="${r('newsletter.html')}">${icon('mail')} Subscribe to the Briefing</a>
      </div>
      <nav class="site-footer__cols" aria-label="Footer">
        <div><h2 class="site-footer__h">Topics</h2><ul>${CATEGORIES.slice(0, 6).map((c) => `<li><a href="${r('category/' + c.slug + '.html')}">${esc(c.name)}</a></li>`).join('')}</ul></div>
        <div><h2 class="site-footer__h">More topics</h2><ul>${CATEGORIES.slice(6).map((c) => `<li><a href="${r('category/' + c.slug + '.html')}">${esc(c.name)}</a></li>`).join('')}</ul></div>
        <div><h2 class="site-footer__h">Popular guides</h2><ul>${popular.slice(0, 5).map((a) => `<li><a href="${r('articles/' + a.slug + '.html')}">${esc(a.shortTitle || a.title)}</a></li>`).join('')}</ul></div>
        <div><h2 class="site-footer__h">Publication</h2><ul>
          <li><a href="${r('about.html')}">About</a></li><li><a href="${r('authors.html')}">Authors</a></li><li><a href="${r('editorial-policy.html')}">Editorial policy</a></li><li><a href="${r('corrections-policy.html')}">Corrections</a></li><li><a href="${r('resources.html')}">Resources</a></li><li><a href="${r('contact.html')}">Contact</a></li></ul></div>
      </nav>
    </div>
    <div class="site-footer__bottom">
      <p>&copy; ${SITE.founded} ${esc(SITE.name)}. Independent security &amp; privacy journalism.</p>
      <ul><li><a href="${r('privacy-policy.html')}">Privacy</a></li><li><a href="${r('terms.html')}">Terms</a></li><li><a href="${r('directory.html')}">Directory</a></li><li><a href="${r('sitemap.xml')}">Sitemap</a></li></ul>
    </div>
  </div>
</footer>`;
}

// ---------- Page shell ----------
export function layout({ depth = 0, path, title, description, content, active = '', bodyClass = '', ogType = 'website', ogImage, schema = [], css = [], js = [], robots = 'index,follow', popular = [], rootPrefix = null }) {
  // rootPrefix '/' = absolute links, needed for 404.html which a host may serve at any URL depth
  const r = rootPrefix != null ? (p = '') => rootPrefix + p : rel(depth);
  const canonical = SITE.url + '/' + (path === 'index.html' ? '' : path);
  const image = ogImage || SITE.url + '/assets/images/og-default.svg';
  const fullTitle = path === 'index.html' ? `${SITE.name}: ${SITE.tagline}` : `${title} | ${SITE.name}`;
  return `<!doctype html>
<html lang="en" data-font="${FONT_KEY}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image}">
<meta property="og:locale" content="${SITE.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="${SITE.twitter}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${image}">
<meta name="theme-color" content="#0f1c2e">
<link rel="icon" href="${r('assets/icons/favicon.svg')}" type="image/svg+xml">
<link rel="manifest" href="${r('site.webmanifest')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${FONT.google}&display=swap">
<style>html[data-font]{--f-display:${FONT.display};--f-serif:${FONT.serif};--f-sans:${FONT.sans}}</style>
<link rel="stylesheet" href="${r('css/main.css')}">
${css.map((c) => `<link rel="stylesheet" href="${r('css/' + c)}">`).join('\n')}
<link rel="stylesheet" href="${r('css/responsive.css')}">
<script>try{var t=localStorage.getItem('hw-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
${schema.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body class="${bodyClass}" data-root="${r()}">
${header(r, active)}
<main id="main">
${content}
</main>
${footer(r, popular)}
<script src="${r('js/articles-data.js')}" defer></script>
<script src="${r('js/articles.js')}" defer></script>
<script src="${r('js/main.js')}" defer></script>
${js.map((j) => `<script src="${r('js/' + j)}" defer></script>`).join('\n')}
</body>
</html>`;
}
