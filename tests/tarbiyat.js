// Tarbiyat: runs the REAL functions/api/tarbiyat.js on an in-memory SQLite shaped like D1, and drives tarbiyat.html in a browser
const fs=require('fs'),path=require('path'),http=require('http'),{chromium}=require('playwright');
const {DatabaseSync}=require('node:sqlite');
let bad=[];const ok=(c,m)=>{if(!c){bad.push(m);console.log('FAIL',m)}};
const root=path.resolve(__dirname,'..');
function d1(){const db=new DatabaseSync(':memory:');const mk=(sql,a=[])=>({bind:(...x)=>mk(sql,x),run:async()=>{const r=db.prepare(sql).run(...a);return {meta:{last_row_id:Number(r.lastInsertRowid),changes:r.changes}}},first:async()=>db.prepare(sql).get(...a)||null,all:async()=>({results:db.prepare(sql).all(...a)})});return {prepare:s=>mk(s),batch:async l=>{for(const s of l)await s.run();return []}}}
const MIME={'.html':'text/html;charset=utf-8','.png':'image/png','.js':'text/javascript','.json':'application/json'};
(async()=>{
 const mod=await import('file://'+root+'/functions/api/tarbiyat.js');const env={DB:d1()};
 const srv=http.createServer(async(q,s)=>{const u=q.url.split('?')[0];
  if(u==='/api/tarbiyat'){let body='';for await(const c of q)body+=c;const r=await mod.onRequest({request:new Request('http://x/api/tarbiyat',{method:q.method,headers:{'CF-Connecting-IP':'1.2.3.4'},body:q.method==='POST'?body:undefined}),env});s.writeHead(r.status,{'Content-Type':'application/json'});s.end(await r.text());return}
  const f=path.join(root,u==='/'?'index.html':u);if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){s.writeHead(404);s.end();return}
  s.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});s.end(fs.readFileSync(f))}).listen(8766);
 const call=async(a,d)=>{const r=await fetch('http://localhost:8766/api/tarbiyat',{method:'POST',body:JSON.stringify({a,...d})});return {s:r.status,...(await r.json())}};
 // ---- server rules
 const c=await call('create',{family:'گھر',kids:['علی','احمد','فاطمہ']});
if(!c.kids){console.log('create failed',JSON.stringify(c));process.exit(1)}
 ok(c.parentCode&&c.parentCode.length===8,'parent code 8 chars');ok(c.kids.length===3&&c.kids.every(k=>k.code.length===6),'child codes');
 ok(c.acts&&c.acts.filter(a=>a.kind==='n').length===1&&c.acts.length>=9,'9 default rows incl. 1 negative');
 const [ali,ahmad]=c.kids,pos=c.acts.find(a=>a.kind==='p'),neg=c.acts.find(a=>a.kind==='n');
 const day=new Date().toISOString().slice(0,10);
 const lg=await call('login',{code:ali.code});ok(lg.token&&lg.role==='child'&&lg.kids.length===1,'child login sees only himself');
 ok((await call('mark',{token:lg.token,kid:ali.id,act:pos.id,day,n:2})).ok,'child marks own box');
 ok((await call('mark',{token:lg.token,kid:ahmad.id,act:pos.id,day,n:1})).s===403,'child cannot mark a sibling');
 ok((await call('mark',{token:lg.token,kid:ali.id,act:neg.id,day,n:1})).s===403,'child cannot write minus points');
 ok((await call('mark',{token:lg.token,kid:ali.id,act:pos.id,day:'2020-01-01',n:1})).s===403,'child cannot edit old days');
 ok((await call('mark',{token:lg.token,kid:ali.id,act:pos.id,day:'2099-01-01',n:1})).s===400,'future rejected');
 ok((await call('kidname',{token:lg.token,kid:ali.id,name:'x'})).s===403,'child cannot use parent actions');
 const mk=await call('marks',{token:lg.token,from:day,to:day});ok(mk.marks.length===1&&mk.marks[0][0]===ali.id,'child reads only own marks');
 const pl=await call('login',{code:c.parentCode});ok(pl.role==='parent'&&pl.kids.length===3,'parent login');
 ok((await call('mark',{token:pl.token,kid:ahmad.id,act:neg.id,day:'2020-01-01',n:3})).ok,'parent writes minus on any past day');
 const bad1=await call('login',{code:'AAAAAA'});ok(bad1.s===401||bad1.s===403||bad1.error==='login','wrong code refused');
 // weekly worship rows + friday-only rule on the server
 const wacts=c.acts.filter(a=>a.grp==='w'),kahf=c.acts.find(a=>a.key==='w_kahf');
 ok(wacts.length===10&&['fajr','zuhr','asr','maghrib','isha','w_am','w_pm','w_sleep','w_quran','w_kahf'].every(k=>wacts.some(a=>a.key===k)),'10 worship rows: 5 prayers, 3 adhkar, quran, kahf');
 ok(c.acts.filter(a=>a.grp==='a').length===9,'9 conduct rows');
 const nf=new Date(Date.now()-864e5*((new Date().getUTCDay()+2)%7)); // a recent non-friday day
 let nonFri=new Date();while(nonFri.getUTCDay()===5)nonFri=new Date(nonFri-864e5);const nfd=nonFri.toISOString().slice(0,10);
 ok((await call('mark',{token:pl.token,kid:ali.id,act:kahf.id,day:nfd,n:1})).s===400,'Surah Kahf row refuses a non-Friday');
 let fri=new Date();while(fri.getUTCDay()!==5)fri=new Date(fri-864e5);const frd=fri.toISOString().slice(0,10);
 ok((await call('mark',{token:pl.token,kid:ali.id,act:kahf.id,day:frd,n:1})).ok,'Surah Kahf row accepts Friday');
 // ---- browser
 const b=await chromium.launch(),p=await b.newPage({viewport:{width:390,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8766/tarbiyat.html');
 await p.fill('#code',ali.code);await p.click('button:text-is("داخل ہوں")');await p.waitForSelector('table.ch');
 ok(await p.$$eval('table.ch thead th',a=>a.length)===9,'weekly chart: name + 7 days + total');
 ok(await p.$$eval('table.ch tbody tr',a=>a.length)===22,'one chart: 10 worship + 9 conduct rows + 2 headings + total');
 ok(await p.$$eval('table.ch tbody tr',a=>a[0].className==='secr'&&a[11].className==='secr'),'worship first, conduct below');
 const dn=await p.$$eval('table.ch thead th',a=>a.slice(1,8).map(x=>x.querySelector('div').textContent));
 ok(['پیر','منگل','بدھ','جمعرات','جمعہ','ہفتہ','اتوار'].every(d=>dn.includes(d)),'Urdu day names');
 ok(await p.$$eval('table.ch tbody tr:nth-child(11) .lock',a=>a.length)===6,'Friday-only row shows 6 locked days');
 await p.click('table.ch tbody tr:nth-child(2) td button:not([disabled])');await p.waitForFunction(()=>document.querySelector('table.ch tbody tr:nth-child(2) td button:not([disabled])').textContent==='✓');ok(true,'tick works');
 if(process.env.SHOT)await p.screenshot({path:process.env.SHOT+'/week_ur.png',fullPage:true});
 ok(await p.$$eval('.tabs button',a=>a.map(x=>x.textContent).includes('ترتیبات'))===false,'child has no settings tab');
 ok(await p.$$eval('table.ch tr.neg button',a=>a.length>0&&a.every(x=>x.disabled)),'child minus row is locked');
 ok(await p.$$eval('table.ch thead th .kid',a=>a.length)===1,'child sees only own column');
 for(const t of ['کارکردگی','سرٹیفکیٹ']){await p.click('.tabs >> text='+t);await p.waitForTimeout(500)}
 ok(await p.$('.cert .nm')&&/علی/.test(await p.$eval('.cert .nm',e=>e.textContent)),'certificate has the name');
 ok(!/\[object/.test(await p.$eval('.cert',e=>e.textContent)),'certificate has no [object] text');
 await p.click('.tabs >> text=کارکردگی');await p.waitForSelector('svg.gr',{timeout:5000}).catch(async()=>{console.log('ERRS',errs,(await p.$eval('#app',e=>e.innerText)).slice(0,400));process.exit(1)});ok(true,'graph');
 for(const lab of ['ماہانہ','سہ ماہی','ششماہی','سالانہ']){await p.click('.chips >> text='+lab);await p.waitForSelector('svg.gr',{timeout:4000}).catch(async()=>{console.log('LAB',lab,errs,(await p.$eval('#app',e=>e.innerText)).slice(0,300));process.exit(1)})}
 // English
 await p.click('#lang');await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.documentElement.dir==='ltr'&&document.documentElement.lang==='en'),'English switches direction');
 await p.click('.tabs >> text=Chart');await p.waitForSelector('table.ch');
 if(process.env.SHOT)await p.screenshot({path:process.env.SHOT+'/week_en.png',fullPage:true});
 const en=await p.$eval('#app',e=>e.innerText);ok(/Fajr/.test(en)&&/Monday/.test(en)&&/Worship/.test(en)&&/Total/.test(en),'English chart text');
 ok(!/[؀-ۿ]/.test(en.replace(/[؀-ۿ]+\s*$/,'').replace(/علی/g,'')),'no Urdu left on the English chart page');
 await p.click('.tabs >> text=Certificate');await p.waitForSelector('.cert');
 const ce=await p.$eval('.cert',e=>e.innerText);ok(/Certificate/.test(ce)&&/star/i.test(ce)&&!/[؀-ۿ]/.test(ce.replace('علی','').replace('گھر','')),'English certificate');
 await p.click('#lang');await p.waitForTimeout(300);
 await p.click('#out');await p.waitForSelector('#code');
 await p.fill('#code',c.parentCode);await p.click('button:text-is("داخل ہوں")');await p.waitForSelector('table.ch');
 ok(await p.$$eval('.chips button',a=>a.filter(x=>['علی','احمد','فاطمہ'].includes(x.textContent)).length)===3,'parent sees 3 children on the weekly chart');
 ok(await p.$$eval('table.ch tr.neg button',a=>a.length===7&&a.some(x=>!x.disabled)),'parent can edit minus row');
 await p.click('.tabs >> text=سرٹیفکیٹ');await p.waitForSelector('.cert');await p.click('.chips >> text=احمد');await p.waitForTimeout(400);
 ok(/احمد/.test(await p.$eval('.cert .nm',e=>e.textContent)),'parent switches child on certificate');
 await p.click('.tabs >> text=ترتیبات');await p.waitForSelector('.set');
 ok(await p.$$eval('.set h2',a=>a.map(x=>x.textContent)).then(h=>h.includes('عبادات کے کام')&&h.includes('تربیتی کام')),'settings list both groups');
 const sw=await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2);ok(sw,'no horizontal page scroll on phone');
 ok(errs.length===0,'page errors: '+errs.join('|'));
 // tile on the home page
 const ix=fs.readFileSync(root+'/index.html','utf8');ok(/img:tarbiyat/.test(ix)&&/'tarbiyat\.html'/.test(ix)&&fs.existsSync(root+'/icons/tarbiyat.png'),'home tile + icon');
 await b.close();srv.close();
 console.log(bad.length?'FAILED '+bad.length:'PASS');process.exit(bad.length?1:0);
})();
