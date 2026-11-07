// Guard: a hadith page ends with a slim floating pill (prev / position / next); the chapter header is a plain block with a thin line
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:1000,height:800}});let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/#/h/100?one');await p.waitForSelector('.hpill',{timeout:15000});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>({n:document.querySelectorAll('.hpill button').length,t:document.querySelector('.hpm').textContent,pos:getComputedStyle(document.querySelector('.hpill')).position}));
if(r.n!==3||r.pos!=='fixed')bad.push('pill '+JSON.stringify(r));if(!/\d+ \/ \d+|^\d+$/.test(r.t))bad.push('pill label '+r.t);
await p.goto('http://localhost:8765/#/c/1/0');await p.waitForSelector('.chead',{timeout:15000});
const bw=await p.evaluate(()=>getComputedStyle(document.querySelector('.chead')).borderTopWidth);
const cs=await p.evaluate(()=>getComputedStyle(document.querySelector('.chead')).borderInlineStartWidth);if(parseFloat(cs)>1)bad.push('chapter header has a heavy side stripe');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
