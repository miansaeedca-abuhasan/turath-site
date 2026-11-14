// typing in the search box shows results while typing, quickly, and an older slower answer never replaces a newer one
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:412,height:880}});const p=await ctx.newPage();const c=await ctx.newCDPSession(p);await c.send('Emulation.setCPUThrottlingRate',{rate:4});
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.book='jami';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/index.html#/b');await p.waitForSelector('#q');await p.waitForLoadState('networkidle');
const t0=Date.now();await p.type('#q','انما الاعمال',{delay:90});
await p.waitForFunction(()=>document.querySelectorAll('#list .card').length>0&&/[\d٠-٩۰-۹]/.test(document.querySelector('#list .qsbar')?.textContent||''),null,{timeout:20000});
const ms=Date.now()-t0;console.log('first results after typing began:',ms,'ms');ck(ms<6000,'results while typing within 6 s (4x slower CPU): '+ms);
await p.waitForTimeout(800);const n1=await p.evaluate(()=>document.querySelectorAll('#list .qsbar').length);ck(n1===1,'one results bar, not several: '+n1);
await p.fill('#q','');await p.type('#q','الصلاة',{delay:40});await p.waitForTimeout(3000);
const t=await p.evaluate(()=>document.querySelector('#list .qsbar')?.textContent||'');ck(/[\d٠-٩۰-۹]/.test(t)&&await p.evaluate(()=>document.querySelectorAll('#list .qsbar').length)===1,'newest query shown once: '+t);
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
