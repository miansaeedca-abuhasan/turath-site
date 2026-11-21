// Khalq Af'al al-'Ibad (Imam al-Bukhari), Urdu translation of Muhammad Zubair Sheikh (Dar Ibn Bashir): 663 narrations (printed 1-664, 483 not printed),
// takhrij under the Arabic text, verses in ﴿ ﴾, honorifics in full, no Latin / glyph codes, headings, intro, news, category
const fs=require('fs'),vm=require('vm');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const R=__dirname+'/../';
let reg;vm.runInNewContext(fs.readFileSync(R+'coll/index.js','utf8'),{COLLS:a=>{reg=a}});
function load(key,lang){const rows=[];for(const [a,b,f] of reg.find(e=>e.key===key).files[lang]){vm.runInNewContext(fs.readFileSync(R+'coll/'+f,'utf8'),{COLLDATA:(k,l,r)=>rows.push(...r)})}return rows}
const key='khalqafaalur',N=663,e=reg.find(x=>x.key===key);ck(e,'registered');
const ar=load(key,'ar'),ur=load(key,'ur');
ck(e.count===N&&ar.length===N&&ur.length===N,'counts '+ar.length+'/'+ur.length);
ck(ar.every((r,i)=>r[0]===i+1)&&ur.every((r,i)=>r[0]===i+1),'ids sequential');
ck(e.an['482']===undefined&&e.an['483']==='484'&&e.an['663']==='664'&&Object.keys(e.an).length===181,'printed numbers: 483 not printed, 484..664');
ck(/^حدثني الحكم بن محمد الطبري/.test(ar[0][1])&&/^سیدنا|^سفیان بن عیینہ/.test(ur[0][1]),'first rows');
ck(/عمرو بن دینار رحمہ اللہ/.test(ur[0][1])&&/حدثنا عبدان؛ قال حدثنا عبد الله/.test(ar[N-1][1]+ar[N-2][1]),'row texts');
const txt=[];(function w(x){if(typeof x==='string')txt.push(x);else if(Array.isArray(x))x.forEach(w);else if(x&&typeof x==='object')Object.values(x).forEach(w)})([ar,ur,e.intro,e.sections]);const all=txt.join('\n');
ck(!/[A-Za-z@#$]/.test(all),'no Latin letters/symbols');
ck(!/[ﷺﷻﷲ﷿﷾﷜-﷯]/.test(all)&&!/[⟦⟧‹›]/.test(all),'no honorific glyphs / raw marks / single angle quotes');
ck(!/\(\(/.test(all)&&!/یٰ/.test(JSON.stringify(ur)),'no (( and no dagger alif after yeh in Urdu rows');
ck(!/صلی اللہ(?! علیہ)|رضی اللہ(?! عن)|رحمہ(?! اللہ)/.test(JSON.stringify(ur)),'honorifics complete in Urdu');
ck(!/[\u200e\u200f\u0601\u0640]/.test(JSON.stringify(ur).replace(/﴿[^﴾]*﴾/g,'')),'no invisible marks / year sign / tatweel in Urdu (the Quran text itself keeps its own)');
// verses
const v=ur.map(r=>r[1]).join('\n');
ck((v.match(/﴿/g)||[]).length===(v.match(/﴾/g)||[]).length&&(v.match(/﴿/g)||[]).length>200,'verses in ﴿ ﴾ ('+(v.match(/﴿/g)||[]).length+')');
ck(ur.every(r=>!/۝/.test(r[1])),'no raw InPage verse marks');
ck(/\n﴿[^﴾]*﴾ \[[^\]]+: \d+\]\n’’/.test(ur[403][1]),'verse, reference and translation in own paragraphs (row 404)');
// takhrij
const ks=ur.filter(r=>r[3]&&r[3].k);ck(ks.length===437,'takhrij on rows '+ks.length);
ck(ks.every(r=>!/[۰-۹٠-٩]/.test(r[3].k)&&!/^\(/.test(r[3].k)),'takhrij English digits, no leading ()');
ck(ks.filter(r=>/ \(\d+(\/\d+)?([،]\s*\d+)*\)/.test(r[3].k)).length>250,'takhrij book (number) style');
ck(ur[0][3].k.split('\n').length===1&&/^التاریخ الکبیر/.test(ur[0][3].k),'row 1 takhrij');
ck(/«فَلَا أَقُولُ[^»]*»\n«وَلَا أَقُولُ[^»]*»\n«مَا قَالَ[^»]*»/.test(ur[11][1])&&/سیر أعلام النبلاء/.test(ur[11][3].k),'row 12: poem lines and its takhrij (footnote 13)');
ck(/عربی کتاب میں 482 کے بعد 484 نمبر ہے/.test(ur[481][1]),'translator note about the missing 483 kept after 482');
ck(/^بسم اللہ الرحمن الرحیم\n/.test(ur[242][1])&&/^بسم الله الرحمن الرحيم\n/.test(ar[242][1]),'basmala before 243');
// headings, intro
ck(e.sections.length===8&&e.sections[0][2]===1&&e.sections[7][3]===N&&e.sections.every((s,i)=>i===0||s[2]===e.sections[i-1][3]+1),'8 sections contiguous');
ck(e.sections.map(s=>s[2]).join()==='1,404,440,453,492,636,644,649','section starts');
ck(e.intro.map(x=>x[0]).join('|')==='انتساب|مقدمہ|عرض مترجم|خلق قرآن کا مسئلہ|ابتدائی سند (عربی)|کتاب کا اختتام','intro blocks');
ck(e.intro.filter(x=>x[1].includes('§حواشی')).length===2&&e.intro[2][1].some(p=>/\(1\) 20 جنوری/.test(p)),'front notes as «حواشی» with (1)');
// registry
ck(e.author[0]==='bukhari'&&e.trn.ur==='محمد زبیر شیخ'&&e.langs.join()==='ar,ur'&&e.pub.ur==='دار ابن بشیر','author/translator/langs/publisher');
ck(/"khalqafaalur":10/.test(fs.readFileSync(R+'index.html','utf8')),'category set');
ck(reg.find(x=>x.key==='sh9697').count===239,'older Arabic Khalq (sh9697) untouched');
const n=JSON.parse(fs.readFileSync(R+'news.json','utf8')),c=n[0];
ck(c.id==='20261121a'&&c.keys.join()===key&&c.i.ur.length===2&&c.i.ur[0].includes('(663)')&&c.l[0]==='#/s/'+key,'news line');
ck(c.l[1]==='https://play.google.com/store/apps/details?id=org.turath.salat'&&/صلاۃ خیرالقرون/.test(c.i.ur[1])&&/org\.turath\.salat/.test(fs.readFileSync(R+'index.html','utf8').split('getBadges')[1]),'Salat app: news line with its Play link + badge');
ck(/"id":"20261121a"[^\n]*khalqafaalur/.test(fs.readFileSync(R+'index.html','utf8')),'news in app list');
const off=JSON.parse(fs.readFileSync(R+'offline.json','utf8')).groups.find(g=>g.id==='c_'+key);ck(off&&off.f.length===e.files.ar.length+e.files.ur.length,'offline group');
if(bad)process.exit(1);console.log('PASS khalq_afaal_full');
