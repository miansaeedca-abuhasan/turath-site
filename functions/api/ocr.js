// Reads the text of a picture (a screenshot of a WhatsApp/Facebook post) with Google Gemini, for the «تحقیق و تصدیق» page.
// The key stays here as a secret (GEMINI_API_KEY); the browser only calls POST /api/ocr {image: base64, mime}. Optional variables: GEMINI_MODEL, OCR_DAILY.
const MODEL = 'gemini-flash-latest';
const DAILY = 300;                                   // pictures per day for the whole site (override with OCR_DAILY)
const PER_USER = 5;                                  // pictures per person (per network address) per day (override with OCR_USER)
const PROMPT = 'Extract ALL the text visible in this image exactly as written, in its original language (Arabic, Urdu, English …). Keep Arabic diacritics (tashkeel) and the line breaks. Do not translate, explain, correct or add anything. If there is no readable text, answer with an empty string.';
const err = (s, m) => new Response(JSON.stringify({error: m}), {status: s, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});

export async function onRequest(ctx) {
  try { return await handle(ctx); } catch (e) { return new Response(JSON.stringify({error: 'exception', detail: String(e && e.message || e).slice(0, 160)}), {status: 500, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}}); }
}
async function handle({request, env}) {
  const q = new URL(request.url).searchParams;
  if (request.method === 'GET' && q.has('ping')) {      // diagnosis: open /api/ocr?ping=1 (function alive?) and /api/ocr?ping=2 (does the Gemini key and model answer?)
    const o = {ok: true, key: !!env.GEMINI_API_KEY, db: !!env.DB, model: env.GEMINI_MODEL || MODEL};
    if (q.get('ping') === '2' && env.GEMINI_API_KEY) {
      try {
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + o.model + ':generateContent', {method: 'POST', headers: {'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY}, body: JSON.stringify({contents: [{parts: [{text: 'Say OK'}]}]})});
        o.gemini = r.status; if (!r.ok) o.detail = (await r.text()).slice(0, 300);
      } catch (e) { o.gemini = 'fetch failed: ' + String(e && e.message || e).slice(0, 120); }
    }
    return new Response(JSON.stringify(o), {headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
  }
  if (request.method !== 'POST') return err(405, 'method');
  if (!env.GEMINI_API_KEY) return err(503, 'not set up');
  const u = new URL(request.url), origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== u.host) return err(403, 'origin');
  let b;
  try { b = await request.json(); } catch (e) { return err(400, 'body'); }
  const mime = String(b.mime || 'image/jpeg'), img = String(b.image || '');
  if (!/^image\/(jpeg|png|webp)$/.test(mime) || img.length < 100 || img.length > 4_500_000) return err(400, 'image');
  const day0 = new Date().toISOString().slice(0, 10), ipRaw = request.headers.get('CF-Connecting-IP') || 'x', lim = +env.OCR_USER || PER_USER;
  const ip = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(day0 + '|' + ipRaw)))].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
  let used = 0;
  const refund = async () => { try { if (env.DB) await env.DB.prepare('UPDATE ocr_ip SET n = MAX(0, n - 1) WHERE k = ?').bind(ip).run(); else await caches.default.put(new Request('https://ocr.cache.local/' + ip), new Response(String(Math.max(0, used - 1)), {headers: {'Cache-Control': 'max-age=86400'}})); } catch (e) {} };
  if (env.DB) {
    try {
      await env.DB.prepare('CREATE TABLE IF NOT EXISTS ocr_ip (k TEXT PRIMARY KEY, day TEXT NOT NULL, n INTEGER NOT NULL)').run();
      await env.DB.prepare('DELETE FROM ocr_ip WHERE day < ?').bind(day0).run();
      const r = await env.DB.prepare('SELECT n FROM ocr_ip WHERE k = ?').bind(ip).first();
      used = r ? r.n : 0;
      if (used >= lim) return new Response(JSON.stringify({error: 'user limit', left: 0}), {status: 429, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
      await env.DB.prepare('INSERT INTO ocr_ip (k, day, n) VALUES (?, ?, 1) ON CONFLICT(k) DO UPDATE SET n = n + 1').bind(ip, day0).run();
      used++;
    } catch (e) {}
  } else {
    try {
      const ck = new Request('https://ocr.cache.local/' + ip), h = await caches.default.match(ck); used = h ? +(await h.text()) : 0;
      if (used >= lim) return new Response(JSON.stringify({error: 'user limit', left: 0}), {status: 429, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
      used++; await caches.default.put(ck, new Response(String(used), {headers: {'Cache-Control': 'max-age=86400'}}));
    } catch (e) {}
  }
  if (env.DB) {
    try {
      const day = new Date().toISOString().slice(0, 10), cap = +env.OCR_DAILY || DAILY;
      await env.DB.prepare('CREATE TABLE IF NOT EXISTS ocr_use (day TEXT PRIMARY KEY, n INTEGER NOT NULL)').run();
      const r = await env.DB.prepare('SELECT n FROM ocr_use WHERE day = ?').bind(day).first();
      if (r && r.n >= cap) return err(429, 'daily limit');
      await env.DB.prepare('INSERT INTO ocr_use (day, n) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET n = n + 1').bind(day).run();
    } catch (e) {}
  }
  let r;
  try {
    r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + (env.GEMINI_MODEL || MODEL) + ':generateContent', {
      method: 'POST', headers: {'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY},
      body: JSON.stringify({contents: [{parts: [{text: PROMPT}, {inline_data: {mime_type: mime, data: img}}]}], generationConfig: {temperature: 0}})
    });
  } catch (e) { await refund(); return new Response(JSON.stringify({error: 'upstream fetch', detail: String(e && e.message || e).slice(0, 120)}), {status: 502, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}}); }
  if (r.status === 429) { await refund(); return err(429, 'busy'); }
  if (!r.ok) { await refund(); let d = ''; try { d = ((await r.json()).error || {}).message || ''; } catch (e) {} return new Response(JSON.stringify({error: 'upstream ' + r.status, detail: d.slice(0, 160)}), {status: 502, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}}); }
  const j = await r.json(), t = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || '').join('').trim();
  return new Response(JSON.stringify({text: t, left: Math.max(0, lim - used)}), {headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
}
