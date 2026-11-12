// the small second line of the header in the Urdu UI (e.g. «صحیح بخاری») is not clipped: tall line box
const {chromium}=require('playwright');
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:430,height:900}});
await pg.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await pg.goto('http://localhost:8765/index.html#/s/bukhari/c/1');await pg.waitForTimeout(3000);
const r=await pg.evaluate(()=>{const e=document.getElementById('t2'),cs=getComputedStyle(e);return {lh:parseFloat(cs.lineHeight)/parseFloat(cs.fontSize),h:e.getBoundingClientRect().height,fs:parseFloat(cs.fontSize),t:e.textContent}});
const ok=r.t.includes('بخاری')&&r.lh>=2&&r.h>=r.fs*1.9;console.log(ok?'OK':'FAIL '+JSON.stringify(r));await br.close();process.exit(ok?0:1)})();
