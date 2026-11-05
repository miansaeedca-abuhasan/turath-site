// Hifz diary (حفظ ڈائری) for turathkhairalquroon.com — free service, Cloudflare Pages Function + the D1 database bound as DB.
// One account space per institution (its own code). Roles: principal, teacher, parent.
// Privacy: every query is limited to the caller's institution (and, for a parent, to his own children). The site owner can only
// read counts (api/diary?stats with the owner session), never names, children or entries.
import {isOwner} from '../_lib/owner_auth.js';

const json = (o, s = 200) => new Response(JSON.stringify(o), {status: s, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
const DAY = 86400000, WARN_AFTER = 30 * DAY, GRACE = 5 * DAY, SESS = 30 * DAY;
const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const rnd = n => hex(crypto.getRandomValues(new Uint8Array(n)));
const str = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const int = (v, lo, hi) => { v = parseInt(v, 10); return isNaN(v) ? null : Math.min(hi, Math.max(lo, v)); };
const dayOk = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '');
async function hashPw(pw, salt) {
  const k = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 100000}, k, 256));
}
async function same(a, b) { return a.length === b.length && [...a].reduce((d, c, i) => d | (c.charCodeAt(0) ^ b.charCodeAt(i)), 0) === 0; }

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS d_inst (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, created INTEGER NOT NULL, last_active INTEGER NOT NULL, warned_at INTEGER)',
  'CREATE TABLE IF NOT EXISTS d_user (id INTEGER PRIMARY KEY AUTOINCREMENT, inst INTEGER NOT NULL, role TEXT NOT NULL, name TEXT NOT NULL, uname TEXT NOT NULL, salt TEXT NOT NULL, pw TEXT NOT NULL, created INTEGER NOT NULL, UNIQUE(inst, uname))',
  'CREATE TABLE IF NOT EXISTS d_student (id INTEGER PRIMARY KEY AUTOINCREMENT, inst INTEGER NOT NULL, name TEXT NOT NULL, teacher INTEGER, parent INTEGER, created INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS d_entry (student INTEGER NOT NULL, day TEXT NOT NULL, absent INTEGER DEFAULT 0, sabaq_lines INTEGER, sabaq_q INTEGER, sabqi_para INTEGER, sabqi_err INTEGER, manzil_para INTEGER, manzil_err INTEGER, note TEXT, by_user INTEGER, updated INTEGER, PRIMARY KEY (student, day))',
  'CREATE TABLE IF NOT EXISTS d_note (id INTEGER PRIMARY KEY AUTOINCREMENT, inst INTEGER NOT NULL, user INTEGER NOT NULL, kind TEXT, text TEXT, ts INTEGER NOT NULL, seen INTEGER DEFAULT 0)',
  'CREATE TABLE IF NOT EXISTS d_sess (token TEXT PRIMARY KEY, user INTEGER NOT NULL, exp INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS d_fail (k TEXT PRIMARY KEY, n INTEGER NOT NULL, ts INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS d_meta (k TEXT PRIMARY KEY, v INTEGER)',
  'CREATE TABLE IF NOT EXISTS d_pending (email TEXT PRIMARY KEY, data TEXT NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL, exp INTEGER NOT NULL, tries INTEGER DEFAULT 0, sent_n INTEGER DEFAULT 1, sent_ts INTEGER NOT NULL)',
  'CREATE INDEX IF NOT EXISTS d_student_inst ON d_student (inst)',
  'CREATE INDEX IF NOT EXISTS d_note_user ON d_note (user, seen)',
];
let ready = false;
async function init(db) {
  if (ready) return;
  await db.batch(SCHEMA.map(s => db.prepare(s)));
  try { await db.prepare('ALTER TABLE d_inst ADD COLUMN email TEXT').run(); } catch (e) {} // already there
  ready = true;
}

async function notify(db, inst, user, kind, text) { await db.prepare('INSERT INTO d_note (inst, user, kind, text, ts) VALUES (?,?,?,?,?)').bind(inst, user, kind, str(text, 300), Date.now()).run(); }
async function principals(db, inst) { return ((await db.prepare("SELECT id FROM d_user WHERE inst=? AND role='principal'").bind(inst).all()).results || []).map(r => r.id); }

// Lazy daily sweep (Pages Functions have no timer): warn the principal after 30 idle days, delete after 5 more.
async function sweep(db) {
  const now = Date.now(), m = await db.prepare("SELECT v FROM d_meta WHERE k='sweep'").first();
  if (m && now - m.v < DAY) return;
  await db.prepare("INSERT INTO d_meta (k,v) VALUES ('sweep',?) ON CONFLICT(k) DO UPDATE SET v=?").bind(now, now).run();
  const idle = (await db.prepare('SELECT id FROM d_inst WHERE last_active < ? AND warned_at IS NULL').bind(now - WARN_AFTER).all()).results || [];
  for (const i of idle) {
    await db.prepare('UPDATE d_inst SET warned_at=? WHERE id=?').bind(now, i.id).run();
    for (const p of await principals(db, i.id)) await notify(db, i.id, p, 'warn', 'idle');
  }
  const gone = (await db.prepare('SELECT id FROM d_inst WHERE warned_at IS NOT NULL AND warned_at < ? AND last_active < warned_at').bind(now - GRACE).all()).results || [];
  for (const i of gone) await wipe(db, i.id);
  await db.prepare('DELETE FROM d_sess WHERE exp < ?').bind(now).run();
  await db.prepare('DELETE FROM d_pending WHERE exp < ?').bind(now - 3600000).run();
}
async function wipe(db, id) {
  await db.batch([
    db.prepare('DELETE FROM d_entry WHERE student IN (SELECT id FROM d_student WHERE inst=?)').bind(id),
    db.prepare('DELETE FROM d_student WHERE inst=?').bind(id),
    db.prepare('DELETE FROM d_note WHERE inst=?').bind(id),
    db.prepare('DELETE FROM d_sess WHERE user IN (SELECT id FROM d_user WHERE inst=?)').bind(id),
    db.prepare('DELETE FROM d_user WHERE inst=?').bind(id),
    db.prepare('DELETE FROM d_inst WHERE id=?').bind(id),
  ]);
}
async function touch(db, inst) { await db.prepare('UPDATE d_inst SET last_active=?, warned_at=NULL WHERE id=?').bind(Date.now(), inst).run(); }

const bearer = req => (req.headers.get('Authorization') || '').replace(/^Bearer /, '');
async function session(db, req) {
  const t = bearer(req);
  if (!/^[0-9a-f]{48}$/.test(t)) return null;
  return await db.prepare('SELECT u.id, u.inst, u.role, u.name, u.uname, i.name AS inst_name, i.code, i.warned_at FROM d_sess s JOIN d_user u ON u.id=s.user JOIN d_inst i ON i.id=u.inst WHERE s.token=? AND s.exp>?').bind(t, Date.now()).first();
}
async function newSession(db, uid) { const t = rnd(24); await db.prepare('INSERT INTO d_sess (token,user,exp) VALUES (?,?,?)').bind(t, uid, Date.now() + SESS).run(); return t; }
async function addUser(db, inst, role, name, uname, pw) {
  const salt = rnd(8);
  const r = await db.prepare('INSERT INTO d_user (inst,role,name,uname,salt,pw,created) VALUES (?,?,?,?,?,?,?)').bind(inst, role, name, uname, salt, await hashPw(pw, salt), Date.now()).run();
  return r.meta.last_row_id;
}
const unameOk = u => /^[a-z0-9._-]{3,30}$/.test(u);
// strong password: at least 10 characters with a letter, a digit and a symbol
const pwOk = p => typeof p === 'string' && p.length >= 10 && p.length <= 100 && /[A-Za-z\u0600-\u06FF]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9\u0600-\u06FF\s]/.test(p);
const emailOk = e => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(e) && e.length <= 254;
async function sendMail(env, to, code) {
  if (!env.RESEND_API_KEY) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {method: 'POST', headers: {Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json'},
      body: JSON.stringify({from: env.MAIL_FROM || 'Hifz Diary <diary@turathkhairalquroon.com>', to: [to], subject: 'Hifz Diary verification code / حفظ ڈائری تصدیقی کوڈ',
        text: 'Your verification code: ' + code + '\nIt is valid for 10 minutes. If you did not ask for it, ignore this message.\n\nآپ کا تصدیقی کوڈ: ' + code + '\nیہ 10 منٹ تک چلے گا۔ اگر آپ نے نہیں مانگا تو اس پیغام کو نظر انداز کریں۔'})});
    return r.ok;
  } catch (e) { return false; }
}

// students the caller may see
async function myStudents(db, u) {
  let q = 'SELECT s.id, s.name, s.teacher, s.parent, t.name AS teacher_name, p.name AS parent_name, p.uname AS parent_uname FROM d_student s LEFT JOIN d_user t ON t.id=s.teacher LEFT JOIN d_user p ON p.id=s.parent WHERE s.inst=?';
  const b = [u.inst];
  if (u.role === 'teacher') { q += ' AND s.teacher=?'; b.push(u.id); }
  if (u.role === 'parent') { q += ' AND s.parent=?'; b.push(u.id); }
  return (await db.prepare(q + ' ORDER BY s.name').bind(...b).all()).results || [];
}
const canSee = async (db, u, sid) => (await myStudents(db, u)).find(s => s.id === sid) || null;

export async function onRequest({request, env}) {
  const db = env.DB;
  if (!db) return json({error: 'not set up'}, 503);
  try {
    await init(db);
    const url = new URL(request.url);
    if (url.searchParams.has('stats')) {
      if (!(await isOwner(request, env))) return json({error: 'forbidden'}, 403);
      const c = async q => (await db.prepare(q).first()).n, now = Date.now();
      return json({institutions: await c('SELECT COUNT(*) n FROM d_inst'), active30: await c('SELECT COUNT(*) n FROM d_inst WHERE last_active>' + (now - WARN_AFTER)), warned: await c('SELECT COUNT(*) n FROM d_inst WHERE warned_at IS NOT NULL'), teachers: await c("SELECT COUNT(*) n FROM d_user WHERE role='teacher'"), parents: await c("SELECT COUNT(*) n FROM d_user WHERE role='parent'"), students: await c('SELECT COUNT(*) n FROM d_student'), entries: await c('SELECT COUNT(*) n FROM d_entry')});
    }
    if (request.method !== 'POST') return json({error: 'method'}, 405);
    let b; try { b = await request.json(); } catch (e) { return json({error: 'bad'}, 400); }
    await sweep(db);
    const a = b.a;

    if (a === 'register') { // step 1: check the details, mail a 6-digit code to the principal's email
      const name = str(b.inst, 80), pname = str(b.name, 60), uname = str(b.uname, 30).toLowerCase(), email = str(b.email, 254).toLowerCase();
      const bad = !name ? 'inst' : !pname ? 'name' : !emailOk(email) ? 'email' : !unameOk(uname) ? 'uname' : !pwOk(b.pw) ? 'pw' : '';
      if (bad) return json({error: bad === 'pw' ? 'weak' : 'invalid', field: bad}, 400); // «field» tells the screen which box to turn red
      const now = Date.now(), old = await db.prepare('SELECT sent_n, sent_ts FROM d_pending WHERE email=?').bind(email).first();
      if (old && now - old.sent_ts < 3600000 && old.sent_n >= 3) return json({error: 'toomany'}, 429);
      if (old && now - old.sent_ts < 45000) return json({error: 'wait'}, 429);
      const code = String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000)), salt = rnd(8), pw = {s: rnd(8)};
      pw.h = await hashPw(b.pw, pw.s);
      if (!(await sendMail(env, email, code))) return json({error: env.RESEND_API_KEY ? 'mailfail' : 'nomail'}, 503);
      const n = old && now - old.sent_ts < 3600000 ? old.sent_n + 1 : 1;
      await db.prepare('INSERT INTO d_pending (email,data,salt,hash,exp,tries,sent_n,sent_ts) VALUES (?,?,?,?,?,0,?,?) ON CONFLICT(email) DO UPDATE SET data=excluded.data, salt=excluded.salt, hash=excluded.hash, exp=excluded.exp, tries=0, sent_n=excluded.sent_n, sent_ts=excluded.sent_ts')
        .bind(email, JSON.stringify({inst: name, name: pname, uname, pws: pw.s, pwh: pw.h}), salt, await hashPw(code, salt), now + 600000, n, now).run();
      return json({ok: 1, step: 'verify'});
    }
    if (a === 'register_verify') { // step 2: the code from the email creates the institution
      const email = str(b.email, 254).toLowerCase(), now = Date.now(), p = await db.prepare('SELECT * FROM d_pending WHERE email=?').bind(email).first();
      if (!p || p.exp < now) return json({error: 'expired'}, 400);
      if (p.tries >= 5) return json({error: 'toomany'}, 429);
      await db.prepare('UPDATE d_pending SET tries=tries+1 WHERE email=?').bind(email).run();
      if (!(await same(await hashPw(str(b.code, 10), p.salt), p.hash))) return json({error: 'badcode'}, 401);
      const d = JSON.parse(p.data);
      let code; for (let i = 0; i < 8; i++) { code = rnd(3).toUpperCase(); if (!(await db.prepare('SELECT 1 FROM d_inst WHERE code=?').bind(code).first())) break; }
      const r = await db.prepare('INSERT INTO d_inst (code,name,created,last_active,email) VALUES (?,?,?,?,?)').bind(code, d.inst, now, now, email).run();
      const iid = r.meta.last_row_id;
      const ur = await db.prepare('INSERT INTO d_user (inst,role,name,uname,salt,pw,created) VALUES (?,?,?,?,?,?,?)').bind(iid, 'principal', d.name, d.uname, d.pws, d.pwh, now).run();
      await db.prepare('DELETE FROM d_pending WHERE email=?').bind(email).run();
      return json({ok: 1, code, token: await newSession(db, ur.meta.last_row_id)});
    }
    if (a === 'login') {
      const code = str(b.code, 10).toUpperCase(), uname = str(b.uname, 30).toLowerCase(), k = code + '|' + uname, now = Date.now();
      const f = await db.prepare('SELECT n, ts FROM d_fail WHERE k=?').bind(k).first();
      if (f && f.n >= 8 && now - f.ts < 15 * 60000) return json({error: 'locked'}, 429);
      const u = await db.prepare('SELECT u.id, u.inst, u.salt, u.pw FROM d_user u JOIN d_inst i ON i.id=u.inst WHERE i.code=? AND u.uname=?').bind(code, uname).first();
      if (!u || !(await same(await hashPw(String(b.pw || ''), u.salt), u.pw))) {
        await db.prepare('INSERT INTO d_fail (k,n,ts) VALUES (?,1,?) ON CONFLICT(k) DO UPDATE SET n=CASE WHEN ?-ts>900000 THEN 1 ELSE n+1 END, ts=?').bind(k, now, now, now).run();
        return json({error: 'login'}, 401);
      }
      await db.prepare('DELETE FROM d_fail WHERE k=?').bind(k).run();
      await touch(db, u.inst);
      return json({ok: 1, token: await newSession(db, u.id)});
    }

    const u = await session(db, request);
    if (!u) return json({error: 'auth'}, 401);
    if (a === 'logout') { await db.prepare('DELETE FROM d_sess WHERE token=?').bind(bearer(request)).run(); return json({ok: 1}); }
    if (u.role !== 'parent') await touch(db, u.inst);

    if (a === 'me') {
      const n = await db.prepare('SELECT COUNT(*) n FROM d_note WHERE user=? AND seen=0').bind(u.id).first();
      return json({user: {id: u.id, role: u.role, name: u.name, uname: u.uname}, inst: {name: u.inst_name, code: u.code}, unseen: n.n, students: await myStudents(db, u),
        teachers: u.role === 'principal' ? (await db.prepare("SELECT id, name, uname FROM d_user WHERE inst=? AND role='teacher' ORDER BY name").bind(u.inst).all()).results : []});
    }
    if (a === 'add_teacher') {
      if (u.role !== 'principal') return json({error: 'forbidden'}, 403);
      const name = str(b.name, 60), un = str(b.uname, 30).toLowerCase();
      if (!name || !unameOk(un) || !pwOk(b.pw)) return json({error: 'invalid', field: !name ? 'name' : !unameOk(un) ? 'uname' : 'pw'}, 400);
      try { await addUser(db, u.inst, 'teacher', name, un, b.pw); } catch (e) { return json({error: 'exists'}, 409); }
      return json({ok: 1});
    }
    if (a === 'add_student') {
      if (u.role === 'parent') return json({error: 'forbidden'}, 403);
      const name = str(b.name, 60); if (!name) return json({error: 'invalid', field: 'name'}, 400);
      let teacher = u.role === 'teacher' ? u.id : int(b.teacher, 1, 1e12), parent = null;
      if (teacher && !(await db.prepare("SELECT 1 FROM d_user WHERE id=? AND inst=? AND role='teacher'").bind(teacher, u.inst).first())) teacher = null;
      const pun = str(b.parent_uname, 30).toLowerCase();
      if (pun) {
        const p = await db.prepare("SELECT id FROM d_user WHERE inst=? AND uname=? AND role='parent'").bind(u.inst, pun).first();
        if (p) parent = p.id;
        else {
          if (!unameOk(pun) || !pwOk(b.parent_pw)) return json({error: 'invalid', field: !unameOk(pun) ? 'parent_uname' : 'parent_pw'}, 400);
          try { parent = await addUser(db, u.inst, 'parent', str(b.parent_name, 60) || name, pun, b.parent_pw); } catch (e) { return json({error: 'exists'}, 409); }
        }
      }
      const r = await db.prepare('INSERT INTO d_student (inst,name,teacher,parent,created) VALUES (?,?,?,?,?)').bind(u.inst, name, teacher, parent, Date.now()).run();
      return json({ok: 1, id: r.meta.last_row_id});
    }
    if (a === 'assign') { // principal: move a student to another teacher
      if (u.role !== 'principal') return json({error: 'forbidden'}, 403);
      const t = int(b.teacher, 1, 1e12), s = int(b.student, 1, 1e12);
      if (!(await db.prepare("SELECT 1 FROM d_user WHERE id=? AND inst=? AND role='teacher'").bind(t, u.inst).first())) return json({error: 'invalid'}, 400);
      await db.prepare('UPDATE d_student SET teacher=? WHERE id=? AND inst=?').bind(t, s, u.inst).run();
      return json({ok: 1});
    }
    if (a === 'remove_student') {
      if (u.role !== 'principal') return json({error: 'forbidden'}, 403);
      const s = int(b.student, 1, 1e12);
      if (!(await db.prepare('SELECT 1 FROM d_student WHERE id=? AND inst=?').bind(s, u.inst).first())) return json({error: 'invalid'}, 400);
      await db.batch([db.prepare('DELETE FROM d_entry WHERE student=?').bind(s), db.prepare('DELETE FROM d_student WHERE id=?').bind(s)]);
      return json({ok: 1});
    }
    if (a === 'save') {
      if (u.role === 'parent') return json({error: 'forbidden'}, 403);
      const sid = int(b.student, 1, 1e12), st = sid && await canSee(db, u, sid);
      if (!st || !dayOk(b.day)) return json({error: 'invalid'}, 400);
      const absent = b.absent ? 1 : 0;
      const e = absent ? [null, null, null, null, null, null] : [int(b.sabaq_lines, 0, 999), int(b.sabaq_q, 1, 3), int(b.sabqi_para, 1, 30), int(b.sabqi_err, 0, 999), int(b.manzil_para, 1, 30), int(b.manzil_err, 0, 999)];
      const had = await db.prepare('SELECT 1 FROM d_entry WHERE student=? AND day=?').bind(sid, b.day).first();
      await db.prepare('INSERT INTO d_entry (student,day,absent,sabaq_lines,sabaq_q,sabqi_para,sabqi_err,manzil_para,manzil_err,note,by_user,updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(student,day) DO UPDATE SET absent=excluded.absent, sabaq_lines=excluded.sabaq_lines, sabaq_q=excluded.sabaq_q, sabqi_para=excluded.sabqi_para, sabqi_err=excluded.sabqi_err, manzil_para=excluded.manzil_para, manzil_err=excluded.manzil_err, note=excluded.note, by_user=excluded.by_user, updated=excluded.updated')
        .bind(sid, b.day, absent, ...e, str(b.note, 200), u.id, Date.now()).run();
      const payload = JSON.stringify({s: st.name, d: b.day, by: u.name, edit: had ? 1 : 0});
      if (u.role === 'teacher') for (const p of await principals(db, u.inst)) await notify(db, u.inst, p, 'entry', payload);
      return json({ok: 1});
    }
    if (a === 'entries') {
      const sid = int(b.student, 1, 1e12);
      if (!sid || !(await canSee(db, u, sid))) return json({error: 'invalid'}, 400);
      const from = dayOk(b.from) ? b.from : '0000-00-00', to = dayOk(b.to) ? b.to : '9999-99-99';
      return json({entries: (await db.prepare('SELECT day, absent, sabaq_lines, sabaq_q, sabqi_para, sabqi_err, manzil_para, manzil_err, note FROM d_entry WHERE student=? AND day>=? AND day<=? ORDER BY day').bind(sid, from, to).all()).results || []});
    }
    if (a === 'day') { // one day for all of the caller's students (teacher's quick sheet)
      if (!dayOk(b.day)) return json({error: 'invalid'}, 400);
      const ids = (await myStudents(db, u)).map(s => s.id), out = {};
      for (const id of ids) { const e = await db.prepare('SELECT absent, sabaq_lines, sabaq_q, sabqi_para, sabqi_err, manzil_para, manzil_err, note FROM d_entry WHERE student=? AND day=?').bind(id, b.day).first(); if (e) out[id] = e; }
      return json({day: out});
    }
    if (a === 'notes') {
      const rows = (await db.prepare('SELECT id, kind, text, ts, seen FROM d_note WHERE user=? ORDER BY id DESC LIMIT 60').bind(u.id).all()).results || [];
      await db.prepare('UPDATE d_note SET seen=1 WHERE user=? AND seen=0').bind(u.id).run();
      return json({notes: rows});
    }
    if (a === 'passwd') {
      if (!pwOk(b.pw)) return json({error: 'invalid'}, 400);
      let target = u.id;
      if (b.user && u.role !== 'parent') { // principal: any user of the institution; teacher: his students' parents
        const t = int(b.user, 1, 1e12), r = await db.prepare('SELECT id, role FROM d_user WHERE id=? AND inst=?').bind(t, u.inst).first();
        if (!r || (u.role === 'teacher' && (r.role !== 'parent' || !(await db.prepare('SELECT 1 FROM d_student WHERE parent=? AND teacher=?').bind(t, u.id).first())))) return json({error: 'forbidden'}, 403);
        target = t;
      }
      const salt = rnd(8);
      await db.batch([db.prepare('UPDATE d_user SET salt=?, pw=? WHERE id=?').bind(salt, await hashPw(b.pw, salt), target), db.prepare('DELETE FROM d_sess WHERE user=? AND token<>?').bind(target, bearer(request))]);
      return json({ok: 1});
    }
    if (a === 'delete_inst') { // principal deletes the whole institution (asked by typing its code)
      if (u.role !== 'principal' || str(b.code, 10).toUpperCase() !== u.code) return json({error: 'forbidden'}, 403);
      await wipe(db, u.inst); return json({ok: 1});
    }
    return json({error: 'unknown'}, 400);
  } catch (e) {
    return json({error: 'server'}, 500);
  }
}
