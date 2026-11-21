// Guard (Jami references, Urdu interface): the hadith opened from a takhrij reference never shows an English grade line (Sahih (Al-Albani) ...);
// Jami takhrij with «book(n)» marks renders (no endless recursion) and keeps its red number.
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const errs=[];
 const p=await b.newPage({viewport:{width:420,height:900}});p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{localStorage.ui='ur';localStorage.book='jamik';localStorage.csel_ur='["en"]';localStorage.newsDay=String(new Date().toDateString())});
 for(const [num,pat] of [[19,/ترمذ/],[17,/أبو داود|أبي داود/],[8,/بخاري/]]){
  await p.goto('http://localhost:8765/#/h/'+num+'?one');await p.waitForSelector('article, .card',{timeout:30000});await p.waitForTimeout(5000);
  const ls=await p.$$('a.rlink');let hit=false;
  for(const a of ls){const ctx=await a.evaluate(x=>x.parentNode.textContent);if(!pat.test(ctx))continue;await a.scrollIntoViewIfNeeded();await a.click();hit=true;break}
  await p.waitForTimeout(3500);
  const tx=await p.evaluate(()=>{const bx=document.querySelector('.refbox.rinl');return bx?bx.innerText:''});
  ck(hit&&tx.length>20,'reference opened for '+num);
  ck(!/\((Al-Albani|Zubair Ali Zai|Ahmad Muhammad Shakir|Shuaib Al Arnaut)\)/.test(tx),'no English grade in the reference box of '+num+': '+(tx.match(/[^\n]{0,40}Albani[^\n]{0,20}/)||[''])[0]);
 }
 // takhrij with a book mark (hadith 8): renders, with red numbers
 await p.goto('http://localhost:8765/#/h/8?one');await p.waitForSelector('article, .card',{timeout:30000});await p.waitForTimeout(5000);
 const r=await p.evaluate(()=>({tk:[...document.querySelectorAll('p.tk')].map(x=>x.textContent).join(' '),red:document.querySelectorAll('p.tk a.rlink.red').length}));
 ck(/\(4592\)/.test(r.tk)||/4592/.test(r.tk),'takhrij of hadith 8 shows the book-marked number: '+r.tk.slice(0,80));ck(r.red>0,'red number present in hadith 8');
 ck(!/Maximum call stack/.test(errs.join()),'no stack overflow');
 console.log(bad?'FAIL':'PASS jami_ref_grade_urdu');await b.close();process.exit(bad?1:0)})()
