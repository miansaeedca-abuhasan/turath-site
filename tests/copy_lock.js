// Guard: browser copy/right-click closed on the whole site (copy only from our bar); tarbiyat landing text.
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const bad=[];const b=await chromium.launch();
for(const [url,sel] of [['http://localhost:8765/index.html#/','body'],['http://localhost:8765/tarbiyat.html','body']]){
 const p=await b.newPage();await p.addInitScript(()=>{try{localStorage.nosplash='1'}catch(e){}});await p.goto(url);await p.waitForTimeout(1500);
 const r=await p.evaluate(()=>{const e=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});document.body.dispatchEvent(e);const c=new Event('copy',{bubbles:true,cancelable:true});document.body.dispatchEvent(c);
  const t=[...document.querySelectorAll('h1,h2,p,div,span,a')].find(x=>x.children.length===0&&(x.textContent||'').trim().length>8&&x.offsetWidth>0&&x.getBoundingClientRect().top>0&&x.getBoundingClientRect().top<innerHeight);const rg=document.createRange();rg.selectNodeContents(t);const s=getSelection();s.removeAllRanges();s.addRange(rg);return {ctx:e.defaultPrevented,cp:c.defaultPrevented}});
 if(!r.ctx)bad.push('contextmenu open '+url);if(!r.cp)bad.push('copy event open '+url);
 await p.waitForTimeout(500);
 const vis=await p.evaluate(()=>[...document.querySelectorAll('.selbar,.cpbar')].some(x=>!x.hidden&&x.offsetWidth>0));if(!vis)bad.push('copy bar missing '+url);
 if(url.includes('tarbiyat')){await p.waitForTimeout(500);const t=await p.evaluate(()=>document.body.innerText);if(!t.includes('خاندان کا اندراج')||/نیا خاندان بنائیں/.test(t))bad.push('tarbiyat landing text')}
 await p.close()}
await b.close();console.log(bad.length?'FAIL '+bad.join('; '):'PASS');process.exit(bad.length?1:0)})();
