// search of words inside the OPEN tafsir only
const {chromium}=require('playwright');let bad=[];const ck=(c,m)=>{if(!c)bad.push(m)};
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:430,height:900}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.newsSeen='20261122a';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur'}catch(e){}});
const reqs=[];p.on('request',r=>{if(/quran\/tafsir\/.*_\d+\.js/.test(r.url()))reqs.push(r.url())});
await p.goto('http://localhost:8765/index.html#/q/tafsir/ur_makki');await p.waitForSelector('.tfsearch input',{timeout:30000});
ck(reqs.length===0,'nothing loaded before pressing search ('+reqs.length+')');
await p.fill('.tfsearch input','اللہ تعالیٰ');await p.press('.tfsearch input','Enter');
await p.waitForSelector('.tfhit',{timeout:60000});
const n=await p.$$eval('.tfhit',e=>e.length);ck(n>0,'hits shown');
ck(await p.$('.tfhit mark'),'hit words highlighted');
ck(reqs.every(u=>/ur_makki_/.test(u)),'only the open tafsir was loaded: '+reqs.join(','));
const h=await p.$eval('.tfhit',e=>e.getAttribute('href'));ck(/^#\/q\/tafsir\/ur_makki\/\d+$/.test(h),'hit links to its surah: '+h);
await p.fill('.tfsearch input','زززززززقققق');await p.press('.tfsearch input','Enter');await p.waitForFunction(()=>/نہیں ملا/.test(document.querySelector('.tfsearch .note').textContent),null,{timeout:60000});
ck(!(await p.$('.tfhit')),'old hits cleared for a new search');
ck(!errs.length,'page errors '+errs.join('|'));
await b.close();console.log(bad.length?'FAIL '+bad.join(' | '):'PASS tafsir_word_search');process.exit(bad.length?1:0)})();
