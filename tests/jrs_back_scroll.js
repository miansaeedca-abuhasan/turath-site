// guards: every narrator of «أسماء صحابة رواۃ الجامع الکامل» has hadith; back from an entry returns to the same place of the list; the hadith pill is English digits and hidden while a window is open
const {chromium}=require('playwright');const fs=require('fs');
const s=fs.readFileSync(__dirname+'/../data/jrs.js','utf8');const d=JSON.parse(s.slice(s.indexOf('(')+1,s.lastIndexOf(')')));let bad=0;
const z=d.n.filter(x=>!x.c||!x.h.length);if(z.length){console.log('FAIL zero-hadith narrators',z.map(x=>x.i));bad++;}
(async()=>{const b=await chromium.launch();
for(const r of ['#/jr','#/js']){const p=await b.newPage({viewport:{width:390,height:844}});
 await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=new Date().toDateString()});
 await p.goto('http://localhost:8765/'+r);await p.waitForSelector('a.it',{timeout:15000});await p.waitForTimeout(800);
 await p.evaluate(()=>window.scrollTo(0,2500));await p.waitForTimeout(400);
 await p.evaluate(()=>{const a=[...document.querySelectorAll('a.it')].find(x=>x.getBoundingClientRect().top>100);a.click()});await p.waitForTimeout(1500);
 await p.goBack();await p.waitForTimeout(2500);const y=await p.evaluate(()=>scrollY);
 if(Math.abs(y-2500)>40){console.log('FAIL back scroll',r,y);bad++;}await p.close();}
{const p=await b.newPage({viewport:{width:390,height:844}});await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=new Date().toDateString()});
 await p.goto('http://localhost:8765/#/s/bukhari/n/50');await p.waitForTimeout(2500);
 const t=await p.evaluate(()=>(document.querySelector('.hpill .hpn')||{}).textContent||'');
 if(!/^[0-9\/ ]+$/.test(t.replace(/\s/g,''))){console.log('FAIL pill digits',t);bad++;}
 const dsp=await p.evaluate(()=>{document.documentElement.classList.add('sheetopen');return getComputedStyle(document.querySelector('.hpill')).display});
 if(dsp!=='none'){console.log('FAIL pill visible under window');bad++;}await p.close();}
console.log(bad?'FAILED':'OK');await b.close();process.exit(bad?1:0)})();
