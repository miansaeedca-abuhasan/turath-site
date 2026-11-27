const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage();let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});
await p.goto('http://localhost:8765/index.html#/q/tafsir/ur_saadi/2');await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const c=document.querySelector('.card.tfpass');return c?{l:!!c.querySelector('.tfpl'),bd:getComputedStyle(c).borderTopWidth}:null});
if(!r)bad.push('no .tfpass card');else{if(!r.l)bad.push('no label');}
await p.goto('http://localhost:8765/index.html#/q/tafsir/ur_ibnkathir');await p.waitForTimeout(2500);
const n=await p.evaluate(()=>{const e=document.querySelector('a.srow2 .snum');return e?getComputedStyle(e).borderTopWidth:null});
if(!n||n==='0px')bad.push('surah number circle missing');
console.log(bad.length?'FAIL '+bad:'OK tafsir_passage_design');await b.close();process.exit(bad.length?1:0)})();
