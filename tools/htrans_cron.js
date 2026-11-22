#!/usr/bin/env node
// Daily background «ai ترجمہ»: translates the next N Arabic hadith (and bab titles) of the hadith books that have no Urdu translation, and the server saves them.
// Runs in GitHub Actions (.github/workflows/htrans.yml). Needs env HTRANS_CRON (same secret as in Cloudflare). Optional: SITE, N (new translations per run, default 200), LANG (default ur), CONC (default 4).
// Place in the list = «cursor» kept by the server (book number * 1000000 + row number), so every run goes on where the last stopped.
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..'), SITE = process.env.SITE || 'https://turathkhairalquroon.com', KEY = process.env.HTRANS_CRON, LANG = process.env.LANG_TR || 'ur';
const N = +process.env.N || 200, CONC = +process.env.CONC || 4;
if (!KEY && !process.env.DRY) { console.error('HTRANS_CRON missing'); process.exit(2); }
let R; vm.runInNewContext(fs.readFileSync(path.join(root, 'coll/index.js'), 'utf8'), {COLLS: a => { R = a; }});
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const lit = (re) => { const m = html.match(re); return m ? m[1] : ''; };
const HB_CAT = vm.runInNewContext('(' + lit(/const HB_CAT\s*=\s*(\{[\s\S]*?\});/) + ')');
const GEM_CATS = new Set(JSON.parse(lit(/const GEM_CATS = new Set\((\[[^\]]*\])\)/)));
const RJ = new Set([...vm.runInNewContext(lit(/const RJ_LIB = (\[[^\]]*\])/)), ...vm.runInNewContext(lit(/const RJ_STRUCT = (\[[^\]]*\])/))]);
const books = R.filter(b => b.key && !b.prose && !b.parts && !(b.langs || []).includes(LANG) && !R.some(o => o.key === b.key + 'ur' && (o.langs || []).includes(LANG)) && GEM_CATS.has(HB_CAT[b.key]) && !RJ.has(b.key) && b.files && b.files.ar);
const arab = t => ((t.match(/[ء-يٱ-ۓ]/g) || []).length >= Math.max(3, t.replace(/\s/g, '').length * 0.5));
async function post(body) {
  for (let k = 0; k < 3; k++) {
    try { const r = await fetch(SITE + '/api/htrans', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-Cron-Key': KEY || ''}, body: JSON.stringify(body)}); const j = await r.json().catch(() => ({})); return {s: r.status, j}; }
    catch (e) { await new Promise(r => setTimeout(r, 3000)); }
  }
  return {s: 0, j: {}};
}
function rowsOf(b) {
  const out = [];
  for (const f of b.files.ar) { let rows = []; vm.runInNewContext(fs.readFileSync(path.join(root, 'coll', f[2]), 'utf8'), {COLLDATA: (k, l, r) => { rows = r; }}); out.push(...rows); }
  return out;
}
(async () => {
  if (process.env.DRY) { console.log('books', books.length, 'rows', books.reduce((a, b) => a + (b.count || 0), 0)); return; }
  const c0 = await post({op: 'cursor', lang: LANG}); if (c0.s !== 200) { console.error('cursor refused (' + c0.s + '): HTRANS_CRON is not set in Cloudflare or does not match'); process.exit(3); }
  let cur = c0.j.pos || 0, bi = Math.floor(cur / 1e6), ri = cur % 1e6, fresh = 0, fails = 0, stop = false;
  console.log('start at book', bi, '/', books.length, 'row', ri);
  for (; bi < books.length && !stop; bi++, ri = 0) {
    const b = books[bi], rows = rowsOf(b);
    const titles = ri === 0 ? (b.sections || []).map(s => (s[4] && arab(s[4])) ? s[4] : s[1]).filter(t => t && arab(t)) : [];
    for (const t of titles) { const r = await post({ar: t, lang: LANG}); if (r.j.ur && r.j.saved === false) fresh++; }
    while (ri < rows.length) {
      const grp = rows.slice(ri, ri + CONC);
      const res = await Promise.all(grp.map(async row => {
        const lines = String(row[1] || '').split('\n'), tl = lines.filter(x => x[0] === '§').map(x => x.slice(1).trim()).filter(arab), body = lines.filter(x => x[0] !== '§' && x.trim()).join('\n');
        let nw = 0, ok = true;
        for (const t of tl) { const r = await post({ar: t, lang: LANG}); if (r.j.ur && r.j.saved === false) nw++; }
        if (arab(body) && body.length >= 4) { const r = await post({ar: body.slice(0, 9000), lang: LANG}); if (r.j.ur) { if (r.j.saved === false) nw++; } else if (r.s === 400) { /* not a translatable text */ } else ok = false; }
        return {nw, ok};
      }));
      fresh += res.reduce((a, x) => a + x.nw, 0);
      if (res.some(x => !x.ok)) { fails++; if (fails >= 3) { stop = true; console.log('stopping: translation failed 3 times in a row'); break; } continue; }   // same group again next time through the loop
      fails = 0; ri += grp.length;
      if (fresh >= N) { stop = true; break; }
    }
    if (stop) break;
  }
  const pos = Math.min(bi, books.length) * 1e6 + (stop ? ri : 0);
  await post({op: 'cursor', lang: LANG, set: pos});
  console.log('new translations', fresh, 'cursor', pos, bi >= books.length ? '(finished all books)' : '');
})();
