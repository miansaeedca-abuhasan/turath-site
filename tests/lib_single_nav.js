// guard: a single library hadith has the bottom prev/next pill and a row of neighbouring numbers (website mode)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});let bad=0;
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=new Date().toDateString()});
await p.goto('http://localhost:8765/#/s/bukhari/n/50');await p.waitForTimeout(3000);
const r=await p.evaluate(()=>({pill:document.querySelectorAll('.hpill').length,nums:document.querySelectorAll('.hpg a').length}));
if(r.pill!==1||r.nums<4){console.log('FAIL',r);bad++;}
await p.evaluate(()=>document.querySelector('.hpill button[aria-label=next]').click());await p.waitForTimeout(1200);
if(!/n\/51/.test(await p.evaluate(()=>location.hash))){console.log('FAIL next');bad++;}
console.log(bad?'FAILED':'OK');await b.close();process.exit(bad?1:0)})();
