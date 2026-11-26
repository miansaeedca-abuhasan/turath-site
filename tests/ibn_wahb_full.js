// Muwatta Ibn Wahb (Urdu): 521 hadith, 8 kutub, structure, wording rules, opens on phone and desktop (owner file 26-11-2026)
const fs=require('fs'),{chromium,devices}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const rd=(k,l)=>fs.readdirSync('coll').filter(f=>f.startsWith(k+'_'+l+'_')).sort((a,b)=>+a.split('_')[2]-+b.split('_')[2]).flatMap(f=>{const s=fs.readFileSync('coll/'+f,'utf8');return JSON.parse(s.slice(s.indexOf(',[[')+1,s.lastIndexOf(')')))});
const ar=rd('ibnwahbur','ar'),ur=rd('ibnwahbur','ur');
ck(ar.length===521&&ur.length===521,'521 rows ar/ur');
ck(ur.every((r,i)=>r[0]===i+1)&&ar.every((r,i)=>r[0]===i+1),'ids sequential 1..521');
ck(ur.every(r=>/ \(1\)$/.test(r[1])&&r[3]&&/^\(1\) /.test(r[3].k)),'each row: footnote mark + takhrij');
ck(ur.every(r=>!/[A-Za-z@#$_]/.test(r[1])),'no stray latin in translation');
ck(ur.every(r=>!/ﷺ|ؓ|ؒ|ؑ/.test(r[1]+r[3].k)),'no honorific symbols');
ck(ur.every(r=>!/"|“|”/.test(r[1])),'no straight/curly quotes left in translation');
ck(ar.every(r=>/[ً-ْ]/.test(r[1])&&!/\(\(|\)\)/.test(r[1])&&!/[ٹڈڑںےۓہھگچپژکی]/.test(r[1].replace(/[ء-يً-ْ\s.،:؟«»()\-]/g,''))),'Arabic vocalised, no Urdu honorific letters, no double brackets');
ck(ar.every(r=>/[.:؟»)\]]$/.test(r[1])),'Arabic ends with a full stop');
ck(ur.filter(r=>/کتاب[^()]{0,60}باب[^()]{0,80}حدیث\s*:/.test(r[3].k)).length<=3,'takhrij short form «book (number)» (only forms like 907/1 stay)');
const idx=fs.readFileSync('coll/index.js','utf8');ck(/"key":"ibnwahbur"/.test(idx)&&/"count":521/.test(idx),'registered');
const A=JSON.parse(idx.slice(idx.indexOf('COLLS(')+6,idx.lastIndexOf(')'))),E=A.find(e=>e.key==='ibnwahbur');
ck(E.sections.length===8&&E.sections[0][2]===1&&E.sections[7][3]===521&&E.intro.length===3,'8 kutub, 3 intro parts');
ck(/ibnwahbur":7/.test(fs.readFileSync('index.html','utf8')),'HB_CAT');
(async()=>{const b=await chromium.launch();
for(const [name,o] of [['phone',{...devices['Pixel 5']}],['desktop',{viewport:{width:1280,height:900}}]]){
const c=await b.newContext({...o,serviceWorkers:'block'});const p=await c.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('newsSeen','20261126a');localStorage.setItem('ui','ur')}catch(e){}});
const open=async(h,re)=>{await p.goto('http://localhost:8765/#'+h);await p.reload();await p.waitForFunction(r=>new RegExp(r).test(document.body.innerText),re,{timeout:40000}).catch(()=>{});return p.evaluate(()=>document.body.innerText)};
let t=await open('/s/ibnwahbur/n/1','مُردہ|زندہ ہے');
ck(/يَحْيَى بْنُ أَيُّوبَ/.test(t)&&/جی ہاں/.test(t)&&/تحقیق و تخریج/.test(t),name+': hadith 1 Arabic, Urdu, takhrij');
t=await open('/s/ibnwahbur/n/521','521');ck(/521/.test(t),name+': hadith 521 opens');
t=await open('/s/ibnwahbur?idx','عرض ناشر');ck(/عرض ناشر/.test(t)&&/تقریظ/.test(t),name+': contents with intro');
await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS ibn_wahb_full')})();
