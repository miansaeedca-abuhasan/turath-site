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
export const users = env => { try { const u = JSON.parse(env.OWNER_USERS || '{}'); const o = {}; for (const k in u) if (typeof u[k] === 'string' && u[k]) o[k.trim().toLowerCase()] = u[k]; return o; } catch (e) { return {}; } };
export async function isOwner(req, env) {
  try {
    if (!env.OWNER_USERS || !Object.keys(users(env)).length) return false;
    const m = (req.headers.get('Cookie') || '').match(/(?:^|;\s*)tk_owner=([^;]+)/), p = m ? m[1].split('.') : [];
    if (p.length !== 3 || !(+p[1] > Date.now())) return false;
    return same(await hmac(env.OWNER_USERS + '|tk', p[0] + '.' + p[1]), p[2]);
  } catch (e) { return false; }
}
