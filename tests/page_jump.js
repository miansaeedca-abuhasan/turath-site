// «الجزء والصفحة» tab next to the book search (owner 25-11-2026): boxes show the LAST volume / page dim, nothing above is accepted, jump opens the row
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:400,height:800}});
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/sh9767/n/300');await p.waitForSelector('.pgno',{timeout:30000});
await p.evaluate(()=>window.COLL.bookSearch('sh9767'));await p.waitForSelector('.pgtabs',{timeout:20000});
ck((await p.$$eval('.pgtabs button',x=>x.length))===2,'two tabs');
await p.click('.pgtabs button:nth-child(2)');await p.waitForFunction(()=>document.querySelector('.pgin')&&document.querySelector('.pgin').placeholder,{timeout:30000});
const ph=await p.$$eval('.pgin',x=>x.map(i=>i.placeholder));ck(ph.length===2&&/^[٠-٩]+$/.test(ph[0])&&/^[٠-٩]+$/.test(ph[1]),'placeholders Arabic-Indic '+ph);
const maxJ=+ph[0].replace(/[٠-٩]/g,c=>c.charCodeAt(0)-0x660);ck(maxJ>=2,'multi-volume last juz '+maxJ);
const j=p.locator('.pgin').nth(0),pg=p.locator('.pgin').nth(1);
await j.fill('٩٩٩');ck((await j.inputValue())==='','juz above the last is refused');
await pg.fill('9999999');ck((await pg.inputValue())==='','page above the last is refused');
await j.fill('1');await pg.fill('229');ck(await p.$eval('.pgjump button',e=>!e.disabled),'go enabled');
await p.click('.pgjump button');await p.waitForSelector('.bsres .pgno,.sheet .pgno',{timeout:20000});
const t=await p.$$eval('.pgjump ~ * .pgno, .pgno',e=>e.map(x=>x.innerText.replace(/\s+/g,' ')));ck(t.some(x=>/الصفحة ٢٢٩/.test(x)),'jump shows page 229: '+t.join('|'));
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
