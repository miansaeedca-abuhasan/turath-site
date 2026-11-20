// Jami / Talkhis home tile «ذیلی مترجم کتب» (#/hb/a/jami): only books taken from Al-Jami al-Kamil that are translated into the reader's language;
// never Al-Jami or Talkhis themselves, never Silsila (not taken from Al-Jami); the main list still has Jami, Talkhis, then the translated books
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();
for(const ui of ['ur','en']){const c=await b.newContext({viewport:{width:390,height:900}});
await c.addInitScript(u=>{localStorage.nosplash='1';localStorage.ui=u},ui);const p=await c.newPage();
const rows=async h=>{await p.goto('http://localhost:8765/index.html'+h);await p.waitForTimeout(2500);return p.evaluate(()=>[...document.querySelectorAll('a.srow2')].map(x=>x.innerText.replace(/\n/g,' ')))};
const r=await rows('#/hb/a/jami');
ck(r.length>=5,ui+': folder has its books ('+r.length+')');
ck(!r.some(x=>/الجامع الکامل|Al-Jami al-Kamil/.test(x.split('|')[0].slice(0,40))&&/^.{0,3}\s*(الجامع الکامل|تلخیص|Al-Jami|Talkhis)/.test(x)),ui+': neither Al-Jami nor Talkhis inside the folder');
ck(!r.some(x=>/سلسلہ احادیث|Silsila/.test(x)),ui+': Silsila is not a book taken from Al-Jami');
if(ui==='ur'){ck(r.some(x=>/الادب العالی/.test(x))&&r.some(x=>/فتنوں اور قرب قیامت/.test(x)),'ur: sub-books listed');ck(!r.some(x=>/صرف عربی/.test(x)),'ur: only books with an Urdu translation');
 await p.goto('http://localhost:8765/index.html#/');}
const m=await rows('#/hb');ck(/الجامع الکامل|Al-Jami/.test(m[0])&&/تلخیص|Talkhis/.test(m[1]),ui+': main list starts with Al-Jami then Talkhis');
await c.close();}
const c=await b.newContext({viewport:{width:390,height:900}});await c.addInitScript(()=>{localStorage.nosplash='1';localStorage.ui='ur'});const p=await c.newPage();
await p.goto('http://localhost:8765/index.html#/b');await p.waitForTimeout(2500);
ck(await p.evaluate(()=>[...document.querySelectorAll('.tile')].some(x=>/ذیلی مترجم کتب/.test(x.innerText))),'tile is called «ذیلی مترجم کتب»');
await p.goto('http://localhost:8765/index.html#/hb/a/jami');await p.waitForTimeout(2000);
ck(await p.evaluate(()=>/ذیلی مترجم کتب/.test(document.body.innerText)),'folder title «ذیلی مترجم کتب»');
await b.close();process.exit(bad?1:(console.log('PASS silsila_in_translated_folder'),0))})();
