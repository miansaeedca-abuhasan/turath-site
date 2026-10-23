// Visitor counter for turathkhairalquroon.com (Cloudflare Pages Function + D1 database bound as DB).
// Kept: the total of visits and, per country, one number (the two-letter country code Cloudflare reports for the request).
// The app sends one POST per device per day; no IP address, cookie or any personal detail is stored.
const json = (o, s = 200) => new Response(JSON.stringify(o), {status: s, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});

export async function onRequest({request, env}) {
  const db = env.DB;
  if (!db) return json({error: 'counter not set up'}, 503);
  if (request.method !== 'GET' && request.method !== 'POST') return json({error: 'method'}, 405);
  try {
    if (request.method === 'POST') {
      await db.prepare('CREATE TABLE IF NOT EXISTS counter (k TEXT PRIMARY KEY, n INTEGER NOT NULL)').run();
      await db.prepare("INSERT INTO counter (k, n) VALUES ('visits', 1) ON CONFLICT(k) DO UPDATE SET n = n + 1").run();
      let cc = String((request.cf && request.cf.country) || '').toUpperCase();
      if (!/^[A-Z]{2}$/.test(cc)) cc = 'XX';
      await db.prepare("INSERT INTO counter (k, n) VALUES (?, 1) ON CONFLICT(k) DO UPDATE SET n = n + 1").bind('c:' + cc).run();
    }
    const r = await db.prepare("SELECT n FROM counter WHERE k = 'visits'").first();
    let c = {};
    try {
      const rs = await db.prepare("SELECT k, n FROM counter WHERE k LIKE 'c:%' ORDER BY n DESC LIMIT 80").all();
      for (const x of (rs.results || [])) c[x.k.slice(2)] = x.n;
    } catch (e) {}
    return json({n: r ? r.n : 0, c});
  } catch (e) {
    return json({n: 0});
  }
}
