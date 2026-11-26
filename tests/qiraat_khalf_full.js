// القراءة خلف الإمام (Bayhaqi), Urdu tr. Amanullah Asim: 453 narrations, 18 babs, notes, wording rules, opens on phone and desktop (owner file 26-11-2026)
const fs=require('fs'),{chromium,devices}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const rd=(k,l)=>fs.readdirSync('coll').filter(f=>f.startsWith(k+'_'+l+'_')).sort((a,b)=>+a.split('_')[2]-+b.split('_')[2]).flatMap(f=>{const s=fs.readFileSync('coll/'+f,'utf8');return JSON.parse(s.slice(s.indexOf(',[[')+1,s.lastIndexOf(')')))});
const ar=rd('qiraatkhalfur','ar'),ur=rd('qiraatkhalfur','ur');
ck(ar.length===453&&ur.length===453,'453 rows ar/ur');
ck(ur.every((r,i)=>r[0]===i+1)&&ar.every((r,i)=>r[0]===i+1),'ids sequential');
ck(ur.every(r=>!/[A-Za-z@#$_]/.test(r[1])),'no stray latin in translation');
ck(ur.every(r=>!/ﷺ|ؓ|ؒ|ؑ|[①-⑳❶-❿\x01]/.test(r[1]+(r[3]?r[3].f:''))),'no symbols / unconverted marks');
ck(ur.every(r=>{const m=[...r[1].matchAll(/ \((\d{1,2})\)/g)].map(x=>+x[1]);const n=r[3]?(r[3].f.match(/\n\(\d+\) /g)||[]).length:0;return m.length===n&&m.every((x,i)=>x===i+1)}),'every (n) mark has its note and vice versa');
ck(ar.every(r=>/[ً-ْ]/.test(r[1])&&!/\(\(|\)\)/.test(r[1])&&!/^\[/.test(r[1])),'Arabic vocalised, no [n] prefix');
ck(ur.filter(r=>r[1].length<40).length===0,'no empty translation');
const idx=fs.readFileSync('coll/index.js','utf8');const A=JSON.parse(idx.slice(idx.indexOf('COLLS(')+6,idx.lastIndexOf(')'))),E=A.find(e=>e.key==='qiraatkhalfur');
ck(E&&E.count===453&&E.sections.length===18&&E.sections[0][2]===1&&E.sections[17][3]===453,'registered, 18 babs');
ck(E.intro.length>=8&&E.showpub&&/عاصم/.test(E.trn.ur)&&/انصار/.test(E.pub.ur),'intro, translator, publisher');
ck(/qiraatkhalfur":7/.test(fs.readFileSync('index.html','utf8')),'HB_CAT');
(async()=>{const b=await chromium.launch();
for(const [name,o] of [['phone',{...devices['Pixel 5']}],['desktop',{viewport:{width:1280,height:900}}]]){
const c=await b.newContext({...o,serviceWorkers:'block'});const p=await c.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('newsSeen','20261126a');localStorage.setItem('ui','ur')}catch(e){}});
const open=async(h,re)=>{await p.goto('http://localhost:8765/#'+h);await p.reload();await p.waitForFunction(r=>new RegExp(r).test(document.body.innerText),re,{timeout:40000}).catch(()=>{});return p.evaluate(()=>document.body.innerText)};
let t=await open('/s/qiraatkhalfur/n/1','حواشی|اس روایت کی سند صحیح');
ck(/أَخْبَرَنَا/.test(t)&&/قیام اللیل نفل ہے/.test(t),name+': narration 1 Arabic + heading');
t=await open('/s/qiraatkhalfur/n/453','453');ck(/453/.test(t),name+': narration 453 opens');
t=await open('/s/qiraatkhalfur?idx','عرض ناشر');ck(/عرض ناشر/.test(t)&&/تقریظ/.test(t)&&/قرآن کی قرآت نماز کا رکن/.test(t),name+': contents with intro and babs');
await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS qiraat_khalf_full')})();
