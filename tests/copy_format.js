const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),ctx=await b.newContext({viewport:{width:360,height:780},permissions:['clipboard-read','clipboard-write']}),p=await ctx.newPage();let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/adabaali/n/2');await p.waitForSelector('.card .mt.ar',{timeout:30000});await p.waitForTimeout(2000);
await p.evaluate(()=>{window.__c=null;navigator.clipboard.writeText=async t=>{window.__c=t}});
await p.click('button.ab[title]:nth-of-type(1)',{timeout:3000}).catch(()=>{});
const btns=await p.$$('.acts button.ab');for(const x of btns){const t=await x.getAttribute('title');if(/کاپی|Copy|نسخ/.test(t||'')){await x.click();break}}
await p.waitForTimeout(800);
// choose plain copy if a menu appears
const mi=await p.$('.cpmenu button, .cpick button');if(mi)await mi.click();await p.waitForTimeout(800);
const t=await p.evaluate(()=>window.__c)||'';
const first=t.split('\n')[0];
if(!/^\d+\/2$/.test(first))bad.push('header '+first);if(/الادب العالی|\(2\)/.test(first))bad.push('book name in header');
if(!/الجامع الکامل \(\d+\)\./.test(t))bad.push('no jami ref in takhrij');if(/تلخیص/.test(t))bad.push('talkhis');
console.log(bad.length?'FAIL '+bad.join('; ')+'\n'+t.slice(0,300):'PASS copy_format');await b.close();process.exit(bad.length?1:0)})();
