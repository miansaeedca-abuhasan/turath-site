// Guard: the 13 books added on 2026-11-13 (rijal / sahaba / hadith sciences from turath epubs) are in the index, their files exist, sections reach the end, and the books open with text
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{let bad=[];const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});
p.on('pageerror',e=>bad.push('pageerror '+e.message));await p.addInitScript(()=>{localStorage.ui='ur'});
const keys=['sh12993','sh132971','sh12288','sh1110','sh23799','sh127654','sh17807','sh13012','sh5646','sh22567','sh23071','sh14538','sh21481'];
const idx=JSON.parse(fs.readFileSync('coll/index.js','utf8').replace(/^COLLS\(/,'').replace(/\);?\s*$/,''));
for(const k of keys){const c=idx.find(x=>x.key===k);if(!c){bad.push('missing in index '+k);continue}
  c.files.ar.forEach(f=>{if(!fs.existsSync('coll/'+f[2]))bad.push('file missing '+f[2])});
  if(c.sections[c.sections.length-1][3]!==c.count)bad.push('sections do not reach the end '+k);
  if(c.files.ar[c.files.ar.length-1][1]!==c.count)bad.push('files do not reach the end '+k);
  if(c.sections[0][2]!==1)bad.push('first section does not start at 1 '+k)}
const c=idx.find(x=>x.key==='sh22567');if(!c||c.author[1]!=='محمد ضياء الرحمن الأعظمي'||c.author[4]!==1441)bad.push('Azami author wrong');
for(const [k,n,w] of [['sh1110',100,'الصحابة'],['sh5646',3,'الحديث'],['sh22567',160,'']]){
  await p.goto('http://localhost:8765/#/s/'+k+'/n/'+n);await p.waitForTimeout(7000);
  await p.evaluate(()=>document.querySelectorAll('.sheetbg,.sheet,#ipop').forEach(x=>x.remove()));
  const t=await p.evaluate(()=>document.body.innerText);if(t.length<60||(w&&!t.includes(w)))bad.push('entry text not shown '+k+'/'+n+' len '+t.length)}
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
