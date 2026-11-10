// Guard: al-Jami al-Kamil lists the 67 books of the printed index (Salat and Tafsir whole, Shama'il inside the Sira, the seven inner books on their own), after the introduction come the narrators and authors folders
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:1000,height:900}});const bad=[];p.on('pageerror',e=>bad.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.book='jamik'});
await p.goto('http://localhost:8765/#/k/1');await p.waitForSelector('#view .card, #list .card',{timeout:30000});
await p.goto('http://localhost:8765/#/');await p.waitForTimeout(1200);await p.evaluate(()=>document.querySelectorAll('.sheetbg,#ipop').forEach(n=>n.remove()));await p.evaluate(()=>{[...document.querySelectorAll('span')].find(e=>e.textContent.startsWith('الجامع الکامل (مکمل')).click()});await p.waitForSelector('.srow2',{timeout:30000});
const rows=await p.$$eval('.srow2',els=>els.map(e=>e.innerText.replace(/\n+/g,' | ')));
const books=rows.filter(r=>/كتاب/.test(r.split('|')[1]||'')&&/حدیث نمبر/.test(r));
if(books.length!==67)bad.push('books '+books.length);
['المرتد والمحاربين','الصيد والذبائح','أخبار الماضيين','فضائل القبائل','فضائل البلدان','صفة القيامة'].forEach(n=>{if(!books.some(r=>r.includes(n)))bad.push('missing book '+n)});
if(books.filter(r=>/\| كتاب الصلاة \|/.test(r)).length!==1)bad.push('Salat must be one book');
const i0=rows.findIndex(r=>/المدخل/.test(r)),i1=rows.findIndex(r=>/رواۃ الجامع/.test(r)),i2=rows.findIndex(r=>/مؤلفین الجامع/.test(r)),i3=rows.findIndex(r=>/\| كتاب الوحي/.test(r));
if(!(i0<i1&&i1<i2&&i2<i3))bad.push('order introduction, narrators, authors, books: '+[i0,i1,i2,i3]);
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
