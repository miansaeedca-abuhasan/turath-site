// Sahih al-Jami' as-Saghir wa Ziyadatuh (Albani): Arabic library book sh10757 (owner EPUB) + Urdu translation sahihjamiur (owner xlsx), 26-11-2026
const fs=require('fs'),{chromium,devices}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const rd=(k,l)=>fs.readdirSync('coll').filter(f=>f.startsWith(k+'_'+l+'_')).sort((a,b)=>+a.split('_')[2]-+b.split('_')[2]).flatMap(f=>{const s=fs.readFileSync('coll/'+f,'utf8');return JSON.parse(s.slice(s.indexOf('",[')+2,s.lastIndexOf(')')))});
const idx=fs.readFileSync('coll/index.js','utf8');const A=JSON.parse(idx.slice(idx.indexOf('COLLS(')+6,idx.lastIndexOf(')'))),E=A.find(e=>e.key==='sahihjamiur'),S=A.find(e=>e.key==='sh10757');
const ar=rd('sahihjamiur','ar'),ur=rd('sahihjamiur','ur'),sh=rd('sh10757','ar');
ck(ar.length===8212&&ur.length===8212&&E.count===8212,'8212 hadith in the Urdu book');
ck(ur.every((r,i)=>r[0]===i+1)&&ar.every((r,i)=>r[0]===i+1),'ids sequential');
ck(ur.every(r=>!/[A-Za-z@#$_¤"“”]|ﷺ|ؓ|ؒ|ؑ/.test(r[1].replace(/ \(1\)$/,''))),'no stray latin / symbols / ¤ / straight quotes in the translation');
ck(ur.every(r=>(r[1].match(/’’/g)||[]).length===(r[1].match(/‘‘/g)||[]).length),'Urdu quote marks balanced');
ck(ur.every(r=>!r[3]||!r[3].k||/\(1\)\s*$/.test(r[1])),'takhrij mark (1) present when takhrij exists');
ck(ur.every(r=>r[3]&&r[3].k),'every hadith has takhrij (corrected xlsx 26-11-2026)');
ck(ur.every(r=>!/فصل في المحلى|باب المناهي|الشمائل الشريفة$/.test(r[3]&&r[3].k||'')),'no leaked section headings in takhrij (xlsx defect, 27 rows cut)');
ck(E.trn&&E.trn.ur==='حافظ طلحہ بابر','translator name (owner 27-11-2026)');
ck(/إن الله تعالى جعلني عبدا كريما/.test(ar[1742][1])&&/سخی بندہ/.test(ur[1742][1]),'hadith 1740 restored in the corrected file');
ck(/تمہارا ان پر/.test(ur[2070][1]),'stray glyph «ara» turned into تمہارا');
ck(ur[1124]&&/\[الفاتحة|\[[^\]]+: [۰-۹]+\]/.test(ur.map(r=>r[1]).join('\n')),'verse references with Urdu digits');
ck(E.sections.length===74&&E.sections[0][2]===1&&E.sections[1][2]===23&&E.sections[16][3]===2755&&E.sections[57]&&E.sections[73][3]===8212&&E.sections.every((s,i)=>i===0||s[2]===E.sections[i-1][3]+1),'74 sections continuous, 16 Alif sub-chapters');
ck(E.an['331']==='330/1'||Object.values(E.an).filter(v=>typeof v==='string'&&/\//.test(v)).length===11,'11 bracketed extra hadith keep «N/1»');
ck(E.author[0]==='albani'&&S.author[0]==='albani','author Albani');
ck(sh.length===S.count&&S.sections.length===58&&S.pg,'Arabic book: rows, 58 sections, printed pages');
ck(Object.keys(S.nn).length<800&&!Object.values(S.an).some(v=>typeof v==='string'&&v==='1'),'footnotes never numbered as hadith');
const nums=sh.filter((r,i)=>!S.nn[r[0]]).length;ck(nums>=8190,'about 8,200 numbered hadith rows in the Arabic book: '+nums);
const h=fs.readFileSync('index.html','utf8');ck(/sahihjamiur":9/.test(h)&&/\['sahihjamiur','sh10757'\]/.test(h),'HB_CAT + one-work-one-row pair');
(async()=>{const b=await chromium.launch();
for(const [name,o] of [['phone',{...devices['Pixel 5']}],['desktop',{viewport:{width:1280,height:900}}]]){
const c=await b.newContext({...o,serviceWorkers:'block'});const p=await c.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('newsSeen','20261126a');localStorage.setItem('ui','ur')}catch(e){}});
const open=async(hh,re)=>{await p.goto('http://localhost:8765/#'+hh);await p.reload();await p.waitForFunction(r=>new RegExp(r).test(document.body.innerText),re,{timeout:40000}).catch(()=>{});return p.evaluate(()=>document.body.innerText)};
let t=await open('/s/sahihjamiur/n/1','داروغہ');ck(/داروغہ/.test(t)&&/الصحيحة/.test(t),name+': hadith 1 (Urdu) opens with takhrij');
t=await open('/s/sahihjamiur/n/8212','یہود');ck(/یہود/.test(t),name+': last hadith opens');
t=await open('/s/sh10757/n/5','آخر من يحشر');ck(/آخر من يحشر/.test(t),name+': Arabic book opens');
await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS sahih_jami_albani')})();
