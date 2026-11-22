// Owner report 21-11-2026: offline download "stops there". Now: a failed file is retried, the failure stays visible on screen
// (not overwritten by the storage line), a stalled file never hangs, other packs keep going.
const {chromium,devices}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();
for(const [name,o] of [['phone',{...devices['Pixel 5']}],['desktop',{viewport:{width:1280,height:900}}]]){
const c=await b.newContext({...o,serviceWorkers:'block'});const p=await c.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('newsSeen','20261121a');localStorage.setItem('ui','ur')}catch(e){}});
const man=await (await fetch('http://localhost:8765/offline.json')).json();
const g=man.groups.filter(x=>x.k==='tafsir')[1];const badFile=g.f[0][2]||g.f[0][0];
const bn=badFile.split('?')[0].split('/').pop();await p.route(u=>u.pathname.endsWith(bn),r=>r.fulfill({status:500,body:'x'}));
await p.goto('http://localhost:8765/');await p.waitForTimeout(3500);
await p.evaluate(()=>OFFLINE.open());await p.waitForTimeout(600);
const i=await p.$$eval('label.srow',(l,n)=>l.findIndex(x=>x.innerText.includes(n)),g.n.ur);
await p.locator('label.srow input').nth(i).check();
await p.getByRole('button',{name:'محفوظ کریں'}).last().click();
await p.waitForFunction(()=>/دوبارہ دبائیں/.test(document.querySelector('.sheetbg').innerText),null,{timeout:60000}).catch(()=>{});
const t=await p.evaluate(()=>document.querySelector('.sheetbg').innerText);
if(!/دوبارہ دبائیں/.test(t))console.log(badFile,t.slice(-300));ck(/دوبارہ دبائیں/.test(t)&&t.includes(g.n.ur),name+' failure message names the pack and stays visible');
ck(/استعمال شدہ/.test(t),name+' storage line still shown');
await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS offline_failure_visible')})();
