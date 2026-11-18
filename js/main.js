/* ==========================================================================
   Hardenwire: global UI
   Header, mega menu, search panel, mobile menu, theme, forms, sharing,
   article reading progress, TOC highlighting.
   ========================================================================== */
(function () {
  'use strict';

  // Form endpoints: set these when a backend / email provider exists.
  // Handled by server.mjs (stored in /data, visible in the admin panel).
  var ROOT_PATH = document.body.getAttribute('data-root') || '';
  var FORMS = {
    newsletter: ROOT_PATH + 'api/subscribe',
    contact: ROOT_PATH + 'api/contact'
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var HW = window.HW;

  /* ---------- Theme ---------- */
  $$('.js-theme').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cur = document.documentElement.dataset.theme ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('hw-theme', next); } catch (e) {}
    });
  });

  /* ---------- Sticky header shadow ---------- */
  var header = $('.site-header');
  var onScroll = function () { header && header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Generic popover helper (mega menu + search panel) ---------- */
  var openPanel = null;
  function closePanel() {
    if (!openPanel) return;
    openPanel.panel.hidden = true;
    openPanel.trigger.setAttribute('aria-expanded', 'false');
    openPanel = null;
  }
  function togglePanel(trigger, panel, focusEl) {
    var isOpen = openPanel && openPanel.panel === panel;
    closePanel();
    if (isOpen) return;
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    openPanel = { trigger: trigger, panel: panel };
    if (focusEl) setTimeout(function () { focusEl.focus(); }, 30);
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (openPanel) { var t = openPanel.trigger; closePanel(); t.focus(); } closeMenu(); closeSheet(); } });
  document.addEventListener('click', function (e) {
    if (openPanel && !openPanel.panel.contains(e.target) && !openPanel.trigger.contains(e.target)) closePanel();
  });

  var megaBtn = $('.js-mega'), mega = $('#mega-topics');
  if (megaBtn && mega) megaBtn.addEventListener('click', function () { togglePanel(megaBtn, mega); });

  var sBtn = $('.js-search-open'), sPanel = $('#search-panel');
  if (sBtn && sPanel) {
    sBtn.addEventListener('click', function () { togglePanel(sBtn, sPanel, $('#hdr-q')); });
    var sClose = $('.js-search-close');
    sClose && sClose.addEventListener('click', function () { closePanel(); sBtn.focus(); });
  }
  // "/" opens search, like most publications
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName) && sBtn) { e.preventDefault(); if (!openPanel || openPanel.panel !== sPanel) togglePanel(sBtn, sPanel, $('#hdr-q')); }
  });

  /* ---------- Live search suggestions ---------- */
  var live = $('.js-live-search'), liveOut = $('.js-live-results');
  if (live && liveOut && HW) {
    var active = -1;
    var render = function () {
      HW.ArticleService.load().then(function () {
        var q = live.value.trim();
        var res = q.length > 1 ? HW.ArticleService.search(q).slice(0, 6) : [];
        active = -1;
        liveOut.innerHTML = res.map(function (r, i) {
          var a = r.article;
          return '<li role="option" id="sug-' + i + '"><a href="' + HW.ArticleService.url(a) + '"><span class="s-title">' + HW.esc(a.title) + '</span><span class="s-cat">' + HW.esc(HW.ArticleService.categoryName(a.category)) + '</span></a></li>';
        }).join('') + (q.length > 1 ? '<li><a href="' + HW.root + 'search.html?q=' + encodeURIComponent(q) + '"><span class="s-title">See all results for “' + HW.esc(q) + '”</span><span class="s-cat">Enter ↵</span></a></li>' : '');
      });
    };
    live.addEventListener('input', render);
    live.addEventListener('keydown', function (e) {
      var links = $$('a', liveOut);
      if (!links.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        links.forEach(function (l, i) { l.classList.toggle('is-active', i === active); });
      } else if (e.key === 'Enter' && active > -1) {
        e.preventDefault(); window.location.href = links[active].href;
      }
    });
  }

  /* ---------- Mobile menu ---------- */
  var menu = $('#mobile-menu'), menuBtn = $('.js-menu-open'), lastFocus = null;
  function openMenu() {
    if (!menu) return;
    lastFocus = document.activeElement;
    menu.hidden = false; document.body.classList.add('is-locked');
    menuBtn && menuBtn.setAttribute('aria-expanded', 'true');
    var c = $('.js-menu-close', menu); c && c.focus();
  }
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true; document.body.classList.remove('is-locked');
    menuBtn && menuBtn.setAttribute('aria-expanded', 'false');
    lastFocus && lastFocus.focus();
  }
  menuBtn && menuBtn.addEventListener('click', openMenu);
  $$('.js-menu-close').forEach(function (b) { b.addEventListener('click', closeMenu); });
  menu && menu.addEventListener('click', function (e) { if (e.target === menu) closeMenu(); });
  // Simple focus trap
  menu && menu.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = $$('a, button, input, summary', menu).filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 1024) closeMenu(); });

  /* ---------- Forms ---------- */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function post(endpoint, data) {
    if (!endpoint) {
      // No backend yet: simulate a successful request so the UX can be tested.
      console.info('[Hardenwire] Form endpoint not configured. Payload:', data);
      return new Promise(function (res) { setTimeout(res, 450); });
    }
    return fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) {
        if (r.ok) return;
        return r.json().catch(function () { return {}; }).then(function (d) { throw new Error(d.error || 'Request failed'); });
      });
  }

  $$('.js-subscribe').forEach(function (form) {
    var input = $('input[type=email]', form), note = $('.form-note', form), btn = $('button', form);
    var original = note ? note.innerHTML : '';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!EMAIL.test(v)) {
        input.setAttribute('aria-invalid', 'true');
        note.className = 'form-note is-error'; note.textContent = 'Please enter a valid email address.';
        input.focus(); return;
      }
      input.removeAttribute('aria-invalid');
      btn.disabled = true; btn.textContent = 'Subscribing…';
      post(FORMS.newsletter, { email: v, source: location.pathname }).then(function () {
        note.className = 'form-note is-success';
        note.textContent = 'You’re subscribed. The next Briefing arrives on Thursday.';
        form.reset(); btn.textContent = 'Subscribed';
      }).catch(function (err) {
        note.className = 'form-note is-error'; note.textContent = err && err.message && err.message !== 'Request failed' && err.message !== 'Failed to fetch' ? err.message : 'Something went wrong. Please try again.';
        btn.disabled = false; btn.textContent = 'Subscribe';
      });
    });
  });

  $$('.js-contact').forEach(function (form) {
    var note = $('.form-note', form), btn = $('button[type=submit]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      $$('[required]', form).forEach(function (f) {
        var ok = f.type === 'email' ? EMAIL.test(f.value.trim()) : f.value.trim().length > 0;
        f.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok && !bad) bad = f;
      });
      if (bad) { note.className = 'form-note is-error'; note.textContent = 'Please complete the highlighted fields.'; bad.focus(); return; }
      btn.disabled = true; btn.textContent = 'Sending…';
      var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
      post(FORMS.contact, data).then(function () {
        note.className = 'form-note is-success'; note.textContent = 'Thanks. Your message has reached the editors. We usually reply within two working days.';
        form.reset(); btn.disabled = false; btn.textContent = 'Send message';
      }).catch(function (err) {
        note.className = 'form-note is-error'; note.textContent = err && err.message && err.message !== 'Request failed' && err.message !== 'Failed to fetch' ? err.message : 'We couldn’t send that. Please email us directly.';
        btn.disabled = false; btn.textContent = 'Send message';
      });
    });
  });

  /* ---------- Sharing ---------- */
  $$('.js-copy-link').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = b.getAttribute('data-url') || location.href;
      var done = function () { b.classList.add('is-copied'); b.setAttribute('aria-label', 'Link copied'); setTimeout(function () { b.classList.remove('is-copied'); b.setAttribute('aria-label', 'Copy link'); }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
    });
  });
  $$('.js-native-share').forEach(function (b) {
    b.addEventListener('click', function () {
      var data = { title: b.getAttribute('data-title'), url: b.getAttribute('data-url') };
      if (navigator.share) navigator.share(data).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(data.url).then(function () { b.lastChild.textContent = ' Copied'; });
    });
  });

  /* ---------- Article: progress, TOC, mobile bar ---------- */
  var article = $('.article-main');
  if (article) {
    var bar = $('.js-progress'), mbar = $('.mobile-bar');
    var tocLinks = $$('.js-toc a');
    var heads = tocLinks.map(function (l) { return document.getElementById(l.getAttribute('href').slice(1)); });
    var current = -1;
    var ticking = false;
    var update = function () {
      var rect = article.getBoundingClientRect();
      var total = rect.height - window.innerHeight * 0.6;
      var p = Math.min(1, Math.max(0, -rect.top / (total || 1)));
      if (bar) bar.style.transform = 'scaleX(' + p + ')';
      if (mbar) mbar.classList.toggle('is-visible', rect.top < 0 && rect.bottom > window.innerHeight * 0.5);
      // Active TOC entry = last heading that has passed 30% of the viewport
      var idx = -1, line = window.innerHeight * 0.3;
      for (var i = 0; i < heads.length; i++) { if (heads[i] && heads[i].getBoundingClientRect().top < line) idx = i; }
      if (idx !== current) {
        if (tocLinks[current]) tocLinks[current].classList.remove('is-active');
        if (tocLinks[idx]) tocLinks[idx].classList.add('is-active');
        current = idx;
      }
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
    // Close inline TOC after picking a section
    $$('.toc--inline a').forEach(function (a) { a.addEventListener('click', function () { a.closest('details').open = false; }); });
  }

  var sheet = $('#toc-sheet');
  function closeSheet() { if (sheet && !sheet.hidden) { sheet.hidden = true; document.body.classList.remove('is-locked'); } }
  $$('.js-toc-sheet').forEach(function (b) { b.addEventListener('click', function () { sheet.hidden = false; document.body.classList.add('is-locked'); var f = $('a', sheet); f && f.focus(); }); });
  $$('.js-sheet-close').forEach(function (b) { b.addEventListener('click', closeSheet); });
  if (sheet) {
    sheet.addEventListener('click', function (e) { if (e.target === sheet || e.target.closest('a')) closeSheet(); });
  }
})();
