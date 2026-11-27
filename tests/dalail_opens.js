const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();let err=[];p.on('pageerror',e=>err.push(e.message));
await p.goto('http://localhost:8765/index.html#/s/dalailur/1');await p.waitForTimeout(4000);
const t=await p.evaluate(()=>document.body.innerText);const ok=/ولادت نبی کریم/.test(t)&&err.length===0;
console.log(ok?'PASS dalail_opens':'FAIL dalail_opens '+err.join('|')+t.slice(0,200));await b.close();process.exit(ok?0:1)})();
