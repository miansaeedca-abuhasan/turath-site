// Correction reports from readers (a hadith / chapter with a mistake). One POST per report; stored in D1 table `reports`
// and read only by the founder in the owner panel. Kept: book key, number, short place text, the reader's note, language, time.
// No IP address, name or contact detail is stored. Same-origin only, short limits, a hidden field catches robots, and a daily cap.
const json = (o, s = 200) => new Response(JSON.stringify(o), {status: s, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
const clip = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, n);

export async function onRequest({request, env}) {
  const db = env.DB;
  if (!db) return json({error: 'not set up'}, 503);
  if (request.method !== 'POST') return json({error: 'method'}, 405);
  const url = new URL(request.url), o = request.headers.get('Origin');
  if (o && new URL(o).host !== url.host) return json({error: 'origin'}, 403);
  try {
    const b = await request.json().catch(() => ({}));
    if (b.hp) return json({ok: true});                       // robot: pretend success
    const note = clip(b.note, 1500);
    if (note.length < 3) return json({error: 'short'}, 400);
    await db.prepare('CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT, k TEXT, n TEXT, place TEXT, note TEXT NOT NULL, lang TEXT, t INTEGER NOT NULL, done INTEGER NOT NULL DEFAULT 0)').run();
    const now = Date.now();
    const c = await db.prepare('SELECT COUNT(*) AS n FROM reports WHERE t > ?').bind(now - 86400000).first();
    if (c && c.n >= 300) return json({error: 'busy'}, 429);
    await db.prepare('INSERT INTO reports (k, n, place, note, lang, t) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(clip(b.k, 60), clip(b.n, 30), clip(b.place, 200), note, clip(b.lang, 5), now).run();
    return json({ok: true});
  } catch (e) {
    return json({error: 'server'}, 500);
  }
}
