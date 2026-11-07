// Guard: «حدیث مکمل سند کے ساتھ» (Jami 3618): whole hadith with isnad, the quoted words normal, the rest light, narrators in their own colour without the honorific
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:1100,height:1000}});let bad=[];
p.on('pageerror',e=>bad.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.book='jamik'});
await p.goto('http://localhost:8765/#/h/3618?one');await p.waitForSelector('.mtabs button',{timeout:15000});
await p.evaluate(()=>document.querySelectorAll('.sheetbg,#ipop').forEach(x=>x.remove()));
await (await p.$$('.mtabs button'))[1].click();await p.waitForSelector('.fullh a.snlink',{timeout:15000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const f=document.querySelector('.fullh'),L=[...f.querySelectorAll('a.snlink')].map(a=>a.textContent.replace(/[ً-ْـ]/g,'').trim());return{n:L.length,L,dim:f.querySelectorAll('.dimw').length,txt:f.textContent.replace(/[ً-ْـ]/g,'')}});
if(r.n<4)bad.push('narrators '+r.n);if(r.L.some(x=>/رضي|رضى/.test(x)))bad.push('honorific in link: '+r.L.join('|'));
if(!r.dim)bad.push('no light words');if(!/حدثنا مسدد/.test(r.txt)||!/ملبيا/.test(r.txt))bad.push('not the whole hadith');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS '+r.L.join(' | '));await b.close();process.exit(bad.length?1:0)})();
