const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage();let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/updates.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const a=document.querySelector('article'),l=document.querySelector('article li a');return{hd:!!document.querySelector('header.hd img'),n:document.querySelectorAll('article').length,bd:a&&getComputedStyle(a).borderTopWidth,ul:l&&getComputedStyle(l).textDecorationLine,wm:getComputedStyle(document.body,'::before').backgroundImage,ov:document.documentElement.scrollWidth<=innerWidth}});
if(!r.hd)bad.push('no header logo');if(!r.n)bad.push('no cards');if(!parseFloat(r.bd))bad.push('border '+r.bd);if(r.ul!=='none')bad.push('links underlined');if(!/icon-512/.test(r.wm))bad.push('no watermark logo');
console.log(bad.length?'FAIL '+bad:'OK updates_page_design');await b.close();process.exit(bad.length?1:0)})();
