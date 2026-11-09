// the home page has a Videos button that lists the project videos (external YouTube links, none invented)
const {chromium}=require('playwright');(async()=>{let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/');await p.waitForSelector('.vidbtn',{timeout:25000});await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(n=>n.remove()));
await p.click('.vidbtn');await p.waitForSelector('.sheet a[href*="youtu"]',{timeout:5000});
const l=await p.evaluate(()=>[...document.querySelectorAll('.sheet a')].map(a=>a.href+'|'+a.target));
ck(l.some(x=>x.startsWith('https://youtu.be/s2rYvrofrUo|_blank')),'intro video link '+l);
ck(l.every(x=>!/\?si=/.test(x)),'no tracking parameter');
await p.evaluate(()=>{VIDEOS.items.push({k:'seerah',t:{ur:'سیرت کی ویڈیو',en:'Seerah video'},u:'https://youtu.be/TESTID'});location.hash='#/s/seerah'});
await p.waitForSelector('.vidchip',{timeout:8000});ck(await p.evaluate(()=>document.querySelector('.vidchip').href==='https://youtu.be/TESTID'),'category page shows its video button');
await p.evaluate(()=>{location.hash='#/q'});await p.waitForTimeout(2500);ck(await p.evaluate(()=>!document.querySelector('.vidchip')),'no button where the category has no video');
ck(!errs.length,'errors '+errs);await b.close();console.log(bad?'FAIL':'PASS videos')})();
