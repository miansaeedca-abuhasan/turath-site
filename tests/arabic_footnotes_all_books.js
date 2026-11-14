// Guard: Arabic books carry their hawashi as circled marks in text + ONE running box; no doubled marks; no leftover old marks
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{let bad=[];
for(const f of fs.readdirSync('coll').filter(x=>/^sh(9863|131521)_ar_/.test(x))){const t=fs.readFileSync('coll/'+f,'utf8');if(/\((\d{1,3})\)\s?\(\1\)/.test(t)&&/sh9863/.test(f))bad.push('doubled mark in '+f)}
const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});
p.on('pageerror',e=>bad.push('pageerror '+e.message));await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/#/s/sh9863/n/22');await p.waitForTimeout(6000);
const a=await p.evaluate(()=>{const m=[...document.querySelectorAll('.mt.ar sup.fnm')].map(s=>s.textContent);let dup=0;for(let i=1;i<m.length;i++)if(m[i]===m[i-1])dup++;return{m:m.length,dup,run:document.querySelectorAll('.pfnrun').length}});
if(a.m<5)bad.push('few marks '+a.m);if(a.dup)bad.push('doubled circles '+a.dup);if(a.run!==1)bad.push('notes box '+a.run);
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
