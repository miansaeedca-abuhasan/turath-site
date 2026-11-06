const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),p=await b.newPage();await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/#/quiz/k/seerah');await p.waitForSelector('.qzlname',{timeout:8000});
const r=await p.$$eval('.qzlname',a=>a.map(x=>({t:x.textContent,h:x.querySelector('.qzhon')?getComputedStyle(x.querySelector('.qzhon')).fontSize:null,f:getComputedStyle(x).fontSize})));
let bad=[];if(r.length!==15)bad.push('count '+r.length);
r.forEach(x=>{if(!/\(.+\)/.test(x.t))bad.push('no bracket '+x.t);if(!x.h||parseFloat(x.h)>=parseFloat(x.f))bad.push('hon not smaller '+x.t)});
if(!r[0].t.includes('رضی اللہ عنہ'))bad.push('first '+r[0].t);
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS '+r[0].t+' / '+r[10].t);await b.close();process.exit(bad.length?1:0)})();
