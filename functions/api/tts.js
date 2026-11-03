import {isOwner} from '../_lib/owner_auth.js';
// Urdu voice (Uplift AI) for the «سنیں» player. The API key stays here as a secret (UPLIFT_API_KEY); the browser only calls /api/tts.
// The same text is paid for once (saved in the R2 bucket bound as AUDIO when there is one, otherwise in the Cloudflare cache); a daily limit of characters protects the credits (D1 table, optional).
const VOICE = 'seerah-educator';       // override with the UPLIFT_VOICE variable
const FORMAT = 'MP3_22050_64';
const DAILY = 120000;                  // characters per day (override with TTS_DAILY_CHARS)
const err = (s, m) => new Response(JSON.stringify({error: m}), {status: s, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});

export async function onRequest({request, env, waitUntil}) {
  if (request.method !== 'POST') return err(405, 'method');
  if (!env.UPLIFT_API_KEY) return err(503, 'not set up');
  const u = new URL(request.url), origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== u.host) return err(403, 'origin');
  let text = '';
  try { text = String((await request.json()).text || ''); } catch (e) { return err(400, 'body'); }
  text = text.replace(/\s+/g, ' ').trim();
  if (text.length < 2 || text.length > 700) return err(400, 'length');
  const voice = env.UPLIFT_VOICE || VOICE;
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(voice + '|' + FORMAT + '|' + text)))].map(b => b.toString(16).padStart(2, '0')).join('');
  const R2 = env.AUDIO, rk = 'tts/' + hash.slice(0, 2) + '/' + hash + '.mp3';
  if (R2) { try { const o = await R2.get(rk); if (o) return new Response(o.body, {headers: {'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=31536000'}}); } catch (e) {} }
  const cache = caches.default, key = new Request('https://tts.cache.local/' + hash);
  const hit = await cache.match(key);
  if (hit) return hit;
  if (env.DB) {
    try {
      const day = new Date().toISOString().slice(0, 10), cap = (await isOwner(request, env)) ? 1e12 : (+env.TTS_DAILY_CHARS || DAILY);
      await env.DB.prepare('CREATE TABLE IF NOT EXISTS tts_use (day TEXT PRIMARY KEY, n INTEGER NOT NULL)').run();
      const r = await env.DB.prepare('SELECT n FROM tts_use WHERE day = ?').bind(day).first();
      if (r && r.n + text.length > cap) return err(429, 'daily limit');
      await env.DB.prepare('INSERT INTO tts_use (day, n) VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET n = n + ?').bind(day, text.length, text.length).run();
    } catch (e) {}
  }
  let r;
  try {
    r = await fetch('https://api.upliftai.org/v1/synthesis/text-to-speech', {method: 'POST', headers: {Authorization: 'Bearer ' + env.UPLIFT_API_KEY, 'Content-Type': 'application/json'}, body: JSON.stringify({voiceId: voice, text, outputFormat: FORMAT})});
  } catch (e) { return err(502, 'upstream'); }
  if (!r.ok) return err(502, 'upstream ' + r.status);
  const buf = await r.arrayBuffer();
  const out = new Response(buf, {headers: {'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=31536000'}});
  waitUntil && waitUntil(cache.put(key, out.clone()));
  if (R2) { try { await R2.put(rk, buf, {httpMetadata: {contentType: 'audio/mpeg'}, customMetadata: {chars: String(text.length)}}); } catch (e) {} }
  return out;
}
