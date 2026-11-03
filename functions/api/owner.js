// Owner (founder) panel API for turathkhairalquroon.com — Cloudflare Pages Function, D1 database bound as DB.
// Settings (Cloudflare Pages -> Settings -> Variables and Secrets), all set by the owner himself:
//   OWNER_USERS = JSON text (encrypted secret): {"first@mail.com":"password one","second@mail.com":"password two"}
//                 (each e-mail has its own password)
// Login = an allowed e-mail + that e-mail's password; the server then gives a signed, HttpOnly cookie (12 hours).
// Public part (a=pub): the site settings that visitors' browsers read (banner, news, ticker, hidden tiles, text corrections).
// Private part: save settings, visitor numbers. Nothing else is stored; the password never leaves the server.
const json = (o, s = 200, h = {}) => new Response(JSON.stringify(o), {status: s, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...h}});
import {hmac, same, users, isOwner} from '../_lib/owner_auth.js';
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const authed = isOwner;
const KEYS = {banner: 20000, news: 60000, ticker: 30000, hide: 4000, fixes: 120000};
async function ensure(db) {
  await db.prepare('CREATE TABLE IF NOT EXISTS site_cfg (k TEXT PRIMARY KEY, v TEXT NOT NULL)').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS owner_fail (k TEXT PRIMARY KEY, n INTEGER NOT NULL, t INTEGER NOT NULL)').run();
}

export async function onRequest({request, env}) {
  const db = env.DB, url = new URL(request.url), a = url.searchParams.get('a') || '';
  if (!db) return json({error: 'database not set up'}, 503);
  try {
    await ensure(db);
    if (a === 'pub' && request.method === 'GET') {
      const rs = await db.prepare('SELECT k, v FROM site_cfg').all(), o = {};
      for (const r of (rs.results || [])) { try { o[r.k] = JSON.parse(r.v); } catch (e) {} }
      return json(o, 200, {'Cache-Control': 'public, max-age=60'});
    }
    if (a === 'me') return json({ok: await authed(request, env), setup: Object.keys(users(env)).length > 0});
    if (request.method !== 'POST' && a !== 'stats') return json({error: 'method'}, 405);
    if (request.method === 'POST') {
      const o = request.headers.get('Origin');
      if (o && new URL(o).host !== url.host) return json({error: 'origin'}, 403);
    }
    if (a === 'login') {
      const U = users(env); if (!Object.keys(U).length) return json({error: 'setup'}, 503);
      const now = Date.now(), f = await db.prepare("SELECT n, t FROM owner_fail WHERE k = 'g'").first();
      if (f && f.n >= 6 && now - f.t < 15 * 60000) return json({error: 'locked'}, 429);
      const b = await request.json().catch(() => ({}));
      const mail = String(b.email || '').trim().toLowerCase(), want = Object.prototype.hasOwnProperty.call(U, mail) ? U[mail] : null;
      const okPass = await same(b.password || '', want === null ? '\u0000none' : want);
      if (!(want !== null && okPass)) {
        const n = f && now - f.t < 15 * 60000 ? f.n + 1 : 1;
        await db.prepare("INSERT INTO owner_fail (k, n, t) VALUES ('g', ?, ?) ON CONFLICT(k) DO UPDATE SET n = excluded.n, t = excluded.t").bind(n, now).run();
        return json({error: 'bad'}, 401);
      }
      await db.prepare("DELETE FROM owner_fail WHERE k = 'g'").run();
      const id = hex(crypto.getRandomValues(new Uint8Array(12))), exp = now + 12 * 3600000;
      const tok = id + '.' + exp + '.' + await hmac(env.OWNER_USERS + '|tk', id + '.' + exp);
      return json({ok: true}, 200, {'Set-Cookie': 'tk_owner=' + tok + '; Path=/; Max-Age=43200; HttpOnly; Secure; SameSite=Strict'});
    }
    if (a === 'logout') return json({ok: true}, 200, {'Set-Cookie': 'tk_owner=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict'});
    if (!(await authed(request, env))) return json({error: 'auth'}, 401);
    if (a === 'save') {
      const b = await request.json().catch(() => null);
      if (!b || !(b.k in KEYS)) return json({error: 'key'}, 400);
      const s = JSON.stringify(b.v === undefined ? null : b.v);
      if (s.length > KEYS[b.k]) return json({error: 'too big'}, 413);
      await db.prepare('INSERT INTO site_cfg (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v').bind(b.k, s).run();
      return json({ok: true});
    }
    if (a === 'stats') {
      const r = await db.prepare("SELECT n FROM counter WHERE k = 'visits'").first();
      const rs = await db.prepare("SELECT k, n FROM counter WHERE k LIKE 'c:%' ORDER BY n DESC LIMIT 200").all();
      return json({n: r ? r.n : 0, c: (rs.results || []).map(x => [x.k.slice(2), x.n])});
    }
    return json({error: 'action'}, 400);
  } catch (e) {
    return json({error: 'server'}, 500);
  }
}
