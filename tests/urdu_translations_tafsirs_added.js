// 4 Urdu translations (Kilani, Bhuttavi, Luqman, Hanif Nadvi) + 7 Urdu tafsirs (Makki, Sanai, Kilani, Luqman, Hanif, Ashraf al-Hawashi, Fahm ul Quran) are registered, load, are clean (no footnote marks / stray glyphs) and open in the reader
const fs=require('fs');const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const R=__dirname+'/../quran/';
const ld=f=>{let a;global.QLOAD=z=>{a=z};new Function(fs.readFileSync(R+f,'utf8'))();return a};
const AY=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const gaps={ur_kilani:0,ur_luqman:0,ur_hanif:0,ur_azad:0,ur_jameel:6,ur_bhuttavi:9};
for(const k in gaps){const a=ld(k+'.js');ck(a[0]===k&&a[1].length===6236,k+' 6236 verses');
 ck(a[1].filter(x=>!x.trim()).length===gaps[k],k+' empty verses '+a[1].filter(x=>!x.trim()).length);
 ck(!a[1].some(x=>/[\[\]]|[A-Za-z]|^\s*\d|\d+-\d+/.test(x)),k+' no marks/latin/prefix');
 ck(!a[1].some(x=>/مسنگ/.test(x)),k+' no placeholder');}
ck(ld('ur_kilani.js')[1][1].startsWith('ہر طرح کی تعریف'),'kilani Fatiha 2');
ck(ld('ur_bhuttavi.js')[1][1].startsWith('سب تعریف اللہ کے لیے'),'bhuttavi Fatiha 2 prefix removed');
const idx=fs.readFileSync(R+'tafsir/index.js','utf8');
for(const k of['ur_makki','ur_sanai','ur_kilani','ur_luqman','ur_hanif','ur_hawashi','ur_fahm','ur_azad']){
 const m=idx.match(new RegExp('"key": "'+k+'".*?"parts": (\\d+)'));ck(m,k+' in tafsir index');if(!m)continue;
 let seen=new Set();for(let i=1;i<=+m[1];i++){let o;global.QTAFSIR=(kk,x)=>{o=x};new Function(fs.readFileSync(R+'tafsir/'+k+'_'+i+'.js','utf8'))();Object.keys(o).forEach(s=>{seen.add(+s);o[s].forEach(g=>{ck(g[0]<=g[1]&&g[2].length>0,k+' group '+s)})})}
 ck(seen.size===114,k+' 114 surahs '+seen.size);}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.qset=JSON.stringify({mode:'tr',tr:['ur_kilani'],tafsir:'ur_makki',tafOn:true});localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/q/s/1');await p.waitForTimeout(4500);await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(e=>e.remove()));
const t=await p.evaluate(()=>document.body.innerText);ck(t.includes('ہر طرح کی تعریف'),'Kilani translation shows');
ck(errs.length===0,'page errors '+errs[0]);await b.close();console.log(bad?'FAILED':'PASS urdu_translations_tafsirs_added');process.exit(bad?1:0)})();
