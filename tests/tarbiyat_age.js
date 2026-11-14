// Tarbiyat by age: runs the REAL functions/api/tarbiyat.js on an in-memory SQLite shaped like D1, and drives tarbiyat.html in a browser
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
  s.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});s.end(fs.readFileSync(f))}).listen(8767);
 const call=async(a,d)=>{const r=await fetch('http://localhost:8767/api/tarbiyat',{method:'POST',body:JSON.stringify({a,...d})});return {s:r.status,...(await r.json())}};
 const c=await call('create',{family:'گھر',kids:[{n:'چھوٹا',a:5,s:'b'},{n:'درمیانہ',a:8,s:'b'},{n:'بڑا',a:12,s:'b'},{n:'بالغہ',a:15,s:'g'}]});
 if(!c.kids){console.log('create failed',JSON.stringify(c));process.exit(1)}
 const [k5,k8,k12,g15]=c.kids;
 const st=await call('state',{token:c.token});
 ok(st.kids.map(k=>k.age).join()==='5,8,12,15'&&st.kids[3].sex==='g'&&st.kids.every(k=>!k.bal),'ages and sex are stored and returned');
 const fajr=c.acts.find(a=>a.key==='fajr');const day=new Date().toISOString().slice(0,10);
 // exemption days: only for a grown-up girl
 ok((await call('mark',{token:c.token,kid:g15.id,act:0,day,n:1})).s===400,'no exemption before puberty is set');
 ok((await call('kidinfo',{token:c.token,kid:g15.id,age:15,sex:'g',bal:1})).ok,'parent sets age/sex/puberty');
 ok((await call('mark',{token:c.token,kid:g15.id,act:0,day,n:1})).ok,'parent marks an exemption day for a grown-up girl');
 ok((await call('mark',{token:c.token,kid:k12.id,act:0,day,n:1})).s===400,'a boy cannot get an exemption day');
 const lg=await call('login',{code:g15.code});
 ok((await call('mark',{token:lg.token,kid:g15.id,act:0,day,n:0})).ok&&(await call('mark',{token:lg.token,kid:g15.id,act:0,day,n:1})).ok,'the girl marks and clears her own exemption day');
 const mk=await call('marks',{token:c.token,from:day,to:day});ok(mk.marks.some(m=>m[0]===g15.id&&m[1]===0),'exemption day is stored as act 0');
 ok((await call('kidinfo',{token:c.token,kid:k5.id,age:99,sex:'x',bal:0})).ok,'bad age/sex are cleaned, not stored');
 const st2=await call('state',{token:c.token});ok(st2.kids[0].age===null&&st2.kids[0].sex==='','age out of range → empty, unknown sex → empty');
 await call('kidinfo',{token:c.token,kid:k5.id,age:5,sex:'b',bal:0});
 const st3=await call('state',{token:c.token});ok(st3.kids[3].sfrom===day,'the strict rules start counting from the day the rules were set (never backwards)');
 // back-date the start so the browser test has past weeks to look at
 await env.DB.prepare("UPDATE t_kid SET sfrom='2020-01-01'").run();
 const b=await chromium.launch(),p=await b.newPage({viewport:{width:390,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8767/tarbiyat.html');await p.fill('#code',c.parentCode);await p.click('button:text-is("داخل ہوں")');await p.waitForSelector('table.ch');
 await p.click('.nav button >> nth=0');await p.waitForTimeout(500);   // last week: every day is past
 const pick=async n=>{await p.click('.chips button:text-is("'+n+'")');await p.waitForTimeout(600)};
 const minus=()=>p.$$eval('table.ch tbody button',a=>a.filter(x=>/^−/.test(x.textContent)).length);
 const half=()=>p.$$eval('table.ch tbody button',a=>a.filter(x=>x.textContent==='−½').length);
 const tags=()=>p.$$eval('table.ch tbody th .tag',a=>a.map(x=>x.textContent));
 ok(await p.$$eval('.upd',a=>a.length)===0,'no update notice while every child has an age and son/daughter');
 await pick('چھوٹا');ok(await half()===35&&await minus()===35,'under 7: every unmarked past prayer cuts HALF a point (35 boxes show −½)');
 ok((await tags()).includes('ضروری نہیں')&&(await tags()).includes('پڑھیں، اجر ملے گا'),'under 7: prayer tag «half a point», Surah Kahf «read and earn the reward»');
 ok(await p.$$eval('.word',a=>a.some(x=>/سات برس سے کم/.test(x.textContent))),'under 7: explanation shown');
 ok(/۱۷½/.test(await p.$eval('table.ch tr.sum td:last-child',e=>e.textContent)),'under 7: the week total shows 17½ minus points');
 await pick('درمیانہ');ok(await minus()===35&&await half()===0,'7–10: every unmarked past prayer cuts 1 point (35), no Kahf point');
 ok((await tags()).includes('فرض نہیں'),'7–10 tag');
 await pick('بڑا');ok(await minus()===36,'over 10: 35 prayers + the Friday Surah Kahf are minus (36)');
 ok(/۳۶/.test(await p.$eval('table.ch tr.sum td:last-child',e=>e.textContent)),'over 10: the week total shows the 36 minus points');
 ok(await p.$$eval('table.ch tbody button.pen',a=>a.every(x=>/pc/.test(x.getAttribute('style')||'')))&&await p.$$eval('table.ch tbody tr[style*="--rc"]',a=>a.length)>=12,'coloured rows and thin coloured rings');
 if(process.env.SHOT)await p.screenshot({path:process.env.SHOT+'/age_o.png',fullPage:true});
 await pick('بالغہ');ok(await minus()===36,'grown-up girl: 36 minus before exemption');
 ok(await p.$$eval('table.ch tr.ex',a=>a.length)===1,'grown-up girl has the exemption row');
 await p.click('table.ch tr.ex td button:not([disabled]) >> nth=0');await p.waitForTimeout(700);
 ok(await minus()===31&&await p.$$eval('table.ch td .lock',a=>a.filter(x=>x.textContent==='رخصت').length)===5,'one exemption day: 5 prayers show «leave» and their 5 minus points disappear');
 await pick('بڑا');ok(await p.$$eval('table.ch tr.ex',a=>a.length)===0,'boy has no exemption row');
 // the certificate target leaves out exemption days and, under 7, prayers
 await call('addkid',{token:c.token,name:'نیا',age:'',sex:''});await p.reload();await p.fill('#code',c.parentCode);await p.click('button:text-is("داخل ہوں")');await p.waitForSelector('table.ch');
 ok(await p.$$eval('.upd',a=>a.length)===1&&await p.$eval('.upd',e=>/نیا/.test(e.textContent)),'a child without age/sex → a parent notice asks to fill it');
 await p.click('.tabs button:has-text("ترتیبات")');await p.waitForTimeout(500);
 ok(await p.$$eval('details.pmsg li',a=>a.length)===7&&await p.$eval('details.pmsg',e=>/آدھا پوائنٹ/.test(e.textContent)&&/بانی بھی نہیں/.test(e.textContent)&&/چار ہفتے/.test(e.textContent)&&/ابو حسن میاں سعید عفی اللہ عنہ/.test(e.textContent)),'the parents message with its 7 points, privacy and 4-week lines, and the founder name');
 await p.click('.tabs button:has-text("چارٹ")');await p.waitForTimeout(500);
 await pick('چھوٹا');await p.click('.tabs button:has-text("سرٹیفکیٹ")');await p.waitForTimeout(800);ok(await p.$$eval('.cert',a=>a.length)>=1,'certificate opens for a child under 7 (prayers are left out of the target)');await p.click('.tabs button:has-text("ترتیبات")');await p.waitForTimeout(700);ok(await p.$$eval('input[placeholder="عمر (سال)"]',a=>a.length)>=5&&await p.$$eval('input[type=checkbox]',a=>a.length)===5,'settings: an age box, boy/girl and puberty tick for every child, and an age box for a new child');
 ok(errs.length===0,'no page errors '+errs.join('|'));
 await b.close();console.log(bad.length?'FAILED':'PASS');process.exit(bad.length?1:0)})();
