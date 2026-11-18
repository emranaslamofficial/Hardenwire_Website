/* Hardenwire admin panel: vanilla JS, talks to /api/admin/* (server.mjs).
   All user-supplied text is rendered with textContent, never innerHTML. */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var view = $('#view');
  var META = null;

  /* ---------- tiny DOM builder ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') el.textContent = v;
      else if (k === 'class') el.className = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else if (k === 'checked') el.checked = !!v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) return c.forEach(function (x) { append(el, x); });
    el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  function render() { view.textContent = ''; for (var i = 0; i < arguments.length; i++) append(view, arguments[i]); view.focus(); }
  var fmt = function (iso) { return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: iso.length > 10 ? 'short' : undefined }) : ''; };

  /* ---------- API ---------- */
  function api(path, opts) {
    opts = opts || {};
    var init = { method: opts.method || 'GET', credentials: 'same-origin', headers: { 'X-Requested-With': 'hw-admin' } };
    if (opts.body) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(opts.body); }
    return fetch('/api/admin/' + path, init).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (r.status === 401 && path !== 'login') { showLogin(); throw new Error('Please log in.'); }
        if (!r.ok) { var e = new Error(data.error || 'Request failed'); e.log = data.log; throw e; }
        return data;
      });
    });
  }

  var toastTimer;
  function toast(msg, isError) {
    var t = $('#toast');
    t.textContent = msg; t.className = 'toast' + (isError ? ' toast--error' : ''); t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, isError ? 7000 : 3000);
  }
  function busy(btn, on, label) { btn.disabled = on; if (label) btn.textContent = label; }

  /* ---------- Auth ---------- */
  function showLogin() { $('#app').hidden = true; $('#login').hidden = false; $('#pw').focus(); }
  function showApp() { $('#login').hidden = true; $('#app').hidden = false; route(); }

  $('#login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('#login-msg'); msg.textContent = '';
    api('login', { method: 'POST', body: { password: $('#pw').value } })
      .then(function () { $('#pw').value = ''; return loadMeta(); })
      .then(showApp)
      .catch(function (err) { msg.textContent = err.message; });
  });
  $('#logout').addEventListener('click', function () { api('logout', { method: 'POST' }).finally(showLogin); });

  function loadMeta() { return api('meta').then(function (m) { META = m; }); }
  function refreshUnread() {
    api('stats').then(function (s) { var c = $('#unread-count'); c.textContent = s.unread; c.hidden = !s.unread; }).catch(function () {});
  }

  /* ---------- Router ---------- */
  function route() {
    var parts = (location.hash.replace(/^#\//, '') || 'dashboard').split('/');
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-nav') === parts[0]); });
    refreshUnread();
    if (parts[0] === 'posts' && parts[1]) return postEditor(parts[1] === 'new' ? null : parts[1]);
    ({ dashboard: dashboard, posts: posts, messages: messages, subscribers: subscribers, settings: settings }[parts[0]] || dashboard)();
  }
  window.addEventListener('hashchange', function () { if (!$('#app').hidden) route(); });

  function head(title, sub, actions) {
    return h('div', { class: 'head' }, h('div', null, h('h1', { text: title }), sub ? h('p', { text: sub }) : null), h('div', null, actions));
  }
  var catName = function (slug) { var c = META.categories.filter(function (x) { return x.slug === slug; })[0]; return c ? c.name : slug; };

  /* ---------- Dashboard ---------- */
  function dashboard() {
    render(head('Dashboard', 'Overview of your publication.'));
    api('stats').then(function (s) {
      render(
        head('Dashboard', 'Overview of your publication.', h('a', { class: 'btn btn--primary', href: '#/posts/new', text: '+ New post' })),
        h('div', { class: 'stats' },
          h('a', { class: 'stat', href: '#/posts' }, h('b', { text: s.posts }), h('span', { text: 'Published posts' })),
          h('a', { class: 'stat', href: '#/subscribers' }, h('b', { text: s.subscribers }), h('span', { text: 'Newsletter subscribers' })),
          h('a', { class: 'stat', href: '#/messages' }, h('b', { text: s.messages }), h('span', { text: 'Contact messages' })),
          h('a', { class: 'stat' + (s.unread ? ' stat--red' : ''), href: '#/messages' }, h('b', { text: s.unread }), h('span', { text: 'Unread messages' }))),
        h('div', { class: 'panel' },
          h('div', { class: 'panel__head' }, h('h2', { text: 'Latest messages' }), h('a', { class: 'btn btn--sm', href: '#/messages', text: 'View all' })),
          s.latest.length ? s.latest.map(msgItem) : h('p', { class: 'empty', text: 'No messages yet. Messages sent from the Contact page appear here.' }))
      );
    }).catch(function (e) { toast(e.message, true); });
  }

  /* ---------- Posts ---------- */
  function posts() {
    render(head('Posts', 'Loading…'));
    api('posts').then(function (list) {
      render(
        head('Posts', list.length + ' published', h('a', { class: 'btn btn--primary', href: '#/posts/new', text: '+ New post' })),
        h('div', { class: 'panel' }, h('table', null,
          h('thead', null, h('tr', null, h('th', { text: '' }), h('th', { text: 'Title' }), h('th', { text: 'Category' }), h('th', { text: 'Updated' }), h('th', { text: '' }))),
          h('tbody', null, list.map(function (p) {
            return h('tr', null,
              h('td', null, p.photo ? h('img', { class: 'thumb', alt: '', loading: 'lazy', src: 'https://images.unsplash.com/' + p.photo + '?w=160&h=90&fit=crop&auto=format' }) : h('span', { class: 'thumb' })),
              h('td', null, h('div', { class: 't-title', text: p.title }), h('div', { class: 't-sub', text: '/articles/' + p.slug + '.html' }), p.featured ? h('span', { class: 'tag tag--red', text: 'Featured' }) : null),
              h('td', null, h('span', { class: 'tag', text: catName(p.category) })),
              h('td', { text: fmt(p.updated) }),
              h('td', { class: 'actions' },
                h('a', { class: 'btn btn--sm', href: '/articles/' + p.slug + '.html', target: '_blank', rel: 'noopener', text: 'View' }),
                h('a', { class: 'btn btn--sm', href: '#/posts/' + p.slug, text: 'Edit' }),
                h('button', { class: 'btn btn--sm btn--danger', type: 'button', text: 'Delete', onclick: function (e) { deletePost(p, e.currentTarget); } })));
          }))))
      );
    }).catch(function (e) { toast(e.message, true); });
  }
  function deletePost(p, btn) {
    if (!confirm('Delete "' + p.title + '"? This removes the post from the site and cannot be undone.')) return;
    busy(btn, true, 'Deleting…');
    api('posts/' + p.slug, { method: 'DELETE' }).then(function () { toast('Post deleted.'); posts(); })
      .catch(function (e) { busy(btn, false, 'Delete'); toast(e.message, true); });
  }

  function field(label, input, help) { return h('div', { class: 'field' }, h('label', { for: input.id, text: label }), input, help ? h('small', { text: help }) : null); }
  function postEditor(slug) {
    render(head(slug ? 'Edit post' : 'New post', 'Loading…'));
    var load = slug ? api('posts/' + slug) : Promise.resolve({ meta: { published: new Date().toISOString().slice(0, 10), author: META.authors[0].slug, category: META.categories[0].slug }, body: '<p>Write the introduction here.</p>\n\n<h2>First section</h2>\n<p>…</p>' });
    load.then(function (d) {
      var m = d.meta;
      var f = {};
      var inp = function (name, value, type) { return (f[name] = h('input', { id: 'f-' + name, name: name, type: type || 'text', value: value == null ? '' : value })); };
      var ta = function (name, value, rows, cls) { return (f[name] = h('textarea', { id: 'f-' + name, name: name, rows: rows || 3, class: cls, value: value || '' })); };
      var sel = function (name, opts, value) {
        return (f[name] = h('select', { id: 'f-' + name, name: name }, opts.map(function (o) { return h('option', { value: o.slug, text: (o.parent ? '— ' : '') + o.name, selected: o.slug === value }); })));
      };
      var chk = function (name, label) { return h('label', null, (f[name] = h('input', { type: 'checkbox', name: name, checked: !!m[name] })), label); };
      var preview = h('img', { class: 'photo-preview', alt: '', hidden: !m.photo, src: m.photo ? 'https://images.unsplash.com/' + m.photo + '?w=640&h=360&fit=crop&auto=format' : '' });

      var main = h('div', { class: 'panel' }, h('div', { class: 'panel__body' },
        field('Title (H1)', inp('title', m.title)),
        slug ? null : field('URL slug', inp('slug', m.slug), 'Lowercase words separated by hyphens. Cannot be changed later.'),
        field('Standfirst (shown under the headline)', ta('dek', m.dek, 2)),
        field('Meta description (search results)', ta('description', m.description, 2), 'About 150–160 characters.'),
        field('Article body (HTML)', ta('body', d.body, 22, 'code'), 'Use <h2>, <p>, <ul>, <table>. Link to other posts with {{a:slug}}, categories with {{c:slug}}. Callouts: <div class="callout callout--tip"><p><strong>Title</strong>Text</p></div>'),
        field('Key takeaways (one per line)', ta('takeaways', (m.takeaways || []).join('\n'), 4)),
        field('FAQ (one per line: Question | Answer)', ta('faq', (m.faq || []).map(function (q) { return q.q + ' | ' + q.a; }).join('\n'), 4)),
        field('Sources (one per line: Name | https://url)', ta('sources', (m.sources || []).map(function (s) { return s.name + ' | ' + s.url; }).join('\n'), 3))
      ));

      f.photo = null;
      var photoInput = inp('photo', m.photo);
      photoInput.placeholder = 'photo-1585079374502-415f8516dcc3';
      photoInput.addEventListener('change', function () {
        var v = photoInput.value.trim().replace(/^https:\/\/images\.unsplash\.com\//, '').split('?')[0];
        photoInput.value = v;
        preview.hidden = !/^photo-/.test(v);
        if (!preview.hidden) preview.src = 'https://images.unsplash.com/' + v + '?w=640&h=360&fit=crop&auto=format';
      });

      var side = h('div', null,
        h('div', { class: 'panel' }, h('div', { class: 'panel__body' },
          field('Category', sel('category', META.categories, m.category)),
          field('Author', sel('author', META.authors, m.author)),
          h('div', { class: 'row2' }, field('Published', inp('published', m.published, 'date')), field('Updated', inp('updated', m.updated || m.published, 'date'))),
          field('Tags (one per line)', ta('tags', (m.tags || []).join('\n'), 3)),
          field('Primary keyword', inp('primaryKeyword', m.primaryKeyword)),
          field('SEO title', inp('seoTitle', m.seoTitle), 'Leave empty to use the headline.'),
          h('div', { class: 'field' }, h('label', { text: 'Placement' }), h('div', { class: 'checks' },
            chk('featured', 'Featured (homepage lead story)'), chk('heroSupport', 'Top stories (homepage)'), chk('editorsPick', "Editor's pick"), chk('beginner', 'Beginner friendly'))),
          field('Popularity score', inp('popularity', m.popularity || 0, 'number'), 'Higher numbers rank higher in "Most read".')
        )),
        h('div', { class: 'panel' }, h('div', { class: 'panel__body' },
          h('div', { class: 'field' }, h('label', { for: 'f-photo', text: 'Unsplash photo ID or URL' }), photoInput, h('small', { text: 'Open a photo on unsplash.com, copy its image address, and paste it here.' }), preview),
          field('Photographer username', inp('photoCredit', m.photoCredit), 'Shown as the photo credit, e.g. brett_jordan'),
          field('Image description (alt text)', inp('imageAlt', m.imageAlt))
        ))
      );

      var saveBtn = h('button', { class: 'btn btn--primary', type: 'submit', text: slug ? 'Save & publish' : 'Publish post' });
      var form = h('form', { novalidate: true },
        h('div', { class: 'editor' }, main, side),
        h('div', { class: 'sticky-bar' }, h('a', { class: 'btn', href: '#/posts', text: 'Cancel' }), slug ? h('a', { class: 'btn', href: '/articles/' + slug + '.html', target: '_blank', rel: 'noopener', text: 'View live' }) : null, saveBtn));

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = {};
        Object.keys(f).forEach(function (k) { if (f[k]) data[k] = f[k].type === 'checkbox' ? f[k].checked : f[k].value; });
        data.photo = photoInput.value.trim();
        busy(saveBtn, true, 'Publishing… (rebuilding site)');
        api(slug ? 'posts/' + slug : 'posts', { method: slug ? 'PUT' : 'POST', body: data })
          .then(function (r) { toast('Published. The site has been rebuilt.'); location.hash = '#/posts/' + (slug || r.slug); if (!slug) return; busy(saveBtn, false, 'Save & publish'); })
          .catch(function (err) { busy(saveBtn, false, slug ? 'Save & publish' : 'Publish post'); toast(err.message + (err.log ? '\n\n' + err.log : ''), true); });
      });

      render(head(slug ? 'Edit post' : 'New post', slug ? m.title : 'Publishing rebuilds the static site automatically.'), form);
    }).catch(function (e) { toast(e.message, true); });
  }

  /* ---------- Messages ---------- */
  function msgItem(m) {
    var item = h('div', { class: 'msg' + (m.read ? '' : ' msg--unread') },
      h('div', { class: 'msg__top' },
        h('div', null, h('span', { class: 'msg__from', text: m.name + ' ' }), h('a', { href: 'mailto:' + m.email, text: '<' + m.email + '>' })),
        h('span', { class: 'msg__meta', text: (m.topic ? m.topic + ' · ' : '') + fmt(m.createdAt) })),
      h('p', { class: 'msg__body', text: m.message }));
    return item;
  }
  function messages() {
    render(head('Messages', 'Loading…'));
    api('messages').then(function (list) {
      render(
        head('Messages', list.length + ' total · ' + list.filter(function (m) { return !m.read; }).length + ' unread'),
        h('div', { class: 'panel' }, list.length ? list.map(function (m) {
          var item = msgItem(m);
          item.appendChild(h('div', { class: 'msg__actions' },
            h('a', { class: 'btn btn--sm', href: 'mailto:' + m.email + '?subject=' + encodeURIComponent('Re: ' + (m.topic || 'your message to Hardenwire')), text: 'Reply' }),
            h('button', { class: 'btn btn--sm', type: 'button', text: m.read ? 'Mark unread' : 'Mark read', onclick: function () {
              api('messages/' + m.id, { method: 'PATCH', body: { read: !m.read } }).then(messages).catch(function (e) { toast(e.message, true); });
            } }),
            h('button', { class: 'btn btn--sm btn--danger', type: 'button', text: 'Delete', onclick: function () {
              if (confirm('Delete this message permanently?')) api('messages/' + m.id, { method: 'DELETE' }).then(messages).catch(function (e) { toast(e.message, true); });
            } })));
          return item;
        }) : h('p', { class: 'empty', text: 'No messages yet. Messages sent from the Contact page appear here.' }))
      );
    }).catch(function (e) { toast(e.message, true); });
  }

  /* ---------- Subscribers ---------- */
  function subscribers() {
    render(head('Subscribers', 'Loading…'));
    api('subscribers').then(function (list) {
      render(
        head('Subscribers', list.length + ' newsletter subscribers', h('a', { class: 'btn', href: '/api/admin/subscribers?format=csv', text: 'Export CSV' })),
        h('div', { class: 'panel' }, list.length ? h('table', null,
          h('thead', null, h('tr', null, h('th', { text: 'Email' }), h('th', { text: 'Signed up' }), h('th', { text: 'From page' }), h('th', { text: '' }))),
          h('tbody', null, list.map(function (s) {
            return h('tr', null,
              h('td', null, h('a', { class: 't-title', href: 'mailto:' + s.email, text: s.email })),
              h('td', { text: fmt(s.createdAt) }),
              h('td', { class: 't-sub', text: s.source || '' }),
              h('td', { class: 'actions' }, h('button', { class: 'btn btn--sm btn--danger', type: 'button', text: 'Remove', onclick: function () {
                if (confirm('Remove ' + s.email + ' from the list?')) api('subscribers', { method: 'DELETE', body: { email: s.email } }).then(subscribers).catch(function (e) { toast(e.message, true); });
              } })));
          }))) : h('p', { class: 'empty', text: 'No subscribers yet. Sign-ups from the newsletter forms appear here.' }))
      );
    }).catch(function (e) { toast(e.message, true); });
  }

  /* ---------- Settings ---------- */
  function settings() {
    render(head('Settings', 'Loading…'));
    api('settings').then(function (s) {
      var choice = s.fontPreset;
      var cards = Object.keys(META.fonts).map(function (key) {
        var p = META.fonts[key];
        var radio = h('input', { type: 'radio', name: 'font', value: key, checked: key === choice });
        var card = h('label', { class: 'preset' + (key === choice ? ' is-on' : '') }, radio,
          h('div', { class: 'preset__name', text: p.label }),
          h('div', { class: 'preset__h', style: 'font-family:' + p.display + ';font-weight:700', text: 'Passkeys Explained: How They Work' }),
          h('p', { class: 'preset__p', style: 'font-family:' + p.serif, text: 'Passkeys let you sign in with your face, fingerprint or device PIN instead of a password.' }),
          h('p', { class: 'preset__p', style: 'font-family:' + p.sans + ';color:#646b75;font-size:12px;margin-top:8px', text: 'PASSWORD SECURITY · 7 MIN READ' }));
        radio.addEventListener('change', function () { choice = key; document.querySelectorAll('.preset').forEach(function (c) { c.classList.remove('is-on'); }); card.classList.add('is-on'); });
        return card;
      });
      var applyBtn = h('button', { class: 'btn btn--primary', type: 'button', text: 'Apply typography', onclick: function () {
        busy(applyBtn, true, 'Applying… (rebuilding site)');
        api('settings', { method: 'PUT', body: { fontPreset: choice } }).then(function () { toast('Fonts updated across the whole site.'); })
          .catch(function (e) { toast(e.message, true); }).finally(function () { busy(applyBtn, false, 'Apply typography'); });
      } });

      var cur = h('input', { type: 'password', autocomplete: 'current-password', id: 'pw-cur' });
      var nxt = h('input', { type: 'password', autocomplete: 'new-password', id: 'pw-new', minlength: '10' });
      var pwBtn = h('button', { class: 'btn btn--primary', type: 'submit', text: 'Change password' });
      var pwForm = h('form', { class: 'panel__body' }, h('div', { class: 'row2' }, field('Current password', cur), field('New password', nxt, 'At least 10 characters.')), pwBtn);
      pwForm.addEventListener('submit', function (e) {
        e.preventDefault();
        api('password', { method: 'POST', body: { current: cur.value, next: nxt.value } }).then(function () { cur.value = nxt.value = ''; toast('Password changed.'); }).catch(function (err) { toast(err.message, true); });
      });

      var rebuildBtn = h('button', { class: 'btn', type: 'button', text: 'Rebuild site now', onclick: function () {
        busy(rebuildBtn, true, 'Rebuilding…');
        api('rebuild', { method: 'POST' }).then(function () { toast('Site rebuilt.'); }).catch(function (e) { toast(e.message + (e.log ? '\n' + e.log : ''), true); }).finally(function () { busy(rebuildBtn, false, 'Rebuild site now'); });
      } });

      render(
        head('Settings', 'Typography, password and maintenance.'),
        h('div', { class: 'panel' }, h('div', { class: 'panel__head' }, h('h2', { text: 'Typography' }), applyBtn), h('div', { class: 'panel__body' }, h('div', { class: 'presets' }, cards))),
        h('div', { class: 'panel' }, h('div', { class: 'panel__head' }, h('h2', { text: 'Admin password' })), pwForm),
        h('div', { class: 'panel' }, h('div', { class: 'panel__head' }, h('h2', { text: 'Maintenance' }), rebuildBtn), h('p', { class: 'panel__body', text: 'Regenerates every page from the content folder. Use this after editing files by hand.' }))
      );
    }).catch(function (e) { toast(e.message, true); });
  }

  /* ---------- Boot ---------- */
  api('me').then(loadMeta).then(showApp).catch(function () { showLogin(); });
})();
