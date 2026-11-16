// Nepali interface shows the Nepali Quran translation (Ahl al-Hadith) by default; language list shows the English name of every language
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.addInitScript(()=>{localStorage.ui='ne';localStorage.qset=JSON.stringify({mode:'tr'});localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/q/s/1');await p.waitForTimeout(4000);await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(e=>e.remove()));
const t=await p.evaluate(()=>document.body.innerText);ck(t.includes('अल्लाहको नामबाट'),'Nepali translation shown');
await p.goto('http://localhost:8765/#/q/s/114/6');await p.waitForTimeout(3000);
const n=await p.evaluate(async()=>{const x=await fetch('quran/ne_ahlhadith.js').then(r=>r.text());let a;window.QLOAD=(z)=>{a=z[1]};new Function(x)();return a.length});
ck(n===6236,'6236 verses '+n);
await p.click('#uilang').catch(()=>{});await p.waitForTimeout(500);
const L=await p.evaluate(()=>[...document.querySelectorAll('.langitem .lgen')].map(e=>e.textContent));
ck(L.join()==='Urdu,Arabic,Bangla,Hindi,Gujarati,French,Nepali','english names '+L.join());
ck(!errs.length,'errors '+errs[0]);await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
