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
await p.goto('http://localhost:8765/#/h/30');await p.waitForTimeout(2000);
ck(await p.evaluate(()=>![...document.querySelectorAll('.acts button')].some(x=>x.textContent==='🔊'&&!x.hidden)),'no button without audio');
ck(!errs.length,'page errors '+errs);console.log(bad?'FAIL':'PASS english_audio');await b.close();process.exit(bad?1:0)})();
