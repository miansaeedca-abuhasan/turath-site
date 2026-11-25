// owner 24-11-2026: the transparent «prepare for the prayer» message shows again from the adhan time (no button; always on)
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad=1;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch(),c=await b.newContext({viewport:{width:1400,height:900},timezoneId:'America/Toronto'}),p=await c.newPage();
await p.addInitScript(()=>{try{localStorage.newsSeen='20261122a';localStorage.newsDay=new Date().toDateString();localStorage.ui='ur';localStorage.lang='ur';localStorage.salatCity='toronto'}catch(e){}});
await p.clock.install({time:new Date('2026-11-24T17:16:00Z')});
await p.goto('http://localhost:8765/index.html');await p.waitForSelector('#sltmsg',{state:'attached',timeout:20000});
await p.clock.runFor(3000);
const r=await p.evaluate(()=>{const e=document.querySelector('#sltmsg');return{on:e.classList.contains('on'),t:e.textContent}});
ck(r.on&&/نماز کی تیاری/.test(r.t),'message shown after the adhan: '+JSON.stringify(r));
console.log(bad?'FAIL':'PASS prayer_message');await b.close();process.exit(bad)})();
