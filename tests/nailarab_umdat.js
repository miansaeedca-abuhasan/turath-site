// Guard: «نیل الارب» and «عمدۃ الاحکام» are registered, show Arabic, takhrij and their tabs.
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
const reg=await (await fetch('http://localhost:8765/coll/index.js')).text();
ck(/"key":"nailarab"[^]*?"count":48/.test(reg),'nailarab 48');ck(/"key":"umdatulahkam"[^]*?"count":422/.test(reg),'umdat 422');
await p.goto('http://localhost:8765/#/s/umdatulahkam/n/1');await p.waitForSelector('.card',{timeout:25000});await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(n=>n.remove()));await p.waitForTimeout(2500);
let t=await p.evaluate(()=>document.body.innerText);
ck(/الْأَعْمَالُ بِالنِّيَّاتِ/.test(t),'umdat arabic');ck(/صحیح بخاری/.test(t)&&/۱/.test(t),'umdat takhrij');ck(!/عليہ|اللہ عنہ/.test(t.split('تحقیق')[0]),'no Urdu letters in Arabic');
ck(/الفاظ کے معانی|راوی کا تعارف/.test(t),'umdat tabs');
await p.goto('http://localhost:8765/#/s/nailarab/n/1');await p.waitForTimeout(3000);
t=await p.evaluate(()=>document.body.innerText);ck(/صحیح بخاری/.test(t),'nail takhrij');ck(/[؀-ۿ]{5,}/.test(t),'nail text');
ck(errs.length===0,'js errors '+errs[0]);
console.log(bad?'FAIL':'PASS');await b.close();process.exit(bad?1:0)})()
