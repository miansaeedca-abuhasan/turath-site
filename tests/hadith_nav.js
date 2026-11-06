// Guard: a hadith page ends with two big previous/next buttons showing the hadith numbers; the chapter header is a boxed block
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:1000,height:800}});let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/#/h/100');await p.waitForSelector('.hnav',{timeout:15000});
const r=await p.evaluate(()=>[...document.querySelectorAll('.hnav .hnb:not(.off)')].map(a=>a.getAttribute('href')));
if(r.join()!=='#/h/99,#/h/101')bad.push('nav links '+r.join());
await p.goto('http://localhost:8765/#/c/1/0');await p.waitForSelector('.chead',{timeout:15000});
const bw=await p.evaluate(()=>getComputedStyle(document.querySelector('.chead')).borderTopWidth);
if(parseFloat(bw)<1)bad.push('chapter header not boxed');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
