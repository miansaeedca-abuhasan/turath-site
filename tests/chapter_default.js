const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:800}});await p.addInitScript(()=>{localStorage.ui='ur'});
let bad=[];
await p.goto('http://localhost:8765/#/h/10770');await p.waitForTimeout(7000);
await p.evaluate(()=>{document.querySelectorAll('.sheetbg,.sheet,#ipop').forEach(x=>x.remove());document.body.classList.remove('sheetopen')});
await p.waitForSelector('.chead',{timeout:15000});
const h=await p.evaluate(()=>location.hash);if(!/^#\/c\/\d+\/\d+/.test(h))bad.push('not chapter '+h);
await p.waitForSelector('[data-n="10770"]',{timeout:15000});await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const t=document.querySelector('[data-n="10770"]').getBoundingClientRect();return {top:Math.round(t.top),h:innerHeight}});
if(r.top<-5||r.top>r.h*0.5)bad.push('target not in view '+JSON.stringify(r));
// explicit single page still works
await p.goto('http://localhost:8765/#/h/10770?one');await p.waitForSelector('.hpill',{timeout:15000});
const h2=await p.evaluate(()=>location.hash);if(/#\/c\//.test(h2))bad.push('one redirected');
// search-like plain link from single page strip stays single
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS '+h+' '+JSON.stringify(r));await b.close();process.exit(bad.length?1:0)})();
