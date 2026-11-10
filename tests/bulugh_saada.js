// Guard: «سعادتوں کا سفر» (Bulugh as-Sa'adah): Arabic, takhrij, Urdu translation, fawaid; hadith 685 uses the corrected translation.
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/bulughsaada/n/1');await p.waitForSelector('.card',{timeout:25000});await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(n=>n.remove()));await p.waitForTimeout(2500);
const t=await p.evaluate(()=>document.body.innerText);
ck(/مَوْلُودٍ/.test(t),'arabic of hadith 1');ck(t.indexOf('تحقیق و تخریج')>t.indexOf('مَوْلُودٍ'),'takhrij after arabic');ck(/ابو ہریرہ/.test(t),'urdu translation');ck(/۱۳۵۹/.test(t),'takhrij in Urdu digits');
const d=await p.evaluate(async()=>{const x=await fetch('coll/index.js').then(r=>r.text());const i=x.indexOf('"key":"bulughsaada"');return i>0&&/"count":1189/.test(x.slice(i,i+400000))});ck(d,'registered with 1189 hadith');
ck(errs.length===0,'js errors '+errs[0]);
await p.goto('http://localhost:8765/#/s/bulughsaada/n/685');await p.waitForTimeout(3000);
const t2=await p.evaluate(()=>document.body.innerText);ck(/ام انس/.test(t2)&&/اللَّهُمَّ أَكْثِرْ مَالَهُ/.test(t2),'hadith 685 text');
console.log(bad?'FAIL':'PASS');await b.close();process.exit(bad?1:0)})()
