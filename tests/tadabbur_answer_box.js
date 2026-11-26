// owner 26-11-2026: «جواب» in «القرآن: تدبر وعمل» opens a window; save shows the answer in place (per browser); edit / delete; unbefitting words are wiped from the box
const {chromium}=require('playwright');let bad=[];
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:412,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{if(!sessionStorage.s){sessionStorage.s=1;localStorage.clear()}localStorage.ui='ur';localStorage.newsSeen='20261125b';localStorage.newsDay=new Date().toDateString()}catch(e){}});
await p.goto('http://localhost:8765/index.html#/s/tadabburur/1');await p.waitForSelector('.tdans',{timeout:30000});await p.waitForTimeout(800);
await p.click('.tdans');if(!await p.$('.tdov textarea'))bad.push('no window');
await p.fill('.tdov textarea','اللہ کی حمد');await p.click('.tdov .tdsv');await p.waitForTimeout(200);
if(await p.$('.tdov'))bad.push('window stays');if(!/اللہ کی حمد/.test(await p.textContent('.tdans .tdat')))bad.push('answer not shown');
await p.reload();await p.waitForSelector('.tdans');await p.waitForTimeout(800);if(!/اللہ کی حمد/.test(await p.textContent('.tdans .tdat')))bad.push('not kept');
await p.click('.tdans');await p.type('.tdov textarea',' you are a bitch');await p.waitForTimeout(100);const v1=await p.inputValue('.tdov textarea');if(v1!=='')bad.push('bad english kept: '+v1);if(await p.isHidden('.tdov .tdmsg'))bad.push('no warning');
await p.fill('.tdov textarea','');await p.type('.tdov textarea','یہ حرامزادہ ہے');const v2=await p.inputValue('.tdov textarea');if(/حرامزاد/.test(v2))bad.push('bad urdu kept: '+v2);
await p.fill('.tdov textarea','اصحاب کہف کا کتا اور خنزیر حرام ہے');await p.dispatchEvent('.tdov textarea','input');if(await p.inputValue('.tdov textarea')==='')bad.push('fair words wiped');
await p.fill('.tdov textarea','نئی بات');await p.click('.tdov .tdsv');if(!/نئی بات/.test(await p.textContent('.tdans .tdat')))bad.push('edit');
await p.click('.tdans');await p.click('.tdov .tdde');if((await p.textContent('.tdans .tdat'))!=='')bad.push('delete');
const other=await p.$$eval('.tdans .tdat',x=>x.filter(e=>e.textContent).length);if(other)bad.push('shows in other places '+other);
// Back closes only the window; the page behind stays (owner 26-11-2026)
{const h0=await p.evaluate(()=>location.hash);await p.click('.tdans');await p.waitForSelector('.tdov');await p.goBack();await p.waitForTimeout(500);
 if(await p.$('.tdov'))bad.push('back did not close window');const h1=await p.evaluate(()=>location.hash);if(h1!==h0||!await p.$('.tdans'))bad.push('back left the page '+h0+' -> '+h1);
 await p.click('.tdans');await p.waitForSelector('.tdov');await p.click('.tdov .tdcl');await p.waitForTimeout(500);const h2=await p.evaluate(()=>location.hash);if(await p.$('.tdov')||h2!==h0)bad.push('close button '+h2);
 await p.goBack();await p.waitForTimeout(500);if((await p.evaluate(()=>location.hash))===h0&&0)bad.push('x');}
if(errs.length)bad.push('js '+errs[0]);await b.close();console.log(bad.length?'FAIL '+bad.join(' | '):'OK');process.exit(bad.length?1:0)})();
