// Guard: narrators in the isnad are coloured links; a tap opens the narrator's details window; the honorific stays outside the link
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:1400,height:1000}});let bad=[];
p.on('pageerror',e=>bad.push('pageerror '+e.message));
await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/#/c/1/0');await p.waitForSelector('a.rawi',{timeout:15000});await p.waitForTimeout(4000);
await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(x=>x.remove()));
const info=await p.evaluate(()=>{const a=document.querySelector('a.rawi');return{t:a.textContent,h:a.getAttribute('href'),c:getComputedStyle(a).color,body:getComputedStyle(document.querySelector('.mt')).color}});
if(/رض/.test(info.t))bad.push('honorific inside link: '+info.t);
if(info.c===info.body)bad.push('narrator colour same as text');
if(!/^#\/n\/\d+/.test(info.h))bad.push('not matched to narrator page: '+info.h);
await p.click('a.rawi');await p.waitForSelector('.nsheet',{timeout:8000}).catch(()=>bad.push('details window did not open'));
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS '+info.t);await b.close();process.exit(bad.length?1:0)})();
