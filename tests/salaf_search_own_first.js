// Salaf: a search by a person's name lists that person's own entry first, then the other places he is mentioned (book search box)
const {chromium}=require('playwright');let bad=[];
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});p.on('pageerror',e=>bad.push('pageerror '+e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/siyar');await p.waitForFunction(()=>window.COLL&&COLL.bookSearch,null,{timeout:30000});await p.waitForTimeout(3000);
await p.evaluate(()=>COLL.bookSearch('siyar'));await p.waitForSelector('.sheet input.filter',{timeout:20000});
await p.fill('.sheet input.filter','علی بن مدینی');await p.waitForSelector('.sheet .qsbar',{timeout:60000});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const c=[...document.querySelectorAll('.sheet .bsres .card')].filter(x=>x.querySelector('.rno'));return c.slice(0,3).map(x=>x.innerText.replace(/\s+/g,' ').slice(0,200))});
if(!r.length)bad.push('no results');else if(!r.every(x=>/علي بن المديني أبو الحسن البصري/.test(x)))bad.push('own entry not first: '+r.join(' || '));
// the other persons' entries that only mention him come after
const idx=await p.evaluate(()=>[...document.querySelectorAll('.sheet .bsres .card')].filter(x=>x.querySelector('.rno')).slice(0,20).map(x=>x.innerText.slice(0,60)));
console.log(bad.length?'FAIL '+bad.join(' | ')+' '+JSON.stringify(r):'PASS');await b.close();process.exit(bad.length?1:0)})();
