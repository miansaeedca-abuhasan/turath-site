// Owner 26-11-2026: the book order of 23-11-2026 stays; every later book stands at the end (new hadith books, then the sahaba books Isaba / Usd al-Ghaba / Tabaqat)
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const s=fs.readFileSync('coll/index.js','utf8'),A=JSON.parse(s.slice(s.indexOf('COLLS(')+6,s.lastIndexOf(')'))).map(e=>e.key),base=JSON.parse(fs.readFileSync('tools/order_23nov.json','utf8'));
ck(JSON.stringify(A.filter(k=>base.includes(k)))===JSON.stringify(base),'books of 23-11-2026 keep their relative order');
ck(JSON.stringify(A.slice(base.length))===JSON.stringify(A.slice(base.length)) && A.slice(0,base.length).every(k=>base.includes(k)),'no new book stands among the old ones');
ck(JSON.stringify(A.slice(-6))===JSON.stringify(['ibnwahbur','qiraatkhalfur','ibnabishaibaur','asabahur','asadghabaur','tabaqatur']),'tail = new hadith books, then sahaba books');
const h=fs.readFileSync('index.html','utf8'),m=h.match(/sahaba:\[([^\]]*)\]/)[1].split(',').map(x=>x.replace(/'/g,''));
ck(JSON.stringify(m.slice(-3))===JSON.stringify(['asabahur','asadghabaur','tabaqatur']),'sahaba section: new books last');
const ib=JSON.parse(s.slice(s.indexOf('COLLS(')+6,s.lastIndexOf(')'))).find(e=>e.key==='ibnabishaibaur');
ck(/محمد حسین میمن/.test(ib.sub.ur)&&!/تقریظ/.test(ib.sub.ur),'translator on the list line of Musnad Ibn Abi Shaiba');
if(bad)process.exit(1);console.log('PASS book_order_23nov');
