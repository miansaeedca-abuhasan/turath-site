// the new commentaries (Hashiyat as-Sindi, Sharh Sunan Ibn Majah of al-Suyuti and others) show under Ibn Majah hadith, and under a Jami hadith that cites it
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:430,height:900}});
await pg.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await pg.goto('http://localhost:8765/index.html#/s/ibnmajah/n/4');await pg.waitForSelector('.card',{timeout:30000});await pg.waitForSelector('details.shbox',{timeout:20000});
await pg.evaluate(()=>document.querySelector('details.shbox').open=true);await pg.waitForTimeout(3500);
const r=await pg.evaluate(()=>[...document.querySelectorAll('.shbox .shname')].map(a=>a.textContent+'|'+a.getAttribute('href')));
ck(r.some(x=>x.includes('sh9810')),'Sindi under Ibn Majah 4: '+r);ck(r.some(x=>x.includes('sh791')),'Suyuti sharh under Ibn Majah 4: '+r);
const tx=await pg.evaluate(()=>document.querySelector('.shbox .shtx')?.textContent||'');ck(tx.replace(/[ً-ْ]/g,'').includes('يعده')||tx.length>50,'text shown');
await pg.goto('http://localhost:8765/index.html#/h/54');await pg.waitForSelector('.card',{timeout:30000});await pg.waitForTimeout(3000);
const j=await pg.evaluate(async()=>{const b=await COLL_SH.forRefs([{key:'ibnmajah',number:61}]);if(!b)return [];b.open=true;await new Promise(r=>setTimeout(r,4000));return [...b.querySelectorAll('.shname')].map(a=>a.getAttribute('href'))});
ck(j.some(x=>/sh9810|sh791/.test(x)),'under a Jami hadith citing Ibn Majah 61: '+j);
await br.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
