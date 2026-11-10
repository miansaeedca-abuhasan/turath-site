// Guard: the library copy «المعجم الصغير للطبراني» (sh13068) shows a button to the matching hadith of the Urdu-translated Mu'jam as-Saghir (matched by words, not numbers)
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
const reg=await (await fetch('http://localhost:8765/coll/index.js')).text();ck(/"xr":\{"key":"mujamsaghir"/.test(reg),'cross-link table registered');
await p.goto('http://localhost:8765/#/s/sh13068/n/10');await p.waitForSelector('.card',{timeout:25000});await p.evaluate(()=>document.querySelectorAll('.sheetbg,#ipop').forEach(n=>n.remove()));await p.waitForTimeout(2500);
const h=await p.evaluate(()=>[...document.querySelectorAll('a.btn')].map(a=>a.textContent+'|'+a.getAttribute('href')));
ck(h.some(x=>/اردو ترجمہ/.test(x)&&/#\/s\/mujamsaghir\/n\/1$/.test(x)),'library hadith 10 links to Urdu hadith 1: '+h.join(' ; '));
await p.goto('http://localhost:8765/#/s/mujamsaghir/n/1');await p.waitForTimeout(2500);ck(/ابن عمر/.test(await p.evaluate(()=>document.body.innerText)),'Urdu book opens');
ck(!errs.length,'js errors '+errs[0]);console.log(bad?'FAIL':'PASS mujam_xlink');await b.close();process.exit(bad?1:0)})()
