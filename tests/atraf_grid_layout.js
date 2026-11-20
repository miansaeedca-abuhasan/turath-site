// Index of Al-Jami al-Kamil openings (atraf): website = grid (3 in a line on big screens, 2 on medium), phone = single column as before
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();
for(const [w,cols] of [[390,1],[700,1],[1000,2],[1280,2],[1700,3],[1920,3]]){const p=await b.newPage({viewport:{width:w,height:1000}});
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});
await p.goto('http://localhost:8765/#/s/atraf/7');await p.waitForTimeout(4500);
const r=await p.evaluate(()=>{const c=[...document.querySelectorAll('#list article.atraf')].slice(0,12).map(x=>x.getBoundingClientRect());const tops=[...new Set(c.map(x=>Math.round(x.top)))];const first=c.filter(x=>Math.round(x.top)===tops[0]);
 const ov=c.some(x=>x.right>innerWidth+1||x.left<-1);return {n:c.length,perRow:first.length,ov,wmin:Math.min(...c.map(x=>x.width))}});
ck(r.n>=6,w+': cards '+r.n);ck(r.perRow===cols,w+': '+r.perRow+' per line, expected '+cols);ck(!r.ov,w+': no overflow');ck(r.wmin>=200,w+': card width '+r.wmin);await p.close()}
await b.close();console.log(bad?'FAILED':'PASS atraf_grid_layout');process.exit(bad?1:0)})();
