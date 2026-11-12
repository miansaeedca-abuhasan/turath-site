const {chromium}=require('playwright');let bad=[];const ck=(c,m)=>{if(!c)bad.push(m)};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>bad.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=new Date().toDateString()});
await p.goto('http://localhost:8765/#/s/fitan/1');await p.waitForSelector('#list .card',{timeout:20000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const L=document.querySelector('#list');const cards=[...L.querySelectorAll('article.card')];
 return {cards:cards.length,boxes:cards.map(c=>c.querySelectorAll('.babbox').length),trs:cards.map(c=>c.querySelectorAll('.babtr').length),top:!!document.querySelector('#list > p.ca'),
 chips:L.querySelectorAll('.chips .chip').length,rl:L.querySelectorAll('.rlink').length,tbox:cards[0]&&cards[0].querySelector('.tbox')?getComputedStyle(cards[0].querySelector('.tbox')).borderTopWidth:'none',cmp:L.querySelectorAll('.cmpgo').length}});
console.log(JSON.stringify(r));
ck(!r.top,'no Arabic heading detached at the top');
ck(r.boxes[0]===1&&r.trs[0]===1,'first hadith has Arabic heading and its translation together');
ck(r.cards<2||(r.boxes[1]===0&&r.trs[1]===0),'second hadith of the same chapter has no heading');
ck(r.chips===0,'no source buttons repeating the takhrij numbers');
ck(r.rl>=1,'takhrij numbers are links inside the line');
ck(r.tbox==='0px'||r.tbox==='none','translation without frame');
ck(r.cmp>=1,'compare button kept');
await p.goto('http://localhost:8765/#/s/fitan?idx');await p.waitForSelector('#csearch',{timeout:20000});ck(!(await p.$('.bknum')),'no extra number button');
console.log(bad.length?'FAIL '+bad.join('|'):'PASS');await b.close()})()
