// owner 27-11-2026: no «ماخذ: …» source notes under book pages / audio (credits live only in «شکر و ماخذ»)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)bad++};
const p=await b.newPage({viewport:{width:900,height:900}});
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});
for(const r of ['#/s/andulusur','#/s/muhaddithmadinaur','#/s/shamail','#/s/siyar']){
 await p.goto('http://localhost:8765/index.html'+r);await p.waitForTimeout(3500);
 const t=await p.evaluate(()=>document.body.innerText);
 ok(!/hadith-api|fawazahmed0|Open Hadith Data/.test(t)&&!/ماخذ:\s*(سیر|شذرات)/.test(t),r+' no source note');
}
await b.close();process.exit(bad?1:0)})();
