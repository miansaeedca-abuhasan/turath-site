const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:780}});let bad=[];
for(const ui of ['en','bn']){await p.addInitScript(u=>{localStorage.ui=u;localStorage.book='jami';localStorage.newsDay=String(new Date().toDateString())},ui);
await p.goto('http://localhost:8765/#/h/13827');await p.reload();await p.waitForSelector('.card .tr',{timeout:60000});await p.waitForTimeout(2500);
const t=await p.evaluate(()=>[...document.querySelectorAll('.trrow .trbtn')].map(x=>x.textContent).join('|'));
if(!/Sudman|সুদমান/.test(t))bad.push(ui+' translator name missing: '+t);}
console.log(bad.length?'FAIL '+bad.join('|'):'PASS talkhis_translator');await b.close()})();
