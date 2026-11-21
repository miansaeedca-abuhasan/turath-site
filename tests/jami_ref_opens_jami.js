// Guard: a hadith-number reference (repeat numbers «(4293، 4714)») opens in al-Jami al-Kamil, also when Talkhis is the open book
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();
 for(const bk of ['jami','jamik']){
  const p=await b.newPage({viewport:{width:420,height:900}});
  await p.addInitScript(k=>{localStorage.ui='ur';localStorage.book=k;localStorage.newsDay=String(new Date().toDateString())},bk);
  await p.goto('http://localhost:8765/#/h/30');await p.waitForSelector('article, .card',{timeout:30000});await p.waitForTimeout(5500);
  const a=await p.$('p.rep a[href="#/h/4293"], a[href="#/h/4293"]');ck(!!a,bk+': link exists');
  if(a){await a.scrollIntoViewIfNeeded();await a.click();await p.waitForTimeout(4000);
   const r=await p.evaluate(()=>({b:localStorage.book,t:document.body.innerText.slice(0,300)}));
   ck(r.b==='jamik',bk+': opened in Jami (book='+r.b+')');ck(/الجامع الكامل|كتاب الصيام/.test(r.t),bk+': Jami page shown')}
  await p.close()}
 console.log(bad?'FAIL':'PASS jami_ref_opens_jami');await b.close();process.exit(bad?1:0)})()
