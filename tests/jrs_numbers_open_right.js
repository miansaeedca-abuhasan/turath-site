// guards: a number in the list of a companion opens that very hadith (not the first hadith of its chapter) and is narrated by him;
// wrong numbers found by comparing the text (Abu Wail under Ubayy, Qays b. Asim under Abu Hurayra ...) stay out of the lists
const {chromium,devices}=require('playwright');const fs=require('fs');
const s=fs.readFileSync(__dirname+'/../data/jrs.js','utf8');const D=JSON.parse(s.slice(s.indexOf('(')+1,s.lastIndexOf(')')));let bad=0;
const by=i=>D.n.find(x=>x.nm.ar===({1:'أبو هريرة',2:'أنس بن مالك',4:'عبد الله بن عباس',6:'جابر بن عبد الله',23:'أبي بن كعب',141:'أبو عبيدة'})[i]);
const gone={1:[1504,7787,10303],2:[3636,4382],4:[2912,2949,13113],6:[5436,5825],23:[2034,3311,3632,7593,7984,9016,9023,11296,11804,11805,13308,13630,14572,15697,15815,8995,15454],141:[3980,4181,16502]};
for(const k in gone)for(const n of gone[k])if(by(+k).h.includes(n)){console.log('FAIL wrong number back',k,n);bad++;}
for(const x of D.n)if(x.c!==x.h.length){console.log('FAIL count',x.i);bad++;}
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['Pixel 7'],locale:'ur'});
for(const idx of [0,1]){const p=await ctx.newPage();
 await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=new Date().toDateString()});
 await p.goto('http://localhost:8765/#/jr/'+(D.n.findIndex(x=>x.nm.ar==='عقبة بن عامر')+1));await p.waitForTimeout(2500);await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(x=>x.remove()));
 const t=await p.$$('.tabs [role=tab]');await t[2].tap();await p.waitForTimeout(600);
 const c=await p.$$('.chips a');const no=(await c[idx].textContent()).trim();await c[idx].tap();await p.waitForTimeout(3000);
 const r=await p.evaluate(n=>{const e=document.querySelector('#list [data-n="'+n+'"]');if(!e)return null;const y=e.getBoundingClientRect().top;return {y,txt:e.innerText.slice(0,200)}},no);
 if(!r||r.y<-5||r.y>300||!/عقبة|عُقْبَةَ/.test(r.txt)){console.log('FAIL jump/narrator',no,JSON.stringify(r));bad++;}
 await p.close();}
console.log(bad?'FAILED':'ok');await b.close();process.exit(bad?1:0)})()
