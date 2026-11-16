// children's quiz card shows a flowers picture (no emoji); an answer is chosen once and cannot be changed or revisited
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/quiz');await p.waitForTimeout(2500);await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(e=>e.remove()));
ck(await p.$('.qzwk .qzfl svg')||await p.$('.qzwk svg'),'flowers svg on the children card');
ck(!(await p.evaluate(()=>document.querySelector('.qzwk').innerText.includes('🧒'))),'no child emoji');
await p.click('.qzwk');await p.waitForTimeout(1500);await p.click('.qzcat, .card.qzcat');await p.waitForTimeout(1500);
await p.click('.qzlv, .qzgrid a, .qzgrid button, .qzlevel');await p.waitForTimeout(2000);
ck(await p.$('.qzopt'),'question shown');
ck(!(await p.$('.qznav')),'no previous/next');
const first=await p.evaluate(()=>document.querySelector('.qzcount').textContent);
await p.click('.qzopt >> nth=0');await p.click('.qzopt >> nth=1').catch(()=>{});await p.waitForTimeout(900);
const second=await p.evaluate(()=>document.querySelector('.qzcount')?.textContent);ck(second&&second!==first,'moved to next question once');
ck(!(await p.$('.qznav')),'still no nav');ck(!errs.length,'errors '+errs[0]);await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
