// Guard: previous is on the left and next on the right, in Urdu and in English, for the hadith pill and the chapter buttons
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let bad=[];
for(const ui of ['ur','en']){const p=await b.newPage({viewport:{width:420,height:800}});
await p.addInitScript(u=>{localStorage.ui=u;localStorage.newsDay=String(new Date().toDateString())},ui);
await p.goto('http://localhost:8765/#/h/100?one');await p.waitForSelector('.hpill button',{timeout:25000});await p.waitForTimeout(1200);
const r=await p.evaluate(()=>{const [a,m,c]=[...document.querySelectorAll('.hpill button')].map(x=>x.getBoundingClientRect().left);return {a,c}});
if(!(r.a<r.c))bad.push(ui+' pill: previous must be on the left '+JSON.stringify(r));
await p.goto('http://localhost:8765/#/s/shamail/1');await p.waitForSelector('.card',{timeout:25000});await p.waitForTimeout(1200);
const s=await p.evaluate(()=>{const a=document.querySelector('.secbtns .sbp'),n=document.querySelector('.secbtns .sbn');return a&&n?{p:a.getBoundingClientRect().left,n:n.getBoundingClientRect().left}:null});
if(s&&!(s.p<s.n))bad.push(ui+' chapter buttons: previous must be on the left '+JSON.stringify(s));
await p.close()}
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS nav_direction');await b.close();process.exit(bad.length?1:0)})();
