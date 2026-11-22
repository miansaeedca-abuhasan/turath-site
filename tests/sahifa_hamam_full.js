// Sahifa Hamam ibn Munabbih: 139 hadith, structure, wording rules, opens on phone and desktop
const fs=require('fs'),{chromium,devices}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const rd=(k,l)=>fs.readdirSync('coll').filter(f=>f.startsWith(k+'_'+l+'_')).sort((a,b)=>+a.split('_')[2]-+b.split('_')[2]).flatMap(f=>{const s=fs.readFileSync('coll/'+f,'utf8');return JSON.parse(s.slice(s.indexOf(',[[')+1,s.lastIndexOf(')')))});
const ar=rd('sahifahamamur','ar'),ur=rd('sahifahamamur','ur');
ck(ar.length===139&&ur.length===139,'139 rows ar/ur');
ck(ur.every((r,i)=>r[0]===i+1)&&ar.every((r,i)=>r[0]===i+1),'ids sequential');
ck(ur.every(r=>/ \(1\)$/.test(r[1])&&r[3]&&/^\(1\) /.test(r[3].k)&&r[3].e),'each row: footnote mark, takhrij, sharh');
ck(ur.every(r=>!/[A-Za-z@#$\[\]_]/.test(r[1])),'no stray latin / underscore in translation');
ck(ur.every(r=>!/_/.test(r[3].k+r[3].e)),'no underscore dividers left');
ck(ur.every(r=>!/ﷺ|ؓ|ؒ|ؑ/.test(r[1]+r[3].k+r[3].e)),'no honorific symbols');
ck(ur.every(r=>!/"/.test(r[1]+r[3].k+r[3].e)),'no straight quotes left');
ck(!/(^|[^ء-ي])حضرت\s+[^\s]+\s+رضی اللہ عنہ/.test(ur.map(r=>r[1]+r[3].e).join(' ')),'no «حضرت X رضی اللہ عنہ»');
ck(/آنحضرت/.test(ur.map(r=>r[3].e).join(' ')),'printed word آنحضرت kept');
ck(ar.every(r=>/[ً-ْ]/.test(r[1])&&!/\(\(|\)\)/.test(r[1])),'Arabic vocalised, no double brackets');
const idx=fs.readFileSync('coll/index.js','utf8');ck(/"key":"sahifahamamur"/.test(idx)&&/"count":139/.test(idx),'registered');
(async()=>{const b=await chromium.launch();
for(const [name,o] of [['phone',{...devices['Pixel 5']}],['desktop',{viewport:{width:1280,height:900}}]]){
const c=await b.newContext({...o,serviceWorkers:'block'});const p=await c.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('newsSeen','20261121a');localStorage.setItem('ui','ur')}catch(e){}});
const open=async(h,re)=>{await p.goto('http://localhost:8765/#'+h);await p.reload();await p.waitForFunction(r=>new RegExp(r).test(document.body.innerText),re,{timeout:40000}).catch(()=>{});return p.evaluate(()=>document.body.innerText)};
let t=await open('/s/sahifahamamur/n/1','امت کے بعد|آگے رہیں گے');
ck(/نَحْنُ الْآخِرُونَ/.test(t)&&/آگے رہیں گے/.test(t)&&/تحقیق و تخریج/.test(t),name+': hadith 1 Arabic, Urdu, takhrij');
ck(await p.evaluate(()=>[...document.querySelectorAll('.ftab')].some(x=>x.textContent.trim()==='تشریح')),name+': sharh tab (تشریح)');
t=await open('/s/sahifahamamur/n/139','139');ck(/139/.test(t),name+': hadith 139 opens');
t=await open('/s/sahifahamamur?idx','عرض ناشر');ck(/عرض ناشر/.test(t)&&/ہمام بن منبہ/.test(t),name+': contents with intro');
await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS sahifa_hamam_full')})();
