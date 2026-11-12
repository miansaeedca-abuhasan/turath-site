const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:760}});await p.addInitScript(()=>{localStorage.ui='ur';localStorage.book='jamik';localStorage.newsDay=new Date().toDateString()});
await p.goto('http://localhost:8765/index.html#/b');await p.waitForSelector('.tiles',{timeout:20000});
await p.evaluate(()=>{const x=document.querySelector('#ipop');if(x)x.remove()});
await p.click('text=مترجم کتب');await p.waitForTimeout(500);
const t=await p.evaluate(()=>[...document.querySelectorAll('.sheetbg a.srow')].map(a=>a.getAttribute('href')));
console.log(t);if(!(t.includes('#/s/seerah')&&t.includes('#/s/fazail')&&t.includes('#/s/fitan')))throw 'FAIL';console.log('PASS');await b.close()})()
