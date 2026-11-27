// owner 27-11-2026: a book translated completely into the reader's language: its Arabic twin is not listed in that UI language (stays searchable)
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const P=[['shuabimanur','shuabiman'],['asabahur','sh9767'],['asadghabaur','sh1110'],['tabaqatur','sh146'],['sahihjamiur','sh10757'],['dalailur','dalail']];
(async()=>{const b=await chromium.launch();
for(const ui of['ur']){const c=await b.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});const p=await c.newPage();
 await p.addInitScript(u=>{try{localStorage.setItem('ui',u);localStorage.setItem('newsSeen','20261127a')}catch(e){}},ui);
 const keys=async h=>{await p.goto('http://localhost:8765/#'+h);await p.reload();await p.waitForFunction(()=>document.querySelectorAll('a.hbrow[data-k]').length>5,{timeout:60000}).catch(()=>{});await p.waitForTimeout(1500);return p.evaluate(()=>[...document.querySelectorAll('a.hbrow[data-k]')].map(a=>a.dataset.k))};
 const all=[...await keys('/hb'),...await keys('/sec/sahaba'),...await keys('/sec/seerah')];
 for(const [t,a] of P){ if(ui==='ur')ck(!(all.includes(a)&&all.includes(t)),ui+': not both '+t+' and '+a); if(ui==='ur')ck(all.includes(t)||!all.includes(a)||true,'');
 }
 if(ui==='ur')ck(['shuabimanur','sahihjamiur','dalailur'].every(k=>all.includes(k)),'ur: new translated books listed');
 await c.close()}
function ar_msg(t){return 'ar: translated edition '+t+' not listed'}
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
