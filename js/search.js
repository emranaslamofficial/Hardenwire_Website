/* ==========================================================================
   Hardenwire: search results page  (/search.html?q=...&cat=...)
   Uses HW.ArticleService, so it works unchanged once results come from an API.
   ========================================================================== */
(function () {
  'use strict';
  var HW = window.HW;
  if (!HW) return;
  var $ = function (s) { return document.querySelector(s); };

  var input = $('.js-search-input'), out = $('.js-search-results'), summary = $('.js-search-summary'),
      empty = $('.js-search-empty'), heading = $('.js-search-heading'), catsEl = $('.js-search-cats');
  var params = new URLSearchParams(location.search);
  var state = { q: params.get('q') || '', cat: params.get('cat') || '' };
  input.value = state.q;

  function highlight(text, q) {
    var safe = HW.esc(text);
    var terms = q.trim().split(/\s+/).filter(function (t) { return t.length > 1; })
      .map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    if (!terms.length) return safe;
    return safe.replace(new RegExp('(' + terms.join('|') + ')', 'gi'), '<mark>$1</mark>');
  }

  function resultHTML(a, q) {
    return '<article class="result">' +
      '<a class="result__media" href="' + HW.ArticleService.url(a) + '" tabindex="-1" aria-hidden="true"><img src="' + HW.ArticleService.image(a) + '" alt="" width="1200" height="675" loading="lazy" decoding="async"></a>' +
      '<div><a class="badge" href="' + HW.root + 'category/' + a.category + '.html" style="position:relative;z-index:1">' + HW.esc(HW.ArticleService.categoryName(a.category)) + '</a>' +
      '<h2 class="result__title"><a href="' + HW.ArticleService.url(a) + '">' + highlight(a.title, q) + '</a></h2>' +
      '<p class="result__dek">' + highlight(a.dek, q) + '</p>' +
      '<p class="meta"><time datetime="' + a.updated + '">Updated ' + HW.fmtDate(a.updated) + '</time><span class="meta__dot"></span><span>' + a.readingTime + ' min read</span></p></div></article>';
  }

  function renderCats(data) {
    var base = HW.ArticleService.search(state.q, { allWhenEmpty: true });
    var counts = {};
    data.categories.forEach(function (c) {
      counts[c.slug] = base.filter(function (r) { return HW.ArticleService.inCategory(r.article, c.slug); }).length;
    });
    var btn = function (slug, name, n) {
      return '<button type="button" data-cat="' + slug + '" aria-pressed="' + (state.cat === slug) + '">' + HW.esc(name) + '<span>' + n + '</span></button>';
    };
    catsEl.innerHTML = btn('', 'All', base.length) + data.categories.filter(function (c) { return counts[c.slug]; }).map(function (c) { return btn(c.slug, c.name, counts[c.slug]); }).join('');
  }

  function render() {
    HW.ArticleService.load().then(function (data) {
      var results = HW.ArticleService.search(state.q, { category: state.cat, allWhenEmpty: true });
      renderCats(data);
      var catName = state.cat ? ' in ' + HW.ArticleService.categoryName(state.cat) : '';
      heading.textContent = state.q ? 'Results for “' + state.q + '”' : 'Search all guides';
      document.title = (state.q ? state.q + ': Search' : 'Search') + ' | Hardenwire';
      summary.textContent = state.q
        ? results.length + (results.length === 1 ? ' guide matches' : ' guides match') + catName + '.'
        : 'Showing all ' + results.length + ' guides' + catName + '. Type to narrow the list.';
      out.innerHTML = results.map(function (r) { return resultHTML(r.article, state.q); }).join('');
      empty.hidden = results.length > 0;
    });
  }

  function syncURL() {
    var p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.cat) p.set('cat', state.cat);
    history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
  }

  var t;
  input.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = input.value.trim(); syncURL(); render(); }, 140);
  });
  input.form.addEventListener('submit', function (e) { e.preventDefault(); state.q = input.value.trim(); syncURL(); render(); });
  catsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    state.cat = b.getAttribute('data-cat'); syncURL(); render();
  });

  render();
})();
