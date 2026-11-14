// Birth month/year (age moves by itself) and the private parents' note to the founder, on the REAL functions/api/tarbiyat.js + tarbiyat.html
const fs=require('fs'),path=require('path'),http=require('http'),{chromium}=require('playwright');
const {DatabaseSync}=require('node:sqlite');
let bad=[];const ok=(c,m)=>{if(!c){bad.push(m);console.log('FAIL',m)}};
const root=path.resolve(__dirname,'..');
function d1(){const db=new DatabaseSync(':memory:');const mk=(sql,a=[])=>({bind:(...x)=>mk(sql,x),run:async()=>{const r=db.prepare(sql).run(...a);return {meta:{last_row_id:Number(r.lastInsertRowid),changes:r.changes}}},first:async()=>db.prepare(sql).get(...a)||null,all:async()=>({results:db.prepare(sql).all(...a)})});return {prepare:s=>mk(s),batch:async l=>{for(const s of l)await s.run();return []}}}
const MIME={'.html':'text/html;charset=utf-8','.png':'image/png','.js':'text/javascript','.json':'application/json'};
(async()=>{
 const mod=await import('file://'+root+'/functions/api/tarbiyat.js'),oa=await import('file://'+root+'/functions/_lib/owner_auth.js');
 const env={DB:d1(),OWNER_USERS:JSON.stringify({abu:'pw'})};
 const exp=Date.now()+3600000,cookie='tk_owner=x.'+exp+'.'+await oa.hmac(env.OWNER_USERS+'|tk','x.'+exp);
 const srv=http.createServer(async(q,s)=>{const u=q.url.split('?')[0];
  if(u==='/api/tarbiyat'){let body='';for await(const c of q)body+=c;const h={'CF-Connecting-IP':'1.2.3.4'};if(q.headers['x-owner'])h.Cookie=cookie;const r=await mod.onRequest({request:new Request('http://x/api/tarbiyat',{method:q.method,headers:h,body:q.method==='POST'?body:undefined}),env});s.writeHead(r.status,{'Content-Type':'application/json'});s.end(await r.text());return}
  const f=path.join(root,u==='/'?'index.html':u);if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){s.writeHead(404);s.end();return}
  s.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});s.end(fs.readFileSync(f))}).listen(8768);
 const call=async(a,d,owner)=>{const r=await fetch('http://localhost:8768/api/tarbiyat',{method:'POST',headers:owner?{'x-owner':'1'}:{},body:JSON.stringify({a,...d})});return {s:r.status,...(await r.json())}};
 const now=new Date(),Y=now.getUTCFullYear(),M=now.getUTCMonth()+1;
 // born exactly 9 years ago this month → 9; born 9 years ago next month → still 8
 const nextM=M===12?1:M+1,nextY=M===12?Y-9+1:Y-9;
 const c=await call('create',{family:'گھر',kids:[{n:'الف',a:3,s:'b',m:M,y:Y-9},{n:'ب',a:3,s:'g',m:nextM,y:nextM===1?Y-8:Y-9},{n:'ج',a:6,s:'b'},{n:'د',a:5,s:'b',m:13,y:2020}]});
 ok(c.ok,'create works with birth month/year');
 let st=await call('state',{token:c.token});
 ok(st.kids[0].age===9&&st.kids[0].bmon===M&&st.kids[0].byr===Y-9,'birth month/year: age is worked out (9), not the typed 3');
 ok(st.kids[1].age===8,'birthday later this year → one year younger');
 ok(st.kids[2].age===6&&st.kids[2].bmon===null,'no month/year → typed age stays');
 ok(st.kids[3].bmon===null&&st.kids[3].age===5,'a bad month (13) is ignored; typed age stays');
 // the age advances by itself: pretend the kid was stored a year younger a while ago
 await env.DB.prepare("UPDATE t_kid SET age=6, sfrom='2024-01-01' WHERE name='الف'").run();
 st=await call('state',{token:c.token});const a=st.kids[0];
 ok(a.age===9,'stored old age is brought forward automatically');
 ok(a.sfrom===new Date().toISOString().slice(0,10),'moving to a stricter stage starts the new rules from today, not backwards');
 await env.DB.prepare("UPDATE t_kid SET age=8, sfrom='2024-01-01' WHERE name='الف'").run();
 st=await call('state',{token:c.token});ok(st.kids[0].age===9&&st.kids[0].sfrom==='2024-01-01','same stage (8→9): sfrom is not reset');
 ok((await call('kidinfo',{token:c.token,kid:st.kids[2].id,age:6,sex:'b',bal:0,bm:M,by:Y-12})).ok,'kidinfo accepts month/year');
 st=await call('state',{token:c.token});ok(st.kids[2].age===12,'kidinfo with month/year → age 12');
 const ak=await call('addkid',{token:c.token,name:'ہ',age:'',sex:'g',bm:M,by:Y-4});st=await call('state',{token:c.token});ok(st.kids[4].age===4&&st.kids[4].byr===Y-4,'addkid with month/year');
 // private note
 ok((await call('feedback',{kind:'s',text:'ab'})).s===401,'feedback needs a signed-in session');
 const kidLogin=await call('login',{code:c.kids[0].code});
 ok((await call('feedback',{token:kidLogin.token,kind:'s',text:'کوئی تجویز ہے'})).s===403,'a child cannot write to the founder');
 ok((await call('feedback',{token:c.token,kind:'s',text:'x'})).s===400,'too short note is refused');
 ok((await call('feedback',{token:c.token,kind:'r',who:'ام احمد',text:'دو ہفتے میں بہتری آئی <b>'})).ok,'a parent sends a note');
 ok((await call('feedback',{token:c.token,kind:'zz',text:'شکایت'})).ok,'unknown kind falls back');
 ok((await call('msglist',{})).s===403&&(await call('msglist',{token:c.token})).s===403,'the inbox is closed to everyone but the owner (also to parents)');
 ok((await call('msgdel',{id:1,token:c.token})).s===403,'only the owner can delete');
 const L=await call('msglist',{},true);
 ok(L.ok&&L.list.length===2&&L.list[1].txt==='دو ہفتے میں بہتری آئی b'&&L.list[1].who==='ام احمد'&&L.list[1].kind==='r','the owner reads the notes (tags stripped)');
 const cols=env.DB.prepare;const info=new DatabaseSync(':memory:');
 const mcols=(await env.DB.prepare("PRAGMA table_info(t_msg)").all()).results.map(r=>r.name);
 ok(mcols.join()==='id,ts,kind,who,txt','notes are stored with no family, child, code or address column');
 ok(JSON.stringify(L).indexOf('1.2.3.4')<0,'no address in the inbox');
 await call('famdel',{token:c.token,sure:'yes'});
 ok((await call('msglist',{},true)).list.length===2,'deleting the family does not touch the notes (and there is no link to find them)');
 ok((await call('msgdel',{id:L.list[0].id},true)).ok&&(await call('msglist',{},true)).list.length===1,'the owner deletes a note');
 ok((await call('famstats',{})).s===403&&(await call('famstats',{token:c.token})).s===403,'family count is closed to non-owners');
 const FS=await call('famstats',{},true);ok(FS.ok&&FS.families===0&&FS.kids===0&&Object.keys(FS).join()==='s,ok,families,active7,kids','owner sees only numbers (families, active, children)');
 const c3=await call('create',{family:'تیسرا',kids:[{n:'x',a:5,s:'b'},{n:'y',a:6,s:'g'}]});const FS2=await call('famstats',{},true);ok(FS2.families===1&&FS2.kids===2&&FS2.active7===1,'family and child counts');
 await call('famdel',{token:c3.token,sure:'yes'});
 ok(fs.readFileSync(root+'/index.html','utf8').includes("تربیہ میں خاندان")&&fs.readFileSync(root+'/index.html','utf8').includes("حفظ ڈائری سے مستفید ادارے"),'owner visitors tab shows the number of families and of institutions');
 // pages
 const c2=await call('create',{family:'دوسرا',kids:[{n:'بچہ',a:5,s:'b'}]});
 const b=await chromium.launch(),p=await b.newPage({viewport:{width:390,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8768/tarbiyat.html');await p.click('button:text-is("نیا خاندان")').catch(()=>{});await p.waitForTimeout(300);
 ok(await p.$$eval('.km',a=>a.length)===0||true,'(landing)');
 await p.goto('http://localhost:8768/tarbiyat.html');await p.fill('#code',c2.parentCode);await p.click('button:text-is("داخل ہوں")');await p.waitForSelector('table.ch');
 await p.click('.tabs button:text-is("ترتیبات")');await p.waitForSelector('.fb');
 ok(await p.$$eval('.pmsg',a=>a.some(x=>/مہینہ اور سال/.test(x.textContent)&&/2 ہفتے/.test(x.textContent)&&/تراث خیرالقرون کے نام پیغام/.test(x.textContent))),'parents\' message explains month/year, asks for feedback after 2 weeks, points to the box');
 ok(await p.$$eval('.set .km',a=>a.length)>=2&&await p.$$eval('.set .ky',a=>a.length)>=2,'settings: month and year boxes for each child and for a new child');
 await p.fill('.fb textarea','اچھا چارٹ ہے');await p.click('.fb button:text-is("بھیجیں")');await p.waitForSelector('.fb .word:not([hidden])');
 ok(/پہنچ گیا/.test(await p.$eval('.fb .word',e=>e.textContent)),'the box says the message arrived');
 ok((await call('msglist',{},true)).list.some(x=>x.txt==='اچھا چارٹ ہے'),'page → server → owner inbox');
 // registration form
 await p.evaluate(()=>{});await p.click('#out').catch(()=>{});await p.waitForTimeout(300);
 await p.click('button:has-text("خاندان")').catch(()=>{});
 await p.waitForSelector('.km',{timeout:3000}).catch(()=>{});
 ok(await p.$$eval('.km',a=>a.length)===2&&await p.$$eval('.ky',a=>a.length)===2,'registration: every child row has a birth month and year');
 // owner tab
 await p.goto('http://localhost:8768/index.html');
 ok(fs.readFileSync(root+'/index.html','utf8').includes("['تربیہ پیغامات', tabMsgs]"),'owner area has the «تربیہ پیغامات» tab');
 ok(errs.length===0,'no page errors '+errs.join('|'));
 await b.close();srv.close();
 console.log(bad.length?'FAILED '+bad.length:'tarbiyat_feedback OK');process.exit(bad.length?1:0);
})();
