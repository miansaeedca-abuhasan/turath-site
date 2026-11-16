// guard: the total under the hadith books counts narrations only (not rijal, tafsir, fiqh, sharh books): well below the old 1.6 million
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});
await p.addInitScript(()=>{localStorage.ui='en';localStorage.newsDay=new Date().toDateString()});
await p.goto('http://localhost:8765/#/hb');await p.waitForSelector('.totcard',{timeout:20000});await p.waitForTimeout(1500);
const t=await p.evaluate(()=>document.querySelector('.totcard').innerText);
const n=+(t.match(/Total[^\d]*([\d,]+)/)||[])[1].replace(/,/g,'');
let bad=0;if(!(n>700000&&n<780000)){console.log('FAIL total',t);bad++;}
console.log(bad?'FAILED':'ok '+n);await b.close();process.exit(bad?1:0)})()
