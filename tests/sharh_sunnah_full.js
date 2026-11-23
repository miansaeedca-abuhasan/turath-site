// Sharh as-Sunnah (al-Baghawi) Urdu, Ansar as-Sunnah Publications, volumes 1-6: counts, order, printed numbers, clean text, opens in the reader
const fs=require('fs');const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const idxS=fs.readFileSync(__dirname+'/../coll/index.js','utf8');const L=JSON.parse(idxS.slice(idxS.indexOf('COLLS(')+6,idxS.lastIndexOf(')')));
const e=L.find(x=>x.key==='sharhsunnaur');ck(e,'registered');
ck(L.findIndex(x=>x.key==='sharhsunnaur')===L.findIndex(x=>x.key==='sharhsunna')+1,'stands next to the Arabic Baghawi');
ck(e.count===3747,'count 3747');ck(e.trn&&e.trn.ur==='ابو ثمامہ محمد عبد اللہ سلیم','translator');ck(e.pub&&e.pub.ur.includes('انصار السنہ'),'publisher');
const rows=l=>{let o=[];for(const f of e.files[l]){const s=fs.readFileSync(__dirname+'/../coll/'+f[2],'utf8');o=o.concat(JSON.parse(s.slice(s.indexOf('[['),s.lastIndexOf(')'))))}return o};
const ar=rows('ar'),ur=rows('ur');ck(ar.length===3747&&ur.length===3747,'rows');
ar.forEach((r,i)=>{if(r[0]!==i+1||ur[i][0]!==i+1)ck(false,'ids sequential '+i)});
// sections cover every row once, in order
let nx=1;e.sections.forEach(s=>{if(s[3]>=s[2]){ck(s[2]===nx,'section '+s[0]+' starts at '+nx+' not '+s[2]);nx=s[3]+1}else ck(s[2]===nx,'empty section position '+s[0])});ck(nx===3748,'sections end');
ck(e.sections.length===1353&&e.heads.length===40,'1353 babs, 40 kitabs');
// printed numbers
const an={};for(const k in e.an){if(k==='_r')continue;an[k]=e.an[k]}for(const [a,v,c] of (e.an._r||[]))for(let i=0;i<c;i++)an[a+i]=String(v+i);
const pn=n=>an[n]||String(n);
ck(pn(1)==='1'&&pn(301)==='301'&&pn(302)==='302/1'&&pn(303)==='302/2'&&pn(304)==='303','printed 302/1 302/2');
ck(pn(2410)==='2406/م','printed 2406/م');ck(pn(3747)==='3742','last printed 3742');
// row 1: Arabic, translation, takhrij; no stray signs
ck(ar[0][1].startsWith('أَخْبَرَنَا أَبُو سَعْدٍ')&&/إِلَى مَا هَاجَرَ إِلَيْهِ\.$/.test(ar[0][1]),'hadith 1 Arabic ends with a full stop');
ck(ur[0][1].startsWith('سیدنا عمر بن خطاب رضی اللہ عنہ')&&ur[0][3].k.includes('البخارى: 1, 54')===false&&ur[0][3].k.startsWith('أخرجه البخارى'),'hadith 1 Urdu + takhrij without the number prefix: '+ur[0][3].k);
let lat=0,dbl=0,sym=0,dash=0,hz=0;
for(const r of ar){if(/\(\(|\)\)/.test(r[1]))dbl++;if(/[ﷺﷻؓؒؑ]/.test(r[1]))sym++;if(/-/.test(r[1].replace(/[\d\u0660-\u0669]-[\d\u0660-\u0669]/g,"")))dash++}
for(const r of ur){for(const t of [r[1],...Object.values(r[3]||{})]){if(/[ﷺﷻؓؒؑ]/.test(t))sym++;if(/(^|\s)-(\s|$)/.test(t.replace(/[\u06f0-\u06f9] - [\u06f0-\u06f9]/g,'')))dash++;lat+=(t.match(/[A-Za-z]+/g)||[]).filter(w=>!/^(Hyena|Dark|brown)$/.test(w)).length}}
ck(!dbl,'no double brackets in Arabic hadith ('+dbl+')');ck(!sym,'no honorific signs');ck(!dash,'no «-» used as a full stop ('+dash+')');ck(!lat,'no stray Latin letters ('+lat+')');
// translation keeps the dagger alif
ck(ur.some(r=>/تعالیٰ/.test(r[1])),'dagger alif kept');
// intro: 6 parts, footnotes of the biography are 23, marks (1)..(23) all present
ck(e.intro.length===6,'6 intro parts');const bio=e.intro.find(x=>x[0].includes('بغوی')&&x[1].some(p=>p==='§حواشی'));ck(bio,'biography with notes');
if(bio){const t=bio[1].join('\n');for(let i=1;i<=23;i++)ck(t.includes('('+i+')'),'footnote '+i)}
// chapter notes load
ck(e.ntx&&e.ntx.length>=1&&fs.existsSync(__dirname+'/../coll/'+e.ntx[0][2]),'chapter notes file');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:420,height:900}});const errs=[];p.on('pageerror',x=>errs.push(x.message));
await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/#/s/sharhsunnaur/n/301');await p.waitForTimeout(3500);
ck(await p.evaluate(()=>document.body.innerText.includes('ابراہیم بن عبدالرحمن بن عوف')&&document.body.innerText.includes('أخرجه ابوداود')),'hadith 301 opens with translation and takhrij');
ck(await p.evaluate(()=>/3747|\u06f3\u06f7\u06f4\u06f7/.test(document.body.textContent)),'3747 in the strip');
await p.goto('http://localhost:8765/#/s/sharhsunnaur?idx');await p.waitForTimeout(3000);
ck(await p.evaluate(()=>document.body.innerText.includes('ایمان کی کتاب')),'chapter list shows kitab headings');
// Urdu list: only the translated book, not the Arabic twin
await p.goto('http://localhost:8765/#/hb');await p.waitForTimeout(3500);
const names=await p.evaluate(()=>[...document.querySelectorAll('a,.card')].map(x=>x.textContent).filter(t=>t.includes('شرح السنۃ للبغوی')).length);
ck(names===1,'one Sharh as-Sunnah entry in the Urdu list ('+names+')');
ck(!errs.length,'page errors '+errs);console.log(bad?'FAIL':'PASS sharh_sunnah_full');await b.close();process.exit(bad?1:0)})();
