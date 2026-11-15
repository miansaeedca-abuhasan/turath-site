// Hifz «تکرار» settings: compact, nothing cut off, the «show» choice is not inside a <label> (a label re-clicked the first button), pressing translation keeps it selected
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();
for(const ui of ['en','ur']){const p=await b.newPage({viewport:{width:360,height:800}});
await p.addInitScript(u=>{localStorage.ui=u;localStorage.newsDay=String(new Date().toDateString())},ui);
await p.goto('http://localhost:8765/index.html#/hifz/rep?s=3&f=153&t=154');await p.waitForSelector('.hzc .hzfgrid',{timeout:40000});await p.waitForTimeout(1200);
ck(await p.evaluate(()=>!document.querySelector('.hzc .hzfield .seg').closest('label')),ui+': show-choice is not inside a label');
ck(await p.evaluate(()=>[...document.querySelectorAll('.hzc .segb,.hzc .hzfl b')].every(e=>e.scrollWidth<=e.clientWidth+1)),ui+': no cut-off words');
ck(await p.evaluate(()=>document.querySelector('.hzc').getBoundingClientRect().height<380),ui+': form is compact');
await p.click('.hzc .seg .segb:nth-child(2)');await p.waitForTimeout(600);
ck(await p.evaluate(()=>document.querySelector('.hzc .seg .segb:nth-child(2)').getAttribute('aria-pressed')==='true'&&document.querySelector('.hzc .seg .segb:nth-child(1)').getAttribute('aria-pressed')==='false'),ui+': translation stays selected after the tap');
await p.click('.hzc .seg .segb:nth-child(1)');await p.waitForTimeout(300);
ck(await p.evaluate(()=>document.querySelector('.hzc .seg .segb:nth-child(1)').getAttribute('aria-pressed')==='true'),ui+': ayahs-only selectable again');
await p.close()}
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
