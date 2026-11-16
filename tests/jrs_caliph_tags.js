// companion names: the four Rightly-Guided Caliphs and the other Ten (those with an exact entry) carry a small label; unclear entries (Abu Ubayda, Talha) carry none
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/js');await p.goto('http://localhost:8765/#/jr');await p.waitForTimeout(3500);
const r=await p.evaluate(()=>[...document.querySelectorAll('.jr a.it')].map(a=>[a.querySelector('.no').textContent,(a.querySelector('.tg')||{}).textContent||'']));
const k=r.filter(x=>x[1]==='(خلیفہ راشد)').map(x=>x[0]).join(),t=r.filter(x=>x[1]==='(عشرہ مبشرہ)').map(x=>x[0]).join();
ck(k==='10,14,59,73','caliphs '+k+' of '+r.length);ck(t==='17,81,82,86,113','ten '+t);
const u=await p.evaluate(()=>[...document.querySelectorAll('.jr a.it')].find(a=>a.querySelector('.no').textContent==='21').querySelector('.nmx').textContent);ck(u.includes('نامعلوم صحابہ رضی اللہ عنہم')&&!u.includes('صحابی'),'unknown companions: '+u);
await p.goto('http://localhost:8765/#/jr/10');await p.waitForTimeout(2500);ck((await p.evaluate(()=>(document.querySelector('.jr .head .tg')||{}).textContent))==='(خلیفہ راشد)','detail label');
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
