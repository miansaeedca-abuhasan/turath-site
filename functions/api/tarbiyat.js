// «تربیہ» (children's good-conduct chart) for turathkhairalquroon.com — free, Cloudflare Pages Function + the D1 database bound as DB.
// One family = one parent code + one code per child. A child's code can only mark that child's own boxes and see that child's own results.
// Privacy: no e-mail, no surname needed; the owner of the site can read nothing about families. A family idle for 3 weeks is removed; a new family that marks nothing for 5 days is removed; a family that used the chart in week 1 but not in week 2 or not in week 3 is removed when week 3 ends.
import {isOwner} from '../_lib/owner_auth.js';
const json = (o, s = 200) => new Response(JSON.stringify(o), {status: s, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
const DAY = 86400000, SESS = 1 * DAY, IDLE = 28 * DAY;
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
  // parents' private notes to the founder: deliberately NOT linked to any family, child or code (no fam column, no address kept)
  'CREATE TABLE IF NOT EXISTS t_msg (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, kind TEXT NOT NULL, who TEXT NOT NULL, txt TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS t_meta (k TEXT PRIMARY KEY, v INTEGER)',
  'CREATE INDEX IF NOT EXISTS t_kid_fam ON t_kid (fam)', 'CREATE INDEX IF NOT EXISTS t_act_fam ON t_act (fam)',
];
let ready = false;
// a child's age (years), sex ('b' boy / 'g' girl) and «bal» (reached puberty, set by the parents) decide how strict the prayer rows are; added to old tables once
async function init(db) {
  if (ready) return; await db.batch(SCHEMA.map(s => db.prepare(s)));
  for (const c of ['age INTEGER', "sex TEXT DEFAULT ''", 'bal INTEGER DEFAULT 0', "sfrom TEXT DEFAULT ''", 'bmon INTEGER', 'byr INTEGER']) { try { await db.prepare('ALTER TABLE t_kid ADD COLUMN ' + c).run(); } catch (e) { /* already there */ } }
  ready = true;
}
const ageOf = v => { const n = parseInt(v, 10); return isNaN(n) || n < 0 || n > 25 ? null : n; };
// birth month (1-12) + year: the age then advances by itself; both must be given and sensible, else null
const birthOf = (m, y, now) => { const bm = parseInt(m, 10), by = parseInt(y, 10), d = new Date(now || Date.now()); return bm >= 1 && bm <= 12 && by >= d.getUTCFullYear() - 30 && (by < d.getUTCFullYear() || (by === d.getUTCFullYear() && bm <= d.getUTCMonth() + 1)) ? [bm, by] : [null, null]; };
const ageFromBirth = (bm, by, now) => { const d = new Date(now); return Math.max(0, Math.min(25, d.getUTCFullYear() - by - (d.getUTCMonth() + 1 < bm ? 1 : 0))); };
const stageOf = (age, bal) => bal ? 'bal' : age == null ? '' : age < 7 ? 'u7' : age <= 10 ? 'm' : 'o';
const dayStr = ms => new Date(ms).toISOString().slice(0, 10);
const sexOf = v => v === 'g' ? 'g' : v === 'b' ? 'b' : '';

async function sweep(db) {
  const now = Date.now(), m = await db.prepare("SELECT v FROM t_meta WHERE k='sweep'").first();
  if (m && now - m.v < DAY) return;
  await db.prepare("INSERT INTO t_meta (k,v) VALUES ('sweep',?) ON CONFLICT(k) DO UPDATE SET v=?").bind(now, now).run();
  const old = (await db.prepare('SELECT id FROM t_fam WHERE last_active < ?').bind(now - IDLE).all()).results || [];
  for (const f of old) await wipe(db, f.id);
  // new families: (1) nothing marked within 5 days → removed; (2) at the end of week 3, if week 2 or week 3 had no marks → removed (week = 7 days from the day the family was made)
  const young = (await db.prepare('SELECT id, created FROM t_fam WHERE created < ?').bind(now - 5 * DAY).all()).results || [];
  for (const f of young) {
    const cd = Math.floor(f.created / DAY), age = now - f.created;
    const days = ((await db.prepare('SELECT DISTINCT m.day FROM t_mark m JOIN t_kid k ON k.id=m.kid WHERE k.fam=?').bind(f.id).all()).results || []).map(r => dnum(r.day) - cd);
    if (!days.length) { await wipe(db, f.id); continue; }   // 5 days (or more) and still nothing marked
    if (age >= 21 * DAY) {
      const w2 = days.some(d => d >= 7 && d < 14), w3 = days.some(d => d >= 14 && d < 21);
      if (!w2 || !w3) await wipe(db, f.id);
    }
  }
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
  const kids = (await db.prepare('SELECT id, name, age, sex, bal, sfrom, bmon, byr FROM t_kid WHERE fam=? ' + (u.kid ? 'AND id=? ' : '') + 'ORDER BY id').bind(...(u.kid ? [u.fam, u.kid] : [u.fam])).all()).results || [];
  const nowMs = Date.now();
  for (const k of kids) if (k.bmon && k.byr) {   // the age follows the birth month; a change of stage starts the new strictness from that day (never backwards)
    const ea = ageFromBirth(k.bmon, k.byr, nowMs);
    if (ea !== k.age) { const sf = stageOf(ea, k.bal) !== stageOf(k.age, k.bal) ? dayStr(nowMs) : (k.sfrom || dayStr(nowMs)); await db.prepare('UPDATE t_kid SET age=?, sfrom=? WHERE id=?').bind(ea, sf, k.id).run(); k.age = ea; k.sfrom = sf; }
  }
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
      const kids = (Array.isArray(b.kids) ? b.kids : []).map(k => (k && typeof k === 'object') ? {n: str(k.n, 30), a: ageOf(k.a), s: sexOf(k.s), b: birthOf(k.m, k.y, Date.now())} : {n: str(k, 30), a: null, s: '', b: [null, null]}).filter(k => k.n).slice(0, 8);
      if (!kids.length) return json({error: 'kids'}, 400);
      await fail(db, 'c' + ip); // creating is limited too (12 per 15 minutes per address)
      const pc = await newCode(db, 't_fam', 'pcode', 8);
      const fam = (await db.prepare('INSERT INTO t_fam (name,pcode,created,last_active) VALUES (?,?,?,?)').bind(fname, await sha(pc), now, now).run()).meta.last_row_id;
      const out = [];
      for (const k of kids) { const cc = await newCode(db, 't_kid', 'ccode', 6); const id = (await db.prepare('INSERT INTO t_kid (fam,name,ccode,created,age,sex,sfrom,bmon,byr) VALUES (?,?,?,?,?,?,?,?,?)').bind(fam, k.n, await sha(cc), now, k.b[0] ? ageFromBirth(k.b[0], k.b[1], now) : k.a, k.s, dayStr(now), k.b[0], k.b[1]).run()).meta.last_row_id; out.push({id, name: k.n, code: cc}); }
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
    if (a === 'famstats') {   // owner only: just the numbers (how many families / children use the chart), never names or codes
      if (!(await isOwner(request, env))) return json({error: 'forbidden'}, 403);
      const c = async q => (await db.prepare(q).first()).n;
      return json({ok: 1, families: await c('SELECT COUNT(*) n FROM t_fam'), active7: await c('SELECT COUNT(*) n FROM t_fam WHERE last_active>' + (now - 7 * DAY)), kids: await c('SELECT COUNT(*) n FROM t_kid')});
    }
    if (a === 'msglist' || a === 'msgdel') {   // the founder's inbox: only a signed-in owner (same cookie as the owner area) can read or delete
      if (!(await isOwner(request, env))) return json({error: 'forbidden'}, 403);
      if (a === 'msgdel') { await db.prepare('DELETE FROM t_msg WHERE id=?').bind(parseInt(b.id, 10)).run(); return json({ok: 1}); }
      return json({ok: 1, list: (await db.prepare('SELECT id, ts, kind, who, txt FROM t_msg ORDER BY id DESC LIMIT 300').all()).results || []});
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
      if (act === 0) {   // «رخصت»: a grown-up girl's days of exemption (act 0 is no activity; such a day is not counted and costs no minus point); she or her parents set it
        const G = await db.prepare("SELECT 1 FROM t_kid WHERE id=? AND fam=? AND sex='g' AND bal=1").bind(kid, u.fam).first(); if (!G) return json({error: 'bad'}, 400);
        if (n === 0) await db.prepare('DELETE FROM t_mark WHERE kid=? AND act=0 AND day=?').bind(kid, day).run();
        else await db.prepare('INSERT INTO t_mark (kid,act,day,n) VALUES (?,0,?,1) ON CONFLICT(kid,act,day) DO UPDATE SET n=1').bind(kid, day).run();
        await db.prepare('UPDATE t_fam SET last_active=? WHERE id=?').bind(now, u.fam).run();
        return json({ok: 1});
      }
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
    if (a === 'feedback') {   // a private note to the founder; stored with no family, child, code or address, so nobody can trace it
      if (!(await guard(db, 'm' + ip))) return json({error: 'slow'}, 429);
      const txt = String(b.text == null ? '' : b.text).replace(/[<>]/g, '').trim().slice(0, 3000); if (txt.length < 3) return json({error: 'bad'}, 400);
      const kind = ['s', 'c', 'r'].includes(b.kind) ? b.kind : 's';
      await fail(db, 'm' + ip);
      await db.prepare('INSERT INTO t_msg (ts,kind,who,txt) VALUES (?,?,?,?)').bind(now, kind, str(b.who, 40), txt).run();
      await db.prepare('DELETE FROM t_msg WHERE id <= (SELECT id FROM t_msg ORDER BY id DESC LIMIT 1 OFFSET 500)').run();
      return json({ok: 1});
    }
    if (a === 'clearremind') { const k = await db.prepare('SELECT id FROM t_kid WHERE id=? AND fam=?').bind(parseInt(b.kid, 10), u.fam).first(); if (!k) return json({error: 'bad'}, 400); await db.prepare('DELETE FROM t_remind WHERE kid=?').bind(k.id).run(); return json({ok: 1}); }
    if (a === 'fname') { await db.prepare('UPDATE t_fam SET name=? WHERE id=?').bind(str(b.name, 40) || 'ہمارا گھر', u.fam).run(); return json({ok: 1}); }
    if (a === 'addkid') {
      const c = (await db.prepare('SELECT COUNT(*) n FROM t_kid WHERE fam=?').bind(u.fam).first()).n; if (c >= 8) return json({error: 'max'}, 400);
      const name = str(b.name, 30); if (!name) return json({error: 'bad'}, 400);
      const bb = birthOf(b.bm, b.by, now);
      const cc = await newCode(db, 't_kid', 'ccode', 6);
      const id = (await db.prepare('INSERT INTO t_kid (fam,name,ccode,created,age,sex,sfrom,bmon,byr) VALUES (?,?,?,?,?,?,?,?,?)').bind(u.fam, name, await sha(cc), now, bb[0] ? ageFromBirth(bb[0], bb[1], now) : ageOf(b.age), sexOf(b.sex), dayStr(now), bb[0], bb[1]).run()).meta.last_row_id;
      return json({ok: 1, id, name, code: cc});
    }
    const ownKid = async id => await db.prepare('SELECT id FROM t_kid WHERE id=? AND fam=?').bind(parseInt(id, 10), u.fam).first();
    if (a === 'kidcode') { const k = await ownKid(b.kid); if (!k) return json({error: 'bad'}, 400); const cc = await newCode(db, 't_kid', 'ccode', 6); await db.prepare('UPDATE t_kid SET ccode=? WHERE id=?').bind(await sha(cc), k.id).run(); await db.prepare('DELETE FROM t_sess WHERE kid=?').bind(k.id).run(); return json({ok: 1, code: cc}); }
    if (a === 'kidinfo') { const k = await db.prepare('SELECT id, age, bal, sfrom FROM t_kid WHERE id=? AND fam=?').bind(parseInt(b.kid, 10), u.fam).first(); if (!k) return json({error: 'bad'}, 400);
      const bb = birthOf(b.bm, b.by, now), age = bb[0] ? ageFromBirth(bb[0], bb[1], now) : ageOf(b.age), bal = b.bal ? 1 : 0;
      // the strictness (a missed prayer = minus point) counts only from the day after the rules for this child last changed, never backwards over old weeks
      const sfrom = stageOf(age, bal) !== stageOf(k.age, k.bal) ? dayStr(now) : (k.sfrom || dayStr(now));
      await db.prepare('UPDATE t_kid SET age=?, sex=?, bal=?, sfrom=?, bmon=?, byr=? WHERE id=?').bind(age, sexOf(b.sex), bal, sfrom, bb[0], bb[1], k.id).run(); return json({ok: 1}); }
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
