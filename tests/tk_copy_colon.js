const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:780}});let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/mujamsaghir/n/10');await p.waitForSelector('.tkrow .ptakh',{timeout:60000});await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{const k=document.querySelector('.tkrow');const rg=document.createRange();rg.selectNodeContents(k);const s=getSelection();s.removeAllRanges();s.addRange(rg);return {sel:s.toString(),box:k.textContent}});
if(!/تحقیق و تخریج\s*:\s*\S/.test(r.sel))bad.push('copied text lacks the colon: '+r.sel.slice(0,60));
if(/رقم\s*[:：]/.test(r.box))bad.push('old «رقم:» style still shown: '+r.box.slice(0,120));
console.log(bad.length?'FAIL '+bad.join('|'):'PASS tk_copy_colon');await b.close()})();
