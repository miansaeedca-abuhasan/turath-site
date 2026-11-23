// Jamul Fowaid (al-Maghribi) Urdu commentary, Ansar as-Sunnah Publications, volumes 1-5: counts, order, printed numbers, clean text, opens in the reader
const fs=require('fs');const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const idxS=fs.readFileSync(__dirname+'/../coll/index.js','utf8');const L=JSON.parse(idxS.slice(idxS.indexOf('COLLS(')+6,idxS.lastIndexOf(')')));
const e=L.find(x=>x.key==='jamulfawaid');ck(e,'registered');
ck(L.findIndex(x=>x.key==='jamulfawaid')===L.findIndex(x=>x.key==='sharhsunnaur')+1,'stands after Sharh as-Sunnah (Urdu)');
ck(e.count===7620,'count 7620');ck(e.trn&&e.trn.ur==='مولانا محمد احمد ولد پیر','translator');ck(e.shn&&e.shn.ur.includes('گوندلوی'),'commentator');ck(e.nj&&e.parts,'word-meaning and commentary tabs');
const rows=l=>{let o=[];for(const f of e.files[l]){const s=fs.readFileSync(__dirname+'/../coll/'+f[2],'utf8');o=o.concat(JSON.parse(s.slice(s.indexOf('[['),s.lastIndexOf(')'))))}return o};
const ar=rows('ar'),ur=rows('ur');ck(ar.length===7620&&ur.length===7620,'rows');
ar.forEach((r,i)=>{if(r[0]!==i+1||ur[i][0]!==i+1)ck(false,'ids sequential '+i)});
let nx=1;e.sections.forEach(s=>{ck(s[3]>=s[2]&&s[2]===nx,'section '+s[0]+' starts at '+nx+' not '+s[2]);nx=s[3]+1});ck(nx===7621,'sections end');
ck(e.sections.length===236&&e.heads.length===31,'236 babs, 31 kitabs');
// printed numbers: 1..7628, the 8 numbers missing in the printed book (verified for 966 in the PDF)
const an={};for(const k in e.an){if(k==='_r')continue;an[k]=e.an[k]}for(const [a,v,c] of (e.an._r||[]))for(let i=0;i<c;i++)an[a+i]=String(v+i);
const pn=n=>an[n]||String(n);const printed=new Set(ar.map((r,i)=>pn(i+1)));
const miss=[];for(let n=1;n<=7628;n++)if(!printed.has(String(n)))miss.push(n);
ck(miss.join()==='966,2087,2670,3697,4148,4791,5599,6195','missing printed numbers '+miss);
ck(pn(965)==='965'&&pn(966)==='967'&&pn(7620)==='7628','printed numbers shift after the gap');
// merged page-split hadith: 748 and 2079 fixed; 1768 got its second part
const row=n=>ur[ar.findIndex((r,i)=>pn(i+1)===String(n))];
ck(row(748)[1].includes('اوزاعی')&&row(2079)[1].includes('عمیر'),'748 / 2079 fixed numbers');
ck(row(1768)[1].includes('کے بال شیطان کے ہاتھ میں ہیں'),'1768 joined from two pages');
// row 1
ck(ar[0][1].startsWith('عَنْ عُبَادَةَ بْنِ الصَّامِتِ')&&/\.$/.test(ar[0][1]),'hadith 1 Arabic ends with a full stop');
ck(ur[0][1].startsWith('سیدنا عبادہ بن صامت رضی اللہ عنہ')&&ur[0][3].k.startsWith('(1، 2، 3، 4) بخاری (3435)')&&!ur[0][3].m,'hadith 1: translation and takhrij (word meanings and commentary stand with the last hadith of the group 1-4, as printed)');
ck(ur[3][3].m&&ur[3][3].m.startsWith('أَلْقَاهَا')&&ur[3][3].e&&ur[3][3].e.startsWith('۱۔ کتاب سے مراد'),'hadith 4 carries the word meanings and the commentary of the group');
let lat=0,dbl=0,sym=0,dg=0,tat=0;
for(const r of ar){if(/\(\(|\)\)/.test(r[1]))dbl++;if(/[ﷺﷻؓؒؑ]/.test(r[1]))sym++;if(/[۰-۹]/.test(r[1]))dg++}
for(const r of ur){for(const t of [r[1],...Object.values(r[3]||{})]){if(/[ﷺﷻؓؒؑ]/.test(t))sym++;lat+=(t.match(/[A-Za-z]+/g)||[]).length;if(/[ا-ي]ـ[ا-ي]/.test(t))tat++}}
ck(!dbl,'no double brackets in Arabic hadith ('+dbl+')');ck(!sym,'no honorific signs');ck(!lat,'no stray Latin letters ('+lat+')');ck(!dg,'Arabic text has Arabic digits only ('+dg+')');ck(!tat,'no tatweel inside Urdu words ('+tat+')');
ck(ur.some(r=>/تعالیٰ/.test(r[1])),'dagger alif kept');
// intro: 3 parts; the 2 notes of the publisher's word
ck(e.intro.length===3&&e.intro[0][0]==='عرض ناشر'&&e.intro[1][0]==='تقریظ'&&e.intro[2][0]==='کلمہ مؤلف','3 intro parts');
ck(e.intro[0][1].includes('§حواشی')&&e.intro[0][1].some(p=>p.startsWith('(2) ')),'publisher notes');
ck(e.ntx&&e.ntx.length>=1&&fs.existsSync(__dirname+'/../coll/'+e.ntx[0][2]),'chapter notes file');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:420,height:900}});const errs=[];p.on('pageerror',x=>errs.push(x.message));
await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/#/s/jamulfawaid/n/6');await p.waitForTimeout(3500);
ck(await p.evaluate(()=>document.body.innerText.includes('ابوسعید')&&document.body.innerText.includes('ابوداود')),'hadith 6 opens with translation and takhrij');
ck(await p.evaluate(()=>/الفاظ کے معانی/.test(document.body.innerText)),'word-meaning tab');
await p.goto('http://localhost:8765/#/hb');await p.waitForTimeout(3500);
const names=await p.evaluate(()=>[...document.querySelectorAll('a,.card')].map(x=>x.textContent).filter(t=>t.includes('جمع الفوائد')).length);
ck(names>=1,'Jamul Fowaid in the Urdu list ('+names+')');
ck(!errs.length,'page errors '+errs);console.log(bad?'FAIL':'PASS jamul_fowaid_full');await b.close();process.exit(bad?1:0)})();
