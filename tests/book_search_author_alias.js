// owner 27-11-2026: the book list search must find a book by its full Arabic name (also of the hidden Arabic twin) and by the author's name
const {chromium,devices}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();
for(const ui of ['ur','ar','en']){const c=await b.newContext({...devices['Pixel 5'],serviceWorkers:'block'});const p=await c.newPage();
await p.addInitScript(u=>{try{localStorage.setItem('newsSeen','20261126a');localStorage.setItem('ui',u)}catch(e){}},ui);
await p.goto('http://localhost:8765/#/hb');await p.reload();await p.waitForSelector('#hbfilter',{timeout:30000});
for(const [q,re] of [['سلسلة الأحاديث الصحيحة للألباني',/سلسل|Silsil/],['ناصر الدين الألباني',/سلسل|Silsila/],['الألباني',/سلسل|Silsila/],['ناصر الدين الألباني',/صحیح الجامع|صحيح الجامع|Sahih al-Jami/]]){
 await p.fill('#hbfilter',q);await p.waitForTimeout(800);
 const t=await p.evaluate(()=>[...document.querySelectorAll('a.hbrow')].map(a=>a.innerText).join('\n'));
 ck(re.test(t),ui+': «'+q+'» finds '+re);}
await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS book_search_author_alias')})();
