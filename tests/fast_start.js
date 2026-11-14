// Startup must not download the 50 MB Jami text (data/d*.js); the books list comes from data/meta.js, which must equal the engine's answer
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const br=await chromium.launch();
for(const h of ['#/','#/s/adabaali?idx','#/s/siyar?idx']){const pg=await br.newPage();const L=[];pg.on('request',r=>L.push(r.url()));
 await pg.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
 await pg.goto('http://localhost:8765/index.html'+h);await pg.waitForLoadState('networkidle');await pg.waitForTimeout(4500);
 ck(!L.some(u=>/data\/d\d+\.js/.test(u)),h+': no data/d*.js at startup');
 ck(await pg.evaluate(()=>!!window.TURATH_META&&Array.isArray(BOOKS)&&BOOKS.length>=4),h+': books list ready');await pg.close()}
const pg=await br.newPage();await pg.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await pg.goto('http://localhost:8765/index.html#/');await pg.waitForLoadState('networkidle');
const r=await pg.evaluate(async()=>{const m=JSON.stringify(window.TURATH_META.booksList);await window.needData();window.ENGINE_READY=null;const e=JSON.stringify((await window.localApi('books')).books);
 const D=window.TURATH_DATA,M=window.TURATH_META,same=Object.keys(M).filter(k=>k!=='booksList'&&JSON.stringify(M[k])!==JSON.stringify(D[k]));
 const hr=D.hadith.filter(h=>h.refs&&h.refs.length).length;return{m,e,same,hr,mr:Object.keys(window.TURATH_REFS).length}});
ck(r.m===r.e,'meta books list equals the engine list');ck(r.same.length===0,'meta equals data/d*.js: '+r.same);ck(r.hr===r.mr,'refs complete '+r.hr+'/'+r.mr);
await pg.goto('http://localhost:8765/index.html#/h/26');await pg.waitForSelector('.card',{timeout:60000});
ck(await pg.evaluate(()=>document.body.innerText.length>200),'a Jami hadith opens');
await br.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
