// Guard: in translated books the takhrij is ONE paragraph, the notes of a hadith are ONE running box, and no reference lost «الرقم» («ال (2518)»)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{let bad=[];const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});
p.on('pageerror',e=>bad.push('pageerror '+e.message));await p.addInitScript(()=>{localStorage.ui='ur'});
for(const f of fs.readdirSync('coll').filter(x=>/^najm_ur_/.test(x))){const t=fs.readFileSync('coll/'+f,'utf8');if(/[،,]\s*ال\s*\(\d/.test(t))bad.push('broken «الرقم» in '+f)}
await p.goto('http://localhost:8765/#/s/najm/n/55');await p.waitForTimeout(6000);
await p.evaluate(()=>document.querySelectorAll('.sheetbg,.sheet,#ipop').forEach(x=>x.remove()));
const a=await p.evaluate(()=>({tk:document.querySelectorAll('.ptakh p').length,txt:(document.querySelector('.ptakh')||{}).innerText}));
if(a.tk!==1)bad.push('takhrij paragraphs '+a.tk);if(!/ترمذی \(2518\)/.test(a.txt||''))bad.push('takhrij text '+a.txt);
await p.goto('http://localhost:8765/#/s/najm/n/12');await p.waitForTimeout(6000);
await p.evaluate(()=>document.querySelectorAll('.sheetbg,.sheet,#ipop').forEach(x=>x.remove()));
const c=await p.evaluate(()=>({run:document.querySelectorAll('.pfnrun').length,ps:document.querySelectorAll('.pfnrun .pfn').length}));
if(c.run!==1||c.ps!==1)bad.push('notes not one running box '+JSON.stringify(c));
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
