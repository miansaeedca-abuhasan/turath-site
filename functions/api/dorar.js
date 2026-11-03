// «حدیث تلاش» — results with the muhaddith's grade from the Hadith Encyclopedia of Dorar (dorar.net/article/389:
// a JSON service for sites to show its search results). The browser cannot ask dorar.net itself (other website), so
// the site asks here: /api/dorar?q=<words>&page=<n>  ->  {html} (the result list as dorar.net sends it; the page reads
// only its text). Answers are kept for a day.
export async function onRequest({request}) {
  const u = new URL(request.url), q = (u.searchParams.get('q') || '').trim().slice(0, 200);
  const page = Math.max(1, Math.min(50, parseInt(u.searchParams.get('page') || '1', 10) || 1));
  const out = (o, s = 200) => new Response(JSON.stringify(o), {status: s, headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': s === 200 ? 'public, max-age=86400' : 'no-store'}});
  if (!q) return out({error: 'q'}, 400);
  const url = 'https://dorar.net/dorar_api.json?skey=' + encodeURIComponent(q) + (page > 1 ? '&page=' + page : '');
  try {
    const r = await fetch(url, {headers: {'Accept': 'application/json', 'User-Agent': 'TurathKhairAlQuroon/1.0 (+https://turathkhairalquroon.com)'}, cf: {cacheTtl: 86400, cacheEverything: true}});
    if (!r.ok) return out({error: 'dorar ' + r.status}, 502);
    const t = await r.text();
    let d; try { d = JSON.parse(t); } catch (e) { return out({error: 'format'}, 502); }
    const a = d && d.ahadith;
    const html = typeof a === 'string' ? a : a && typeof a.result === 'string' ? a.result : Array.isArray(a) ? a.map(x => x.th || x.result || '').join('') : '';
    return out({html, page});
  } catch (e) {
    return out({error: 'net'}, 502);
  }
}
