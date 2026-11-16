// companion names: the four Rightly-Guided Caliphs and the other Ten (those with an exact entry) carry a small label; Abu Ubaydah ibn al-Jarrah included; the other Talha (not ibn Ubaydillah) carries none
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/js');await p.goto('http://localhost:8765/#/jr');await p.waitForTimeout(3500);
const r=await p.evaluate(()=>[...document.querySelectorAll('.jr a.it')].map(a=>[a.querySelector('.no').textContent,(a.querySelector('.tg')||{}).textContent||'',(a.querySelector('.nmx')||{}).textContent||'']));
const nmOf=l=>r.filter(x=>x[1]===l).map(x=>x[2].replace(/\s*\(.*$/,'').replace(/\s*رضی اللہ عنہ.*$/,'').trim()).sort().join('|');const k=nmOf('(خلیفہ راشد)'),t=nmOf('(عشرہ مبشرہ)');const want=a=>a.sort().join('|');
ck(k===want(['علی بن ابی طالب','عمر بن خطاب','عثمان بن عفان','ابو بکر صدیق']),'caliphs '+k);ck(t===want(['سعد بن ابی وقاص','زبیر بن عوام','عبدالرحمٰن بن عوف','سعید بن زید','طلحہ بن عبیداللہ','ابو عبیدہ بن جراح']),'ten '+t);ck(!r.some(x=>/طلحہ \(غیر/.test(x[2])&&x[1]),'other Talha must carry no label');
const u=await p.evaluate(()=>[...document.querySelectorAll('.jr a.it')].find(a=>/نامعلوم صحابہ/.test(a.querySelector('.nmx').textContent)).querySelector('.nmx').textContent);ck(u.includes('نامعلوم صحابہ رضی اللہ عنہم')&&!u.includes('صحابی'),'unknown companions: '+u);
const id10=r.find(x=>/علی بن ابی طالب/.test(x[2]))[0];await p.goto('http://localhost:8765/#/jr/'+id10);await p.waitForTimeout(2500);ck((await p.evaluate(()=>(document.querySelector('.jr .head .tg')||{}).textContent))==='(خلیفہ راشد)','detail label');
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
