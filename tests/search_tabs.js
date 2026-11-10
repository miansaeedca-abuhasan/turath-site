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
 await nuke();await p.click('.gstab[data-tab="topic"]');await p.fill('#gsq',word);await p.click('.gsgo');await p.waitForTimeout(2500);
 ck(await p.$$eval('.gstopic',x=>x.length)>3,ui+' topic finds chapters');
 ck(!(await p.$eval('.gspick',x=>x.hidden))&&(await p.evaluate(()=>{document.querySelector('.gspick').open=true;return document.querySelectorAll('.gslist .srow').length}))>10,ui+' topic tab lets the person choose books');
 ck(!errs.length,'page errors '+errs);await p.close();}
// rulings: the grade filter
{const p=await b.newPage({viewport:{width:420,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{localStorage.ui='ur';localStorage.setItem('gstab4','null');localStorage.setItem('gsgrade','null');localStorage.newsDay=String(new Date().toDateString())});
 await p.goto('http://localhost:8765/#/search');await p.waitForSelector('.gsgrade',{state:'attached',timeout:15000});
 const g=await p.evaluate(()=>['متفق عليه (عبد الباقي)','صحيح (الألباني)؛ صحيح (محمد فؤاد)','حسن لغيره','إسناده حسن','ضعيف (الألباني)','إسناده ضعيف','حديث صحيح، وهذا إسناد ضعيف','حديث موضوع','Sahih (Al-Albani)','','لا شيء'].map(x=>GRADECAT(x)));
 ck(JSON.stringify(g)===JSON.stringify(['sahih','sahih','sahih','sahih','daif','daif','sahih','mawdu','sahih','','']),'grade classes '+g);
 ck(await p.$$eval('.gsgrade .segb',x=>x.length)===4,'four ruling buttons');
 const nuke=()=>p.evaluate(()=>document.querySelectorAll('.sheetbg,[class*=install]').forEach(n=>n.remove()));
 await nuke();await p.click('.gstab[data-tab="ar"]');await nuke();await p.evaluate(()=>{const f=document.querySelector('.gsflt');if(f)f.open=true});await p.click('.gsgrade [data-g="daif"]');await p.fill('#gsq','من كذب علي متعمدا');await p.click('.gsgo');await p.waitForTimeout(9000);
 const heads=await p.$$eval('.gsres summary',x=>x.map(s=>s.textContent));
 ck(heads.length>0,'weak hadith found '+heads.length);
 ck(!heads.some(h=>/تلخیص|تلخيص|Talkhis/.test(h)),'Talkhis (all sahih/hasan) is left out of the weak list');
 ck(!errs.length,'page errors '+errs);await p.close();}
// an opened book offers the search by hadith number, words and phrases
{const p=await b.newPage({viewport:{width:420,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
 await p.goto('http://localhost:8765/#/s/bukhari?idx');await p.waitForSelector('#csearch',{timeout:20000});
 ck(await p.evaluate(()=>document.querySelectorAll('#csearch').length===1&&!document.querySelector('.bksearch')),'one search bar in the book (no second search button)');
 await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(n=>n.remove()));
 await p.click('.bknum');ck(await p.evaluate(()=>document.querySelector('#csearch').inputMode==='numeric'),'number option switches to the number keypad');
 await p.fill('#csearch','1');await p.waitForTimeout(2500);ck(await p.evaluate(()=>document.querySelectorAll('#view .card,main .card').length)>=1,'book search: hadith number finds the hadith');
 await p.click('.bknum');await p.fill('#csearch','إنما الأعمال بالنيات');await p.waitForTimeout(4000);ck(await p.evaluate(()=>/\d/.test((document.querySelector('.qsbar')||{}).textContent||''))||await p.evaluate(()=>document.querySelectorAll('.rno').length)>=1,'book search: words and phrases find hadith');
 ck(!errs.length,'page errors '+errs);await p.close();}
console.log(bad?'FAIL':'PASS search_tabs');await b.close();process.exit(bad?1:0)})();
