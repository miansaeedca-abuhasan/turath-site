// rulings in colour (sahih green, da'if orange, mawdu' red), small translator/section tabs, no doubled headings, takhrij full width on a phone
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
const go=async h=>{await p.goto('http://localhost:8765/'+h);await p.waitForSelector('.card',{timeout:25000});await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(n=>n.remove()));await p.waitForTimeout(1500)};
await go('#/s/shamail/1');
const r=await p.evaluate(()=>{const css=getComputedStyle(document.documentElement);const hd=document.querySelector('.ca'),bx=[...document.querySelectorAll('.babbox')].map(x=>x.textContent);
 return {ttl:document.querySelectorAll('.fttl').length,dir:getComputedStyle(document.querySelector('.tkrow')).flexDirection,tr:document.querySelector('.trrow .trbtn').offsetHeight,ft:document.querySelector('.ftab').offsetHeight,
 dupBab:bx.some(t=>hd&&t.replace(/[ً-ْ]/g,'').slice(0,30)===hd.textContent.slice(0,30))}});
ck(r.ttl===0,'no second heading above the sharh text');ck(r.dir==='column','takhrij stacked on a phone');ck(r.tr<32,'translator tab small '+r.tr);ck(r.ft<34,'section tab small '+r.ft);ck(!r.dupBab,'chapter title not repeated in the card');
await p.click('.ftab.e');await p.waitForTimeout(400);
ck(await p.evaluate(()=>{const h=document.querySelector('.fpanel.e h4.subh');return !!h&&parseFloat(getComputedStyle(h).borderBottomWidth)>=1}),'sharh headings underlined');
await go('#/s/abudawud/n/3');
ck(await p.evaluate(()=>{const e=document.querySelector('.agrade.gc-daif,.gc-daif');return !!e&&getComputedStyle(e).color==='rgb(217, 119, 6)'}),'da\'if is orange');
await go('#/s/abudawud/n/2');
ck(await p.evaluate(()=>!!document.querySelector('.gc-sahih')),'sahih is green');
ck(await p.evaluate(()=>{const g=window.GRADECAT;return g('موضوع')==='mawdu'}),'mawdu detected');
ck(await p.evaluate(()=>{const s=document.createElement('i');s.className='gc-mawdu';document.body.append(s);return getComputedStyle(s).color==='rgb(198, 40, 40)'}),'mawdu is red');
ck(!errs.length,'errors '+errs);await b.close();console.log(bad?'FAIL':'PASS grade_colors_cards')})();
