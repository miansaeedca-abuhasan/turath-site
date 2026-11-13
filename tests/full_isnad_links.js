// Guard: in «حدیث مکمل سند کے ساتھ» the narrators of the source isnad are links (Jami 26 → Muslim 11: Qutayba bin Sa'id with his long lineage, Malik «فيما قرئ عليه», Abu Suhayl, his father, Talha)
const {chromium}=require('playwright');let bad=[];
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});p.on('pageerror',e=>bad.push('pageerror '+e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.book='jamik';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/h/26');await p.waitForTimeout(6000);
await p.evaluate(()=>{const t=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='حدیث مکمل سند کے ساتھ');t.click()});await p.waitForTimeout(5000);
const r=await p.evaluate(()=>{const f=document.querySelector('.fullbox:not([hidden])');return f?[...f.querySelectorAll('a.snlink')].map(a=>a.textContent.replace(/[ً-ْ]/g,'').trim()):null});
if(!r||r.length<5)bad.push('narrator links '+JSON.stringify(r));
else{if(!/قتيبة/.test(r[0])||!/عبد الله/.test(r[0]))bad.push('lineage name cut: '+r[0]);if(!r.some(x=>/مالك بن أنس$/.test(x)))bad.push('malik name: '+r.join('|'));if(!r.some(x=>/طلحة/.test(x)))bad.push('no Talha')}
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
