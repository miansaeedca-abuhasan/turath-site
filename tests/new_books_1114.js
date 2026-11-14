// Guard: the 19 books added on 2026-11-14 (sahaba biographies, lists and studies from turath epubs) are in the index, their files exist, sections reach the end, and the books open with text
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{let bad=[];const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});
p.on('pageerror',e=>bad.push('pageerror '+e.message));await p.addInitScript(()=>{localStorage.ui='ur'});
const keys=['sh28453','sh26525','sh6599','sh30046','sh5895','sh151153','sh20761','sh30089','sh11291','sh133','sh6347','sh9628','sh26595','sh4151','sh608','sh5802','sh1590','sh25782','sh30044'];
const idx=JSON.parse(fs.readFileSync('coll/index.js','utf8').replace(/^COLLS\(/,'').replace(/\);?\s*$/,''));
for(const k of keys){const c=idx.find(x=>x.key===k);if(!c){bad.push('missing in index '+k);continue}
  c.files.ar.forEach(f=>{if(!fs.existsSync('coll/'+f[2]))bad.push('file missing '+f[2])});
  if(c.sections[c.sections.length-1][3]!==c.count)bad.push('sections do not reach the end '+k);
  if(c.files.ar[c.files.ar.length-1][1]!==c.count)bad.push('files do not reach the end '+k);
  if(c.sections[0][2]!==1)bad.push('first section does not start at 1 '+k)}
const c=idx.find(x=>x.key==='sh26525');if(!c||c.author[4]!==256)bad.push('Zubayr author wrong');
for(const [k,n,w] of [['sh20761',50,''],['sh6347',5,''],['sh133',100,'']]){
  await p.goto('http://localhost:8765/#/s/'+k+'/n/'+n);await p.waitForTimeout(7000);
  await p.evaluate(()=>document.querySelectorAll('.sheetbg,.sheet,#ipop').forEach(x=>x.remove()));
  const t=await p.evaluate(()=>document.body.innerText);if(t.length<60||(w&&!t.includes(w)))bad.push('entry text not shown '+k+'/'+n+' len '+t.length)}
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
