// «تفاسیر» page must list Tafsir Noor al-Huda (Urdu group) linking to the book reader
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();let bad=[];
await p.goto('http://localhost:8765/#/q/tafsir');await p.waitForSelector('.srow2',{timeout:20000});
const r=await p.evaluate(()=>{const a=[...document.querySelectorAll('a.srow2')].find(x=>/نور الہدیٰ/.test(x.textContent));return a?{h:a.getAttribute('href'),t:a.textContent}:null});
if(!r)bad.push('missing');else if(r.h!=='#/s/tafsirnoor')bad.push('href '+r.h);
if(r){await p.click('a.srow2.tfbook');await p.waitForTimeout(2500);const t=await p.evaluate(()=>document.body.innerText);if(!/نور الہدیٰ|پارہ 1/.test(t))bad.push('book not opened');}
console.log(bad.length?'FAIL '+bad.join('|'):'PASS tafsir_hub_noor');await b.close();process.exit(bad.length?1:0)})();
