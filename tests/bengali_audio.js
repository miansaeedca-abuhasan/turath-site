// Bengali audio: Books 1-39 (hadith 1-7312) play only when the app is in Bengali; word times load from audio/bn; other UIs keep English audio
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const idx=fs.readFileSync(__dirname+'/../audio/en/idx.js','utf8');const j=JSON.parse(idx.slice(idx.indexOf('(')+1,idx.lastIndexOf(')')));
ck(Object.keys(j.bn.books).length===39,'39 Bengali books');let prev=0,n=0;for(let k=1;k<=39;k++){const x=j.bn.books[k];ck(x&&x.from===prev+1,'contiguous book '+k);prev=x.to;n+=Object.keys(x.h).length;ck(fs.existsSync(__dirname+'/../audio/bn/w'+k+'.js'),'word file '+k)}
ck(prev===7312&&n===7312,"7312 hadith");
const mp3=fs.readFileSync(__dirname+'/../audio/en/ch/1/02.mp3');
for(const ui of ['bn','ur']){const p=await b.newPage({viewport:{width:420,height:860}});await p.addInitScript(u=>{localStorage.ui=u},ui);const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('https://audio.jami-al-kamil.com/**',r=>r.fulfill({body:mp3,contentType:'audio/mpeg'}));
await p.goto('http://localhost:8765/#/c/1/0');await p.waitForTimeout(2500);
const r=await p.evaluate(async()=>{await ENAUD.ready();return [ENAUD.has(1),ENAUD.has(6636),ENAUD.has(6637),ENAUD.has(7000)]});
ck(r[0]&&r[1]&&r[2]&&r[3],ui+' has audio (Bengali in bn, English elsewhere / after 6636) '+r);
if(ui==='bn'){ck(r[3],'English continues after Bengali range');
 let url='';p.on('request',q=>{if(q.url().includes('audio.jami-al-kamil.com'))url=q.url()});
 await p.evaluate(()=>ENAUD.hadith(1,document.querySelector('.card')));await p.waitForTimeout(2000);
 ck(url.includes('/bn/1.mp3'),'Bengali url '+url);ck(await p.evaluate(()=>document.querySelectorAll('.enra span').length)>5,'read-along words');}
else{let url='';p.on('request',q=>{if(q.url().includes('audio.jami-al-kamil.com'))url=q.url()});await p.evaluate(()=>ENAUD.hadith(1,document.querySelector('.card')));await p.waitForTimeout(2000);ck(url.includes('/en/1.mp3'),'English url in '+ui+' '+url)}
ck(!errs.length,'page errors '+errs);await p.close()}
console.log(bad?'FAIL':'PASS bengali_audio');await b.close();process.exit(bad?1:0)})();
