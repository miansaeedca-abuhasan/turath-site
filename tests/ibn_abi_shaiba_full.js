// Musnad Ibn Abi Shaiba (Urdu, Muhammad Hussain Memon, Ansar as-Sunnah): 998 hadith, 282 musnads, wording rules, opens on phone and desktop (owner file 26-11-2026)
const fs=require('fs'),{chromium,devices}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const rd=(k,l)=>fs.readdirSync('coll').filter(f=>f.startsWith(k+'_'+l+'_')).sort((a,b)=>+a.split('_')[2]-+b.split('_')[2]).flatMap(f=>{const s=fs.readFileSync('coll/'+f,'utf8');return JSON.parse(s.slice(s.indexOf(',[[')+1,s.lastIndexOf(')')))});
const ar=rd('ibnabishaibaur','ar'),ur=rd('ibnabishaibaur','ur');
ck(ar.length===998&&ur.length===998,'998 rows ar/ur');
ck(ur.every((r,i)=>r[0]===i+1)&&ar.every((r,i)=>r[0]===i+1),'ids sequential');
ck(ur.every(r=>!/[A-Za-z@#$_]/.test(r[1])),'no stray latin in translation');
ck(ur.every(r=>!/ﷺ|ؓ|ؒ|ؑ/.test(r[1]+(r[3]?(r[3].f||'')+(r[3].k||''):''))),'no symbols');
ck(ur.every(r=>!r[3]||!r[3].k||/\(1\)\s*$/.test(r[1])),'takhrij mark (1) present when takhrij exists');
ck(ar.every(r=>/[ً-ْ]/.test(r[1])),'Arabic vocalised');
ck(ur.every(r=>r[1].length>10),'no empty translation');
const idx=fs.readFileSync('coll/index.js','utf8');const A=JSON.parse(idx.slice(idx.indexOf('COLLS(')+6,idx.lastIndexOf(')'))),E=A.find(e=>e.key==='ibnabishaibaur');
ck(E&&E.count===998&&E.sections.length===282&&E.sections[0][2]===1&&E.sections[281][3]===998,'registered, 282 musnads');
ck(E.showpub&&/میمن/.test(E.trn.ur)&&/انصار/.test(E.pub.ur),'translator, publisher');
ck(A.indexOf(E)>=A.length-4,'among the newest books at the end (owner 26-11-2026)');
ck(/ibnabishaibaur":14/.test(fs.readFileSync('index.html','utf8')),'HB_CAT');
ck(/ibnabishaibaur/.test(fs.readFileSync('news.json','utf8')),'announced in card 20261126a (owner 26-11-2026)');
(async()=>{const b=await chromium.launch();
for(const [name,o] of [['phone',{...devices['Pixel 5']}],['desktop',{viewport:{width:1280,height:900}}]]){
const c=await b.newContext({...o,serviceWorkers:'block'});const p=await c.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('newsSeen','20261126a');localStorage.setItem('ui','ur')}catch(e){}});
const open=async(h,re)=>{await p.goto('http://localhost:8765/#'+h);await p.reload();await p.waitForFunction(r=>new RegExp(r).test(document.body.innerText),re,{timeout:40000}).catch(()=>{});return p.evaluate(()=>document.body.innerText)};
let t=await open('/s/ibnabishaibaur/n/1','ابوایوب');
ck(/ابوایوب/.test(t)&&/لہسن/.test(t),name+': hadith 1 opens');
t=await open('/s/ibnabishaibaur/n/998','998');ck(/998/.test(t),name+': hadith 998 opens');
await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS ibn_abi_shaiba_full')})();
