const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();let bad=[];
for(const [h,want] of [['#/sec/seerah',['seerah','raheeq']],['#/sec/sahaba',['fazail','fadailahmad']]]){
const p=await b.newPage({viewport:{width:390,height:800}});
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/'+h);await p.waitForSelector('.hbrow',{timeout:60000});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>({k:[...document.querySelectorAll('.hbrow')].map(a=>a.dataset.k),nav:[...document.querySelectorAll('#bnav a')].map(a=>a.getAttribute('href')+'|'+a.textContent.trim())}));
want.forEach((k,i)=>{if(r.k[i]!==k)bad.push(h+' position '+(i+1)+' is '+r.k[i]+' expected '+k)});if(r.k.length<4)bad.push(h+' too few books');
if(!r.nav.some(x=>/s\/rijal\|موسوعۃ الرواۃ/.test(x)))bad.push('nav last tab '+r.nav.join(','));if(r.nav.some(x=>/shadharat/.test(x)))bad.push('shadharat still in nav');
if(!r.nav.some(x=>/#\/sec\/seerah/.test(x))||!r.nav.some(x=>/#\/sec\/sahaba/.test(x)))bad.push('nav tabs do not open the lists');
await p.close();}
console.log(bad.length?'FAIL '+bad.join('|'):'PASS section_lists');await b.close()})();
