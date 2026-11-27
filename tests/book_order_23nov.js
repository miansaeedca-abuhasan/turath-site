// Owner 26-11-2026: the book order of 23-11-2026 stays; every later book stands at the end (new hadith books, then the sahaba books Isaba / Usd al-Ghaba / Tabaqat)
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const s=fs.readFileSync('coll/index.js','utf8'),A=JSON.parse(s.slice(s.indexOf('COLLS(')+6,s.lastIndexOf(')'))).map(e=>e.key),base=JSON.parse(fs.readFileSync('tools/order_23nov.json','utf8'));
ck(JSON.stringify(A.filter(k=>base.includes(k)))===JSON.stringify(base),'books of 23-11-2026 keep their relative order');
ck(JSON.stringify(A.slice(base.length))===JSON.stringify(A.slice(base.length)) && A.slice(0,base.length).every(k=>base.includes(k)),'no new book stands among the old ones');
ck(JSON.stringify(A.slice(-6))===JSON.stringify(['ibnwahbur','qiraatkhalfur','ibnabishaibaur','asabahur','asadghabaur','tabaqatur']),'tail = new hadith books, then sahaba books');
const h=fs.readFileSync('index.html','utf8'),m=h.match(/sahaba:\[([^\]]*)\]/)[1].split(',').map(x=>x.replace(/'/g,''));
ck(JSON.stringify(m.slice(-3))===JSON.stringify(['asabahur','asadghabaur','tabaqatur']),'sahaba section list: new books after the old ones');
const ib=JSON.parse(s.slice(s.indexOf('COLLS(')+6,s.lastIndexOf(')'))).find(e=>e.key==='ibnabishaibaur');
ck(/محمد حسین میمن/.test(ib.sub.ur)&&!/تقریظ/.test(ib.sub.ur),'translator on the list line of Musnad Ibn Abi Shaiba');
(async()=>{const {chromium}=require('playwright');const b=await chromium.launch();
for(const [ui,path] of [['ur','#/hb'],['ur','#/sec/sahaba']]){const c=await b.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});const p=await c.newPage();
 await p.addInitScript(u=>{try{localStorage.setItem('ui',u);localStorage.setItem('newsSeen','20261126a')}catch(e){}},ui);
 await p.goto('http://localhost:8765/'+path);await p.reload();await p.waitForFunction(()=>document.querySelectorAll('a.hbrow[data-k]').length>5,{timeout:60000}).catch(()=>{});await p.waitForTimeout(1200);
 const K=await p.evaluate(()=>[...document.querySelectorAll('a.hbrow[data-k]')].map(a=>a.dataset.k)),ix=k=>K.indexOf(k);
 if(path==='#/hb'){ck(ix('ibnwahbur')<ix('qiraatkhalfur')&&ix('qiraatkhalfur')<ix('ibnabishaibaur')&&ix('ibnabishaibaur')<ix('fadailahmad'),'new hadith books before the Sahaba books');
  const S=['fadailahmad','fazailnasai','shaansahabaur','asabahur','asadghabaur','tabaqatur'].map(ix);ck(S.every((v,i)=>i===0||v===S[i-1]+1),'Sahaba books stand together, newest last');
  ck(ix('ibnabishaibaur')===ix('ibnwahbur')+2,'new hadith books together');}
 else ck(ix('asabahur')>ix('shaansahabaur')&&ix('asadghabaur')>ix('asabahur')&&ix('tabaqatur')>ix('asadghabaur'),'Sahaba folder: new translated books after the older translated ones');
 await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS book_order_23nov')})();
