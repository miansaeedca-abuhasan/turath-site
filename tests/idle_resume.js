// Speed + «where you left off»: the hadith book list opens without the 8 MB index (counts are known in advance, and guarded here), the index is fetched quietly afterwards,
// a visit left for more than half an hour opens at the main page (a short break keeps the place), and a book offers «جہاں چھوڑا تھا وہیں سے پڑھیں»
const {chromium}=require('playwright');const fs=require('fs');let bad=[];const ok=(c,m)=>{if(!c)bad.push(m)};
(async()=>{const b=await chromium.launch();
const mk=async(init)=>{const ctx=await b.newContext({viewport:{width:412,height:860}});const p=await ctx.newPage();p.on('pageerror',e=>bad.push('pageerror '+e.message));
 await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString());localStorage.nosplash='1';const n=Date.now;window.__off=0;Date.now=()=>n.call(Date)+window.__off});
 if(init)await p.addInitScript(init);return p};
// 1. the hadith book list needs no hadith index
let p=await mk();const got=[];p.on('response',r=>{if(/data\/hl\.js/.test(r.url()))got.push(Date.now())});
await p.goto('http://localhost:8765/#/hb');const t0=Date.now();await p.waitForSelector('.srow, .srow2, .brow, #list .card',{timeout:30000});const tRow=Date.now()-t0;
ok(got.length===0,'the hadith book list opened before the 8 MB index was requested');
// 2. the index is fetched quietly afterwards
await p.waitForFunction(()=>performance.getEntriesByType('resource').some(r=>/data\/hl\.js/.test(r.name)),null,{timeout:20000}).catch(()=>{});
ok(await p.evaluate(()=>performance.getEntriesByType('resource').some(r=>/data\/hl\.js/.test(r.name))),'the hadith index is prefetched after the page is up');
// 3. the static counts equal the real ones
const live=await p.evaluate(async()=>{await window.needData();const o={};for(const k of ['jami','jamik','tuhfa'])o[k]=(await window.localApi('list?limit=1&book='+k)).total;return o});
const src=fs.readFileSync('index.html','utf8'),m=src.match(/const HBC0=(\{[^}]*\})/);const st=m&&eval('('+m[1]+')');
ok(st&&Object.keys(live).every(k=>st[k]===live[k]),'static counts equal the real totals: '+JSON.stringify(st)+' vs '+JSON.stringify(live));
await p.context().close();
// 4. idle: long absence → main page; short break → same place
p=await mk();await p.goto('http://localhost:8765/#/s/siyar/54');await p.waitForTimeout(2500);
const away=async(min)=>{await p.evaluate(()=>{Object.defineProperty(document,'hidden',{get:()=>true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
 await p.evaluate(m=>{window.__off+=m*60000;Object.defineProperty(document,'hidden',{get:()=>false,configurable:true});document.dispatchEvent(new Event('visibilitychange'))},min);await p.waitForTimeout(400)};
await away(5);ok(await p.evaluate(()=>location.hash)==='#/s/siyar/54','a 5-minute break keeps the same place');
await p.evaluate(()=>document.body.classList.add('withplayer'));await away(60);ok(await p.evaluate(()=>location.hash)==='#/s/siyar/54','while audio plays the place is kept');
await p.evaluate(()=>document.body.classList.remove('withplayer'));await away(40);ok(await p.evaluate(()=>location.hash)==='#/','40 minutes away → the main page opens');
await p.context().close();
// 5. a reload long after → main page
p=await mk(()=>{if(sessionStorage.old)localStorage.tkAct=String(Date.now()-3*3600000)});await p.goto('http://localhost:8765/#/s/siyar/54');await p.waitForTimeout(1500);
await p.evaluate(()=>{sessionStorage.old='1'});await p.reload();await p.waitForTimeout(1500);
ok(await p.evaluate(()=>location.hash)==='#/','a reload hours later opens the main page');
await p.evaluate(()=>{sessionStorage.removeItem('old')});await p.goto('http://localhost:8765/#/s/siyar/54');await p.reload();await p.waitForTimeout(1500);
ok(await p.evaluate(()=>location.hash)==='#/s/siyar/54','a reload a minute later keeps the place');
// a link opened freshly is never redirected
await p.evaluate(()=>{sessionStorage.old='1'});await p.goto('http://localhost:8765/#/s/siyar/55');await p.waitForTimeout(1500);
ok(await p.evaluate(()=>location.hash)==='#/s/siyar/55','a link that is opened is honoured');
await p.context().close();
// 6. a book offers «continue where you left off»
p=await mk(()=>{localStorage['bl:siyar']='#/s/siyar/54';localStorage['bl:jami']='#/h/5'});
await p.goto('http://localhost:8765/#/s/siyar?idx');await p.waitForSelector('.bkresume',{timeout:30000});
ok(await p.evaluate(()=>{const a=document.querySelector('.bkresume');return a.getAttribute('href')==='#/s/siyar/54'&&/جہاں چھوڑا تھا وہیں سے پڑھیں/.test(a.textContent)}),'a collection book offers the resume link');
await p.evaluate(()=>{localStorage.book='jami'});await p.goto('http://localhost:8765/#/b');await p.reload();await p.waitForSelector('.bkresume',{timeout:30000});
ok(await p.evaluate(()=>{const a=document.querySelector('.bkresume');return a&&a.getAttribute('href')==='#/h/5'}),'a hadith book offers the resume link');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
