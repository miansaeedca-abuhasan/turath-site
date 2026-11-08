// Guard: every Raheeq part with notes shows them in ONE bordered box as a running paragraph, also when a note is long (part 12).
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:900,height:900}});let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur'});
for(const n of [12,13]){
 await p.goto('http://localhost:8765/#/s/raheeq/n/'+n);await p.waitForSelector('.pfnbox',{timeout:15000});await p.waitForTimeout(800);
 const r=await p.evaluate(()=>({boxes:document.querySelectorAll('.pfnbox').length,run:document.querySelectorAll('.pfnbox.pfnrun').length,loose:document.querySelectorAll('.bkitem > .pfn').length,fs:parseFloat(getComputedStyle(document.querySelector('.pfnrun .pfn')).fontSize)}));
 if(r.boxes!==1||r.run!==1||r.loose)bad.push('part '+n+' '+JSON.stringify(r));if(r.fs<16.5)bad.push('note font too small '+r.fs);
}
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
