// owner 27-11-2026: the Quran Encyclopedia (Urdu) also stands in the main hadith list, right after the translated sub-books of Al-Jami al-Kamil
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:412,height:900},serviceWorkers:'block'});const p=await c.newPage();
await p.addInitScript(()=>{localStorage.setItem('ui','ur');localStorage.setItem('nosplash','1')});
await p.goto('http://localhost:8765/#/hb');await p.reload();await p.waitForFunction(()=>document.querySelectorAll('a.hbrow[data-k]').length>5,{timeout:60000}).catch(()=>{});await p.waitForTimeout(3000);
const L=await p.evaluate(()=>[...document.querySelectorAll('a.hbrow[data-k]')].map(a=>a.dataset.k));
const i=L.indexOf('qenc');ck(i>0&&i<80,'qenc stands near the top of the hadith list, index '+i);
const sub=await p.evaluate(()=>{const b=window.HB_ROWS;return null});
ck(L.indexOf('bukhari')<i&&L.indexOf('muslim')<i,'after the famous translated books');
ck(L.indexOf('qenc')<L.indexOf('shamail'),'before the Companion/Seerah block');
await b.close();console.log(bad?'FAILED':'PASS qenc_in_hadith_list');process.exit(bad?1:0)})();
