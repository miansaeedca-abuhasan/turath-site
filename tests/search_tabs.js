// Hadith search page: tabs = app language · Arabic · English · Topic; each language tab lists only the books that have that language; Topic finds chapters
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
for(const [ui,word] of [['ur','نماز'],['en','prayer']]){
 const p=await b.newPage({viewport:{width:420,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(u=>{localStorage.ui=u;localStorage.setItem('gstab4','null');localStorage.newsDay=String(new Date().toDateString())},ui);
 await p.goto('http://localhost:8765/#/search');await p.waitForSelector('.gstab',{timeout:15000});
 const nuke=()=>p.evaluate(()=>document.querySelectorAll('.sheetbg,[class*=install]').forEach(n=>n.remove()));
 const tabs=await p.$$eval('.gstab',x=>x.map(t=>t.dataset.tab));
 ck(JSON.stringify(tabs)===JSON.stringify(ui==='ur'?['ur','ar','en','topic']:['en','ar','topic']),ui+' tabs '+tabs);
 const cnt={};for(const t of tabs.filter(x=>x!=='topic')){await nuke();await p.click('.gstab[data-tab="'+t+'"]');await p.waitForTimeout(300);await p.evaluate(()=>document.querySelector('.gspick').open=true);cnt[t]=await p.$$eval('.gslist .srow',x=>x.length);}
 ck(cnt.ar>500,ui+' Arabic tab lists all books '+cnt.ar);
 ck(cnt[ui==='ur'?'ur':'en']<60,ui+' own-language tab lists only translated books '+JSON.stringify(cnt));
 ck(cnt.en<60,'English tab lists only English books '+cnt.en);
 await nuke();await p.click('.gstab[data-tab="topic"]');await p.fill('#gsq',word);await p.click('.gsbar .btn');await p.waitForTimeout(2500);
 ck(await p.$$eval('.gstopic',x=>x.length)>3,ui+' topic finds chapters');
 ck(await p.$eval('.gspick',x=>x.hidden),ui+' topic hides the book list');
 ck(!errs.length,'page errors '+errs);await p.close();}
console.log(bad?'FAIL':'PASS search_tabs');await b.close();process.exit(bad?1:0)})();
