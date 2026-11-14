// Siyar (a book of persons): its search boxes speak of names/words, never of hadith numbers or «total hadith»
const {chromium}=require('playwright');let bad=[];
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});p.on('pageerror',e=>bad.push('pageerror '+e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/index.html#/s/siyar?idx');await p.waitForSelector('#csearch',{timeout:40000});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>({ph:document.querySelector('#csearch').placeholder,hint:!!document.querySelector('.fbhint'),txt:document.body.innerText}));
if(/حدیث|احادیث/.test(r.ph))bad.push('placeholder: '+r.ph);if(!/شخصیت/.test(r.ph))bad.push('placeholder not about persons: '+r.ph);
if(r.hint)bad.push('hadith total hint shown');if(/کل احادیث/.test(r.txt))bad.push('کل احادیث visible');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
