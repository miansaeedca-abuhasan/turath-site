// owner report 25-11-2026 (chapter_mismatch_report.md): kitab 60 / 66 / 67 chapter -> archive file by content, not by position
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad=1;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch(),p=await b.newPage();await p.addInitScript(()=>{localStorage.ui='en'});
await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.ENAUD&&ENAUD.babUrl,null,{timeout:20000});
const r=await p.evaluate(()=>{const u=(k,o)=>{const x=ENAUD.babUrl(k,o);return x&&x.replace(/^.*\//,'')};
 const n60=[...Array(1135)].map((_,i)=>ENAUD.babUrl(60,i+1)).filter(Boolean),set=new Set(n60.map(x=>x.replace(/^.*\//,'')));
 const n66=[...Array(51)].map((_,i)=>u(66,i+1)),n67=[...Array(100)].map((_,i)=>u(67,i+1)).filter(Boolean);
 return {a:u(60,1),b:u(60,16),c:u(60,13),d:u(60,787),n60:n60.length,uniq60:set.size,no1093:!set.has('book60_chapter1093.mp3'),no1096:!set.has('book60_chapter1096.mp3'),no1097:!set.has('book60_chapter1097.mp3'),has1119:set.has('book60_chapter1119.mp3'),
  e:n66[3],f:n66[4],g:n66[5],h:n66[47],i:n66[48],j:n66[49],k:n66[50],uniq66:new Set(n66).size,n67,}});
ck(r.a==='book60_chapter0001.mp3','60 ch1');ck(r.b==='book60_chapter0013.mp3','60 Baqarah second ch.4 -> file 13: '+r.b);ck(r.c===null&&r.d===null,'verse headings have no audio');
ck(r.n60===1116&&r.uniq60===1116,'60 count '+r.n60);ck(r.no1093&&r.no1096&&r.no1097&&r.has1119,'60 skips');
ck(r.e==='book66_chapter0004.mp3'&&r.f==='book66_chapter0006.mp3'&&r.g==='book66_chapter0009.mp3','66 start '+[r.e,r.f,r.g]);
ck(r.h==='book66_chapter0051.mp3'&&r.i==='book67_chapter0098.mp3'&&r.j==='book66_chapter0052.mp3'&&r.k==='book66_chapter0053.mp3','66 end '+[r.h,r.i,r.j,r.k]);ck(r.uniq66===51,'66 unique');
ck(r.n67.join()==='book66_chapter0008.mp3,book66_chapter0007.mp3,book66_chapter0005.mp3','67 three '+r.n67);
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad)})();
