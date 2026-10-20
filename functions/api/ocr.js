// Reads the text of a picture (a screenshot of a WhatsApp/Facebook post) with Google Gemini, for the «تحقیق و تصدیق» page.
// The key stays here as a secret (GEMINI_API_KEY); the browser only calls POST /api/ocr {image: base64, mime}. Optional variables: GEMINI_MODEL, OCR_DAILY.
const MODEL = 'gemini-flash-latest';
const DAILY = 300;                                   // pictures per day for the whole site (override with OCR_DAILY)
const PROMPT = 'Extract ALL the text visible in this image exactly as written, in its original language (Arabic, Urdu, English …). Keep Arabic diacritics (tashkeel) and the line breaks. Do not translate, explain, correct or add anything. If there is no readable text, answer with an empty string.';
const err = (s, m) => new Response(JSON.stringify({error: m}), {status: s, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});

export async function onRequest({request, env}) {
  if (request.method !== 'POST') return err(405, 'method');
  if (!env.GEMINI_API_KEY) return err(503, 'not set up');
  const u = new URL(request.url), origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== u.host) return err(403, 'origin');
  let b;
  try { b = await request.json(); } catch (e) { return err(400, 'body'); }
  const mime = String(b.mime || 'image/jpeg'), img = String(b.image || '');
  if (!/^image\/(jpeg|png|webp)$/.test(mime) || img.length < 100 || img.length > 4_500_000) return err(400, 'image');
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
  } catch (e) { return err(502, 'upstream'); }
  if (r.status === 429) return err(429, 'busy');
  if (!r.ok) return err(502, 'upstream ' + r.status);
  const j = await r.json(), t = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || '').join('').trim();
  return new Response(JSON.stringify({text: t}), {headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
}
