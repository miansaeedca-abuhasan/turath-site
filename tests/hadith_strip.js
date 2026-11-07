// Guard: a hadith page opens at the top, has a "one hadith | whole chapter" switch, and a strip of at least 5 numbers of the same chapter (tap = open that hadith)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:1000,height:800}});let bad=[];
p.on('pageerror',e=>bad.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/#/c/1/0');await p.waitForSelector('article.card',{timeout:15000});
await p.evaluate(()=>{document.querySelectorAll('.sheetbg,#ipop').forEach(x=>x.remove());window.scrollTo(0,99999)});
await p.evaluate(()=>{location.hash='#/h/1310'});await p.waitForSelector('.hsxn',{timeout:15000});await p.waitForTimeout(800);
const r=await p.evaluate(()=>({y:scrollY,n:document.querySelectorAll('.hsxn .hsxb').length,links:document.querySelectorAll('.hsxn a.hsxb').length,mode:[...document.querySelectorAll('.hmode>*')].map(x=>x.textContent)}));
if(r.y>5)bad.push('page not at top: '+r.y);if(r.n<5)bad.push('numbers '+r.n);if(r.mode.length!==2)bad.push('mode switch '+r.mode.length);
const h=await p.evaluate(()=>document.querySelector('.hsxn a.hsxb').getAttribute('href'));await p.click('.hsxn a.hsxb');await p.waitForTimeout(1200);
if(await p.evaluate(()=>location.hash)!==h)bad.push('number did not open '+h);
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS '+JSON.stringify(r));await b.close();process.exit(bad.length?1:0)})();
