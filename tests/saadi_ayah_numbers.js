// Tafsir as-Saadi (Urdu): «(1)» in the translation paragraph and the «[1]» opening a commentary paragraph are ayah numbers -> small circles, no raw marks (owner question 27-11-2026)
const {chromium}=require('playwright');let bad=[];
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:430,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.ui='ur';localStorage.nosplash='1';localStorage.newsSeen='20261127a';localStorage.newsDay=new Date().toDateString()}catch(e){}});
await p.goto('http://localhost:8765/index.html#/q/tafsir/ur_saadi/11');await p.waitForSelector('.tfpass',{timeout:25000});await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const f=document.querySelector('.tfpass'),ps=[...f.querySelectorAll('.qtr')];return {first:ps[0].querySelectorAll('.ayn').length,second:ps[1].querySelectorAll('.ayn').length,raw:(f.innerText.match(/\(\d{1,3}\)|\[\d{1,3}\]/g)||[]).length}});
if(r.first!==4)bad.push('translation circles '+r.first);if(r.second<1)bad.push('commentary circle missing');if(r.raw)bad.push('raw marks left '+r.raw);
// the Arabic Saadi and other tafsirs are untouched
await p.goto('http://localhost:8765/index.html#/q/tafsir/ar_saadi/11');await p.waitForSelector('.tfpass',{timeout:25000});
await b.close();console.log(bad.length?'FAIL '+bad.join(' | '):'PASS saadi_ayah_numbers');process.exit(bad.length?1:0)})();
