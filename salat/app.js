/* صلاۃ خیرالقرون — web version for the iPhone home screen. No server: everything is worked out on the phone. */
(() => {
const $ = id => document.getElementById(id);
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v) } catch (e) { return d } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} } };

const T = {
  ur: { tabs: ['ہوم', 'کیلنڈر', 'قبلہ', 'ترتیبات'], fajr: 'فجر', sunrise: 'طلوعِ آفتاب', dhuhr: 'ظہر', jumuah: 'جمعہ', asr: 'عصر', maghrib: 'مغرب', isha: 'عشاء',
    next: 'اگلی نماز', left: 'باقی وقت', am: 'صبح', pm: 'شام', days: ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'], ah: 'ھ',
    up: 'آنے والے', inDays: n => n + ' دن میں', today: 'آج', tomorrow: 'کل', ramadan: 'رمضان المبارک کا آغاز', fitr: 'عید الفطر', ten: 'ذوالحجہ کے دس دن', adha: 'عید الاضحیٰ',
    city: 'شہر', search: 'تلاش', ph: 'شہر کا نام', gps: 'میرا موجودہ مقام', calc: 'حساب', method: 'اوقات کا طریقہ', asrL: 'عصر', std: 'عام (شافعی، مالکی، حنبلی)', han: 'حنفی', adj: 'ہجری تاریخ میں فرق', h24: 'گھڑی', h12: '12 گھنٹے', h24t: '24 گھنٹے', lang: 'زبان',
    none: 'کوئی شہر نہیں ملا', myLoc: 'میرا مقام', net: 'انٹرنیٹ نہیں ہے', locBusy: 'مقام معلوم ہو رہا ہے…', locFail: 'مقام نہیں مل سکا',
    qTitle: 'قبلہ', deg: 'شمال سے', km: 'کلومیٹر کعبہ تک', compass: 'قطب نما چالو کریں', qNote: 'قطب نما فون کے مقناطیسی حساس پر چلتا ہے؛ اسے 8 کی شکل میں گھما کر درست کریں اور دھات یا مقناطیس سے دور رکھیں۔ سمت کا زاویہ ہر صورت درست ہے۔', qNo: 'اس فون پر قطب نما نہیں چل سکا؛ اوپر کا زاویہ دیکھ کر شمال سے سمت لیں۔',
    homeNote: 'یہ ویب ایپ ہے: اذان کی آواز، اطلاعات، وائبریشن اور ویجٹ اس میں نہیں ہیں۔ یہ سب اینڈرائیڈ ایپ میں ہیں۔',
    sNote: 'اوقات آپ کے شہر کے مقام اور منتخب طریقے سے فون پر ہی نکلتے ہیں؛ انٹرنیٹ کے بغیر بھی چلتے ہیں۔ شہر کی تلاش کے لیے انٹرنیٹ چاہیے۔',
    install: 'سفاری میں یہ صفحہ کھولیں ← نیچے شیئر کا بٹن ← «ہوم اسکرین میں شامل کریں»۔ پھر یہ ایپ کی طرح ہوم اسکرین سے کھلے گی۔',
    methods: { mwl: 'مسلم ورلڈ لیگ', isna: 'شمالی امریکہ (ISNA)', karachi: 'جامعہ علومِ اسلامیہ کراچی', makkah: 'ام القریٰ، مکہ', egypt: 'مصر', gulf: 'خلیج', kuwait: 'کویت', qatar: 'قطر', singapore: 'سنگاپور/ملائشیا', turkey: 'ترکی (دیانت)', france: 'فرانس', russia: 'روس' } },
  ar: { tabs: ['الرئيسية', 'التقويم', 'القبلة', 'الإعدادات'], fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', jumuah: 'الجمعة', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
    next: 'الصلاة القادمة', left: 'الوقت المتبقي', am: 'ص', pm: 'م', days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'], ah: 'هـ',
    up: 'قريبًا', inDays: n => 'بعد ' + n + ' يوم', today: 'اليوم', tomorrow: 'غدًا', ramadan: 'بداية رمضان', fitr: 'عيد الفطر', ten: 'عشر ذي الحجة', adha: 'عيد الأضحى',
    city: 'المدينة', search: 'بحث', ph: 'اسم المدينة', gps: 'موقعي الحالي', calc: 'الحساب', method: 'طريقة الحساب', asrL: 'العصر', std: 'عادي (الجمهور)', han: 'حنفي', adj: 'تعديل التاريخ الهجري', h24: 'الساعة', h12: '12 ساعة', h24t: '24 ساعة', lang: 'اللغة',
    none: 'لم يُعثر على مدينة', myLoc: 'موقعي', net: 'لا يوجد اتصال بالإنترنت', locBusy: 'جارٍ تحديد الموقع…', locFail: 'تعذّر تحديد الموقع',
    qTitle: 'القبلة', deg: 'من الشمال', km: 'كم إلى الكعبة', compass: 'تشغيل البوصلة', qNote: 'البوصلة تعتمد على مستشعر الهاتف؛ حرّكه على شكل 8 للمعايرة وأبعده عن المعادن والمغناطيس. الزاوية المذكورة صحيحة دائمًا.', qNo: 'تعذّر تشغيل البوصلة على هذا الهاتف؛ استعن بزاوية القبلة من الشمال.',
    homeNote: 'هذه نسخة ويب: لا أذان ولا إشعارات ولا اهتزاز ولا ودجت؛ هذه كلها في تطبيق أندرويد.',
    sNote: 'تُحسب الأوقات على الهاتف نفسه حتى بدون إنترنت. البحث عن مدينة يحتاج إلى الإنترنت.',
    install: 'افتح الصفحة في سفاري ← زر المشاركة ← «إضافة إلى الشاشة الرئيسية».',
    methods: { mwl: 'رابطة العالم الإسلامي', isna: 'أمريكا الشمالية (ISNA)', karachi: 'جامعة العلوم الإسلامية كراتشي', makkah: 'أم القرى', egypt: 'مصر', gulf: 'الخليج', kuwait: 'الكويت', qatar: 'قطر', singapore: 'سنغافورة/ماليزيا', turkey: 'تركيا (ديانت)', france: 'فرنسا', russia: 'روسيا' } },
  en: { tabs: ['Home', 'Calendar', 'Qibla', 'Settings'], fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', jumuah: "Jumu'ah", asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
    next: 'Next prayer', left: 'Time left', am: 'am', pm: 'pm', days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], ah: 'AH',
    up: 'Coming up', inDays: n => 'in ' + n + ' days', today: 'today', tomorrow: 'tomorrow', ramadan: 'Ramadan begins', fitr: 'Eid al-Fitr', ten: 'First ten days of Dhul-Hijjah', adha: 'Eid al-Adha',
    city: 'City', search: 'Search', ph: "City's name", gps: 'My current location', calc: 'Calculation', method: 'Method', asrL: 'Asr', std: 'Standard (Shafi\'i, Maliki, Hanbali)', han: 'Hanafi', adj: 'Hijri date adjustment', h24: 'Clock', h12: '12-hour', h24t: '24-hour', lang: 'Language',
    none: 'No city found', myLoc: 'My location', net: 'No internet', locBusy: 'Finding your location…', locFail: 'Could not find your location',
    qTitle: 'Qibla', deg: 'from north', km: 'km to the Kaaba', compass: 'Turn the compass on', qNote: "The compass uses the phone's magnetic sensor; move the phone in a figure 8 to calibrate it and keep it away from metal and magnets. The angle above is always right.", qNo: 'The compass could not start on this phone; use the angle from north above.',
    homeNote: 'This is the web version: no adhan sound, notifications, vibration or widgets; those are in the Android app.',
    sNote: 'Times are worked out on the phone from the city and the method, also without internet. Searching for a city needs internet.',
    install: 'Open this page in Safari → the Share button → "Add to Home Screen". It then opens from the home screen like an app.',
    methods: { mwl: 'Muslim World League', isna: 'North America (ISNA)', karachi: 'Karachi (Univ. of Islamic Sciences)', makkah: 'Umm al-Qura, Makkah', egypt: 'Egypt', gulf: 'Gulf', kuwait: 'Kuwait', qatar: 'Qatar', singapore: 'Singapore / Malaysia', turkey: 'Turkey (Diyanet)', france: 'France', russia: 'Russia' } }
};
const MONTHS = {
  ur: ['محرم', 'صفر', 'ربیع الاول', 'ربیع الثانی', 'جمادی الاولیٰ', 'جمادی الثانیہ', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذوالقعدہ', 'ذوالحجہ'],
  ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
  en: ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhul-Qa'dah", 'Dhul-Hijjah']
};

let S = Object.assign({
  place: { name: 'Mississauga', lat: 43.589, lng: -79.644, tz: 'America/Toronto', cc: 'CA' },
  method: null, asr: 1, adj: 0, h24: false, lang: (navigator.language || '').startsWith('ar') ? 'ar' : (navigator.language || '').startsWith('en') ? 'en' : 'ur'
}, store.get('salat', {}));
const save = () => store.set('salat', S);
const L = () => T[S.lang];
const method = () => S.method || PC.defaultMethod(S.place.cc);
const num = n => { n = String(n); return S.lang === 'ar' ? n.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : n };

/* ---------- time in the chosen city ---------- */
const fmtCache = {};
function parts(date, tz) {
  const f = fmtCache[tz] || (fmtCache[tz] = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', weekday: 'short' }));
  const o = {}; for (const p of f.formatToParts(date)) o[p.type] = p.value;
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour, mi: +o.minute, s: +o.second, wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday) };
}
function tzOffset(tz, y, m, d) {
  const dt = new Date(Date.UTC(y, m - 1, d, 12)), p = parts(dt, tz);
  return (Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - dt.getTime()) / 3600000;
}
/** the six times of a calendar day in the city, as Dates */
function dayTimes(y, m, d) {
  const pl = S.place, tz = tzOffset(pl.tz, y, m, d);
  const r = PC.compute(y, m, d, pl.lat, pl.lng, tz, method(), S.asr);
  const out = {};
  for (const k in r) out[k] = isNaN(r[k]) ? null : new Date(Date.UTC(y, m - 1, d) + Math.round(r[k] * 3600) * 1000 - Math.round(tz * 3600) * 1000);
  return out;
}
const addDays = (y, m, d, n) => { const t = new Date(Date.UTC(y, m - 1, d + n)); return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()] };
function clock(date) {
  if (!date) return '—';
  const p = parts(date, S.place.tz), h = p.h, mi = String(p.mi).padStart(2, '0');   // the minute is not rounded up: 7:34:42 shows 7:34, as in the Android app
  if (S.h24) return num(String(h).padStart(2, '0') + ':' + mi);
  return num((h % 12 === 0 ? 12 : h % 12) + ':' + mi) + ' ' + (h < 12 ? L().am : L().pm);
}

/* ---------- hijri (Umm al-Qura), the date changes at Maghrib ---------- */
const hf = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { timeZone: 'UTC', day: 'numeric', month: 'numeric', year: 'numeric' });
function hijriOfGreg(y, m, d) {   // the Gregorian day y-m-d (+ the user's adjustment) → [year, month, day]
  const o = {}; for (const p of hf.formatToParts(new Date(Date.UTC(y, m - 1, d - S.adj, 12)))) o[p.type] = p.value;
  return [+o.year, +o.month, +o.day];
}
const hijriMonthName = m => MONTHS[S.lang][m - 1];
const hijriText = h => num(h[2]) + ' ' + hijriMonthName(h[1]) + ' ' + num(h[0]) + ' ' + L().ah;

/* ---------- pages ---------- */
let page = 'home', calFirst = null;
function go(p) {
  page = p;
  for (const id of ['home', 'cal', 'qibla', 'set']) $('p-' + id).classList.toggle('hide', id !== p);
  document.querySelectorAll('nav.tabs button').forEach(b => b.classList.toggle('on', b.dataset.p === p));
  if (p === 'cal') drawCal(); if (p === 'qibla') drawQibla(); if (p === 'set') drawSettings();
  scrollTo(0, 0);
}
window.go = go;

function drawTabs() {
  const ids = ['home', 'cal', 'qibla', 'set'], icons = ['🕌', '📅', '🧭', '⚙️'];
  $('tabs').innerHTML = ids.map((id, i) => `<button data-p="${id}" class="${page === id ? 'on' : ''}"><span>${icons[i]}</span>${L().tabs[i]}</button>`).join('');
  $('tabs').querySelectorAll('button').forEach(b => b.onclick = () => go(b.dataset.p));
}

let tick = null;
function now() { return new Date() }
function drawHome() {
  const p = parts(now(), S.place.tz), t = L();
  const today = dayTimes(p.y, p.m, p.d);
  const [ty, tm, td] = addDays(p.y, p.m, p.d, 1), tomorrow = dayTimes(ty, tm, td);
  const [yy, ym, yd] = addDays(p.y, p.m, p.d, -1), yesterday = dayTimes(yy, ym, yd);
  const afterMaghrib = today.maghrib && now() >= today.maghrib;
  const [gy, gm, gd] = afterMaghrib ? [ty, tm, td] : [p.y, p.m, p.d];
  $('city').textContent = '📌 ' + S.place.name;
  $('hijri').textContent = hijriText(hijriOfGreg(gy, gm, gd));
  $('dayname').textContent = t.days[p.wd];
  $('greg').textContent = num(new Date(Date.UTC(p.y, p.m - 1, p.d)).toLocaleDateString(S.lang === 'ur' ? 'ur-PK-u-nu-latn' : S.lang === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }));
  const friday = p.wd === 5;
  const order = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const label = k => k === 'dhuhr' && friday ? t.jumuah : t[k];
  const list = [...order.map(k => [k, today[k]]), ['fajr', tomorrow.fajr, true]];
  let idx = list.findIndex(x => x[1] && now() < x[1]);
  if (idx < 0) idx = list.length - 1;
  const nx = list[idx];
  // the prayer going on now: the one before the next (sunrise is a mark, not a prayer)
  let curKey = null;
  if (idx === 0) curKey = 'isha'; else { const pk = list[idx - 1][0]; curKey = pk === 'sunrise' ? null : pk; }
  const upk = nx[0] === 'sunrise' ? 'sunrise' : nx[0];
  $('nxName').textContent = t.next + ': ' + label(upk);
  $('nxTime').textContent = clock(nx[1]);
  $('times').innerHTML = order.map(k => `<div class="row ${k === curKey && !(k === 'isha' && idx !== 0 && false) ? 'cur' : ''} ${k === 'sunrise' ? 'dim' : ''}"><span class="nm">${label(k)}</span><span class="tm">${clock(today[k])}</span></div>`).join('');
  $('homeNote').textContent = t.homeNote;
  const upd = () => {
    const ms = Math.max(0, nx[1] - now()), s = Math.floor(ms / 1000);
    $('nxCount').textContent = '−' + [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map(x => String(x).padStart(2, '0')).join(':');
    $('nxLeft').textContent = t.left;
    if (ms === 0) drawHome();
  };
  upd(); clearInterval(tick); tick = setInterval(() => { if (page === 'home') upd() }, 1000);
}

function specials() {  // [month, day, key]
  return [[9, 1, 'ramadan'], [10, 1, 'fitr'], [12, 1, 'ten'], [12, 10, 'adha']];
}
function drawCal() {
  $('calPrev').textContent = S.lang === 'en' ? '‹' : '›'; $('calNext').textContent = S.lang === 'en' ? '›' : '‹';
  const t = L(), p = parts(now(), S.place.tz);
  const todayH = hijriOfGreg(p.y, p.m, p.d);
  if (!calFirst) calFirst = hijriFirst(p.y, p.m, p.d);      // [y, m, d] Gregorian of the 1st of this hijri month
  const [fy, fm, fd] = calFirst, h1 = hijriOfGreg(fy, fm, fd);
  let len = 29; for (let n = 29; n <= 31; n++) { const x = addDays(fy, fm, fd, n); if (hijriOfGreg(...x)[2] === 1) { len = n; break } }
  const g1 = new Date(Date.UTC(fy, fm - 1, fd)), g2 = new Date(Date.UTC(...addDays(fy, fm, fd, len - 1).map((v, i) => i === 1 ? v - 1 : v)));
  const gm = d => d.toLocaleDateString(S.lang === 'ur' ? 'ur-PK-u-nu-latn' : S.lang === 'ar' ? 'ar-u-nu-latn' : 'en-US', { month: 'long', timeZone: 'UTC' });
  $('calTitle').innerHTML = hijriMonthName(h1[1]) + ' ' + num(h1[0]) + '<small>' + gm(g1) + (gm(g1) !== gm(g2) ? ' – ' + gm(g2) : '') + ' ' + num(g2.getUTCFullYear()) + '</small>';
  const sp = new Set(specials().filter(x => x[0] === h1[1]).map(x => x[1]));
  if (h1[1] === 12) for (let d = 9; d <= 13; d++) sp.add(d);
  let html = t.days.map(d => `<div class="h">${d.slice(0, S.lang === 'en' ? 3 : 2)}</div>`).join('');
  const lead = new Date(Date.UTC(fy, fm - 1, fd)).getUTCDay();
  html += '<div></div>'.repeat(lead);
  for (let d = 1; d <= len; d++) {
    const g = addDays(fy, fm, fd, d - 1), isT = g[0] === p.y && g[1] === p.m && g[2] === p.d;
    html += `<div class="d ${isT ? 'today' : ''} ${sp.has(d) ? 'sp' : ''}">${num(d)}<small>${num(g[2])}</small></div>`;
  }
  $('calGrid').style.direction = 'ltr'; $('calGrid').innerHTML = html;
  // coming up: only within 100 days, counted again when the hijri date is adjusted
  const found = [];
  for (let n = 0; n <= 100; n++) {
    const g = addDays(p.y, p.m, p.d, n), h = hijriOfGreg(...g);
    for (const s of specials()) if (h[1] === s[0] && h[2] === s[1] && !found.some(f => f.key === s[2])) found.push({ key: s[2], h, g, n });
  }
  $('upWrap').classList.toggle('hide', !found.length);
  $('upTitle').textContent = t.up;
  $('upList').innerHTML = found.sort((a, b) => a.n - b.n).map(f => {
    const dn = new Date(Date.UTC(...f.g.map((v, i) => i === 1 ? v - 1 : v))).toLocaleDateString(S.lang === 'ur' ? 'ur-PK-u-nu-latn' : S.lang === 'ar' ? 'ar' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    return `<div class="up"><div class="a"><b>${t[f.key]}</b><small>${num(f.h[2])} ${hijriMonthName(f.h[1])} · ${dn}</small></div><span class="chip">${f.n === 0 ? t.today : f.n === 1 ? t.tomorrow : t.inDays(num(f.n))}</span></div>`;
  }).join('');
}
function hijriFirst(y, m, d) {       // Gregorian date of the 1st of the hijri month that holds y-m-d
  const h = hijriOfGreg(y, m, d); return addDays(y, m, d, -(h[2] - 1));
}
$('calNext') && ($('calNext').onclick = () => { const [y, m, d] = calFirst; for (let n = 28; n <= 31; n++) { const x = addDays(y, m, d, n); if (hijriOfGreg(...x)[2] === 1) { calFirst = x; break } } drawCal(); });
$('calPrev') && ($('calPrev').onclick = () => { const [y, m, d] = calFirst; calFirst = hijriFirst(...addDays(y, m, d, -1)); drawCal(); });

/* ---------- qibla ---------- */
let heading = null, compassOn = false;
function drawQibla() {
  const t = L(), q = PC.qibla(S.place.lat, S.place.lng);
  $('qTitle').textContent = t.qTitle + ' — ' + S.place.name;
  $('qDeg').textContent = Math.round(q) + '° ' + t.deg;
  $('qDist').textContent = num(Math.round(PC.distanceKm(S.place.lat, S.place.lng)).toLocaleString('en-US')) + ' ' + t.km;
  $('compassBtn').textContent = t.compass; $('compassBtn').classList.toggle('hide', compassOn);
  $('qNote').textContent = t.qNote;
  rotate();
}
function rotate() {
  const q = PC.qibla(S.place.lat, S.place.lng);
  $('needle').style.transform = 'rotate(' + (heading === null ? q : q - heading) + 'deg)';
}
function onOri(e) {
  let h = null;
  if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
  else if (e.absolute && typeof e.alpha === 'number') h = 360 - e.alpha;
  if (h !== null) { heading = h; rotate() }
}
$('compassBtn').onclick = async () => {
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') throw 0;
    }
    addEventListener('deviceorientationabsolute', onOri, true); addEventListener('deviceorientation', onOri, true);
    compassOn = true; $('compassBtn').classList.add('hide');
    setTimeout(() => { if (heading === null) $('qNote').textContent = L().qNo }, 2500);
  } catch (e) { $('qNote').textContent = L().qNo }
};

/* ---------- settings ---------- */
function drawSettings() {
  const t = L();
  $('sCity').textContent = t.city; $('qBtn').textContent = t.search; $('q').placeholder = t.ph; $('gps').textContent = '📍 ' + t.gps;
  $('sCalc').textContent = t.calc; $('lMethod').textContent = t.method; $('lAsr').textContent = t.asrL; $('lAdj').textContent = t.adj; $('lH24').textContent = t.h24; $('lLang').textContent = t.lang;
  $('method').innerHTML = Object.keys(PC.METHODS).map(k => `<option value="${k}">${t.methods[k]}</option>`).join(''); $('method').value = method();
  $('asr').innerHTML = `<option value="1">${t.std}</option><option value="2">${t.han}</option>`; $('asr').value = S.asr;
  $('adj').innerHTML = [-2, -1, 0, 1, 2].map(n => `<option value="${n}">${n > 0 ? '+' : ''}${num(n)}</option>`).join(''); $('adj').value = S.adj;
  $('h24').innerHTML = `<option value="0">${t.h12}</option><option value="1">${t.h24t}</option>`; $('h24').value = S.h24 ? 1 : 0;
  $('lang').value = S.lang; $('sNote').textContent = t.sNote;
  $('sInstall').textContent = '📲 ' + (S.lang === 'en' ? 'Add to the home screen' : S.lang === 'ar' ? 'الإضافة إلى الشاشة الرئيسية' : 'ہوم اسکرین پر شامل کریں'); $('installText').textContent = t.install;
}
const changed = () => { save(); calFirst = null; drawAll() };
$('method').onchange = e => { S.method = e.target.value; changed() };
$('asr').onchange = e => { S.asr = +e.target.value; changed() };
$('adj').onchange = e => { S.adj = +e.target.value; changed() };
$('h24').onchange = e => { S.h24 = e.target.value === '1'; changed() };
$('lang').onchange = e => { S.lang = e.target.value; changed() };

async function searchCity() {
  const q = $('q').value.trim(); if (q.length < 2) return;
  $('hits').innerHTML = '…';
  try {
    const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=8&language=en&name=' + encodeURIComponent(q));
    const j = await r.json(), list = j.results || [];
    $('hits').innerHTML = list.length ? '' : `<div class="note">${L().none}</div>`;
    list.forEach(c => {
      const d = document.createElement('div'); d.className = 'hit';
      d.innerHTML = `<b></b><small></small>`; d.firstChild.textContent = c.name; d.lastChild.textContent = [c.admin1, c.country].filter(Boolean).join('، ');
      d.onclick = () => { S.place = { name: c.name, lat: c.latitude, lng: c.longitude, tz: c.timezone, cc: c.country_code || '' }; S.method = null; $('hits').innerHTML = ''; $('q').value = ''; changed(); go('home') };
      $('hits').appendChild(d);
    });
  } catch (e) { $('hits').innerHTML = `<div class="note">${L().net}</div>` }
}
$('qBtn').onclick = searchCity;
$('q').onkeydown = e => { if (e.key === 'Enter') searchCity() };
$('gps').onclick = () => {
  $('hits').innerHTML = `<div class="note">${L().locBusy}</div>`;
  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude, lng = pos.coords.longitude;
    const name = L().myLoc, cc = '';
    S.place = { name, lat, lng, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, cc }; S.method = null; $('hits').innerHTML = ''; changed(); go('home');
  }, () => { $('hits').innerHTML = `<div class="note">${L().locFail}</div>` }, { timeout: 15000, maximumAge: 600000 });
};

function drawAll() {
  document.documentElement.lang = S.lang; document.documentElement.dir = S.lang === 'en' ? 'ltr' : 'rtl';
  document.title = S.lang === 'en' ? 'Salat Khair al-Quroon' : S.lang === 'ar' ? 'صلاة خير القرون' : 'صلاۃ خیرالقرون';
  drawTabs(); drawHome(); if (page === 'cal') drawCal(); if (page === 'qibla') drawQibla(); if (page === 'set') drawSettings();
}
drawAll(); go('home');
document.addEventListener('visibilitychange', () => { if (!document.hidden) drawAll() });
})();
