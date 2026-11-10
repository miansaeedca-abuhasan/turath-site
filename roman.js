/* رومن اردو: اردو متن کو انگریزی حروف میں دکھاتا ہے۔ Rule-based, approximate: Urdu text carries no short vowels. */
(function () {
  'use strict';
  const DIA = /[ً-ٰٟۖ-ۭـ]/g;
  const nz = s => s.replace(DIA, '').replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[ةۃه]/g, 'ہ').replace(/[أإ]/g, 'ا').replace(/ؤ/g, 'و').replace(/ے/g, 'ے');
  // phrases first (normalised Urdu → Roman)
  const PH = {
    'صلی اللہ علیہ وسلم': 'sallallahu alaihi wasallam', 'صلی اللہ علیہ و سلم': 'sallallahu alaihi wasallam', 'علیہ السلام': 'alaihis salam', 'علیہا السلام': 'alaihas salam', 'علیہم السلام': 'alaihimus salam',
    'رضی اللہ عنہ': 'razi Allahu anhu', 'رضی اللہ عنہا': 'razi Allahu anha', 'رضی اللہ عنہما': 'razi Allahu anhuma', 'رضی اللہ عنہم': 'razi Allahu anhum', 'رحمہ اللہ': 'rahimahullah', 'رحمۃ اللہ علیہ': 'rahmatullahi alaih', 'رحمہ اللہ تعالی': 'rahimahullahu ta\'ala',
    'عز وجل': 'azza wa jall', 'عزوجل': 'azza wa jall', 'سبحانہ وتعالی': 'subhanahu wa ta\'ala', 'جل جلالہ': 'jalla jalaluhu', 'ان شاء اللہ': 'in sha Allah', 'ماشاء اللہ': 'masha Allah', 'سبحان اللہ': 'Subhan Allah', 'الحمد للہ': 'Alhamdulillah', 'اللہ اکبر': 'Allahu Akbar', 'لا الہ الا اللہ': 'La ilaha illallah', 'بسم اللہ': 'Bismillah',
    'اللہ تعالی': 'Allah ta\'ala', 'رسول اللہ': 'Rasoolullah', 'عبد اللہ': 'Abdullah', 'عبد الرحمن': 'Abdur Rahman', 'ابو ہریرہ': 'Abu Hurairah', 'ابو بکر': 'Abu Bakr', 'ام المومنین': 'Ummul Momineen', 'ام سلمہ': 'Umm Salama', 'ام حبیبہ': 'Umm Habiba', 'ابن عباس': 'Ibn Abbas', 'ابن عمر': 'Ibn Umar', 'ابن مسعود': 'Ibn Masood', 'انس بن مالک': 'Anas bin Malik', 'جابر بن عبداللہ': 'Jabir bin Abdullah', 'بسم اللہ الرحمن الرحیم': 'Bismillahir Rahmanir Raheem'
  };
  const W = ('نے=ne|کہ=ke|کی=ki|کا=ka|کے=ke|کو=ko|سے=se|میں=mein|پر=par|پہ=pe|اور=aur|یا=ya|بھی=bhi|ہی=hi|تو=to|ہے=hai|ہیں=hain|ہوں=hoon|ہو=ho|ہوا=hua|ہوئی=hui|ہوئے=hue|ہوتا=hota|ہوتی=hoti|ہوتے=hote|ہوگا=hoga|ہوگی=hogi|تھا=tha|تھی=thi|تھے=the|تھیں=thin|گیا=gaya|گئی=gayi|گئے=gaye|گئیں=gayin|کر=kar|کرنا=karna|کرتا=karta|کرتی=karti|کرتے=karte|کرو=karo|کریں=karein|کیا=kiya|کیے=kiye|کرے=kare|دیا=diya|دی=di|دیے=diye|دے=de|دو=do|دینا=dena|لیا=liya|لی=li|لیے=liye|لے=le|لو=lo|آیا=aaya|آئی=aayi|آئے=aaye|آ=aa|آنا=aana|جا=ja|جانا=jaana|جاتا=jaata|جاتی=jaati|جاتے=jaate|جائے=jaaye|جائیں=jaaein|رہا=raha|رہی=rahi|رہے=rahe|رہنا=rehna|رہتا=rehta|رہتے=rehte|سکتا=sakta|سکتی=sakti|سکتے=sakte|چاہیے=chahiye|چاہتا=chahta|چاہتے=chahte|والا=wala|والی=wali|والے=wale|والوں=walon|ایک=aik|تین=teen|چار=chaar|پانچ=paanch|چھ=chhe|سات=saat|آٹھ=aath|نو=nau|دس=das|پہلے=pehle|پہلا=pehla|بعد=baad|ساتھ=saath|لیکن=lekin|مگر=magar|اگر=agar|پھر=phir|اب=ab|جب=jab|تب=tab|جو=jo|جس=jis|جن=jin|اس=is|اسے=ise|اسی=isi|ان=un|انہیں=unhein|انھیں=unhein|انہوں=unhon|انھوں=unhon|یہ=yeh|وہ=woh|یہاں=yahan|وہاں=wahan|کون=kaun|کیوں=kyun|کیسے=kaise|کب=kab|کہاں=kahan|کتنا=kitna|کوئی=koi|کسی=kisi|کچھ=kuch|سب=sab|سارے=saare|ہر=har|بہت=bahut|زیادہ=ziyada|کم=kam|بڑا=bara|بڑی=bari|بڑے=bare|چھوٹا=chhota|اچھا=achha|اچھی=achhi|برا=bura|نہ=na|نہیں=nahin|مت=mat|میرا=mera|میری=meri|میرے=mere|ہم=hum|ہمارا=hamara|ہماری=hamari|ہمارے=hamare|تم=tum|تمہارا=tumhara|آپ=aap|تیرا=tera|وغیرہ=waghaira|لوگ=log|لوگوں=logon|آدمی=aadmi|شخص=shakhs|مرد=mard|عورت=aurat|عورتیں=auraten|بیٹا=beta|بیٹی=beti|باپ=baap|ماں=maan|بھائی=bhai|بہن=behan|بیوی=biwi|بچے=bachche|بچہ=bachcha|گھر=ghar|دن=din|رات=raat|وقت=waqt|سال=saal|نماز=namaz|روزہ=roza|روزے=roze|زکوٰۃ=zakat|زکوۃ=zakat|حج=hajj|عمرہ=umrah|قرآن=Quran|حدیث=hadees|احادیث=ahadees|سنت=sunnat|دین=deen|ایمان=imaan|اسلام=Islam|مسلمان=Musalman|مسلمانوں=Musalmanon|مومن=momin|کافر=kafir|جنت=jannat|جہنم=jahannam|آخرت=aakhirat|دنیا=duniya|قیامت=qiyamat|موت=maut|قبر=qabr|گناہ=gunah|ثواب=sawab|توبہ=tauba|دعا=dua|صدقہ=sadqa|علم=ilm|عالم=aalim|علماء=ulama|امام=Imam|نبی=Nabi|رسول=Rasool|پیغمبر=paighambar|صحابی=sahabi|صحابہ=Sahaba|صحابیہ=sahabiya|اللہ=Allah|رب=Rabb|تعالی=ta\'ala|محمد=Muhammad|ابو=Abu|بن=bin|بنت=bint|ام=Umm|ابن=ibn|عبداللہ=Abdullah|فرمایا=farmaya|کہا=kaha|کہتے=kehte|کہتی=kehti|کہتا=kehta|کہو=kaho|کہنا=kehna|سنا=suna|سنو=suno|سنتا=sunta|دیکھا=dekha|دیکھو=dekho|پوچھا=poochha|بتایا=bataya|ملا=mila|ملی=mili|ملے=mile|پڑھا=parha|پڑھو=parho|لکھا=likha|بیان=bayan|روایت=riwayat|روایات=riwayaat|مروی=marwi|سند=sanad|راوی=rawi|رواہ=ruwat|باب=baab|کتاب=kitab|کتابیں=kitaben|تفسیر=tafseer|ترجمہ=tarjuma|شرح=sharh|فائدہ=faida|فوائد=fawaid|تحقیق=tehqeeq|تخریج=takhreej|صحیح=sahih|حسن=hasan|ضعیف=zaeef|موضوع=mawzoo|حکم=hukm|حرام=haram|حلال=halal|جائز=jaiz|فرض=farz|واجب=wajib|مستحب=mustahab|وضو=wuzu|غسل=ghusl|طہارت=taharat|پاک=paak|مسجد=masjid|مدینہ=Madina|مکہ=Makkah|کعبہ=Kaaba|جہاد=jihad|جنگ=jang|غزوہ=ghazwa|ہجرت=hijrat|بدر=Badr|احد=Uhud|عرب=Arab|قریش=Quraish|انصار=Ansar|یہود=Yahood|موسیٰ=Musa|موسی=Musa|عیسیٰ=Isa|عیسی=Isa|ابراہیم=Ibrahim|آدم=Aadam|جبریل=Jibreel|فرشتہ=farishta|فرشتے=farishte|شیطان=shaitan|ہاں=haan|جی=ji|اے=aye|عمر=Umar|عثمان=Usman|علی=Ali|عائشہ=Aisha|حفصہ=Hafsa|فاطمہ=Fatima|خدیجہ=Khadija|حسین=Husain|انس=Anas|جابر=Jabir|عباس=Abbas|سعد=Saad|زید=Zaid|معاویہ=Muawiya|خالد=Khalid|بلال=Bilal|ہریرہ=Hurairah|بکر=Bakr|عوف=Auf|مالک=Malik|ابوداود=Abu Dawud|بخاری=Bukhari|مسلم=Muslim|ترمذی=Tirmizi|نسائی=Nasai|احمد=Ahmad|مسند=Musnad|سلف=salaf|صالحین=saliheen|شذرات=shazraat|مسابقہ=musabqa|کوئز=quiz|سوال=sawal|جواب=jawab|صحیحین=Sahihain|اللہم=Allahumma|بسم=Bismillah|ہے۔=hai.|ہوں=hoon|مجھے=mujhe|مجھ=mujh|تمہیں=tumhein|ہمیں=hamein|اپنے=apne|اپنا=apna|اپنی=apni|خود=khud|دونوں=dono|دوسرا=doosra|دوسرے=doosre|ایسا=aisa|ایسی=aisi|ایسے=aise|جیسے=jaise|جیسا=jaisa|طرح=tarah|لئے=liye|لیے=liye|کیونکہ=kyunke|چنانچہ=chunancha|یعنی=yani|مثلا=masalan|ہر=har|کبھی=kabhi|ہمیشہ=hamesha|صرف=sirf|بلکہ=balke|سوائے=siwaye|پاس=paas|اندر=andar|باہر=bahar|اوپر=upar|نیچے=neeche|آگے=aage|پیچھے=peechhe|درمیان=darmiyan|سامنے=saamne|عزت=izzat|مہمان=mehmaan|نمبر=number|جھوٹ=jhoot|ٹھکانا=thikana|اعمال=aamaal|نیت=niyyat|نیتوں=niyyaton|سچ=sach|سچا=sacha|سچی=sachi|ظلم=zulm|عدل=adl|رحمت=rehmat|برکت=barkat|مال=maal|دولت=daulat|غریب=gareeb|مسکین=miskeen|یتیم=yateem|پڑوسی=parosi|دوست=dost|دشمن=dushman|صبر=sabr|شکر=shukr|تقوی=taqwa|توکل=tawakkul|اخلاص=ikhlaas|ریا=riya|حیا=haya|کھانا=khana|پانی=paani|دودھ=doodh|روٹی=roti|کپڑا=kapra|سونا=sona|چاندی=chandi|سفر=safar|مسافر=musafir|شادی=shaadi|نکاح=nikah|طلاق=talaq|وراثت=wiraasat|میراث=meeraas|امانت=amanat|وعدہ=wada|قسم=qasam|گواہی=gawahi|گواہ=gawah|جھگڑا=jhagra|صلح=sulh|سلام=salam|مصافحہ=musafaha|زبان=zubaan|دل=dil|آنکھ=aankh|ہاتھ=haath|پاؤں=paaon|سر=sar|منہ=munh|متفق=muttafaq|علیہ=alaih|مکمل=mukammal|پورا=poora|متن=matn|ترجمے=tarjume|مترجم=mutarjim|فہرست=fehrist|تلاش=talash|ہوم=home|پڑھیں=parhein|سننا=sunna|آڈیو=audio|ویڈیو=video|سیدنا=Sayyiduna|سیدہ=Sayyida|حضرت=Hazrat|شیخ=Shaikh|حافظ=Hafiz').split('|');
  const WD = new Map();
  W.forEach(p => { const i = p.indexOf('='); if (i > 0) WD.set(nz(p.slice(0, i)), p.slice(i + 1)); });
  const PHL = Object.keys(PH).map(k => [nz(k), PH[k]]).sort((a, b) => b[0].length - a[0].length);
  const C = {ب: 'b', پ: 'p', ت: 't', ٹ: 't', ث: 's', ج: 'j', چ: 'ch', ح: 'h', خ: 'kh', د: 'd', ڈ: 'd', ذ: 'z', ر: 'r', ڑ: 'r', ز: 'z', ژ: 'zh', س: 's', ش: 'sh', ص: 's', ض: 'z', ط: 't', ظ: 'z', غ: 'gh', ف: 'f', ق: 'q', ک: 'k', گ: 'g', ل: 'l', م: 'm', ن: 'n', ں: 'n', ہ: 'h', ء: '', ع: '', ئ: ''};
  const isC = ch => ch in C || ch === 'ھ';
  function word(w) {
    if (WD.has(w)) return WD.get(w);
    const L = [...w]; let out = '', vow = false;
    for (let i = 0; i < L.length; i++) {
      const ch = L[i], nx = L[i + 1], pv = L[i - 1], first = i === 0, last = i === L.length - 1;
      if (ch === 'ھ') { out += 'h'; continue; }
      if (ch === 'آ') { out += 'aa'; vow = true; continue; }
      if (ch === 'ا') { out += first ? 'a' : (last ? 'a' : 'aa'); vow = true; continue; }
      if (ch === 'و') { out += first ? (nx && !isC(nx) ? 'w' : 'wa') : (last ? 'o' : (pv && isC(pv) ? 'o' : 'w')); vow = !first || !!(nx && isC(nx)); continue; }
      if (ch === 'ی') { const y = nx === 'ا' || nx === 'و' || nx === 'ے'; out += (y && !first) ? 'y' : 'i'; vow = !y; continue; }
      if (ch === 'ے') { out += last ? 'e' : 'ay'; vow = true; continue; }
      if (ch === 'ع') { if (nx && !isC(nx)) { continue; } out += 'a'; vow = true; continue; }
      if (ch === 'ئ') { out += 'i'; vow = true; continue; }
      if (ch === 'ہ' && last && pv && isC(pv) && L.length > 2) { out += 'ah'; continue; }
      const r = C[ch];
      if (r === undefined) { out += ch; continue; }
      const vb = vow; out += r; vow = false;
      let j = i + 1;
      if (L[j] === 'ھ') { out += 'h'; i = j; j = i + 1; }
      const n2 = L[j];
      if (n2 && isC(n2) && n2 !== 'ھ' && !(ch === 'ن' && n2 === 'ں') && !vb && !prevVowelClosed(L, i)) { out += 'a'; vow = true; }
    }
    return out;
  }
  function prevVowelClosed(L, i) { const p = L[i - 1]; return !!p && !isC(p) && p !== 'ہ' && p !== 'ع'; }
  const DIG = {'۰': 0, '۱': 1, '۲': 2, '۳': 3, '۴': 4, '۵': 5, '۶': 6, '۷': 7, '۸': 8, '۹': 9, '٠': 0, '١': 1, '٢': 2, '٣': 3, '٤': 4, '٥': 5, '٦': 6, '٧': 7, '٨': 8, '٩': 9};
  function romanize(text) {
    let s = nz(text);
    PHL.forEach(([k, v]) => { if (s.includes(k)) s = s.split(k).join('\u0001' + v.replace(/ /g, '\u0002') + '\u0001'); });
    s = s.replace(/[۰-۹٠-٩]/g, d => DIG[d]).replace(/۔/g, '.').replace(/،/g, ',').replace(/؟/g, '?').replace(/؛/g, ';').replace(/[’‘]{2}|["“”]/g, '"').replace(/[﴿﴾]/g, m => m === '﴿' ? '(' : ')');
    s = s.replace(/\u0001([^\u0001]*)\u0001/g, (m, v) => v.replace(/\u0002/g, ' ')).replace(/[؀-ۿﭐ-﷿]+/g, w => word(w));
    s = s.replace(/(^|[.?!]\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase());
    return s.replace(/\s+/g, ' ').replace(/ ([,.?;:])/g, '$1').trim() + (/\s$/.test(text) ? ' ' : '');
  }
  window.ROMAN = {romanize};
  // ---- DOM toggle ----
  const URDU = /[ٹڈڑںھۓےہکگیچپژ]/g, ARAB = /[يكةى]/g;
  let on = false; try { on = localStorage.roman === '1'; } catch (e) {}
  const orig = new WeakMap(), blk = new WeakMap(); let busy = false;
  const ui = () => { try { return localStorage.ui || 'en'; } catch (e) { return 'en'; } };
  const skip = el => !el || el.closest('script,style,textarea,input,select,.ar,[lang=ar],.qayah,.noroman');
  function block(el) { while (el && el !== document.body && !/^(block|flex|grid|list-item|table-cell)$/.test(getComputedStyle(el).display)) el = el.parentElement; return el; }
  function conv(n) {
    if (orig.has(n)) return;
    const t = n.data; if (!t || !t.trim()) return;
    const u = (t.match(URDU) || []).length, a = (t.match(ARAB) || []).length;
    if (!u || a > u) return;
    if (skip(n.parentElement)) return;
    orig.set(n, t); n.data = romanize(t);
    const b = block(n.parentElement);
    if (b && !blk.has(b)) { blk.set(b, [b.getAttribute('dir'), b.style.textAlign]); b.setAttribute('dir', 'ltr'); b.style.textAlign = 'left'; }
  }
  function walk(root, fn) { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const a = []; let n; while ((n = w.nextNode())) a.push(n); a.forEach(fn); }
  function apply() { busy = true; ['list', 'view', 'qv'].forEach(id => { const r = document.getElementById(id); if (r) walk(r, conv); }); busy = false; }
  function revert() {
    busy = true;
    ['list', 'view', 'qv'].forEach(id => { const r = document.getElementById(id); if (!r) return; walk(r, n => { if (orig.has(n)) { n.data = orig.get(n); orig.delete(n); } }); r.querySelectorAll('*').forEach(b => { if (blk.has(b)) { const [d, ta] = blk.get(b); d == null ? b.removeAttribute('dir') : b.setAttribute('dir', d); b.style.textAlign = ta || ''; blk.delete(b); } }); });
    busy = false;
  }
  let timer = 0;
  const mo = new MutationObserver(() => { if (busy || !on || ui() !== 'ur') return; clearTimeout(timer); timer = setTimeout(apply, 60); });
  function mkBtn() {
    if (document.getElementById('roman')) return;
    const b = document.createElement('button'); b.id = 'roman'; b.type = 'button'; b.className = 'ib';
    b.style.cssText = 'font:700 .8rem/1 system-ui,sans-serif;min-width:2.6rem;padding:0 .35rem;white-space:nowrap';
    const h = document.getElementById('uilang'); if (h && h.parentNode) h.parentNode.insertBefore(b, h);
    b.addEventListener('click', () => { on = !on; try { localStorage.roman = on ? '1' : '0'; } catch (e) {} if (on) apply(); else revert(); label(); });
    ['list', 'view', 'qv'].forEach(id => { const r = document.getElementById(id); if (r) mo.observe(r, {childList: true, subtree: true}); });
  }
  function label() {
    const b = document.getElementById('roman'); if (!b) return;
    const show = ui() === 'ur'; b.hidden = !show;
    b.textContent = on ? 'اردو' : 'Roman'; b.title = on ? 'اردو رسم الخط میں دکھائیں' : 'رومن اردو میں دکھائیں';
    b.setAttribute('aria-pressed', String(on));
    if (!show && orig.size) revert();
    if (show && on) apply();
  }
  function init() { mkBtn(); label(); setInterval(label, 900); window.addEventListener('hashchange', () => setTimeout(() => { if (on && ui() === 'ur') apply(); }, 250)); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
