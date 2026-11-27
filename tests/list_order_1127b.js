const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage();await p.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});
await p.goto('http://localhost:8765/index.html#/hb');await p.waitForSelector('.hbrow',{timeout:30000});await p.waitForTimeout(6000);
const r=await p.evaluate(()=>[...document.querySelectorAll('#list a')].map(a=>a.textContent));
const ix=s=>r.findIndex(x=>x.includes(s));let bad=[];
const a=ix('صحیح الجامع الصغیر'),s=ix('شمائل ترمذی'),rq=ix('الرحیق'),d=ix('دلائل النبوۃ للبیہقی'),f=ix('فضائل الصحابہ (امام احمد)'),u=ix('السنن الکبریٰ للنسائی');
if(!(a<s&&s<rq&&rq<d&&d<f&&f<u))bad.push('order '+[a,s,rq,d,f,u]);
if(ix('محدثین اندلس')>=0)bad.push('andalus in list');
await b.close();console.log(bad.length?'FAIL '+bad:'OK list_order_1127b');process.exit(bad.length?1:0)})();
