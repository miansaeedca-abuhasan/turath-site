const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:780}});let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
for(const u of ['#/s/seerah/n/5','#/s/fazail/n/2','#/s/fitan/n/2','#/s/adabaali/n/1']){
await p.goto('http://localhost:8765/'+u);await p.waitForSelector('.card .mt.ar',{timeout:60000});await p.waitForTimeout(2500);
const t=await p.evaluate(()=>{const l=document.querySelector('.card .tkrow .tklab');return l&&l.textContent});
if(!t||t.indexOf('اعظمی')<0)bad.push(u+' no «تحقیق و تخریج دکتور …» label: '+t);}
console.log(bad.length?'FAIL '+bad.join('|'):'PASS tkby_subbooks');await b.close()})();
