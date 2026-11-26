// copy / share limit: 10 pages (30,000 characters) per device per day (owner 26-11-2026)
const {chromium}=require('playwright');(async()=>{const bad=[];const b=await chromium.launch();const p=await b.newPage();
await p.addInitScript(()=>{try{localStorage.nosplash='1';localStorage.ui='ur'}catch(e){}});
await p.goto('http://localhost:8765/index.html#/');await p.waitForTimeout(2500);
const r=await p.evaluate(async()=>{const o={};o.a=window.cqOk(20000);o.b=window.cqOk(9000);o.c=window.cqOk(5000);o.d=window.cqOk(500);o.keys=Object.keys(localStorage).filter(k=>/^cq:/.test(k)).length;return o});
if(!(r.a&&r.b&&!r.c&&r.d))bad.push('quota logic '+JSON.stringify(r));if(r.keys!==1)bad.push('one day key');
await p.waitForTimeout(300);const t=await p.evaluate(()=>document.getElementById('toast').textContent);if(!/10 صفحات/.test(t))bad.push('message '+t);
await b.close();console.log(bad.length?'FAIL '+bad.join('; '):'PASS copy_quota');process.exit(bad.length?1:0)})();
