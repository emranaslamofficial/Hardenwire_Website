/* ==========================================================================
   Hardenwire: listing filters (articles.html)
   Progressive enhancement: the full list is server-rendered HTML, and this
   script only hides, shows and reorders existing cards using their data-*
   attributes. State is mirrored in the URL (?cat=&time=&tag=&sort=) so
   filtered views can be shared.
   ========================================================================== */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var panel = $('.js-filters'), grid = $('.js-listing');
  if (!panel || !grid) return;
  var cards = $$('.card', grid), countEl = $('.js-count'), emptyEl = $('.js-empty'), sortEl = $('.js-sort');
  var parents = {};
  ((window.HW_DATA || {}).categories || []).forEach(function (c) { parents[c.slug] = c.parent; });

  function read() {
    var cat = ($('input[name=cat]:checked', panel) || {}).value || '';
    var time = ($('input[name=time]:checked', panel) || {}).value || '';
    var tags = $$('input[name=tag]:checked', panel).map(function (i) { return i.value; });
    return { cat: cat, time: time, tags: tags, sort: sortEl.value };
  }

  function matches(card, s) {
    var cats = card.getAttribute('data-cats').split(' ');
    if (s.cat && cats.indexOf(s.cat) < 0 && !cats.some(function (c) { return parents[c] === s.cat; })) return false;
    if (s.time) {
      var r = +card.getAttribute('data-read'), b = s.time.split('-');
      if (r < +b[0] || r >= +b[1]) return false;
    }
    if (s.tags.length) {
      var t = card.getAttribute('data-tags').split('|');
      if (!s.tags.every(function (x) { return t.indexOf(x) > -1; })) return false;
    }
    return true;
  }

  var SORTS = {
    latest: function (a, b) { return b.dataset.date.localeCompare(a.dataset.date); },
    updated: function (a, b) { return b.dataset.updated.localeCompare(a.dataset.updated); },
    popular: function (a, b) { return b.dataset.pop - a.dataset.pop; },
    short: function (a, b) { return a.dataset.read - b.dataset.read; },
    long: function (a, b) { return b.dataset.read - a.dataset.read; }
  };

  function apply(push) {
    var s = read(), shown = 0;
    cards.sort(SORTS[s.sort] || SORTS.latest).forEach(function (c) {
      var ok = matches(c, s);
      c.hidden = !ok; if (ok) shown++;
      grid.appendChild(c);
    });
    countEl.textContent = shown;
    emptyEl.hidden = shown > 0;
    if (push !== false) {
      var p = new URLSearchParams();
      if (s.cat) p.set('cat', s.cat);
      if (s.time) p.set('time', s.time);
      if (s.tags.length) p.set('tag', s.tags.join(','));
      if (s.sort !== 'latest') p.set('sort', s.sort);
      history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
    }
  }

  // Restore state from URL
  var q = new URLSearchParams(location.search);
  if (q.get('cat')) { var r = $('input[name=cat][value="' + q.get('cat') + '"]', panel); r && (r.checked = true); }
  if (q.get('time')) { var t = $('input[name=time][value="' + q.get('time') + '"]', panel); t && (t.checked = true); }
  (q.get('tag') || '').split(',').filter(Boolean).forEach(function (tag) {
    $$('input[name=tag]', panel).forEach(function (i) { if (i.value === tag) i.checked = true; });
  });
  if (q.get('sort') && SORTS[q.get('sort')]) sortEl.value = q.get('sort');

  panel.addEventListener('change', function () { apply(); });
  sortEl.addEventListener('change', function () { apply(); });
  $$('.js-filter-reset').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('input[type=checkbox]', panel).forEach(function (i) { i.checked = false; });
      $$('input[type=radio][value=""]', panel).forEach(function (i) { i.checked = true; });
      sortEl.value = 'latest'; apply();
    });
  });
  var toggle = $('.js-filters-toggle');
  toggle && toggle.addEventListener('click', function () {
    var open = panel.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  apply(false);
})();
