// ---------------------------------------------------------------------------
// Hardenwire: small backend + admin API. Zero dependencies (Node 18+).
//
//   node server.mjs            → http://localhost:3000   (site)
//                               http://localhost:3000/admin  (admin panel)
//
// What it does:
//   • Serves the static site
//   • POST /api/subscribe, /api/contact   → stores newsletter sign-ups and
//     contact messages in /data/*.json
//   • /api/admin/*  (password protected)   → manage posts, subscribers,
//     messages and site settings. Saving a post writes /content/articles
//     and rebuilds the static site.
//
// Storage is plain JSON files in /data. Swap these helpers for MySQL /
// Postgres / SQLite later without touching the admin UI.
// ---------------------------------------------------------------------------
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const { CATEGORIES, AUTHORS, FONT_PRESETS } = await import(pathToFileURL(path.join(ROOT, '_build', 'data.mjs')).href);

// Local mode (default): everything lives in the project folder.
// Production mode (DATA_DIR set, e.g. a Render persistent disk): posts, the
// generated site and all stored data live on the disk, so admin edits and
// subscribers survive restarts and redeploys.
const PROD = !!process.env.DATA_DIR;
const DATA = process.env.DATA_DIR || path.join(ROOT, 'data');
const CONTENT = PROD ? path.join(DATA, 'content') : path.join(ROOT, 'content');
const OUT = PROD ? path.join(DATA, 'site') : ROOT;
const ARTICLES = path.join(CONTENT, 'articles');
const TRUST_PROXY = process.env.TRUST_PROXY === '1' || PROD;
const BUILD_ENV = { ...process.env, HW_CONTENT_DIR: CONTENT, HW_OUT_DIR: OUT, DATA_DIR: DATA };

fs.mkdirSync(DATA, { recursive: true });
if (PROD) {
  // First boot on a new disk: copy the articles and pages from the repo.
  for (const sub of ['articles', 'pages']) {
    const dest = path.join(CONTENT, sub);
    if (!fs.existsSync(dest)) fs.cpSync(path.join(ROOT, 'content', sub), dest, { recursive: true });
  }
  fs.mkdirSync(OUT, { recursive: true });
}

// ---------- JSON storage ----------
const file = (name) => path.join(DATA, name + '.json');
function load(name, fallback) {
  try { return JSON.parse(fs.readFileSync(file(name), 'utf8')); } catch { return fallback; }
}
function save(name, value) {
  const tmp = file(name) + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file(name)); // atomic replace
}

// ---------- Admin password ----------
const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 64).toString('hex');
function ensureAdmin() {
  const existing = load('admin', null);
  const envPw = process.env.ADMIN_PASSWORD;
  if (envPw) {
    // Apply ADMIN_PASSWORD only when it is new or has changed, so a password
    // changed later in the admin panel isn't overwritten on every restart.
    const fp = crypto.createHash('sha256').update(envPw).digest('hex');
    if (!existing || existing.envFp !== fp) {
      const salt = crypto.randomBytes(16).toString('hex');
      save('admin', { salt, hash: hashPw(envPw, salt), envFp: fp });
    }
    return;
  }
  if (existing) return;
  const pw = crypto.randomBytes(9).toString('base64url');
  const salt = crypto.randomBytes(16).toString('hex');
  save('admin', { salt, hash: hashPw(pw, salt) });
  fs.writeFileSync(path.join(DATA, 'admin-password.txt'), `Initial admin password: ${pw}\nChange it in the admin panel (Settings), then delete this file.\n`);
  console.log('\n  First run: an admin password was generated and saved to data/admin-password.txt\n');
}
ensureAdmin();
function checkPw(pw) {
  const a = load('admin', null);
  if (!a || typeof pw !== 'string') return false;
  const got = Buffer.from(hashPw(pw, a.salt), 'hex');
  return crypto.timingSafeEqual(got, Buffer.from(a.hash, 'hex'));
}

// ---------- Sessions (in memory; logging in again after a restart is fine) ----------
const sessions = new Map(); // token -> expiry
const SESSION_MS = 8 * 60 * 60 * 1000;
function newSession() {
  const t = crypto.randomBytes(32).toString('hex');
  sessions.set(t, Date.now() + SESSION_MS);
  return t;
}
function getCookie(req, name) {
  const m = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
}
function isAuthed(req) {
  const t = getCookie(req, 'hw_admin');
  const exp = t && sessions.get(t);
  if (!exp || exp < Date.now()) { if (t) sessions.delete(t); return false; }
  return true;
}

// ---------- Rate limiting ----------
const hits = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}
// Behind a hosting proxy (Render, etc.) the real client IP is the first X-Forwarded-For entry.
const ipOf = (req) => (TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || 'unknown';
const isHttps = (req) => (TRUST_PROXY && req.headers['x-forwarded-proto'] === 'https') || !!req.socket.encrypted;
const cookie = (req, value, maxAge) => `hw_admin=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${isHttps(req) ? '; Secure' : ''}`;

// ---------- Helpers ----------
const SEC_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
function send(res, status, body, headers = {}) {
  const isObj = typeof body === 'object' && !(body instanceof Buffer);
  res.writeHead(status, { ...SEC_HEADERS, 'Content-Type': isObj ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(isObj ? JSON.stringify(body) : body);
}
function readBody(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(Object.assign(new Error('Payload too large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ---------- Posts (content/articles/*.html with JSON front matter) ----------
function readPost(slug) {
  const f = path.join(ARTICLES, slug + '.html');
  const raw = fs.readFileSync(f, 'utf8');
  const m = raw.match(/^---json\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!m) throw new Error('Bad post file');
  return { meta: JSON.parse(m[1]), body: m[2] };
}
function listPosts() {
  return fs.readdirSync(ARTICLES).filter((f) => f.endsWith('.html')).map((f) => {
    try {
      const { meta } = readPost(f.slice(0, -5));
      return { slug: meta.slug, title: meta.title, category: meta.category, author: meta.author, published: meta.published, updated: meta.updated || meta.published, featured: !!meta.featured, photo: meta.photo || null };
    } catch { return null; }
  }).filter(Boolean).sort((a, b) => b.published.localeCompare(a.published));
}
const lines = (v) => (Array.isArray(v) ? v : String(v || '').split('\n')).map((s) => String(s).trim()).filter(Boolean);

function cleanPost(input, existing = {}) {
  const errors = [];
  const meta = { ...existing };
  meta.slug = existing.slug || str(input.slug, 80);
  if (!SLUG.test(meta.slug)) errors.push('Slug must be lowercase letters, numbers and hyphens.');
  for (const k of ['title', 'description', 'dek']) { meta[k] = str(input[k], k === 'title' ? 160 : 400); if (!meta[k]) errors.push(`${k} is required.`); }
  meta.shortTitle = str(input.shortTitle, 80) || undefined;
  meta.seoTitle = str(input.seoTitle, 160) || meta.title;
  meta.category = str(input.category, 40);
  if (!CATEGORIES.some((c) => c.slug === meta.category)) errors.push('Choose a valid category.');
  meta.also = lines(input.also).filter((c) => c !== meta.category && CATEGORIES.some((x) => x.slug === c));
  meta.author = str(input.author, 40);
  if (!AUTHORS.some((a) => a.slug === meta.author)) errors.push('Choose a valid author.');
  meta.tags = lines(input.tags).slice(0, 12);
  meta.primaryKeyword = str(input.primaryKeyword, 120) || meta.title;
  meta.secondaryKeywords = lines(input.secondaryKeywords).slice(0, 12);
  const today = new Date().toISOString().slice(0, 10);
  meta.published = /^\d{4}-\d{2}-\d{2}$/.test(input.published) ? input.published : existing.published || today;
  meta.updated = /^\d{4}-\d{2}-\d{2}$/.test(input.updated) ? input.updated : today;
  meta.photo = /^photo-[A-Za-z0-9_-]+$/.test(str(input.photo, 80)) ? str(input.photo, 80) : undefined;
  meta.photoCredit = meta.photo ? str(input.photoCredit, 60).replace(/^@/, '').replace(/[^A-Za-z0-9_.-]/g, '') || undefined : undefined;
  meta.imageAlt = str(input.imageAlt, 200) || meta.title;
  meta.takeaways = lines(input.takeaways).slice(0, 8);
  meta.faq = lines(input.faq).map((l) => l.split('|')).filter((p) => p.length >= 2).map(([q, ...a]) => ({ q: q.trim(), a: a.join('|').trim() })).slice(0, 8);
  meta.sources = lines(input.sources).map((l) => l.split('|')).filter((p) => p.length >= 2 && /^https?:\/\//.test(p[1].trim())).map(([name, url]) => ({ name: name.trim(), url: url.trim() })).slice(0, 12);
  for (const k of ['featured', 'editorsPick', 'beginner', 'heroSupport']) meta[k] = !!input[k] || undefined;
  meta.popularity = Math.max(0, Math.min(10000, Number(input.popularity) || 0));
  const body = typeof input.body === 'string' ? input.body : '';
  if (body.trim().length < 50) errors.push('The article body is too short.');
  Object.keys(meta).forEach((k) => meta[k] === undefined && delete meta[k]);
  return { meta, body, errors };
}

// ---------- Rebuild the static site (one at a time) ----------
let buildChain = Promise.resolve();
function rebuild() {
  const run = () => new Promise((resolve) => {
    const p = spawn(process.execPath, [path.join(ROOT, '_build', 'build.mjs')], { cwd: ROOT, env: BUILD_ENV });
    let out = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (out += d));
    p.on('close', (code) => resolve({ ok: code === 0, log: out.trim().split('\n').slice(0, 12).join('\n') }));
  });
  const job = buildChain.then(run);
  buildChain = job.catch(() => {});
  return job;
}
// Write a post file, rebuild, and roll back if the build fails
async function writePostAndBuild(slug, content) {
  const f = path.join(ARTICLES, slug + '.html');
  const previous = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
  fs.writeFileSync(f, content);
  const result = await rebuild();
  if (!result.ok) {
    if (previous === null) fs.unlinkSync(f); else fs.writeFileSync(f, previous);
    await rebuild();
  }
  return result;
}

// ---------- API routes ----------
async function api(req, res, url) {
  const p = url.pathname;
  const ip = ipOf(req);

  // Public: newsletter
  if (p === '/api/subscribe' && req.method === 'POST') {
    if (limited('sub:' + ip, 10, 60_000)) return send(res, 429, { error: 'Too many requests. Try again in a minute.' });
    const b = await readBody(req, 10_000);
    const email = str(b.email, 254).toLowerCase();
    if (!EMAIL.test(email)) return send(res, 400, { error: 'Please enter a valid email address.' });
    const subs = load('subscribers', []);
    if (!subs.some((s) => s.email === email)) {
      subs.push({ email, source: str(b.source, 200), createdAt: new Date().toISOString() });
      save('subscribers', subs);
    }
    return send(res, 200, { ok: true });
  }

  // Public: contact form
  if (p === '/api/contact' && req.method === 'POST') {
    if (limited('contact:' + ip, 5, 60_000)) return send(res, 429, { error: 'Too many messages. Try again in a minute.' });
    const b = await readBody(req, 30_000);
    const msg = { id: crypto.randomUUID(), name: str(b.name, 120), email: str(b.email, 254), topic: str(b.topic, 120), message: str(b.message, 5000), createdAt: new Date().toISOString(), read: false };
    if (!msg.name || !EMAIL.test(msg.email) || !msg.message) return send(res, 400, { error: 'Please complete all fields.' });
    const all = load('messages', []);
    all.unshift(msg);
    save('messages', all.slice(0, 5000));
    return send(res, 200, { ok: true });
  }

  if (!p.startsWith('/api/admin/')) return send(res, 404, { error: 'Not found' });

  // Admin: CSRF guard for anything that changes state
  if (req.method !== 'GET') {
    if (req.headers['x-requested-with'] !== 'hw-admin') return send(res, 403, { error: 'Forbidden' });
    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) return send(res, 403, { error: 'Bad origin' });
  }

  if (p === '/api/admin/login' && req.method === 'POST') {
    if (limited('login:' + ip, 5, 60_000)) return send(res, 429, { error: 'Too many attempts. Wait a minute.' });
    const b = await readBody(req, 5_000);
    if (!checkPw(b.password)) return send(res, 401, { error: 'Wrong password.' });
    const t = newSession();
    return send(res, 200, { ok: true }, { 'Set-Cookie': cookie(req, t, SESSION_MS / 1000) });
  }
  if (p === '/api/admin/logout' && req.method === 'POST') {
    sessions.delete(getCookie(req, 'hw_admin'));
    return send(res, 200, { ok: true }, { 'Set-Cookie': cookie(req, '', 0) });
  }

  if (!isAuthed(req)) return send(res, 401, { error: 'Please log in.' });

  if (p === '/api/admin/me') return send(res, 200, { ok: true });

  if (p === '/api/admin/meta') {
    return send(res, 200, {
      categories: CATEGORIES.map(({ slug, name, parent }) => ({ slug, name, parent })),
      authors: AUTHORS.map(({ slug, name }) => ({ slug, name })),
      fonts: Object.fromEntries(Object.entries(FONT_PRESETS).map(([k, v]) => [k, { label: v.label, google: v.google, display: v.display, serif: v.serif, sans: v.sans }])),
    });
  }

  if (p === '/api/admin/stats') {
    const msgs = load('messages', []);
    return send(res, 200, { posts: listPosts().length, subscribers: load('subscribers', []).length, messages: msgs.length, unread: msgs.filter((m) => !m.read).length, latest: msgs.slice(0, 5) });
  }

  // Posts
  if (p === '/api/admin/posts' && req.method === 'GET') return send(res, 200, listPosts());
  if (p === '/api/admin/posts' && req.method === 'POST') {
    const b = await readBody(req);
    const { meta, body, errors } = cleanPost(b);
    if (fs.existsSync(path.join(ARTICLES, meta.slug + '.html'))) errors.push('A post with this slug already exists.');
    if (errors.length) return send(res, 400, { error: errors.join(' ') });
    const r = await writePostAndBuild(meta.slug, `---json\n${JSON.stringify(meta, null, 2)}\n---\n${body.trim()}\n`);
    return r.ok ? send(res, 200, { ok: true, slug: meta.slug }) : send(res, 400, { error: 'The site could not be built with this post, so nothing was saved.', log: r.log });
  }
  const pm = p.match(/^\/api\/admin\/posts\/([a-z0-9-]+)$/);
  if (pm) {
    const slug = pm[1];
    const f = path.join(ARTICLES, slug + '.html');
    if (!SLUG.test(slug) || !fs.existsSync(f)) return send(res, 404, { error: 'Post not found.' });
    if (req.method === 'GET') { const { meta, body } = readPost(slug); return send(res, 200, { meta, body }); }
    if (req.method === 'PUT') {
      const b = await readBody(req);
      const { meta, body, errors } = cleanPost(b, readPost(slug).meta);
      if (errors.length) return send(res, 400, { error: errors.join(' ') });
      const r = await writePostAndBuild(slug, `---json\n${JSON.stringify(meta, null, 2)}\n---\n${body.trim()}\n`);
      return r.ok ? send(res, 200, { ok: true }) : send(res, 400, { error: 'The site could not be built with these changes, so they were not saved.', log: r.log });
    }
    if (req.method === 'DELETE') {
      const backup = fs.readFileSync(f, 'utf8');
      fs.unlinkSync(f);
      const r = await rebuild();
      if (!r.ok) { fs.writeFileSync(f, backup); await rebuild(); return send(res, 400, { error: 'Other posts link to this one. Remove those links first.', log: r.log }); }
      for (const gen of [path.join(OUT, 'articles', slug + '.html'), path.join(OUT, 'assets', 'images', 'articles', slug + '.svg')]) { try { fs.unlinkSync(gen); } catch {} }
      return send(res, 200, { ok: true });
    }
  }

  // Subscribers
  if (p === '/api/admin/subscribers' && req.method === 'GET') {
    const subs = load('subscribers', []).slice().reverse();
    if (url.searchParams.get('format') === 'csv') {
      const csv = 'email,source,created_at\n' + subs.map((s) => [s.email, s.source, s.createdAt].map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
      return send(res, 200, csv, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="subscribers.csv"' });
    }
    return send(res, 200, subs);
  }
  if (p === '/api/admin/subscribers' && req.method === 'DELETE') {
    const b = await readBody(req, 5_000);
    save('subscribers', load('subscribers', []).filter((s) => s.email !== str(b.email, 254).toLowerCase()));
    return send(res, 200, { ok: true });
  }

  // Messages
  if (p === '/api/admin/messages' && req.method === 'GET') return send(res, 200, load('messages', []));
  const mm = p.match(/^\/api\/admin\/messages\/([a-f0-9-]{36})$/);
  if (mm) {
    const all = load('messages', []);
    const i = all.findIndex((m) => m.id === mm[1]);
    if (i < 0) return send(res, 404, { error: 'Message not found.' });
    if (req.method === 'PATCH') { const b = await readBody(req, 2_000); all[i].read = !!b.read; save('messages', all); return send(res, 200, { ok: true }); }
    if (req.method === 'DELETE') { all.splice(i, 1); save('messages', all); return send(res, 200, { ok: true }); }
  }

  // Settings
  if (p === '/api/admin/settings' && req.method === 'GET') return send(res, 200, load('settings', { fontPreset: 'editorial' }));
  if (p === '/api/admin/settings' && req.method === 'PUT') {
    const b = await readBody(req, 2_000);
    if (!FONT_PRESETS[b.fontPreset]) return send(res, 400, { error: 'Unknown font preset.' });
    save('settings', { ...load('settings', {}), fontPreset: b.fontPreset });
    const r = await rebuild();
    return r.ok ? send(res, 200, { ok: true }) : send(res, 500, { error: 'Rebuild failed.', log: r.log });
  }
  if (p === '/api/admin/password' && req.method === 'POST') {
    const b = await readBody(req, 2_000);
    if (!checkPw(b.current)) return send(res, 400, { error: 'Current password is wrong.' });
    if (typeof b.next !== 'string' || b.next.length < 10) return send(res, 400, { error: 'New password must be at least 10 characters.' });
    const salt = crypto.randomBytes(16).toString('hex');
    save('admin', { ...load('admin', {}), salt, hash: hashPw(b.next, salt) }); // keeps envFp so a restart won't reset it
    try { fs.unlinkSync(path.join(DATA, 'admin-password.txt')); } catch {}
    return send(res, 200, { ok: true });
  }
  if (p === '/api/admin/rebuild' && req.method === 'POST') {
    const r = await rebuild();
    return send(res, r.ok ? 200 : 500, r);
  }

  return send(res, 404, { error: 'Not found' });
}

// ---------- Static files ----------
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
const BLOCKED = /^\/(data|_build|content|docs|\.claude|node_modules)(\/|$)|^\/server\.mjs$|^\/README\.md$|\/\./;
function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  if (BLOCKED.test(p)) return send(res, 404, 'Not found');
  if (p === '/admin') { res.writeHead(301, { Location: '/admin/' }); return res.end(); }
  if (p.endsWith('/')) p += 'index.html';
  const ext = path.extname(p).toLowerCase();
  // Generated pages come from OUT (the disk in production); CSS, JS, icons
  // and the admin panel come from the repo.
  const candidates = [...new Set([OUT, ROOT])].map((base) => {
    const f = path.normalize(path.join(base, p));
    return f.startsWith(base + path.sep) ? f : null;
  }).filter(Boolean);
  if (!candidates.length) return send(res, 403, 'Forbidden');
  const tryNext = (i) => {
    if (i >= candidates.length || !TYPES[ext]) {
      const nf = [path.join(OUT, '404.html'), path.join(ROOT, '404.html')].find((x) => fs.existsSync(x));
      res.writeHead(404, { ...SEC_HEADERS, 'Content-Type': TYPES['.html'] });
      return nf ? fs.createReadStream(nf).pipe(res) : res.end('Not found');
    }
    fs.stat(candidates[i], (err, st) => {
      if (err || !st.isFile()) return tryNext(i + 1);
      const headers = { ...SEC_HEADERS, 'Content-Type': TYPES[ext], 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300' };
      if (p.startsWith('/admin/')) { headers['X-Frame-Options'] = 'DENY'; headers['Cache-Control'] = 'no-store'; }
      if (isHttps(req)) headers['Strict-Transport-Security'] = 'max-age=31536000';
      res.writeHead(200, headers);
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(candidates[i]).pipe(res);
    });
  };
  tryNext(0);
}

// ---------- Server ----------
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/healthz') return send(res, 200, { ok: true });
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    serveStatic(req, res, url);
  } catch (e) {
    send(res, e.status || 400, { error: e.status ? e.message : 'Bad request' });
    if (!e.status && !(e instanceof URIError)) console.error(e);
  }
});

// In production, build the site onto the disk before accepting traffic.
const boot = PROD ? rebuild() : Promise.resolve({ ok: true });
boot.then((r) => {
  if (!r.ok) console.error('Initial build failed:\n' + r.log);
  server.listen(PORT, () => {
    console.log(`Hardenwire running at http://localhost:${PORT}${PROD ? ' (production, data in ' + DATA + ')' : ''}`);
    console.log(`Admin panel:          http://localhost:${PORT}/admin/`);
  });
});
