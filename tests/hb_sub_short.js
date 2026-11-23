// owner 23-11-2026 (twice): book list shows under the name only تالیف / ترجمہ; never takhrij/tahqiq/nazar-e-sani/taqriz/ishraf; content-kind lines (عربی متن، …) stay as they were (owner: «آپ نے سب کچھ ہٹا دیا؟»)
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad=1;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:420,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.newsSeen='20261122a';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur'}catch(e){}});
await p.goto('http://localhost:8765/index.html#/hb');await p.waitForTimeout(5000);
const sub=k=>p.evaluate(k=>{const e=document.querySelector('a[data-k='+k+'] .hbsub');return e?e.textContent:null},k);
const s47=await sub('shaansahabaur'),s48=await sub('sahifahamamur'),sj=await sub('jamulfawaid');
ck(s47&&s47.startsWith('تالیف: ابو حمزہ عبد الخالق صدیقی')&&!/تخریج|اشراف|رحمانی/.test(s47),'Shan-e-Sahaba: only author ('+s47+')');
ck(s48&&s48.includes('ترجمہ: حافظ عبد اللہ شمیر')&&s48.startsWith('عربی متن')&&!/تخریج\s*[:：]|حامد/.test(s48),'Sahifa Hamam: only translator ('+s48+')');
ck(sj&&sj.startsWith('ترجمہ: مولانا محمد احمد ولد پیر')&&!sj.includes('تخریج')&&!sj.includes('گوندلوی'),'Jamul: translator');
const txt=await p.evaluate(()=>[...document.querySelectorAll('.hbsub')].map(e=>e.textContent));
const off=txt.filter(x=>/(تخریج|تحقیق|نظر ثانی|تقریظ|زیر اشراف|اشراف|اضافہ)\s*[:：]/.test(x));ck(txt.length>0&&!off.length,'offenders: '+off.join(' || '));
console.log(bad?'FAIL':'PASS hb_sub_short');await b.close();process.exit(bad)})();
