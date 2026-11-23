// Khalq Af'al al-Ibad (Urdu): verses in chapter titles show in the Arabic font with Urdu-digit references; the closing words stand at the end of the list; the list row names only the translator
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/khalqafaalur?idx');await p.waitForSelector('a.srow2',{timeout:60000});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const kids=[...document.querySelectorAll('#list > *')];const idx=kids.findIndex(x=>/کتاب کا اختتام/.test(x.innerText));const last=[...document.querySelectorAll('a.srow2')].pop();
 const q=[...document.querySelectorAll('a.srow2 .qayah')];return {endIdx:idx,n:kids.length,lastSrow:kids.indexOf(last),q:q.length,ff:q[0]?getComputedStyle(q[0]).fontFamily:'',ref:[...document.querySelectorAll('a.srow2 .ct')].map(x=>x.innerText).join(' ').match(/\[[^\]]*\]/g)}});
ck(r.endIdx>r.lastSrow,'closing words after the last chapter '+JSON.stringify([r.endIdx,r.lastSrow]));
ck(r.q>=2,'verses in titles use the verse span '+r.q);ck(/arab|naskh|amiri|quran|scheherazade/i.test(r.ff),'verse font Arabic '+r.ff);
ck((r.ref||[]).length>=2&&r.ref.every(x=>/[۰-۹]/.test(x)&&!/[0-9]/.test(x)),'references with Urdu digits '+JSON.stringify(r.ref));
await p.goto('http://localhost:8765/#/hb');await p.waitForSelector('.hbrow',{timeout:60000});await p.waitForTimeout(2500);
const t=await p.evaluate(()=>['khalqafaalur','musnadshafiiur'].map(k=>(document.querySelector('.hbrow[data-k="'+k+'"] .hbsub')||{}).innerText||'?'));
ck(t.every(x=>/^ترجمہ: [^،؛]*$/.test(x.trim())&&!/نظر|تحقیق/.test(x)),'row shows the translator only '+JSON.stringify(t));
ck(!errs.length,'js errors '+errs[0]);await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
