/* رواة الجامع الكامل ومصادره (مرتب: تراث خیرالقرون)
   Two folders placed after the introduction of al-Jami al-Kamil: narrators (#/jr) and authors/sources (#/js).
   Each entry opens in tabs: introduction, total hadith, hadith numbers. Data: data/jrs.js (window.TURATH_JRS). */
(function () {
  'use strict';
  const L = {
    ur: {byline: 'مرتب: تراث خیرالقرون', nT: 'أسماء صحابة رواۃ الجامع الکامل', sT: 'الکتب مصادر الجامع الکامل', nSub: 'ان صحابہ کرام کا تعارف جن سے الجامع الکامل کی احادیث مروی ہیں، ہر ایک کی احادیث کی تعداد اور نمبروں کے ساتھ', sSub: 'ان کتابوں اور مؤلفین کا تعارف جن کے حوالے الجامع الکامل میں آئے ہیں', ph: 'نام لکھ کر تلاش کریں', none: 'کوئی نتیجہ نہیں ملا۔', intro: 'تعارف', enc: 'موسوعۃ الرواۃ', total: 'کل احادیث', nums: 'احادیث کے نمبر', hCount: n => n.toLocaleString('en') + ' احادیث', totalIs: 'الجامع الکامل میں کل احادیث', nNums: 'ان احادیث کے نمبر', noNums: 'الجامع الکامل کی تخریج اور حواشی میں اس مصدر کا نام لے کر حوالہ نہیں ملا۔', noNumsN: 'الجامع الکامل میں ان کے نام سے براہِ راست کوئی حدیث نہیں ملی؛ ان کا ذکر دوسری روایات میں آیا ہے۔', open: 'حدیث کھولیں', title: 'نام', author: 'مؤلف', born: 'ولادت', died: 'وفات', type: 'کتاب کا تعارف', count: 'کتاب میں احادیث کی تعداد', cnt: n => n + ' ترجمے', all: 'سب', rows: n => n + ' اندراجات', listHint: 'کسی نام پر کلک کریں', more: n => 'مزید ' + n + ' نمبر دکھائیں', other: 'یہ تعداد اس کتاب کی ہے', fromNums: 'الجامع الکامل کے نمبر (تخریج اور حواشی میں ذکر)', back: 'فہرست'},
    ar: {byline: 'مرتب: تراث خير القرون', nT: 'رواة الجامع الكامل', sT: 'مؤلفو الجامع الكامل', nSub: 'تعريف بالصحابة والرواة الذين وردت عنهم أحاديث الجامع الكامل', sSub: 'تعريف بالكتب ومؤلفيها التي ورد تخريجها في الجامع الكامل', ph: 'ابحث بالاسم', none: 'لا توجد نتائج.', intro: 'تعريف', enc: 'موسوعة الرواة', total: 'مجموع الأحاديث', nums: 'أرقام الأحاديث', hCount: n => n.toLocaleString('en') + ' حديثًا', totalIs: 'مجموع الأحاديث في الجامع الكامل', nNums: 'أرقام هذه الأحاديث', noNums: 'لم يرد ذكر هذا المصدر صراحة في تخريج الجامع الكامل ولا في حواشيه.', noNumsN: 'لا يوجد في الجامع الكامل حديث مسند إليه مباشرة، وإنما ورد ذكره في روايات أخرى.', open: 'افتح الحديث', title: 'الاسم', author: 'المؤلف', born: 'الولادة', died: 'الوفاة', type: 'التعريف بالكتاب', count: 'عدد الأحاديث في الكتاب', all: 'الكل', back: 'القائمة', more: n => 'عرض ' + n + ' رقمًا أخرى', other: 'هذا العدد خاص بالكتاب', fromNums: 'الأرقام هي أرقام الجامع الكامل'},
    en: {byline: 'Compiled by: Turath Khair al-Quroon', nT: 'Narrators of al-Jami al-Kamil', sT: 'Authors of al-Jami al-Kamil', nSub: 'The Companions and narrators whose hadith fill al-Jami al-Kamil', sSub: 'The books and authors cited in the references of al-Jami al-Kamil', ph: 'Search by name', none: 'No results.', intro: 'Introduction', enc: 'Narrators Encyclopedia', total: 'Total hadith', nums: 'Hadith numbers', hCount: n => n.toLocaleString('en') + ' hadith', totalIs: 'Total hadith in al-Jami al-Kamil', nNums: 'Numbers of these hadith', noNums: 'This source is not cited by name in the takhrij or notes of al-Jami al-Kamil.', noNumsN: 'No hadith in al-Jami al-Kamil is narrated directly on his or her authority; the name appears only inside other reports.', open: 'Open hadith', title: 'Name', author: 'Author', born: 'Born', died: 'Died', type: 'About the book', count: 'Hadith in the book', all: 'All', back: 'List', more: n => 'Show ' + n + ' more numbers', other: 'This count belongs to the book itself', fromNums: 'Numbers are al-Jami al-Kamil numbers'}
  };
  const lang = () => { let u = 'en'; try { u = localStorage.ui || 'en'; } catch (e) {} return L[u] ? u : 'en'; };
  const T = () => L[lang()];
  let DATA = null, P = null;
  const load = () => P || (P = new Promise((ok, no) => {
    window.TURATH_JRS = d => { DATA = d; ok(d); };
    const s = document.createElement('script'); s.src = 'data/jrs.js?v=' + (window.JRS_V || '2'); s.onerror = () => { P = null; no(); }; document.head.append(s);
  }));
  const el = (t, a, ...k) => { const e = document.createElement(t); for (const n in a || {}) { if (n === 'on') for (const ev in a.on) e.addEventListener(ev, a.on[ev]); else if (a[n] != null && a[n] !== false) e.setAttribute(n, a[n]); } e.append(...k.filter(x => x != null)); return e; };
  const RD = {ur: ['رضی اللہ عنہ', 'رضی اللہ عنہا'], ar: ['رضي الله عنه', 'رضي الله عنها'], en: ['رضي الله عنه', 'رضي الله عنها']};
  const nm = (x, kind) => { const l = lang(); if (kind === 'n') return (x.nm[l] || x.nm.en) + ' ' + RD[l][x.g === 'f' ? 1 : 0]; const o = x[l] || x.en; return x.sh && o.title.indexOf('—') < 0 ? o.title + ' — ' + (x.sh[l] || x.sh.en) : o.title; };
  const fmt = n => n.toLocaleString('en');
  const norm = s => (s || '').replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ۃ/g, 'ه').replace(/[یے]/g, 'ي').replace(/ک/g, 'ك').replace(/ہ|ھ/g, 'ه').toLowerCase();
  const CSS = `
.jr{max-width:60rem;margin:0 auto;padding:0 .2rem 2rem}
.jr .hero{border-radius:18px;padding:1.3rem 1.2rem 1.1rem;margin:.4rem 0 1rem;color:#fff;background:linear-gradient(135deg,#1d4f78 0%,#2f7fc0 60%,#4a97d2 100%);box-shadow:var(--shadow);text-align:center;position:relative;overflow:hidden}
.jr .hero:after{content:"";position:absolute;inset:auto -30px -50px auto;width:170px;height:170px;border-radius:50%;background:rgba(255,255,255,.08)}
.jr .hero h2{margin:.1rem 0 .15rem;font-size:1.5rem;font-weight:700;color:#fff}
.jr .hero .by{display:inline-block;margin:.35rem 0 .3rem;padding:.12rem .8rem;border-radius:999px;background:rgba(255,255,255,.18);font-size:.95rem}
.jr .hero p{margin:.2rem auto 0;max-width:34rem;opacity:.92;font-size:.98rem;line-height:1.8}
.jr .sbox{position:sticky;top:0;z-index:3;background:var(--paper);padding:.35rem 0 .5rem}
.jr .sbox input{width:100%;box-sizing:border-box;font:inherit;font-size:1rem;padding:.7rem 1rem;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink)}
.jr .grid{display:grid;grid-template-columns:1fr;gap:.55rem}
.jr .it{display:flex;align-items:center;gap:.8rem;padding:.7rem .9rem;border:1px solid var(--line);border-radius:14px;background:var(--card);box-shadow:var(--shadow);text-decoration:none;color:var(--ink)}
.jr .it:active,.jr .it:hover{border-color:var(--accent)}
.jr .no{flex:none;min-width:2.3rem;height:2.3rem;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--wash);color:var(--accent);font:700 .95rem system-ui,sans-serif;direction:ltr}
.jr .nmx{flex:1;min-width:0;font-size:1.12rem;line-height:1.8;font-weight:600}
.jr .cn{flex:none;font-size:.82rem;color:var(--muted);background:var(--wash);border-radius:999px;padding:.1rem .7rem;white-space:nowrap}
.jr .nmx.ar,.jr .tt.ar{font-family:var(--arabic)}
html[lang=ur] .jr .nmx,html[lang=ur] .jr .hero h2,html[lang=ur] .jr .tt{font-family:var(--urduhead)}
.jr .head{border:1px solid var(--line);border-radius:18px;background:var(--card);box-shadow:var(--shadow);padding:1rem 1.1rem;margin:.4rem 0 .8rem;display:flex;gap:.9rem;align-items:center}
.jr .head .no{min-width:3rem;height:3rem;font-size:1.15rem}
.jr .head .tt{font-size:1.35rem;font-weight:700;line-height:1.7;color:var(--ink)}
.jr .head .by{font-size:.85rem;color:var(--accent)}
.jr .tabs{display:flex;gap:.3rem;border-bottom:2px solid var(--line);margin:0 0 .9rem;overflow-x:auto}
.jr .tabs button{flex:1 0 auto;font:inherit;font-size:1rem;padding:.6rem .9rem;border:0;background:none;color:var(--muted);border-bottom:3px solid transparent;margin-bottom:-2px;cursor:pointer;white-space:nowrap}
.jr .tabs button[aria-selected=true]{color:var(--accent);border-bottom-color:var(--accent);font-weight:700}
.jr .pane{border:1px solid var(--line);border-radius:16px;background:var(--card);padding:1rem 1.1rem;box-shadow:var(--shadow)}
.jr .pane p{margin:.2rem 0 .8rem;line-height:2.1;font-size:1.1rem}
.jr .pane h3{margin:1rem 0 .3rem;font-size:1.1rem;color:var(--accent);padding-bottom:.2rem;border-bottom:1px solid var(--line)}
.jr .pane.ar p,.jr .pane.ar h3{font-family:var(--arabic);font-size:1.22rem}
html[lang=ur] .jr .pane p{font-family:var(--urdu)}
.jr .kv{display:grid;grid-template-columns:1fr;gap:.1rem;margin:0}
.jr .kv div{padding:.5rem 0;border-top:1px solid var(--line)}.jr .kv div:first-child{border-top:0}
.jr .kv b{display:block;font-size:.85rem;color:var(--accent);font-weight:600}
.jr .kv span{font-size:1.08rem;line-height:1.9}
.jr .big{display:flex;align-items:center;justify-content:center;gap:.7rem;flex-wrap:wrap;padding:.5rem 0}
.jr .big b{display:inline-block;font:700 1.35rem/1.4 system-ui,sans-serif;color:var(--accent);direction:ltr;background:var(--wash);border-radius:12px;padding:.2rem .9rem}
.jr .big span{color:var(--ink);font-size:1.05rem}
.jr .chips{display:flex;flex-wrap:wrap;gap:.4rem;direction:ltr;margin-top:.6rem}
.jr .chips a{padding:.25rem .65rem;border-radius:9px;background:var(--wash);color:var(--accent);text-decoration:none;font:600 .92rem system-ui,sans-serif}
.jr .chips a:hover{background:var(--accent);color:#fff}
.jr .mb{display:block;margin:.8rem auto 0;font:inherit;padding:.5rem 1.2rem;border-radius:10px;border:1px solid var(--accent);background:none;color:var(--accent);cursor:pointer}
.jr .note{color:var(--muted);font-size:.9rem;margin:.3rem 0}
.jr .back{display:inline-block;margin:.2rem 0 .3rem;color:var(--accent);text-decoration:none;font-size:.95rem}
@media(min-width:900px){
 .jr{padding-top:.5rem}.jr .hero{padding:2rem 2rem 1.6rem}.jr .hero h2{font-size:2rem}
 .jr .grid{grid-template-columns:1fr 1fr;gap:.7rem}
 .jr .it{padding:.85rem 1rem}
 .jr .kv{grid-template-columns:1fr 1fr;column-gap:1.6rem}.jr .kv div:nth-child(2){border-top:0}
 .jr .pane{padding:1.4rem 1.8rem}.jr .tabs button{flex:0 0 auto;padding:.7rem 1.6rem}
}`;
  function style() { if (document.getElementById('jrcss')) return; const s = document.createElement('style'); s.id = 'jrcss'; s.textContent = CSS; document.head.append(s); }

  function intro(x, kind) {
    const l = lang(), box = [];
    if (kind === 'n') {
      const v = x.x[l] || x.x.en;
      if (Array.isArray(v)) v.forEach(b => box.push(b[0] === 'h' ? el('h3', null, b[1]) : el('p', null, b[1])));
      else String(v).split(/\n+/).forEach(t => t.trim() && box.push(el('p', null, t.trim())));
    } else {
      const o = x[l] || x.en, T_ = T(), kv = el('div', {class: 'kv'});
      [['author', o.author], ['born', o.born], ['died', o.died]].forEach(([k, v]) => v && kv.append(el('div', null, el('b', null, T_[k]), el('span', null, v))));
      box.push(kv);
      if (o.type) box.push(el('h3', null, T_.type), el('p', null, o.type));
      if (o.count) box.push(el('h3', null, T_.count), el('p', null, o.count));
    }
    return box;
  }

  function numsPane(x, kind) {
    const T_ = T(), w = el('div'), hs = x.h;
    if (!hs.length) { w.append(el('p', {class: 'note'}, kind === 'n' ? T_.noNumsN : T_.noNums)); return w; }
    w.append(el('p', {class: 'note'}, T_.fromNums + ' — ' + T_.hCount(hs.length)));
    const chips = el('div', {class: 'chips'}); w.append(chips);
    let shown = 0; const STEP = 300;
    const more = el('button', {class: 'mb', type: 'button'});
    const draw = () => { const f = document.createDocumentFragment(); hs.slice(shown, shown + STEP).forEach(n => f.append(el('a', {href: '#/h/' + n}, String(n)))); chips.append(f); shown = Math.min(hs.length, shown + STEP); if (shown >= hs.length) more.remove(); else more.textContent = T_.more(Math.min(STEP, hs.length - shown)); };
    more.addEventListener('click', draw); w.append(more); draw();
    return w;
  }

  function detail(kind, id) {
    const T_ = T(), arr = kind === 'n' ? DATA.n : DATA.s, x = arr.find(z => z.i === id), root = document.getElementById('view');
    if (!x) return list(kind);
    const isAr = lang() === 'ar', base = kind === 'n' ? '#/jr' : '#/js';
    const idx = arr.indexOf(x);
    const pane = el('div', {class: 'pane' + (isAr ? ' ar' : '')});
    const tabs = el('div', {class: 'tabs', role: 'tablist'});
    const defs = [['intro', T_.intro], ['total', T_.total], ['nums', T_.nums]];
    if (kind === 'n' && x.e && window.NAR && NAR.render) defs.push(['enc', T_.enc]);
    const show = k => {
      tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.k === k)));
      pane.replaceChildren();
      if (k === 'intro') pane.append(...intro(x, kind));
      else if (k === 'total') {
        pane.append(el('div', {class: 'big'}, el('b', null, fmt(x.c)), el('span', null, T_.totalIs)));
        if (kind === 's') { const o = x[lang()] || x.en; if (o.count) pane.append(el('h3', null, T_.count), el('p', null, o.count)); }
      } else if (k === 'enc') { const host = el('div', {class: 'nsheet'}); pane.append(host); NAR.render(x.e, host); }
      else pane.append(numsPane(x, kind));
    };
    defs.forEach(([k, t]) => tabs.append(el('button', {type: 'button', role: 'tab', 'data-k': k, on: {click: () => show(k)}}, t + (k === 'total' ? ' (' + fmt(x.c) + ')' : ''))));
    const head = el('div', {class: 'head'}, el('span', {class: 'no'}, String(x.i)), el('div', null, el('div', {class: 'tt' + (kind === 's' || isAr ? ' ar' : '')}, nm(x, kind)), el('div', {class: 'by'}, T_.byline)));
    const pn = (d) => { const y = arr[idx + d]; return y ? el('a', {class: 'back', href: base + '/' + y.i}, (d < 0 ? '‹ ' : '') + nm(y, kind) + (d > 0 ? ' ›' : '')) : null; };
    root.replaceChildren(el('div', {class: 'jr'}, el('a', {class: 'back', href: base}, '← ' + (kind === 'n' ? T_.nT : T_.sT)), head, tabs, pane, el('div', {style: 'display:flex;justify-content:space-between;gap:1rem;margin-top:.6rem'}, pn(-1) || el('span'), pn(1) || el('span'))));
    show('intro'); window.scrollTo(0, 0);
  }

  function list(kind) {
    const T_ = T(), arr = kind === 'n' ? DATA.n : DATA.s, root = document.getElementById('view'), base = kind === 'n' ? '#/jr/' : '#/js/';
    const isAr = lang() === 'ar';
    const inp = el('input', {type: 'search', placeholder: T_.ph, 'aria-label': T_.ph, enterkeyhint: 'search'});
    const grid = el('div', {class: 'grid'});
    const draw = () => {
      const q = norm(inp.value.trim());
      const rows = arr.filter(x => !q || norm([x.i, kind === 'n' ? Object.values(x.nm).join(' ') : ['ar', 'ur', 'en'].map(l => (x[l].title || '') + ' ' + (x[l].author || '')).join(' ')].join(' ')).includes(q));
      grid.replaceChildren(...(rows.length ? rows.map(x => el('a', {class: 'it', href: base + x.i}, el('span', {class: 'no'}, String(x.i)), el('span', {class: 'nmx' + (kind === 's' || isAr ? ' ar' : '')}, nm(x, kind)), el('span', {class: 'cn'}, fmt(x.c)))) : [el('p', {class: 'note'}, T_.none)]));
    };
    inp.addEventListener('input', draw);
    root.replaceChildren(el('div', {class: 'jr'}, el('div', {class: 'hero'}, el('h2', null, kind === 'n' ? T_.nT : T_.sT), el('div', {class: 'by'}, T_.byline), el('p', null, kind === 'n' ? T_.nSub : T_.sSub)), el('div', {class: 'sbox'}, inp), grid));
    draw();
  }

  async function show(hash) {
    style();
    const root = document.getElementById('view');
    root.replaceChildren(el('p', {class: 'note', style: 'text-align:center;padding:2rem'}, '…'));
    try { await load(); } catch (e) { root.replaceChildren(el('p', {class: 'note'}, '⚠')); return; }
    const m = hash.match(/^#\/(jr|js)(?:\/(\d+))?/), kind = m[1] === 'jr' ? 'n' : 's', T_ = T();
    const t1 = document.getElementById('t1'), t2 = document.getElementById('t2'), bk = document.getElementById('back');
    if (t1) t1.textContent = kind === 'n' ? T_.nT : T_.sT; if (t2) t2.textContent = T_.byline; if (bk) bk.hidden = false;
    document.title = (kind === 'n' ? T_.nT : T_.sT) + ' — ' + T_.byline;
    m[2] ? detail(kind, +m[2]) : list(kind);
  }
  window.JRS = {show, labels: L, hash: h => /^#\/j[rs](\/\d+)?$/.test(h)};
})();
