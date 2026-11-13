// Guard: updates lines link to their book; «مترجم کتب» tile opens the Jami folder page (incl. Al-Adab al-Ali); Adab shows its translator name
const {chromium}=require('playwright');let bad=[];const fs=require('fs');
(async()=>{const N=JSON.parse(fs.readFileSync(__dirname+'/../news.json','utf8'));
 if(!/محمد صادق محی الدین/.test(N[0].i.ur[0])||!/اسلامی آداب و اخلاق/.test(N[0].i.ur[0]))bad.push('adab news line not full');
 if(!N[0].l||N[0].l[0]!=='#/s/adabaali')bad.push('adab news link');
 for(const n of N)if(n.l&&n.l.length!==n.i.ur.length)bad.push('links length '+n.id);
 const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});p.on('pageerror',e=>bad.push('pageerror '+e.message));
 await p.addInitScript(()=>{localStorage.ui='ur';localStorage.book='jamik';localStorage.newsDay=String(new Date().toDateString())});
 await p.goto('http://localhost:8765/updates.html');await p.waitForTimeout(2500);
 const a=await p.evaluate(()=>{const x=document.querySelector('article li a');return x&&x.getAttribute('href')});if(a!=='./#/s/adabaali')bad.push('updates page link '+a);
 await p.goto('http://localhost:8765/#/b');await p.waitForTimeout(5000);
 await p.evaluate(()=>{const t=[...document.querySelectorAll('a.tile')].find(x=>/مترجم کتب/.test(x.innerText));t&&t.click()});await p.waitForTimeout(4000);
 const r=await p.evaluate(()=>({h:location.hash,t:document.querySelector('#list').innerText}));
 if(r.h!=='#/hb/a/jami')bad.push('tile hash '+r.h);if(!/الادب العالی/.test(r.t)||!/صحیح سیرت مصطفی/.test(r.t))bad.push('folder content');
 await p.goto('http://localhost:8765/#/s/adabaali');await p.waitForTimeout(6000);
 const t2=await p.evaluate(()=>document.body.innerText);if(!/محمد صادق محی الدین/.test(t2))bad.push('translator name in Adab card');
 console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
