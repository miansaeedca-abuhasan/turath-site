// Printed volume/page under every row of the Arabic library books (owner 24-11-2026): Arabic words + Arabic-Indic digits in every UI language,
// «الجزء» only for multi-volume books. Data: coll/pg/<key>_<hash>.js (tools/pages/build.py), registry field `pg`.
const {chromium}=require('playwright');const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const S=fs.readFileSync('coll/index.js','utf8'),L=JSON.parse(S.slice(S.indexOf('(')+1,S.lastIndexOf(')')));
const withPg=L.filter(x=>x.pg);ck(withPg.length>=150,'books with page data: '+withPg.length);
for(const x of withPg){const f='coll/pg/'+x.pg;ck(fs.existsSync(f),'file '+f);}
const off=JSON.parse(fs.readFileSync('offline.json','utf8'));
ck(withPg.every(x=>{const g=off.groups.find(g=>g.id==='c_'+x.key);return !g||g.f.some(f=>f[0]==='coll/pg/'+x.pg)}),'offline.json lists every page file');
// decode a file in node: page numbers never run backwards (by more than 1 % of rows)
for(const k of ['sh9767','sh10495','sh146']){const x=L.find(y=>y.key===k);if(!x||!x.pg){ck(false,k+' has pg');continue}
 const t=fs.readFileSync('coll/pg/'+x.pg,'utf8');const d=JSON.parse(t.slice(t.indexOf(',')+1,t.lastIndexOf(')')));
 let v=0,prev=0,back=0,n=0;for(const q of d.v.split(',')){if(q==='x'){n++;continue}if(q)v+=parseInt(q,36);if(v<prev)back++;prev=v;n++}
 ck(n===x.count&&back<=n*0.01,k+' rows '+n+'/'+x.count+' backwards '+back);}
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:400,height:800}});
for(const ui of ['ur','en']){
 await p.addInitScript(u=>{localStorage.ui=u;localStorage.newsDay=String(new Date().toDateString())},ui);
 await p.goto('http://localhost:8765/#/s/sh9767/n/300');await p.waitForSelector('.pgno',{timeout:30000});
 const t=await p.$eval('.pgno',e=>e.innerText.replace(/\s+/g,' '));
 ck(/^الجزء ١ .* الصفحة ٢٢٩$/.test(t),ui+': Isaba no.300 label «'+t+'»');
 ck(await p.$eval('.pgno',e=>e.getAttribute('lang')==='ar'&&getComputedStyle(e).direction==='rtl'),ui+': Arabic label');}
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
