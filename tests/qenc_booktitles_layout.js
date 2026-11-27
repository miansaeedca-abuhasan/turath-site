// Owner 27-11-2026: banner heading fits its text; every book-title line of «مؤلف کی دیگر کتابوں کا تعارف» is one centred gold-bordered box (17 of them)
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();
for(const [nm,vp] of [['phone',{width:400,height:900}],['desk',{width:1200,height:900}]]){const p=await b.newPage({viewport:vp});
 await p.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});
 await p.goto('http://localhost:8765/index.html#/s/qenc/1');await p.waitForSelector('.qe-bk',{timeout:30000});await p.waitForTimeout(1500);
 const r=await p.evaluate(()=>{const bk=[...document.querySelectorAll('.qe-bk')].map(e=>{const a=e.getBoundingClientRect(),c=e.parentElement.getBoundingClientRect();return {off:Math.abs((a.left+a.right)/2-(c.left+c.right)/2),bd:getComputedStyle(e).borderTopWidth}});
  const t=[...document.querySelectorAll('.qe-front .qe-title')].map(e=>{const a=e.getBoundingClientRect(),c=e.parentElement.getBoundingClientRect();return a.width/c.width});return {n:bk.length,maxoff:Math.max(...bk.map(x=>x.off)),bd:bk.every(x=>parseFloat(x.bd)>=1),t}});
 ck(r.n===17,nm+': 17 book boxes, got '+r.n);ck(r.maxoff<6,nm+': boxes centred '+r.maxoff);ck(r.bd,nm+': bordered');
 if(nm==='desk')ck(r.t.some(x=>x<0.8),nm+': some banner is narrower than the box '+r.t.join(','));
 await p.close();}
await b.close();console.log(bad?'FAILED':'qenc booktitles OK');process.exit(bad?1:0)})();
