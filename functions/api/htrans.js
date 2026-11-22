import {isOwner} from '../_lib/owner_auth.js';
// Urdu translation of an Arabic hadith text with Google Gemini, for the hadith books that have no Urdu translation («ترجمہ جیمنائی»).
// The key stays here as a secret (GEMINI_API_KEY, the same one the «تحقیق و تصدیق» page uses). The browser calls POST /api/htrans {ar: "<Arabic text>"}.
// A saved translation (D1 table htrans, keyed by the hash of the Arabic text itself) is returned to everybody without calling Gemini again.
// Limits (only for NEW translations): HTRANS_USER per person per day (default 40), HTRANS_DAILY for the whole site (default 3000); the owner is not limited.
// Daily background job: header X-Cron-Key = secret HTRANS_CRON (no limits for it); POST {op:"cursor",lang,set?} keeps its place in the list.
const MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
const TIMEOUT = 50000;
const LN = {ur: 'Urdu', en: 'English', bn: 'Bengali', hi: 'Hindi', gu: 'Gujarati', fr: 'French', ne: 'Nepali'};
const SCRIPT = {ur: /[؀-ۿ]/g, bn: /[ঀ-৿]/g, hi: /[ऀ-ॿ]/g, ne: /[ऀ-ॿ]/g, gu: /[઀-૿]/g, en: /[A-Za-z]/g, fr: /[A-Za-zÀ-ÿ]/g};
const SALAM = {ur: ' صلی اللہ علیہ وسلم', en: ' (peace be upon him)', fr: ' (paix et bénédictions sur lui)', bn: ' সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম', hi: ' सल्लल्लाहु अलैहि वसल्लम', ne: ' सल्लल्लाहु अलैहि वसल्लम', gu: ' સલ્લલ્લાહુ અલયહિ વસલ્લમ'};
const prompt = l => 'You translate Arabic hadith and athar texts into ' + LN[l] + ' for an Islamic library website. Translate the WHOLE text below (the chain of narrators too) faithfully into simple, fluent, idiomatic ' + LN[l] + ': add nothing, leave nothing out, no explanation, no commentary, no headings. Rules: (1) Write the honorifics for the Prophet, the Companions and the scholars in full words of ' + LN[l] + ', never with symbols such as ﷺ ؓ ؒ ؑ and never abbreviations. ' +
  (l === 'ur' ? '(2) Write «رضی اللہ عنہ» / «رضی اللہ عنہا» / «رضی اللہ عنہما» / «رضی اللہ عنہم», «صلی اللہ علیہ وسلم», «علیہ السلام», «رحمہ اللہ»; say «سیدنا» / «سیدہ» for Companions, not «حضرت»; quoted speech goes in Urdu quotation marks ’’ ‘‘; write in Urdu letters only (ک ی ہ ے), no English or Latin letters. ' : '(2) Do not use Arabic-script words other than inside a Quran verse. ') +
  '(3) A Quran verse inside the text: write the verse in Arabic with its harakat between ﴿ ﴾ and then its translation. (4) No markdown, no numbering that is not in the source. (5) Keep the paragraphs of the source. Answer with the translation only.\n\nArabic text:\n';
const J = {'Content-Type': 'application/json', 'Cache-Control': 'no-store'};
const err = (s, m, x) => new Response(JSON.stringify(Object.assign({error: m}, x || {})), {status: s, headers: J});
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const sha = async s => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
const norm = s => String(s || '').replace(/[ً-ْٰـ]/g, '').replace(/\s+/g, ' ').trim();   // key = the letters of the text (harakat do not change the key)

async function gem(env, model, text, ms, lang) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';
  for (const think of [true, false]) {
    const gc = think ? {temperature: 0.2, thinkingConfig: {thinkingBudget: 0}} : {temperature: 0.2};
    const r = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY}, body: JSON.stringify({contents: [{parts: [{text: prompt(lang) + text}]}], generationConfig: gc}), signal: AbortSignal.timeout(ms || TIMEOUT)});
    if (r.status !== 400 || !think) return r;
  }
}
// tidy the answer: symbols the owner does not want, markdown marks, stray Latin letters
export function clean(t, l) {
  return String(t || '').replace(/\r/g, '').replace(/^```[a-z]*\n?|```$/g, '').replace(/\*\*|__|^#+\s*/gm, '')
    .replace(/ﷺ/g, SALAM[l || 'ur']).replace(/\s*[ؓؒؑ]/g, '').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}
export function usable(ar, ur, l) {
  l = l || 'ur';
  const a = (ur.match(SCRIPT[l]) || []).length;
  if (a < (ar.length < 40 ? 3 : 8) || ur.length > ar.length * 8 + 400) return false;
  if (l === 'ur') return (ur.match(/[A-Za-z]/g) || []).length <= Math.max(6, a * 0.03);     // an English answer / an apology is not a translation
  const arl = (ur.match(/[؀-ۿ]/g) || []).length;           // an untouched Arabic answer is not a translation
  return arl <= a * 0.3;
}
export async function onRequest(ctx) {
  try { return await handle(ctx); } catch (e) { return err(500, 'exception', {detail: String(e && e.message || e).slice(0, 160)}); }
}
async function handle({request, env}) {
  const q = new URL(request.url).searchParams;
  if (request.method === 'GET') {      // diagnosis: /api/htrans?ping=1 (function alive, key and database present?)
    return new Response(JSON.stringify({ok: true, key: !!env.GEMINI_API_KEY, db: !!env.DB, models: MODELS}), {headers: J});
  }
  if (request.method !== 'POST') return err(405, 'method');
  const u = new URL(request.url), origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== u.host) return err(403, 'origin');
  let b; try { b = await request.json(); } catch (e) { return err(400, 'body'); }
  const lang = LN[b.lang] ? b.lang : 'ur';
  // the daily background job (GitHub Actions, tools/htrans_cron.js) shows the secret HTRANS_CRON: no per-person limit, and it keeps its place (cursor) in the list
  const cron = !!env.HTRANS_CRON && request.headers.get('X-Cron-Key') === env.HTRANS_CRON;
  if (b.op === 'cursor') {
    if (!cron || !env.DB) return err(403, 'cron');
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS htrans_cur (lang TEXT PRIMARY KEY, pos INTEGER NOT NULL)').run();
    if (Number.isInteger(b.set) && b.set >= 0) await env.DB.prepare('INSERT OR REPLACE INTO htrans_cur (lang, pos) VALUES (?, ?)').bind(lang, b.set).run();
    const r = await env.DB.prepare('SELECT pos FROM htrans_cur WHERE lang = ?').bind(lang).first();
    return new Response(JSON.stringify({pos: r ? r.pos : 0}), {headers: J});
  }
  const ar = String(b.ar || '').replace(/\r/g, '').trim();
  const letters = (ar.match(/[ء-يٱ-ۓ]/g) || []).length;
  if (ar.length < 4 || ar.length > 9000 || letters < ar.replace(/\s/g, '').length * 0.5) return err(400, 'text');
  if (!env.DB) return err(503, 'no database');
  const key = await sha((lang === 'ur' ? '' : lang + '|') + norm(ar));   // Urdu keeps the old key, so saved Urdu translations stay valid
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS htrans (h TEXT PRIMARY KEY, ur TEXT NOT NULL, model TEXT, ts INTEGER)').run();
  const hit = await env.DB.prepare('SELECT ur FROM htrans WHERE h = ?').bind(key).first();
  if (hit) return new Response(JSON.stringify({ur: hit.ur, saved: true}), {headers: J});
  if (!env.GEMINI_API_KEY) return err(503, 'not set up');
  // limits for new translations
  const owner = cron || await isOwner(request, env), day = new Date().toISOString().slice(0, 10);
  if (!owner) {
    const ipRaw = request.headers.get('CF-Connecting-IP') || 'x', ip = (await sha(day + '|' + ipRaw)).slice(0, 16);
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS htrans_ip (k TEXT PRIMARY KEY, day TEXT NOT NULL, n INTEGER NOT NULL)').run();
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS htrans_use (day TEXT PRIMARY KEY, n INTEGER NOT NULL)').run();
    await env.DB.prepare('DELETE FROM htrans_ip WHERE day < ?').bind(day).run();
    const lim = +env.HTRANS_USER || 40, cap = +env.HTRANS_DAILY || 3000;
    const r = await env.DB.prepare('SELECT n FROM htrans_ip WHERE k = ?').bind(ip).first();
    if (r && r.n >= lim) return err(429, 'user limit');
    const s = await env.DB.prepare('SELECT n FROM htrans_use WHERE day = ?').bind(day).first();
    if (s && s.n >= cap) return err(429, 'daily limit');
    await env.DB.prepare('INSERT INTO htrans_ip (k, day, n) VALUES (?, ?, 1) ON CONFLICT(k) DO UPDATE SET n = n + 1').bind(ip, day).run();
    await env.DB.prepare('INSERT INTO htrans_use (day, n) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET n = n + 1').bind(day).run();
  }
  let ur = '', model = '', last = '';
  const t0 = Date.now();
  for (const m of [env.GEMINI_MODEL_TR || MODELS[0], MODELS[1]]) {
    const left = 85000 - (Date.now() - t0); if (left < 8000) break;
    try {
      const r = await gem(env, m, ar, Math.min(TIMEOUT, left), lang);
      if (!r.ok) { last = 'status ' + r.status; continue; }
      const j = await r.json();
      const t = clean(((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || '').join(''), lang);
      if (usable(ar, t, lang)) { ur = t; model = m; break; }
      last = 'unusable answer';
    } catch (e) { last = String(e && e.message || e).slice(0, 60); }
  }
  if (!ur) return err(502, 'translation failed', {detail: last});
  await env.DB.prepare('INSERT OR REPLACE INTO htrans (h, ur, model, ts) VALUES (?, ?, ?, ?)').bind(key, ur, model, Date.now()).run();
  return new Response(JSON.stringify({ur, saved: false}), {headers: J});
}
