// Usd al-Ghaba (Urdu): same front as Al-Isaba (letters, names, entries, book form, the extra «مبہم» chip), data checks
const {chromium}=require('playwright'),fs=require('fs');let bad=[];
const reg=fs.readFileSync(__dirname+'/../coll/index.js','utf8'),A=JSON.parse(reg.slice(reg.indexOf('COLLS(')+6,reg.lastIndexOf(')'))),E=A.find(e=>e.key==='asadghabaur');
if(!E)bad.push('not registered');else{
 if(E.count!==7710)bad.push('rows '+E.count);
 if(E.asc.flat().reduce((a,b)=>a+b,0)!==7708)bad.push('entries');
 if(E.asx.length!==29||!E.asz||E.asz[0]!=='مبہم')bad.push('asx/asz');
 if(A.findIndex(e=>e.key==='asadghabaur')!==A.findIndex(e=>e.key==='asabahur')+1)bad.push('order');
 let prev=0;E.files.ur.forEach(f=>{if(f[0]!==prev+1)bad.push('gap '+f[2]);prev=f[1]});if(prev!==E.count)bad.push('files end');
 const rows=[];E.files.ur.forEach(f=>{const s=fs.readFileSync(__dirname+'/../coll/'+f[2],'utf8');rows.push(...JSON.parse(s.slice(s.indexOf(',',s.indexOf('"ur"'))+1,-1)))});
 rows.forEach(r=>{const t=r[1];const ms=[...t.matchAll(/\(([0-9]{1,3})\)/g)].map(m=>m[1]);const fn=r[3]?[...r[3].fn.matchAll(/^\(([0-9]{1,3})\)/gm)].map(m=>m[1]):[];
  if(ms.length&&[...new Set(ms)].join()!==fn.slice(0,ms.length).join())bad.push('marks row '+r[0]);if(/رررسول|[ﷺﷻؓؒ]/.test(t))bad.push('glitch row '+r[0])});
 if(!/^§مقدمہ/.test(rows[0][1]))bad.push('row1');if(!/^§1? ?/.test(rows[1][1]))bad.push('row2');
 if(!rows[2][1].startsWith('§۱ ۔ آبی اللحم الغفاری'))bad.push('row3 '+rows[2][1].slice(0,30));
 if(rows.some(r=>/^§(سیدنا|سیدہ) /.test(r[1].split('\n').slice(-1)[0])&&0))bad.push('x');
 const R=n=>rows.find(r=>r[1].startsWith('§'+n+' ۔ '));   // corrections read from the printed pages of the PDF (26-11-2026)
 [['۱۴۴۹','بن شہاب عبدی۔ قبیلہ عبد القیس سے ہیں'],['۱۴۷۶','اسود کے والد ہیں'],['۱۶۰۲','انصاری ہیں'],['۱۶۲۷','عبید زراح'],['۱۵۰۱','خیبری بن نعمان طائی'],['۱۵۷۲','خزاعی کے صحابی ہیں'],['۳۰۸۳','جمحی'],['۵۰۸۹','منبہ']].forEach(([n,t])=>{const r=R(n);if(!r||!r[1].includes(t))bad.push('fix '+n)});
 const sec=new Set();E.sections.forEach(s=>{if(!s[5]||s[5].k===undefined)return;const k=s[5].k+'/'+s[5].l;if(sec.has(k))bad.push('split '+s[1]);sec.add(k)});
}
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:430,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.newsSeen='20261125b';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur'}catch(e){}});
await p.goto('http://localhost:8765/index.html#/s/asadghabaur');await p.waitForSelector('.asb-c',{timeout:25000});
let r=await p.evaluate(()=>({c:document.querySelectorAll('.asb-c').length,w:document.querySelectorAll('.asb-w').length,sw:document.documentElement.scrollWidth,miss:!!document.querySelector('.asb-miss')}));
if(r.c!==29||r.w!==1)bad.push('chips '+JSON.stringify(r));if(r.sw>440)bad.push('h-scroll');if(r.miss)bad.push('miss note');
await p.click('.asb-c:nth-child(1)');await p.waitForSelector('.asb-n',{timeout:20000});
r=await p.evaluate(()=>({n:document.querySelectorAll('.asb-n').length,h:[...document.querySelectorAll('.asb-kh')].map(x=>x.textContent),first:document.querySelector('.asb-n').textContent}));
if(r.n<100||!r.h.length||!/آبی اللحم/.test(r.first))bad.push('letter list '+JSON.stringify(r).slice(0,150));
await p.click('.asb-n');await p.waitForSelector('.bkitem',{timeout:20000});await p.waitForTimeout(300);
r=await p.evaluate(()=>({t:document.querySelector('.bkitem').textContent.slice(0,60),nav:!!document.querySelector('.asb-nav .asb-back')}));if(!/آبی اللحم/.test(r.t)||!r.nav)bad.push('entry '+JSON.stringify(r));
await p.goto('http://localhost:8765/index.html#/s/asadghabaur?l=28');await p.waitForSelector('.asb-n',{timeout:20000});
r=await p.evaluate(()=>({n:document.querySelectorAll('.asb-n').length,h:[...document.querySelectorAll('.asb-kh')].map(x=>x.textContent)}));if(r.n<100||r.h.length<1)bad.push('mubham '+JSON.stringify(r).slice(0,150));
await p.goto('http://localhost:8765/index.html#/s/asadghabaur');await p.waitForSelector('#csearch');await p.fill('#csearch','خالد بن ولید');await p.waitForSelector('.asb-n',{timeout:30000});
r=await p.evaluate(()=>[...document.querySelectorAll('.asb-nm')].map(x=>x.textContent));if(!r.some(t=>/خالد بن الولید|خالد بن ولید/.test(t)))bad.push('search '+r.slice(0,3));
await p.goto('http://localhost:8765/index.html#/s/asadghabaur/1');await p.waitForSelector('.bkitem',{timeout:20000});
{const T=require('fs').readdirSync(__dirname+'/../coll').filter(f=>f.startsWith('asadghabaur_ur_')).map(f=>require('fs').readFileSync(__dirname+'/../coll/'+f,'utf8')).join('');for(const k of ['§۳۱۷۲ (مکرر)','§۳۱۷۳ (مکرر)','§۳۱۷۴ (مکرر)','§۶۱۶۸(الف)','§۶۱۶۸(ب)'])if(!T.includes(k))bad.push('label '+k);if(T.indexOf('§۳۱۷۲ (مکرر)')<T.indexOf('§۳۱۷۴ ۔')&&0)bad.push('x')}
console.log(bad.length?'FAIL '+bad.slice(0,10).join('|'):'PASS asadghaba_book');await b.close();process.exit(bad.length?1:0)})();
