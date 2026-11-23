// «شکر و ماخذ»: all Ansar al-Sunnah books listed in 2 aligned columns; Dar Ibn Bashir books show the publisher line
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});
await p.goto('http://localhost:8765/thanks.html');
const r=await p.evaluate(()=>[...document.querySelectorAll('ol.bk')].map(o=>{const l=[...o.children];const xs=l.map(x=>Math.round(x.getBoundingClientRect().left));const u=[...new Set(xs)];return {n:l.length,cols:u.length}}));
ck(r.length===3,'3 lists');r.forEach(x=>{ck(x.n===20,'20 books '+x.n);ck(x.cols===2,'2 aligned columns '+x.cols)});
const ur=await p.evaluate(()=>[...document.querySelector('section.ur ol.bk').children].map(x=>x.textContent));
ck(ur.every(x=>/ \(اردو\)$/.test(x)&&!/ترجمہ/.test(x)&&!/[يكة]/.test(x)),'urdu list: (اردو) once, no Arabic letters '+ur.filter(x=>!/ \(اردو\)$/.test(x)||/[يكة]/.test(x)));
ck(!ur.some(x=>/اطراف/.test(x)),'no fahras');
ck(!/[يكة]/.test(await p.evaluate(()=>document.querySelector('section.ur').innerText.replace(/[^ -ۿ]/g,'').replace(/\u0627\u0644\u062f\u0631\u0631/g,''))),'no Arabic letters in Urdu sections');
const idx=await p.evaluate(async()=>{const x=await fetch('coll/index.js').then(r=>r.text());return JSON.parse(x.slice(x.indexOf('COLLS(')+6,x.lastIndexOf(')'))).filter(e=>e.pub&&/ابن بشیر/.test(e.pub.ur)).map(e=>e.pub.ur+'|'+e.pub.only)});
ck(idx.length>=6&&idx.every(v=>v==='دار ابن بشیر للبحث والتحقیق|undefined'),'dar ibn bashir pub '+idx);
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
