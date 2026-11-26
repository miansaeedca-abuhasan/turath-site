// Tabaqat Ibn Sa'd (Urdu, Nafees Academy): registry, rows, notes, reader page, Sahaba folder, news line
const {chromium}=require('playwright'),fs=require('fs');let bad=[];
const reg=fs.readFileSync(__dirname+'/../coll/index.js','utf8'),A=JSON.parse(reg.slice(reg.indexOf('COLLS(')+6,reg.lastIndexOf(')'))),E=A.find(e=>e.key==='tabaqatur');
if(!E)bad.push('not registered');else{
 if(E.count!==1167)bad.push('row count '+E.count);
 if(E.sections.length!==83)bad.push('sections '+E.sections.length);
 if(A.findIndex(e=>e.key==='tabaqatur')!==A.findIndex(e=>e.key==='sh146')+1)bad.push('order next to sh146');
 if(!E.author||E.author[0]!=='ibnsad')bad.push('author');
 let prev=0;E.files.ur.forEach(f=>{if(f[0]!==prev+1)bad.push('gap before file '+f[2]);prev=f[1]});if(prev!==E.count)bad.push('files end '+prev);
 const rows=[];E.files.ur.forEach(f=>{const s=fs.readFileSync(__dirname+'/../coll/'+f[2],'utf8');rows.push(...JSON.parse(s.slice(s.indexOf(',',s.indexOf('"ur"'))+1,-1)))});
 rows.forEach((r,i)=>{if(r[0]!==i+1)bad.push('id '+r[0]);const t=r[1],ms=[...t.matchAll(/\(([0-9]{1,3})\)/g)].map(m=>m[1]),fs_=r[3]?[...r[3].fn.matchAll(/^\(([0-9]{1,3})\)/gm)].map(m=>m[1]):[];
  if(ms.join()!==fs_.join())bad.push('marks/notes differ in row '+r[0]);
  if(/[❶❷✿\x01\x02]/.test(t+(r[3]?r[3].fn:'')))bad.push('raw mark in row '+r[0]);
  if(/[ﷺﷻؓؒ]/.test(t))bad.push('symbol in row '+r[0]);
  if(/[A-Za-z]/.test(t))bad.push('latin in row '+r[0])});
 if(rows.filter(r=>r[3]).length!==21)bad.push('rows with notes '+rows.filter(r=>r[3]).length);
 if(!rows[0][1].startsWith('بسم اللہ الرحمن الرحیم\nسرکار دو عالم'))bad.push('first row');
 if(!rows.some(r=>r[1].startsWith('§سیدنا ابوبکر رضی اللہ عنہ')))bad.push('no person heading');
 if(rows.some(r=>/^§.*:$/m.test(r[1])))bad.push('heading keeps colon');
}
const sk=fs.readFileSync(__dirname+'/../index.html','utf8');
if(!/sahaba:\[[^\]]*'asadghabaur','tabaqatur'/.test(sk))bad.push('not in Sahaba folder');
const nw=JSON.parse(fs.readFileSync(__dirname+'/../news.json','utf8'));if(!nw[0].keys.includes('tabaqatur')||Object.values(nw[0].i).some(a=>a.length<3))bad.push('news line');
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:430,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.newsSeen='20261125b';localStorage.newsDay=new Date().toDateString()}catch(e){}});
await p.goto('http://localhost:8765/index.html#/s/tabaqatur?idx');await p.waitForSelector('.snum',{timeout:25000});
const n=await p.$$eval('.snum',x=>x.length);if(n<80)bad.push('section list '+n);
await p.goto('http://localhost:8765/index.html#/s/tabaqatur/1');await p.waitForSelector('.bkitem',{timeout:25000});await p.waitForTimeout(500);
const r=await p.evaluate(()=>({items:document.querySelectorAll('.bkitem').length,txt:document.querySelector('.bkitem').innerText.slice(0,30)}));
if(r.items<1||!/بسم/.test(r.txt))bad.push('section 1 '+JSON.stringify(r));
await p.goto('http://localhost:8765/index.html#/s/tabaqatur/11');await p.waitForSelector('.bkitem',{timeout:25000});
const h=await p.$$eval('h4.subh',x=>x.length);if(h<3)bad.push('headings '+h);
await p.goto('http://localhost:8765/index.html#/sec/sahaba');await p.waitForTimeout(1500);
const t=await p.evaluate(()=>document.body.innerText);if(!/طبقات ابن سعد \(اردو\)/.test(t)&&!/Tabaqat al-Kubra of Ibn Sa/.test(t))bad.push('not listed in Sahaba page');
await b.close();console.log(bad.length?'FAIL '+bad.slice(0,15).join(' | '):'PASS tabaqat_book');process.exit(bad.length?1:0)})();
