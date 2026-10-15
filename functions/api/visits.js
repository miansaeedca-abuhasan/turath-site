// Visitor counter for turathkhairalquroon.com (Cloudflare Pages Function + D1 database bound as DB).
// Only one number is kept: the total of visits. The app sends one POST per device per day;
// no IP address, cookie or any personal detail is stored.
const json = (o, s = 200) => new Response(JSON.stringify(o), {status: s, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});

export async function onRequest({request, env}) {
  const db = env.DB;
  if (!db) return json({error: 'counter not set up'}, 503);
  if (request.method !== 'GET' && request.method !== 'POST') return json({error: 'method'}, 405);
  try {
    if (request.method === 'POST') {
      await db.prepare('CREATE TABLE IF NOT EXISTS counter (k TEXT PRIMARY KEY, n INTEGER NOT NULL)').run();
      await db.prepare("INSERT INTO counter (k, n) VALUES ('visits', 1) ON CONFLICT(k) DO UPDATE SET n = n + 1").run();
    }
    const r = await db.prepare("SELECT n FROM counter WHERE k = 'visits'").first();
    return json({n: r ? r.n : 0});
  } catch (e) {
    return json({n: 0});
  }
}
