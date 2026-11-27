// Muhaddithin-e-Andalus (andulusur): registry, rows, notes, headings, tile (owner 27-11-2026)
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});
await p.goto('http://localhost:8765/index.html#/');await p.waitForTimeout(3500);
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const tiles=await p.evaluate(()=>[...document.querySelectorAll('.tiles a,.tiles .tile')].map(x=>x.getAttribute('href')+'|'+(x.textContent||'').trim()));
ok(tiles.some(t=>t.startsWith('#/sec/tazkira|')&&t.includes('تذکرہ مشاہیر')),'tile');
const i=tiles.findIndex(t=>t.startsWith('#/s/rijal'));ok(i>=0&&tiles[i+1].startsWith('#/sec/tazkira'),'tile stands right after rijal tile');
const fs=require('fs'),reg=fs.readFileSync(__dirname+'/../coll/index.js','utf8'),A=JSON.parse(reg.slice(reg.indexOf('COLLS(')+6,reg.lastIndexOf(')'))),E=A.find(e=>e.key==='andulusur');
ok(E&&E.count===264&&E.sections.length===13&&E.sections[0][1]==='مصنفہ کا تعارف'&&E.sections[12][1]==='مصادر و مراجع','registry');
ok(A[A.length-1].key==='andulusur','registry end');
const f=E.files.ur[0][2],t=fs.readFileSync(__dirname+'/../coll/'+f,'utf8');
ok(/\[1,"§مصنفہ کا تعارف/.test(t)&&t.includes('جمیلہ شوکت'),'author intro first row');
ok(!/\\"/.test(t),'no straight quotes');
let heads=0;E.files.ur.forEach(x=>{heads+=(fs.readFileSync(__dirname+'/../coll/'+x[2],'utf8').match(/\\n§|\[\d+,"§/g)||[]).length});ok(heads>=200,'headings '+heads);
ok(/tazkira:\['andulusur'\]/.test(fs.readFileSync(__dirname+'/../index.html','utf8')),'SEC_KEYS');
await p.goto('http://localhost:8765/index.html#/sec/tazkira');await p.waitForTimeout(2500);
ok(await p.locator('a[href="#/s/andulusur"]').count()===1,'folder lists the book');
await b.close();console.log(bad?'FAILED':'OK andulus_book');process.exit(bad?1:0)})();
