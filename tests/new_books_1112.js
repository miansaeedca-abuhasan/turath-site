// the three books added on 12-11-2026 open, keep their names, and are in the offline list and the news
const {chromium}=require('playwright');const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:430,height:900}});
await pg.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
const want={sh654:'سنن ابی داود (طبع دہلی)',sh9810:'حاشیہ سندی علی سنن ابن ماجہ',sh791:'شرح سنن ابن ماجہ للسیوطی وغیرہ'};
const off=JSON.parse(fs.readFileSync('offline.json','utf8')).groups.map(g=>g.id),news=fs.readFileSync('news.json','utf8');
for(const [k,t] of Object.entries(want)){await pg.goto('http://localhost:8765/index.html#/s/'+k+'/n/6');await pg.waitForSelector('.card .mt.ar',{timeout:30000});
 ck((await pg.evaluate(()=>document.getElementById('t1').textContent))===t,'title '+k);ck(off.includes('c_'+k),'offline '+k);ck(news.includes('"keys":["'+k+'"]'),'news '+k);}
await br.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
