// ---------------------------------------------------------------------------
// Hardenwire static site generator. Zero dependencies.
// Run:  node _build/build.mjs
// Reads  /content/articles/*.html  and  /content/pages/*.html
// Writes the full static site into the project root.
// ---------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, CATEGORIES, AUTHORS, catBySlug, authorBySlug, BRIEFINGS, RESOURCES } from './data.mjs';
import { coverSVG, CATEGORY_MOTIF } from './illustrations.mjs';
import * as T from './templates.mjs';

const { esc, fmtDate, rel, icon, card, badge, meta, img, imageUrl, credit, numberedList, sectionHead, breadcrumb, breadcrumbSchema, avatar, newsletterBox, layout, logoMark } = T;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = (p, s) => { const f = path.join(ROOT, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const slugify = (s) => s.toLowerCase().replace(/&[a-z]+;/g, '').replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const words = (html) => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

// Site settings saved by the admin panel (data/settings.json). Optional.
const SETTINGS = (() => {
  try { return { fontPreset: 'editorial', ...JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings.json'), 'utf8')) }; }
  catch { return { fontPreset: 'editorial' }; }
})();

// ---------- Load content ----------
function parseFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---json\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!m) throw new Error('Missing front matter in ' + file);
  return { meta: JSON.parse(m[1]), body: m[2] };
}

const articles = fs.readdirSync(path.join(ROOT, 'content/articles')).filter((f) => f.endsWith('.html')).map((f) => {
  const { meta: a, body } = parseFile(path.join(ROOT, 'content/articles', f));
  a.body = body;
  a.also = a.also || [];
  // Defaults so posts created in the admin panel only need the essentials
  a.tags = a.tags || [];
  a.takeaways = a.takeaways || [];
  a.secondaryKeywords = a.secondaryKeywords || [];
  a.primaryKeyword = a.primaryKeyword || a.title;
  a.seoTitle = a.seoTitle || a.title;
  a.popularity = Number(a.popularity) || 0;
  a.motif = a.motif || CATEGORY_MOTIF[a.category] || 'shield';
  a.imageAlt = a.imageAlt || a.title;
  const faqWords = (a.faq || []).reduce((n, q) => n + words(q.q + ' ' + q.a), 0);
  a.wordCount = words(body) + faqWords;
  a.readingTime = Math.max(3, Math.round(a.wordCount / 230));
  a.updated = a.updated || a.published;
  for (const c of [a.category, ...a.also]) if (!catBySlug[c]) throw new Error(`Unknown category ${c} in ${f}`);
  if (!authorBySlug[a.author]) throw new Error(`Unknown author in ${f}`);
  return a;
}).sort((x, y) => y.published.localeCompare(x.published));

const bySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));
const popular = [...articles].sort((a, b) => b.popularity - a.popularity);
const recentlyUpdated = [...articles].sort((a, b) => b.updated.localeCompare(a.updated));
const inCat = (slug) => articles.filter((a) => {
  const cats = [a.category, ...a.also];
  return cats.includes(slug) || cats.some((c) => catBySlug[c].parent === slug);
});
const articleUrl = (a) => 'articles/' + a.slug + '.html';

// ---------- Body processing ----------
function processBody(html, r) {
  html = html.replace(/\{\{a:([a-z0-9-]+)\}\}/g, (_, s) => { if (!bySlug[s]) throw new Error('Broken article link: ' + s); return r(articleUrl(bySlug[s])); });
  html = html.replace(/\{\{c:([a-z0-9-]+)\}\}/g, (_, s) => { if (!catBySlug[s]) throw new Error('Broken category link: ' + s); return r('category/' + s + '.html'); });
  html = html.replace(/\{\{p:([a-z0-9./?=-]+)\}\}/g, (_, s) => r(s));
  const toc = [];
  const used = new Set();
  html = html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (all, lvl, attrs = '', inner) => {
    let id = (attrs.match(/id="([^"]+)"/) || [])[1];
    if (!id) { id = slugify(inner); while (used.has(id)) id += '-x'; attrs += ` id="${id}"`; }
    used.add(id);
    if (lvl === '2') toc.push({ id, text: inner.replace(/<[^>]+>/g, '') });
    return `<h${lvl}${attrs}>${inner}</h${lvl}>`;
  });
  // Tables: wrap for horizontal scroll on small screens
  html = html.replace(/<table/g, '<div class="table-wrap" tabindex="0"><table').replace(/<\/table>/g, '</table></div>');
  return { html, toc };
}

function related(a, n = 3) {
  const cats = new Set([a.category, ...a.also]);
  return articles.filter((b) => b !== a).map((b) => {
    let score = 0;
    if (b.category === a.category) score += 4;
    [b.category, ...b.also].forEach((c) => cats.has(c) && (score += 2));
    b.tags.forEach((t) => a.tags.includes(t) && (score += 1));
    return { b, score: score + b.popularity / 1000 };
  }).sort((x, y) => y.score - x.score).slice(0, n).map((x) => x.b);
}

// ---------- Shared schema ----------
const ORG = {
  '@type': 'Organization', '@id': SITE.url + '/#organization', name: SITE.name, url: SITE.url,
  logo: { '@type': 'ImageObject', url: SITE.url + '/assets/icons/logo-512.svg', width: 512, height: 512 },
};

// ---------- ARTICLE PAGES ----------
function shareButtons(a, cls) {
  const u = encodeURIComponent(SITE.url + '/' + articleUrl(a));
  const t = encodeURIComponent(a.title);
  return `<div class="share ${cls}" aria-label="Share this article">
  <span class="share__label">Share</span>
  <a class="share__btn" href="https://x.com/intent/post?url=${u}&amp;text=${t}" target="_blank" rel="noopener" aria-label="Share on X">${icon('x')}</a>
  <a class="share__btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${u}" target="_blank" rel="noopener" aria-label="Share on LinkedIn">${icon('linkedin')}</a>
  <a class="share__btn" href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener" aria-label="Share on Facebook">${icon('facebook')}</a>
  <a class="share__btn" href="mailto:?subject=${t}&amp;body=${u}" aria-label="Share by email">${icon('mail')}</a>
  <button class="share__btn js-copy-link" type="button" aria-label="Copy link" data-url="${SITE.url}/${articleUrl(a)}">${icon('link')}</button>
</div>`;
}

function articlePage(a, idx) {
  const depth = 1; const r = rel(depth);
  const { html, toc } = processBody(a.body, r);
  const cat = catBySlug[a.category];
  const parent = cat.parent ? catBySlug[cat.parent] : null;
  const author = authorBySlug[a.author];
  const crumbs = [{ name: 'Home', href: 'index.html' }, ...(parent ? [{ name: parent.name, href: `category/${parent.slug}.html` }] : []), { name: cat.name, href: `category/${cat.slug}.html` }, { name: a.shortTitle || a.title, href: articleUrl(a) }];
  const fullToc = [...toc, ...(a.faq?.length ? [{ id: 'faq', text: 'Frequently asked questions' }] : []), ...(a.sources?.length ? [{ id: 'sources', text: 'Sources' }] : [])];
  const tocList = `<ol>${fullToc.map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ol>`;
  const chronological = [...articles].sort((x, y) => x.published.localeCompare(y.published));
  const ci = chronological.indexOf(a);
  const prev = chronological[ci - 1]; const next = chronological[ci + 1];
  const rel3 = related(a);

  const schema = [
    {
      '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.description,
      image: [a.photo ? imageUrl(a) : SITE.url + '/assets/images/articles/' + a.slug + '.svg'], datePublished: a.published, dateModified: a.updated,
      author: [{ '@type': 'Person', name: author.name, url: SITE.url + '/authors/' + author.slug + '.html', jobTitle: author.role }],
      publisher: ORG, mainEntityOfPage: SITE.url + '/' + articleUrl(a), articleSection: cat.name, keywords: [a.primaryKeyword, ...a.secondaryKeywords].join(', '), wordCount: a.wordCount,
    },
    breadcrumbSchema(crumbs),
  ];
  if (a.faq?.length) schema.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: a.faq.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a.replace(/<[^>]+>/g, '') } })) });

  const content = `
<div class="progress" aria-hidden="true"><span class="js-progress"></span></div>
<article class="article">
  <header class="article-hero container">
    ${breadcrumb(r, crumbs)}
    <div class="article-hero__badges">${badge(r, a.category)}${a.beginner ? '<span class="pill">Beginner friendly</span>' : ''}</div>
    <h1 class="article-hero__title">${esc(a.title)}</h1>
    <p class="article-hero__dek">${esc(a.dek)}</p>
    <div class="byline">
      ${avatar(author, 44)}
      <div class="byline__who"><a class="byline__name" href="${r('authors/' + author.slug + '.html')}">${esc(author.name)}</a><span class="byline__role">${esc(author.role)}</span></div>
      <dl class="byline__dates">
        <div><dt>Published</dt><dd><time datetime="${a.published}">${fmtDate(a.published)}</time></dd></div>
        ${a.updated !== a.published ? `<div><dt>Updated</dt><dd><time datetime="${a.updated}">${fmtDate(a.updated)}</time></dd></div>` : ''}
        <div><dt>Reading time</dt><dd>${a.readingTime} min</dd></div>
      </dl>
    </div>
  </header>
  <figure class="article-figure container container--wide">
    ${img(r, a, { eager: true, cls: 'article-figure__img' })}
    <figcaption>${a.imageCaption ? esc(a.imageCaption) + '. ' : ''}${credit(a)}</figcaption>
  </figure>
  <div class="article-layout container container--wide">
    <aside class="article-layout__rail">${shareButtons(a, 'share--rail')}</aside>
    <div class="article-main">
      <details class="toc toc--inline"><summary>${icon('list')} On this page</summary>${tocList}</details>
      ${a.takeaways.length ? `<aside class="takeaways" aria-labelledby="kt">
        <h2 class="takeaways__title" id="kt">Key takeaways</h2>
        <ul>${a.takeaways.map((t) => `<li>${t}</li>`).join('')}</ul>
      </aside>` : ''}
      <div class="prose">
${html}
      </div>
      ${a.faq?.length ? `<section class="faq" aria-labelledby="faq"><h2 id="faq">Frequently asked questions</h2>${a.faq.map((q, i) => `<details class="faq__item"${i === 0 ? ' open' : ''}><summary><h3>${esc(q.q)}</h3>${icon('chevron', 'icon icon--sm')}</summary><div class="faq__a"><p>${q.a}</p></div></details>`).join('')}</section>` : ''}
      ${a.sources?.length ? `<section class="sources" aria-labelledby="sources"><h2 id="sources">Sources</h2><ol>${a.sources.map((s) => `<li><a href="${s.url}" rel="noopener" target="_blank">${esc(s.name)}</a>${s.note ? `. ${esc(s.note)}` : ''}</li>`).join('')}</ol><p class="sources__note">Menu names and settings change between software versions. We review this guide regularly; see our <a href="${r('corrections-policy.html')}">corrections policy</a> if you spot something out of date.</p></section>` : ''}
      <div class="article-tags"><span>Topics:</span>${a.tags.map((t) => `<a class="tag" href="${r('search.html?q=' + encodeURIComponent(t))}">${esc(t)}</a>`).join('')}</div>
      ${shareButtons(a, 'share--inline')}
      <aside class="author-box">
        ${avatar(author, 64)}
        <div><p class="kicker">Written by</p><h2 class="author-box__name"><a href="${r('authors/' + author.slug + '.html')}">${esc(author.name)}</a></h2><p class="author-box__role">${esc(author.role)}</p><p>${esc(author.bio)}</p></div>
      </aside>
      <p class="review-note">${icon('shield')}<span>Reviewed under the Hardenwire <a href="${r('editorial-policy.html')}">editorial policy</a>. We don't accept payment for coverage, and this guide contains no affiliate links.</span></p>
      <nav class="prevnext" aria-label="More articles">
        ${prev ? `<a class="prevnext__link prevnext__link--prev" href="${r(articleUrl(prev))}"><span>${icon('arrowLeft')} Previous</span><strong>${esc(prev.title)}</strong></a>` : '<span></span>'}
        ${next ? `<a class="prevnext__link prevnext__link--next" href="${r(articleUrl(next))}"><span>Next ${icon('arrow')}</span><strong>${esc(next.title)}</strong></a>` : '<span></span>'}
      </nav>
    </div>
    <aside class="article-layout__toc"><nav class="toc toc--rail js-toc" aria-label="On this page"><p class="toc__title">On this page</p>${tocList}</nav></aside>
  </div>
</article>
<section class="section section--tint">
  <div class="container">
    ${sectionHead('Keep reading', { href: r('category/' + a.category + '.html'), linkText: 'More in ' + cat.name })}
    <div class="grid grid--3">${rel3.map((b) => card(r, b)).join('')}</div>
  </div>
</section>
<div class="container section">${newsletterBox(r, { variant: 'card', heading: 'Get guides like this every Thursday', id: 'nl-art' })}</div>
<div class="mobile-bar" aria-label="Article tools">
  <button class="mobile-bar__btn js-toc-sheet" type="button">${icon('list')} Contents</button>
  <span class="mobile-bar__time">${icon('clock', 'icon icon--sm')} ${a.readingTime} min</span>
  <button class="mobile-bar__btn js-native-share" type="button" data-title="${esc(a.title)}" data-url="${SITE.url}/${articleUrl(a)}">${icon('share')} Share</button>
</div>
<div class="sheet" id="toc-sheet" hidden><div class="sheet__panel" role="dialog" aria-modal="true" aria-label="Contents"><div class="sheet__head"><p class="toc__title">On this page</p><button class="icon-btn js-sheet-close" type="button" aria-label="Close contents">${icon('close')}</button></div><nav class="toc">${tocList}</nav></div></div>`;

  return layout({ depth, path: articleUrl(a), title: a.seoTitle, description: a.description, content, ogType: 'article', ogImage: a.photo ? imageUrl(a) : SITE.url + '/assets/images/articles/' + a.slug + '.svg', schema, css: ['article.css'], bodyClass: 'page-article', popular });
}

// ---------- HOME ----------
function homePage() {
  const r = rel(0);
  // Prefer articles whose *primary* category sits in the hub, then the rest
  const hubFirst = (hub, skip) => { const l = inCat(hub).filter((a) => !skip.has(a)); const own = (a) => a.category === hub || catBySlug[a.category].parent === hub; return [...l.filter(own), ...l.filter((a) => !own(a))]; };
  const lead = articles.find((a) => a.featured) || articles[0];
  const side = articles.filter((a) => a !== lead && a.heroSupport).slice(0, 3);
  const used = new Set([lead, ...side]);
  const latest = articles.filter((a) => !used.has(a)).slice(0, 4);
  latest.forEach((a) => used.add(a));
  // Each desk avoids stories already shown above and in earlier desks; it
  // falls back to repeats only when a hub is too small to fill on its own.
  const deskShown = new Set();
  const desks = ['cybersecurity', 'privacy', 'online-safety'].map((slug) => {
    let list = hubFirst(slug, new Set([...used, ...deskShown]));
    if (list.length < 3) list = [...list, ...hubFirst(slug, new Set([lead, ...deskShown, ...list]))];
    list = list.slice(0, 4);
    list.forEach((a) => deskShown.add(a));
    return { c: catBySlug[slug], list };
  });
  const picks = articles.filter((a) => a.editorsPick).slice(0, 2);
  const beginner = ['passkeys-explained', 'two-factor-authentication-methods', 'how-to-spot-a-phishing-email', 'secure-your-home-router'].map((s) => bySlug[s]);
  const lastUpdate = articles.reduce((m, a) => (a.updated > m ? a.updated : m), '0');
  const label = (a) => `<p class="label"><a href="${r('category/' + a.category + '.html')}">${esc(catBySlug[a.category].name)}</a></p>`;

  const content = `
<div class="intro-line"><div class="container">
  <h1>${esc(SITE.tagline)}</h1>
  <p>Independent guides to cybersecurity and privacy · Updated <time datetime="${lastUpdate}">${fmtDate(lastUpdate)}</time></p>
</div></div>

<section class="container lead" aria-label="Top stories">
  <article class="lead__main">
    <a class="lead__media" href="${r(articleUrl(lead))}" tabindex="-1" aria-hidden="true">${img(r, lead, { eager: true })}</a>
    ${label(lead)}
    <h2 class="lead__title"><a href="${r(articleUrl(lead))}">${esc(lead.title)}</a></h2>
    <p class="lead__dek">${esc(lead.dek)}</p>
    ${meta(lead)}
  </article>
  <div class="lead__side">
    ${side.map((a) => `<article class="side-story">
      ${label(a)}
      <h2 class="side-story__title"><a href="${r(articleUrl(a))}">${esc(a.title)}</a></h2>
      <p class="side-story__dek">${esc(a.dek.split('. ')[0])}.</p>
      ${meta(a, { author: false })}
    </article>`).join('')}
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead('Latest', { href: r('articles.html'), linkText: 'All guides' })}
    <div class="grid grid--4">${latest.map((a) => card(r, a, { showDek: false })).join('')}</div>
  </div>
</section>

<section class="section section--flush">
  <div class="container">
    ${sectionHead('Sections', { href: r('categories.html'), linkText: 'All topics' })}
    <div class="desks">
      ${desks.map(({ c, list }) => `<div class="desk">
        <h3 class="desk__title"><a href="${r('category/' + c.slug + '.html')}">${esc(c.name)}</a></h3>
        <p class="desk__desc">${esc(c.short)}</p>
        ${card(r, list[0], { showDek: false, headingLevel: 4 })}
        <ul class="desk__list">${list.slice(1).map((a) => `<li><a href="${r(articleUrl(a))}">${esc(a.title)}</a><span>${a.readingTime} min read</span></li>`).join('')}</ul>
        <a class="more-link" href="${r('category/' + c.slug + '.html')}">More in ${esc(c.name)} ${icon('arrow')}</a>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section section--flush start-here">
  <div class="container">
    ${sectionHead('Start here')}
    <p class="section-intro">New to security? Most of the protection you need comes from four changes. Read these in order.</p>
    <ol class="steps-path">
      ${beginner.map((a, i) => `<li class="steps-path__item"><span class="steps-path__n">${i + 1}</span><h3><a href="${r(articleUrl(a))}">${esc(a.shortTitle || a.title)}</a></h3><p>${esc(a.stepBlurb || a.dek)}</p><span class="meta">${a.readingTime} min read</span></li>`).join('')}
    </ol>
  </div>
</section>

<section class="section section--flush">
  <div class="container two-col">
    <div>
      ${sectionHead('Most read')}
      ${numberedList(r, popular.slice(0, 5))}
    </div>
    <div>
      ${sectionHead("Editor's picks")}
      <div class="picks">${picks.map((a) => card(r, a, { variant: 'row' })).join('')}</div>
    </div>
  </div>
</section>

<div class="container section section--flush">${newsletterBox(r, { variant: 'card', id: 'nl-home' })}</div>`;
  const schema = [
    { '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE.url + '/#website', url: SITE.url + '/', name: SITE.name, description: SITE.description, publisher: { '@id': SITE.url + '/#organization' }, potentialAction: { '@type': 'SearchAction', target: SITE.url + '/search.html?q={search_term_string}', 'query-input': 'required name=search_term_string' } },
    { '@context': 'https://schema.org', ...ORG, description: SITE.description, foundingDate: SITE.founded, email: SITE.email.editorial },
  ];
  return layout({ depth: 0, path: 'index.html', title: `${SITE.name}: Cybersecurity & Privacy Guides`, description: SITE.description, content, schema, bodyClass: 'page-home', popular });
}

// ---------- CATEGORY PAGES ----------
function categoryPage(c) {
  const depth = 1; const r = rel(depth);
  const list = inCat(c.slug);
  const featured = list.find((a) => a.category === c.slug && a.featured) || list.find((a) => a.category === c.slug) || list[0];
  const rest = list.filter((a) => a !== featured);
  const pop = [...list].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
  const subs = CATEGORIES.filter((x) => x.parent === c.slug);
  const parent = c.parent ? catBySlug[c.parent] : null;
  const crumbs = [{ name: 'Home', href: 'index.html' }, { name: 'Topics', href: 'categories.html' }, ...(parent ? [{ name: parent.name, href: `category/${parent.slug}.html` }] : []), { name: c.name, href: `category/${c.slug}.html` }];
  const elsewhere = popular.filter((a) => !list.includes(a)).slice(0, 3);
  const title = c.parent ? `${c.name} Guides` : `${c.name}: Guides & Explainers`;
  const content = `
<header class="cat-hero cat-hero--${c.tone}">
  <div class="container cat-hero__inner">
    <div>
      ${breadcrumb(r, crumbs)}
      <p class="kicker">${parent ? esc(parent.name) : 'Topic hub'}</p>
      <h1 class="cat-hero__title">${esc(c.name)}</h1>
      <p class="cat-hero__lede">${esc(c.short)}</p>
      <p class="cat-hero__intro">${esc(c.intro)}</p>
      <p class="cat-hero__count">${list.length} ${list.length === 1 ? 'guide' : 'guides'} · Updated ${fmtDate(list.reduce((m, a) => (a.updated > m ? a.updated : m), '0'))}</p>
      ${subs.length ? `<ul class="chips" aria-label="Subtopics">${subs.map((s) => `<li><a class="chip" href="${r('category/' + s.slug + '.html')}">${esc(s.name)}</a></li>`).join('')}</ul>` : ''}
    </div>
    ${img(r, featured, { cls: 'cat-hero__art', eager: true, sizes: '(max-width: 1024px) 1px, 40vw' })}
  </div>
</header>
<section class="section">
  <div class="container">
    ${sectionHead('Featured guide', { kicker: c.name })}
    ${card(r, featured, { variant: 'feature-wide', headingLevel: 3, eager: false })}
  </div>
</section>
<section class="section section--rule">
  <div class="container cat-layout">
    <div>
      ${sectionHead(`Latest in ${c.name}`)}
      ${rest.length ? `<div class="grid grid--2">${rest.map((a) => card(r, a)).join('')}</div>` : `<p class="empty">More ${esc(c.name.toLowerCase())} guides are on the way. <a href="${r('newsletter.html')}">Subscribe</a> to hear when they're published.</p>`}
    </div>
    <aside class="cat-aside">
      ${sectionHead('Most read')}
      ${numberedList(r, pop)}
      <div class="cat-aside__box">
        <h2 class="cat-aside__h">Related topics</h2>
        <ul class="chips chips--stack">${(c.related || []).map((s) => `<li><a class="chip" href="${r('category/' + s + '.html')}">${esc(catBySlug[s].name)}</a></li>`).join('')}</ul>
      </div>
    </aside>
  </div>
</section>
${elsewhere.length ? `<section class="section section--tint"><div class="container">${sectionHead('Popular across Hardenwire', { href: r('articles.html'), linkText: 'All guides' })}<div class="grid grid--3">${elsewhere.map((a) => card(r, a, { showDek: false })).join('')}</div></div></section>` : ''}
<div class="container section">${newsletterBox(r, { variant: 'card', id: 'nl-cat' })}</div>`;
  const schema = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description: c.short, url: `${SITE.url}/category/${c.slug}.html`, isPartOf: { '@id': SITE.url + '/#website' }, mainEntity: { '@type': 'ItemList', itemListElement: list.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE.url + '/' + articleUrl(a), name: a.title })) } },
    breadcrumbSchema(crumbs),
  ];
  return layout({ depth, path: `category/${c.slug}.html`, title, description: `${c.short} Practical, independent ${c.name.toLowerCase()} guides from ${SITE.name}.`, content, schema, active: c.parent || c.slug, bodyClass: 'page-category', popular });
}

// ---------- ALL ARTICLES (filterable) ----------
function articlesPage() {
  const r = rel(0);
  const tags = [...new Set(articles.flatMap((a) => a.tags))].sort();
  const content = `
<header class="page-hero"><div class="container">
  ${breadcrumb(r, [{ name: 'Home', href: 'index.html' }, { name: 'All guides', href: 'articles.html' }])}
  <h1 class="page-hero__title">All guides</h1>
  <p class="page-hero__lede">Every Hardenwire guide and explainer. Filter by topic, sort by what's new or most read, or find something you can finish in a coffee break.</p>
</div></header>
<section class="section section--flush">
  <div class="container listing">
    <aside class="filters js-filters" aria-label="Filter guides">
      <div class="filters__head"><h2 class="filters__title">Filter</h2><button class="link-btn js-filter-reset" type="button">Reset</button></div>
      <fieldset class="filters__group"><legend>Category</legend>
        <label class="check"><input type="radio" name="cat" value="" checked> All topics <span>${articles.length}</span></label>
        ${CATEGORIES.filter((h) => !h.parent).flatMap((h) => [h, ...CATEGORIES.filter((s) => s.parent === h.slug)]).map((c) => `<label class="check${c.parent ? ' check--sub' : ''}"><input type="radio" name="cat" value="${c.slug}"> ${esc(c.name)} <span>${inCat(c.slug).length}</span></label>`).join('')}
      </fieldset>
      <fieldset class="filters__group"><legend>Reading time</legend>
        <label class="check"><input type="radio" name="time" value="" checked> Any length</label>
        ${[['0-6', 'Quick read (under 6 min)'], ['6-7', 'About 6 minutes'], ['7-99', '7 minutes or more']].map(([v, l]) => { const [lo, hi] = v.split('-').map(Number); return `<label class="check"><input type="radio" name="time" value="${v}"> ${l} <span>${articles.filter((a) => a.readingTime >= lo && a.readingTime < hi).length}</span></label>`; }).join('')}
      </fieldset>
      <fieldset class="filters__group"><legend>Topic tags</legend>
        <div class="tag-cloud">${tags.map((t) => `<label class="tag-toggle"><input type="checkbox" name="tag" value="${esc(t)}"><span>${esc(t)}</span></label>`).join('')}</div>
      </fieldset>
    </aside>
    <div class="listing__main">
      <div class="listing__bar">
        <p class="listing__count" aria-live="polite"><strong class="js-count">${articles.length}</strong> guides</p>
        <button class="btn btn--ghost btn--sm filters-toggle js-filters-toggle" type="button" aria-expanded="false">Filters</button>
        <label class="select"><span>Sort</span><select class="js-sort" aria-label="Sort guides"><option value="latest">Latest</option><option value="popular">Most read</option><option value="updated">Recently updated</option><option value="short">Shortest first</option><option value="long">Longest first</option></select></label>
      </div>
      <div class="grid grid--3 listing__grid js-listing">${articles.map((a) => card(r, a)).join('')}</div>
      <p class="empty js-empty" hidden>No guides match those filters. <button class="link-btn js-filter-reset" type="button">Clear filters</button></p>
    </div>
  </div>
</section>`;
  return layout({ depth: 0, path: 'articles.html', title: 'All Cybersecurity & Privacy Guides', description: 'Browse every Hardenwire guide: phishing, passkeys, VPNs, router security, data breaches, browser privacy and more. Filter by topic and reading time.', content, active: 'articles', js: ['filters.js'], popular, schema: [breadcrumbSchema([{ name: 'Home', href: 'index.html' }, { name: 'All guides', href: 'articles.html' }])] });
}

// ---------- SEARCH ----------
function searchPage() {
  const r = rel(0);
  const content = `
<header class="page-hero page-hero--search"><div class="container">
  <h1 class="page-hero__title js-search-heading">Search</h1>
  <form class="search-big" action="search.html" method="get" role="search">
    <label class="sr-only" for="q">Search guides</label>
    ${icon('search')}
    <input id="q" name="q" type="search" placeholder="Try “phishing”, “router” or “passkeys”" autocomplete="off" class="js-search-input">
    <button class="btn btn--ink" type="submit">Search</button>
  </form>
  <div class="search-filters js-search-cats" aria-label="Filter results by category"></div>
</div></header>
<section class="section section--flush">
  <div class="container search-results">
    <p class="search-results__summary js-search-summary" aria-live="polite"></p>
    <div class="js-search-results results-list"></div>
    <div class="search-empty js-search-empty" hidden>
      <h2>No matches. Try one of these</h2>
      <ul class="chips">${CATEGORIES.map((c) => `<li><a class="chip" href="category/${c.slug}.html">${esc(c.name)}</a></li>`).join('')}</ul>
    </div>
  </div>
</section>`;
  return layout({ depth: 0, path: 'search.html', title: 'Search', description: 'Search Hardenwire guides by title, topic, keyword or tag.', content, js: ['search.js'], robots: 'noindex,follow', popular });
}

// ---------- CATEGORIES INDEX ----------
function categoriesPage() {
  const r = rel(0);
  const hubs = CATEGORIES.filter((c) => !c.parent);
  const content = `
<header class="page-hero"><div class="container">
  ${breadcrumb(r, [{ name: 'Home', href: 'index.html' }, { name: 'Topics', href: 'categories.html' }])}
  <h1 class="page-hero__title">Topics</h1>
  <p class="page-hero__lede">Hardenwire is organised into three hubs (cybersecurity, privacy and online safety), each with focused sub-topics.</p>
</div></header>
${hubs.map((h) => `<section class="section section--rule hub">
  <div class="container hub__grid">
    <div class="hub__intro">
      <h2 class="hub__title"><a href="${r('category/' + h.slug + '.html')}">${esc(h.name)}</a></h2>
      <p>${esc(h.intro)}</p>
      <a class="btn btn--ghost btn--sm" href="${r('category/' + h.slug + '.html')}">Explore ${esc(h.name.toLowerCase())} ${icon('arrow')}</a>
    </div>
    <div class="topic-grid topic-grid--2">
      ${CATEGORIES.filter((c) => c.parent === h.slug).map((c) => `<a class="topic topic--${c.tone}" href="${r('category/' + c.slug + '.html')}"><span class="topic__name">${esc(c.name)}</span><span class="topic__desc">${esc(c.short)}</span><span class="topic__count">${inCat(c.slug).length} guides</span></a>`).join('')}
    </div>
  </div>
</section>`).join('')}`;
  return layout({ depth: 0, path: 'categories.html', title: 'Topics: Cybersecurity, Privacy & Online Safety', description: 'Browse Hardenwire by topic: password security, phishing, malware, VPNs, browser and mobile security, network security, data privacy and identity protection.', content, popular, schema: [breadcrumbSchema([{ name: 'Home', href: 'index.html' }, { name: 'Topics', href: 'categories.html' }])] });
}

// ---------- AUTHORS ----------
function authorsPage() {
  const r = rel(0);
  const content = `
<header class="page-hero"><div class="container">
  ${breadcrumb(r, [{ name: 'Home', href: 'index.html' }, { name: 'Authors', href: 'authors.html' }])}
  <h1 class="page-hero__title">Our editors &amp; writers</h1>
  <p class="page-hero__lede">Every Hardenwire article has a named author who is responsible for it and a second editor who checks it. Here's who writes what.</p>
</div></header>
<section class="section"><div class="container grid grid--2">
  ${AUTHORS.map((au) => { const n = articles.filter((a) => a.author === au.slug); return `<article class="author-card">${avatar(au, 72)}<div><h2 class="author-card__name"><a href="${r('authors/' + au.slug + '.html')}">${esc(au.name)}</a></h2><p class="author-card__role">${esc(au.role)}</p><p>${esc(au.bio)}</p><p class="meta">${n.length} articles · Covers ${au.beat.map((b) => esc(catBySlug[b].name)).join(', ')}</p></div></article>`; }).join('')}
</div></section>`;
  return layout({ depth: 0, path: 'authors.html', title: 'Authors & Editors', description: 'Meet the editors and writers behind Hardenwire’s cybersecurity and privacy coverage.', content, popular });
}

function authorPage(au) {
  const depth = 1; const r = rel(depth);
  const list = articles.filter((a) => a.author === au.slug);
  const crumbs = [{ name: 'Home', href: 'index.html' }, { name: 'Authors', href: 'authors.html' }, { name: au.name, href: `authors/${au.slug}.html` }];
  const content = `
<header class="page-hero"><div class="container author-hero">
  ${breadcrumb(r, crumbs)}
  <div class="author-hero__row">${avatar(au, 96)}<div><p class="kicker">${esc(au.role)}</p><h1 class="page-hero__title">${esc(au.name)}</h1><p class="page-hero__lede">${esc(au.bio)}</p>
  <ul class="chips">${au.beat.map((b) => `<li><a class="chip" href="${r('category/' + b + '.html')}">${esc(catBySlug[b].name)}</a></li>`).join('')}</ul></div></div>
</div></header>
<section class="section"><div class="container">
  ${sectionHead(`Articles by ${au.name}`)}
  <div class="grid grid--3">${list.map((a) => card(r, a)).join('')}</div>
</div></section>`;
  const schema = [{ '@context': 'https://schema.org', '@type': 'ProfilePage', mainEntity: { '@type': 'Person', name: au.name, jobTitle: au.role, description: au.bio, worksFor: { '@id': SITE.url + '/#organization' }, url: `${SITE.url}/authors/${au.slug}.html` } }, breadcrumbSchema(crumbs)];
  return layout({ depth, path: `authors/${au.slug}.html`, title: `${au.name}, ${au.role}`, description: `${au.short} Read every article by ${au.name} on ${SITE.name}.`, content, schema, popular });
}

// ---------- RESOURCES ----------
function resourcesPage() {
  const r = rel(0);
  const checklists = [
    { t: 'The 30-minute account lockdown', items: ['Install a password manager and save your email password in it first', 'Turn on two-factor authentication for email, bank and Apple/Google account', 'Add a passkey wherever it is offered', 'Print or store your recovery codes offline', 'Check your email address on Have I Been Pwned'], link: 'two-factor-authentication-methods' },
    { t: 'Home network check', items: ['Change the router admin password', 'Update the router firmware', 'Use WPA3 or WPA2-AES Wi-Fi security', 'Turn off WPS and remote administration', 'Put smart devices on a guest network'], link: 'secure-your-home-router' },
    { t: 'If you think you’ve been scammed', items: ['Stop all contact and payments', 'Call your bank using the number on your card', 'Change any password you disclosed, and sign out other sessions', 'Remove any remote-access software you were told to install', 'Report to ReportFraud.ftc.gov / IC3 (US) or Action Fraud (UK)'], link: 'tech-support-scams' },
  ];
  const content = `
<header class="page-hero"><div class="container">
  ${breadcrumb(r, [{ name: 'Home', href: 'index.html' }, { name: 'Resources', href: 'resources.html' }])}
  <h1 class="page-hero__title">Resources</h1>
  <p class="page-hero__lede">Checklists you can work through today, plus the official services and independent tools we recommend. None of these links are affiliate links, and nobody paid to be listed.</p>
</div></header>
<section class="section"><div class="container">
  ${sectionHead('Quick checklists', { kicker: 'Print or save' })}
  <div class="grid grid--3">${checklists.map((c) => `<article class="checklist"><h3 class="checklist__title">${esc(c.t)}</h3><ul>${c.items.map((i) => `<li>${icon('check', 'icon icon--sm')}<span>${esc(i)}</span></li>`).join('')}</ul><a class="section-head__link" href="${r(articleUrl(bySlug[c.link]))}">Full guide ${icon('arrow')}</a></article>`).join('')}</div>
</div></section>
${RESOURCES.map((g) => `<section class="section section--rule"><div class="container">
  ${sectionHead(g.group)}
  <div class="resource-list">${g.items.map((t) => `<a class="resource" href="${t.url}" rel="noopener" target="_blank"><span class="resource__name">${esc(t.name)} ${icon('external', 'icon icon--sm')}</span><span class="resource__desc">${esc(t.desc)}</span><span class="resource__host">${new URL(t.url).hostname.replace('www.', '')}</span></a>`).join('')}</div>
</div></section>`).join('')}
<div class="container section"><p class="review-note">${icon('info')}<span>Spotted a broken link or know a resource we should list? <a href="${r('contact.html')}">Tell the editors</a>. We review this page every quarter.</span></p></div>`;
  return layout({ depth: 0, path: 'resources.html', title: 'Security & Privacy Resources and Checklists', description: 'Free security checklists plus trusted official resources and independent privacy tools for checking breaches, reporting scams and protecting accounts.', content, active: 'resources', popular });
}

// ---------- NEWSLETTER ----------
function newsletterPage() {
  const r = rel(0);
  const content = `
<header class="page-hero page-hero--center"><div class="container container--narrow">
  <p class="kicker">Every Thursday · Free</p>
  <h1 class="page-hero__title">The Hardenwire Briefing</h1>
  <p class="page-hero__lede">A short weekly email from our editors with the scams currently going around, one security setting worth changing this week, and the guide we think you'll find most useful. It takes five minutes to read.</p>
  <form class="newsletter__form newsletter__form--big js-subscribe" novalidate>
    <label class="sr-only" for="nlp-email">Email address</label>
    <div class="field-row"><input id="nlp-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required><button class="btn btn--accent" type="submit">Subscribe free</button></div>
    <p class="form-note" role="status" aria-live="polite">No spam, no sponsors, no tracking pixels. Unsubscribe in one click.</p>
  </form>
</div></header>
<section class="section"><div class="container grid grid--3">
  <div class="feature-point"><span class="feature-point__n">01</span><h2>The week's scams</h2><p>The lures readers forwarded to us this week, annotated so you can recognise the pattern before it reaches you.</p></div>
  <div class="feature-point"><span class="feature-point__n">02</span><h2>One setting to change</h2><p>A single, specific change for your phone, browser or router, with the exact steps. Small enough to do on the spot.</p></div>
  <div class="feature-point"><span class="feature-point__n">03</span><h2>One guide worth reading</h2><p>Our pick from the archive or a newly published explainer, chosen for usefulness rather than clicks.</p></div>
</div></section>
<section class="section section--tint"><div class="container container--narrow prose prose--plain">
  <h2>What we do with your email address</h2>
  <p>We use it to send the Briefing and nothing else. We don't sell or share it, and we don't add open-tracking pixels or link-tracking redirects. Read the full <a href="${r('privacy-policy.html')}">privacy policy</a>.</p>
</div></section>`;
  return layout({ depth: 0, path: 'newsletter.html', title: 'Newsletter: The Hardenwire Briefing', description: 'Get the Hardenwire Briefing: a free weekly email with current scams, one security setting to change and one useful guide. No tracking pixels.', content, popular });
}

// ---------- CONTACT ----------
function contactPage() {
  const r = rel(0);
  const content = `
<header class="page-hero"><div class="container">
  ${breadcrumb(r, [{ name: 'Home', href: 'index.html' }, { name: 'Contact', href: 'contact.html' }])}
  <h1 class="page-hero__title">Contact the editors</h1>
  <p class="page-hero__lede">We read everything. Tips about new scams, corrections and story ideas are especially welcome.</p>
</div></header>
<section class="section"><div class="container contact">
  <form class="form js-contact" novalidate>
    <div class="form__row"><label for="c-name">Your name</label><input id="c-name" name="name" type="text" autocomplete="name" required></div>
    <div class="form__row"><label for="c-email">Email address</label><input id="c-email" name="email" type="email" autocomplete="email" required></div>
    <div class="form__row"><label for="c-topic">What is this about?</label>
      <select id="c-topic" name="topic" required><option value="">Choose a topic</option><option>A scam I received (tip)</option><option>Correction or update request</option><option>Story or guide suggestion</option><option>Press or partnership</option><option>Something else</option></select></div>
    <div class="form__row"><label for="c-msg">Message</label><textarea id="c-msg" name="message" rows="7" required></textarea>
      <p class="form__hint">Please don't send passwords, full card numbers or ID documents. We'll never ask for them.</p></div>
    <button class="btn btn--ink" type="submit">Send message</button>
    <p class="form-note" role="status" aria-live="polite"></p>
  </form>
  <aside class="contact__aside">
    <div class="contact__block"><h2>Editorial</h2><p><a href="mailto:${SITE.email.editorial}">${SITE.email.editorial}</a></p></div>
    <div class="contact__block"><h2>Corrections</h2><p><a href="mailto:${SITE.email.corrections}">${SITE.email.corrections}</a><br>See our <a href="${r('corrections-policy.html')}">corrections policy</a>.</p></div>
    <div class="contact__block"><h2>Scam tips</h2><p><a href="mailto:${SITE.email.tips}">${SITE.email.tips}</a><br>Forward suspicious messages as attachments where possible.</p></div>
    <div class="contact__block contact__block--warn">${icon('warn')}<p><strong>Being scammed right now?</strong> We can't intervene in individual cases. Contact your bank first, then report it via <a href="https://reportfraud.ftc.gov/" rel="noopener" target="_blank">ReportFraud.ftc.gov</a> (US) or <a href="https://www.actionfraud.police.uk/" rel="noopener" target="_blank">Action Fraud</a> (UK).</p></div>
  </aside>
</div></section>`;
  return layout({ depth: 0, path: 'contact.html', title: 'Contact', description: 'Contact the Hardenwire editors with scam tips, corrections, story ideas or press enquiries.', content, popular });
}

// ---------- STATIC PROSE PAGES (content/pages) ----------
function prosePage(file) {
  const { meta: m, body } = parseFile(path.join(ROOT, 'content/pages', file));
  const r = rel(0);
  const { html } = processBody(body, r);
  const crumbs = [{ name: 'Home', href: 'index.html' }, { name: m.title, href: m.path }];
  const content = `
<header class="page-hero"><div class="container container--narrow">
  ${breadcrumb(r, crumbs)}
  <h1 class="page-hero__title">${esc(m.title)}</h1>
  ${m.lede ? `<p class="page-hero__lede">${esc(m.lede)}</p>` : ''}
  ${m.updated ? `<p class="meta">Last updated <time datetime="${m.updated}">${fmtDate(m.updated)}</time></p>` : ''}
</div></header>
<section class="section"><div class="container container--narrow prose">${html}</div></section>`;
  return { path: m.path, html: layout({ depth: 0, path: m.path, title: m.seoTitle || m.title, description: m.description, content, popular, css: ['article.css'], schema: [breadcrumbSchema(crumbs)] }) };
}

// ---------- DIRECTORY (HTML sitemap) ----------
function directoryPage() {
  const r = rel(0);
  const pages = [['index.html', 'Home'], ['articles.html', 'All guides'], ['categories.html', 'Topics'], ['search.html', 'Search'], ['resources.html', 'Resources'], ['newsletter.html', 'Newsletter'], ['authors.html', 'Authors'], ['about.html', 'About'], ['contact.html', 'Contact'], ['editorial-policy.html', 'Editorial policy'], ['corrections-policy.html', 'Corrections policy'], ['privacy-policy.html', 'Privacy policy'], ['terms.html', 'Terms of use']];
  const content = `
<header class="page-hero"><div class="container">
  ${breadcrumb(r, [{ name: 'Home', href: 'index.html' }, { name: 'Directory', href: 'directory.html' }])}
  <h1 class="page-hero__title">Site directory</h1>
  <p class="page-hero__lede">Every page and guide on Hardenwire, grouped by topic.</p>
</div></header>
<section class="section"><div class="container directory">
  <div class="directory__col"><h2>Pages</h2><ul>${pages.map(([h, n]) => `<li><a href="${r(h)}">${n}</a></li>`).join('')}</ul>
  <h2>Authors</h2><ul>${AUTHORS.map((a) => `<li><a href="${r('authors/' + a.slug + '.html')}">${esc(a.name)}</a></li>`).join('')}</ul></div>
  ${CATEGORIES.map((c) => `<div class="directory__col"><h2><a href="${r('category/' + c.slug + '.html')}">${esc(c.name)}</a></h2><ul>${articles.filter((a) => a.category === c.slug).map((a) => `<li><a href="${r(articleUrl(a))}">${esc(a.title)}</a></li>`).join('') || '<li class="muted">See sub-topics</li>'}</ul></div>`).join('')}
</div></section>`;
  return layout({ depth: 0, path: 'directory.html', title: 'Site Directory', description: 'A complete directory of Hardenwire pages, topics and guides.', content, popular });
}

function notFoundPage() {
  const r = (p = '') => '/' + p; // absolute: 404 can be served from any folder depth
  const content = `<section class="section"><div class="container container--narrow notfound"><p class="kicker">Error 404</p><h1 class="page-hero__title">This page has gone dark.</h1><p class="page-hero__lede">The link may be old, or the page may have moved. Try a search or start from one of our most-read guides.</p>
<form class="search-big" action="${r('search.html')}" method="get" role="search"><label class="sr-only" for="nf-q">Search</label>${icon('search')}<input id="nf-q" name="q" type="search" placeholder="Search Hardenwire"><button class="btn btn--ink" type="submit">Search</button></form>
${numberedList(r, popular.slice(0, 4), 2)}</div></section>`;
  return layout({ depth: 0, path: '404.html', title: 'Page not found', description: 'The page you were looking for could not be found.', content, robots: 'noindex', popular, rootPrefix: '/' });
}

// ---------- DATA FOR CLIENT JS (swap for an API later) ----------
function clientData() {
  const data = {
    generated: new Date().toISOString().slice(0, 10),
    categories: CATEGORIES.map(({ slug, name, parent, tone }) => ({ slug, name, parent, tone })),
    authors: AUTHORS.map(({ slug, name, role }) => ({ slug, name, role })),
    articles: articles.map((a) => ({
      slug: a.slug, title: a.title, dek: a.dek, category: a.category, also: a.also, tags: a.tags,
      keywords: [a.primaryKeyword, ...a.secondaryKeywords], author: a.author, published: a.published, updated: a.updated,
      readingTime: a.readingTime, popularity: a.popularity, url: articleUrl(a), image: imageUrl(a), imageAlt: a.imageAlt,
    })),
  };
  return `/* Generated by _build/build.mjs. Do not edit by hand.\n   Replace with a fetch() to /api/articles when a backend exists (see js/articles.js). */\nwindow.HW_DATA = ${JSON.stringify(data)};\n`;
}

// ---------- Static assets ----------
function writeAssets() {
  articles.forEach((a, i) => out(`assets/images/articles/${a.slug}.svg`, coverSVG({ motif: a.motif, tone: catBySlug[a.category].tone, title: a.imageAlt, seed: i + 1 })));
  CATEGORIES.forEach((c, i) => out(`assets/images/categories/${c.slug}.svg`, coverSVG({ motif: CATEGORY_MOTIF[c.slug], tone: c.tone, title: c.name, seed: i + 3 })));
  out('assets/images/og-default.svg', coverSVG({ motif: 'shield', tone: 'ink', title: 'Hardenwire', seed: 2 }));
  const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0f1c2e"/><path d="M10 8v16M19 8v16" stroke="#fbfaf7" stroke-width="3.2" stroke-linecap="round"/><path d="M10 16h9" stroke="#fbfaf7" stroke-width="3.2"/><path d="M19 16h4.5l1.5-2.5" stroke="#c8102e" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
  out('assets/icons/favicon.svg', fav);
  out('assets/icons/logo-512.svg', fav.replace('viewBox="0 0 32 32"', 'viewBox="0 0 32 32" width="512" height="512"'));
  out('site.webmanifest', JSON.stringify({ name: SITE.name, short_name: SITE.name, start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#0f1c2e', icons: [{ src: '/assets/icons/logo-512.svg', sizes: '512x512', type: 'image/svg+xml' }] }, null, 2));
}

function sitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, d, p]) => `  <url><loc>${SITE.url}/${u}</loc><lastmod>${d}</lastmod><priority>${p}</priority></url>`).join('\n')}\n</urlset>\n`;
}

// ---------- BUILD ----------
// Everything is generated in memory first and written only if the whole build
// succeeds, so a bad edit from the admin panel can never leave a half-built site.
const today = new Date().toISOString().slice(0, 10) > '2026-11-18' ? new Date().toISOString().slice(0, 10) : '2026-11-18';
const urls = [];
const queue = [];
const q = (p, s) => queue.push([p, s]);
const write = (p, html, prio = '0.6', lastmod = today) => { q(p, html); if (p !== '404.html' && p !== 'search.html') urls.push([p === 'index.html' ? '' : p, lastmod, prio]); };

T.setTheme(SETTINGS.fontPreset);
write('index.html', homePage(), '1.0');
articles.forEach((a, i) => write(articleUrl(a), articlePage(a, i), '0.8', a.updated));
CATEGORIES.forEach((c) => write(`category/${c.slug}.html`, categoryPage(c), c.parent ? '0.7' : '0.8'));
write('articles.html', articlesPage(), '0.8');
write('search.html', searchPage());
write('categories.html', categoriesPage(), '0.7');
write('authors.html', authorsPage(), '0.4');
AUTHORS.forEach((a) => write(`authors/${a.slug}.html`, authorPage(a), '0.4'));
write('resources.html', resourcesPage(), '0.7');
write('newsletter.html', newsletterPage(), '0.5');
write('contact.html', contactPage(), '0.3');
fs.readdirSync(path.join(ROOT, 'content/pages')).filter((f) => f.endsWith('.html')).forEach((f) => { const p = prosePage(f); write(p.path, p.html, '0.3'); });
write('directory.html', directoryPage(), '0.3');
write('404.html', notFoundPage());
q('js/articles-data.js', clientData());
q('sitemap.xml', sitemap(urls));
q('robots.txt', `# ${SITE.name}\nUser-agent: *\nAllow: /\nDisallow: /_build/\nDisallow: /content/\nDisallow: /docs/\nDisallow: /data/\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

// All pages generated without errors: now write to disk.
writeAssets();
queue.forEach(([p, s]) => out(p, s));

console.log(`Built ${articles.length} articles, ${CATEGORIES.length} categories, ${urls.length} sitemap URLs.`);
console.log(articles.map((a) => `  ${a.slug.padEnd(42)} ${String(a.wordCount).padStart(5)} words  ${a.readingTime} min`).join('\n'));
