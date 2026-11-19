// Shared owner check for the Pages Functions: true when the request carries a valid owner session cookie (see api/owner.js).
const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
export async function hmac(key, msg) {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', k, enc.encode(msg)));
}
// constant-time comparison (both sides hashed first, so lengths do not leak)
export async function same(a, b) {
  const x = await hmac('cmp', String(a)), y = await hmac('cmp', String(b));
  let d = 0; for (let i = 0; i < x.length; i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
}
// OWNER_USERS = founders, EDITOR_USERS = everyone else. Each is plain text like {"a@x.com":"password","b@x.com":"password"}
// (several {...},{...} blocks separated by commas, and a trailing comma, are accepted too).
const parse = txt => {
  const t = String(txt || '').trim(); if (!t) return {};
  let v; try { v = JSON.parse(t); } catch (e) { try { v = JSON.parse('[' + t.replace(/,\s*$/, '') + ']'); } catch (e2) { return {}; } }
  const o = {}; for (const b of Array.isArray(v) ? v : [v]) if (b && typeof b === 'object') for (const k in b) if (typeof b[k] === 'string' && b[k]) o[k.trim().toLowerCase()] = b[k];
  return o;
};
const FO = env => parse(env.OWNER_USERS), ED = env => parse(env.EDITOR_USERS);
export const users = env => Object.assign({}, ED(env), FO(env));
export const roleOf = (env, mail) => Object.prototype.hasOwnProperty.call(FO(env), mail) ? 'founder' : Object.prototype.hasOwnProperty.call(ED(env), mail) ? 'editor' : null;
const toHex = s => hex(enc.encode(s)), fromHex = h => { try { return new TextDecoder().decode(new Uint8Array((h.match(/../g) || []).map(x => parseInt(x, 16)))); } catch (e) { return ''; } };
// Session cookie: id.exp.userhex.sig, signed with that person's OWN password. So it lasts until he signs out (the longest a browser keeps a cookie, about 400 days),
// ends at once when his e-mail is removed or his password changes, and adding/removing other people never signs anyone else out.
const LIFE = 400 * 86400000;
export const SESSION_SECONDS = LIFE / 1000;
export const sessionExpiry = () => Date.now() + LIFE;
const secretOf = (env, mail) => { const F = FO(env), E = ED(env); return Object.prototype.hasOwnProperty.call(F, mail) ? F[mail] : Object.prototype.hasOwnProperty.call(E, mail) ? E[mail] : null; };
export async function makeToken(env, mail, exp) {
  const pw = secretOf(env, mail); if (pw === null) return '';
  const body = hex(crypto.getRandomValues(new Uint8Array(12))) + '.' + exp + '.' + toHex(mail);
  return body + '.' + await hmac(pw + '|tk', body);
}
export async function session(req, env) {
  try {
    const m = (req.headers.get('Cookie') || '').match(/(?:^|;\s*)tk_owner=([^;]+)/), p = m ? m[1].split('.') : [];
    if (p.length !== 4 || !(+p[1] > Date.now())) return null;
    const user = fromHex(p[2]), pw = secretOf(env, user), role = roleOf(env, user);
    if (pw === null || !role) return null;   // removed accounts are out immediately
    if (!(await same(await hmac(pw + '|tk', p.slice(0, 3).join('.')), p[3]))) return null;
    return {role, user};
  } catch (e) { return null; }
}
// true only for a founder session (editors never pass)
export async function isOwner(req, env) { const s = await session(req, env); return !!s && s.role === 'founder'; }
