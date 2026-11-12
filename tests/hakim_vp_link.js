// «الحاكم (1/421)» in the study text of Jami 315 stays as written and opens Mustadrak hadith 1534 of the library (matched by the isnad)
const {chromium}=require('playwright');
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:430,height:900}});
await pg.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await pg.goto('http://localhost:8765/index.html#/h/315');await pg.waitForSelector('.card',{timeout:30000});await pg.waitForTimeout(3000);
const r=await pg.evaluate(async()=>{const p=document.createElement('p');document.body.append(p);p.append(...refRich('والحاكم (1/421) كلهم',315));const a=[...p.querySelectorAll('a')].find(x=>x.textContent==='1/421');if(!a)return 'nolink';a.click();await new Promise(r=>setTimeout(r,4000));const b=p.nextElementSibling;return b?b.textContent:'nobox'});
const ok=r.includes('1534')&&r.includes('أَبُو الْعَبَّاسِ مُحَمَّدُ بْنُ يَعْقُوبَ');console.log(ok?'OK':'FAIL '+r.slice(0,120));await br.close();process.exit(ok?0:1)})();
