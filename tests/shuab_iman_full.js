// Shu'ab al-Iman (Urdu, Maulana Qazi Malik Muhammad Ismail, Darul Isha'at Karachi): 11145 rows, Arabic from the library book `shuabiman`, opens on phone and desktop (owner file 26-11-2026)
const fs=require('fs'),{chromium,devices}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const rd=(k,l)=>fs.readdirSync('coll').filter(f=>f.startsWith(k+'_'+l+'_')).sort((a,b)=>+a.split('_')[2]-+b.split('_')[2]).flatMap(f=>{const s=fs.readFileSync('coll/'+f,'utf8');return JSON.parse(s.slice(s.indexOf(',[[')+1,s.lastIndexOf(')')))});
const ar=rd('shuabimanur','ar'),ur=rd('shuabimanur','ur'),lib=rd('shuabiman','ar');
ck(ar.length===11145&&ur.length===11145,'11145 rows ar/ur');
ck(ur.every((r,i)=>r[0]===i+1)&&ar.every((r,i)=>r[0]===i+1),'ids sequential');
ck(ur.every(r=>!/[A-Za-z@#$_]/.test(r[1]+(r[3]?(r[3].k||''):''))),'no stray latin in translation / takhrij');
ck(ur.every(r=>!/ﷺ|ؓ|ؒ|ؑ|ﷻ/.test(r[1])),'no symbols');
ck(ur.every(r=>r[1].length>10),'no empty translation');
ck(ur.every(r=>!r[3]||!r[3].k||/\(1\)\s*$/.test(r[1])),'takhrij mark (1) present when takhrij exists');
const L=new Set(lib.map(r=>r[1]));const withAr=ar.filter(r=>r[1]);
ck(withAr.length===10370,'10370 rows carry the library Arabic');
ck(withAr.every(r=>L.has(r[1])),'every Arabic text is copied verbatim from the library book');
ck(new Set(withAr.map(r=>r[1])).size===withAr.length,'no library row used twice');
ck(ar[0][1]===lib[0][1],'row 1 = first library hadith');
ck(/ابو عبد اللہ حافظ|ابو عبد اللہ/.test(ur[0][1])||ur[0][1].length>50,'row 1 Urdu present');
const idx=fs.readFileSync('coll/index.js','utf8');const A=JSON.parse(idx.slice(idx.indexOf('COLLS(')+6,idx.lastIndexOf(')'))),E=A.find(e=>e.key==='shuabimanur');
ck(E&&E.count===11145&&E.sections[0][2]===1&&E.sections[E.sections.length-1][3]===11145,'registered, sections cover all rows');
ck(E.sections.every((s,i)=>i===0||s[2]===E.sections[i-1][3]+1),'sections are contiguous');
ck(E.showpub&&/اسماعیل/.test(E.trn.ur)&&/دارالاشاعت/.test(E.pub.ur),'translator, publisher');
ck(A.findIndex(e=>e.key==='shuabimanur')>=A.length-8,'is among the newest books at the end');
ck(/shuabimanur":10/.test(fs.readFileSync('index.html','utf8')),'HB_CAT');
ck(/shuabimanur/.test(fs.readFileSync('news.json','utf8')),'news line present (owner asked 27-11-2026)');
(async()=>{const b=await chromium.launch();
for(const [name,o] of [['phone',{...devices['Pixel 5']}],['desktop',{viewport:{width:1280,height:900}}]]){
const c=await b.newContext({...o,serviceWorkers:'block'});const p=await c.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('newsSeen','20261126a');localStorage.setItem('ui','ur')}catch(e){}});
const open=async(h,re)=>{await p.goto('http://localhost:8765/#'+h);await p.reload();await p.waitForFunction(r=>new RegExp(r).test(document.body.innerText),re,{timeout:40000}).catch(()=>{});return p.evaluate(()=>document.body.innerText)};
let t=await open('/s/shuabimanur/n/1','حمدويه|حَمْدَوَيْهِ');ck(/حَمْدَوَيْهِ/.test(t),name+': hadith 1 opens with Arabic');
t=await open('/s/shuabimanur/n/2816','تحقیق و تخریج');ck(/تحقیق و تخریج/.test(t)&&/قدموں کے نشان/.test(t),name+': hadith 2816 shows takhrij and bab heading');
t=await open('/s/shuabimanur/n/11145','11145');ck(/11145/.test(t),name+': last hadith opens');
await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS shuab_iman_full')})();
