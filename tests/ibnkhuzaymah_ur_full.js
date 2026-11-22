// Sahih Ibn Khuzaymah (Urdu translation, Ansar as-Sunnah Lahore; 4 volumes, printed 1-3079): 3079 rows, bab sections, takhrij + fawaid, intro, news, category.
// The older Arabic-only entry `ibnkhuzaymah` stays untouched.
const fs=require('fs'),vm=require('vm');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const R=__dirname+'/../';
let reg;vm.runInNewContext(fs.readFileSync(R+'coll/index.js','utf8'),{COLLS:a=>{reg=a}});
function load(key,lang){const rows=[];for(const [a,b,f] of reg.find(e=>e.key===key).files[lang]){vm.runInNewContext(fs.readFileSync(R+'coll/'+f,'utf8'),{COLLDATA:(k,l,r)=>rows.push(...r)})}return rows}
const key='ibnkhuzaymahur',N=3079,e=reg.find(x=>x.key===key);ck(e,'registered');
const ar=load(key,'ar'),ur=load(key,'ur');
ck(e.count===N&&ar.length===N&&ur.length===N,'counts '+ar.length+'/'+ur.length);
ck(ar.every((r,i)=>r[0]===i+1)&&ur.every((r,i)=>r[0]===i+1),'ids sequential');
// printed numbers: 739 and 2476 are not printed; 1040 and 2258 are printed twice
const an={};for(const [n,v,c] of e.an._r)for(let i=0;i<c;i++)an[n+i]=v+i;
const printed=i=>an[i]!==undefined?an[i]:i;
ck(printed(738)===738&&printed(739)===740&&printed(1039)===1040&&printed(1040)===1040&&printed(1041)===1041,'printed numbers around 739 / 1040');
ck(printed(2258)===2258&&printed(2259)===2258&&printed(2260)===2259&&printed(2476)===2475&&printed(2477)===2477&&printed(N)===3079,'printed numbers around 2258 / 2476');
ck(/^حَدَّثَنَا أَبُو يَعْقُوبَ يُوسُفُ بْنُ وَاضِحٍ|^حَدَّثَنَا أَبُو يَعْقُوبَ/.test(ar[0][1])&&/^حضرت یحییٰ|^حضرت یحیی/.test(ur[0][1]),'first rows');
const txt=[];(function w(x){if(typeof x==='string')txt.push(x);else if(Array.isArray(x))x.forEach(w);else if(x&&typeof x==='object')Object.values(x).forEach(w)})([ar,ur,e.intro,e.sections]);const all=txt.join('\n');
// English words printed by the translator (rows 758 «Hanger») stay; nothing else Latin
const lat=(all.match(/[A-Za-z]+/g)||[]);ck(lat.length===1&&lat[0]==='Hanger','only the printed English word Hanger: '+lat.slice(0,5));
ck(!/[ﷺﷻﷲ﷿﷾﷜-﷯ؓؒؑ]/.test(all)&&!/[⟦⟧‹›❶-❿]/.test(all),'no honorific glyphs / raw marks');
ck(!/\(\(/.test(JSON.stringify(ar.map(r=>r[1])))&&!/\(\((?!الف\))/.test(JSON.stringify(ur.map(r=>r[1]))),'no (( in Arabic rows; in Urdu only the printed «((الف)»');
const urj=JSON.stringify(ur);
ck((urj.match(/[یى]ٰ/g)||[]).length>=800,'dagger alif kept after yeh in Urdu rows (owner 21-11-2026)');
ck(!/صلی اللہ(?! علیہ وسلم)|رضی اللہ(?! عن[ہھ])|رحمہ(?! اللہ| ?م)/.test(urj),'honorifics complete in Urdu');
// takhrij / fawaid
const ks=ur.filter(r=>r[3]&&r[3].k);ck(ks.length===3055,'takhrij rows '+ks.length);
ck(ks.every(r=>/^\(1\) /.test(r[3].k)&&/ \(1\)$/.test(r[1])),'takhrij typed «(1) …» and the mark ends the translation');
ck(ur.every(r=>(r[3]&&r[3].k)?true:!/ \(1\)$/.test(r[1])),'no mark without takhrij');
ck(ks.every(r=>!/[۰-۹]/.test(r[3].k)),'takhrij English digits');
ck(ks.filter(r=>/ \(\d+(\/\d+)?([،]\s*\d+)*\)/.test(r[3].k)).length>1400,'takhrij converted to «book (number)» style');
ck(ur[654][3].k==='(1) صحیح مسلم (486)، سنن النسائى (1100)، سنن ابی داود (877)، سنن ابن ماجة (3841)، مسند احمد (201/4)۔','row 655 takhrij: '+ur[654][3].k);
const fs_=ur.filter(r=>r[3]&&r[3].f);ck(fs_.length===1448,'fawaid rows '+fs_.length);
ck(ur[0][3].f.split('\n').length>=2&&/^۱۔/.test(ur[0][3].f)&&/\n۲۔/.test(ur[0][3].f),'fawaid points split on separate lines');
// sections = babs
ck(e.sections.length===2148&&e.sections[0][2]===1&&e.sections[e.sections.length-1][3]===N&&e.sections.every((s,i)=>i===0||s[2]===e.sections[i-1][3]+1),'2148 contiguous bab sections');
ck(e.sections.every(s=>s.length===5&&s[1]&&s[4]),'every section has Urdu and Arabic title');
ck(/^بَابُ ذِكْرِ الْخَيْرِ الثَّابِتِ/.test(e.sections[0][4])&&/^نبی اکرم/.test(e.sections[0][1]),'first bab');
// intro
ck(e.intro.map(x=>x[0]).join('|')==='عرض ناشر|عرض مترجم|حالات زندگی امام ابن خزیمہ|ابتدائی سند (عربی)|کتابوں کے عنوانات|اختتامِ جلد ۳|کتاب کا اختتام','intro blocks: '+e.intro.map(x=>x[0]).join('|'));
const ip=e.intro.flatMap(x=>x[1]);
ck(ip.filter(p=>/^﴿.*﴾ \[[^\]]+: [\d۰-۹]+/.test(p)).length>=7,'verses of the publisher note in ﴿ ﴾ with reference');
ck(e.intro[2][1].includes('§نام ونسب')&&e.intro[2][1].includes('§حواشی')&&e.intro[2][1].some(p=>/^\(۹\) /.test(p)),'life-history headings and notes');
ck(!/ملنے|الاللہ|حفظ اللہ/.test(ip.join('\n')),'preface glyph leftovers fixed');
// registry / category / older entry
ck(e.author[0]==='ibnkhuzayma'&&e.trn.ur==='ابو محمد اجمل بھٹی'&&e.langs.join()==='ar,ur'&&e.pub.ur==='انصار السنہ پبلیکیشنز، لاہور','author/translator/langs/publisher');
const html=fs.readFileSync(R+'index.html','utf8');
ck(/"ibnkhuzaymahur":9/.test(html),'category set');
const old=reg.find(x=>x.key==='ibnkhuzaymah');ck(old&&old.count===3090&&old.langs.join()==='ar,en','older Arabic entry ibnkhuzaymah untouched');
const n=JSON.parse(fs.readFileSync(R+'news.json','utf8')),c=n[0],ix=c.keys.indexOf(key);
ck(c.id==='20261121a'&&ix>=0&&c.i.ur[ix].includes('(3079)')&&c.l[ix]==='#/s/'+key,'news line');
ck(new RegExp('"id":"20261121a"[^\\n]*'+key).test(html),'news in app list');
const off=JSON.parse(fs.readFileSync(R+'offline.json','utf8')).groups.find(g=>g.id==='c_'+key);ck(off&&off.f.length===e.files.ar.length+e.files.ur.length,'offline group');
if(bad)process.exit(1);console.log('PASS ibnkhuzaymah_ur_full');
