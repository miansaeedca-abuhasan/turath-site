// owner 23-11-2026: «❖ ❖ ❖» after the text of each heading section (CSS-only, never copied)
const {chromium}=require('playwright'),fs=require('fs');let bad=[];const ck=(c,m)=>{if(!c)bad.push(m)};
ck(/\.secend::before\{content:"\\2756/.test(fs.readFileSync(__dirname+'/../index.html','utf8')),'css rule');
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:1100,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.newsSeen='20261122a';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur'}catch(e){}});
await p.goto('http://localhost:8765/index.html#/s/raheeq');await p.waitForTimeout(6000);
const r=await p.evaluate(()=>{const s=[...document.querySelectorAll('.secend')];return{n:s.length,txt:s.map(x=>x.textContent).join(''),before:s.every(x=>!x.nextElementSibling||x.nextElementSibling.matches('h4.subh,.phead')||!x.nextElementSibling.nextElementSibling),sel:getComputedStyle(s[0]).userSelect}});
ck(r.n>=2,'dividers present '+r.n);ck(r.txt==='','ornament is not text (not copied)');ck(r.before,'divider stands right before the next heading');ck(r.sel==='none','not selectable');
console.log(bad.length?'FAIL '+bad.join('|'):'PASS section_end_ornament');await b.close();process.exit(bad.length?1:0)})();
