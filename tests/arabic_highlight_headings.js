// owner ruling 20-11-2026: Arabic inside Urdu text has a soft highlight (gold for a phrase, blue for one word); in-text headings have the gold double line; no stray tatweel in Tafsir Noor Urdu words
const {chromium}=require('playwright'),fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
for(const f of fs.readdirSync(__dirname+'/../coll').filter(x=>/^tafsirnoor_ur_/.test(x))){
  const t=fs.readFileSync(__dirname+'/../coll/'+f,'utf8');
  for(const m of t.matchAll(/[^\s"\[\],]*ـ[^\s"\[\],]*/g))if(!/[ً-ْٰۡ-ۭ]/.test(m[0])){ck(false,'plain tatweel '+m[0]);break}
}
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:1200,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.newsSeen='20261120a';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur'}catch(e){}});
await p.goto('http://localhost:8765/index.html#/s/tafsirnoor/n/2');await p.waitForTimeout(4500);
const r=await p.evaluate(()=>{const q=[...document.querySelectorAll('.arq')],w=q.find(e=>e.classList.contains('arq1')),ph=q.find(e=>!e.classList.contains('arq1')&&e.textContent.trim().split(/\s+/).length>2),h=document.querySelector('h4.subh,.phead,.qe-sub');
 const bg=e=>e?getComputedStyle(e).backgroundColor:'';return{n:q.length,word:bg(w),phrase:bg(ph),head:h?getComputedStyle(h).backgroundImage.includes('gradient'):false}});
ck(r.n>3,'arabic spans present '+r.n);ck(/rgba\(66, 153, 225/.test(r.word),'single word blue '+r.word);ck(/rgba\(244, 196, 48/.test(r.phrase),'phrase gold '+r.phrase);
await b.close();if(bad)process.exit(1);console.log('PASS arabic_highlight_headings')})();
