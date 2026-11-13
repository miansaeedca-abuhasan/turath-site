const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:780}});let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString());localStorage.look=JSON.stringify({color:'maroon',mode:'light',urdu:'jameel'})});
await p.goto('http://localhost:8765/#/s/seerah/n/5');await p.waitForSelector('.card .tk.ar,.card .agrade',{timeout:40000});
let r=await p.evaluate(()=>({c:document.documentElement.dataset.color,acc:getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),bd:getComputedStyle(document.querySelector('.card .tk.ar,.card .agrade')).borderInlineStartColor}));
if(r.c!=='maroon')bad.push('theme not applied outside quran '+JSON.stringify(r));
if(r.bd!=='rgb(47, 127, 192)')bad.push('takhrij box colour follows theme '+r.bd);
await p.goto('http://localhost:8765/#/q');await p.waitForTimeout(1500);
r=await p.evaluate(()=>document.documentElement.dataset.color);if(r!=='blue')bad.push('quran takes theme: '+r);
console.log(bad.length?'FAIL '+bad.join('|'):'PASS theme_independent');await b.close()})();
