// Al-Isabah (Urdu): the book front (name search + 28 letter circles), the names of a letter, an entry opened by its name, the book form, footnotes
const {chromium}=require('playwright'),fs=require('fs');let bad=[];
const reg=fs.readFileSync(__dirname+'/../coll/index.js','utf8'),A=JSON.parse(reg.slice(reg.indexOf('COLLS(')+6,reg.lastIndexOf(')'))),E=A.find(e=>e.key==='asabahur');
if(!E)bad.push('not registered');else{
 if(E.count!==12261)bad.push('row count '+E.count);
 const tot=E.asc.flat().reduce((a,b)=>a+b,0);if(tot!==12257)bad.push('entries '+tot);
 if(E.asx.length!==28)bad.push('asx');
 if(A.findIndex(e=>e.key==='asabahur')<A.length-4)bad.push('Isaba stands among the last (new) books');
 let prev=0;E.files.ur.forEach(f=>{if(f[0]!==prev+1)bad.push('gap before file '+f[2]);prev=f[1]});if(prev!==E.count)bad.push('files end '+prev);
 const rows=[];E.files.ur.forEach(f=>{const s=fs.readFileSync(__dirname+'/../coll/'+f[2],'utf8');rows.push(...JSON.parse(s.slice(s.indexOf(',',s.indexOf('"ur"'))+1,-1)))});
 rows.forEach(r=>{const t=r[1],ms=[...t.matchAll(/\(([0-9]{1,3})\)/g)].map(m=>m[1]),fs_=r[3]?[...r[3].fn.matchAll(/^\(([0-9]{1,3})\)/gm)].map(m=>m[1]):[];
  if([...new Set(ms)].sort().join()!==[...new Set(fs_)].sort().join())bad.push('marks/notes differ in row '+r[0]);
  if(/\[[0-9۰-۹]+\]|✳/.test(t))bad.push('raw mark in row '+r[0]);
  if(/[ﷺﷻؓؒ]/.test(t))bad.push('symbol in row '+r[0])});
 if(!rows[0][1].startsWith('§۱ ۔ آبی اللحم الغفاری(1)'))bad.push('first row '+rows[0][1].slice(0,40));
 if(E.sections.some(s=>!(s[5]&&s[5].l>=0)))bad.push('section meta');
 const sec=new Set();E.sections.forEach(s=>{const k=s[5].k+'/'+s[5].l;if(sec.has(k))bad.push('split section '+s[1]);sec.add(k)});
}
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:430,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.newsSeen='20261125b';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur'}catch(e){}});
await p.goto('http://localhost:8765/index.html#/s/asabahur');await p.waitForSelector('.asb-c',{timeout:25000});
let r=await p.evaluate(()=>({c:document.querySelectorAll('.asb-c').length,txt:[...document.querySelectorAll('.asb-c')].map(x=>x.textContent).join(''),srch:!!document.querySelector('#csearch'),off:document.querySelectorAll('.asb-c.off').length,miss:!!document.querySelector('.asb-miss'),w:document.documentElement.scrollWidth}));
if(r.c!==28||r.txt!=='ابتثجحخدذرزسشصضطظعغفقکلمنہوی')bad.push('letters '+r.txt);if(!r.srch)bad.push('no search');if(r.miss)bad.push('vol3 note still shown');if(r.w>440)bad.push('h-scroll '+r.w);
await p.click('.asb-c:nth-child(1)');await p.waitForSelector('.asb-n',{timeout:20000});
r=await p.evaluate(()=>({n:document.querySelectorAll('.asb-n').length,h:[...document.querySelectorAll('.asb-kh')].map(x=>x.textContent),first:document.querySelector('.asb-n').textContent,href:document.querySelector('.asb-n').getAttribute('href'),cols:getComputedStyle(document.querySelector('.asb-g')).gridTemplateColumns.split(' ').length}));
if(r.n<100)bad.push('few names '+r.n);if(!r.h.length)bad.push('no kind heading');if(!/آبی اللحم/.test(r.first))bad.push('first name '+r.first);if(r.cols!==2)bad.push('phone columns '+r.cols);
await p.click('.asb-n');await p.waitForSelector('.bkitem',{timeout:20000});await p.waitForTimeout(400);
r=await p.evaluate(()=>({t:document.querySelector('.bkitem').textContent.slice(0,80),fm:document.querySelectorAll('.bkitem sup.fnm').length,nav:!!document.querySelector('.asb-nav .asb-back'),fn:!!document.querySelector('.pfnbox')}));
if(!/آبی اللحم/.test(r.t))bad.push('entry text '+r.t);if(r.fm<2)bad.push('footnote marks '+r.fm);if(!r.nav)bad.push('entry nav');if(!r.fn)bad.push('notes box');
// search
await p.goto('http://localhost:8765/index.html#/s/asabahur');await p.waitForSelector('#csearch');await p.fill('#csearch','خالد بن ولید');await p.waitForSelector('.asb-n',{timeout:30000});
r=await p.evaluate(()=>[...document.querySelectorAll('.asb-nm')].map(x=>x.textContent));if(!r.some(t=>/خالد بن ولید/.test(t)))bad.push('search miss '+r.slice(0,3));
await p.fill('#csearch','1');await p.waitForTimeout(1500);r=await p.evaluate(()=>[...document.querySelectorAll('.asb-no')].map(x=>x.textContent));if(!r.includes('1'))bad.push('number search');
// book form
await p.goto('http://localhost:8765/index.html#/s/asabahur/1');await p.waitForSelector('.bkitem',{timeout:20000});
r=await p.evaluate(()=>({n:document.querySelectorAll('.bkitem').length,h:document.querySelectorAll('.bkitem h4.subh').length}));if(r.n<5||r.h<5)bad.push('book form '+JSON.stringify(r));
// desktop columns
const q=await(await b.newContext({viewport:{width:1200,height:900}})).newPage();await q.addInitScript(()=>{try{localStorage.newsSeen='20261125b';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur'}catch(e){}});
await q.goto('http://localhost:8765/index.html#/s/asabahur?l=0');await q.waitForSelector('.asb-n',{timeout:25000});const cl=await q.evaluate(()=>getComputedStyle(document.querySelector('.asb-g')).gridTemplateColumns.split(' ').length);if(cl!==4)bad.push('desktop columns '+cl);
console.log(bad.length?'FAIL '+bad.slice(0,12).join('|'):'PASS asabah_book');await b.close();process.exit(bad.length?1:0)})();
