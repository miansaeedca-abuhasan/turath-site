// an old registry that does not know a new book: opening the book fetches a fresh registry once instead of «not found»
const {chromium}=require('playwright');const fs=require('fs');let bad=0;
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();
let s=fs.readFileSync(__dirname+'/../coll/index.js','utf8');const A=JSON.parse(s.slice(s.indexOf('COLLS(')+6,s.lastIndexOf(')')));
const old='COLLS('+JSON.stringify(A.filter(e=>e.key!=='musnadishaq'))+')';
await p.route('**/coll/index.js',r=>r.fulfill({contentType:'application/javascript',body:old}));
await p.route('**/coll/lite.js*',r=>r.continue());
await p.route('**/coll/index.js?r=*',r=>r.fulfill({contentType:'application/javascript',body:s}));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/musnadishaq/n/5');await p.waitForTimeout(5000);
const t=await p.evaluate(()=>document.body.innerText);
if(!/مسند اسحاق بن راہویہ/.test(t)||/یہ حدیث نہیں ملی|نہیں ملی/.test(t.slice(0,80))){bad++;console.log('FAIL not opened',JSON.stringify(t.slice(0,80)))}
await b.close();if(bad)process.exit(1);console.log('PASS unknown_book_refetches_registry')})();
