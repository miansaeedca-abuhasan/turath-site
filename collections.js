// Other hadith books (Bukhari, Muslim, the Sunan, Muwatta, forty-hadith collections) with Urdu / English / Bengali translations.
// Data: coll/index.js + coll/<book>_<lang>_<n>.js, loaded only when a book is opened.  Routes:
//   #/s/<book>            sections (kitabs) + search inside the book (hadith number or words)
//   #/s/<book>/<section>  the hadith of that section       #/s/<book>/n/<num>  one hadith
(function () {
  Object.assign(I.ur, {cBooks: 'دیگر کتبِ حدیث', cSecSearch: 'اس کتاب میں: حدیث نمبر یا الفاظ (سب الفاظ والی احادیث)', cOnlyAr: 'صرف عربی',
    cGrade: 'درجہ', cOpen: 'کتاب میں کھولیں', cNotHere: 'یہ نمبر اس کتاب میں نہیں ملا۔', cLangMissing: 'اس کتاب کا یہ ترجمہ دستیاب نہیں۔',
    cSource: 'ماخذ: hadith-api (fawazahmed0) / Open Hadith Data — اوپن سورس', cJami: n => 'الجامع الکامل ' + n, gsTitle: 'تلاش — کتب چن کر', gsPlace: 'الفاظ لکھیں (سب الفاظ والی احادیث آئیں گی)', gsGo: 'تلاش کریں', gsPick: 'کن کتب میں تلاش کریں؟', gsChosen: n => '(' + n + ' کتب چنی ہیں)', gsAll: 'سب کتب', gsNone: 'کوئی نہیں', gsMain: 'الجامع الکامل اور صحاح ستہ', gsHint: 'جو کتاب کھلی ہو اس کے اندر تلاش کیلئے کتاب کھول کر اوپر کا خانہ استعمال کریں۔ زیادہ یا بڑی کتب چننے پر تلاش میں کچھ دیر لگ سکتی ہے۔', gsTotal: (n, b) => 'کل نتائج: ' + n + ' — ' + b + ' کتب میں', cBabs: 'ابواب', cSourceJami: 'یہ کتاب «الجامع الکامل في الحديث الصحيح الشامل» سے ماخوذ ہے، اردو ترجمہ کے ساتھ۔', cExt: 'یہ عربی کتاب سائز کی وجہ سے ایپ کے دوسرے لنک میں رکھی گئی ہے۔ ہوسٹ کی ہوئی سائٹ میں یہ یہیں کھلے گی۔', cOpenExt: 'کتاب کھولیں ↗', cSourceAr: 'ماخذ: turath.io (مکتبہ شاملہ) — آپ کی بھیجی ہوئی EPUB فائلیں', cPrinted: n => 'مطبوعہ نمبر ' + n, cSection: 'کتاب'});
  Object.assign(I.en, {cBooks: 'Other hadith books', cSecSearch: 'In this book: hadith number or words (hadith with all the words)', cOnlyAr: 'Arabic only',
    cGrade: 'Grade', cOpen: 'Open in the book', cNotHere: 'This number was not found in this book.', cLangMissing: 'This translation is not available for this book.',
    cSource: 'Source: hadith-api (fawazahmed0) / Open Hadith Data — open source', cJami: n => 'al-Jami al-Kamil ' + n, gsTitle: 'Search — choose books', gsPlace: 'Type words (hadith with all the words)', gsGo: 'Search', gsPick: 'Which books to search?', gsChosen: n => '(' + n + ' books chosen)', gsAll: 'All books', gsNone: 'None', gsMain: 'Al-Jami al-Kamil and the six books', gsHint: 'To search inside one book, open the book and use the box at its top. Choosing many or large books makes the search take longer.', gsTotal: (n, b) => 'Total: ' + n + ' — in ' + b + ' books', cBabs: 'chapters', cSourceJami: 'Taken from al-Jami al-Kamil fi al-Hadith as-Sahih ash-Shamil, with Urdu translation.', cExt: 'Because of its size, this Arabic book is kept in a second link of the app. On the hosted site it opens here.', cOpenExt: 'Open the book ↗', cSourceAr: 'Source: turath.io (al-Maktaba ash-Shamila) EPUB files', cPrinted: n => 'printed no. ' + n, cSection: 'Book'});
  Object.assign(I.ur, {hsTile: 'حدیث تلاش (حکم)', hsTitle: 'حدیث تلاش — حکم کے ساتھ', hsPlace: 'حدیث کے الفاظ لکھیں، مثلاً: لا تغضب', hsHint: 'پہلے اس ویبسائٹ کی سب کتب میں تلاش ہوگی، پھر الموسوعة الحديثية (الدرر السنية) میں محدثین کے حکم کے ساتھ۔ عربی الفاظ سے تلاش کریں۔',
    hsSite: 'تراث خیرالقرون کی کتب میں', hsDorar: 'الموسوعة الحديثية (الدرر السنية) — حکم کے ساتھ', hsGrade: 'خلاصۂ حکم', hsRawi: 'راوی', hsMuh: 'محدث', hsSrc: 'ماخذ', hsNo: 'صفحہ یا نمبر',
    hsOpenDorar: 'الدرر السنية پر کھولیں', hsDorarErr: 'الدرر السنية سے نتائج نہیں آ سکے (انٹرنیٹ یا ان کی سائٹ)۔ نیچے سے براہ راست کھول لیں۔', hsDorarSrc: 'یہ نتائج الموسوعة الحديثية — الدرر السنية (dorar.net) کی خدمت سے ہیں۔'});
  Object.assign(I.en, {hsTile: 'Hadith search (grades)', hsTitle: 'Hadith search — with grades', hsPlace: 'Type Arabic words of the hadith, e.g. لا تغضب', hsHint: 'First all the books of this website are searched, then the Hadith Encyclopedia (Dorar as-Saniyyah) with the muhaddiths’ grades. Search with Arabic words.',
    hsSite: 'In the books of Turath Khair Al-Quroon', hsDorar: 'Hadith Encyclopedia (Dorar as-Saniyyah) — with grades', hsGrade: 'Grade', hsRawi: 'Narrator', hsMuh: 'Muhaddith', hsSrc: 'Source', hsNo: 'Page or number',
    hsOpenDorar: 'Open on dorar.net', hsDorarErr: 'Results from dorar.net could not be loaded (internet or their site). Open it directly below.', hsDorarSrc: 'These results are from the Hadith Encyclopedia service of Dorar as-Saniyyah (dorar.net).'});
  if (I.ar) Object.assign(I.ar, {hsTile: 'البحث الحديثي', hsTitle: 'البحث الحديثي — مع الحكم', hsPlace: 'اكتب ألفاظ الحديث، مثل: لا تغضب', hsHint: 'يُبحث أولًا في جميع كتب هذا الموقع، ثم في الموسوعة الحديثية (الدرر السنية) مع أحكام المحدثين.',
    hsSite: 'في كتب تراث خير القرون', hsDorar: 'الموسوعة الحديثية (الدرر السنية) — مع الحكم', hsGrade: 'خلاصة حكم المحدث', hsRawi: 'الراوي', hsMuh: 'المحدث', hsSrc: 'المصدر', hsNo: 'الصفحة أو الرقم',
    hsOpenDorar: 'افتح في الدرر السنية', hsDorarErr: 'تعذّر جلب النتائج من الدرر السنية. افتحها مباشرة من الزر أدناه.', hsDorarSrc: 'هذه النتائج من خدمة الموسوعة الحديثية — الدرر السنية (dorar.net).'});
  Object.assign(I.ur, {sxTitle: 'شروح', sxMore: 'مکمل شرح پڑھیں', sxLess: 'کم کریں', sxOpen: 'کتاب میں کھولیں', sxBab: 'باب کی شرح', sxNone: 'شرح لوڈ نہیں ہو سکی۔'});
  Object.assign(I.en, {sxTitle: 'Commentaries', sxMore: 'Read the full commentary', sxLess: 'Show less', sxOpen: 'Open in the book', sxBab: 'Commentary on the chapter', sxNone: 'The commentary could not be loaded.'});
  if (I.ar) Object.assign(I.ar, {sxTitle: 'الشروح', sxMore: 'اقرأ الشرح كاملاً', sxLess: 'أقل', sxOpen: 'افتح في الكتاب', sxBab: 'شرح الباب', sxNone: 'تعذّر تحميل الشرح.'});
  ['bn', 'hi', 'gu', 'fr'].forEach(l => { if (I[l]) Object.assign(I[l], {sxTitle: {bn: 'ব্যাখ্যা', hi: 'शरहें', gu: 'શરહો', fr: 'Commentaires'}[l], sxMore: {bn: 'পূর্ণ ব্যাখ্যা পড়ুন', hi: 'पूरी शरह पढ़ें', gu: 'પૂરી શરહ વાંચો', fr: 'Lire le commentaire complet'}[l], sxLess: {bn: 'কম', hi: 'कम', gu: 'ઓછું', fr: 'Moins'}[l], sxOpen: {bn: 'বইয়ে খুলুন', hi: 'किताब में खोलें', gu: 'કિતાબમાં ખોલો', fr: 'Ouvrir dans le livre'}[l], sxBab: {bn: 'অধ্যায়ের ব্যাখ্যা', hi: 'अध्याय की शरह', gu: 'પ્રકરણની શરહ', fr: 'Commentaire du chapitre'}[l], sxNone: {bn: 'লোড হয়নি।', hi: 'लोड नहीं हो सकी।', gu: 'લોડ થઈ શકી નથી.', fr: 'Chargement impossible.'}[l]}); });
  const C = {idx: null, data: {}, loading: {}, rev: {}};
  window.COLLS = list => { C.idx = list; list.forEach(b => { if (b.an && b.an._r) { const r = b.an._r; delete b.an._r; for (const [n, v, c] of r) for (let i = 0; i < c; i++) b.an[n + i] = String(v + i); } const r = {}; for (const n in b.an) { const p = parseInt(b.an[n], 10); if (!(p in r)) r[p] = +n; } C.rev[b.key] = r; }); };
  C.fixes = {};
  window.COLLDATA = (b, l, rows) => { const m = (C.data[b + '|' + l] = C.data[b + '|' + l] || new Map()); rows.forEach(r => { const f = C.fixes[b + '|' + l + '|' + r[0]]; if (f) { r = r.slice(); r[1] = f; } m.set(r[0], r); }); };
  const load = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.append(s); });
  const once = (id, src) => C.loading[id] || (C.loading[id] = load(src));
  async function index() { if (!C.idx) await once('index', 'coll/index.js'); return C.idx; }
  const bookOf = k => (C.idx || []).find(b => b.key === k);
  async function needRange(b, lang, from, to) {
    const fs = (b.files[lang] || []).filter(f => f[1] >= from && f[0] <= to);
    await Promise.allSettled(fs.map(f => once(f[2], 'coll/' + f[2])));
  }
  async function needAll(b, lang) { await Promise.allSettled((b.files[lang] || []).map(f => once(f[2], 'coll/' + f[2]))); }
  const row = (b, lang, n) => (C.data[b.key + '|' + lang] || new Map()).get(n);
  // the Arabic kitab / bab of each hadith of the old collections (islam-db), loaded per book: idb/ch_<key>.js
  const CHK = new Set(["abdrazzaq", "abudawud", "adab", "ahmad", "bukhari", "dalail", "darimi", "hakim", "humaydi", "ibnhibban", "ibnjad", "ibnkhuzaymah", "ibnmajah", "kubrabayhaqi", "kubranasai", "malik", "mujamkabir", "muslim", "muslimab", "muslimtr", "nasai", "sarraj", "sh10480", "sh10490", "sh11333", "sh12520", "sh12579", "sh12862", "sh13011", "sh13016", "sh13034", "sh13035", "sh13041", "sh13053", "sh13061", "sh13068", "sh13122", "sh13132", "sh13159", "sh13160", "sh13162", "sh13170", "sh146", "sh1719", "sh21570", "sh22367", "sh22547", "sh22804", "sh236", "sh23764", "sh28107", "sh28171", "sh3525", "sh5930", "sh71", "sh7351", "sh8238", "sh8970", "sh9196", "sh9270", "sh9697", "sh9771", "shamail", "sharhsunna", "shuabiman", "sunnaabdullah", "tawhid", "tayalisi", "tirmidhi", "zuhdmubarak"]);
  C.ch = {}; window.CH = (k, d) => { C.ch[k] = d; };
  const needChap = b => !CHK.has(b.key) || b.key in C.ch ? Promise.resolve() : new Promise(ok => { C.ch[b.key] = null;
    const sc = document.createElement('script'); sc.src = 'idb/ch_' + b.key + '.js'; sc.onload = () => { sc.remove(); ok(); }; sc.onerror = () => { sc.remove(); ok(); }; document.head.append(sc); });
  const chapStr = (b, n) => { const d = C.ch[b.key]; if (!d || !d.r) return ''; const r = d.r; let lo = 0, hi = r.length / 2 - 1, at = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (r[2 * m] <= n) { at = m; lo = m + 1; } else hi = m - 1; }
    if (at < 0 || r[2 * at + 1] < 0) return ''; return d.c[r[2 * at + 1]].map(i => d.t[i]).join(' - '); };
  const bname = b => ui === 'ar' ? (b.ar || b.ur) : LTR() ? b.en : b.ur;
  const fmtN = n => ui === 'en' ? Number(n).toLocaleString('en-US') : NUM(n);
  // chosen translation language for these books
  // each interface language keeps its own choice; by default the translation in that language, none for Arabic
  const getLang = b => { let l = null; try { l = localStorage['clang_' + ui]; } catch (e) {} if (l === 'none') return null; if (!l) { if (ui === 'ar' || !b.langs.includes(ui)) return null; l = ui; } return b.langs.includes(l) ? l : (b.langs.find(x => x !== 'ar') || null); };
  const setLang = l => { try { localStorage['clang_' + ui] = l || 'none'; } catch (e) {} };
  const LNAME = {ur: 'اردو', en: 'English', bn: 'বাংলা', hi: 'हिन्दी', gu: 'ગુજરાતી', fr: 'Français'};

  function langChips(b, redraw) {
    const cur = getLang(b), box = el('div', {class: 'chips'});
    if (b.langs.length < 2) return box;
    box.append(el('button', {class: 'chip' + (!cur ? ' on' : ''), type: 'button', on: {click: () => { setLang(null); redraw(); }}}, T('cOnlyAr')));
    b.langs.filter(l => l !== 'ar').forEach(l => box.append(el('button', {class: 'chip' + (cur === l ? ' on' : ''), type: 'button', on: {click: () => { setLang(l); redraw(); }}}, LNAME[l] || l)));
    return box;
  }
  // small tab with the translator's name above a translation: «ترجمہ: name» (book.trn = {lang: name})
  const TRL = {ur: 'ترجمہ', ar: 'ترجمة', en: 'Translation', bn: 'অনুবাদ', hi: 'अनुवाद', gu: 'અનુવાદ', fr: 'Traduction'};
  const trTab = (b, L) => { const nm = b.trn && (b.trn[L] || b.trn.ur); return nm ? el('div', {class: 'trtab', lang: L, dir: DIR(L)}, el('span', {}, (TRL[L] || TRL.en) + ': ' + nm)) : ''; };
  // a hadith object shaped like the app's own, so copy / share / listen / bookmark work the same way
  function hobj(b, n, lang) {
    const a = row(b, 'ar', n), t = lang ? row(b, lang, n) : null, e = row(b, 'en', n);
    return {num: n, sanad: '', matn: [a ? a[1] : ''], grade: b.parts ? ((t && t[2]) || (a && a[2]) || '') : ((e && e[2]) || (t && t[2]) || (a && a[2]) || ''), content: t ? {translation: {[lang]: [t[1]]}} : {},
      part_en: bname(b), chapter_en: '', takhrij_en: ''};
  }
  // search hits in red (like the Quran search): wrap whole words that match a query word (also with ال / و in front)
  function markHits(node, q) {
    const ok = w => { const x = norm(w); return !!x && q.some(t => x === t || x === 'ال' + t || x === 'و' + t); };
    const tw = document.createTreeWalker(node, NodeFilter.SHOW_TEXT), list = [];
    while (tw.nextNode()) list.push(tw.currentNode);
    list.forEach(t => { const parts = t.nodeValue.split(/(\s+)/); if (!parts.some(p => p.trim() && ok(p))) return;
      const f = document.createDocumentFragment();
      parts.forEach(p => f.append(p.trim() && ok(p) ? el('mark', {class: 'qhit'}, p) : p)); t.replaceWith(f); });
  }
  // the compiler's footer; an Arabic line (with harakat) in the Arabic font
  window.footEl = foot => el('div', {class: 'shfoot', lang: 'ur', dir: 'rtl'}, ...foot.split('\n').map(x => /[\u064b-\u0652]/.test(x) ? el('p', {class: 'far', lang: 'ar'}, x) : el('p', {}, x)));
  const footOf = (b, n) => { const k = b.foot ? (b.kind ? b.kind[n - 1] : b.footAll) : null; return (k && b.foot[k]) || ''; };
  const secT = (b, s) => { const x = (b.secL && b.secL[ui] && b.secL[ui][s[0] - 1]) || s[1];
    if (ui === 'ar' && /[A-Za-z]/.test(x)) { const d = C.ch[b.key]; if (d && d.s && d.s[s[0]] != null) return d.t[d.s[s[0]]]; }   // no English in the Arabic interface: the book's own Arabic kitab name
    return x; };
  const RNG = b => b.key === 'shadharat' || b.key === 'siyar' ? (x, y) => T(b.key === 'siyar' ? 'cParaNo' : 'cNasNo')(x === y ? fmtN(x) : fmtN(x) + '–' + fmtN(y))
    // books from al-Jami al-Kamil: the book's own printed numbers (the notes between them have none)
    : b.jami ? (x, y) => { const p = []; for (let k = x; k <= y; k++) if (!(b.nn && b.nn[k])) p.push(+(b.an[k] || k)); return p.length ? T('range')(Math.min(...p), Math.max(...p)) : ''; }
    : T('range');
  const CNT = b => T(b.key === 'shadharat' ? 'cNas' : b.key === 'siyar' ? 'cPara' : 'count');
  const HN = (b, x, y) => { let c = 0; for (let k = x; k <= y; k++) if (!(b.nn && b.nn[k])) c++; return c; };
  const subOf = b => b.sub ? (b.sub[ui] || (ui === 'ur' ? b.sub.ur : (b.sub.en || b.sub.ur))) : '';
  // ===== «شروح» under a hadith: the commentary on its chapter (bab) from the commentary books, matched at build time (coll/shmap_<book>.js = [first hadith no, first row, last row] per chapter) =====
  C.shm = {}; window.SHMAP = (k, m) => { C.shm[k] = m; };
  const SHT = new Set(['bukhari', 'abudawud', 'ibnmajah', 'malik', 'tirmidhi']);
  const needShm = k => C.shm[k] ? Promise.resolve() : (C.loading['shm_' + k] || (C.loading['shm_' + k] = load('coll/shmap_' + k + '.js').catch(() => { C.shm[k] = {}; })));
  const shFind = (tk, sk, n) => { const a = C.shm[tk] && C.shm[tk][sk]; if (!a) return null; let lo = 0, hi = a.length / 3 - 1, at = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (a[3 * m] <= n) { at = m; lo = m + 1; } else hi = m - 1; }
    return at < 0 || a[3 * at + 1] < 0 ? null : [a[3 * at + 1], a[3 * at + 2]]; };
  const SH_SHORT = 900, SH_CAP = 24000;
  // pairs: [[target book key, hadith no, label]] -> a «شروح» box (null when there is no commentary)
  async function shBox(pairs) {
    const groups = [];
    for (const [tk, n, label] of pairs) {
      if (!SHT.has(tk) || !n) continue;
      await needShm(tk);
      const m = C.shm[tk] || {}, hits = Object.keys(m).map(sk => [bookOf(sk), shFind(tk, sk, n)]).filter(x => x[0] && x[1]);
      if (hits.length) groups.push([label, hits]);
    }
    if (!groups.length) return null;
    const total = groups.reduce((s, g) => s + g[1].length, 0);
    const box = el('details', {class: 'shbox'}, el('summary', {}, el('span', {}, T('sxTitle')), el('span', {class: 'shn'}, fmtN(total))));
    let done = false;
    box.addEventListener('toggle', async () => {
      if (!box.open || done) return; done = true;
      const body = el('div', {class: 'shbody'}, el('p', {class: 'cs'}, T('loading') || '…')); box.append(body);
      const drawItem = ([sb, r1, cut, txt]) => {
        const au = sb.author && (ui === 'ar' ? sb.author[1] : ui === 'ur' ? sb.author[2] : sb.author[3]);
        const full = el('div', {class: 'shtx ar', lang: 'ar', dir: 'rtl'}, ...txt.split('\n').filter(x => x.trim()).map(x => paraEl(x, 'ar')));
        const shortTxt = txt.length > SH_SHORT ? txt.slice(0, SH_SHORT).replace(/\s+\S*$/, '') + ' …' : txt;
        const sh = el('div', {class: 'shtx ar', lang: 'ar', dir: 'rtl'}, ...shortTxt.split('\n').filter(x => x.trim()).map(x => paraEl(x, 'ar')));
        const more = txt.length > SH_SHORT ? el('button', {class: 'btn shmore', type: 'button'}, T('sxMore')) : null;
        let open = false;
        if (more) more.addEventListener('click', () => { open = !open; wrap.replaceChildren(head, open ? full : sh, tools); more.textContent = T(open ? 'sxLess' : 'sxMore'); });
        const head = el('div', {class: 'shhead'}, el('a', {class: 'shname ar', lang: 'ar', dir: 'rtl', href: '#/s/' + sb.key + '/n/' + r1}, sb.ar), au ? el('span', {class: 'cs'}, ' — ' + au) : '');
        const tools = el('div', {class: 'shtools'}, more || '', el('a', {class: 'btn', href: '#/s/' + sb.key + '/n/' + r1}, T('sxOpen')));
        const wrap = el('div', {class: 'shitem'}, head, sh, tools);
        return wrap;
      };
      const parts = await Promise.all(groups.map(async ([label, hits]) => {
        const items = await Promise.all(hits.map(async ([sb, [r1, r2]]) => {
          try {
            await needRange(sb, 'ar', r1, Math.min(r2, r1 + 60));
            let txt = '', last = r1;
            for (let i = r1; i <= r2 && txt.length < SH_CAP; i++) { const r = row(sb, 'ar', i); if (!r) break; txt += (txt ? '\n' : '') + r[1]; last = i; }
            return [sb, r1, last < r2 || txt.length >= SH_CAP, txt.trim()];
          } catch (e) { return [sb, r1, false, '']; }
        }));
        return [label ? el('h4', {class: 'shgrp'}, label) : '', ...items.map(drawItem)];
      }));
      body.replaceChildren(...parts.flat());
    });
    return box;
  }
  window.COLL_SH = {
    // for the refs of an al-Jami al-Kamil hadith: [{key, n}] -> box
    forRefs: async refs => { try { await index(); const pairs = [];
        for (const r of (refs || [])) { if (!SHT.has(r.key)) continue; const n = r.n || ((C.rev || {})[r.key] || {})[r.number] || +r.number; if (n) pairs.push([r.key, +n, (bookOf(r.key) ? bookOf(r.key).ar : r.key) + ' (' + fmtN(r.number) + ')']); }
        return await shBox(pairs); } catch (e) { return null; } }
  };
  function shPanel(b, n, c, acts) {
    if (!SHT.has(b.key)) return;
    shBox([[b.key, n, '']]).then(box => { if (box) c.insertBefore(box, acts); }).catch(() => {});
  }
  function card(b, n, lang, q) {
    if (b.atraf) { // فہرس الأطراف: the text and each number open the hadith of al-Jami al-Kamil
      const r = row(b, 'ar', n) || [], nums = String(r[2] || '').split(',').filter(Boolean), c = el('article', {class: 'card atraf'});
      c.append(el('a', {class: 'mt ar atx', lang: 'ar', dir: 'rtl', href: '#/h/' + nums[0], style: 'display:block;text-decoration:none;color:inherit'}, ...rich(r[1] || '', 'ar')),
        el('div', {class: 'atn'}, ...nums.map(x => el('a', {class: 'btn', href: '#/h/' + x}, fmtN(+x)))));
      return c;
    }
    const d = hobj(b, n, lang), c = el('article', {class: 'card'});
    // Arabic library books (turath.io) show the book's own printed number; the others show the app number and the printed one beside it
    const own = b.grp === 'ar' || !!b.jami, pn = b.an[n] || n;
    const mus = (b.key === 'muslim' || b.abno) && b.an[n] && !(b.nn && b.nn[n]);
    const printed = mus ? el('span', {class: 'cs'}, '  (' + ({ur: 'ترقیم عبد الباقی: ' + fmtN(pn) + ' ، عام نمبر: ' + fmtN(n), ar: 'ترقيم عبد الباقي: ' + fmtN(pn) + ' ، الرقم العام: ' + fmtN(n), en: 'Abd al-Baqi numbering: ' + fmtN(pn) + ', general number: ' + fmtN(n),
      bn: 'আব্দুল বাকীর নম্বর: ' + fmtN(pn) + ', সাধারণ নম্বর: ' + fmtN(n), hi: 'अब्दुल बाक़ी क्रमांक: ' + fmtN(pn) + ', सामान्य क्रमांक: ' + fmtN(n), gu: 'અબ્દુલ બાકી ક્રમાંક: ' + fmtN(pn) + ', સામાન્ય ક્રમાંક: ' + fmtN(n),
      fr: 'Numérotation d’Abd al-Baqi : ' + fmtN(pn) + ', numéro général : ' + fmtN(n)}[ui] || ('Abd al-Baqi: ' + fmtN(pn) + ' / ' + fmtN(n))) + ')')
      : !own && b.an[n] && String(b.an[n]) !== String(n) ? el('span', {class: 'cs'}, '، ' + T('cPrinted')(b.an[n])) : null;
    // a note of the book (text between the hadith, e.g. in the Seerah) has no number: a small star instead
    const note = b.nn && b.nn[n];
    if (b.bab && b.bab[n]) c.append(el('div', {class: 'babbox ar', lang: 'ar', dir: 'rtl'}, b.bab[n]));
    else { const cs = chapStr(b, n); if (cs) c.append(el('div', {class: 'babbox ar', lang: 'ar', dir: 'rtl'}, cs)); }
    c.append(el('div', {class: 'top'}, el('a', {class: 'big' + (note ? ' qnote' : ''), href: '#/s/' + b.key + '/n/' + n, style: 'text-decoration:none'}, note ? '٭' : fmtN(own && !b.abno ? pn : n)), printed,
      b.jami && b.jami[n] ? el('a', {class: 'btn', href: '#/h/' + b.jami[n], style: 'margin-inline-start:auto'}, T('cJami')(fmtN(b.jami[n]))) : null));
    const arParas = (d.matn[0] || '').split('\n').filter(t => t.trim());
    const rjx = RJ_STRUCT.includes(b.key) ? rjParse(d.matn[0] || '') : null;
    if (rjx) c.append(rjBlock(rjx));
    else if (arParas.length) c.append(el('div', {class: 'mt ar', lang: 'ar'}, ...arParas.map(t => paraEl(t, 'ar'))));
    if (arParas.length && !RJ_LIB.includes(b.key) && b.key !== 'shamail') { const sn = sanadNames(arParas.join(' '));
      if (sn.length > 1) { const chipEls = sn.map((x, i) => el('a', {class: 'btn', lang: 'ar', dir: 'rtl', href: '#/s/rijal?q=' + encodeURIComponent(x.q) + rjCtx([sn[i - 1], sn[i + 1]].filter(Boolean).map(y => y.q))}, x.d));
        c.append(el('details', {class: 'rjsanad'}, el('summary', {}, rt('sanad') + ' (' + fmtN(sn.length) + ')'), el('p', {class: 'cs'}, rt('sanadHint')), el('div', {class: 'chips'}, ...chipEls)));
        if (window.NAR && NAR.linkChips) NAR.linkChips(b.key, n, sn.map(x => x.q), chipEls); } }
    // grade / takhrij (e.g. «صحیح: رواہ البخاری ...») right below the Arabic hadith
    // a source reference with a link to the book (row[3] = [book, number]; a book kept in the other link opens there)
    const src0 = (row(b, 'ar', n) || [])[3], src = Array.isArray(src0) ? src0 : null; let sref = null;
    if (src && d.grade) { const sb = bookOf(src[0]), h = '#/s/' + src[0] + '/n/' + src[1];
      sref = (el('p', {class: 'cs sref', lang: 'ar', dir: 'rtl'}, el('a', sb && sb.ext ? {href: sb.ext + h, target: '_blank', rel: 'noopener'} : {href: h}, '(' + d.grade + ')'))); }
    else if (d.grade) c.append(/[\u0621-\u064a]/.test(d.grade) && !/[ٹڈڑںےۓ]/.test(d.grade) ? el('p', {class: 'cs agrade', lang: 'ar', dir: 'rtl'}, d.grade) : el('p', {class: 'cs'}, T('cGrade') + ': ' + d.grade));
    if (b.parts) {
      // متفرق احادیث: translation, explanation (شرح) and benefits (فوائد), each under its own heading, in the chosen language
      // (with no language chosen: the Arabic explanation and benefits)
      const L = lang || 'ar', rr = row(b, L, n), x = rr && rr[3] && !Array.isArray(rr[3]) ? rr[3] : null;
      const H = k => el('h4', {class: 'phead'}, T(k));
      const P = t => paraEl(t, L);
      if (lang && !rr) c.append(el('p', {class: 'note'}, T('cLangMissing')));
      if (x && x.t) c.insertBefore(el('p', {class: 'ptitle ' + L, lang: L, dir: DIR(L)}, x.t), c.children[1]);
      if (lang && rr) c.append(H('pTr'), trTab(b, L), el('div', {class: 'tr'}, ...rr[1].split('\n').filter(t => t.trim()).map(P)));
      if (x && x.k) c.append(H('pTakh'), el('div', {class: 'tr ptakh', lang: L, dir: DIR(L)}, ...x.k.split('\n').filter(t => t.trim()).map(P)));
      // explanation and benefits in the chosen language; when that translation has none, the Arabic ones
      const ra = (row(b, 'ar', n) || [])[3] || {}, part = k => x && x[k] ? [x[k], L] : ra[k] ? [ra[k], 'ar'] : null;
      const PL = (t, l) => paraEl(t, l);
      const ex = part('e'), bf = part('b');
      if (ex) c.append(H('pExpl'), el('div', {class: 'tr'}, ...ex[0].split('\n').filter(t => t.trim()).map(t => PL(t, ex[1]))));
      if (bf) c.append(H('pBen'), el('ol', {class: 'tr pben', dir: DIR(bf[1])}, ...bf[0].split('\n').filter(t => t.trim()).map(t => el('li', {class: bf[1], lang: bf[1]}, ...rich(t, bf[1])))));
    }
    else if (lang && d.content.translation) c.append(el('div', {class: 'tr'}, ...d.content.translation[lang][0].split('\n').filter(x => x.trim()).map(x => paraEl(x, lang))));
    else if (lang) c.append(el('p', {class: 'note'}, T('cLangMissing')));
    // footer of the compiler under each item (شذرات الذهب: Sahaba / Salaf; Fazail as-Sahaba: Sahaba)
    const foot = footOf(b, n);
    if (sref) c.append(sref);
    if (foot) c.append(footEl(foot));
    // books taken from al-Jami al-Kamil (Seerah, Fazail-e-Sahaba ...): the takhrij of al-Jami, as on its own page —
    // a button for each source book and «compare with its sources»
    if (b.jami && b.jami[n] && window.refBlock) { const tb = el('div', {class: 'jtk'}); c.append(tb);
      api('hadith/' + b.jami[n] + '?book=jami').then(j => { if (j && !j.error) tb.append(...refBlock(j)); }).catch(() => {}); }
    if (q && q.length) c.querySelectorAll('.mt, .tr').forEach(x => markHits(x, q));
    // actions: bookmark (stored as c:<book>), copy, share, listen
    const scope = 'c:' + b.key, acts = el('div', {class: 'acts'});
    const bm = el('button', {class: 'ab', type: 'button', 'aria-label': T('bookmark'), title: T('bookmark')});
    const paint = () => { bm.replaceChildren(icon(bmHas(scope, n) ? 'bm1' : 'bm0')); bm.classList.toggle('on', bmHas(scope, n)); };
    bm.addEventListener('click', () => { bmToggle(scope, n); paint(); }); paint();
    const xr = b.parts ? (row(b, lang || 'ar', n) || [])[3] : null, xpart = xr && !Array.isArray(xr) ? [xr.e ? T('pExpl') + ':\n' + xr.e : '', xr.b ? T('pBen') + ':\n' + xr.b : ''].filter(Boolean).join('\n\n') : '';
    const text = () => [bname(b) + (note ? '' : ' — ' + n + (b.an[n] ? ' (' + b.an[n] + ')' : '')), '', d.matn[0], '', lang && d.content.translation ? d.content.translation[lang][0] : '', d.grade ? '\n' + d.grade : '', xpart ? '\n' + xpart : '', foot ? '\n' + foot : ''].join('\n').replace(/^§\s*/gm, '').trim();
    acts.append(bm, window.CMP ? CMP.button({k: b.key, n}) : '',
      el('button', {class: 'ab', type: 'button', title: T('listen'), 'aria-label': T('listen'), on: {click: () => LISTEN.playHadiths([{d, node: c}])}}, icon('listen')),
      el('button', {class: 'ab', type: 'button', title: T('poster'), 'aria-label': T('poster'), on: {click: () => {
        const strip = x => (x || '').replace(/[\ue000-\ue009]|\ue010[^\ue011]*\ue011/g, '').replace(/<[^>]*>/g, '').replace(/^§\s*/gm, '').trim();
        const tr = {}; ['ur', 'en', 'bn', 'hi', 'gu', 'fr', 'pa'].forEach(l => { const r = row(b, l, n); if (r && r[1] && !(l === 'ar')) tr[l] = strip(r[1]); });
        const jn = b.jami && b.jami[n], g0 = (d.grade || '').trim(), gm = g0.match(/^([^:：]{2,30})[:：]/), gs = gm ? gm[1].trim() : (g0.length <= 30 ? g0 : '');
        const jname = ui === 'ar' ? 'الجامع الكامل' : LTR() ? 'al-Jami al-Kamil' : 'الجامع الکامل';
        POSTER.open({kind: 'hadith', ar: strip(d.matn[0]).replace(/ﷺ/g, 'صلى الله عليه وسلم'), tr, lang: lang || ui, grade: gs, ref: jn ? jname + '(' + jn + ') ' + bname(b) : bname(b) + (note ? '' : ' (' + n + ')'), name: b.key + '-' + n}); }}}, icon('poster')),
      el('button', {class: 'ab', type: 'button', title: T('copy'), 'aria-label': T('copy'), on: {click: async () => toast(T(await copyText(withLink(text(), '#/s/' + b.key + '/n/' + n)) ? 'copied' : 'copyfail'))}}, icon('copy')),
      el('button', {class: 'ab', type: 'button', title: T('share'), 'aria-label': T('share'), on: {click: async () => { const t = withLink(text(), '#/s/' + b.key + '/n/' + n); if (navigator.share) { try { await navigator.share({text: t}); return; } catch (e) { if (e && e.name === 'AbortError') return; } } toast(T(await copyText(t) ? 'shared' : 'copyfail')); }}}, icon('share')),
      el('span', {class: 'sp'}));
    c.append(acts);
    shPanel(b, n, c, acts);
    return c;
  }

  const norm = s => (s || '').normalize('NFKD').replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/[ىی]/g, 'ي').replace(/[ةۃ]/g, 'ه').replace(/ک/g, 'ك')
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ').toLowerCase().replace(/\s+/g, ' ').trim();
  async function showBook(b) {
    const box = $('#list'); box.replaceChildren(); await needChap(b);
    bar(bname(b), (subOf(b) ? subOf(b) + ' — ' : '') + CNT(b)(fmtN(b.count)), true);
    // a book whose Urdu translation lives on another site: credit + links (b.ref = {ur, en, ar: [text, credit], u: [[label, url], ...]})
    const refCard = () => { const r = b.ref; if (!r) return []; const t = r[ui] || r.ur, L = DIR(ui) === 'rtl' ? ui : ui;
      return [el('div', {class: 'card refcard', lang: ui === 'ar' ? 'ar' : 'ur', dir: 'rtl'}, el('p', {class: 'reflinks'}, t[0], ' ', ...r.u.map(([l, u]) => el('a', {href: u, target: '_blank', rel: 'noopener'}, l))))]; };
    box.append(...refCard());
    const f = el('input', {type: 'search', class: 'filter', placeholder: T('cSecSearch'), 'aria-label': T('cSecSearch'), id: 'csearch'});
    const out = el('div');
    const HD = {}; (b.heads || []).forEach(h => { HD[h[0]] = h; });
    const intro = () => ((b.introL && (b.introL[ui] || b.introL.en)) || b.intro || []).map(([t, ps]) => el('details', {class: 'card intro'}, el('summary', {}, t), ...ps.map(p => paraEl(p, (b.introL && (b.introL[ui] || b.introL.en)) ? (b.introL[ui] ? ui : 'en') : 'ur'))));
    // audio of the whole book, played from its publisher's own link (not copied here); more parts are added to the list
    const BA = {};   // (the old Bukhari audio links were removed: the complete recording is now in Audio Books → Arabic)
    const bookAudio = () => { const rs = BA[b.key]; if (!rs) return [];
      const ti = {ur: 'آڈیو', ar: 'الصوتيات', en: 'Audio', bn: 'অডিও', hi: 'ऑडियो', gu: 'ઑડિયો', fr: 'Audio'}[ui] || 'Audio', pt = n => ({ur: 'حصہ ', ar: 'الجزء ', en: 'Part ', bn: 'অংশ ', hi: 'भाग ', gu: 'ભાગ ', fr: 'Partie '}[ui] || 'Part ') + fmtN(n);
      const rd = n => ({ur: 'قراءت ', ar: 'القراءة ', en: 'Recitation ', bn: 'পাঠ ', hi: 'पाठ ', gu: 'પાઠ ', fr: 'Lecture '}[ui] || 'Recitation ') + fmtN(n);
      const only = {ur: 'صرف عربی', ar: 'عربي فقط', en: 'Arabic only', bn: 'শুধু আরবি', hi: 'केवल अरबी', gu: 'ફક્ત અરબી', fr: 'Arabe seulement'}[ui] || 'Arabic only';
      const src = h => ({ur: 'ماخذ: ' + h + ' — آڈیو اسی سائٹ کے لنک سے چلتی ہے۔', ar: 'المصدر: ' + h + ' — تُشغَّل المادة من رابط الموقع نفسه.', en: 'Source: ' + h + ' — played from the publisher’s own link.', bn: 'উৎস: ' + h + ' — অডিও ওই সাইটের নিজস্ব লিংক থেকেই চলে।', hi: 'स्रोत: ' + h + ' — ऑडियो उसी साइट के अपने लिंक से चलता है।', gu: 'સ્રોત: ' + h + ' — ઑડિયો એ જ સાઇટની પોતાની લિંકથી ચાલે છે.', fr: 'Source : ' + h + ' — l’audio est lu depuis le lien du site lui-même.'}[ui] || 'Source: ' + h);
      return [el('details', {class: 'card intro', open: true}, el('summary', {}, ti + ' — ' + bname(b) + ' (' + only + ')'),
        ...rs.flatMap((r, ri) => [rs.length > 1 ? el('p', {class: 'grp'}, rd(ri + 1)) : '',
          ...r.parts.map((u, i) => el('div', {style: 'margin:.5rem 0'}, el('div', {class: 'cs'}, pt(i + 1)), el('audio', {controls: true, preload: 'none', src: u, style: 'width:100%', dir: 'ltr'}))),
          el('p', {class: 'cs'}, src(r.host))]))]; };
    const cover = () => bookAudio().concat(b.cover ? [el('img', {src: b.cover, class: 'bcover', alt: bname(b)})] : []);
    const row = s => el('a', {class: 'card srow2', href: '#/s/' + b.key + '/' + s[0]},
      el('span', {class: 'snum'}, fmtN(s[0])), el('span', {class: 'sinfo'}, el('span', {class: 'ct', dir: 'auto'}, secT(b, s)), s[4] ? el('span', {class: 'ca', lang: 'ar'}, s[4]) : '', el('span', {class: 'cs'}, [RNG(b)(s[2], s[3]), CNT(b)(fmtN(HN(b, s[2], s[3])))].filter(Boolean).join('  ،  '))));
    // books with group headings (فضائل صحابہ): each heading opens only its own babs
    const grouped = () => {
      const hs = b.heads, boxes = [];
      hs.forEach((h, i) => {
        const to = i + 1 < hs.length ? hs[i + 1][0] : Infinity, mine = b.sections.filter(s => s[0] >= h[0] && s[0] < to);
        const n = mine.reduce((a, s) => a + HN(b, s[2], s[3]), 0);
        const d = el('details', {class: 'card grpbox'}, el('summary', {}, el('span', {class: 'gt'}, (b.headsL && b.headsL[ui] && b.headsL[ui][i]) || h[1]), h[2] ? el('span', {class: 'ca', lang: 'ar'}, h[2]) : '', el('span', {class: 'cs'}, CNT(b)(fmtN(n)) + '، ' + fmtN(mine.length) + ' ' + T(b.key === 'shadharat' || b.key === 'siyar' ? 'cPeople' : 'cBabs'))));
        let filled = false;
        d.addEventListener('toggle', () => { if (d.open && !filled) { d.append(...mine.map(row)); filled = true; } if (d.open) try { localStorage['g:' + b.key] = i; } catch (e) {} });
        boxes.push(d);
      });
      let last = null; try { last = localStorage['g:' + b.key]; } catch (e) {}
      if (last != null && boxes[+last]) boxes[+last].open = true;
      return boxes;
    };
    // the Salaf book: the total number of persons so far, at the top
    const totalLine = () => {
      if (b.key !== 'siyar') return [];
      const L = {ur: ['کل شخصیات', 'پیراگراف'], ar: ['إجمالي الشخصيات', 'الفقرات'], en: ['Total persons', 'paragraphs'], bn: ['মোট ব্যক্তিত্ব', 'অনুচ্ছেদ'], hi: ['कुल व्यक्तित्व', 'अनुच्छेद'], gu: ['કુલ વ્યક્તિઓ', 'પરિચ્છેદ'], fr: ['Total des personnes', 'paragraphes']}[ui] || ['Total persons', 'paragraphs'];
      return [el('p', {class: 'card', style: 'text-align:center;font-weight:700;margin:.4rem 0;padding:.5rem'}, L[0] + ': ' + fmtN(b.sections.length) + '  ·  ' + L[1] + ': ' + fmtN(b.count))];
    };
    const secs = () => { if (b.heads && b.heads.length) return out.replaceChildren(...cover(), ...totalLine(), ...intro(), ...grouped());
      out.replaceChildren(...cover(), ...intro(), ...b.sections.flatMap(s => (HD[s[0]] ? [el('h3', {class: 'grp hbgrp'}, HD[s[0]][1], HD[s[0]][2] ? el('small', {class: 'ca', lang: 'ar', style: 'display:block'}, HD[s[0]][2]) : '')] : []).concat(el('a', {class: 'card srow2', href: '#/s/' + b.key + '/' + s[0]},
      el('span', {class: 'snum'}, fmtN(s[0])), el('span', {class: 'sinfo'}, el('span', {class: 'ct', dir: 'auto'}, secT(b, s)), s[4] ? el('span', {class: 'ca', lang: 'ar'}, s[4]) : '', el('span', {class: 'cs'}, [RNG(b)(s[2], s[3]), CNT(b)(fmtN(HN(b, s[2], s[3])))].filter(Boolean).join('  ،  '))))))); };
    let tm;
    const run = async () => {
      const v = f.value.trim(), num = toNum(v);
      if (!v) return secs();
      if (num != null) {
        const n = b.an && Object.keys(b.an).length && C.rev[b.key][num] ? C.rev[b.key][num] : num;
        out.replaceChildren(el('p', {class: 'note'}, T('loading')));
        const lang = getLang(b); await needRange(b, 'ar', n, n); if (lang) await needRange(b, lang, n, n);
        out.replaceChildren(row(b, 'ar', n) ? card(b, n, lang) : el('p', {class: 'note'}, T('cNotHere')));
        if (n !== num && row(b, 'ar', num)) out.append(card(b, num, lang));
        return;
      }
      const q = norm(v.replace(/[&+،,]/g, ' ')).split(' ').filter(Boolean); if (!q.length) return secs();
      out.replaceChildren(el('p', {class: 'note'}, T('loading')));
      const lang = getLang(b), hits = await findIn(b, q, lang);
      out.replaceChildren(el('div', {class: 'qsbar'}, el('span', {class: 'cs'}, T('results') + ': ' + fmtN(hits.length))));
      let shown = 0; const more = el('button', {class: 'btn more', type: 'button'}, T('more'));
      const add = () => { hits.slice(shown, shown + 30).forEach((n, i) => { const c = card(b, n, lang, q); c.prepend(el('span', {class: 'rno'}, fmtN(shown + i + 1) + '.')); out.insertBefore(c, more); }); shown += 30; if (shown >= hits.length) more.remove(); };
      out.append(more); more.addEventListener('click', add); add();
    };
    f.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(run, 350); });
    const startBtn = b.sections && b.sections.length ? el('a', {class: 'btn lbtn readstart', href: '#/s/' + b.key + '/' + b.sections[0][0]}, icon('read'), ' ', T('readStart')) : '';
    box.append(langChips(b, () => showBook(b)), startBtn, el('div', {class: 'card pad0 filterbox'}, icon('search'), f), out, el('p', {class: 'note'}, b.key === 'shadharat' ? T('cSourceSh') : b.key === 'siyar' ? T('cSourceSiyar') : b.jami ? T('cSourceJami') : b.grp === 'ar' ? T('cSourceAr') : T('cSource')));
    secs();
  }
  // all-words search in one book (Arabic text and the chosen translation); q = normalised words
  // search modes of the two search pages: 'exact' = the words together, in this order · 'all' = all words, any order · 'similar' = any of the words
  const GSMODE = () => { try { return localStorage.gsmode || 'exact'; } catch (e) { return 'exact'; } };
  const swd = x => x.replace(/^(?:وال|فال|بال|لل|ال|و|ف)(?=.{2,})/, '');
  const phraseIn = (t, q) => { const T = norm(t).split(' '), Q = q.map(swd); if (Q.length === 1) return T.some(x => x === q[0] || swd(x) === Q[0]);
    for (let i = 0; i + Q.length <= T.length; i++) { let ok = true; for (let j = 0; j < Q.length; j++) if (swd(T[i + j]) !== Q[j]) { ok = false; break; } if (ok) return true; } return false; };
  const allIn = (t, q) => { const w = ' ' + norm(t) + ' '; return q.every(x => w.includes(' ' + x + ' ') || w.includes(' ال' + x + ' ') || w.includes(' و' + x + ' ')); };
  const anyIn = (t, q) => { const w = ' ' + norm(t) + ' '; return q.some(x => w.includes(' ' + x + ' ') || w.includes(' ال' + x + ' ') || w.includes(' و' + x + ' ')); };
  const modeTest = (mode, q) => q.length < 2 ? (t => allIn(t, q)) : mode === 'exact' ? (t => phraseIn(t, q)) : mode === 'similar' ? (t => anyIn(t, q)) : (t => allIn(t, q));
  const modeBar = redo => { const box = el('div', {class: 'seg gsmode', role: 'group'});
    const draw = () => box.replaceChildren(...[['exact', T('mExact')], ['all', T('mAll')], ['similar', T('mSimilar')]].map(([k, l]) => el('button', {type: 'button', class: 'segb', 'aria-pressed': String(k === GSMODE()), on: {click: () => { try { localStorage.gsmode = k; } catch (e) {} draw(); redo(); }}}, l)));
    draw(); return box; };
  async function findIn(b, q, lang, mode) {
    await needAll(b, 'ar'); if (lang) await needAll(b, lang);
    const hits = [], test = modeTest(mode || 'all', q);
    for (const [n, r] of C.data[b.key + '|ar'] || []) { const tr = lang ? row(b, lang, n) : null; if (test(r[1]) || (tr && test(tr[1]))) hits.push(n); }
    return hits;
  }
  /* ---------- the search of the two search pages (the books of this site): the word index narrows down the books, the text is read only
     where needed, the first hits of each book appear at once and nothing blocks the page ---------- */
  const SKIP = new Set(['seerah', 'fazail', 'shadharat', 'siyar', 'tuhfa']);   // not part of this search
  const tick = () => new Promise(r => setTimeout(r, 0));
  async function rbBook(key) {
    const bid = +key.slice(2); let K = null; try { K = await window.RB.catalog(); } catch (e) {}
    const r = K && K.m.get(bid); if (!r) return null; const a = r[3] && K.a[r[3]];
    return {key, rb: true, bid, ar: r[1], ur: r[1], en: r[1], count: r[4], langs: ['ar'], au: a ? [a[0]] : null};
  }
  // the hits of one book, found as needed: pool.fill(n) checks the candidates until n hits are found (or none is left)
  function makePool(b, ns, lang, words, md) {
    const test = modeTest(md, words), multi = md === 'exact' && words.length > 1;
    const p = {b, ok: [], pos: 0, more: true, total: null};
    if (ns && !multi) { p.ok = ns.slice(); p.more = false; p.total = ns.length; return p; }
    p.fill = async target => {
      if (p.busy) return; p.busy = true;
      try {
        while (p.more && p.ok.length < target) {
          if (!ns) {      // every row of the book: text and translation (an interface language other than Arabic)
            if (!p.rows) { await needAll(b, 'ar'); if (lang) await needAll(b, lang); p.rows = [...(C.data[b.key + '|ar'] || new Map()).keys()]; }
            const part = p.rows.slice(p.pos, p.pos + 1500); p.pos += part.length;
            for (const n of part) { const r = row(b, 'ar', n), tr = lang ? row(b, lang, n) : null; if ((r && test(r[1])) || (tr && test(tr[1]))) p.ok.push(n); }
            if (p.pos >= p.rows.length) p.more = false;
          } else if (b.rb) {
            const part = ns.slice(p.pos, p.pos + 24); p.pos += part.length;
            const hs = await Promise.all(part.map(n => window.RB.hit(b.bid, n).catch(() => null)));
            part.forEach((n, i) => { if (hs[i] && test(hs[i].text)) p.ok.push(n); });
            if (p.pos >= ns.length) p.more = false;
          } else {
            const part = ns.slice(p.pos, p.pos + 40); p.pos += part.length;
            await needRange(b, 'ar', part[0], part[part.length - 1]);
            for (const n of part) { const r = row(b, 'ar', n); if (r && test(r[1])) p.ok.push(n); }
            if (p.pos >= ns.length) p.more = false;
          }
          await tick();
        }
      } finally { p.busy = false; }
    };
    return p;
  }
  // one result box: the book's name, the number of hits, 20 hits at a time
  function hitSection(name, p, b, lang, words, items) {
    const cnt = el('span', {class: 'cs'}), sec = el('details', {class: 'card gsres'}, el('summary', {}, name, ' ', cnt));
    const more = el('button', {class: 'btn more', type: 'button'}, T('more')); let shown = 0, busy = false;
    const total = () => items ? items.length : p.total != null ? p.total : p.ok.length;
    const label = () => { cnt.textContent = T('results') + ': ' + fmtN(total()) + (!items && p.more ? '+' : ''); };
    const add = async () => {
      if (busy) return; busy = true; more.disabled = true;
      try {
        if (!items && p.fill) await p.fill(shown + 20);
        const n = items ? items.length : p.ok.length, end = Math.min(shown + 20, n);
        let nodes = [];
        if (items) nodes = items.slice(shown, end).map(f => f());
        else if (b.rb) { const part = p.ok.slice(shown, end), hs = await Promise.all(part.map(x => window.RB.hit(b.bid, x).catch(() => null))); nodes = part.map((x, i) => hs[i] ? window.RB.hitCard(b.bid, x, hs[i]) : null); }
        else { const part = p.ok.slice(shown, end); if (part.length) { await needRange(b, 'ar', part[0], part[part.length - 1]); if (lang) await needRange(b, lang, part[0], part[part.length - 1]); } nodes = part.map(x => card(b, x, lang, words)); }
        nodes.forEach((c, i) => { if (c) { c.prepend(el('span', {class: 'rno'}, fmtN(shown + i + 1) + '.')); sec.insertBefore(c, more); } });
        shown = end; label();
        if (shown >= total() && (items || !p.more)) more.remove();
      } finally { busy = false; more.disabled = false; }
    };
    sec.append(more); more.addEventListener('click', add);
    sec.addEventListener('toggle', () => { if (sec.open && !shown) add(); });
    label(); if (!items && !p.more && p.ok.length <= 20 && false) more.remove();
    return sec;
  }
  // o: {words, md, sel (a Set of book keys, or null for all), cur (is this search still the current one), site (the box for the results), sum (the line of the total)}
  async function siteSearch(o) {
    const {words, md, sel, cur, site, sum} = o, jobs = [], pools = [], placed = [];
    const upd = () => { const t = pools.reduce((a, x) => a + (x.total != null ? x.total : x.ok.length), 0), pl = pools.some(x => x.more);
      sum.textContent = pools.length ? T('gsTotal')(fmtN(t) + (pl ? '+' : ''), fmtN(pools.length)) : T('loading'); };
    const put = (idx, sec) => { const nx = placed.filter(x => x.idx > idx).sort((a, b) => a.idx - b.idx)[0]; site.insertBefore(sec, nx ? nx.sec : null); placed.push({idx, sec});
      if (placed.length === 1) sec.open = true; else if (placed.length === 2) placed[0].sec.open = false; };
    const arUI = ui === 'ar', v = words.join(' ');
    // al-Jami al-Kamil first (its own search, in the interface language's translation too)
    try {
      const jb = ['ar', 'ur', 'en'].includes(ui) ? 'jami' : 'jami_' + ui;
      let d; try { d = await api('search?q=' + encodeURIComponent(o.v) + '&book=' + jb + '&mode=' + md); } catch (e) { d = await api('search?q=' + encodeURIComponent(o.v) + '&book=jami&mode=' + md); }
      if (!cur()) return;
      const n = d.total || d.results.length;
      if (n && (!sel || sel.has('jami'))) { const pool = {ok: d.results, total: n, more: false}; pools.push(pool); put(0, hitSection(T('jamiName'), pool, null, null, words, d.results.map(r => () => window.row(r)))); }
    } catch (e) {}
    upd();
    if (arUI) {
      let hits = new Map(); try { hits = await siteHits(words); } catch (e) {}
      if (!cur()) return;
      const order = (IX.books || []);
      [...hits.keys()].sort((a, b) => order.indexOf(a) - order.indexOf(b)).forEach(k => {
        if (SKIP.has(k)) return; const ns = hits.get(k); if (!ns || !ns.length) return;
        if (isRbKey(k) ? (sel && !sel.has('rb*')) : (sel && !sel.has(k))) return;
        jobs.push({key: k, ns});
      });
    } else {
      (C.idx || []).forEach(b => { if (SKIP.has(b.key) || b.ext || !b.langs.includes(ui) || (sel && !sel.has(b.key))) return; jobs.push({key: b.key, ns: null, b}); });
    }
    let next = 0;
    const worker = async () => {
      while (next < jobs.length && cur()) {
        const i = next++, j = jobs[i];
        try {
          const b = j.b || (isRbKey(j.key) ? await rbBook(j.key) : bookOf(j.key)); if (!b) continue;
          const lang = arUI ? null : ui, pool = makePool(b, j.ns, lang, words, md);
          if (pool.fill) await pool.fill(20);
          if (!cur() || !pool.ok.length) continue;
          pools.push(pool); put(i + 1, hitSection(bname(b) + (b.au && b.rb ? ' — ' + b.au[0] : ''), pool, b, lang, words, null)); upd();
        } catch (e) {}
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    if (!cur()) return;
    if (pools.length) upd(); else sum.textContent = T('none');
  }
  const isRbKey = k => /^rb\d+$/.test(k);
  // the last search page (its input, results and scroll) is kept while the person opens a book and comes back; «clear» resets it
  const KEEP = {};
  window.addEventListener('scroll', () => { for (const k in KEEP) if (KEEP[k] && location.hash === KEEP[k].hash) KEEP[k].y = window.scrollY; }, {passive: true});
  const keepShow = (box, k) => { const x = KEEP[k]; if (!x || x.ui !== ui) return false; box.append(x.root); const y = x.y || 0; [0, 80, 300].forEach(t => setTimeout(() => { if (location.hash === x.hash) window.scrollTo(0, y); }, t)); return true; };
  const CLR = {ur: 'صاف کریں', ar: 'مسح', en: 'Clear', bn: 'মুছুন', hi: 'साफ़ करें', gu: 'સાફ કરો', fr: 'Effacer'};
  /* ---------- search in several books at once: choose the books from the list ---------- */
  const DEF_SEL = ['jami', 'bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik'];
  async function showSearch() {
    await index();
    bar(T('gsTitle'), '', true);
    const box = $('#list'); box.replaceChildren();
    let pre0 = null; try { pre0 = sessionStorage.gspre; } catch (e) {}
    if (!pre0 && keepShow(box, 's')) return;
    const RBL = {ur: 'موسوعۃ الحدیث (1,328 کتب)', ar: 'موسوعة الحديث (١٬٣٢٨ كتابًا)', en: 'Hadith Encyclopedia (1,328 books)', bn: 'হাদীস বিশ্বকোষ (১,৩২৮টি বই)', hi: 'हदीस विश्वकोश (1,328 किताबें)', gu: 'હદીસ વિશ્વકોશ (1,328 કિતાબો)', fr: 'Bibliothèque du hadith (1 328 livres)'};
    const books = [{key: 'jami', name: T('jamiName'), count: 16552}]
      .concat(C.idx.filter(b => !SKIP.has(b.key) && !b.ext && (ui === 'ar' || b.langs.includes(ui))).map(b => ({key: b.key, name: bname(b), count: b.count})));
    if (ui === 'ar') books.push({key: 'rb*', name: RBL.ar, count: 0});
    const allKeys = books.map(x => x.key);
    let sel; try { sel = JSON.parse(localStorage.gsel2 || 'null'); } catch (e) {} sel = Array.isArray(sel) ? sel.filter(k => allKeys.includes(k)) : allKeys.slice();
    const q = el('input', {type: 'search', class: 'filter', placeholder: T('gsPlace'), 'aria-label': T('gsPlace'), id: 'gsq'});
    const go = el('button', {class: 'btn lbtn', type: 'button'}, icon('search'), T('gsGo'));
    const save = () => { try { localStorage.gsel2 = JSON.stringify(sel.length === allKeys.length ? null : sel); } catch (e) {} };
    const list = el('div', {class: 'gslist'}), cnt = el('span', {class: 'cs'});
    const paint = () => {
      cnt.textContent = T('gsChosen')(fmtN(sel.length));
      list.replaceChildren(...books.map(x => {
        const c = el('input', {type: 'checkbox'}); c.checked = sel.includes(x.key);
        c.addEventListener('change', () => { sel = c.checked ? sel.concat(x.key) : sel.filter(k => k !== x.key); save(); cnt.textContent = T('gsChosen')(fmtN(sel.length)); });
        return el('label', {class: 'srow chk'}, c, el('span', {}, x.name, x.count ? el('small', {class: 'cs'}, '  ' + T('count')(fmtN(x.count))) : ''));
      }));
    };
    const all = el('button', {class: 'chip', type: 'button', on: {click: () => { sel = allKeys.slice(); save(); paint(); }}}, T('gsAll'));
    const none = el('button', {class: 'chip', type: 'button', on: {click: () => { sel = []; save(); paint(); }}}, T('gsNone'));
    const pick = el('details', {class: 'card gspick'}, el('summary', {}, T('gsPick'), ' ', cnt), el('div', {class: 'chips'}, all, none), list);
    const out = el('div'); let run = 0;
    const clr = el('button', {class: 'btn lbtn', type: 'button', on: {click: () => { run++; q.value = ''; out.replaceChildren(); window.scrollTo(0, 0); q.focus(); }}}, CLR[ui] || CLR.en);
    const root = el('div'); root.append(el('div', {class: 'card pad0 filterbox'}, icon('search'), q), modeBar(() => { if (q.value.trim()) go.click(); }), el('div', {class: 'gsbar'}, go, ' ', clr), pick, el('p', {class: 'note'}, T('gsHint')), out);
    box.append(root); KEEP.s = {root, ui, hash: location.hash, y: 0};
    paint();
    const doRun = async () => {
      const v = q.value.trim(); if (!v) return;
      const words = norm(v.replace(/[&+،,]/g, ' ')).split(' ').filter(Boolean); if (!words.length) return;
      const md = /[&+،,]/.test(v) ? 'all' : GSMODE(), tk = ++run;
      pick.open = false; out.replaceChildren();
      const sum = el('div', {class: 'qsbar'}, T('loading')), site = el('div'); out.append(sum, site);
      await siteSearch({v, words, md, sel: new Set(sel), cur: () => tk === run, site, sum});
    };
    go.addEventListener('click', doRun);
    q.addEventListener('keydown', e => { if (e.key === 'Enter') doRun(); });
    q.focus();
    try { const pre = sessionStorage.gspre; if (pre) { sessionStorage.removeItem('gspre'); q.value = pre; doRun(); } } catch (e) {}
  }
  /* ---------- «حدیث تلاش»: first all the books of this site (a word index, coll/ix), then the Hadith Encyclopedia of
     Dorar (dorar.net) with each muhaddith's grade, through /api/dorar ---------- */
  const IX = {sh: {}, books: null};
  window.SIDX = (i, m, books) => { IX.sh[i] = m; IX.books = books; };
  const fnv = w => { let h = 0x811c9dc5; for (let i = 0; i < w.length; i++) { h ^= w.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h % 512; };
  async function ixWord(w) {
    const i = fnv(w); await once('ix' + i, 'coll/ix/' + i + '.js');
    const v = (IX.sh[i] || {})[w];
    if (v === 0) return 0;               // in too many hadith to narrow the search
    const m = new Map();
    if (v) for (const part of v.split(';')) {
      const [b, list] = part.split(':'); let prev = 0; const ns = [];
      for (const t of list.split(',')) { if (t[0] === '~') ns.push(parseFloat(t.slice(1))); else { prev += parseInt(t, 36); ns.push(prev); } }
      m.set(IX.books[parseInt(b, 36)], ns);
    }
    return m;
  }
  async function siteHits(words) {
    let res = null;
    for (const w of words) {
      const m = await ixWord(w);
      if (m === 0) continue;
      if (!res) { res = m; continue; }
      const nx = new Map();
      for (const [b, ns] of res) { const o = m.get(b); if (o) { const S = new Set(o), k = ns.filter(n => S.has(n)); if (k.length) nx.set(b, k); } }
      res = nx;
    }
    return res || new Map();
  }
  function dorarParse(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html'), out = [];
    const clean = t => (t || '').replace(/\s+/g, ' ').trim();
    // links of dorar.net only (the sharh of the hadith, similar hadith …), opened on their site
    const linkOf = a => { try { const u = new URL(a.getAttribute('href') || '', 'https://dorar.net/'); return /(^|\.)dorar\.net$/.test(u.hostname) && /^https?:$/.test(u.protocol) ? (u.protocol = 'https:', u.href) : null; } catch (e) { return null; } };
    const textNoLinks = nd => { if (nd.nodeType === 3) return nd.textContent; if (nd.nodeType !== 1 || nd.tagName === 'A') return ''; return [...nd.childNodes].map(textNoLinks).join(''); };
    doc.querySelectorAll('.hadith').forEach(h => {
      const f = {}, links = [];
      for (let x = h.nextElementSibling; x && !x.classList.contains('hadith'); x = x.nextElementSibling) {
        x.querySelectorAll('a[href]').forEach(a => { const u = linkOf(a), t = clean(a.textContent); if (u && t && !links.some(l => l.u === u)) links.push({t, u}); });
        x.querySelectorAll('[xplain]').forEach(e => { const id = e.getAttribute('xplain'); if (/^\d+$/.test(id) && id !== '0' && !links.some(l => /sharh/.test(l.u))) links.push({t: 'شرح الحديث', u: 'https://dorar.net/hadith/sharh/' + id}); });
        if (!x.classList.contains('hadith-info')) continue;
        let lab = null;
        x.childNodes.forEach(nd => {
          if (nd.nodeType === 1 && nd.classList.contains('info-subtitle')) { lab = clean(nd.textContent).replace(/:$/, ''); f[lab] = ''; }
          else if (lab) f[lab] = clean(f[lab] + ' ' + textNoLinks(nd));
        });
      }
      const text = clean(textNoLinks(h)).replace(/^\d+\s*-\s*/, '');
      if (!links.some(l => /مشابه/.test(l.t)) && text) links.push({t: 'أحاديث مشابهة', u: 'https://dorar.net/hadith/search?q=' + encodeURIComponent(text.replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(Boolean).slice(0, 8).join(' '))});
      out.push({text, f, links});
    });
    if (!out.length) { const t = clean(doc.body.textContent); if (t) out.push({text: t, f: {}, links: []}); }
    return out;
  }
  const gradeCls = g => /ضعيف|منكر|موضوع|باطل|لا أصل|كذب|شاذ|مرسل|منقطع|لا يصح|لا يثبت/.test(g) ? 'gbad' : /صحيح|حسن|ثابت|جيد|قوي/.test(g) ? 'ggood' : '';
  async function showHadithSearch(emb) {
    await index();
    let q, go, out;
    if (emb) { q = {value: emb.q}; out = emb.out; }
    else {
    bar(T('hsTitle'), '', true);
    const box = $('#list'); box.replaceChildren();
    if (keepShow(box, 'h')) return;
    q = el('input', {type: 'search', class: 'filter', placeholder: T('hsPlace'), 'aria-label': T('hsPlace'), id: 'hsq'});
    go = el('button', {class: 'btn lbtn', type: 'button'}, icon('search'), T('gsGo'));
    out = el('div');
    const clr = el('button', {class: 'btn lbtn', type: 'button', on: {click: () => { run++; q.value = ''; out.replaceChildren(); window.scrollTo(0, 0); q.focus(); }}}, CLR[ui] || CLR.en);
    const root = el('div'); root.append(el('div', {class: 'card pad0 filterbox'}, icon('search'), q), modeBar(() => { if (q.value.trim()) search(); }), el('div', {class: 'gsbar'}, go, ' ', clr), el('p', {class: 'note'}, T('hsHint')), out);
    box.append(root); KEEP.h = {root, ui, hash: location.hash, y: 0};
    }
    let run = 0;
    const search = async () => {
      const v = q.value.trim(); if (!v) return;
      try { localStorage.hsq = v; } catch (e) {}
      const tk = ++run, words = norm(v.replace(/[&+،,]/g, ' ')).split(' ').filter(Boolean); if (!words.length) return;
      const md = emb || /[&+،,]/.test(v) ? 'all' : GSMODE();
      out.replaceChildren();
      // 1. this site
      const h1 = el('h3', {class: 'grp'}, T('hsSite')), sum = el('p', {class: 'cs'}, T('loading')), site = el('div');
      out.append(h1, sum, site);
      const dsec = el('div');
      out.append(el('h3', {class: 'grp'}, T('hsDorar')), dsec);
      siteSearch({v, words, md, sel: null, cur: () => tk === run, site, sum}).catch(() => {});
      // 2. Dorar, with the grades
      dorarPage(v, 1, dsec, tk);
    };
    const dorarPage = async (v, page, dsec, tk) => {
      const st = el('p', {class: 'cs'}, T('loading')); dsec.append(st);
      let list = null;
      try {
        const r = await fetch('/api/dorar?q=' + encodeURIComponent(v) + '&page=' + page);
        if (r.ok) list = dorarParse((await r.json()).html || '');
      } catch (e) {}
      if (tk !== run) return;
      st.remove();
      const link = el('a', {class: 'btn lbtn', href: 'https://dorar.net/hadith/search?q=' + encodeURIComponent(v), target: '_blank', rel: 'noopener'}, T('hsOpenDorar'));
      if (!list) { dsec.append(el('p', {class: 'note'}, T('hsDorarErr')), link); return; }
      if (!list.length) { if (page === 1) dsec.append(el('p', {class: 'note'}, T('none')), link); return; }
      list.forEach((x, i) => {
        const g = x.f['خلاصة حكم المحدث'] || x.f['الحكم'] || '';
        const meta = [['الراوي', 'hsRawi'], ['المحدث', 'hsMuh'], ['المصدر', 'hsSrc'], ['الصفحة أو الرقم', 'hsNo']]
          .filter(([k]) => x.f[k]).map(([k, t]) => el('span', {class: 'hsm'}, el('span', {class: 'cs'}, T(t) + ': '), el('span', {lang: 'ar', dir: 'rtl'}, x.f[k])));
        dsec.append(el('article', {class: 'card hsr'},
          el('div', {class: 'top'}, el('span', {class: 'big'}, fmtN((page - 1) * 15 + i + 1))),
          el('div', {class: 'mt ar', lang: 'ar', dir: 'rtl'}, el('p', {}, x.text)),
          g ? el('p', {class: 'hsg ' + gradeCls(g)}, el('span', {class: 'cs'}, T('hsGrade') + ': '), el('b', {lang: 'ar', dir: 'rtl'}, g)) : '',
          meta.length ? el('div', {class: 'hsmeta'}, ...meta) : '',
          x.links.length ? el('div', {class: 'chips hslinks'}, ...x.links.map(l => el('a', {class: 'chip' + (/شرح/.test(l.t) ? ' hssharh' : ''), href: l.u, target: '_blank', rel: 'noopener', lang: 'ar', dir: 'rtl'}, l.t))) : ''));
      });
      if (list.length >= 15) { const m = el('button', {class: 'btn more', type: 'button', on: {click: () => { m.remove(); dorarPage(v, page + 1, dsec, tk); }}}, T('more')); dsec.append(m); }
      else dsec.append(link);
      if (page === 1) dsec.append(el('p', {class: 'note'}, T('hsDorarSrc')));
    };
    if (emb) return search();
    go.addEventListener('click', search);
    q.addEventListener('keydown', e => { if (e.key === 'Enter') search(); });
    try { if (localStorage.hsq) q.value = localStorage.hsq; } catch (e) {}
    let au = ''; try { au = sessionStorage.hsauto || ''; sessionStorage.removeItem('hsauto'); } catch (e) {}
    if (au) { q.value = au; search(); }
    q.focus();
  }
  async function showSection(b, no) {
    const s = b.sections.find(x => String(x[0]) === String(no)), box = $('#list'); box.replaceChildren(); await needChap(b);
    if (!s) { box.append(el('p', {class: 'note'}, T('nf'))); return; }
    bar(fmtN(s[0]) + '. ' + secT(b, s), bname(b), true);
    try { localStorage['rd:' + b.key] = s[0]; } catch (e) {}
    const TOC = {ur: 'فہرست ابواب', ar: 'الفهرس', en: 'Contents', bn: 'সূচিপত্র', hi: 'विषय-सूची', gu: 'અનુક્રમણિકા', fr: 'Sommaire'}[ui] || 'Contents';
    const tocBtn = () => el('a', {class: 'btn lbtn toc', href: '#/s/' + b.key + '?idx'}, TOC);
    box.append(tocBtn());
    if (s[4]) box.append(el('p', {class: 'ca', lang: 'ar', style: 'margin:.2rem 0'}, s[4]));
    // a section may show a range of another book (سیر: the Khulafa' and the ten from Fazail as-Sahaba)
    const B = (s[5] && s[5].src && bookOf(s[5].src)) || b, lang = getLang(B);
    box.append(langChips(B, () => showSection(b, no)), el('p', {class: 'cs'}, RNG(B)(s[2], s[3])));
    // per-kitab recordings (Arabic only) played from the publisher's own archive.org link
    const SA = {muslim: {sufs: ["ketaabaleeman", "ketaaba66harah", "ketaabal7aydh", "ketaabalsalah", "kmwade3alsalah", "ksalatalmosafer", "kjomo3ah", "kal3edayn", "kestesqaa", "kkosoof", "kjanaaezz", "kzakah", "ksyaam", "ke3tekaaf", "khajj", "kjneka77", "kradaa3", "ktalaaq", "kle3aan", "kal3etq", "kboyoo3", "kmosaqaah", "kfaraeed", "khebaat", "kwa9yeah", "kannothor", "kaymaan", "kqasaamah", "k7odood", "kaqdyah", "kloqa6ah", "kjehaad", "kamaarah", "kassayed", "kada7ee", "kashrebah", "kallebas", "kalaadaab", "kasslaam", "kalalfadh_menalaadaab", "kasheaar", "karroeeya", "kfadaael", "kfadaaelassa7aabah", "kalberr", "kalqadar", "kal3elm", "kalthekerwalddo3aa", "kattawbah", "kmonafeqeen", "kaljannah", "kalfetan", "kazzohd", "ktafseer"], map: {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "11": 11, "12": 12, "13": 13, "14": 14, "15": 15, "16": 16, "17": 17, "18": 18, "19": 19, "20": 20, "21": 21, "22": 22, "23": 23, "24": 24, "25": 25, "26": 26, "27": 27, "28": 28, "29": 29, "30": 30, "31": 31, "32": 32, "33": 33, "34": 34, "35": 35, "36": 36, "37": 37, "38": 38, "39": 39, "40": 40, "41": 41, "42": 42, "43": 43, "44": 44, "45": 45, "46": 46, "47": 47, "48": 48, "50": 49, "51": 50, "52": 51, "53": 51, "54": 52, "55": 53, "56": 54}}}[b.key];
    const SA_ON = false; // hidden until a better recording is found (files read from the start, not one hadith each)
    if (SA_ON && SA && SA.map[s[0]]) { const k = SA.map[s[0]], u = 'https://archive.org/download/saheh-muslim-mp3/' + String(k).padStart(3, '0') + 'sa7e7moslm_' + SA.sufs[k - 1] + '.mp3';
      const ti = {ur: 'آڈیو', ar: 'الصوتيات', en: 'Audio', bn: 'অডিও', hi: 'ऑडियो', gu: 'ઑડિયો', fr: 'Audio'}[ui] || 'Audio', only = {ur: 'صرف عربی', ar: 'عربي فقط', en: 'Arabic only', bn: 'শুধু আরবি', hi: 'केवल अरबी', gu: 'ફક્ત અરબી', fr: 'Arabe seulement'}[ui] || 'Arabic only',
        src = {ur: 'ماخذ: archive.org — آڈیو اسی سائٹ کے لنک سے چلتی ہے۔', ar: 'المصدر: archive.org — تُشغَّل المادة من رابط الموقع نفسه.', en: 'Source: archive.org — played from the publisher\'s own link.', bn: 'সূত্র: archive.org — প্রকাশকের নিজস্ব লিংক থেকে চলে।', hi: 'स्रोत: archive.org — प्रकाशक के अपने लिंक से चलती है।', gu: 'સ્ત્રોત: archive.org — પ્રકાશકની પોતાની લિંકથી ચાલે છે.', fr: 'Source : archive.org — lue depuis le lien de l\'éditeur.'}[ui];
      box.append(el('details', {class: 'card intro'}, el('summary', {}, ti + ' (' + only + ')'), el('audio', {controls: true, preload: 'none', src: u, style: 'width:100%;margin:.5rem 0', dir: 'ltr'}), el('p', {class: 'cs'}, src))); }
    const list = el('div'), more = el('button', {class: 'btn more', type: 'button'}, T('more'));
    box.append(list, more);
    let at = s[2];
    const add = async () => {
      // numbers without a text in the book (e.g. most of Muslim's Introduction) are skipped: go on until something shows or the section ends
      let got = 0;
      while (!got && at <= s[3]) {
        const to = Math.min(s[3], at + 19);
        await needRange(B, 'ar', at, to); if (lang) await needRange(B, lang, at, to);
        for (let n = at; n <= to; n++) if (row(B, 'ar', n)) { list.append(card(B, n, lang)); got++; }
        at = to + 1;
      }
      if (at > s[3]) more.remove();
    };
    more.addEventListener('click', add); await add();
    // reading in order: the previous / next section (person, kitab) at the end
    const i = b.sections.indexOf(s), pv = b.sections[i - 1], nx = b.sections[i + 1];
    box.append(el('div', {class: 'secnav'},
      nx ? el('a', {class: 'card secnext', href: '#/s/' + b.key + '/' + nx[0]}, el('span', {class: 'cs'}, T('nextSec')), el('span', {class: 'ct', dir: 'auto'}, fmtN(nx[0]) + '. ' + secT(b, nx))) : '',
      pv ? el('a', {class: 'secprev', href: '#/s/' + b.key + '/' + pv[0]}, T('prevSec') + ': ' + secT(b, pv)) : '', tocBtn()));
    // auto scroll bar, as in the other reading pages (hides aside after 20 s of not being used)
    if (window.QURAN && QURAN.scrollBar) { const go = h => () => { location.hash = h; }; const sl = T('chapShort') || T('nextSec');
      box.append(QURAN.scrollBar({prev: [['prev', sl, pv ? go('#/s/' + b.key + '/' + pv[0]) : null]], next: [['next', sl, nx ? go('#/s/' + b.key + '/' + nx[0]) : null]]})); setTimeout(() => QURAN.showTime(), 50); }
  }
  async function showOne(b, n) {
    const box = $('#list'); box.replaceChildren();
    const lang = getLang(b); await needRange(b, 'ar', n, n); if (lang) await needRange(b, lang, n, n); await needChap(b);
    const s = b.sections.find(x => !(x[5] && x[5].src) && x[2] <= n && n <= x[3]);
    bar(bname(b), T(b.key === 'shadharat' ? 'cNasNo' : b.key === 'siyar' ? 'cParaNo' : 'hadith')(fmtN(n)), true);
    box.append(langChips(b, () => showOne(b, n)));
    if (s) box.append(el('a', {class: 'grp', href: '#/s/' + b.key + '/' + s[0], dir: 'auto'}, fmtN(s[0]) + '. ' + secT(b, s)));
    box.append(row(b, 'ar', n) ? card(b, n, lang) : el('p', {class: 'note'}, T('cNotHere')));
    const nav = el('div', {class: 'nav'});
    const own = b.key === 'shadharat' || b.key === 'siyar';
    nav.append(n > 1 ? el('a', {href: '#/s/' + b.key + '/n/' + (n - 1)}, T(own ? 'prevSec' : 'prev')) : el('span'), n < b.count ? el('a', {href: '#/s/' + b.key + '/n/' + (n + 1)}, T(own ? 'nextSec' : 'next')) : el('span'));
    box.append(nav);
  }


  // ===== Narrators (رواة): search by name in the books of rijal; the names of the narrators in the isnad of a hadith open this search =====
  const RJT = {
    ur: {title: 'رواة الحدیث', rank: 'درجہ (تقریب التہذیب)', tab: 'طبقہ', death: 'وفات', books_n: n => 'کتب: ' + n, perbook: 'ہر کتاب میں راوی کے متعلق کیا ہے', openbook: 'کتاب میں کھولیں', loadtxt: 'متن دکھائیں', allnotes: 'تمام کتب سے جرح و تعدیل', loadnotes: 'تمام کتب سے اقوال جمع کریں', loadingq: 'لوڈ ہو رہا ہے…', fromTK: 'تراث خیرالقرون کا مرتب ذخیرہ', basis: 'نام کی مطابقت سے جوڑا گیا ہے؛ ہم نام راویوں میں کتاب کا متن دیکھ کر تصدیق کر لیں۔', bookwise: 'کتاب وار نتائج', news: 'نیا کیا ہے', newsAll: 'نئی کتب اور اپڈیٹس', rj_hero: 'رواة الحدیث اور جرح و تعدیل', ph: 'راوی کا نام لکھیں (مثلاً: ابو بکر بن ابی شیبہ)', src: 'کن کتب میں تلاش کریں؟', none: 'کوئی نتیجہ نہیں ملا۔ نام کے کم الفاظ لکھ کر دیکھیں۔', hint: 'اوپر نام لکھیں۔ نتیجے پر کلک کریں تو راوی کی پوری ترجمہ کھل جائے گی۔ ہم نام والی سند میں کئی راوی ایک سے ہو سکتے ہیں، اس لیے طبقہ اور شیوخ و تلامذہ دیکھ کر پہچانیں۔', books: 'رجال، جرح و تعدیل اور علومِ حدیث کی کتب', sanad: 'سند کے راوی', newtag: 'نئی',  g1: 'رجال: راویوں کے تراجم', g2: 'جرح و تعدیل اور ضعفاء', g3: 'تواریخ اور طبقات',  jarh: 'جرح و تعدیل اور اقوالِ ائمہ', teachers: 'اساتذہ (شیوخ)', students: 'شاگرد (تلامذہ)', sanadHint: 'راوی کے نام پر کلک کریں', more: n => 'مزید نتائج: ' + n + ' (نام مزید لکھ کر تنگ کریں)', loading: 'کتب کا ڈیٹا لوڈ ہو رہا ہے…', tile: 'راوی', count: n => n + ' تراجم'},
    en: {title: 'Hadith narrators', rank: 'Rank (Taqrib at-Tahdhib)', tab: 'Generation', death: 'Death', books_n: n => 'Books: ' + n, perbook: 'What each book says about the narrator', openbook: 'Open in the book', loadtxt: 'Show text', allnotes: 'Criticism from all books', loadnotes: 'Gather sayings from all books', loadingq: 'Loading…', fromTK: 'Compiled narrator record of Turath Khair al-Quroon', basis: 'Linked by name match; for namesakes check the text of the book.', bookwise: 'Results by book', news: 'What’s new', newsAll: 'New books and updates', rj_hero: 'Narrators, criticism and hadith sciences', ph: 'Type the narrator’s name', src: 'Search in which books?', none: 'No result. Try fewer words of the name.', hint: 'Type a name above; tap a result to open the full biography. Several narrators can share the same name, so check the generation, teachers and students.', books: 'Books of narrators, criticism and hadith sciences', sanad: 'Narrators of the chain', newtag: 'New',  g1: 'Rijal: biographies of narrators', g2: 'Criticism and weak narrators', g3: 'Histories and generations',  jarh: 'Criticism and sayings of the imams', teachers: 'Teachers', students: 'Students', sanadHint: 'Tap a name', more: n => 'More results: ' + n + ' (type more of the name)', loading: 'Loading…', tile: 'Narrators', count: n => n + ' entries'},
    ar: {about: 'معلومات عن الراوي', folder: 'الرواة', folderCard: 'سجل الرواة المرتب في تراث خير القرون', srcAll: 'المصدر', prevR: 'الراوي السابق', nextR: 'الراوي التالي', folderHint: 'ترجمة مرتبة لكل راوٍ: الرتبة والطبقة والوفاة والشيوخ والتلاميذ وأقوال الأئمة. اختر حرفاً أو رتبة.', foldercnt: n => 'عدد التراجم: ' + n, more2: n => 'المزيد (' + n + ')', hadiths: 'أحاديث الراوي', life: 'عن حياة الراوي', nm: 'الراوي', rk: 'الرتبة', showall: n => 'عرض الكل (' + n + ')', kunya: 'الكنية واللقب', sy_h: 'روى له', title: 'رواة الحديث', rank: 'الرتبة (تقريب التهذيب)', tab: 'الطبقة', death: 'الوفاة', books_n: n => 'الكتب: ' + n, perbook: 'ما قيل في الراوي في كل كتاب', openbook: 'افتح في الكتاب', loadtxt: 'عرض النص', allnotes: 'الجرح والتعديل من جميع الكتب', loadnotes: 'اجمع الأقوال من جميع الكتب', loadingq: 'جارٍ التحميل…', fromTK: 'سجل الرواة المرتب في تراث خير القرون', basis: 'الربط بتطابق الاسم؛ عند تشابه الأسماء راجع نص الكتاب.', bookwise: 'النتائج حسب الكتاب', news: 'الجديد', newsAll: 'الكتب والتحديثات الجديدة', rj_hero: 'رواة الحديث والجرح والتعديل', ph: 'اكتب اسم الراوي', src: 'في أي الكتب تبحث؟', none: 'لا توجد نتائج. جرّب كلمات أقل من الاسم.', hint: 'اكتب الاسم ثم افتح الترجمة. قد يتشابه اسم أكثر من راوٍ فانظر في الطبقة والشيوخ والتلاميذ.', books: 'كتب الرجال والجرح والتعديل وعلوم الحديث', sanad: 'رواة السند', newtag: 'جديد',  g1: 'الرجال: تراجم الرواة', g2: 'الجرح والتعديل والضعفاء', g3: 'التواريخ والطبقات',  jarh: 'الجرح والتعديل وأقوال الأئمة', teachers: 'أساتذة الراوي', students: 'تلاميذ الراوي', sanadHint: 'اضغط على الاسم', more: n => 'نتائج أخرى: ' + n + ' (أكمل الاسم)', loading: 'جارٍ التحميل…', tile: 'الرواة', count: n => n + ' ترجمة'},
    bn: {title: 'হাদীসের রাবী', tile: 'রাবী', news: 'নতুন কী', newsAll: 'নতুন বই ও আপডেট', sanad: 'সনদের রাবী', sanadHint: 'রাবীর নামে ট্যাপ করুন', newtag: 'নতুন', count: n => n + ' টি জীবনী'},
    hi: {title: 'हदीस के रावी', tile: 'रावी', news: 'नया क्या है', newsAll: 'नई किताबें और अपडेट', sanad: 'सनद के रावी', sanadHint: 'रावी के नाम पर टैप करें', newtag: 'नया', count: n => n + ' जीवनियाँ'},
    gu: {title: 'હદીસના રાવીઓ', tile: 'રાવીઓ', news: 'નવું શું છે', newsAll: 'નવી કિતાબો અને અપડેટ', sanad: 'સનદના રાવીઓ', sanadHint: 'રાવીના નામ પર ટૅપ કરો', newtag: 'નવું', count: n => n + ' જીવનચરિત્રો'},
    fr: {title: 'Narrateurs du hadith', tile: 'Narrateurs', news: 'Nouveautés', newsAll: 'Nouveaux livres et mises à jour', sanad: 'Narrateurs de la chaîne', sanadHint: 'Touchez le nom d’un narrateur', newtag: 'Nouveau', count: n => n + ' notices'}
  };
  const RT_UI = new Set(['tile', 'news', 'newsAll', 'sanad', 'sanadHint', 'newtag', 'count']);
  const rt = k => RT_UI.has(k) ? ((RJT[ui] || RJT.en)[k] || RJT.en[k]) : (RJT.ar[k] || (RJT[ui] || RJT.en)[k] || RJT.en[k]);
  window.RJT_TILE = () => rt('tile');
  const RJ_BOOKS = ['tahdhibkamal', 'sh8609', 'sh1290', 'sh149213', 'sh10906', 'sh2170', 'thiqat', 'tarikhbukhari', 'sh12579', 'sh23764', 'sh36357', 'sh8632', 'sh10802', 'sh816', 'sh3508', 'sh12698'], RJ_DEF = ['tahdhibkamal'];
  const RJ_LIB = ['tahdhibkamal', 'sh8609', 'sh1290', 'sh149213', 'sh36357', 'sh132965', 'sh2170', 'sh26112', 'sh9863', 'sh10906', 'thiqat', 'tarikhbukhari', 'sh5782', 'sh8632', 'sh12579', 'sh23764', 'sh71', 'sh10802', 'sh816', 'sh3508', 'sh12698'];
  C.rj = {};
  const rtok = t => t === 'ابي' || t === 'ابا' ? 'ابو' : t === 'ابن' ? 'بن' : t;
  const rnorm = s => String(s).replace(/[\u064b-\u0652\u0670\u0640\u200c\u200d]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/[ىیی]/g, 'ي').replace(/ة/g, 'ه').replace(/ک/g, 'ك').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').split(/[^\u0621-\u064a]+/).filter(Boolean).map(rtok).join(' ');
  window.RIJAL = (key, rows) => { C.rj[key] = rows.map(r => ({n: r[0], h: r[1], s: r[2] || '', k: rnorm(r[1])})); };
  const rjGet = async key => { if (!C.rj[key]) await once('rj_' + key, 'coll/rijal_' + key + '.js'); return C.rj[key] || []; };
  const rjSel = () => { try { const v = JSON.parse(localStorage.rjsrc || 'null'); if (Array.isArray(v) && v.length) return v.filter(k => RJ_BOOKS.includes(k)); } catch (e) {} return RJ_DEF.slice(); };
  // the names of the narrators in the isnad: the text before the matn, cut at the words of transmission
  // names near the narrator (his neighbours in the isnad, or the narrator whose page we come from) tell the same name of two narrators apart
  const rjCtx = arr => { const c = arr.map(q => String(q).split(' ').slice(0, 4).join(' ')).filter(q => q.split(' ').length >= 2); return c.length ? '&c=' + encodeURIComponent(c.join('|')) : ''; };
  const TSH = /[\u064b-\u0652\u0670\u0640]/;
  function sanadNames(txt) {
    const map = []; let s = '';
    for (let i = 0; i < txt.length; i++) if (!TSH.test(txt[i])) { map.push(i); s += txt[i]; }
    const e = s.search(/(?:قال|يقول|سمعت|ان|أن|عن)\s+(?:رسول\s+الله|النبي|نبي\s+الله)|ﷺ|صلى\s+الله\s+عليه|\s:\s*["«“]/);
    let sn = e > 0 ? s.slice(0, e) : s.slice(0, 350); if (sn.length > 700) sn = sn.slice(0, 700);
    if (!/(?:حدثنا|حدثني|اخبرنا|أخبرنا|اخبرني|أخبرني|انبانا|أنبأنا|ثنا|عن)\s/.test(sn)) return [];
    const out = [], seen = new Set(), SEP = /(?:^|[\s،,.:؛])(?:و|ف)?(?:حدثنا|حدثني|أخبرنا|اخبرنا|أخبرني|اخبرني|أنبأنا|انبانا|أنبأني|أنا|ثنا|نا|حدثناه|أخبرناه|عن|قال|قالا|قالوا|قالت|سمعت|يقول|يعني|ح|أنه|انه|أنها|انها|أن|ان|هو|جميعا|كلاهما|كلهم|في|عنه|عنها)(?=[\s،,.:؛]|$)|\s[-–ـ]+(?=\s)|[،,](?=\s)/g;
    let last = 0, m; const cut = (a, b) => {
      let nm = sn.slice(a, b).replace(/\s*[-–ـ]?\s*(?:رضي|رضى)\s+الله\s+(?:تعالى\s+)?عن(?:ه|ها|هما|هم)\s*[-–ـ]?/g, '').replace(/^(?:رواه|رووه)\s+/, '').replace(/^[\s،,.:؛]+|[\s،,.:؛]+$/g, '').replace(/^(?:و|ف)(?=\S+\s)/, '');
      const w = nm.split(/\s+/).length; if (out.stop) return; if (/(?:^|\s)(?:كنت|كان|كانت|اراد|أراد|ارادت|أرادت|ذكر|ذكرت|يدخل|فزعمت|فذكرت|رأيت|رايت|دخلت|خرجت|نزلت|مررت|قلت|اخبرته|أخبرته)(?:\s|$)/.test(nm) || w > 7) { out.stop = 1; return; } if (nm.length < 3 || w > 8 || /^(?:كان|ما|لا|من|ثم|إذا|اذا|هذا|هذه|في|به|بمثله)\s/.test(nm) || /[0-9٠-٩]/.test(nm)) return;
      const key = rnorm(nm); if (!key || seen.has(key)) return; if (/(?:^| )(?:النبي|رسول|نبي)(?: |$)/.test(key)) { out.stop = 1; return; } if (/^(?:لي|له|لنا|لها)( |$)/.test(key)) return; seen.add(key);
      const A0 = map[a + (sn.slice(a, b).length - sn.slice(a, b).trimStart().length)] ?? 0, B0 = (map[Math.min(b, map.length) - 1] ?? txt.length - 1) + 1; out.push({d: txt.slice(A0, B0).replace(/^[\s،,.:؛]+|[\s،,.:؛]+$/g, ''), q: key, a: A0, b: B0});
    };
    while ((m = SEP.exec(sn))) { if (m.index > last) cut(last, m.index); last = m.index + m[0].length; }
    if (last < sn.length) cut(last, sn.length);
    return out.slice(0, 12);
  }

  // ===== A biography of a narrator, arranged: header (name, books he narrates in), teachers, students, sayings of the imams on him =====
  const RJS = {'خ': 'البخاري', 'م': 'مسلم', 'د': 'أبو داود', 'ت': 'الترمذي', 'س': 'النسائي', 'ق': 'ابن ماجه', 'ع': 'الستة', '٤': 'السنن الأربعة', '4': 'السنن الأربعة', 'بخ': 'الأدب المفرد', 'خت': 'البخاري تعليقاً', 'تم': 'الشمائل', 'سي': 'عمل اليوم والليلة', 'مق': 'مقدمة مسلم', 'مد': 'المراسيل', 'قد': 'القدر', 'ر': 'رفع اليدين', 'ي': 'القراءة خلف الإمام', 'عخ': 'خلق أفعال العباد'};
  const RJK = Object.keys(RJS).sort((a, b) => b.length - a.length);
  const rjSyms = str => { const out = []; String(str).replace(/[()\[\]*]/g, ' ').split(/\s+/).filter(Boolean).forEach(tok => { let t = tok.replace(/[ـ,:،]/g, ''); const part = []; while (t) { const k = RJK.find(k => t.startsWith(k)); if (!k) return; part.push(k); t = t.slice(k.length); } out.push(...part); }); return out; };
  const RJ_STRUCT = ['tahdhibkamal', 'sh149213', 'sh1290'];
  const rjNames = txt => { const out = []; let depth = 0, cur = '';
    for (const ch of txt + '،') { if (ch === '(') depth++; if (ch === ')') depth = Math.max(0, depth - 1); if ((ch === '،' || ch === ',') && !depth) { out.push(cur); cur = ''; } else cur += ch; }
    return out.map(x => { let nm = x.replace(/^[\s.]+|[\s.]+$/g, ''), sy = [];
      nm = nm.replace(/\s*\(\s*([^()0-9٠-٩]{1,16})\)\s*/g, (m0, g) => { const z = rjSyms(g); if (z.length) { sy.push(...z); return ' '; } return m0; });
      nm = nm.replace(/\s*\(\s*[0-9٠-٩]+\s*\)\s*/g, ' ').replace(/^(?:و)(?=\S)/, '').replace(/\s+/g, ' ').trim();
      return nm.length > 1 && nm.length < 120 ? {n: nm, s: sy} : null; }).filter(Boolean); };
  function rjParse(txt) {
    // paragraphs of one biography: a line that does not end a sentence continues in the next one
    const lines = []; txt.split('\n').forEach(l => { l = l.trim(); if (!l) return; const p = lines.length ? lines[lines.length - 1] : null;
      if (p && !/[.:؟!]\s*$/.test(p.replace(TSH_G, '')) && !/^(?:و)?قَ?ا?لَ?\b/.test(l.replace(TSH_G, '')) && !/^(?:سمع|روى|رَوَى)/.test(l.replace(TSH_G, ''))) lines[lines.length - 1] = p + ' ' + l; else lines.push(l); });
    const full = lines.join('\n'), map = []; let st = '';
    for (let i = 0; i < full.length; i++) if (!TSH.test(full[i])) { map.push(i); st += full[i]; }
    const re = /(?:^|\n|[.،,]\s+|\s)((?:و)?(?:روى|يروي)\s+عنه?\s*:|(?:و)?عنه\s*:|(?:و)?عن\s*:)/g, marks = []; let m;
    while ((m = re.exec(st))) { const a = m.index + m[0].length - m[1].length; marks.push({a, b: m.index + m[0].length, t: /عنه/.test(m[1]) ? 'S' : 'T'}); }
    if (!marks.length) return null;
    const sl = (a, b) => full.slice(map[a] ?? full.length, b >= map.length ? full.length : map[b]);
    const res = {head: sl(0, marks[0].a).trim(), T: [], S: [], notes: []}, rest = [];
    marks.forEach((k, i) => { const body = sl(k.b, i + 1 < marks.length ? marks[i + 1].a : st.length); const e = body.search(/\.(?:\s|$)/); const list = e >= 0 && /[^\n]/.test(body.slice(0, e)) ? body.slice(0, e) : body; if (e >= 0 && e < body.length - 1) rest.push(body.slice(e + 1)); (k.t === 'T' ? res.T : res.S).push(...rjNames(list.replace(/\n/g, ' '))); });
    // the rest: one saying per line (or per sentence in a single paragraph)
    const lns = rest.join('\n').split('\n'); const sent = [];
    lns.forEach(l => { const t = l.trim(); if (!t) return; (lines.length > 1 ? [t] : t.split(/\.\s+(?=\S)/)).forEach(x => { x = x.trim(); if (x) sent.push(x); }); });
    sent.forEach(x => { const q = x.replace(TSH_G, '').match(/^(?:و)?قال\s+([^:]{1,60}):/); if (q) { const ci = x.indexOf(':'); res.notes.push({w: x.slice(0, ci).replace(/^(?:و)?(?:قَ?ا?ل)\s*/, '').replace(/^\S*قَال\s*/, '').trim() || x.slice(0, ci), t: x.slice(ci + 1).trim()}); } else res.notes.push({w: '', t: x}); });
    // the header: «sym: name» or «name * (sym) rank»
    let h = res.head.replace(/^[\s\[\]]+/, ''), sy = [];
    const hm = h.match(/^([^:]{1,40}?)\]?\s*:\s*/); if (hm) { const z = rjSyms(hm[1]); if (z.length || /^[\s\[\]]*$/.test(hm[1].replace(TSH_G, ''))) { sy = z; h = h.slice(hm[0].length); } }
    let facts = '';
    const star = h.indexOf('*'); if (star > 0) { facts = h.slice(star + 1).trim(); h = h.slice(0, star).trim(); const fm = facts.match(/^\(([^)]{1,20})\)\s*(.*)$/s); if (fm) { sy.push(...rjSyms(fm[1])); facts = fm[2]; } }
    h = h.replace(/\n/g, ' ').replace(/\s*\(\s*[0-9٠-٩]+\s*\)/g, '').replace(/\s+/g, ' ').trim();
    const ci = h.search(/[،,]/); if (ci > 3 && star < 0) { facts = (h.slice(ci + 1).trim() + (facts ? '. ' + facts : '')); h = h.slice(0, ci).trim(); }
    res.notes = res.notes.map(n => { n.t = n.t.replace(/\s*\(\s*[0-9٠-٩]+\s*\)/g, '').trim(); if (n.w === 'مرة' || n.w === 'مرةً') { n.t = 'قال مرة: ' + n.t; n.w = ''; } return n; }).filter(n => n.t.replace(/[.\s]/g, ''));
    res.sy = [...new Set(sy)]; res.name = h; res.facts = facts.replace(/\s*\(\s*[0-9٠-٩]+\s*\)/g, ''); return res;
  }
  const TSH_G = /[ً-ْٰـ]/g;
  function rjBlock(x) {
    const wrap = el('div', {class: 'rjcard', lang: 'ar', dir: 'rtl'});
    const head = el('div', {class: 'rjhead'}, el('div', {class: 'rjname'}, x.name || '—'));
    if (x.sy.length) head.append(el('div', {class: 'rjsyms'}, ...x.sy.map(k => el('span', {class: 'rjsym', title: RJS[k] || ''}, RJS[k] || k))));
    wrap.append(head);
    if (x.facts) wrap.append(el('div', {class: 'rjfacts'}, ...x.facts.split(/\.\s+/).filter(t => t.trim()).map(t => { const i = t.indexOf(':'); return i > 0 && i < 20 ? el('p', {}, el('b', {}, t.slice(0, i) + ': '), t.slice(i + 1).replace(/\.$/, '')) : el('p', {}, t.replace(/\.$/, '')); })));
    const sec = (title, n, open, body) => n ? el('details', {class: 'rjsec', open: open ? '' : null}, el('summary', {}, el('span', {class: 'rjst'}, title), el('span', {class: 'rjcnt'}, fmtN(n))), body) : null;
    const pills = arr => el('div', {class: 'rjpills'}, ...arr.filter(p => !isProphet(p.n)).map(p => el('a', {class: 'rjpill', href: '#/s/rijal?q=' + encodeURIComponent(rnorm(p.n)) + rjCtx([rnorm(x.name || '')])}, p.n, p.s.length ? el('small', {}, p.s.join(' ')) : null)));
    wrap.append(...[
      sec(rt('jarh'), x.notes.length, true, el('ul', {class: 'rjnotes'}, ...x.notes.map(n => el('li', {}, n.w ? el('b', {class: 'rjwho'}, n.w + ': ') : null, n.t)))),
      sec(rt('teachers'), x.T.length, false, pills(x.T)),
      sec(rt('students'), x.S.length, false, pills(x.S))].filter(Boolean));
    return wrap;
  }

  // ===== The master record of a narrator (Tahdhib al-Kamal entry + rank from Taqrib + links to the other books) =====
  C.rl = null;
  window.RLINK = o => { C.rl = o; };
  C.rel = {};
  window.RREL = o => { Object.assign(C.rel, o); };
  const relGet = async n => { const k = Math.floor((n - 1) / 500); if (!C.rel[n]) { try { await once('rel_' + k, 'coll/rel_' + k + '.js'); } catch (e) {} } return C.rel[n] || null; };
  const rlGet = async () => { if (!C.rl) await once('rlink', 'coll/rijal_link.js'); return C.rl || {keys: [], d: {}}; };
  const rankCls = r => /كذاب|وضاع|متروك|متهم|ساقط|ليس بشيء|ضعيف جدا|ضعيف جداً|منكر الحديث/.test(r) ? 'bad' : /ضعيف|لين|ليس بالقوي|سيئ|مجهول|مستور|مقبول|ماتروك|فيه ضعف|وهم|يخطئ/.test(r) ? 'warn' : 'good';
  const rankEl = r => { r = rkFix(r); return r ? el('span', {class: 'rjrank ' + rankCls(r), lang: 'ar'}, rkPlain(r)) : null; };
  const isProphet = n => { const t = String(n).replace(/[\u064b-\u0652\u0670\u0640]/g, '').trim(); return /^(?:و)?(?:النبي|نبي الله|رسول الله)(?:\s|$)/.test(t) || /صلى\s+الله\s+عليه/.test(t); };
  const bn = n => String(n).replace(/(\S)(\s+)ا[\u064b-\u0652]*ب[\u064b-\u0652]*ن(?=\s)/g, '$1$2بن');   // «ابن» inside a name is «بن»; at the beginning it stays «ابن»
  const rkFix = r => { r = String(r || '').trim(); if (!r) return ''; if (r.length <= 70 && !/^(?:الله|ابن)(?:\s|$)/.test(r) && !/(?:^|\s)ابن(?:\s|$)/.test(r)) return r; const m0 = r.match(/((?:ثقة|صدوق|ضعيف|مقبول|مجهول|متروك|لين|كذاب|وضاع|صحابي|مستور|ثبت|حافظ|إمام|فقيه|عابد)(?:\s+\S+){0,6})\s*$/); return m0 ? m0[1] : ''; };
  const rkPlain = r => { r = rkFix(r); return !r ? '' : /صحابي?ة/.test(r) ? 'صحابية' : /صحاب/.test(r) ? 'صحابي' : r; };
  const rkEl = r => { const t = rkPlain(r); return t ? el('b', {class: 'rjrk ' + (t === 'صحابي' || t === 'صحابية' ? 'good' : rankCls(t)), lang: 'ar'}, t) : null; };
  const pruneRel = (arr, ids) => { const ok = ids && ids.length === arr.length, oa = [], oi = []; arr.forEach((p, i) => { if (isProphet(p.n)) return; oa.push(p); oi.push(ok ? ids[i] : 0); }); return [oa, oi]; };
  async function showRijalMaster(n) {
    const box = $('#list'); box.replaceChildren(el('p', {class: 'note'}, rt('loadingq')));
    const tk = bookOf('tahdhibkamal'), rl = await rlGet(); await needRange(tk, 'ar', n, n);
    const r0 = row(tk, 'ar', n); if (!r0) { box.replaceChildren(el('p', {class: 'note'}, T('cNotHere'))); return; }
    const x = rjParse(r0[1]), m = (rl.d && rl.d[n]) || ['', '', '', []];
    bar(rt('title'), '', true); box.replaceChildren();
    const card = el('article', {class: 'card rjmaster'});
    card.append(el('div', {class: 'rjfrom'}, rt('fromTK')));
    if (window.NAR && NAR.idForTK) {      // the same narrator in the narrators encyclopedia (islam-db)
      const pn = tk.an && tk.an[n], nm = x ? String(x.name || '') : (r0[1] || '').slice(0, 80);
      if (pn) NAR.idForTK(parseInt(pn, 10), nm).then(id => { if (id) card.querySelector('.rjfrom').after(el('a', {class: 'btn lbtn nlink', href: '#/n/' + id}, {ur: 'موسوعۃ الرواۃ میں کھولیں', ar: 'افتح في موسوعة الرواة', en: 'Open in the Narrators Encyclopedia', bn: 'রাবীদের বিশ্বকোষে খুলুন', hi: 'रावियों के विश्वकोश में खोलें', gu: 'રાવીઓના વિશ્વકોશમાં ખોલો', fr: 'Ouvrir dans l’encyclopédie des narrateurs'}[ui] || 'Open in the Narrators Encyclopedia')); }).catch(() => {});
    }
    if (x) {
      card.append(el('div', {class: 'rjtitle', lang: 'ar'}, rt('about')));
      const facts = el('div', {class: 'rjtable', lang: 'ar', dir: 'rtl'});
      const fr = (k, v, always) => (v || always) ? facts.append(el('div', {class: 'rjrow'}, el('span', {class: 'rjk'}, k), el('span', {class: 'rjv'}, v || el('span', {class: 'rjnone'}, '—')))) : null;
      // the facts of the header are free text: the same fields are picked out of it for every narrator, in the same order
      const F = String(x.facts || ''), fm = [], fs = []; for (let i = 0; i < F.length; i++) if (!TSH.test(F[i])) { fm.push(i); fs.push(F[i]); }
      const FS = fs.join(''), dpick = re => { const q = re.exec(FS); return q ? F.slice(fm[q.index], (fm[q.index + q[0].length - 1] ?? F.length - 1) + 1).replace(/[\s،,.:؛]+$/, '') : ''; };
      const AR = '[\\u0621-\\u064a]+';
      const kun = dpick(new RegExp('(?<!(?:ابن|بن)\\s)[أا]ب[وي]\\s+' + AR + '(?:\\s+(?:بن|ابن)\\s+' + AR + ')?')), wala = dpick(new RegExp('(?:مولا(?:هم|ه|ها)|حليف\\s+بني\\s+' + AR + '|مولى\\s+' + AR + '(?:\\s+' + AR + ')?)')),
        land = dpick(new RegExp('(?:نزيل|نزل|سكن|قدم|ساكن|دخل|من أهل)\\s+' + AR + '(?:\\s+و?' + AR + ')?')), kin = dpick(new RegExp('(?:والد|أخو|اخو|ابن عم|ابن أخي|والدة|جد|عم|خال)\\s+' + AR + '(?:\\s+(?:بن|ابن)\\s+' + AR + '){0,2}')),
        sahabi = /له\s+صحبة|عداده\s+في\s+الصحابة|صحابي|رأى\s+النبي/.test(FS) ? 'صحابي' : '';
      fr('الاسم', bn(String(x.name || '').replace(/\s+\.\s+.*$/, '')), true); fr('الكنية', kun); fr('الولاء', wala); fr('البلد', land); fr('القرابة', kin); if (x.sy.length) fr('روى له', x.sy.map(k => RJS[k] || k).join('، '));
      fr(rt('rank'), m[0] ? rkEl(m[0]) : (sahabi ? rkEl(sahabi) : null), true); fr(rt('tab'), m[1], true); fr(rt('death'), m[2], true);
      fr('نبذة', F.replace(/\s+/g, ' ').trim().replace(/\.$/, ''));
      const sec = (title, cnt, open, body) => cnt ? el('details', {class: 'rjsec', open: open ? '' : null}, el('summary', {}, el('span', {class: 'rjst'}, title), cnt === true ? null : el('span', {class: 'rjcnt'}, fmtN(cnt))), body) : null;
      const rel = await relGet(n);
      const relStrip = t => { const w = t.trim().split(/\s+/), k = w[0].replace(/[\u064b-\u0652\u0670\u0640]/g, '').replace(/[أإآ]/g, 'ا'); return w.length > 2 && /^(?:ابنه|ابناه|ابنها|ابيه|ابيها|اخيه|اخته|عمه|خاله|جده|جدها|امه|زوجها|مولاه|بنته|بنتاه|ابناها|اخواه)$/.test(k) ? w.slice(1).join(' ') : t; };
      const trow = (p, id) => { const m2 = id && rl.d[id]; return el('a', {class: 'rjtr', href: id ? '#/s/rijal/' + id : '#/s/rijal?q=' + encodeURIComponent(rnorm(p.n)) + rjCtx([rnorm(x.name || '')])}, el('span', {class: 'rjtn'}, bn(relStrip(String(p.n)).replace(/^\s*[^\s:：]{2,14}[:：]\s*/, '').replace(/^\s*(?:و)?[\u064b-\u0652]*ع[\u064b-\u0652]*ن[\u064b-\u0652]*\s+/, '').replace(/\s+فيما\s+.*$/, '').replace(/\s*\([^)]*\)\s*/g, ' ').trim())), el('span', {class: 'rjtk'}, m2 && m2[0] && rkEl(m2[0]) || el('span', {class: 'rjnone'}, '—'))); };
      const table = (arr, ids) => { const w = el('div', {class: 'rjtbl', lang: 'ar', dir: 'rtl'}, el('div', {class: 'rjth'}, el('span', {}, rt('nm')), el('span', {}, rt('rk')))), ok = ids && ids.length === arr.length, rws = arr.map((p, i) => trow(p, ok ? ids[i] : 0)); rws.slice(0, 60).forEach(r => w.append(r)); if (rws.length > 60) w.append(el('button', {type: 'button', class: 'btn lbtn', on: {click: e => { rws.slice(60).forEach(r => w.insertBefore(r, e.currentTarget)); e.currentTarget.remove(); }}}, rt('showall')(fmtN(rws.length)))); return w; };
      const pills = arr => el('div', {class: 'rjpills', lang: 'ar', dir: 'rtl'}, ...arr.map(p => el('a', {class: 'rjpill', href: '#/s/rijal?q=' + encodeURIComponent(rnorm(p.n)) + rjCtx([rnorm(x.name || '')])}, p.n, p.s.length ? el('small', {}, p.s.join(' ')) : null)));
      const notesBody = el('ul', {class: 'rjnotes', lang: 'ar', dir: 'rtl'}, ...x.notes.map(nt => el('li', {}, nt.w ? el('b', {class: 'rjwho'}, nt.w + ': ') : null, nt.t, el('span', {class: 'rjbk'}, (tk.ar || bname(tk))))));
      const allBtn = el('button', {type: 'button', class: 'btn lbtn', on: {click: async e => { const bt = e.currentTarget; bt.disabled = true; bt.textContent = rt('loadingq');
        for (const [si, no] of m[3]) { const key = rl.keys[si]; if (!RJ_STRUCT.includes(key)) continue; const b = bookOf(key); await needRange(b, 'ar', no, no); const rr = row(b, 'ar', no); const px = rr && rjParse(rr[1]); if (!px) continue;
          px.notes.filter(z => z.w).forEach(z => notesBody.append(el('li', {}, el('b', {class: 'rjwho'}, z.w + ': '), z.t, el('span', {class: 'rjbk'}, (b.ar || bname(b)))))); }
        bt.remove(); }}}, rt('loadnotes'));
      const jb = el('div', {}, notesBody, m[3].some(e => RJ_STRUCT.includes(rl.keys[e[0]]) && rl.keys[e[0]] !== 'tahdhibkamal') ? allBtn : null);
      const [TT, TI] = pruneRel(x.T, rel && rel[0]), [SS2, SI] = pruneRel(x.S, rel && rel[1]);
      card.append(...[sec(rt('life'), true, true, facts), sec(rt('students'), SS2.length, false, table(SS2, SI)), sec(rt('teachers'), TT.length, false, table(TT, TI)), sec(rt('jarh'), x.notes.length, false, jb)].filter(Boolean));
      card.append(el('div', {class: 'rjacts'}, el('button', {type: 'button', class: 'btn lbtn', on: {click: () => { try { sessionStorage.gspre = String(x.name || '').split(/\s+/).slice(0, 4).join(' '); } catch (e) {} location.hash = '#/search'; }}}, rt('hadiths'))));
    } else card.append(el('div', {class: 'mt ar', lang: 'ar', dir: 'rtl'}, r0[1]));
    // the other books: what each says
    const others = m[3].filter(e => rl.keys[e[0]] !== 'tahdhibkamal');
    if (others.length) {
      card.append(el('h3', {class: 'grp'}, rt('perbook') + ' (' + fmtN(others.length) + ')'), el('p', {class: 'cs'}, rt('basis')));
      others.forEach(([si, no]) => { const key = rl.keys[si], b = bookOf(key); if (!b) return;
        const body = el('div', {class: 'rjbody'}), d = el('details', {class: 'rjsec rjbk2'}, el('summary', {}, el('span', {class: 'rjst', lang: 'ar'}, b.ar), el('span', {class: 'rjcnt'}, fmtN((b.an && b.an[no]) || no))), body);
        let done = false;
        d.addEventListener('toggle', async () => { if (!d.open || done) return; done = true; body.replaceChildren(el('p', {class: 'note'}, rt('loadingq')));
          await needRange(b, 'ar', no, no); const rr = row(b, 'ar', no); body.replaceChildren();
          if (!rr) { body.append(el('p', {class: 'note'}, T('cNotHere'))); return; }
          const px = RJ_STRUCT.includes(key) ? rjParse(rr[1]) : null;
          if (px) body.append(rjBlock(px)); else body.append(el('div', {class: 'mt ar rjplain', lang: 'ar', dir: 'rtl'}, ...rr[1].split('\n').filter(t => t.trim()).map(t => paraEl(t, 'ar'))));
          body.append(el('a', {class: 'btn lbtn', href: '#/s/' + key + '/n/' + no}, rt('openbook'))); });
        card.append(d); });
    }
    card.append(el('div', {class: 'nav', lang: 'ar'}, n > 1 ? el('a', {href: '#/s/rijal/' + (n - 1)}, '‹ ' + rt('prevR')) : el('span'), n < tk.count ? el('a', {href: '#/s/rijal/' + (n + 1)}, rt('nextR') + ' ›') : el('span')));
    box.append(card);
  }
  const rjLegend = 'خ: البخاري، م: مسلم، د: أبو داود، ت: الترمذي، س: النسائي، ق: ابن ماجه، ع: أصحاب الكتب الستة، ٤: أصحاب السنن';
  // ===== The folder before the books: the arranged record of all narrators (Tahdhib al-Kamal), browsed by letter and rank =====
  const rjClean = h => { let t = String(h).replace(/[\[\]]/g, ' ').replace(/\s+/g, ' ').trim().split(' '); while (t.length > 2 && /^[\u0621-\u064a\u064b-\u0652٤4:]{1,3}$/.test(t[0].replace(/[\u064b-\u0652]/g, '')) && t[0].replace(/[\u064b-\u0652]/g, '').length <= 2) t.shift(); return t.join(' '); };
  async function showRijalAll(letter, rankf, src) {
    src = RJ_BOOKS.includes(src) ? src : 'tahdhibkamal'; const isTK = src === 'tahdhibkamal', sb = bookOf(src);
    const box = $('#list'); box.replaceChildren(el('p', {class: 'note'}, rt('loadingq'))); bar(rt('folder'), '', true);
    const data = await rjGet(src), rl = await rlGet(); box.replaceChildren();
    const LET = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split(''), RK = [['', 'الكل'], ['صحاب', 'صحابي'], ['ثقة', 'ثقة'], ['صدوق', 'صدوق'], ['ضعيف', 'ضعيف'], ['متروك', 'متروك']];
    const first = r => (r._f || (r._f = (rnorm(rjClean(r.h))[0] || '')));
    const go = (l, k, b2) => { location.hash = '#/s/rijal/all?l=' + encodeURIComponent(l) + '&r=' + encodeURIComponent(k) + '&b=' + (b2 || src); };
    const chip = (t, on, fn) => el('button', {type: 'button', class: 'chip' + (on ? ' on' : ''), 'aria-pressed': String(!!on), on: {click: fn}}, t);
    const rows = data.filter(r => (!letter || first(r) === letter) && (!rankf || !isTK || ((rl.d[r.n] || [''])[0] || '').includes(rankf)));
    box.append(el('div', {class: 'rjhero'}, el('h2', {}, rt('folder'))),
      el('p', {class: 'cs', lang: 'ar', dir: 'rtl'}, rt('folderHint')),
      el('div', {class: 'chips rjchips', lang: 'ar', dir: 'rtl'}, ...LET.map(l => chip(l, l === letter, () => go(l === letter ? '' : l, rankf || '')))),
      el('div', {class: 'chips rjchips', lang: 'ar', dir: 'rtl'}, ...(isTK ? RK.map(([k, t]) => chip(t, k === (rankf || ''), () => go(letter || '', k))) : [])),
      el('p', {class: 'cs', lang: 'ar', dir: 'rtl'}, rt('srcAll')),
      el('div', {class: 'chips rjchips', lang: 'ar', dir: 'rtl'}, ...RJ_BOOKS.map(bk2 => { const bb = bookOf(bk2); return bb ? chip(bk2 === 'tahdhibkamal' ? rt('folderCard') : bb.ar, bk2 === src, () => go(letter || '', '', bk2)) : null; }).filter(Boolean)),
      el('p', {class: 'cs', lang: 'ar', dir: 'rtl'}, rt('foldercnt')(fmtN(rows.length))));
    const list = el('div'); box.append(list);
    let shown = 0; const more = el('button', {type: 'button', class: 'btn lbtn', on: {click: () => draw()}}, rt('showall')('+'));
    const draw = () => { rows.slice(shown, shown + 50).forEach(r => { const mm = rl.d[r.n]; list.append(rjCard(r, mm, src)); }); shown += 50; more.hidden = shown >= rows.length; more.textContent = rt('more2')(fmtN(Math.max(0, rows.length - shown))); };
    box.append(more); draw();
  }
  function rjCard(r, mm, key) {
    key = key || 'tahdhibkamal'; const bkk = key === 'tahdhibkamal' ? null : bookOf(key);
    const hd = bn(rjClean(r.h)), cut = hd.search(/(?<!\sبن|\sابن)\s(?:أبو|أبي|أبا|ابو|ابي|المعروف|نزيل|يقال|ويقال|مولى)\s|[،,.*]/), nmx = (cut > 3 ? hd.slice(0, cut) : hd).replace(/\s*\(\s*[0-9٠-٩]+\s*\)/g, ''), sub = cut > 3 ? hd.slice(cut).replace(/^[\s،,.*]+/, '').replace(/\s*\(\s*[0-9٠-٩]+\s*\)/g, '').slice(0, 110) : '';
    return el('a', {class: 'card rjcd', href: key === 'tahdhibkamal' ? '#/s/rijal/' + r.n : '#/s/' + key + '/n/' + r.n}, el('span', {class: 'snum'}, fmtN(bkk && bkk.an && bkk.an[r.n] || r.n)),
      el('span', {class: 'sinfo', lang: 'ar', dir: 'rtl'}, el('span', {class: 'rjcn'}, nmx), sub ? el('span', {class: 'rjck'}, sub) : null,
        el('span', {class: 'rjline'}, mm && mm[0] ? rankEl(mm[0]) : null, mm && mm[2] ? el('span', {class: 'rjchip'}, 'ت ' + mm[2]) : null, mm && mm[1] ? el('span', {class: 'rjchip'}, mm[1]) : null, mm && mm[3].length ? el('span', {class: 'rjbooks'}, rt('books_n')(fmtN(mm[3].length + 1))) : null, r.s ? el('span', {class: 'cs', title: rjLegend}, r.s) : null)));
  }
  async function showRijal(q, ctx) {
    const box = $('#list'); box.replaceChildren(); bar(rt('title'), '', true);
    const sel = new Set(rjSel()), inp = el('input', {type: 'search', class: 'filter', placeholder: rt('ph'), 'aria-label': rt('ph'), id: 'rjq', value: q || '', dir: 'rtl', lang: 'ar', autocomplete: 'off', enterkeyhint: 'search'});
    const chips = el('div', {class: 'chips rjchips'}), out = el('div'), note = el('p', {class: 'note'}, rt('hint'));
    const save = () => { try { localStorage.rjsrc = JSON.stringify([...sel]); } catch (e) {} };
    let tick = 0, ctxDone = false;
    const draw = async () => {
      const my = ++tick, v = inp.value.trim(), qt = rnorm(v).split(' ').filter(Boolean);
      if (!qt.length) { out.replaceChildren(note); return; }
      let rows = [], tot = {}; const HS = new Map(); await rlGet();
      const asNum = /^[0-9٠-٩]+$/.test(v) ? parseInt(v.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)), 10) : null;
      out.replaceChildren(el('p', {class: 'note'}, rt('loading')));
      for (const k of RJ_BOOKS.filter(x => sel.has(x))) {
        const b = bookOf(k); if (!b) continue;
        const data = await rjGet(k); if (my !== tick) return;
        const hits = [];
        if (asNum != null) { const nn = (C.rev[k] && C.rev[k][asNum]) || asNum; const r = data.find(x => x.n === nn); if (r) hits.push([0, r]); }
        else for (const r of data) {
          const hay = ' ' + r.k; let ok = true, ord = true, prev = -1;
          for (const t of qt) { const i = hay.indexOf(' ' + t); if (i < 0) { ok = false; break; } if (i <= prev) ord = false; prev = i; }
          if (ok) hits.push([(hay.startsWith(' ' + qt[0]) ? 0 : 2000) + (hay.startsWith(' ' + qt.join(' ')) ? 0 : ord ? 500 : 1000) + r.k.length / 4, r]);
        }
        if (!hits.length && asNum == null && qt.length > 3) { const q3 = qt.slice(0, 3); for (const r of data) if (q3.every(t => (' ' + r.k).indexOf(' ' + t) >= 0)) hits.push([3000 + r.k.length / 4, r]); }   // a longer name than the book's: the first words
        hits.sort((a, b2) => a[0] - b2[0]); tot[k] = hits.length;
        hits.slice(0, k === 'tahdhibkamal' ? (ctx && ctx.length ? 150 : 50) : 15).forEach(h => { rows.push([k, b, h[1]]); HS.set(k + '|' + h[1].n, h[0]); });
      }
      if (my !== tick) return;
      // the same short name may belong to several narrators: the neighbours of the name (isnad / teachers and students) decide
      if (ctx && ctx.length && !ctxDone && asNum == null) {
        ctxDone = true; const tkb = bookOf('tahdhibkamal'), cand = rows.filter(x => x[0] === 'tahdhibkamal');
        if (tkb && cand.length > 1 && cand.length <= 150) {
          for (const x of cand) await needRange(tkb, 'ar', x[2].n, x[2].n);
          if (my !== tick) return;
          const sc = cand.map(x => { const t = ' ' + rnorm((row(tkb, 'ar', x[2].n) || [])[1] || ''); return [ctx.reduce((a, c) => a + (t.includes(' ' + c) || t.includes(' و' + c) ? 1 : 0), 0), x]; }), mx = Math.max(...sc.map(a => a[0]));
          if (mx > 0) {
            const best = sc.filter(a => a[0] === mx);
            const pre = best.filter(a => (HS.get('tahdhibkamal|' + a[1][2].n) ?? 9e3) < 500);   // the name itself begins the headline
            if (best.length === 1 || pre.length === 1) { location.replace('#/s/rijal/' + (best.length === 1 ? best[0] : pre[0])[1][2].n); return; }
            const ordered = sc.map((a, i) => [a[0], i, a[1]]).sort((a, b2) => b2[0] - a[0] || a[1] - b2[1]).map(a => a[2]), pos = rows.map((r, i) => r[0] === 'tahdhibkamal' ? i : -1).filter(i => i >= 0);
            pos.forEach((p, i) => { rows[p] = ordered[i]; });
          }
        }
      }
      { let c50 = 0; rows = rows.filter(r => r[0] !== 'tahdhibkamal' || ++c50 <= 50); }
      if (!rows.length) { out.replaceChildren(el('p', {class: 'note'}, rt('none'))); return; }
      const els = []; let cur = null;
      rows.forEach(([k, b, r]) => {
        if (cur !== k) { cur = k; els.push(el('h3', {class: 'grp', dir: 'auto'}, (b.ar || bname(b)) + ' — ' + fmtN(tot[k]))); }
        const pn = (b.an && b.an[r.n]) || r.n, mm = k === 'tahdhibkamal' && C.rl && C.rl.d[r.n];
        const hd = bn(rjClean(r.h)), cut = hd.search(/(?<!\sبن|\sابن)\s(?:أبو|أبي|أبا|ابو|ابي|المعروف|نزيل|يقال|ويقال|مولى)\s|[،,.*]/), nmx = (cut > 3 ? hd.slice(0, cut) : hd).replace(/\s*\(\s*[0-9٠-٩]+\s*\)/g, ''), sub = cut > 3 ? hd.slice(cut).replace(/^[\s،,.*]+/, '').replace(/\s*\(\s*[0-9٠-٩]+\s*\)/g, '').slice(0, 110) : '';
        els.push(el('a', {class: 'card rjcd', href: k === 'tahdhibkamal' ? '#/s/rijal/' + r.n : '#/s/' + k + '/n/' + r.n},
          el('span', {class: 'snum'}, fmtN(pn)),
          el('span', {class: 'sinfo', lang: 'ar', dir: 'rtl'}, el('span', {class: 'rjcn'}, nmx), sub ? el('span', {class: 'rjck'}, sub) : null,
            el('span', {class: 'rjline'}, mm && mm[0] ? rankEl(mm[0]) : null, mm && mm[2] ? el('span', {class: 'rjchip'}, 'ت ' + mm[2]) : null, mm && mm[1] ? el('span', {class: 'rjchip'}, mm[1]) : null, mm && mm[3].length ? el('span', {class: 'rjbooks'}, rt('books_n')(fmtN(mm[3].length + 1))) : null, r.s ? el('span', {class: 'cs', title: rjLegend}, r.s) : null))));
      });
      out.replaceChildren(...els);
    };
    for (const k of RJ_BOOKS) { const b = bookOf(k); if (!b) continue;
      const c = el('button', {type: 'button', class: 'chip' + (sel.has(k) ? ' on' : ''), 'aria-pressed': String(sel.has(k)), on: {click: () => { sel.has(k) ? sel.delete(k) : sel.add(k); if (!sel.size) sel.add('tahdhibkamal'); chips.querySelectorAll('button').forEach(x => { const on = sel.has(x.dataset.k); x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); }); save(); draw(); }}}, (b.ar || bname(b)));
      c.dataset.k = k; chips.append(c); }
    inp.addEventListener('input', draw);
    // the books of the section: one heading for each scholar (all the books of one scholar together), numbered from 1; by the death of the scholar
    const AU = [
      ['bukhari', ['tarikhbukhari', 'sh5782', 'sh8632'], {ur: 'امام بخاری', en: 'Imam al-Bukhari', ar: 'الإمام البخاري'}],
      ['main', ['sh3508', 'sh12698'], {ur: 'امام یحیی بن معین', en: 'Yahya ibn Ma‘in', ar: 'الإمام يحيى بن معين'}],
      ['zura', ['sh816'], {ur: 'امام ابو زرعہ رازی', en: 'Abu Zur‘a ar-Razi', ar: 'أبو زرعة الرازي'}],
      ['uqayli', ['sh13041'], {ur: 'امام عقیلی', en: 'al-‘Uqayli', ar: 'العقيلي'}],
      ['razi', ['sh2170'], {ur: 'ابن ابی حاتم الرازی', en: 'Ibn Abi Hatim ar-Razi', ar: 'ابن أبي حاتم الرازي'}],
      ['hibban', ['thiqat'], {ur: 'ابن حبان', en: 'Ibn Hibban', ar: 'ابن حبان'}],
      ['adi', ['sh12579'], {ur: 'ابن عدی', en: 'Ibn ‘Adi', ar: 'ابن عدي'}],
      ['daraqutni', ['sh9082', 'sh10802'], {ur: 'امام دارقطنی', en: 'ad-Daraqutni', ar: 'الدارقطني'}],
      ['khatib', ['sh23764'], {ur: 'خطیب بغدادی', en: 'al-Khatib al-Baghdadi', ar: 'الخطيب البغدادي'}],
      ['asakir', ['sh71'], {ur: 'ابن عساکر', en: 'Ibn ‘Asakir', ar: 'ابن عساكر'}],
      ['jawzi', ['sh7351'], {ur: 'ابن الجوزی', en: 'Ibn al-Jawzi', ar: 'ابن الجوزي'}],
      ['mundhiri', ['sh9863'], {ur: 'امام منذری', en: 'al-Mundhiri', ar: 'المنذري'}],
      ['mizzi', ['tahdhibkamal'], {ur: 'امام مزی', en: 'al-Mizzi', ar: 'المزي'}],
      ['dhahabi', ['sh10906', 'sh1692', 'sh149213', 'sh26112'], {ur: 'امام ذہبی', en: 'adh-Dhahabi', ar: 'الذهبي'}],
      ['hajar', ['sh8609', 'sh1290', 'sh36357', 'sh9767'], {ur: 'حافظ ابن حجر', en: 'Ibn Hajar al-‘Asqalani', ar: 'الحافظ ابن حجر'}],
      ['qadi', ['sh132965'], {ur: 'ابن القاضی المکناسی', en: 'Ibn al-Qadi al-Miknasi', ar: 'ابن القاضي المكناسي'}],
      ['saad', ['sh146'], {ur: 'ابن سعد', en: 'Ibn Sa‘d', ar: 'ابن سعد'}]];
    let bkn = 0;
    const bk = b => el('a', {class: 'card srow2', href: '#/s/' + b.key}, el('span', {class: 'sinfo'}, el('span', {class: 'ct ar', lang: 'ar', dir: 'rtl'}, el('span', {class: 'bkno'}, fmtN(++bkn)), b.ar, window.NEWS_NEW && window.NEWS_NEW.has(b.key) ? el('span', {class: 'newtag'}, rt('newtag')) : null), el('span', {class: 'cs'}, rt('count')(fmtN(b.count)))));
    const tkb = bookOf('tahdhibkamal'), folder = tkb ? [el('h3', {class: 'grp', lang: 'ar'}, rt('folder')), el('a', {class: 'card srow2 rjfolder', href: '#/s/rijal/all'}, el('span', {class: 'sinfo'}, el('span', {class: 'ct ar', lang: 'ar', dir: 'rtl'}, rt('folderCard')), el('span', {class: 'cs', lang: 'ar', dir: 'rtl'}, rt('foldercnt')(fmtN(tkb.count)))))] : [];
    const lib = AU.flatMap(([k, ks, nm]) => { const bs = ks.map(bookOf).filter(Boolean); return bs.length ? [el('h3', {class: 'grp', lang: 'ar'}, nm.ar, bs.length > 1 ? ' (' + fmtN(bs.length) + ')' : ''), ...bs.map(bk)] : []; });
    const news = window.NEWS && window.NEWS.length ? el('details', {class: 'rjsec newsbox'}, el('summary', {}, el('span', {class: 'rjst'}, rt('newsAll'))), el('div', {class: 'newsbody'}, ...window.NEWS.map(nw => el('div', {class: 'newsitem'}, el('b', {}, (nw.t[ui] || nw.t.en || nw.t.ur) + ' — ' + nw.d), el('ul', {}, ...(nw.i[ui] || nw.i.en || nw.i.ur).map(t => el('li', {}, t))))))) : null;
    const more = el('details', {class: 'rjsec'}, el('summary', {}, el('span', {class: 'rjst'}, rt('bookwise'))), el('div', {class: 'rjinner'}, el('p', {class: 'cs'}, rt('src')), chips));
    box.append(el('div', {class: 'rjhero'}, el('h2', {}, rt('rj_hero'))), el('div', {class: 'card pad0 filterbox'}, icon('search'), inp), more, out, news, ...folder, ...lib);
    draw(); if (q) setTimeout(() => out.scrollIntoView && 0, 0);
  }

  // ===== What's new: a message once for each update (the new books and what changed); the list is also in the Hadith sciences page =====
  window.NEWS = [
    {id: '20261027', d: '27-10-2026', keys: ["sh17791", "sh131521", "sh13605", "sh8544", "sh122257", "sh7488", "sh123510", "sh123665", "sh1261", "sh10486", "sh18609", "sh1442", "sh16946", "sh9568", "sh20866", "sh6484"],
      t: {ur: '16 نئی شروحات اور متعلقہ کتب', en: '16 new commentaries and related books', ar: '١٦ شرحاً وكتاباً جديداً', bn: '১৬টি নতুন ব্যাখ্যাগ্রন্থ', hi: '16 नई शरहें और संबंधित किताबें', gu: '16 નવી શરહો અને સંબંધિત કિતાબો', fr: '16 nouveaux commentaires et livres associés'},
      i: {ur: ['بخاری کی شروحات: الکواکب الدراری، ابن بطال، التیمی، اعلام الحدیث۔', 'ابو داود: ابن رسلان، معالم السنن۔ ابن ماجہ: مغلطائی۔ ترمذی: النفح الشذی۔ موطا: المسالک۔ مسند شافعی: الرافعی۔ مشکاۃ: الطیبی۔ مصابیح: ابن الملک۔', 'شرح الرسالۃ، متن العقیدۃ الطحاویہ، الجامع لعلوم الامام احمد، شرح السنۃ للمزنی۔'],
        en: ['Commentaries on al-Bukhari: al-Kawakib ad-Darari, Ibn Battal, at-Taymi, A\u2019lam al-Hadith.', 'Abu Dawud: Ibn Raslan, Ma\u2019alim as-Sunan. Ibn Majah: Mughultay. Tirmidhi: an-Nafh ash-Shadhi. Muwatta: al-Masalik. Musnad ash-Shafi\u2019i: ar-Rafi\u2019i. Mishkat: at-Tibi. Masabih: Ibn al-Malik.', 'Sharh ar-Risalah, the Tahawiyyah creed with al-Albani\u2019s notes, al-Jami li-Ulum al-Imam Ahmad, Sharh as-Sunnah (al-Muzani).'],
        ar: ['شروح البخاري: الكواكب الدراري وابن بطال والتيمي وأعلام الحديث.', 'أبو داود: ابن رسلان ومعالم السنن. ابن ماجه: مغلطاي. الترمذي: النفح الشذي. الموطأ: المسالك. مسند الشافعي: الرافعي. المشكاة: الطيبي. المصابيح: ابن الملك.', 'شرح الرسالة ومتن العقيدة الطحاوية والجامع لعلوم الإمام أحمد وشرح السنة للمزني.'],
        bn: ['বুখারীর ব্যাখ্যা: আল-কাওয়াকিব, ইবনে বাত্তাল, আত-তাইমী, আলামুল হাদীস। আবু দাউদ, ইবনে মাজাহ, তিরমিযী, মুয়াত্তা, মিশকাত ও মাসাবীহের ব্যাখ্যা।'],
        hi: ['बुख़ारी की शरहें: अल-कवाकिब, इब्ने बत्ताल, अत-तैमी, आलामुल हदीस। अबू दाऊद, इब्ने माजा, तिर्मिज़ी, मुवत्ता, मिश्कात और मसाबीह की शरहें।'],
        gu: ['બુખારીની શરહો: અલ-કવાકિબ, ઇબ્ને બત્તાલ, અત-તૈમી, આલામુલ હદીસ. અબૂ દાઉદ, ઇબ્ને માજા, તિર્મિઝી, મુવત્તા, મિશ્કાત અને મસાબીહની શરહો.'],
        fr: ['Commentaires d’al-Bukhari : al-Kawakib, Ibn Battal, at-Taymi, A’lam al-Hadith. Abu Dawud, Ibn Majah, Tirmidhi, Muwatta, Mishkat et Masabih.']}},
    {id: '20261025d', d: '25-10-2026', keys: ['siyar'],
      t: {ur: 'سلف صالحین: سیر اعلام النبلاء سے مزید سوانح', en: 'The Salaf: more biographies from Siyar A‘lam an-Nubala', ar: 'السلف الصالح: تراجم جديدة من سير أعلام النبلاء', bn: 'সালাফে সালেহীন: সিয়ারু আ‘লামিন নুবালা থেকে আরও জীবনী', hi: 'सलफ़े सालिहीन: सियर अ‘लामिन नुबला से और जीवनियाँ', gu: 'સલફે સાલિહીન: સિયર અ‘લામિન નુબલામાંથી વધુ જીવનચરિત્રો', fr: 'Les Salaf : de nouvelles biographies tirées de Siyar A‘lam an-Nubala'},
      i: {ur: ['تابعین کے مزید حالات شامل کیے گئے ہیں، سلسلہ جاری ہے۔'],
        en: ['More biographies of the Tabi‘un have been added; more will follow.'],
        ar: ['أُضيفت تراجم جديدة للتابعين، والسلسلة مستمرة.'],
        bn: ['তাবেঈনদের আরও জীবনী যুক্ত হয়েছে; ধারা চলমান।'],
        hi: ['ताबिईन की और जीवनियाँ जोड़ी गई हैं; सिलसिला जारी है।'],
        gu: ['તાબિઈનના વધુ જીવનચરિત્રો ઉમેર્યા છે; સિલસિલો ચાલુ છે.'],
        fr: ['De nouvelles biographies des Tabi‘un ont été ajoutées ; la suite viendra.']}},
    {id: '20261024b', d: '24-10-2026', keys: ['fazail', 'seerah'],
      t: {ur: 'فضائل صحابہ اور سیرت مصطفی: بنگلہ ترجمہ شامل', en: 'Fada’il al-Sahabah and Seerah of the Prophet ﷺ: Bengali translation added', ar: 'فضائل الصحابة والسيرة: أضيفت الترجمة البنغالية', bn: 'ফাযাইলুস সাহাবা ও সীরাত: বাংলা অনুবাদ যুক্ত', hi: 'फ़ज़ाइले सहाबा और सीरत: बंगला अनुवाद जोड़ा गया', gu: 'ફઝાઇલે સહાબા અને સીરત: બંગાળી અનુવાદ ઉમેર્યો', fr: 'Mérites des Compagnons et Sīra : traduction bengali ajoutée'},
      i: {ur: ['دونوں کتابیں اب بنگلہ میں بھی پڑھی جا سکتی ہیں۔'],
        en: ['Both books can now be read in Bengali as well.'],
        ar: ['يمكن الآن قراءة الكتابين بالبنغالية أيضًا.'],
        bn: ['দুটি বইই এখন বাংলায়ও পড়া যাবে।'],
        hi: ['दोनों किताबें अब बंगला में भी पढ़ी जा सकती हैं।'],
        gu: ['બંને પુસ્તકો હવે બંગાળીમાં પણ વાંચી શકાય છે.'],
        fr: ['Les deux livres sont désormais lisibles aussi en bengali.']}},
    {id: '20261024', d: '24-10-2026', keys: ['fazail', 'seerah'],
      t: {ur: 'فضائل صحابہ اور سیرت مصطفی: انگریزی ترجمہ شامل', en: 'Fada’il al-Sahabah and Seerah of the Prophet ﷺ: English translation added', ar: 'فضائل الصحابة والسيرة: أضيفت الترجمة الإنجليزية', bn: 'ফাযাইলুস সাহাবা ও সীরাত: ইংরেজি অনুবাদ যুক্ত', hi: 'फ़ज़ाइले सहाबा और सीरत: अंग्रेज़ी अनुवाद जोड़ा गया', gu: 'ફઝાઇલે સહાબા અને સીરત: અંગ્રેજી અનુવાદ ઉમેર્યો', fr: 'Mérites des Compagnons et Sīra : traduction anglaise ajoutée'},
      i: {ur: ['دونوں کتابیں اب انگریزی میں بھی پڑھی جا سکتی ہیں، اعراب والے عربی متن کے ساتھ۔'],
        en: ['Both books can now be read in English, alongside the vocalized Arabic text.'],
        ar: ['يمكن الآن قراءة الكتابين بالإنجليزية مع النص العربي المشكول.'],
        bn: ['দুটি বইই এখন ইংরেজিতে পড়া যাবে, হরকতযুক্ত আরবি মূল পাঠসহ।'],
        hi: ['दोनों किताबें अब अंग्रेज़ी में भी पढ़ी जा सकती हैं, हरकत वाले अरबी मूल पाठ के साथ।'],
        gu: ['બંને પુસ્તકો હવે અંગ્રેજીમાં પણ વાંચી શકાય છે, હરકતવાળા અરબી મૂળ પાઠ સાથે.'],
        fr: ['Les deux livres sont désormais lisibles en anglais, avec le texte arabe vocalisé.']}},
    {id: '20261023b', d: '23-10-2026', keys: ['ab_bk'],
      t: {ur: 'آڈیو کتب: صحیح بخاری مکمل (عربی)', en: 'Audio books: Sahih al-Bukhari, complete (Arabic)', ar: 'الكتب الصوتية: صحيح البخاري كاملاً', bn: 'অডিও বই: সহীহ বুখারী সম্পূর্ণ (আরবি)', hi: 'ऑडियो किताबें: सहीह बुख़ारी पूरी (अरबी)', gu: 'ઑડિયો પુસ્તકો: સહીહ બુખારી સંપૂર્ણ (અરબી)', fr: 'Livres audio : Sahih al-Bukhari complet (arabe)'},
      i: {ur: ['آڈیو کتب اب زبان کے حساب سے فولڈروں میں ہیں (عربی، اردو، انگریزی)۔ عربی فولڈر میں پورا صحیح بخاری۔'],
        en: ['Audio books are now in folders by language (Arabic, Urdu, English). The Arabic folder has the complete Sahih al-Bukhari.'],
        ar: ['الكتب الصوتية في مجلدات حسب اللغة (العربية والأردية والإنجليزية). وفي المجلد العربي صحيح البخاري كاملاً.'],
        bn: ['অডিও বই এখন ভাষা অনুযায়ী ফোল্ডারে (আরবি, উর্দু, ইংরেজি)। আরবি ফোল্ডারে পূর্ণ সহীহ বুখারী।'],
        hi: ['ऑडियो किताबें अब भाषा के अनुसार फ़ोल्डरों में हैं (अरबी, उर्दू, अंग्रेज़ी)। अरबी फ़ोल्डर में पूरी सहीह बुख़ारी।'],
        gu: ['ઑડિયો પુસ્તકો હવે ભાષા પ્રમાણે ફોલ્ડરમાં છે (અરબી, ઉર્દૂ, અંગ્રેજી). અરબી ફોલ્ડરમાં સંપૂર્ણ સહીહ બુખારી.'],
        fr: ['Les livres audio sont rangés par langue (arabe, ourdou, anglais). Le dossier arabe contient tout Sahih al-Bukhari.']}},
    {id: '20261023', d: '23-10-2026', keys: ["sh11", "sh1260", "sh13960", "sh148870", "sh148896", "sh149015", "sh1711", "sh1712", "sh18268", "sh23833", "sh30317", "sh5737", "sh12748"],
      t: {ur: 'صحیح مسلم کی 10 شروح اور 3 دیگر کتب', en: '10 commentaries on Sahih Muslim and 3 more books', ar: '١٠ شروح لصحيح مسلم و٣ كتب أخرى', bn: 'সহীহ মুসলিমের ১০টি ব্যাখ্যা ও আরও ৩টি বই', hi: 'सहीह मुस्लिम की 10 शरहें और 3 और किताबें', gu: 'સહીહ મુસ્લિમની 10 શરહો અને 3 વધુ કિતાબો', fr: '10 commentaires de Sahih Muslim et 3 autres livres'},
      i: {ur: ['شرح النووی، شرح السیوطی، فتح المنعم، البحر المحیط الثجاج، الکوکب الوہاج، توفیق الرب المنعم، منۃ المنعم، التحریر، قرۃ عین المحتاج۔', 'سیرت ابن ہشام، المسند الجامع، مجموع مصنفات ابن البختری، فضل یوم الترویۃ و عرفۃ۔'],
        en: ['Sharh an-Nawawi, Sharh as-Suyuti, Fath al-Mun\u2019im, al-Bahr al-Muhit ath-Thajjaj, al-Kawkab al-Wahhaj, Tawfiq ar-Rabb al-Mun\u2019im, Minnat al-Mun\u2019im, at-Tahrir, Qurrat Ayn al-Muhtaj.', 'Sirah Ibn Hisham, al-Musnad al-Jami, works of Ibn al-Bukhtari, Fadl Yawm at-Tarwiyah wa Arafah.'],
        ar: ['شرح النووي وشرح السيوطي وفتح المنعم والبحر المحيط الثجاج والكوكب الوهاج وتوفيق الرب المنعم ومنة المنعم والتحرير وقرة عين المحتاج.', 'سيرة ابن هشام والمسند الجامع ومجموع مصنفات ابن البختري وفضل يوم التروية وعرفة.'],
        bn: ['সহীহ মুসলিমের ১০টি ব্যাখ্যা, সীরাত ইবনে হিশাম ও আরও কয়েকটি বই।'],
        hi: ['सहीह मुस्लिम की 10 शरहें, सीरत इब्ने हिशाम और कुछ और किताबें।'],
        gu: ['સહીહ મુસ્લિમની 10 શરહો, સીરત ઇબ્ને હિશામ અને બીજી કેટલીક કિતાબો.'],
        fr: ['10 commentaires de Sahih Muslim, la Sira d’Ibn Hisham et d’autres livres.']}},
    {id: '20261022c', d: '22-10-2026', keys: ["sh1352","sh21108","sh1714","sh21618","sh21765","sh13154","sh5922","sh21494","sh13178","sh29852","sh30361","sh8274"],
      t: {ur: 'نئی 12 کتب اور معرب احادیث', en: '12 new books and vocalized hadith', ar: '١٢ كتابًا جديدًا وأحاديث معربة', bn: '১২টি নতুন বই ও হারাকাতযুক্ত হাদীস', hi: '12 नई किताबें और हरकत वाली हदीसें', gu: '12 નવી કિતાબો અને હરકતવાળી હદીસો', fr: '12 nouveaux livres et hadiths vocalisés'},
      i: {ur: ['مجمع البحرین، شرح معانی الآثار، مستخرج ابی عوانہ، اتحاف الخیرۃ، البدر المنیر، تاریخ اصبہان، معجم ابن قانع، معجم ابن الاعرابی، مسند ابن ابی اوفی، مجلسان من امالی ابن صاعد، الخامس من الفوائد المنتقاة (دارقطنی)، المنتقى من الطبقات (ابو عروبہ)۔', 'الجامع الکامل کی 67 احادیث پر درست کیا ہوا اعراب۔'],
        en: ['Majma al-Bahrayn, Sharh Maani al-Athar, Mustakhraj Abi Awana, Ithaf al-Khiyara, al-Badr al-Munir, Tarikh Asbahan, Mujam Ibn Qani, Mujam Ibn al-Arabi, Musnad Ibn Abi Awfa.', 'Corrected i\u2019rab on 67 hadith of al-Jami al-Kamil.'],
        ar: ['مجمع البحرين وشرح معاني الآثار ومستخرج أبي عوانة وإتحاف الخيرة والبدر المنير وتاريخ أصبهان ومعجم ابن قانع ومعجم ابن الأعرابي ومسند ابن أبي أوفى.', 'إعراب مصحَّح لـ٦٧ حديثًا من الجامع الكامل.'],
        bn: ['১২টি নতুন বই এবং আল-জামিউল কামিলের ৬৭টি হাদীসে সংশোধিত হারাকাত।'],
        hi: ['12 नई किताबें और अल-जामिउल कामिल की 67 हदीसों पर सही की हुई हरकतें।'],
        gu: ['12 નવી કિતાબો અને અલ-જામિઉલ કામિલની 67 હદીસો પર સુધારેલી હરકતો.'],
        fr: ['12 nouveaux livres et voyellation corrigée de 67 hadiths d’al-Jami al-Kamil.']}},
    {id: '20261022b', d: '22-10-2026', keys: ['ab_te'],
      t: {ur: 'آڈیو کتب: تفسیر ابن کثیر (انگریزی)', en: 'Audio books: Tafsir Ibn Kathir (English)', ar: 'الكتب الصوتية: تفسير ابن كثير (بالإنجليزية)', bn: 'অডিও বই: তাফসীর ইবনে কাসীর (ইংরেজি)', hi: 'ऑडियो किताबें: तफ़सीर इब्ने कसीर (अंग्रेज़ी)', gu: 'ઑડિયો પુસ્તકો: તફસીર ઇબ્ને કસીર (અંગ્રેજી)', fr: 'Livres audio : Tafsir Ibn Kathir (anglais)'},
      i: {ur: ['انگریزی آڈیو: مقدمہ، الفاتحہ، البقرہ کا حصہ اور سورۃ الضحی تا الناس۔'],
        en: ['English audio: introduction, Al-Fatiha, part of Al-Baqarah and Ad-Duha to An-Nas.'],
        ar: ['صوتيات بالإنجليزية: المقدمة والفاتحة وجزء من البقرة والضحى إلى الناس.'],
        bn: ['ইংরেজি অডিও: ভূমিকা, আল-ফাতিহা, আল-বাকারার অংশ এবং আদ-দুহা থেকে আন-নাস।'],
        hi: ['अंग्रेज़ी ऑडियो: भूमिका, अल-फ़ातिहा, अल-बक़रा का भाग और अज़-ज़ुहा से अन-नास।'],
        gu: ['અંગ્રેજી ઑડિયો: પ્રસ્તાવના, અલ-ફાતિહા, અલ-બકરાનો ભાગ અને અઝ-ઝુહા થી અન-નાસ.'],
        fr: ['Audio en anglais : introduction, Al-Fatiha, une partie d’Al-Baqara et de Ad-Duha à An-Nas.']}},
    {id: '20261022', d: '22-10-2026', keys: ["sh10628", "sh10799", "sh11030", "sh12704", "sh12737", "sh12739", "sh12751", "sh12936", "sh12990", "sh12994", "sh12996", "sh13003", "sh13009", "sh13014", "sh13024", "sh13036", "sh13039", "sh13044", "sh13057", "sh13058", "sh13064", "sh13070", "sh13075", "sh13076", "sh13077", "sh13078", "sh13113", "sh13117", "sh13128", "sh13149", "sh13152", "sh13180", "sh13183", "sh13187", "sh21546", "sh22347", "sh26356", "sh26874", "sh28237", "sh3732", "sh6022", "sh6225", "sh6899", "sh8061", "sh8071", "sh8207", "sh8216", "sh8220", "sh8228", "sh8230", "sh8234", "sh8241", "sh8242", "sh8253", "sh8254", "sh8256", "sh8259", "sh8266", "sh8273", "sh9306", "sh9307"],
      t: {ur: 'ابن ابی الدنیا کی 61 کتب', en: '61 books of Ibn Abi ad-Dunya', ar: '٦١ كتابًا لابن أبي الدنيا', bn: 'ইবনু আবিদ-দুনইয়ার ৬১টি বই', hi: 'इब्नु अबिद-दुन्या की 61 किताबें', gu: 'ઇબ્ને અબિદ-દુન્યાની 61 કિતાબો', fr: '61 livres d’Ibn Abi ad-Dunya'},
      i: {ur: ['ایک ہی مصنف کے تحت، مکمل اعراب کے ساتھ: 13,115 روایات۔', 'الجامع الکامل کی 170 احادیث ان کتب سے جڑی ہیں؛ حدیث کے صفحے پر اصل کتاب کھل جاتی ہے۔'],
        en: ['Together under one author, fully vocalized: 13,115 reports.', '170 hadith of al-Jami al-Kamil are linked to these books; the hadith page opens the book itself.'],
        ar: ['تحت مؤلف واحد، مشكولة بالكامل: ١٣٬١١٥ رواية.', 'ارتبط بها ١٧٠ حديثًا من الجامع الكامل، وتفتح صفحة الحديث الكتاب نفسه.'],
        bn: ['এক লেখকের অধীনে, পূর্ণ হারাকাতসহ: ১৩,১১৫টি বর্ণনা।', 'আল-জামিউল কামিলের ১৭০টি হাদীস এই বইগুলোর সাথে যুক্ত; হাদীসের পাতা থেকে মূল বই খোলে।'],
        hi: ['एक ही लेखक के अंतर्गत, पूरे हरकात के साथ: 13,115 रिवायतें।', 'अल-जामिउल-कामिल की 170 हदीसें इन किताबों से जुड़ी हैं; हदीस के पन्ने से मूल किताब खुलती है।'],
        gu: ['એક જ લેખક હેઠળ, પૂર્ણ હરકત સાથે: 13,115 રિવાયતો.', 'અલ-જામિઉલ-કામિલની 170 હદીસો આ કિતાબો સાથે જોડાયેલી છે; હદીસના પાનાથી મૂળ કિતાબ ખુલે છે.'],
        fr: ['Réunis sous un seul auteur, entièrement vocalisés : 13 115 rapports.', '170 hadiths d’al-Jami al-Kamil sont reliés à ces livres ; la page du hadith ouvre le livre lui-même.']}},
    {id: '20261021', d: '19-10-2026', keys: ['sh10802', 'sh816', 'sh8238', 'sh3525'],
      t: {ur: 'چار نئی کتب', en: 'Four new books', ar: 'أربعة كتب جديدة', bn: 'চারটি নতুন বই', hi: 'चार नई किताबें', gu: 'ચાર નવી કિતાબો', fr: 'Quatre nouveaux livres'},
      i: {ur: ['رواة الحدیث میں: الضعفاء والمتروکون (دارقطنی) اور اسامی الضعفاء (ابو زرعہ رازی)۔', 'کتبِ حدیث میں: فضائل الصحابہ (دارقطنی) اور الزہد (ابو حاتم رازی)۔'],
        en: ['In the narrators section: ad-Du‘afa wal-Matrukun (ad-Daraqutni) and Asami ad-Du‘afa (Abu Zur‘a ar-Razi).', 'In the hadith books: Fada’il as-Sahabah (ad-Daraqutni) and az-Zuhd (Abu Hatim ar-Razi).'],
        ar: ['في قسم الرواة: الضعفاء والمتروكون للدارقطني وأسامي الضعفاء لأبي زرعة الرازي.', 'وفي كتب الحديث: فضائل الصحابة للدارقطني والزهد لأبي حاتم الرازي.'],
        bn: ['রাবী অংশে: আয-যু‘আফা ওয়াল-মাতরূকূন (দারাকুতনী) এবং আসামিয়ুয-যু‘আফা (আবূ যুর‘আ আর-রাযী)।', 'হাদীসের বইয়ে: ফাযাইলুস সাহাবা (দারাকুতনী) এবং আয-যুহদ (আবূ হাতিম আর-রাযী)।'],
        hi: ['रावी वाले भाग में: अज़-ज़ु‘अफ़ा वल-मतरूकून (दारक़ुतनी) और असामी अज़-ज़ु‘अफ़ा (अबू ज़ुर‘आ अर-राज़ी)।', 'हदीस की किताबों में: फ़ज़ाइलुस-सहाबा (दारक़ुतनी) और अज़-ज़ुह्द (अबू हातिम अर-राज़ी)।'],
        gu: ['રાવી વિભાગમાં: અઝ-ઝુઅફા વલ-મતરૂકૂન (દારકુતની) અને અસામી અઝ-ઝુઅફા (અબૂ ઝુરઆ અર-રાઝી).', 'હદીસની કિતાબોમાં: ફઝાઇલુસ-સહાબા (દારકુતની) અને અઝ-ઝુહ્દ (અબૂ હાતિમ અર-રાઝી).'],
        fr: ['Dans la section des narrateurs : ad-Du‘afa wal-Matrukun (ad-Daraqutni) et Asami ad-Du‘afa (Abu Zur‘a ar-Razi).', 'Dans les livres de hadith : Fada’il as-Sahabah (ad-Daraqutni) et az-Zuhd (Abu Hatim ar-Razi).']}},
    {id: '20261020', d: '19-10-2026', keys: ['sh3508', 'sh12698'],
      t: {ur: 'امام یحیی بن معین کی دو کتب', en: 'Two books of Yahya ibn Ma‘in', ar: 'كتابان ليحيى بن معين', bn: 'ইয়াহইয়া ইবনু মাঈনের দুটি বই', hi: 'इमाम यह्या बिन मईन की दो किताबें', gu: 'ઇમામ યહ્યા બિન મઈનની બે કિતાબો', fr: 'Deux livres de Yahya ibn Ma‘in'},
      i: {ur: ['تاریخ ابن معین (روایت الدوری) اور سؤالات ابن الجنید شامل کی گئی ہیں۔', 'رواة الحدیث کی فہرست میں امام بخاری کو پہلے نمبر پر اور ہر اہل علم کی کتب کو ایک ساتھ رکھا گیا ہے۔'],
        en: ['Added Tarikh Ibn Ma‘in (riwayat ad-Duri) and Su’alat Ibn al-Junayd.', 'In the narrators section Imam al-Bukhari now comes first and the books of each scholar are together.'],
        ar: ['أضيف: تاريخ ابن معين (رواية الدوري) وسؤالات ابن الجنيد.', 'في قسم الرواة صار الإمام البخاري أولًا وكتب كل عالم مجتمعة.'],
        bn: ['তারীখু ইবনি মাঈন (রিওয়ায়াতুদ-দূরী) এবং সুআলাতু ইবনিল জুনাইদ যোগ করা হয়েছে।', 'রাবী অংশে ইমাম বুখারী এখন প্রথমে এবং প্রত্যেক আলিমের বইগুলো একসাথে রাখা হয়েছে।'],
        hi: ['तारीख़ इब्न मईन (रिवायत अद-दूरी) और सुआलात इब्नुल जुनैद जोड़ी गई हैं।', 'रावी वाले भाग में इमाम बुख़ारी अब सबसे पहले हैं और हर आलिम की किताबें एक साथ रखी गई हैं।'],
        gu: ['તારીખ ઇબ્ન મઈન (રિવાયત અદ-દૂરી) અને સુઆલાત ઇબ્નુલ જુનૈદ ઉમેરવામાં આવી છે.', 'રાવી વિભાગમાં ઇમામ બુખારી હવે પહેલા ક્રમે છે અને દરેક આલિમની કિતાબો એકસાથે રાખવામાં આવી છે.'],
        fr: ['Ajout de Tarikh Ibn Ma‘in (riwayat ad-Duri) et de Su’alat Ibn al-Junayd.', 'Dans la section des narrateurs, l’imam al-Bukhari vient désormais en premier et les livres de chaque savant sont regroupés.']}},
    {id: '20261019', d: '19-10-2026', keys: ['tahdhibkamal', 'sh8609', 'sh1290', 'sh149213', 'sh36357', 'sh132965', 'sh26112', 'sh9863', 'sh5782', 'sh8632', 'sh71', 'muslimab', 'muslimtr'],
      t: {ur: 'رواة الحدیث کا نیا زمرہ اور نئی کتب', en: 'New Hadith narrators section and new books', ar: 'قسم رواة الحديث وكتب جديدة', bn: 'রাবীদের নতুন বিভাগ ও নতুন বই', hi: 'रावियों का नया भाग और नई किताबें', gu: 'રાવીઓનો નવો વિભાગ અને નવી કિતાબો', fr: 'Nouvelle section des narrateurs et nouveaux livres'},
      i: {ur: ['نیا بٹن «رواة الحدیث»: راوی کا نام لکھیں تو اس کا درجہ، طبقہ، شیوخ، تلامذہ اور تمام کتب کے اقوال ایک جگہ مل جاتے ہیں۔', 'حدیث کی سند میں راوی کے نام پر کلک کر کے اس کی معلومات دیکھیں۔', 'نئی کتب: تہذیب الکمال، تقریب التہذیب، تہذیب التہذیب، تذہیب التہذیب، لسان المیزان، التاریخ الاوسط، الضعفاء الصغیر، تاریخ دمشق، درۃ الحجال۔', 'صحیح مسلم کے دو نسخے: ترقیم عبدالباقی اور ترکی نسخہ۔'],
        en: ['New “Hadith narrators” button: type a narrator’s name to see his rank, generation, teachers, students and what every book says about him.', 'Tap a narrator in the chain of a hadith to see his details.', 'New books: Tahdhib al-Kamal, Taqrib at-Tahdhib, Tahdhib at-Tahdhib, Tadhhib, Lisan al-Mizan, at-Tarikh al-Awsat, ad-Du‘afa as-Saghir, Tarikh Dimashq, Durrat al-Hijal.', 'Two editions of Sahih Muslim: Abd al-Baqi numbering and the Turkish edition.'],
        ar: ['زر جديد «رواة الحديث»: اكتب اسم الراوي لترى رتبته وطبقته وشيوخه وتلاميذه وأقوال الكتب فيه.', 'اضغط على اسم الراوي في السند لتعرف ترجمته.', 'كتب جديدة: تهذيب الكمال، تقريب التهذيب، تهذيب التهذيب، تذهيب التهذيب، لسان الميزان، التاريخ الأوسط، الضعفاء الصغير، تاريخ دمشق، درة الحجال.', 'نسختان من صحيح مسلم: ترقيم عبد الباقي والطبعة التركية.'],
        bn: ['নতুন বোতাম «হাদীসের রাবী»: রাবীর নাম লিখলে তার মর্যাদা, তাবাকা, শিক্ষক, ছাত্র এবং সব বইয়ের উক্তি এক জায়গায় পাবেন।', 'হাদীসের সনদে রাবীর নামে ট্যাপ করে তার তথ্য দেখুন।', 'নতুন বই: তাহযীবুল কামাল, তাকরীবুত তাহযীব, তাহযীবুত তাহযীব, তাযহীবুত তাহযীব, লিসানুল মীযান, আত-তারীখুল আওসাত, আয-যু‘আফাউস সাগীর, তারীখু দিমাশক, দুররাতুল হিজাল।', 'সহীহ মুসলিমের দুটি সংস্করণ: আব্দুল বাকীর নম্বর ও তুর্কি সংস্করণ।'],
        hi: ['नया बटन «हदीस के रावी»: रावी का नाम लिखें तो उसका दर्जा, तबक़ा, उस्ताद, शागिर्द और सभी किताबों के कथन एक जगह मिल जाते हैं।', 'हदीस की सनद में रावी के नाम पर टैप करके उसकी जानकारी देखें।', 'नई किताबें: तहज़ीबुल कमाल, तक़रीबुत-तहज़ीब, तहज़ीबुत-तहज़ीब, तज़हीबुत-तहज़ीब, लिसानुल मीज़ान, अत-तारीख़ुल औसत, अज़-ज़ु‘अफ़ाउस-सग़ीर, तारीख़ दिमश्क़, दुर्रतुल हिजाल।', 'सहीह मुस्लिम के दो संस्करण: अब्दुल बाक़ी क्रमांक और तुर्की संस्करण।'],
        gu: ['નવું બટન «હદીસના રાવીઓ»: રાવીનું નામ લખો તો તેનો દરજ્જો, તબકો, ઉસ્તાદો, શાગિર્દો અને બધી કિતાબોના કથનો એક જ જગ્યાએ મળે છે.', 'હદીસની સનદમાં રાવીના નામ પર ટૅપ કરીને તેની માહિતી જુઓ.', 'નવી કિતાબો: તહઝીબુલ કમાલ, તકરીબુત-તહઝીબ, તહઝીબુત-તહઝીબ, તઝહીબુત-તહઝીબ, લિસાનુલ મીઝાન, અત-તારીખુલ ઔસત, અઝ-ઝુઅફાઉસ-સગીર, તારીખ દિમશ્ક, દુર્રતુલ હિજાલ.', 'સહીહ મુસ્લિમની બે આવૃત્તિઓ: અબ્દુલ બાકી ક્રમાંક અને તુર્કી આવૃત્તિ.'],
        fr: ['Nouveau bouton « Narrateurs du hadith » : saisissez le nom d’un narrateur pour voir son rang, sa génération, ses maîtres, ses élèves et ce que dit chaque livre à son sujet.', 'Touchez le nom d’un narrateur dans la chaîne d’un hadith pour voir ses informations.', 'Nouveaux livres : Tahdhib al-Kamal, Taqrib at-Tahdhib, Tahdhib at-Tahdhib, Tadhhib, Lisan al-Mizan, at-Tarikh al-Awsat, ad-Du‘afa as-Saghir, Tarikh Dimashq, Durrat al-Hijal.', 'Deux éditions de Sahih Muslim : numérotation d’Abd al-Baqi et édition turque.']}},
    {id: '20261018', d: '18-10-2026', keys: ['sh1673', 'sh5930', 'sh12579', 'sh2170', 'sh6847', 'sh9082', 'sh11428', 'sh1581', 'sh4445', 'sh10495', 'sh1692', 'sh9767', 'sh236', 'sh1719', 'sh22804', 'sh30108', 'sh22547', 'sh23764', 'sh146', 'sh7351', 'sh11385', 'sh13041', 'sh2186', 'sh5635', 'sh1655', 'sh13170', 'sh13071', 'sh11333', 'sh13043', 'sh22367', 'sh7289', 'sh26324'],
      t: {ur: 'نئی بڑی کتب شامل', en: 'Major new books added', ar: 'إضافة كتب كبيرة جديدة', bn: 'বড় বড় নতুন বই যোগ', hi: 'बड़ी नई किताबें जोड़ी गईं', gu: 'મોટી નવી કિતાબો ઉમેરાઈ', fr: 'Ajout de grands livres'},
      i: {ur: ['فتح الباری، التمہید، التلخیص الحبیر، نصب الرایۃ، تحفۃ الأشراف، إتحاف المہرۃ، الترغیب والترہیب اور دیگر کئی کتب شامل کی گئی ہیں۔', 'السنۃ (ابن ابی عاصم)، الکامل (ابن عدی)، الجرح والتعدیل، العلل (دارقطنی)، میزان الاعتدال، الإصابۃ، البدایۃ والنہایۃ، حلیۃ الاولیاء، تاریخ بغداد، الطبقات الکبری، الأم، المجموع، مجموع الفتاوی وغیرہ۔'],
        en: ['Added Fath al-Bari, at-Tamhid, at-Talkhis al-Habir, Nasb ar-Rayah, Tuhfat al-Ashraf, Ithaf al-Mahara, at-Targhib wat-Tarhib and many more.', 'Also as-Sunnah (Ibn Abi Asim), al-Kamil (Ibn Adi), al-Jarh wa’t-Ta‘dil, al-Ilal (ad-Daraqutni), Mizan al-I‘tidal, al-Isabah, al-Bidayah wan-Nihayah, Hilyat al-Awliya, Tarikh Baghdad, at-Tabaqat al-Kubra, al-Umm, al-Majmu‘, Majmu‘ al-Fatawa and others.'],
        ar: ['أضيف: فتح الباري، التمهيد، التلخيص الحبير، نصب الراية، تحفة الأشراف، إتحاف المهرة، الترغيب والترهيب وغيرها.', 'والسنة لابن أبي عاصم، الكامل لابن عدي، الجرح والتعديل، علل الدارقطني، ميزان الاعتدال، الإصابة، البداية والنهاية، حلية الأولياء، تاريخ بغداد، الطبقات الكبرى، الأم، المجموع، مجموع الفتاوى وغيرها.'],
        bn: ['ফাতহুল বারী, আত-তামহীদ, আত-তালখীসুল হাবীর, নাসবুর রায়াহ, তুহফাতুল আশরাফ, ইতহাফুল মাহারা, আত-তারগীব ওয়াত-তারহীব এবং আরও অনেক বই যোগ করা হয়েছে।', 'আরও: আস-সুন্নাহ (ইবনু আবী আসিম), আল-কামিল (ইবনু আদী), আল-জারহ ওয়াত-তা‘দীল, আল-ইলাল (দারাকুতনী), মীযানুল ই‘তিদাল, আল-ইসাবা, আল-বিদায়া ওয়ান-নিহায়া, হিলয়াতুল আওলিয়া, তারীখু বাগদাদ, আত-তাবাকাতুল কুবরা, আল-উম্ম, আল-মাজমূ‘, মাজমূউল ফাতাওয়া ইত্যাদি।'],
        hi: ['फ़त्हुल बारी, अत-तम्हीद, अत-तल्ख़ीसुल हबीर, नस्बुर-राया, तुह्फ़तुल अशराफ़, इत्हाफ़ुल महरा, अत-तर्ग़ीब वत-तर्हीब और कई अन्य किताबें जोड़ी गई हैं।', 'साथ ही: अस-सुन्नह (इब्न अबी आसिम), अल-कामिल (इब्न अदी), अल-जर्ह वत-तादील, अल-इलल (दारक़ुतनी), मीज़ानुल ऐतिदाल, अल-इसाबा, अल-बिदाया वन-निहाया, हिल्यतुल औलिया, तारीख़ बग़दाद, अत-तबक़ातुल कुब्रा, अल-उम्म, अल-मजमू‘, मजमू‘ुल फ़तावा आदि।'],
        gu: ['ફત્હુલ બારી, અત-તમ્હીદ, અત-તલ્ખીસુલ હબીર, નસ્બુર-રાયા, તુહ્ફતુલ અશરાફ, ઇતહાફુલ મહરા, અત-તરગીબ વત-તરહીબ અને બીજી ઘણી કિતાબો ઉમેરવામાં આવી છે.', 'તેમજ: અસ-સુન્નહ (ઇબ્ન અબી આસિમ), અલ-કામિલ (ઇબ્ન અદી), અલ-જર્હ વત-તઅદીલ, અલ-ઇલલ (દારકુતની), મીઝાનુલ ઇ‘તિદાલ, અલ-ઇસાબા, અલ-બિદાયા વન-નિહાયા, હિલ્યતુલ ઔલિયા, તારીખ બગદાદ, અત-તબકાતુલ કુબ્રા, અલ-ઉમ્મ, અલ-મજમૂઅ, મજમૂઉલ ફતાવા વગેરે.'],
        fr: ['Ajout de Fath al-Bari, at-Tamhid, at-Talkhis al-Habir, Nasb ar-Rayah, Tuhfat al-Ashraf, Ithaf al-Mahara, at-Targhib wat-Tarhib et bien d’autres.', 'Également as-Sunnah (Ibn Abi Asim), al-Kamil (Ibn Adi), al-Jarh wa’t-Ta‘dil, al-Ilal (ad-Daraqutni), Mizan al-I‘tidal, al-Isabah, al-Bidayah wan-Nihayah, Hilyat al-Awliya, Tarikh Baghdad, at-Tabaqat al-Kubra, al-Umm, al-Majmu‘, Majmu‘ al-Fatawa et d’autres.']}}
  ];
  (() => { const cut = Date.now() - 30 * 864e5; window.NEWS_NEW = new Set(window.NEWS.filter(n => { const [dd, mm, yy] = n.d.split('-'); return new Date(+yy, mm - 1, +dd).getTime() > cut; }).flatMap(n => n.keys)); })();
  setTimeout(() => { try {
    const last = window.NEWS[0], seen = localStorage.newsSeen;
    if (seen === last.id) return;
    const existing = localStorage.length > 0;
    localStorage.newsSeen = last.id;
    if (!existing || !window.sheet) return;               // a new installation does not need the message
    const L = k => k[ui] || k.en || k.ur;
    window.sheet(rt('news'), [el('p', {class: 'grp', dir: 'auto'}, L(last.t)), el('ul', {class: 'newsul', dir: ui === 'ur' || ui === 'ar' ? 'rtl' : 'ltr'}, ...L(last.i).map(t => el('li', {}, t)))],
      [[T('hClose') || 'OK', null], [(RJT[ui] || RJT.en).title, () => { location.hash = '#/s/rijal'; }]]);
    if (window.Notification && Notification.permission === 'granted' && navigator.serviceWorker) navigator.serviceWorker.ready.then(r => r.showNotification(L(last.t), {body: L(last.i)[0], icon: 'icon-192.png', tag: 'news-' + last.id, data: {url: '#/s/rijal'}})).catch(() => {});
  } catch (e) {} }, 3500);

  setTimeout(() => index().catch(() => {}), 0);

  // the search button of the top bar, inside an open book: hadith number, words (all / any) or a whole sentence, in this book only
  async function bookSearch(key) {
    const b = bookOf(key) || (await index()).find(x => x.key === key); if (!b || b.ext) return false;
    const lang = getLang(b), inp = el('input', {type: 'search', class: 'filter', placeholder: T('cSecSearch').replace(/\s*\(.*\)\s*$/, ''), 'aria-label': T('cSecSearch'), style: 'width:100%'});
    const res = el('div', {class: 'bsres'}); let tm, run;
    const bar = modeBar(() => { if (inp.value.trim()) run(); });
    const secOf = n => (b.sections || []).find(s => s[2] <= n && n <= s[3]);
    run = async () => {
      const v = inp.value.trim(), num = toNum(v); if (!v) return res.replaceChildren();
      res.replaceChildren(el('p', {class: 'note'}, T('loading')));
      if (num != null) {                          // a hadith number: open it in the book
        const n = b.an && Object.keys(b.an).length && C.rev[b.key] && C.rev[b.key][num] ? C.rev[b.key][num] : num;
        await needRange(b, 'ar', n, n); if (lang) await needRange(b, lang, n, n);
        if (!row(b, 'ar', n)) return res.replaceChildren(el('p', {class: 'note'}, T('cNotHere')));
        const sc = secOf(n); res.replaceChildren(card(b, n, lang));
        if (sc) res.append(el('a', {class: 'btn lbtn', href: '#/s/' + b.key + '/' + sc[0], on: {click: () => document.querySelectorAll('.sheetbg').forEach(x => x.remove())}}, T('cOpen')));
        return;
      }
      const q = norm(v.replace(/[&+،,]/g, ' ')).split(' ').filter(Boolean); if (!q.length) return res.replaceChildren();
      const hits = await findIn(b, q, lang, GSMODE());
      res.replaceChildren(el('div', {class: 'qsbar'}, el('span', {class: 'cs'}, T('results') + ': ' + fmtN(hits.length))));
      let shown = 0; const more = el('button', {class: 'btn more', type: 'button'}, T('more'));
      const add = () => { hits.slice(shown, shown + 20).forEach((n, i) => { const c = card(b, n, lang, q); c.prepend(el('span', {class: 'rno'}, fmtN(shown + i + 1) + '.'));
        const sc = secOf(n); if (sc) c.append(el('a', {class: 'btn lbtn', href: '#/s/' + b.key + '/' + sc[0], on: {click: () => document.querySelectorAll('.sheetbg').forEach(x => x.remove())}}, T('cOpen')));
        res.insertBefore(c, more); }); shown += 20; if (shown >= hits.length) more.remove(); };
      res.append(more); more.addEventListener('click', add); add();
    };
    inp.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(run, 350); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { clearTimeout(tm); run(); } });
    window.sheet(bname(b), [inp, bar, res], [[T('hClose') || 'Close', null]]);
    setTimeout(() => inp.focus(), 50);
    return true;
  }
  window.COLL = {
    bookSearch,
    // owner panel: text corrections (published settings, keyed book|lang|number) and a reader for the editor
    applyFixes(fx) { C.fixes = fx || {}; for (const k in C.fixes) { const p = k.split('|'), m = C.data[p[0] + '|' + p[1]], r = m && m.get(+p[2]); if (r) { const c = r.slice(); c[1] = C.fixes[k]; m.set(+p[2], c); } } },
    admin: {
      async list() { return (await index()).filter(b => !b.ext); },
      async text(key, lang, n) {
        await index(); const b = bookOf(key); if (!b) return null;
        await needRange(b, lang, n, n); const r = row(b, lang, n); return r ? r[1] : null;
      }
    },
    printed(key, n) { const b = C.idx && C.idx.find(x => x.key === key); return b ? (b.an && b.an[n]) || n : n; },
    async route(h) {
      await index();
      if (/^#\/s\/rijal\/all/.test(h)) { const lm = h.match(/[?&]l=([^&]*)/), rm2 = h.match(/[?&]r=([^&]*)/); const bm2 = h.match(/[?&]b=([^&]*)/); return showRijalAll(lm ? decodeURIComponent(lm[1]) : '', rm2 ? decodeURIComponent(rm2[1]) : '', bm2 ? bm2[1] : ''); }
      { const rm = h.match(/^#\/s\/rijal\/(\d+)/); if (rm) return showRijalMaster(+rm[1]); }
      if (/^#\/s\/rijal(?:\?|$)/.test(h)) { const qq = h.match(/[?&]q=([^&]*)/); const cc = h.match(/[?&]c=([^&]*)/); return showRijal(qq ? decodeURIComponent(qq[1]) : '', cc ? decodeURIComponent(cc[1]).split('|') : null); }
      const m = h.match(/^#\/s\/([a-z0-9]+)(?:\/(n\/)?(\d+))?/), b = m && bookOf(m[1]);
      if (!b) { $('#list').replaceChildren(el('p', {class: 'note'}, T('nf'))); return; }
      if (b.ext) { bar(bname(b), '', true); $('#list').replaceChildren(el('div', {class: 'card'}, el('p', {}, T('cExt')), el('a', {class: 'btn lbtn', href: b.ext + '#/s/' + b.key, target: '_blank', rel: 'noopener'}, T('cOpenExt')))); return; }
      if (m[2]) return showOne(b, +m[3]);
      if (m[3]) return showSection(b, m[3]);
      // a book opens straight into reading, in order (where the reader stopped last time, else the first chapter); the contents page is one button away
      if (!/[?&]idx/.test(h) && b.sections && b.sections.length) {
        let last = null; try { last = localStorage['rd:' + b.key]; } catch (e) {}
        const st = (last != null && b.sections.find(x => String(x[0]) === String(last))) || b.sections[0];
        try { history.replaceState(history.state, '', '#/s/' + b.key + '/' + st[0]); } catch (e) {}
        return showSection(b, st[0]);
      }
      return showBook(b);
    },
    async list() { return index(); },
    showSearch,
    showHadithSearch, hsEmbed: (q, out) => showHadithSearch({q, out}),
    dorarList: async q => { try { const r = await fetch('/api/dorar?q=' + encodeURIComponent(q) + '&page=1'); if (!r.ok) return null; return dorarParse((await r.json()).html || ''); } catch (e) { return null; } },
    // one hadith for the compare page: {title, text, grade, href} (or {title, ext} for a book in the other link)
    async item(key, printed, n) {
      await index(); const b = bookOf(key); if (!b) return null;
      if (b.ext) return {title: bname(b), ext: b.ext};
      const k = n || (C.rev[key] && C.rev[key][printed]) || +printed;
      await needRange(b, 'ar', k, k); if (b.langs.includes('en')) await needRange(b, 'en', k, k);
      const r = row(b, 'ar', k); if (!r) return null;
      const e = row(b, 'en', k);
      return {title: bname(b) + ' ' + fmtN(b.an[k] || k), text: r[1], grade: (e && e[2]) || r[2] || '', href: '#/s/' + key + '/n/' + k};
    },
    // every Arabic text a book has under one printed number (Muslim 899 → 899.01, 899.02 …)
    async variants(key, printed) {
      await index(); const b = bookOf(key); if (!b || b.ext) return [];
      const ns = Object.keys(b.an || {}).length ? Object.keys(b.an).filter(n => parseInt(b.an[n], 10) === +printed).map(Number) : [+printed];
      const out = []; for (const n of ns.slice(0, 8)) { await needRange(b, 'ar', n, n); const r = row(b, 'ar', n); if (r) out.push(r[1]); }
      return out;
    },
    // the text of one row (null when the book or language is not here)
    async text(key, lang, n) { await index(); const b = bookOf(key); if (!b || b.ext || !b.langs.includes(lang)) return null; await needRange(b, lang, n, n); const r = row(b, lang, n); return r ? r[1] : null; },
    async toN(key, printed) { await index(); return ((C.rev || {})[key] || {})[printed] || 0; },
    async bookName(key) { await index(); const b = bookOf(key); return b ? bname(b) : key; },
    async count(key) { await index(); const b = bookOf(key); return b ? b.count : 0; },
    // an Urdu translation for a Jami hadith from the first of its takhrij books that has one in the app: {text, book, num} or null
    async urFor(refs) {
      await index();
      for (const r of (refs || [])) {
        const kk = r.key.split('/')[0]; if (kk !== r.key && kk !== 'bukhari') continue;   // «مسلم/الامارہ 73» counts inside its kitab: not a safe number
        const b = bookOf(kk); if (!b || b.ext || !b.langs.includes('ur')) continue;
        const printed = parseInt(r.number, 10); if (!printed) continue;
        const n = (C.rev[kk] && C.rev[kk][printed]) || (Object.keys(b.an || {}).length ? 0 : printed); if (!n) continue;
        await needRange(b, 'ur', n, n); const x = row(b, 'ur', n); if (x && x[1]) return {text: x[1], book: bname(b), num: fmtN(b.an[n] || n)};
      }
      return null;
    },
    sanad: txt => { const sn = sanadNames(txt); return sn.map((x, i) => ({a: x.a, b: x.b, href: '#/s/rijal?q=' + encodeURIComponent(x.q) + rjCtx([sn[i - 1], sn[i + 1]].filter(Boolean).map(y => y.q))})); },
    has: k => ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik', 'hakim'].includes(k) || !!bookOf(k),
    name: b => { if (typeof b === 'string') { b = bookOf(b); if (!b) return ''; } return bname(b); },
    // reference chip in a Jami hadith (e.g. «مسلم 1907»): show that hadith from the book, by its printed number
    async refBox(key, printed, box, linked) {
      await index(); const b = bookOf(key); if (!b) return false;
      if (b.ext) { box.append(el('p', {class: 'note'}, T('cExt')), el('a', {class: 'btn lbtn', href: b.ext + '#/s/' + b.key, target: '_blank', rel: 'noopener'}, T('cOpenExt'))); return true; }
      const lang = getLang(b), an = b.an || {};
      // a printed (Abd al-Baqi) number can hold several hadith (Muslim 1442 → 1442.01 …): show all of them, each with both numberings
      let ns = linked ? [linked] : Object.keys(an).length ? Object.keys(an).filter(k => parseInt(an[k], 10) === +printed && !(b.nn && b.nn[k])).map(Number).sort((x, y) => x - y) : [];
      if (!ns.length) ns = [linked || (C.rev[key] && C.rev[key][printed]) || printed];
      ns = ns.slice(0, 12); let shown = 0;
      for (const n of ns) {
        await needRange(b, 'ar', n, n); if (lang) await needRange(b, lang, n, n);
        if (!row(b, 'ar', n)) continue;
        const c = card(b, n, lang); c.querySelector('.top').append(el('a', {class: 'btn', href: '#/s/' + key + '/n/' + n}, T('cOpen')));
        if (!shown && ns.length > 1) box.append(el('p', {class: 'note'}, ({ur: 'اس ترقیم کے تحت ' + ns.length + ' احادیث ہیں:', ar: 'تحت هذا الرقم ' + ns.length + ' أحاديث:', en: ns.length + ' hadith under this number:', hi: 'इस क्रमांक के तहत ' + ns.length + ' हदीसें:', bn: 'এই নম্বরে ' + ns.length + 'টি হাদীস:', gu: 'આ ક્રમાંક હેઠળ ' + ns.length + ' હદીસો:', fr: ns.length + ' hadiths sous ce numéro :'}[ui] || ns.length + ' hadith under this number:')));
        box.append(c); shown++;
      }
      if (!shown) box.append(el('p', {class: 'note'}, T('cNotHere')));
      return true;
    },
    async bookmarkCard(scope, n) { await index(); const b = bookOf(scope.slice(2)); if (!b) return null; const lang = getLang(b); await needRange(b, 'ar', n, n); if (lang) await needRange(b, lang, n, n); return card(b, n, lang); }};
})();
