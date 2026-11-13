// the chosen tafsir shows under the translation of each ayah (list mode); with no tafsir chosen nothing extra shows
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){console.log('FAIL '+m);bad=1}};
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:430,height:900}});
const run=async(on)=>{await pg.addInitScript(on=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString());localStorage.qset=JSON.stringify({mode:'tr',tafOn:on,tafsir:'ur_ibnkathir',tr:['ur_junagarhi']})},on);
 await pg.goto('http://localhost:8765/index.html?'+Math.random()+'#/q/s/1');await pg.waitForSelector('.card.ayah',{timeout:30000});await pg.waitForTimeout(2500);
 return pg.evaluate(()=>{const c=document.querySelectorAll('.card.ayah');const i=document.querySelector('.card.ayah .intaf');return{n:c.length,has:!!i,txt:i?i.innerText.length:0,order:i?[...i.parentElement.children].map(x=>x.className.split(' ')[0]):[]}})};
const a=await run(true);ck(a.has&&a.txt>40,'tafsir text is shown inline '+JSON.stringify(a));
ck(a.order.indexOf('intaf')>a.order.indexOf('tbl')&&a.order.indexOf('intaf')<a.order.indexOf('acts'),'it sits below the translation, above the buttons '+a.order);
await br.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
