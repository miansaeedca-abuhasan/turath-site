// Guard: narrator page = 4 tabs (bio, teachers, students, jarh wa ta'dil); one panel visible at a time; jarh cards carry the scholar name
const {chromium}=require('playwright');(async()=>{let bad=[];const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});
p.on('pageerror',e=>bad.push(e.message));await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/n/2');await p.waitForSelector('.ntab',{timeout:20000});await p.waitForTimeout(1500);await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(n=>n.remove()));
const n=await p.evaluate(()=>({tabs:document.querySelectorAll('.ntab').length,vis:[...document.querySelectorAll('.ntbody .npanel')].filter(x=>!x.hidden).length}));
if(n.tabs!==4)bad.push('tabs '+n.tabs);if(n.vis!==1)bad.push('visible panels '+n.vis);
await p.evaluate(()=>document.querySelectorAll('.sheetbg,.sheet,#ipop').forEach(x=>x.remove()));
await p.click('.ntab:nth-child(4)');await p.waitForTimeout(500);
const j=await p.evaluate(()=>({vis:[...document.querySelectorAll('.ntbody .npanel')].filter(x=>!x.hidden).length,cards:document.querySelectorAll('.ntbody .nj').length,who:document.querySelectorAll('.ntbody .nj .nwho').length}));
if(j.vis!==1||j.cards<1||j.who<1)bad.push('jarh tab '+JSON.stringify(j));
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
