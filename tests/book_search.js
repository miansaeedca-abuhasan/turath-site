// Guard: the book-list filter finds a book however the name is typed (letter forms, missing «ال», plural endings, word order, marks)
const {chromium}=require('playwright');(async()=>{let bad=[];const b=await chromium.launch(),p=await b.newPage({viewport:{width:900,height:900}});
p.on('pageerror',e=>bad.push(e.message));await p.addInitScript(()=>{localStorage.ui='ar'});
await p.goto('http://localhost:8765/#/hb');await p.waitForSelector('#hbfilter',{timeout:20000});await p.waitForTimeout(3000);
await p.evaluate(()=>document.querySelectorAll('.sheetbg,.sheet,#ipop').forEach(x=>x.remove()));
const cases=[['الضعفاء والمتروكين للدارقطني','sh10802'],['الضعفاء الدارقطني','sh10802'],['ضعفاء دارقطني','sh10802'],['الضُّعَفَاءُ وَالْمَتْرُوكُونَ','sh10802'],['تاريخ الاوسط بخاري','sh5782'],['الضعفاء الصغير للبخاري','sh8632'],['ٱلثقات للعجلى','sh9170'],['تقريب','sh8609']];
for(const [q,k] of cases){await p.fill('#hbfilter',q);await p.waitForTimeout(1500);
  const ks=await p.evaluate(()=>[...document.querySelectorAll('a.hbrow')].map(a=>a.dataset.k));if(!ks.includes(k))bad.push('«'+q+'» did not find '+k+' (got '+ks.slice(0,5).join(',')+')')}
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
