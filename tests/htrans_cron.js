// daily background translation job: picks the right books, keeps its place (cursor), stops after N new translations, never touches Urdu-translated books / Jami
const http=require('http'),{spawn}=require('child_process');const sp=(env)=>new Promise(res=>{const c=spawn('node',['tools/htrans_cron.js'],{env:Object.assign({},process.env,env)});let o='',e='';c.stdout.on('data',d=>o+=d);c.stderr.on('data',d=>e+=d);const t=setTimeout(()=>c.kill(),150000);c.on('close',s=>{clearTimeout(t);res({status:s,stdout:o,stderr:e})})});let bad=[];const ck=(c,m)=>{if(!c)bad.push(m)};
let cursor=0,seen=[],keys=new Set();
const srv=http.createServer((q,r)=>{let b='';q.on('data',d=>b+=d);q.on('end',()=>{const j=JSON.parse(b||'{}');r.setHeader('Content-Type','application/json');
 if(q.headers['x-cron-key']!=='k1'){r.statusCode=403;return r.end('{}')}
 if(j.op==='cursor'){if(Number.isInteger(j.set))cursor=j.set;return r.end(JSON.stringify({pos:cursor}))}
 seen.push(j.ar);const was=keys.has(j.ar);keys.add(j.ar);r.end(JSON.stringify({ur:'ترجمہ',saved:was}))})}).listen(0,async()=>{
 const port=srv.address().port;
 const run=()=>sp({SITE:'http://127.0.0.1:'+port,HTRANS_CRON:'k1',N:'9',CONC:'3'});
 let o=await run();ck(o.status===0,'run 1 exit '+o.status+o.stderr);const c1=cursor,n1=seen.length;ck(c1>0&&n1>=9,'run 1 advanced ('+c1+','+n1+')');
 o=await run();ck(o.status===0,'run 2 exit');ck(cursor>c1,'run 2 goes on after run 1 ('+c1+' -> '+cursor+')');
 const dup=seen.slice(n1).filter(x=>seen.slice(0,n1).includes(x));ck(dup.length===0,'run 2 does not repeat run 1 texts ('+dup.length+')');
 ck(seen.every(t=>/[ء-ي]/.test(t)),'only Arabic texts sent');
 const bad2=await sp({SITE:'http://127.0.0.1:'+port,HTRANS_CRON:'wrong',N:'3'});
 ck(bad2.status===3,'wrong key: the job stops at once ('+bad2.status+')');ck(!/new translations/.test(bad2.stdout),'wrong key translates nothing');
 srv.close();console.log(bad.length?'FAIL '+bad.join(' | '):'PASS htrans_cron');process.exit(bad.length?1:0)});
