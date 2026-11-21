// owner picked 20-11-2026: ornament 1 (۞) before tafsir headings, 2 (✦) before hadith-book introductions, 3 (❖) before sharh/fawaid headings; CSS-only (never in the text); one author's tafsirs stay together on the «تفاسیر» page
const {chromium}=require('playwright'),fs=require('fs');let bad=[];const ck=(c,m)=>{if(!c)bad.push(m)};
const h=fs.readFileSync(__dirname+'/../index.html','utf8');
ck(/\.tfq \.subh::before[^}]*content:"\\06DE"/.test(h),'rule 1 tafsir');
ck(/details\.intro:not\(\.tfq\)>summary::before[^}]*content:"\\2726"/.test(h),'rule 2 intro');
ck(/\.bkitem:not\(\.tfq\)[^}]*content:"\\2741"/.test(h),'rule 5 other prose books');
ck(/\.fpanel h4\.subh::before[^}]*content:"\\2756"/.test(h),'rule 3 sharh/fawaid');
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:1100,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.newsSeen='20261121a';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur'}catch(e){}});
await p.goto('http://localhost:8765/index.html#/s/tafsirnoor/n/2');await p.waitForSelector('h4.subh',{timeout:25000});
const r=await p.evaluate(()=>{const e=document.querySelector('h4.subh');return{c:getComputedStyle(e,'::before').content,t:e.textContent}});
ck(/۞/.test(r.c),'tafsir heading ornament '+r.c);ck(!/۞/.test(r.t),'ornament not in the text (copy)');
await p.goto('http://localhost:8765/index.html#/q/tafsir');await p.waitForSelector('a.tfrow',{timeout:25000});await p.waitForTimeout(3000);
const au=await p.evaluate(()=>{const a=[...document.querySelectorAll('#qv a.tfrow')].map(x=>x.textContent);const ix=a.map((t,i)=>/ابن كثير|ابنِ کثیر/.test(t)&&/عربی/.test(t)?i:-1).filter(i=>i>=0);return ix});
ck(au.length>=2&&au[au.length-1]-au[0]===au.length-1,'Ibn Kathir Arabic tafsirs together '+au);
console.log(bad.length?'FAIL '+bad.join('|'):'PASS heading_ornaments');await b.close();process.exit(bad.length?1:0)})();
