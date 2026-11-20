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
 const c=await call('create',{family:'گھر',kids:['علی']});const ali=c.kids[0];
 const pl=await call('login',{code:c.parentCode});
 const b=await chromium.launch(),p=await b.newPage({viewport:{width:390,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8766/tarbiyat.html');
 await p.fill('#code',c.parentCode);await p.click('button:text-is("داخل ہوں")');await p.waitForSelector('table.ch');
 // watch: the page must never go blank while a tick is saved
 await p.evaluate(()=>{window.__blank=0;new MutationObserver(()=>{if(!document.querySelector('#app table.ch'))window.__blank++}).observe(document.querySelector('#app'),{childList:true})});
 const cell='table.ch tbody tr:nth-child(1) td button:not([disabled])';
 await p.click(cell);await p.waitForFunction(s=>document.querySelector(s).textContent==='✓',cell,{timeout:4000});ok(true,'parent tick marks');
 await p.waitForTimeout(600);ok(await p.$eval(cell,e=>e.textContent)==='✓','tick stays after the page refreshes quietly');
 ok(await p.evaluate(()=>window.__blank)===0,'page never blank while saving a tick');
 await p.click(cell);await p.waitForFunction(s=>document.querySelector(s).textContent==='',cell,{timeout:4000});ok(true,'parent can untick by pressing again');
 ok(await p.evaluate(()=>window.__blank)===0,'page never blank while removing a tick');
 // minus row (third category chips): cycle and the small remove button
 await p.click('.chips button:nth-child(3)');await p.waitForSelector('table.ch');
 const neg='table.ch tbody tr.neg td button:not([disabled])';
 if(await p.$(neg)){await p.click(neg);await p.waitForTimeout(700);const clr='button[title="نشان ہٹائیں"]';ok(await p.$(clr)!==null,'minus mark shows a remove button');await p.click(clr);await p.waitForTimeout(700);ok(await p.$(clr)===null,'remove button clears the minus mark');}
 ok(!errs.length,'no page errors '+errs.join('|'));
 await b.close();process.exit(bad.length?1:(console.log('PASS tarbiyat_mark_stays'),0));
})();
