const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();
await pg.route('**/data/hl.js*',r=>r.abort());
await pg.goto('http://localhost:8765/index.html#/q');await pg.waitForTimeout(1500);
const r=await pg.evaluate(()=>['#uilang','#lang','#hsbtn','#bmbtn','#back'].map(i=>!!document.querySelector(i+' svg')));
console.log(r);if(r.includes(false)){console.log('FAIL');process.exit(1)}console.log('OK');await b.close()})();
