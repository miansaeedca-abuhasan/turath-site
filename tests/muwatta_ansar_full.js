// Muwatta Imam Malik (Ansar as-Sunnah): 1851 numbered units (printed numbering 1..1852, the book itself has no number 1635), structure, wording rules, chapter notes, opens on phone and desktop
const fs=require('fs'),{chromium,devices}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const rd=(k,l)=>fs.readdirSync('coll').filter(f=>f.startsWith(k+'_'+l+'_')).sort((a,b)=>+a.split('_')[2]-+b.split('_')[2]).flatMap(f=>{const s=fs.readFileSync('coll/'+f,'utf8');return JSON.parse(s.slice(s.indexOf(',[[')+1,s.lastIndexOf(')')))});
const ar=rd('muwattaansar','ar'),ur=rd('muwattaansar','ur');
ck(ar.length===1851&&ur.length===1851,'1851 rows ar/ur: '+ar.length+'/'+ur.length);
ck(ur.every((r,i)=>i===0||r[0]>ur[i-1][0])&&ar.every((r,i)=>r[0]===ur[i][0]),'ids rise, same in ar and ur');
const have=new Set(ur.map(r=>r[0])),miss=[];for(let i=1;i<=1852;i++)if(!have.has(i))miss.push(i);
ck(JSON.stringify(miss)==='[1635]','only the number the printed book skips (1635) is missing: '+miss);
ck(ur.filter(r=>!(r[3]&&r[3].k&&/^\(1\) /.test(r[3].k)&&r[1].split('\n').some(l=>/ \(1\)$/.test(l)))).length<=3,'each row (3 printed without takhrij): footnote mark in the translation and the takhrij note');
ck(ur.filter(r=>r[3]&&r[3].f).length>1400,'fawaid kept');
ck(ur.every(r=>!/[A-Za-z@#$_]/.test(r[1])),'no stray latin / underscore in translation');
ck(ur.every(r=>!/ﷺ|ؓ|ؒ|ؑ/.test(r[1]+(r[3]&&(r[3].k+(r[3].f||''))||''))),'no honorific symbols');
ck(ur.every(r=>!/"/.test(r[1])),'no straight quotes left');
ck(!/(?<![ء-ي])حضرت\s+[^\s،]+\s+رضی اللہ عنہ/.test(ur.map(r=>r[1]).join(' '))&&!/(?<![ء-ي])حضرت\s+[^\s،]+\s+(?:اور|،)?\s*[^\s]*\s*رضی اللہ عنہ[مما]/.test(ur.map(r=>r[1]).join(' ')),'no «حضرت X رضی اللہ عنہ / عنہما / عنہم»');
ck(ur.map(r=>r[1]).join('').split('ٰ').length>300,'dagger alif kept');
ck(ar.every(r=>/[ً-ْ]/.test(r[1])&&!/\(\(|\)\)/.test(r[1])),'Arabic vocalised, no double brackets');
const byId=new Map(ur.map(r=>[r[0],r]));
ck(/وضو کرے/.test(byId.get(88)[1])&&/عروہ بن زبیر/.test(byId.get(88)[1]),'hadith 88 translation');
ck(byId.has(703)&&/صدقہ فطر/.test(byId.get(703)[1]),'703 (unnumbered fatwa that takes number 703) is its own row');
const idx=fs.readFileSync('coll/index.js','utf8');ck(/"key":"muwattaansar"/.test(idx)&&/"count":1851/.test(idx)&&/"ntx":\[\[1,/.test(idx),'registered with chapter notes');
const nts=fs.readdirSync('coll').filter(f=>/^muwattaansar_nt_/.test(f));let NT={};nts.forEach(f=>{const s=fs.readFileSync('coll/'+f,'utf8');Object.assign(NT,JSON.parse(s.slice(s.indexOf(',{')+1,s.lastIndexOf(')'))))});
ck(Object.keys(NT).length>=700,'chapter notes: '+Object.keys(NT).length);
ck(Object.values(NT).every(a=>a.every(p=>!/ﷺ|ؓ|ؒ|ؑ/.test(p))),'notes: no honorific symbols');
(async()=>{const b=await chromium.launch();
for(const [name,o] of [['phone',{...devices['Pixel 5']}],['desktop',{viewport:{width:1280,height:900}}]]){
const c=await b.newContext({...o,serviceWorkers:'block'});const p=await c.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('newsSeen','20261122a');localStorage.setItem('ui','ur')}catch(e){}});
const open=async(h,re)=>{await p.goto('http://localhost:8765/#'+h);await p.reload();await p.waitForFunction(r=>new RegExp(r).test(document.body.innerText),re,{timeout:40000}).catch(()=>{});return p.evaluate(()=>document.body.innerText)};
let t=await open('/s/muwattaansar/n/88','مروان|وضو');
ck(/حَدَّثَنِي يَحْيَى/.test(t)&&/عروہ بن زبیر/.test(t)&&/تحقیق و تخریج/.test(t),name+': hadith 88 Arabic, Urdu, takhrij');
t=await open('/s/muwattaansar/n/1635','نہیں ملا|1635');ck(/1635/.test(t),name+': the skipped number opens without an error');
t=await open('/s/muwattaansar/63','خلاصۃ الباب');ck(/خلاصۃ الباب/.test(t)&&/نکسیر|ناک سے خون/.test(t)&&!/لوڈ نہیں ہو سکا/.test(t),name+': a chapter that holds only notes opens and shows them');
t=await open('/s/muwattaansar/1','کتاب کا تعارف');ck(/کتاب کا تعارف/.test(t),name+': kitab introduction shown on the first chapter');
t=await open('/s/muwattaansar?idx','عرض ناشر');ck(/عرض ناشر/.test(t)&&/تقریظ/.test(t)&&/اوقات نماز/.test(t),name+': contents with intro');
await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS muwatta_ansar_full')})();
