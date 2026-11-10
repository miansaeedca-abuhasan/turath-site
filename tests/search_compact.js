// Guard: search page is compact (one slim bar + language tabs, filters folded), a number alone lists that hadith in every book, "a & b & c" still finds hadith.
const {chromium}=require('playwright');
(async()=>{const bad=[];const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:860}});
await p.addInitScript(()=>{try{localStorage.nosplash='1';localStorage.ui='ur'}catch(e){}});
await p.goto('http://localhost:8765/index.html#/search');await p.waitForTimeout(2000);
await p.evaluate(()=>document.querySelectorAll('button').forEach(b=>{if(['بند کریں','بعد میں'].includes(b.textContent.trim()))b.click()}));
const g=await p.evaluate(()=>{const f=document.querySelector('.gsflt');const pn=document.querySelector('.gspanel');return {fold:!!f&&!f.open,h:pn?pn.getBoundingClientRect().height:0,seg:document.querySelectorAll('.gsflt .seg').length}});
if(!g.fold)bad.push('filters not folded');if(g.h>230)bad.push('panel too tall '+g.h);if(g.seg<2)bad.push('mode/grade missing');
await p.fill('#gsq','540');await p.keyboard.press('Enter');await p.waitForTimeout(1500);
const n=await p.evaluate(()=>document.querySelectorAll('.gsnum a').length);if(n<8)bad.push('number search rows '+n);
await p.fill('#gsq','نماز & عمر & رونا');await p.keyboard.press('Enter');await p.waitForTimeout(7000);
const r=await p.evaluate(()=>document.querySelectorAll('#list .card').length);if(r<2)bad.push('& search no results');
await p.fill('#gsq','انبیاء پر آزمائش');await p.keyboard.press('Enter');await p.waitForTimeout(9000);
const am=await p.evaluate(()=>[...document.querySelectorAll('#list mark.qhit')].filter(m=>(m.closest('[lang]')||{}).lang==='ar').length);if(am)bad.push('Urdu search colours Arabic words: '+am);
await b.close();console.log(bad.length?'FAIL '+bad.join('; '):'PASS');process.exit(bad.length?1:0)})();
