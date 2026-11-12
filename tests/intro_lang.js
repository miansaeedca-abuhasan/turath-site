// guard: Urdu UI shows the Urdu introduction cards (not English); English UI shows English
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let bad=0;
for(const [ui,re,key] of [['ur',/^[^A-Za-z]*[؀-ۿ]/,'fazail'],['ur',/^[^A-Za-z]*[؀-ۿ]/,'seerah'],['en',/^[A-Za-z]/,'fazail']]){
const p=await b.newPage({viewport:{width:390,height:900}});await p.addInitScript(u=>{localStorage.ui=u;localStorage.newsDay=new Date().toDateString()},ui);
await p.goto('http://localhost:8765/#/s/'+key);await p.waitForTimeout(2500);await p.evaluate(()=>{const a=[...document.querySelectorAll('#list a')].find(x=>/#\/s\/[^/]+$/.test(x.getAttribute('href')||''));if(a)a.click()});await p.waitForSelector('details.intro summary',{timeout:15000}).catch(()=>{});
const t=await p.evaluate(()=>[...document.querySelectorAll('details.intro summary')].map(x=>x.textContent.trim()));
if(!t.length||!t.every(x=>re.test(x))){console.log('FAIL',ui,key,t);bad++;}await p.close();}
console.log(bad?'FAILED':'OK');await b.close();process.exit(bad?1:0)})();
