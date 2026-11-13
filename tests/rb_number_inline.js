const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:780}});let bad=[];const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/hb');await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{if(!window.RB||!RB.hitCard)return null;const c=RB.hitCard(1,57,{html:'حدثنا فلان',page:0});const h=c.querySelector('.rbtxt .hn');return {t:h&&h.textContent,first:!!h&&h.parentElement.firstElementChild===h,hd:!!c.querySelector('.rbhd')}});
if(!r)bad.push('RB missing');else{if(r.t!=='57-')bad.push('number text '+r.t);if(!r.first)bad.push('not first in text');if(r.hd)bad.push('old header still there');}
if(errs.length)bad.push('js errors '+errs[0]);
console.log(bad.length?'FAIL '+bad.join('|'):'PASS rb_number_inline');await b.close()})();
