// the book list never shows one work twice: translated edition vs plain Arabic book (Urdu interface: the Urdu one; Arabic interface: the Arabic one)
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const TW=[['mujamawsat','sh28171'],['mujamsaghir','sh13068'],['ibnkhuzaymahur','ibnkhuzaymah'],['musnadsarrajur','sarraj'],['humaydiur','humaydi']];
(async()=>{const b=await chromium.launch();
for(const ui of ['ur','ar','en','bn']){const p=await b.newPage({viewport:{width:412,height:900}});
await p.addInitScript(u=>{localStorage.ui=u;localStorage.newsDay=String(new Date().toDateString())},ui);
await p.goto('http://localhost:8765/#/hb');await p.waitForSelector('.hbrow',{timeout:90000});await p.waitForTimeout(2500);
const ks=await p.evaluate(()=>[...document.querySelectorAll('a.hbrow')].map(a=>a.dataset.k));
for(const [t,a] of TW){const n=(ks.includes(t)?1:0)+(ks.includes(a)?1:0);ck(n===1,ui+': '+t+'/'+a+' listed '+n+' times');
 if(ui==='ur')ck(ks.includes(t),'ur shows the Urdu '+t);if(ui==='ar')ck(ks.includes(a),'ar shows the Arabic '+a);}
await p.close()}
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
