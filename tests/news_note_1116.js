// the important note about the corrected hadith total: in every language, in the updates list, and shown on the home page until 19-11-2026
const fs=require('fs');const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const n=JSON.parse(fs.readFileSync('news.json','utf8')).find(x=>x.id==='20261116n');
ck(n&&n.note&&n.until==='2026-11-19','note entry');
for(const l of ['ur','ar','en','bn','hi','gu','fr','ne']){ck(n.t[l]&&n.i[l]&&n.i[l].length===4,'lang '+l);ck(/762[,٬ ]?878|٧٦٢٨٧٨|۷۶۲۸۷۸|७६२,८७८|৭৬২,৮৭৮/.test(n.i[l][1]),'number in '+l)}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/');await p.waitForTimeout(3000);await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(e=>e.remove()));
const t=await p.evaluate(()=>(document.querySelector('.notebar')||{}).innerText||'');
const now=new Date()<=new Date('2026-11-19T23:59:59');ck(now?t.includes('۷۶۲۸۷۸'):!t,'home note while valid '+t.slice(0,40));
if(now){await p.click('.nbx');await p.waitForTimeout(300);ck(!(await p.$('.notebar')),'can be closed for the day')}
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
