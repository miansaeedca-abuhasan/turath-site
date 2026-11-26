// «القرآن: تدبر وعمل» (tadabburur / tadabburar / tadabburen): registry, rows, cleaned text, printed-page layout in the reader
const {chromium}=require('playwright'),fs=require('fs');let bad=[];
const reg=fs.readFileSync(__dirname+'/../coll/index.js','utf8'),A=JSON.parse(reg.slice(reg.indexOf('COLLS(')+6,reg.lastIndexOf(')')));
const idx=fs.readFileSync(__dirname+'/../index.html','utf8'),off=JSON.parse(fs.readFileSync(__dirname+'/../offline.json','utf8'));
const KL={tadabburur:'ur',tadabburar:'ar',tadabburen:'en'},ST='',refl={};
for(const [k,l] of Object.entries(KL)){const E=A.find(e=>e.key===k);if(!E){bad.push('not registered '+k);continue}
 if(E.count!==604||E.sections.length!==30||!E.prose||E.langs.join()!==l)bad.push('entry '+k);
 if(!new RegExp('"'+k+'":5').test(idx))bad.push('HB_CAT '+k);
 if(!off.groups.some(g=>g.id==='c_'+k))bad.push('offline '+k);
 let prev=0;E.files[l].forEach(f=>{if(f[0]!==prev+1)bad.push('gap '+f[2]);prev=f[1]});if(prev!==604)bad.push('files end '+k);
 const rows=[];E.files[l].forEach(f=>{const s=fs.readFileSync(__dirname+'/../coll/'+f[2],'utf8');rows.push(...JSON.parse(s.slice(s.indexOf(',',s.indexOf('"'+l+'"'))+1,-1)))});
 rows.forEach((r,i)=>{if(r[0]!==i+1)bad.push('id '+k+' '+r[0]);if(r[1][0]!=='§')bad.push('no page head '+k+' '+r[0]);
  const labs=[...r[1].matchAll(/(\w+)/g)].map(m=>m[1]),want=l==='ar'?['words','deeds','guid','refl']:['deeds','guid','refl','words'];
  if(labs.join()!==want.filter(x=>labs.includes(x)).join())bad.push('label order '+k+' '+r[0]);
  const plain=r[1].replace(/\ue027\w+/g,'').split('').filter(c=>!ST.includes(c)).join('');
  if(/[-]/.test(plain))bad.push('PUA glyph left '+k+' '+r[0]);
  if(l!=='en'&&/[0-9]/.test(plain))bad.push('ascii digit '+k+' '+r[0]);
  if(l==='ur'&&/[ﷺﷲ]/.test(plain))bad.push('symbol '+r[0]);
  if(l==='ur'&&/[A-Za-z]/.test(plain.replace(/message|Past continuous/g,'')))bad.push('latin '+r[0]);});
 refl[k]=rows.reduce((n,r)=>n+(r[1].match(//g)||[]).length,0);
 if(l==='ur'&&!rows[0][1].includes('اللہ سے دعا کیجئے'))bad.push('ur first row');
 if(l==='ar'&&!rows[0][1].startsWith('§الفاتحة\n\ue027words'))bad.push('ar first row');
 if(l==='en'&&!rows[0][1].includes('Start your supplication'))bad.push('en first row');
 if(l==='ar'&&!rows.some(r=>/﴿[^﴾]+﴾/.test(r[1])))bad.push('no verse marks in ar');}
if(new Set(Object.values(refl)).size!==1||refl.tadabburur<4000)bad.push('reflection counts '+JSON.stringify(refl));
if(/\(\?<[=!]/.test(idx.slice(idx.indexOf('const TD_KEYS'),idx.indexOf('// several numbered reports'))))bad.push('lookbehind in tadItem');
(async()=>{const b=await chromium.launch();
for(const [k,ui,lab,qsel] of [['tadabburur','ur','آیات پر عمل','.qayah'],['tadabburar','ar','معاني الكلمات','.qayah'],['tadabburen','en','Acting on the Verses',null]]){
 const p=await(await b.newContext({viewport:{width:430,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript((u)=>{try{localStorage.ui=u;localStorage.newsSeen='20261125b';localStorage.newsDay=new Date().toDateString()}catch(e){}},ui);
 await p.goto('http://localhost:8765/index.html#/s/'+k+'/1');await p.waitForSelector('.td',{timeout:30000}).catch(()=>{});await p.waitForTimeout(800);
 const r=await p.evaluate(q=>({pages:document.querySelectorAll('.td').length,lab:(document.querySelector('.tdlab')||{}).textContent,circ:document.querySelectorAll('.td .tdn').length,ans:document.querySelectorAll('.td .tdans').length,tbl:document.querySelectorAll('.td table.tdw tr').length,blue:q?document.querySelectorAll('.td '+q).length:1,head:(document.querySelector('.tdsur')||{}).textContent}),qsel);
 if(r.pages<20)bad.push(k+' pages '+r.pages);if(r.lab!==lab)bad.push(k+' first label '+r.lab);if(r.circ<20||r.ans<5||r.tbl<4||!r.blue)bad.push(k+' layout '+JSON.stringify(r));
 if(!/الفاتح|Fatih/.test(r.head||''))bad.push(k+' head '+r.head);
 if(errs.length)bad.push(k+' js error '+errs[0]);
 if(ui==='ur'){const c=await p.evaluate(()=>{const q=document.querySelector('.td .qayah'),l=document.querySelector('.td .tdlab'),n=document.querySelector('.td .tdq2');return [q&&getComputedStyle(q).color,l&&getComputedStyle(l).backgroundColor,n&&getComputedStyle(n).color]});
  if(c[0]!=='rgb(79, 166, 230)'||c[1]!=='rgb(200, 80, 90)'||c[2]!=='rgb(138, 39, 144)')bad.push('colours '+c.join('|'));}
 await p.goto('http://localhost:8765/index.html#/s/'+k+'?idx');await p.waitForSelector('.snum',{timeout:25000});const n=await p.$$eval('.snum',x=>x.length);if(n!==30)bad.push(k+' index '+n);
 await p.context().close();}
await b.close();console.log(bad.length?'FAIL '+bad.slice(0,15).join(' | '):'PASS tadabbur_book');process.exit(bad.length?1:0)})();
