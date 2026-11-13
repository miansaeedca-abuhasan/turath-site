const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:780}});let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/seerah/3');await p.waitForSelector('.qayah',{timeout:60000});await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{const q=[...document.querySelectorAll('.qayah')];return {ayn:document.querySelectorAll('.qayah .ayn').length,ref:/\[«/.test(document.body.innerText),dbl:/\(\(/.test(document.body.innerText)}});
if(!r.ayn)bad.push('no verse circles');if(r.ref)bad.push('guillemets inside a reference');if(r.dbl)bad.push('double brackets');
const c=await p.evaluate(()=>AYCP('﴿لِاِيْلٰفِ قُرَيْشٍۙ۰۰۱اٖلٰفِهِمْ رِحْلَةَ الشِّتَآءِ وَ الصَّيْفِۚ۰۰۲﴾'));
if(c.indexOf('(1)')<0||/[۰٠]{2}/.test(c)||c.indexOf('(2)')>=0)bad.push('copy text wrong: '+c);
console.log(bad.length?'FAIL '+bad.join('|'):'PASS ayah_numbers_refs');await b.close()})();
