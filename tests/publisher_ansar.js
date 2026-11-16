// Ansar as-Sunnah Publications is named in the book list for its books, and at the end of Mu'jam al-Awsat's publisher's note
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/hb');await p.waitForSelector('.hbrow',{timeout:90000});await p.waitForTimeout(2500);
await p.evaluate(()=>{const i=[...document.querySelectorAll('input')].find(x=>x.offsetParent);i.value='معجم اوسط';i.dispatchEvent(new Event('input',{bubbles:true}))});await p.waitForTimeout(1200);
const t=await p.evaluate(()=>document.querySelector('.hbrow[data-k="mujamawsat"]')?.innerText||'');
ck(/ناشر: ادارہ انصار السنۃ پبلیکیشنز/.test(t),'publisher line in the list row: '+t.replace(/\s+/g,' '));
const idx=await p.evaluate(async()=>{const x=await fetch('coll/index.js').then(r=>r.text());const a=JSON.parse(x.slice(x.indexOf('COLLS(')+6,x.lastIndexOf(')')));const aw=a.find(e=>e.key==='mujamawsat');const sec=aw.intro.find(s=>s[0]==='عرض ناشر');return {pubs:a.filter(e=>e.pub).map(e=>e.key),last:sec[1][sec[1].length-1]}});
ck(idx.pubs.length>=6,'pub on the six Ansar books '+idx.pubs);
ck(/ادارہ انصار السنۃ پبلیکیشنز، لاہور$/.test(idx.last),'publisher name at the end of the note');
ck(!errs.length,'js errors '+errs[0]);
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
