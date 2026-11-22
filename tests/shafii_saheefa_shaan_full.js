// Musnad ash-Shafi'i (Urdu, 2 vols = 1819 narrations), Saheefa of Ali, Shaan-e-Sahaba (Ansar as-Sunnah Lahore): content, registry, category, Sahaba folder, news.
const fs=require('fs'),vm=require('vm');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const R=__dirname+'/../';
let reg;vm.runInNewContext(fs.readFileSync(R+'coll/index.js','utf8'),{COLLS:a=>{reg=a}});
function load(key,lang){const rows=[];for(const [a,b,f] of reg.find(e=>e.key===key).files[lang]){vm.runInNewContext(fs.readFileSync(R+'coll/'+f,'utf8'),{COLLDATA:(k,l,r)=>rows.push(...r)})}return rows}
const html=fs.readFileSync(R+'index.html','utf8');
const flat=x=>{const t=[];(function w(y){if(typeof y==='string')t.push(y);else if(Array.isArray(y))y.forEach(w);else if(y&&typeof y==='object')Object.values(y).forEach(w)})(x);return t.join('\n')};
// ---------- Musnad ash-Shafi'i ----------
{const key='musnadshafiiur',N=1819,e=reg.find(x=>x.key===key);ck(e,'shafii registered');
const ar=load(key,'ar'),ur=load(key,'ur');
ck(e.count===N&&ar.length===N&&ur.length===N,'shafii counts '+ar.length+'/'+ur.length);
ck(ar.every((r,i)=>r[0]===i+1)&&ur.every((r,i)=>r[0]===i+1),'shafii ids = printed numbers 1..1819');
ck(/^أَخْبَرَنَا الْإِمَامُ أَبُو عَبْدِ اللَّهِ مُحَمَّدُ بْنُ إِدْرِيسَ الشَّافِعِيُّ/.test(ar[0][1])&&/^ابوہریرہ رضی اللہ عنہ بیان فرماتے ہیں/.test(ur[0][1]),'shafii first rows');
ck(/نذر مانی/.test(ur[1040][1])&&/^أَخْبَرَنَا الشَّافِعِيُّ/.test(ar[1040][0]===1041?ar[1040][1]:''),'shafii volume 2 starts at 1041');
const all=flat([ar,ur,e.intro,e.sections]);
ck(!/[ﷺﷻﷲ﷿﷾ؓؒؑ]/.test(all)&&!/[⟦⟧‹›❶-❿]/.test(all),'shafii no honorific glyphs / raw marks');
ck(!/\(\(/.test(JSON.stringify(ar))&&!/\(\(/.test(flat(ur)),'shafii no (( ');
const noAr=t=>t.replace(/«[^»]*»|﴿[^﴾]*﴾/g,'');
ck(!/یٰ/.test(noAr(flat(ur.map(r=>[r[1],r[3]&&r[3].k,r[3]&&r[3].f])))),'shafii no dagger alif in Urdu text (Arabic phrases/verses keep theirs)');
ck(!/صلی اللہ(?! علیہ وسلم)|رضی اللہ(?! عن[ہھ])/.test(JSON.stringify(ur)),'shafii honorifics complete');
// the only Latin letters are the printed list marks (i) (ii) (iii) … of the translator's fawaid
ck((all.match(/[A-Za-z]+/g)||[]).every(w=>/^(i|ii|iii|iv|v|vi|vii|viii)$/.test(w)),'shafii only printed (i)(ii) marks as Latin');
const ks=ur.filter(r=>r[3]&&r[3].k);ck(ks.length===1799,'shafii takhrij rows '+ks.length);
ck(ks.every(r=>/^\(1\) /.test(r[3].k)&&/ \(1\)$/.test(r[1])),'shafii takhrij typed «(1) …»');
ck(ks.every(r=>!/[۰-۹]/.test(r[3].k)),'shafii takhrij English digits');
ck(ur[0][3].k==='(1) الترمذی (69)، وقال: ’’حسن صحیح‘‘، ابو داود (83)، ابن ماجہ (386)، صححہ ابن خزیمة (112)، الحاکم (1/140، 141)۔','shafii row 1 takhrij');
ck(ks.filter(r=>/ \(\d+(\/\d+)?([،]\s*\d+)*\)/.test(r[3].k)).length>1200,'shafii takhrij converted to «book (number)»');
ck(ur.filter(r=>r[3]&&r[3].f).length===939,'shafii fawaid rows');
ck(ur[0][3].f.includes('\n﴿ إِنَّمَا حَرَّمَ عَلَيْكُمُ الْمَيْتَةَ ﴾ [البقرہ: ۱۷۳]\n’’بے شک'),'shafii verse in own paragraph with reference, translation in ’’ ‘‘');
ck(e.sections.length===583&&e.sections[0][2]===1&&e.sections[582][3]===N&&e.sections.every((s,i)=>i===0||s[2]===e.sections[i-1][3]+1),'shafii 583 contiguous sections');
ck(e.sections[0][1]==='سمندر کے پانی کا بیان'&&e.sections[0][4]==='بَابٌ فِي مَاءِ الْبَحْرِ','shafii first section');
ck(e.heads.length===32&&e.heads[0][1]==='طہارت کے مسائل'&&e.heads[1][0]===51,'shafii 32 kitab groups');
ck(e.intro.length===1&&e.intro[0][0]==='تقریظ'&&e.intro[0][1].length>100,'shafii intro (taqreez)');
ck(e.author[0]==='shafii'&&e.trn.ur==='حافظ محمد نذیر'&&e.langs.join()==='ar,ur','shafii author/translator/langs');
ck(/"musnadshafiiur":14/.test(html),'shafii category 14');
const old=reg.find(x=>x.key==='sh123510');ck(old&&old.langs.join()==='ar','other shafii books untouched');}
// ---------- Saheefa of Ali / Shaan-e-Sahaba (prose books) ----------
for(const [key,rows,secs,intro,cat] of [['saheefaaliur',119,7,'عرض ناشر|تقریظ|مقدمہ',1],['shaansahabaur',192,15,'تقریظ|مقدمہ',17]]){
const e=reg.find(x=>x.key===key);ck(e,key+' registered');const ur=load(key,'ur');
ck(e.prose&&e.langs.join()==='ur'&&ur.length===rows&&e.count===rows&&ur.every((r,i)=>r[0]===i+1),key+' rows '+ur.length);
ck(e.sections.length===secs&&e.sections[0][2]===1&&e.sections[secs-1][3]===rows&&e.sections.every((s,i)=>i===0||s[2]===e.sections[i-1][3]+1),key+' contiguous sections');
ck(e.intro.map(x=>x[0]).join('|')===intro,key+' intro blocks');
const all=flat([ur,e.intro,e.sections,e.sub.ur]);
ck(!/[A-Za-z]/.test(all),key+' no Latin');ck(!/[ﷺﷻﷲ﷿﷾ؓؒؑ⟦⟧‹›❶-❿]/.test(all),key+' no glyphs');ck(!/\(\(/.test(all),key+' no ((');
ck(!/صلی اللہ(?! علیہ وسلم)|رضی اللہ(?! عن[ہھ])(?! بن عفان)/.test(all),key+' honorifics complete (one printed doubtful spot in Shaan-e-Sahaba p.184 is reported to the owner)');
ck(ur.every(r=>r[1][0]==='§'),key+' every row starts with a heading');
ck(new RegExp('"'+key+'":'+cat+'[,}]').test(html),key+' category '+cat);}
{const u=load('saheefaaliur','ur'),e=reg.find(x=>x.key==='saheefaaliur');
ck(/^§سیدنا علی بن ابی طالب رضی اللہ عنہ کے حالات/.test(u[0][1])&&/صحیح بخاری/.test(flat(u))&&/^\[۱\] عَنِ الْأَعْمَشِ/m.test(flat(u)),'saheefa first heading uses سیدنا, riwayat 1 present');
ck(/’’اور ہم نے آپ کی طرف ذکر کو نازل کیا ہے/.test(flat(e.intro))&&/\[النحل: ۴۴\]/.test(flat(e.intro)),'saheefa verse with reference');
ck(e.sub.ur.startsWith('سیدنا علی رضی اللہ عنہ کا نیامی صحیفہ'),'saheefa sub-title');}
{const e=reg.find(x=>x.key==='shaansahabaur');ck(e.sections[0][1]==='باب 1: قرآن حکیم میں صحابہ کرام رضی اللہ عنہم کی فضیلت','shaan first chapter');
ck(/^§باب ۱\n§قرآن حکیم میں/.test(load('shaansahabaur','ur')[0][1]),'shaan chapter number and title stay in one block');}
// Sahaba (Fazail) folder + news
ck(/'fazailnasai','shaansahabaur'\]/.test(html),'Shaan-e-Sahaba is also inside the Fazail as-Sahabah folder');
const n=JSON.parse(fs.readFileSync(R+'news.json','utf8')),c=n[0];
ck(c.id==='20261121a'&&['musnadshafiiur','saheefaaliur','shaansahabaur'].every(k=>{const ix=c.keys.indexOf(k);return ix>=0&&c.l[ix]==='#/s/'+k&&c.i.ur[ix]&&c.i.en[ix]})&&c.i.ur[c.i.ur.length-1].includes('صلاۃ خیرالقرون'),'news lines in the same card as the other new books');
ck(c.i.ur[c.keys.indexOf('musnadshafiiur')].includes('(1819)'),'news count');
ck(/"keys":\["khalqafaalur","ibnkhuzaymahur","humaydiur","musnadshafiiur","saheefaaliur","shaansahabaur"(,"sahifahamamur")?\]/.test(html),'news in app list');
const off=JSON.parse(fs.readFileSync(R+'offline.json','utf8')).groups;ck(['musnadshafiiur','saheefaaliur','shaansahabaur'].every(k=>off.some(g=>g.id==='c_'+k&&g.f.length>=3)),'offline groups');
if(bad)process.exit(1);console.log('PASS shafii_saheefa_shaan_full');
