// Guard: «معجم اوسط للطبرانی» (translator Abu Anas Muhammad Sarwar Gohar, takhrij and fawaid Hafiz Abdul Shakoor Tirmidhi): Arabic, takhrij, Urdu translation, fawaid; 9489 entries with unique numbers; introduction with footnote marks
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
const reg=await (await fetch('http://localhost:8765/coll/index.js')).text();ck(/"key":"mujamawsat"[^]*?"count":9489/.test(reg),'registered 9489');
await p.goto('http://localhost:8765/#/s/mujamawsat/n/1');await p.waitForSelector('.card',{timeout:25000});await p.evaluate(()=>document.querySelectorAll('.sheetbg,#ipop').forEach(e=>e.remove()));await p.waitForTimeout(6000);
let t=await p.evaluate(()=>document.body.innerText);
ck(/احمد بن عبد الوهاب/.test(t.replace(/[\u064B-\u0652\u0670]/g,'').replace(/[أإآ]/g,'ا')),'arabic');ck(/السنن الكبرى للبيهقي|المعجم الكبير للطبرانی/.test(t),'takhrij');ck(/اُمتِ مرحومہ|میری اُمت/.test(t),'urdu translation');
await p.goto('http://localhost:8765/#/s/mujamawsat/n/6000');await p.waitForTimeout(3000);t=await p.evaluate(()=>document.body.innerText);ck(/6000/.test(t)||/٦٠٠٠/.test(t),'hadith 6000 opens');
const st=await p.evaluate(async()=>{const x=await fetch('coll/index.js').then(r=>r.text());const fs=[...x.matchAll(/mujamawsat_ur_\d+_[0-9a-f]+\.js/g)].map(m=>m[0]);let seen=new Set(),n=0,empty=0;for(const f of fs){const s=await fetch('coll/'+f).then(r=>r.text());const rows=JSON.parse(s.slice(s.indexOf(',[[')+1,s.lastIndexOf(');')));rows.forEach(r=>{seen.add(r[0]);n++;if(!r[1])empty++})}return [fs.length,n,seen.size,empty]});
ck(st[0]===10&&st[1]===9489&&st[2]===9489,'unique numbers '+st);ck(st[3]<=100,'empty translations (92 are hadith 5489-5580, whose pages 501-550 are missing in the printed book) '+st[3]);
ck(!errs.length,'js errors '+errs[0]);
console.log(bad?'FAIL':'PASS mujamawsat');await b.close();process.exit(bad?1:0)})()
