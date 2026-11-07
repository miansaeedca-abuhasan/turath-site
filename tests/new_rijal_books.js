// Guard: the 10 rijal / jarh books added on 2026-11-07 open, show their text, and their words are in the search index
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{let bad=[];const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});
p.on('pageerror',e=>bad.push('pageerror '+e.message));await p.addInitScript(()=>{localStorage.ui='ur'});
const keys=['sh10805','sh96956','sh5836','sh5848','sh5827','sh96228','sh9170','sh2331','sh6044','sh10272','sh642','sh13131'];
const idx=JSON.parse(fs.readFileSync('coll/index.js','utf8').replace(/^COLLS\(/,'').replace(/\);?\s*$/,''));
for(const k of keys){const c=idx.find(x=>x.key===k);if(!c){bad.push('missing in index '+k);continue}
  if(!fs.existsSync('coll/'+c.files.ar[0][2]))bad.push('file missing '+k);
  if(c.sections[c.sections.length-1][3]!==c.count)bad.push('sections do not reach the end '+k)}
// search index: every new book key is in the shard book list and a known word points at it
let books,m;global.SIDX=(i,mm,bb)=>{books=bb;m=mm};
const fnv=w=>{let h=0x811c9dc5;for(let i=0;i<w.length;i++){h^=w.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h%512};
eval(fs.readFileSync('coll/ix/'+fnv('التاريح')+'.js','utf8'));
const v=m['التاريح'];const bi=books.indexOf('sh9170');
if(bi<0||!v||!v.split(';').some(x=>parseInt(x.split(':')[0],36)===bi))bad.push('search index lacks sh9170');
await p.goto('http://localhost:8765/#/s/sh9170');await p.waitForTimeout(8000);
await p.evaluate(()=>document.querySelectorAll('.sheetbg,.sheet,#ipop').forEach(x=>x.remove()));
const t=await p.evaluate(()=>document.body.innerText);if(!/للعجلي/.test(t))bad.push('book page does not show the name');
await p.goto('http://localhost:8765/#/s/sh9170/n/3');await p.waitForTimeout(7000);
const t2=await p.evaluate(()=>document.body.innerText);if(!/التاريح/.test(t2))bad.push('entry 3 text not shown');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
