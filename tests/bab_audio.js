// owner 24-11-2026: bab (chapter) audio of the English Talkhis from archive.org, 61 kitabs whose counts equal the owner's list
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad=1;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:420,height:900}})).newPage();await p.addInitScript(()=>{localStorage.ui='en'});
await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.ENAUD&&ENAUD.babUrl,null,{timeout:20000});
const r=await p.evaluate(()=>{let n=0,held=[];const cnt=[13,359,77,52,19,19,45,9,421,48,22,46,216,131,145,248,186,14,10,21,27,17,23,139,29,4,15,4,11,8,44,49,41,6,49,30,13,17,3,50,20,46,149,22,41,32,105,679,292,19,5,52,30,199,23,15,46,15,46,1119,467,55,91,16,113,53,98];
for(let k=1;k<=67;k++){if([60,66,67].includes(k))continue;let c=0;for(let o=1;o<=cnt[k-1]+1;o++){if(ENAUD.babUrl(k,o))c++}if(c==cnt[k-1])n+=c;else if(c==0)held.push(k);else held.push('bad'+k)}
return {n,held,ex:ENAUD.babUrl(2,5),first:ENAUD.babUrl(1,1),last:'https://archive.org/download/book1-67_chapter1-end/book67_chapter0098.mp3',over:ENAUD.babUrl(1,14)}});
ck(r.n===4182,'links '+r.n);ck(r.held.join()==='47,48,49','held '+r.held);
ck(r.ex==='https://archive.org/download/book1-67_chapter1-end/book02_chapter0005.mp3','example '+r.ex);
ck(r.first.endsWith('book01_chapter0001.mp3'),'first');ck(r.over===null,'over');
// button appears on a chapter of the Talkhis kitab 2 (English) and plays the archive link

const info=await p.evaluate(async()=>{await ENAUD.ready();return await ENAUD.chapterInfo(2,5,[])});
ck(info&&info.minutes===0,'info '+JSON.stringify(info));
await p.route('https://archive.org/**',r=>r.fulfill({body:require('fs').readFileSync(__dirname+'/../audio/en/ch/1/02.mp3'),contentType:'audio/mpeg'}));
await p.goto('http://localhost:8765/#/c/2/4');await p.waitForTimeout(3500);
ck(await p.evaluate(()=>[...document.querySelectorAll('button.lbtn')].some(x=>x.textContent.includes('🔊'))),'chapter button on book 2 bab 5');
await p.evaluate(()=>[...document.querySelectorAll('button.lbtn')].find(x=>x.textContent.includes('🔊')).click());await p.waitForTimeout(1200);
ck(await p.evaluate(()=>document.querySelector('.enbar b')&&document.querySelector('.enbar b').textContent)==='Chapter title','bab audio starts as chapter title');
await p.goto('http://localhost:8765/#/c/47/0');await p.waitForTimeout(2500);
ck(!await p.evaluate(()=>[...document.querySelectorAll('button.lbtn')].some(x=>x.textContent.includes('🔊')&&x.textContent.includes('chapter'))),'held kitab 47 has no bab button');
console.log(bad?'FAIL':'OK bab_audio');await b.close();process.exit(bad)})();
