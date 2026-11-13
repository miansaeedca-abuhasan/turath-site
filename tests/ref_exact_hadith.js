// Guard: a printed (Abd al-Baqi) number that holds several hadith opens ONLY the hadith whose text matches (Jami 26 → Muslim 11 = internal 17, not 17+18)
const {chromium}=require('playwright');const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const errs=[];
 // data may live in d1 hadith list as well
 const p=await b.newPage({viewport:{width:420,height:900}});p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{localStorage.ui='ur';localStorage.book='jamik';localStorage.newsDay=String(new Date().toDateString())});
 await p.goto('http://localhost:8765/#/h/26');await p.waitForSelector('article, .card',{timeout:25000});await p.waitForTimeout(5000);
 const d=await p.evaluate(()=>{const h=window.TURATH_DATA.hadith.find(x=>x.num===26);return h.refs.find(r=>r.key==='muslim')});
 ck(d&&d.n===17,'Jami 26 muslim ref carries n=17: '+JSON.stringify(d));
 const lk=await p.$$('a.rlink');let hit=false;
 for(const a of lk){const t=(await a.innerText()).trim();const ctx=await a.evaluate(x=>(x.closest('p')||x.parentNode).textContent);
  if(t==='11'&&/مسلم/.test(ctx)){await a.scrollIntoViewIfNeeded();await a.click();hit=true;break}}
 await p.waitForTimeout(3500);
 const n2=await p.evaluate(()=>{const bx=document.querySelector('.refbox.rinl');return bx?bx.querySelectorAll('.card, article').length:-1});
 ck(hit,'found the Muslim (11) link');ck(n2===1,'link shows exactly one hadith: '+n2);
 const txt=await p.evaluate(()=>{const bx=document.querySelector('.refbox.rinl');return bx?bx.innerText:''});
 ck(/١٧|17/.test(txt)&&!/(عام|General)[^]{0,12}(١٨|18)/.test(txt),'it is hadith 17: '+txt.slice(0,160).replace(/\n/g,' '));
 ck(!errs.length,'js errors '+errs[0]);console.log(bad?'FAIL':'PASS ref_exact_hadith');await b.close();process.exit(bad?1:0)})()
