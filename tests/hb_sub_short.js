// Book list rows: long credit lines are not shown; the short translator part stays
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1190,height:800}});
await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/#/hb');await p.waitForTimeout(4000);
const sub=k=>p.evaluate(k=>{const e=document.querySelector('a[data-k='+k+'] .hbsub');return e?e.textContent:null},k);
ck(await sub('shaansahabaur')===null,'long credit line of Shan-e-Sahaba hidden');
ck((await sub('sahifahamamur')||'')==='ترجمہ: حافظ عبد اللہ شمیر','Sahifa Hamam: only the translator ('+await sub('sahifahamamur')+')');
ck((await sub('jamulfawaid')||'').startsWith('ترجمہ: مولانا محمد احمد ولد پیر')&&!(await sub('jamulfawaid')).includes('تخریج'),'Jamul Fowaid: only the translator');
const all=await p.evaluate(()=>[...document.querySelectorAll('.hbsub')].map(e=>e.textContent.length));
ck(all.length>0&&Math.max(...all)<=60,'no row sub line longer than 60 ('+Math.max(...all)+')');
console.log(bad?'FAIL':'PASS hb_sub_short');await b.close();process.exit(bad?1:0)})();
