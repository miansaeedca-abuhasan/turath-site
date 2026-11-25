// Musnad al-Humaydi (Urdu translation of Maulana Muhammad Ahmad Dilpazir, Ansar as-Sunnah Lahore): 1334 narrations, takhrij + fawaid, sections, intro, news, category.
// The older Arabic-only entry `humaydi` stays untouched.
const fs=require('fs'),vm=require('vm');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const R=__dirname+'/../';
let reg;vm.runInNewContext(fs.readFileSync(R+'coll/index.js','utf8'),{COLLS:a=>{reg=a}});
function load(key,lang){const rows=[];for(const [a,b,f] of reg.find(e=>e.key===key).files[lang]){vm.runInNewContext(fs.readFileSync(R+'coll/'+f,'utf8'),{COLLDATA:(k,l,r)=>rows.push(...r)})}return rows}
const key='humaydiur',N=1334,e=reg.find(x=>x.key===key);ck(e,'registered');
const ar=load(key,'ar'),ur=load(key,'ur');
ck(e.count===N&&ar.length===N&&ur.length===N,'counts '+ar.length+'/'+ur.length);
ck(ar.every((r,i)=>r[0]===i+1)&&ur.every((r,i)=>r[0]===i+1),'ids sequential = printed numbers');
ck(/^أَخْبَرَنَا سُفْيَانُ بْنُ عُيَيْنَةَ/.test(ar[0][1])&&/^سیدنا علی بن ابی طالب رضی اللہ عنہ فرماتے ہیں/.test(ur[0][1]),'first rows');
const txt=[];(function w(x){if(typeof x==='string')txt.push(x);else if(Array.isArray(x))x.forEach(w);else if(x&&typeof x==='object')Object.values(x).forEach(w)})([ar,ur,e.intro,e.sections]);const all=txt.join('\n');
// English words printed by the translator (Lod / council City, job) stay; nothing else Latin
const lat=(all.match(/[A-Za-z]+/g)||[]).join(' ');ck(lat==='Lod council City job','only the printed English words: '+lat);
ck(!/[ﷺﷻﷲ﷿﷾﷜-﷯ؓؒؑ]/.test(all)&&!/[⟦⟧‹›❶-❿]/.test(all),'no honorific glyphs / raw marks');
ck(!/\(\(/.test(JSON.stringify([ar,e.intro])),'no (( in Arabic rows or intro');
const urj=JSON.stringify(ur);
ck((urj.match(/[یى]ٰ/g)||[]).length>=800,'dagger alif kept after yeh in Urdu rows (owner 21-11-2026)');
ck(!/صلی اللہ(?! علیہ وسلم)|رضی اللہ(?! عن[ہھ])|رحمہ(?! اللہ| ?م)/.test(urj),'honorifics complete in Urdu');
const ks=ur.filter(r=>r[3]&&r[3].k);ck(ks.length===1334,'takhrij on every row '+ks.length);
ck(ks.every(r=>/^\(1\) /.test(r[3].k)&&/ \(1\)$/.test(r[1])),'takhrij typed «(1) …» and the mark ends the translation');
ck(ks.every(r=>!/[۰-۹]/.test(r[3].k)),'takhrij English digits');
ck(ks.filter(r=>/ \(\d+(\/\d+)?([،]\s*\d+)*\)/.test(r[3].k)).length>1000,'takhrij converted to «book (number)» style');
ck(ur[0][3].k==='(1) صحیح: سنن ابی داود (1521)، سنن الترمذی (406)، سنن ابن ماجہ (1395)، عمل الیوم واللیلة للنسائی (414، 417)، مسند احمد (2/1)۔','row 1 takhrij');
ck(ur.filter(r=>r[3]&&r[3].f).length===974,'fawaid rows');
ck(e.sections.length===201&&e.sections[0][2]===1&&e.sections[e.sections.length-1][3]===N&&e.sections.every((s,i)=>i===0||s[2]===e.sections[i-1][3]+1),'201 contiguous sections');
ck(/سیدنا ابوبکر صدیق رضی اللہ عنہ کی/.test(e.sections[0][1])&&/عمر بن الخطاب/.test(e.sections[1][4]),'first sections');
ck(e.intro.map(x=>x[0]).join('|')==='عرض ناشر|تقریظ|امام حمیدی کے حالات|اختتامیہ','intro blocks');
ck(e.intro.flatMap(x=>x[1]).filter(p=>/^﴿.*﴾ \[[^\]]+: \d+\]$/.test(p)).length>=2,'verses in ﴿ ﴾ with reference');
ck(e.author[0]==='humaydi'&&e.trn.ur==='مولانا محمد احمد دلپذیر'&&e.langs.join()==='ar,ur','author/translator/langs');
const html=fs.readFileSync(R+'index.html','utf8');
ck(/^coll\/humaydiur_intro_[0-9a-f]{6}\.js$/.test(e.introx)&&fs.existsSync(R+e.introx),'narrator introductions file');
let NI;vm.runInNewContext(fs.readFileSync(R+e.introx,'utf8'),{COLLINTRO:(k,p)=>{NI=p}});
ck(NI.filter(p=>p.startsWith('§')).length===181&&NI.filter(p=>p==='تعارف راوی حدیث').length>=70&&/سیدنا ابوبکر صدیق/.test(NI[0]),'181 narrator introductions in the lazy file');
ck(!/\(\(/.test(NI.join('\n'))&&!/[A-Za-z❶-❿]/.test(NI.join('\n')),'no raw (( or Latin in them');
ck(/"humaydiur":14/.test(html),'category set');
const old=reg.find(x=>x.key==='humaydi');ck(old&&old.count===1359&&old.langs.join()==='ar','older Arabic entry humaydi untouched');
const n=JSON.parse(fs.readFileSync(R+'news.json','utf8')),c=n.find(x=>x.id==='20261121a'),ix=c.keys.indexOf(key);
ck(c.id==='20261121a'&&ix>=0&&c.i.ur[ix].includes('(1334)')&&c.l[ix]==='#/s/'+key,'news line');
ck(new RegExp('"id":"20261121a"[^\\n]*'+key).test(html),'news in app list');
const off=JSON.parse(fs.readFileSync(R+'offline.json','utf8')).groups.find(g=>g.id==='c_'+key);ck(off&&off.f.length===e.files.ar.length+e.files.ur.length+2,'offline group (+ introx + translator introductions)');
if(bad)process.exit(1);console.log('PASS humaydi_ur_full');
