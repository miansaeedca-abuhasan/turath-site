// Guard: in the poster sheet Share / Save sit right under the picture, before the size options (not at the very end).
const {chromium}=require('playwright');
(async()=>{const bad=[];const b=await chromium.launch();const p=await b.newPage({viewport:{width:420,height:900}});
await p.addInitScript(()=>{try{localStorage.nosplash='1'}catch(e){}});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(1500);
await p.evaluate(()=>POSTER.open({kind:'hadith',ar:'إنما الأعمال بالنيات',tr:{ur:'اعمال کا دارومدار نیتوں پر ہے'},lang:'ur',grade:'صحیح',ref:'صحیح بخاری (1)',name:'t'}));
await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const g=document.querySelector('.pst-go'),l=[...document.querySelectorAll('.pst-l')][0];if(!g||!l)return null;const a=g.getBoundingClientRect(),c=l.getBoundingClientRect();return {above:a.bottom<=c.top+1,n:g.querySelectorAll('button').length,h:a.height,cnt:document.querySelectorAll('.pst-go').length}});
if(!r)bad.push('missing');else{if(!r.above)bad.push('buttons not above size options');if(r.n!==2||r.cnt!==1)bad.push('button count');if(r.h>48)bad.push('too tall '+r.h)}
await b.close();console.log(bad.length?'FAIL '+bad.join('; '):'PASS');process.exit(bad.length?1:0)})();
