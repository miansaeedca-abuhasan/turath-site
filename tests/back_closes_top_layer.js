const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage();let bad=[];
await p.goto('http://localhost:8765/index.html#/q');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const h0=location.hash;const o=document.createElement('div');o.className='rpbg';document.body.append(o);window.BKL(o);return h0});
await p.goBack();await p.waitForTimeout(400);
const st=await p.evaluate(()=>({hash:location.hash,ov:!!document.querySelector('.rpbg')}));
if(st.ov)bad.push('overlay stays');if(st.hash!==r)bad.push('page went back '+st.hash);
console.log(bad.length?'FAIL '+bad:'OK back_closes_top_layer');await b.close();process.exit(bad.length?1:0)})();
