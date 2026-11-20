// «مترجم کتب» folder (#/hb/a/jami) lists Silsila Ahadith Sahiha (Urdu) with the «نئی» tag; it also stays in the main list
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:900}});
await c.addInitScript(()=>{localStorage.nosplash='1';localStorage.ui='ur'});const p=await c.newPage();
const rows=async h=>{await p.goto('http://localhost:8765/index.html'+h);await p.waitForTimeout(2500);return p.evaluate(()=>[...document.querySelectorAll('a.srow2')].map(x=>x.innerText.replace(/\n/g,' ')))};
let r=await rows('#/hb/a/jami');const s=r.find(x=>/سلسلہ احادیث صحیحہ \(عربی\+اُردو\)/.test(x));
ck(!!s,'Silsila is in the translated-books folder');ck(s&&/نئی/.test(s),'Silsila carries the «نئی» tag in the folder');
ck(r.some(x=>/الادب العالی/.test(x)),'the folder keeps its other books');
r=await rows('#/hb');ck(r.some(x=>/سلسلہ احادیث صحیحہ \(عربی\+اُردو\)نئی/.test(x)),'Silsila stays in the main list with «نئی»');
await b.close();process.exit(bad?1:(console.log('PASS silsila_in_translated_folder'),0))})();
