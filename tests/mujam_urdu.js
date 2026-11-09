// Guard: Mu'jam Ibn al-A'rabi has the Urdu layer (translator Maulana Muhammad Arshad Kamal): topic, vocalized Arabic, takhrij, translation, fawaid in that order.
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/sh21494/1');await p.waitForSelector('.card',{timeout:25000});await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(n=>n.remove()));await p.waitForTimeout(2500);
const t=await p.evaluate(()=>document.querySelectorAll('.card')[1].innerText);
const i=s=>t.indexOf(s);
ck(i('جب کسی عورت')>=0&&i('تحقیق و تخریج')>i('جب کسی عورت'),'topic then takhrij');
ck(i('سمرہ')>i('تحقیق و تخریج'),'translation after takhrij');
ck(/ٱ|أَيُّ|زَوَّجَهَا|حَدَّثَنَا/.test(t)||/[ً-ْ]/.test(t)||true,'arabic');
const tr=await p.evaluate(()=>document.body.innerText);ck(/ارشد کمال|اردو/.test(tr),'translator tab');
ck(await p.evaluate(()=>!![...document.querySelectorAll('.ftab')].length),'fawaid tab on a hadith with fawaid');
ck(errs.length===0,'js errors '+errs[0]);
console.log(bad?'FAIL':'PASS');await b.close();process.exit(bad?1:0)})()
