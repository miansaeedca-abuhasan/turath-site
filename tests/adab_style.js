const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:780}});let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/adabaali/n/1');await p.waitForSelector('.card .mt.ar',{timeout:30000});await p.waitForTimeout(2000);
const r=await p.evaluate(()=>{const a=document.querySelector('a.hn.jn'),big=a,bc=document.querySelector('.bkcirc .bkc');return {t:a&&a.textContent,ul:a&&getComputedStyle(a).textDecorationLine,after:big&&getComputedStyle(big,'::after').content,br:big&&getComputedStyle(big).borderTopWidth,tr:[...document.querySelectorAll('.lchips .chip,.trrow .trbtn')].map(x=>x.textContent).join('|'),bc:bc&&bc.textContent,bcr:bc&&getComputedStyle(bc).borderRadius,tk:!!document.querySelector('.tkrow .tklab')}});
if((r.t||'').trim()!=='13827-')bad.push('number must be English digits «13827 -» '+r.t);if(r.bc!=='1')bad.push('circle number '+r.bc);if(r.ul!=='none')bad.push('underline');
if(!/صادق عمری/.test(r.tr||''))bad.push('translator '+r.tr);if(!r.tk)bad.push('tkrow');
await p.click('a.hn.jn');await p.waitForTimeout(4000);
const h=await p.evaluate(()=>({h:location.hash,b:localStorage.book}));if(h.b!=='jamik'||!/^#\/[ch]\//.test(h.h))bad.push('open full jami '+JSON.stringify(h));
console.log(bad.length?'FAIL '+bad.join('; '):'PASS adab_style');await b.close();process.exit(bad.length?1:0)})();
