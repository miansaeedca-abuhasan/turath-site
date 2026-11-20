const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('http://localhost:8765/#/');
const r=await p.evaluate(async()=>{
 const ld=u=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=u;s.onload=res;s.onerror=rej;document.head.appendChild(s)});
 let got={};window.QTAFSIR=(k,o)=>{got[k]=o};window.QTAFSIRS=o=>{got.idx=o};
 await ld('quran/tafsir/index.js');
 const e=got.idx.list.find(x=>x.key==='ur_bhuttavi');
 const parts=[...new Set(Object.values(e.where))];
 for(const n of parts)await ld('quran/tafsir/ur_bhuttavi_'+n+'.js');
 return {name:e.ur,parts:e.parts,s1:got.ur_bhuttavi?Object.keys(got.ur_bhuttavi).length:0,missing:got.idx.missing.includes('تفسیر القرآن الکریم')}
});
console.log(JSON.stringify(r));
let ok=r.name.includes('مولانا عبد السلام بھٹوی')&&r.parts===6&&!r.missing;
await b.close();console.log(ok?'PASS tafsir_bhuttavi_added':'FAIL');process.exit(ok?0:1)})();
