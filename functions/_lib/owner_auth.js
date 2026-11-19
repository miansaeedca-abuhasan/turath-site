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
// OWNER_USERS value per e-mail: either "password" (= founder) or {"password": "...", "role": "founder" | "editor"}
const pwOf = v => typeof v === 'string' ? v : (v && typeof v === 'object' && typeof v.password === 'string' ? v.password : '');
const roleOfV = v => v && typeof v === 'object' && v.role === 'editor' ? 'editor' : 'founder';
const parse = env => { try { const u = JSON.parse(env.OWNER_USERS || '{}'); return u && typeof u === 'object' ? u : {}; } catch (e) { return {}; } };
export const users = env => { const u = parse(env), o = {}; for (const k in u) { const p = pwOf(u[k]); if (p) o[k.trim().toLowerCase()] = p; } return o; };
export const roleOf = (env, mail) => { const u = parse(env); for (const k in u) if (k.trim().toLowerCase() === mail && pwOf(u[k])) return roleOfV(u[k]); return null; };
const toHex = s => hex(enc.encode(s)), fromHex = h => { try { return new TextDecoder().decode(new Uint8Array((h.match(/../g) || []).map(x => parseInt(x, 16)))); } catch (e) { return ''; } };
// session cookie: id.exp.role.userhex.sig  (role f = founder, e = editor); the old 3-part form (id.exp.sig) counts as founder
export async function makeToken(env, role, mail, exp) {
  const id = hex(crypto.getRandomValues(new Uint8Array(12))), body = id + '.' + exp + '.' + (role === 'editor' ? 'e' : 'f') + '.' + toHex(mail);
  return body + '.' + await hmac(env.OWNER_USERS + '|tk', body);
}
export async function session(req, env) {
  try {
    if (!env.OWNER_USERS || !Object.keys(users(env)).length) return null;
    const m = (req.headers.get('Cookie') || '').match(/(?:^|;\s*)tk_owner=([^;]+)/), p = m ? m[1].split('.') : [];
    if (p.length === 3) { if (!(+p[1] > Date.now())) return null; return (await same(await hmac(env.OWNER_USERS + '|tk', p[0] + '.' + p[1]), p[2])) ? {role: 'founder', user: ''} : null; }
    if (p.length !== 5 || !(+p[1] > Date.now()) || (p[2] !== 'e' && p[2] !== 'f')) return null;
    if (!(await same(await hmac(env.OWNER_USERS + '|tk', p.slice(0, 4).join('.')), p[4]))) return null;
    const user = fromHex(p[3]);
    // the role must still match the current OWNER_USERS (an editor made founder, or removed, takes effect at once)
    const now = roleOf(env, user); if (!now || (now === 'editor') !== (p[2] === 'e')) return null;
    return {role: now, user};
  } catch (e) { return null; }
}
// true only for a founder session (editors never pass)
export async function isOwner(req, env) { const s = await session(req, env); return !!s && s.role === 'founder'; }
