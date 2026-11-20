// Index of hadith openings of Silsila Ahadith Sahiha: rows, numbers open the Silsila hadith with the printed number, no link where the print has none
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});
p.on('pageerror',e=>{bad++;console.log('pageerror',e.message)});
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/hb');await p.waitForTimeout(2000);
const r=await p.evaluate(async()=>{const idx=await (await fetch('coll/index.js')).text();const A=JSON.parse(idx.slice(idx.indexOf('(')+1,idx.lastIndexOf(')')));
 const e=A.find(x=>x.key==='silsilaatraf');const rows=[];for(const [a,c,n] of e.files.ar){const t=await (await fetch('coll/'+n)).text();rows.push(...JSON.parse(t.slice(t.indexOf(',[')+1,t.lastIndexOf(')')).replace(/^"[a-z]+",/,'')))}
 return {count:e.count,n:rows.length,seq:rows.every((x,i)=>x[0]===i+1),first:rows[0],r21:rows[20],nolink:rows.filter(x=>!x[2]).length,order:A.map(x=>x.key).indexOf('silsilaatraf')-A.map(x=>x.key).indexOf('silsila')}});
ck(r.count===4982&&r.n===4982&&r.seq,'rows '+JSON.stringify([r.count,r.n,r.seq]));ck(r.order===1,'listed next to the book');
ck(r.first[2]==='3179'&&/آتي باب الجنة/.test(r.first[1]),'first row');ck(r.r21[2]==='477','row 21 -> id 477 (printed 471)');ck(r.nolink<80,'no-link rows '+r.nolink);
await p.goto('http://localhost:8765/#/s/silsilaatraf/n/21');await p.waitForTimeout(2500);
const t=await p.evaluate(()=>({txt:document.body.innerText,btn:[...document.querySelectorAll('.atn a')].map(a=>[a.textContent.trim(),a.getAttribute('href')])}));
ck(/ابايعك/.test(t.txt),'row text');ck(t.btn.length===1&&t.btn[0][1]==='#/s/silsila/n/477'&&/471/.test(t.btn[0][0].replace(/[٠-٩]/g,c=>c.charCodeAt(0)-0x660).replace(/[۰-۹]/g,c=>c.charCodeAt(0)-0x6f0)),'button '+JSON.stringify(t.btn));
console.log(bad?'FAILED':'OK');await b.close();process.exit(bad?1:0)})();
