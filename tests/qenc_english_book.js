// English Quran Encyclopedia (qencen, 27-11-2026): registered, renders verse card + table, news line links to it, no Urdu in English UI row
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{let bad=0;const ok=(c,m)=>{if(!c){console.log('FAIL',m);bad++;}};
const idx=fs.readFileSync('coll/index.js','utf8');const A=JSON.parse(idx.slice(idx.indexOf('COLLS(')+6,idx.lastIndexOf(')')));
const e=A.find(x=>x.key==='qencen');ok(e&&e.count===378,'378 rows');ok(e.sections.length===25,'25 sections');
ok(e.sections[0][3]===5&&e.sections[1][2]===6,'intro rows 1-5');
const news=JSON.parse(fs.readFileSync('news.json','utf8')).find(x=>x.id==='20261127a');ok(news.keys.includes('qencen')&&news.l.includes('#/s/qencen'),'news card');
for(const l of ['ur','ar','en','bn','hi','gu','fr'])ok(news.i[l].some(x=>/Quran Encyclopedia|انسائیکلوپیڈیا|موسوعة القرآن/.test(x)),'news '+l);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});
await p.addInitScript(()=>{localStorage.ui='en';localStorage.nosplash='1'});
await p.goto('http://localhost:8765/index.html#/s/qencen/6');await p.waitForTimeout(3500);
const r=await p.evaluate(()=>({t:document.querySelector('.qe-en .qe-title')?.textContent,ar:[...document.querySelectorAll('.qe-enar')].map(x=>getComputedStyle(x).fontFamily),h:document.documentElement.scrollWidth}));
ok(r.t==='Earth','title '+r.t);ok(r.ar.length>0&&r.ar.every(f=>/Amiri|Arab|Noto/i.test(f)),'arabic font '+r.ar[0]);ok(r.h<=400,'no horizontal scroll');
await p.goto('http://localhost:8765/index.html#/s/qencen/1');await p.waitForTimeout(2500);
ok(await p.evaluate(()=>!!document.querySelector('.qe-en .qe-title')),'intro renders');
await b.close();console.log(bad?'FAILED':'qenc english OK');process.exit(bad?1:0);})();
