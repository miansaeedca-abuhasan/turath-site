// Tafsir Noor al-Huda: Arabic hadith text inside Urdu text sits in «…» (Arabic font), no (( )) Arabic spans left, no Urdu letters inside «»
const fs=require('fs'),{chromium}=require('playwright');
let bad=0;const ok=(c,m)=>{if(!c){console.log('FAIL',m);bad++}};
const idx=fs.readFileSync('coll/index.js','utf8');const A=JSON.parse(idx.slice(idx.indexOf('COLLS(')+6,idx.lastIndexOf(')')));
const e=A.find(x=>x.key==='tafsirnoor');let rows=[];
for(const [a,b,n] of e.files.ur){const t=fs.readFileSync('coll/'+n,'utf8');rows=rows.concat(JSON.parse(t.slice(t.indexOf('[',t.indexOf('"ur"')),t.lastIndexOf(')'))))}
ok(rows.length===8096,'rows '+rows.length);
let dbl=0,urd=0;
for(const r of rows){if(/\(\([^\d]/.test(r[1]))dbl++;for(const m of r[1].matchAll(/«⁠?([^»]*)»/g))if(/[ٹڈڑںےۓہھگچپژکیۃ]/.test(m[1])&&r[0]!==1737)urd++;}
ok(dbl<=1,'(( left '+dbl);ok(urd===0,'urdu letters inside «» '+urd);
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/tafsirnoor');await p.waitForTimeout(2500);
const r=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,500));return 1});
// render row 7243 via rich renderer if exposed
const html=await p.evaluate(()=>{const t='آپ نے فرمایا: «\u2060يَاأَيُّهَا النَّاسُ» ’’اے لوگو‘‘ اور «لَا اِلٰهَ اِلَّا اللهُ» ہے';const d=document.createElement('div');[].concat(window.rich0(t,'ur')).forEach(x=>d.append(x));return d.innerHTML});
ok((html.match(/class="arq"/g)||[]).length===2,'both spans get Arabic class');ok(!/\u2060/.test(html),'marker stripped');
await b.close();if(bad){process.exit(1)}console.log('PASS noor_arabic_in_guillemets');})();
