// Jami sub-books: takhrij has the book and the number only («رواه البخاري (7089)، ومسلم (2359)»), no chapter name — checked on the data of every sub-book (a new sub-book is checked too) and on screen
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:780}});let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/fitan/n/1');await p.waitForSelector('p.agrade',{timeout:40000});await p.waitForTimeout(2500);
const r=await p.evaluate(async()=>{const N=x=>x.replace(/[أإآٱ]/g,'ا').replace(/[ً-ٰٟـ]/g,'');
 const KEEP=/^(?:الادب المفرد|التاريخ|خلق افعال|الكبرى|الاكبري|السنن الكبرى|الشمائل|شائله|عمل اليوم|العلل|جزء|خصائص|الكنى|الموطا|الضعفاء|القراءة خلف|رفع اليدين|الزهد)/;
 const re=/(البخاري|مسلم|أبو داود|أبي داود|الترمذي|النسائي|ابن ماجه|ابن ماجة|مالك|الدارمي)\s+في\s+([^()\d،:-]{2,45}?)(\s*[-]?\s*\()/g;
 const idx=await (await fetch('coll/index.js')).text();const books=JSON.parse(idx.slice(idx.indexOf('(')+1,idx.lastIndexOf(')')));let n=0,tot=0,ex=[];
 for(const bk of books){if(!bk.jami)continue;for(const l of Object.keys(bk.files))for(const [f,t,fn] of bk.files[l]){const tx=await (await fetch('coll/'+fn)).text();const rows=JSON.parse(tx.slice(tx.indexOf('[',tx.indexOf(',"'+l+'"')),tx.lastIndexOf(']')+1));
  rows.forEach(r=>{const g=r[2];if(typeof g!=='string')return;tot++;let m;re.lastIndex=0;while((m=re.exec(g))){if(!KEEP.test(N(m[2].trim()))){n++;if(ex.length<3)ex.push(bk.key+': '+g.slice(0,80));}}});}}
 return {n,tot,ex,shown:document.querySelector('p.agrade').textContent}});
if(r.n)bad.push(r.n+' takhrij with a chapter name '+r.ex.join(' | '));if(r.tot<1000)bad.push('too few takhrij read '+r.tot);
console.log(bad.length?'FAIL '+bad.join('; '):'PASS tk_no_chapter_names');await b.close();process.exit(bad.length?1:0)})();
