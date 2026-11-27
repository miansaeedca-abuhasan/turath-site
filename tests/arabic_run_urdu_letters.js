const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage();let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});
await p.goto('http://localhost:8765/index.html#/q');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const o=rich0('اس میں بِسْمِ اللّٰہِ الرَّحْمٰنِ الرَّحِیْمِ، سے پہلے اَعُوْذُ بِاللّٰہِ مِنَ الشَّیْطٰنِ الرَّجِیْمِ پڑھنا بھی',  'ur');
 return o.map(x=>x.nodeType?x.textContent:x.textContent||x)});
const spans=r.filter(t=>t.indexOf('«')===0);
if(spans.length>2)bad.push('Arabic run split into '+spans.length+': '+JSON.stringify(spans));
console.log(bad.length?'FAIL '+bad:'OK arabic_run_urdu_letters',JSON.stringify(spans));await b.close();process.exit(bad.length?1:0)})();
