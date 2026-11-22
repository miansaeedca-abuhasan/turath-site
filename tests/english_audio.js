// English audio: hadith button + read-along, chapter button + chapter mode (Book 1); audio host is stubbed
const {chromium}=require('playwright');const fs=require('fs');
// the audio host must be allowed by the site's Content-Security-Policy (media-src), or the browser blocks the audio
{const h=fs.readFileSync(__dirname+'/../_headers','utf8').match(/media-src ([^;]*);/);const idx=fs.readFileSync(__dirname+'/../audio/en/idx.js','utf8');
 const hosts=[...new Set([...idx.matchAll(/"hbase":"(https:\/\/[^\/"]+)/g)].map(m=>m[1]))];
 hosts.forEach(x=>{if(!h||!h[1].split(/\s+/).includes(x)){console.log('FAIL CSP media-src lacks',x);process.exit(1)}});}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:420,height:860}});let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
await p.addInitScript(()=>{localStorage.ui='en'});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const mp3=fs.readFileSync(__dirname+'/../audio/en/ch/1/02.mp3');
await p.route('https://audio.jami-al-kamil.com/**',r=>r.fulfill({body:mp3,contentType:'audio/mpeg'}));
await p.goto('http://localhost:8765/#/c/1/0');await p.waitForTimeout(2500);
ck(await p.evaluate(()=>[...document.querySelectorAll('button.lbtn')].some(x=>x.textContent.includes('🔊'))),'chapter button');
const hb=await p.evaluate(()=>[...document.querySelectorAll('.acts button')].filter(x=>x.textContent==='🔊'&&!x.hidden).length);ck(hb>=1,'hadith button');
await p.evaluate(()=>[...document.querySelectorAll('.acts button')].find(x=>x.textContent==='🔊'&&!x.hidden).click());await p.waitForTimeout(2500);
ck(await p.evaluate(()=>document.querySelectorAll('.enra span').length)>50,'read-along words');
ck(await p.evaluate(()=>!!document.querySelector('.enbar')),'bar');
await p.evaluate(()=>ENAUD.stop());ck(await p.evaluate(()=>!document.querySelector('.enbar')),'stop');
await p.evaluate(()=>[...document.querySelectorAll('button.lbtn')].find(x=>x.textContent.includes('🔊')).click());await p.waitForTimeout(1500);
ck(await p.evaluate(()=>document.querySelector('.enbar b').textContent)==='Chapter title','chapter starts with the title');
// a hadith without audio gets no button
// Book 2: hadith 22–446 play; word times exist for 22–100 (the rest play without highlighting); durations come from the real files
ck(await p.evaluate(async()=>{await ENAUD.ready();return ENAUD.has(22)&&ENAUD.has(859)&&ENAUD.has(860)&&ENAUD.has(1102)&&ENAUD.has(1103)&&ENAUD.has(1309)&&ENAUD.has(1310)&&ENAUD.has(1446)&&ENAUD.has(1447)&&ENAUD.has(1504)&&ENAUD.has(1505)&&ENAUD.has(1541)&&ENAUD.has(1542)&&ENAUD.has(1648)&&ENAUD.has(1649)&&ENAUD.has(1703)&&ENAUD.has(1704)&&ENAUD.has(1723)&&ENAUD.has(1724)&&ENAUD.has(3029)&&ENAUD.has(3030)&&ENAUD.has(3157)&&ENAUD.has(3158)&&ENAUD.has(3215)&&ENAUD.has(3216)&&ENAUD.has(3359)&&ENAUD.has(3360)&&ENAUD.has(3906)&&ENAUD.has(3907)&&ENAUD.has(4292)&&ENAUD.has(4293)&&ENAUD.has(4713)&&ENAUD.has(4714)&&ENAUD.has(5402)&&ENAUD.has(5403)&&ENAUD.has(5906)&&ENAUD.has(5907)&&ENAUD.has(5939)&&ENAUD.has(5940)&&ENAUD.has(5961)&&ENAUD.has(5962)&&ENAUD.has(6033)&&!ENAUD.has(6034)&&ENAUD.has(21)}),'audio range 22-6033 (Books 1-20)');
await p.goto('http://localhost:8765/#/h/6034');await p.waitForTimeout(500);await p.reload();await p.waitForTimeout(3500);
ck(await p.evaluate(()=>![...document.querySelectorAll('.acts button')].some(x=>x.textContent==='🔊'&&!x.hidden)),'no button without audio');
ck(!errs.length,'page errors '+errs);console.log(bad?'FAIL':'PASS english_audio');await b.close();process.exit(bad?1:0)})();
