// owner 24-11-2026: no saved-ayat / saved-hadith tiles on home; order seerah | sahaba | salaf | topics
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad=1;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:420,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.newsSeen='20261122a';localStorage.newsDay=new Date().toDateString();localStorage.ui='ur';localStorage.lang='ur'}catch(e){}});
await p.goto('http://localhost:8765/index.html');await p.waitForSelector('.tile',{timeout:20000});await p.waitForTimeout(1500);
const t=await p.evaluate(()=>[...document.querySelectorAll('.tiles .tile')].map(x=>(x.querySelector('img')?.getAttribute('src')||'').replace(/^.*\//,'').replace('.png','')));
ck(!t.includes('saved_ayat')&&!t.includes('saved_hadith'),'no saved tiles on home: '+t);
ck(t.slice(0,4).join()==='quran,tilawat_audio,tafsir,seerah','row1 '+t.slice(0,4));
ck(t.slice(4,8).join()==='hadith_books,jami_full,talkhis,sahaba','row2 '+t.slice(4,8));
ck(t[8]==='siyar_salaf'&&t[9]==='topics'&&t[10]==='tuhfa_sharh','row3 '+t.slice(8,12));
await p.goto('http://localhost:8765/index.html#/q');await p.waitForTimeout(1500);ck(await p.evaluate(()=>!!document.querySelector('a[href="#/q/bm"]')),'saved verses still in the Quran page');
await p.goto('http://localhost:8765/index.html#/hb');await p.waitForTimeout(1500);ck(await p.evaluate(()=>!!document.querySelector('a[href="#/bm"]')),'saved hadith still in the hadith books page');
console.log(bad?'FAIL':'PASS home_tile_order');await b.close();process.exit(bad)})();
