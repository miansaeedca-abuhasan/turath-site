// Guard: the register (Tahdhib al-Kamil) is ordered by generations, Companions first, numbered in that order
const {chromium}=require('playwright');
(async()=>{let bad=[];const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});
p.on('pageerror',e=>bad.push('pageerror '+e.message));await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/#/s/rijal/all');await p.waitForTimeout(7000);
const r=await p.evaluate(()=>({h:[...document.querySelectorAll('#list h3.rjtab')].map(x=>x.innerText),nums:[...document.querySelectorAll('#list a.rjcd .snum')].slice(0,5).map(x=>x.innerText),rk:[...document.querySelectorAll('#list a.rjcd')].slice(0,40).map(a=>a.innerText).join('|')}));
if(!r.h.length||!/صحاب/.test(r.h[0]))bad.push('first header '+JSON.stringify(r.h));
if(r.nums.join(',')!=='١,٢,٣,٤,٥')bad.push('numbers '+r.nums);
if(!/صحاب/.test(r.rk))bad.push('first rows not companions');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
