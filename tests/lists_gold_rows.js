const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage();let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});
for(const h of ['#/hb/a/jami','#/sec/sahaba','#/sec/seerah']){
await p.goto('http://localhost:8765/index.html'+h);await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{const a=document.querySelector('a.jsubrow');return a?getComputedStyle(a).borderInlineStartWidth:null});
if(r!=='3px')bad.push(h+' gold row missing '+r);}
await p.goto('http://localhost:8765/index.html#/s/fazail/2');await p.waitForTimeout(2500);
const t=await p.evaluate(()=>{const a=document.querySelector('a.toc');return a?getComputedStyle(a).textDecorationLine:null});
if(t!=='none')bad.push('toc link underlined '+t);
console.log(bad.length?'FAIL '+bad:'OK lists_gold_rows');await b.close();process.exit(bad.length?1:0)})();
