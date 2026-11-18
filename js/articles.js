/* ==========================================================================
   Hardenwire: article data service
   --------------------------------------------------------------------------
   The single place the front end gets article data from. Today it reads
   window.HW_DATA (generated into js/articles-data.js by the build). To move
   to a backend, set CONFIG.endpoint to your API (WordPress REST, a headless
   CMS or your own PHP/MySQL endpoint) returning the same shape:
     { articles: [...], categories: [...] }
   Nothing else in the front end needs to change.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    endpoint: null // e.g. '/api/articles' or '/wp-json/hardenwire/v1/articles'
  };

  var root = document.body.getAttribute('data-root') || '';
  var cache = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Normalise text so "Wi-Fi", "wifi" and "WiFi" all match
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[-_.']/g, '');
  }

  var SYNONYMS = {
    '2fa': 'twofactor', mfa: 'twofactor', otp: 'twofactor', 'wifi': 'wifi', hotspot: 'wifi',
    virus: 'malware', hacked: 'malware', spyware: 'malware', scam: 'scam', fraud: 'scam',
    password: 'password', passkey: 'passkey', vpn: 'vpn', cookies: 'cookie', tracking: 'track'
  };

  function load() {
    if (cache) return Promise.resolve(cache);
    if (CONFIG.endpoint) {
      return fetch(CONFIG.endpoint, { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (d) { cache = d; return d; });
    }
    cache = window.HW_DATA || { articles: [], categories: [] };
    return Promise.resolve(cache);
  }

  function categoryName(slug) {
    var c = (cache && cache.categories || []).filter(function (x) { return x.slug === slug; })[0];
    return c ? c.name : slug;
  }

  function inCategory(a, slug) {
    if (!slug) return true;
    var cats = [a.category].concat(a.also || []);
    if (cats.indexOf(slug) > -1) return true;
    var all = cache.categories;
    return cats.some(function (c) {
      var cat = all.filter(function (x) { return x.slug === c; })[0];
      return cat && cat.parent === slug;
    });
  }

  /**
   * Weighted search across title, keywords, tags, category and summary.
   * Every query term must match somewhere (AND), and scores add up.
   */
  function search(query, opts) {
    opts = opts || {};
    var terms = norm(query).split(/\s+/).filter(Boolean).map(function (t) { return SYNONYMS[t] || t; });
    var list = cache.articles.filter(function (a) { return inCategory(a, opts.category); });
    if (!terms.length) return opts.allWhenEmpty ? list.map(function (a) { return { article: a, score: 0 }; }) : [];
    var out = [];
    list.forEach(function (a) {
      var fields = [
        [norm(a.title), 6],
        [norm((a.keywords || []).join(' ')), 4],
        [norm((a.tags || []).join(' ')), 4],
        [norm([a.category].concat(a.also || []).map(categoryName).join(' ')), 3],
        [norm(a.dek), 2]
      ];
      var total = 0;
      for (var i = 0; i < terms.length; i++) {
        var termScore = 0;
        for (var j = 0; j < fields.length; j++) {
          if (fields[j][0].indexOf(terms[i]) > -1) termScore += fields[j][1];
        }
        if (!termScore) return; // AND semantics
        total += termScore;
      }
      out.push({ article: a, score: total + a.popularity / 1000 });
    });
    return out.sort(function (x, y) { return y.score - x.score; });
  }

  function fmtDate(iso) {
    return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  }

  window.HW = {
    root: root,
    esc: esc,
    norm: norm,
    fmtDate: fmtDate,
    ArticleService: {
      load: load,
      search: search,
      categoryName: categoryName,
      inCategory: inCategory,
      url: function (a) { return root + a.url; },
      image: function (a) { return /^https?:/.test(a.image) ? a.image : root + a.image; }
    }
  };
})();
