const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();let bad=0;
for(const [n,w] of [['phone',390],['desktop',1280]]){const p=await b.newPage({viewport:{width:w,height:900}});await p.addInitScript(()=>{localStorage.ui='ur';localStorage.splashT=String(Date.now())});await p.goto('http://localhost:8765/');await p.waitForSelector('.tick .ti',{timeout:15000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const t=document.querySelector('.tick'),d=document.querySelector('.datebar'),i=t.querySelector('.ti'),cs=getComputedStyle(i);return{th:t.getBoundingClientRect().height,dh:d.getBoundingClientRect().height,fs:parseFloat(cs.fontSize),ws:cs.wordSpacing,ih:i.getBoundingClientRect().height}});console.log(n,r);
if(Math.abs(r.th-r.dh)>1)bad=1;
if(n==='desktop'&&(r.th<40||r.fs<14||r.ws==='normal'||r.ih>r.th-2))bad=1;
if(n==='phone'&&(r.fs>13||r.th>36))bad=1;await p.close()}
console.log(bad?'FAIL':'PASS');await b.close();process.exit(bad)})()
