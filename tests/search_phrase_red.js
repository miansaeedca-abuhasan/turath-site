// English search: exact-phrase mode marks only the words standing together (not every «your»), hit words are red (no band); results of the phrase contain the phrase
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.addInitScript(()=>{localStorage.ui='en';localStorage.gsmode='exact';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/search');await p.waitForTimeout(4000);
await p.evaluate(()=>{const i=[...document.querySelectorAll('input')].find(x=>x.offsetParent&&x.type!=='checkbox');i.value='Your mother';i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))});
await p.waitForTimeout(15000);
const r=await p.evaluate(()=>{const ms=[...document.querySelectorAll('mark.qhit')];const col=ms.length?getComputedStyle(ms[0]).color:'';const bg=ms.length?getComputedStyle(ms[0]).backgroundColor:'';
 const lone=ms.filter(m=>!/^(your|mother)/i.test(m.textContent.trim())).length;
 const pairs=ms.filter(m=>/^your/i.test(m.textContent.trim())&&!/^mother/i.test((m.nextSibling&&m.nextSibling.nextSibling&&m.nextSibling.nextSibling.textContent)||'')).length;
 return {n:ms.length,col,bg,lone,pairs,ex:ms.filter(m=>/^your/i.test(m.textContent.trim())).slice(0,4).map(m=>m.parentElement.innerText.replace(/\s+/g,' ').slice(0,160)+' ## '+JSON.stringify((m.nextSibling&&m.nextSibling.textContent)+'/'+(m.nextSibling&&m.nextSibling.nextSibling&&m.nextSibling.nextSibling.textContent)))}});
ck(r.n>0,'hit words are marked');ck(r.col==='rgb(192, 33, 26)','hit colour red '+r.col);ck(r.bg==='rgba(0, 0, 0, 0)','no band '+r.bg);ck(r.pairs===0,'a lone «your» is marked '+r.pairs+JSON.stringify(r.ex));
ck(!errs.length,'js errors '+errs[0]);await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
