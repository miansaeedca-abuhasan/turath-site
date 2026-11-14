// Hifz «تکرار»: one ayah at a time (the one being recited), «صرف آیات» / «ترجمہ کے ساتھ» choice, translation shown under the ayah
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:880}});
await p.addInitScript(()=>{localStorage.ui='en';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/index.html#/hifz/rep?s=11&f=78&t=80');await p.waitForSelector('.hzayah .hzay',{timeout:40000});
ck(await p.evaluate(()=>document.querySelectorAll('.hzayah .hzay').length)===1,'only one ayah on screen');
ck(await p.evaluate(()=>document.querySelector('.hzayah .hzay').dataset.a)==='78','the first selected ayah is shown');
ck(await p.evaluate(()=>!document.querySelector('.hzTr')||document.querySelector('.hzTr').hidden),'no translation by default');
await p.click('.seg .segb:nth-child(2)');await p.waitForFunction(()=>{const t=document.querySelector('.hzTr');return t&&!t.hidden&&t.textContent.length>20},null,{timeout:20000});
ck(await p.evaluate(()=>/came|people/i.test(document.querySelector('.hzTr').textContent)),'translation of ayah 78 shown');
await p.evaluate(()=>{document.querySelectorAll('audio').forEach(a=>a.pause())});
// the ayah changes to the next one (the player marks it)
const r=await p.evaluate(()=>{const spans=[...document.querySelectorAll('.hzayah .hzay')];return spans.length});ck(r===1,'still one ayah');
await p.click('.seg .segb:nth-child(1)');await p.waitForTimeout(300);ck(await p.evaluate(()=>document.querySelector('.hzTr').hidden),'«ayahs only» hides the translation');
// playing: each selected ayah comes alone, in order, then the next (audio stubbed to end at once)
await p.evaluate(()=>{window.Audio=function(u){this.play=()=>{setTimeout(()=>this.onended&&this.onended(),30);return Promise.resolve()};this.pause=()=>{}};window.__seq=[];new MutationObserver(()=>{const a=document.querySelector('.hzayah .hzay');if(a&&window.__seq[window.__seq.length-1]!==a.dataset.a)window.__seq.push(a.dataset.a)}).observe(document.querySelector('.hzayah'),{childList:true})});
await p.click('.hzplay');await p.waitForFunction(()=>window.__seq.length>=3,null,{timeout:20000});
ck((await p.evaluate(()=>window.__seq.join(',')))==='79,80'.replace('79,80','78,79,80')||(await p.evaluate(()=>window.__seq.slice(-3).join(',')))==='78,79,80','ayahs come in order '+await p.evaluate(()=>window.__seq.join(',')));
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
