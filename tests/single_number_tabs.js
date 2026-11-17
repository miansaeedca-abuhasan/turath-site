// single Jami hadith carries the red number «1458-» in front of the Arabic text; the 4 narrator tabs fit the phone width without sideways scrolling; edge swipe does not turn the page
const {chromium,devices}=require('playwright');let bad=[];
(async()=>{const b=await chromium.launch(),c=await b.newContext({...devices['Pixel 7'],locale:'ur'}),p=await c.newPage();
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=new Date().toDateString();localStorage.book='jamik'});
await p.goto('http://localhost:8765/#/h/1458');await p.waitForSelector('.mt.ar .hn',{timeout:40000});
const r=await p.evaluate(()=>{const h=document.querySelector('.mt.ar p .hn');return{t:h.textContent,first:h.parentElement.firstElementChild===h,col:getComputedStyle(h).color}});
if(r.t!=='1458-'||!r.first||r.col!=='rgb(164, 38, 44)')bad.push('single hadith number '+JSON.stringify(r));
await p.goto('http://localhost:8765/#/jr/94');await p.waitForSelector('.jr .tabs button',{timeout:40000});await p.waitForTimeout(800);
const t=await p.evaluate(()=>{const e=document.querySelector('.jr .tabs');return{n:e.children.length,sw:e.scrollWidth,cw:e.clientWidth,bw:[...e.children].map(x=>x.scrollWidth<=x.clientWidth+1),ox:getComputedStyle(document.documentElement).overscrollBehaviorX}});
if(t.n!==4||t.sw>t.cw+1||t.bw.includes(false))bad.push('tabs '+JSON.stringify(t));
if(t.ox!=='none')bad.push('overscroll-x '+t.ox);
await b.close();console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');process.exit(bad.length?1:0)})();
