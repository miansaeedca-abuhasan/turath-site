// «صلاۃ خیرالقرون» mosque finder: OpenStreetMap places of worship of Muslims in a box, from the Overpass API,
// asked here (with a proper User-Agent, trying the mirrors) and kept for a week, so phones get a quick answer and
// the free map servers are asked as little as possible.  /api/mosques?bb=south,west,north,east  ->  Overpass JSON
export async function onRequest({request}) {
  const u = new URL(request.url);
  const bb = (u.searchParams.get('bb') || '').split(',').map(Number);
  const bad = bb.length !== 4 || bb.some(x => !isFinite(x)) || bb[2] - bb[0] > 1.2 || bb[3] - bb[1] > 3.5;
  if (bad) return new Response(JSON.stringify({error: 'bb'}), {status: 400, headers: {'Content-Type': 'application/json'}});
  const box = bb.map(x => x.toFixed(2)).join(',');
  const cache = caches.default, key = new Request('https://turathkhairalquroon.com/api/mosques?bb=' + box);
  const hit = await cache.match(key);
  if (hit) return hit;
  const q = '[out:json][timeout:60];nwr["amenity"="place_of_worship"]["religion"="muslim"](' + box + ');out center tags;';
  for (const ep of ['https://overpass.kumi.systems/api/interpreter', 'https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter']) {
    try {
      const r = await fetch(ep, {method: 'POST', body: 'data=' + encodeURIComponent(q),
        headers: {'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'SalatKhairAlQuroon/1.0 (+https://turathkhairalquroon.com; mosque finder)', 'Accept': 'application/json'}});
      if (!r.ok) continue;
      const t = await r.text();
      if (!t.includes('"elements"')) continue;
      const res = new Response(t, {headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=604800'}});
      await cache.put(key, res.clone());
      return res;
    } catch (e) {}
  }
  return new Response(JSON.stringify({error: 'busy'}), {status: 503, headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}});
}
