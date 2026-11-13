const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:780}});let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
let tot=0;
for(const n of [1,2,3,4,5,6,7,8,9,10]){
await p.goto('http://localhost:8765/#/s/mujamsaghir/n/'+n);await p.waitForSelector('.card .mt.ar',{timeout:60000});await p.waitForTimeout(1200);
const t=await p.evaluate(()=>[...document.querySelectorAll('.card .ptakh')].map(e=>e.textContent).join(' | '));
if(/رقم\s*[:：]/.test(t))bad.push('n='+n+' رقم: left '+t.slice(0,80));if(/[۰-۹٠-٩]/.test(t))bad.push('n='+n+' non-English digits '+t.slice(0,80));if(/كتاب [^()]*رقم/.test(t))bad.push('kitab/bab kept');tot+=t.length;}
if(!tot)bad.push('no takhrij found');
console.log(bad.length?'FAIL '+bad.join('|'):'PASS takhrij_numbers_style');await b.close()})();
