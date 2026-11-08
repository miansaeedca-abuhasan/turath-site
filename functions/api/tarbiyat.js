// «تربیت» (children's good-conduct chart) for turathkhairalquroon.com — free, Cloudflare Pages Function + the D1 database bound as DB.
// One family = one parent code + one code per child. A child's code can only mark that child's own boxes and see that child's own results.
// Privacy: no e-mail, no surname needed; the owner of the site can read nothing about families. A family idle for 120 days is removed.
const json = (o, s = 200) => new Response(JSON.stringify(o), {status: s, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
const DAY = 86400000, SESS = 90 * DAY, IDLE = 120 * DAY;
const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const AL = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const code = n => { const r = crypto.getRandomValues(new Uint8Array(n)); return [...r].map(x => AL[x % AL.length]).join(''); };
const sha = async s => hex(await crypto.subtle.digest('SHA-256', enc.encode('tarbiyat|' + s)));
const str = (v, n) => String(v == null ? '' : v).trim().replace(/[<>]/g, '').slice(0, n);
const dayOk = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '') && !isNaN(Date.parse(d + 'T00:00:00Z'));
const dnum = d => Math.floor(Date.parse(d + 'T00:00:00Z') / DAY);
const CLEAN = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// [key, kind, group, fridayOnly]. Name is stored empty: the page shows the built-in name in the reader's language until a parent renames it.
// group 'w' = عابد نونہال (worship), 'h' = ہونہار نونہال (homework and study), 'a' = مثالی نونہال (conduct, plus the minus rows; marked by the parents only)
const DEFAULT_ACTS = [['pray_unasked', 'p', 'a', 0], ['obey_parents', 'p', 'a', 0], ['sibling_manners', 'p', 'a', 0], ['cleanliness', 'p', 'a', 0], ['sleep_time', 'p', 'a', 0], ['fight', 'n', 'a', 0], ['complaint', 'n', 'a', 0], ['loud', 'n', 'a', 0], ['stubborn', 'n', 'a', 0],
  ['fajr', 'p', 'w', 0], ['zuhr', 'p', 'w', 0], ['asr', 'p', 'w', 0], ['maghrib', 'p', 'w', 0], ['isha', 'p', 'w', 0], ['w_am', 'p', 'w', 0], ['w_pm', 'p', 'w', 0], ['w_sleep', 'p', 'w', 0], ['w_quran', 'p', 'w', 0], ['w_durood', 'p', 'w', 0], ['w_kahf', 'p', 'w', 1], ['w_durood_fri', 'p', 'w', 1],
  ['h_homework', 'p', 'h', 0], ['h_revise', 'p', 'h', 0], ['h_bag', 'p', 'h', 0], ['h_read', 'p', 'h', 0], ['h_neat', 'p', 'h', 0]];

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS t_fam (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, pcode TEXT UNIQUE NOT NULL, created INTEGER NOT NULL, last_active INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS t_kid (id INTEGER PRIMARY KEY AUTOINCREMENT, fam INTEGER NOT NULL, name TEXT NOT NULL, ccode TEXT UNIQUE NOT NULL, created INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS t_act (id INTEGER PRIMARY KEY AUTOINCREMENT, fam INTEGER NOT NULL, name TEXT NOT NULL, kind TEXT NOT NULL, pos INTEGER NOT NULL, off INTEGER DEFAULT 0, grp TEXT DEFAULT \'a\', akey TEXT DEFAULT \'\', fri INTEGER DEFAULT 0)',
  'CREATE TABLE IF NOT EXISTS t_mark (kid INTEGER NOT NULL, act INTEGER NOT NULL, day TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (kid, act, day))',
  'CREATE TABLE IF NOT EXISTS t_sess (token TEXT PRIMARY KEY, fam INTEGER NOT NULL, kid INTEGER, exp INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS t_fail (k TEXT PRIMARY KEY, n INTEGER NOT NULL, ts INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS t_remind (kid INTEGER NOT NULL, day TEXT NOT NULL, ts INTEGER NOT NULL, PRIMARY KEY (kid, day))',
  'CREATE TABLE IF NOT EXISTS t_meta (k TEXT PRIMARY KEY, v INTEGER)',
  'CREATE INDEX IF NOT EXISTS t_kid_fam ON t_kid (fam)', 'CREATE INDEX IF NOT EXISTS t_act_fam ON t_act (fam)',
];
let ready = false;
async function init(db) { if (ready) return; await db.batch(SCHEMA.map(s => db.prepare(s))); ready = true; }

async function sweep(db) {
  const now = Date.now(), m = await db.prepare("SELECT v FROM t_meta WHERE k='sweep'").first();
  if (m && now - m.v < DAY) return;
  await db.prepare("INSERT INTO t_meta (k,v) VALUES ('sweep',?) ON CONFLICT(k) DO UPDATE SET v=?").bind(now, now).run();
  const old = (await db.prepare('SELECT id FROM t_fam WHERE last_active < ?').bind(now - IDLE).all()).results || [];
  for (const f of old) await wipe(db, f.id);
  await db.prepare('DELETE FROM t_sess WHERE exp < ?').bind(now).run();
  await db.prepare('DELETE FROM t_fail WHERE ts < ?').bind(now - DAY).run();
}
async function wipe(db, fam) {
  await db.batch([
    db.prepare('DELETE FROM t_mark WHERE kid IN (SELECT id FROM t_kid WHERE fam=?)').bind(fam),
    db.prepare('DELETE FROM t_remind WHERE kid IN (SELECT id FROM t_kid WHERE fam=?)').bind(fam),
    db.prepare('DELETE FROM t_kid WHERE fam=?').bind(fam), db.prepare('DELETE FROM t_act WHERE fam=?').bind(fam),
    db.prepare('DELETE FROM t_sess WHERE fam=?').bind(fam), db.prepare('DELETE FROM t_fam WHERE id=?').bind(fam)]);
}
async function newCode(db, table, col, n) { for (let i = 0; i < 8; i++) { const c = code(n); if (!(await db.prepare('SELECT 1 FROM ' + table + ' WHERE ' + col + '=?').bind(await sha(c)).first())) return c; } throw new Error('code'); }

async function who(db, token) {
  if (!token) return null;
  const s = await db.prepare('SELECT s.fam, s.kid, f.name AS fname FROM t_sess s JOIN t_fam f ON f.id=s.fam WHERE s.token=? AND s.exp>?').bind(token, Date.now()).first();
  return s ? {fam: s.fam, kid: s.kid, fname: s.fname} : null;
}
async function snapshot(db, u) {
  // families made before a default row existed get the missing rows added once
  const have = new Set(((await db.prepare('SELECT akey FROM t_act WHERE fam=?').bind(u.fam).all()).results || []).map(r => r.akey));
  for (const a of DEFAULT_ACTS) if (a[2] === 'w' && !have.has(a[0])) {
    const m = await db.prepare('SELECT COALESCE(MAX(pos),0)+1 AS p FROM t_act WHERE fam=?').bind(u.fam).first();
    await db.prepare('INSERT INTO t_act (fam,name,kind,pos,grp,akey,fri) VALUES (?,?,?,?,?,?,?)').bind(u.fam, '', a[1], m.p, a[2], a[0], a[3]).run();
  }
  const kids = (await db.prepare('SELECT id, name FROM t_kid WHERE fam=? ' + (u.kid ? 'AND id=? ' : '') + 'ORDER BY id').bind(...(u.kid ? [u.fam, u.kid] : [u.fam])).all()).results || [];
  const acts = (await db.prepare('SELECT id, name, kind, grp, akey AS key, fri FROM t_act WHERE fam=? AND off=0 ORDER BY pos, id').bind(u.fam).all()).results || [];
  const reminds = ((await db.prepare('SELECT r.kid, r.day FROM t_remind r JOIN t_kid k ON k.id=r.kid WHERE k.fam=? ' + (u.kid ? 'AND r.kid=? ' : '') + 'ORDER BY r.ts').bind(...(u.kid ? [u.fam, u.kid] : [u.fam])).all()).results || []).map(r => [r.kid, r.day]);
  return {role: u.kid ? 'child' : 'parent', family: u.fname, me: u.kid || null, kids, acts, reminds};
}
const FAILMAX = 12;
async function guard(db, ip) { const r = await db.prepare('SELECT n, ts FROM t_fail WHERE k=?').bind(ip).first(); return !(r && r.n >= FAILMAX && Date.now() - r.ts < 15 * 60000); }
async function fail(db, ip) { await db.prepare("INSERT INTO t_fail (k,n,ts) VALUES (?,1,?) ON CONFLICT(k) DO UPDATE SET n=CASE WHEN ?-ts>900000 THEN 1 ELSE n+1 END, ts=?").bind(ip, Date.now(), Date.now(), Date.now()).run(); }

export async function onRequest(ctx) {
  const {request, env} = ctx, db = env.DB;
  if (!db) return json({error: 'not set up'}, 503);
  if (request.method !== 'POST') return json({error: 'post'}, 405);
  let b; try { b = await request.json(); } catch (e) { return json({error: 'bad'}, 400); }
  const a = str(b.a, 20), ip = request.headers.get('CF-Connecting-IP') || 'x';
  try {
    await init(db); await sweep(db);
    const now = Date.now();
    if (a === 'create') {
      if (!(await guard(db, 'c' + ip))) return json({error: 'slow'}, 429);
      const fname = str(b.family, 40) || 'ہمارا گھر';
      const kids = (Array.isArray(b.kids) ? b.kids : []).map(k => str(k, 30)).filter(Boolean).slice(0, 8);
      if (!kids.length) return json({error: 'kids'}, 400);
      await fail(db, 'c' + ip); // creating is limited too (12 per 15 minutes per address)
      const pc = await newCode(db, 't_fam', 'pcode', 8);
      const fam = (await db.prepare('INSERT INTO t_fam (name,pcode,created,last_active) VALUES (?,?,?,?)').bind(fname, await sha(pc), now, now).run()).meta.last_row_id;
      const out = [];
      for (const k of kids) { const cc = await newCode(db, 't_kid', 'ccode', 6); const id = (await db.prepare('INSERT INTO t_kid (fam,name,ccode,created) VALUES (?,?,?,?)').bind(fam, k, await sha(cc), now).run()).meta.last_row_id; out.push({id, name: k, code: cc}); }
      for (let i = 0; i < DEFAULT_ACTS.length; i++) await db.prepare('INSERT INTO t_act (fam,name,kind,pos,grp,akey,fri) VALUES (?,?,?,?,?,?,?)').bind(fam, '', DEFAULT_ACTS[i][1], i, DEFAULT_ACTS[i][2], DEFAULT_ACTS[i][0], DEFAULT_ACTS[i][3]).run();
      const token = code(32); await db.prepare('INSERT INTO t_sess (token,fam,kid,exp) VALUES (?,?,NULL,?)').bind(token, fam, now + SESS).run();
      return json({ok: 1, ...(await snapshot(db, {fam, kid: null, fname})), token, parentCode: pc, kids: out});
    }
    if (a === 'login') {
      if (!(await guard(db, ip))) return json({error: 'slow'}, 429);
      const c = CLEAN(b.code), h = await sha(c);
      let fam = null, kid = null;
      if (c.length === 8) { const f = await db.prepare('SELECT id FROM t_fam WHERE pcode=?').bind(h).first(); if (f) fam = f.id; }
      else if (c.length === 6) { const k = await db.prepare('SELECT id, fam FROM t_kid WHERE ccode=?').bind(h).first(); if (k) { fam = k.fam; kid = k.id; } }
      if (!fam) { await fail(db, ip); return json({error: 'login'}, 401); }
      const token = code(32); await db.prepare('INSERT INTO t_sess (token,fam,kid,exp) VALUES (?,?,?,?)').bind(token, fam, kid, now + SESS).run();
      await db.prepare('UPDATE t_fam SET last_active=? WHERE id=?').bind(now, fam).run();
      const f = await db.prepare('SELECT name FROM t_fam WHERE id=?').bind(fam).first();
      return json({ok: 1, token, ...(await snapshot(db, {fam, kid, fname: f.name}))});
    }
    const u = await who(db, str(b.token, 64));
    if (!u) return json({error: 'auth'}, 401);
    const parent = !u.kid;
    if (a === 'state') { await db.prepare('UPDATE t_fam SET last_active=? WHERE id=?').bind(now, u.fam).run(); return json({ok: 1, ...(await snapshot(db, u))}); }
    if (a === 'logout') { await db.prepare('DELETE FROM t_sess WHERE token=?').bind(str(b.token, 64)).run(); return json({ok: 1}); }
    if (a === 'marks') {
      const f = str(b.from, 10), t = str(b.to, 10); if (!dayOk(f) || !dayOk(t) || dnum(t) - dnum(f) > 800) return json({error: 'range'}, 400);
      const q = 'SELECT m.kid, m.act, m.day, m.n FROM t_mark m JOIN t_kid k ON k.id=m.kid WHERE k.fam=? AND m.day>=? AND m.day<=?' + (u.kid ? ' AND m.kid=?' : '');
      const rows = (await db.prepare(q).bind(...(u.kid ? [u.fam, f, t, u.kid] : [u.fam, f, t])).all()).results || [];
      return json({ok: 1, marks: rows.map(r => [r.kid, r.act, r.day, r.n])});
    }
    if (a === 'mark') {
      const kid = parseInt(b.kid, 10), act = parseInt(b.act, 10), day = str(b.day, 10); let n = parseInt(b.n, 10);
      if (!dayOk(day) || isNaN(kid) || isNaN(act) || isNaN(n)) return json({error: 'bad'}, 400);
      n = Math.min(30, Math.max(0, n));
      if (u.kid && kid !== u.kid) return json({error: 'forbidden'}, 403);   // a child can mark only his own boxes
      const today = Math.floor(now / DAY), d = dnum(day);
      if (d > today + 1) return json({error: 'future'}, 400);
      if (u.kid && d < today - 2) return json({error: 'old'}, 403);        // a child can fill today and yesterday (the page enforces the exact local days; the server allows one extra day for time zones); a parent can fix any day
      const A = await db.prepare('SELECT kind, fri, grp FROM t_act WHERE id=? AND fam=? AND off=0').bind(act, u.fam).first(), K = await db.prepare('SELECT 1 FROM t_kid WHERE id=? AND fam=?').bind(kid, u.fam).first();
      if (!A || !K) return json({error: 'bad'}, 400);
      if (A.fri && new Date(day + 'T00:00:00Z').getUTCDay() !== 5) return json({error: 'notfri'}, 400);
      if (u.kid && (A.kind === 'n' || A.grp === 'a')) return json({error: 'parentonly'}, 403); // the whole third category (conduct + minus points) is marked by the parents
      if (n === 0) await db.prepare('DELETE FROM t_mark WHERE kid=? AND act=? AND day=?').bind(kid, act, day).run();
      else await db.prepare('INSERT INTO t_mark (kid,act,day,n) VALUES (?,?,?,?) ON CONFLICT(kid,act,day) DO UPDATE SET n=?').bind(kid, act, day, n, n).run();
      if (!u.kid && A.grp === 'a') await db.prepare('DELETE FROM t_remind WHERE kid=? AND day=?').bind(kid, day).run(); // the parent has now marked this day
      await db.prepare('UPDATE t_fam SET last_active=? WHERE id=?').bind(now, u.fam).run();
      return json({ok: 1});
    }
    if (a === 'remind') { // a child asks the parents (at bedtime) to mark his report
      if (!u.kid) return json({error: 'forbidden'}, 403);
      const day = str(b.day, 10), d = dnum(day); if (!dayOk(day) || d > Math.floor(now / DAY) + 1 || d < Math.floor(now / DAY) - 2) return json({error: 'bad'}, 400);
      await db.prepare('INSERT INTO t_remind (kid,day,ts) VALUES (?,?,?) ON CONFLICT(kid,day) DO UPDATE SET ts=?').bind(u.kid, day, now, now).run();
      await db.prepare('DELETE FROM t_remind WHERE kid=? AND day<?').bind(u.kid, new Date(now - 14 * DAY).toISOString().slice(0, 10)).run();
      return json({ok: 1, ...(await snapshot(db, u))});
    }
    if (!parent) return json({error: 'forbidden'}, 403);
    // ---- parent only ----
    if (a === 'clearremind') { const k = await db.prepare('SELECT id FROM t_kid WHERE id=? AND fam=?').bind(parseInt(b.kid, 10), u.fam).first(); if (!k) return json({error: 'bad'}, 400); await db.prepare('DELETE FROM t_remind WHERE kid=?').bind(k.id).run(); return json({ok: 1}); }
    if (a === 'fname') { await db.prepare('UPDATE t_fam SET name=? WHERE id=?').bind(str(b.name, 40) || 'ہمارا گھر', u.fam).run(); return json({ok: 1}); }
    if (a === 'addkid') {
      const c = (await db.prepare('SELECT COUNT(*) n FROM t_kid WHERE fam=?').bind(u.fam).first()).n; if (c >= 8) return json({error: 'max'}, 400);
      const name = str(b.name, 30); if (!name) return json({error: 'bad'}, 400);
      const cc = await newCode(db, 't_kid', 'ccode', 6);
      const id = (await db.prepare('INSERT INTO t_kid (fam,name,ccode,created) VALUES (?,?,?,?)').bind(u.fam, name, await sha(cc), now).run()).meta.last_row_id;
      return json({ok: 1, id, name, code: cc});
    }
    const ownKid = async id => await db.prepare('SELECT id FROM t_kid WHERE id=? AND fam=?').bind(parseInt(id, 10), u.fam).first();
    if (a === 'kidcode') { const k = await ownKid(b.kid); if (!k) return json({error: 'bad'}, 400); const cc = await newCode(db, 't_kid', 'ccode', 6); await db.prepare('UPDATE t_kid SET ccode=? WHERE id=?').bind(await sha(cc), k.id).run(); await db.prepare('DELETE FROM t_sess WHERE kid=?').bind(k.id).run(); return json({ok: 1, code: cc}); }
    if (a === 'kidname') { const k = await ownKid(b.kid), name = str(b.name, 30); if (!k || !name) return json({error: 'bad'}, 400); await db.prepare('UPDATE t_kid SET name=? WHERE id=?').bind(name, k.id).run(); return json({ok: 1}); }
    if (a === 'kiddel') { const k = await ownKid(b.kid); if (!k) return json({error: 'bad'}, 400); await db.batch([db.prepare('DELETE FROM t_mark WHERE kid=?').bind(k.id), db.prepare('DELETE FROM t_remind WHERE kid=?').bind(k.id), db.prepare('DELETE FROM t_sess WHERE kid=?').bind(k.id), db.prepare('DELETE FROM t_kid WHERE id=?').bind(k.id)]); return json({ok: 1}); }
    if (a === 'parentcode') { const pc = await newCode(db, 't_fam', 'pcode', 8); await db.prepare('UPDATE t_fam SET pcode=? WHERE id=?').bind(await sha(pc), u.fam).run(); await db.prepare('DELETE FROM t_sess WHERE fam=? AND kid IS NULL AND token<>?').bind(u.fam, str(b.token, 64)).run(); return json({ok: 1, code: pc}); }
    if (a === 'actadd') {
      const name = str(b.name, 60), kind = b.kind === 'n' ? 'n' : 'p', grp = b.grp === 'w' ? 'w' : b.grp === 'h' ? 'h' : 'a'; if (!name) return json({error: 'bad'}, 400);
      const c = (await db.prepare('SELECT COUNT(*) n, COALESCE(MAX(pos),0) m FROM t_act WHERE fam=? AND off=0').bind(u.fam).first()); if (c.n >= 40) return json({error: 'max'}, 400);
      const id = (await db.prepare('INSERT INTO t_act (fam,name,kind,pos,grp) VALUES (?,?,?,?,?)').bind(u.fam, name, kind, c.m + 1, grp).run()).meta.last_row_id; return json({ok: 1, id});
    }
    if (a === 'actname') { const name = str(b.name, 60); if (!name) return json({error: 'bad'}, 400); await db.prepare('UPDATE t_act SET name=? WHERE id=? AND fam=?').bind(name, parseInt(b.act, 10), u.fam).run(); return json({ok: 1}); }
    if (a === 'actdel') { await db.prepare('UPDATE t_act SET off=1 WHERE id=? AND fam=?').bind(parseInt(b.act, 10), u.fam).run(); return json({ok: 1}); } // hidden, so the old results stay in the graphs
    if (a === 'famdel') { if (b.sure !== 'yes') return json({error: 'bad'}, 400); await wipe(db, u.fam); return json({ok: 1}); }
    return json({error: 'unknown'}, 400);
  } catch (e) { return json({error: 'server'}, 500); }
}
