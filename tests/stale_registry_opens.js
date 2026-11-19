const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['Pixel 5'],serviceWorkers:'block'});const p=await c.newPage();
const old=fs.readFileSync(__dirname+'/fixtures/old_index_stale.js');
await p.route(/\/coll\/index\.js(\?v=.*)?$/,r=>r.fulfill({status:200,contentType:'application/javascript',body:old}));
await p.goto('http://localhost:8765/#/s/tafsirnoor');
await p.waitForFunction(()=>/اس سورت کو فاتحہ/.test(document.body.innerText),{timeout:30000}).then(()=>console.log('PASS stale_registry_opens'),()=>{console.log('FAIL stale_registry_opens');process.exitCode=1});
await b.close()})();
