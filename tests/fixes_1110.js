// Guard: (1) no «رسول اللهصلى الله عليه وسلم» glued text in any book; (2) the 7 books whose hadith lacked i'rab keep their vocalised text; (3) country list numbered; (4) Urdu bab title shown under the Arabic bab in Urdu books
const fs=require('fs');process.chdir(__dirname+'/..');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const idx=fs.readFileSync('coll/index.js','utf8');
const files=[...new Set(idx.match(/[A-Za-z0-9_]+_[0-9a-f]{6}\.js/g))];
const glue=/[ء-يہھےیًّ-ْ]صل[یىي]\s*ا[لّّ]+[ہه]\s*علي?[یىي]?[ہه]\s*وسلم/;
let g=0,ex='';for(const f of files){const t=fs.readFileSync('coll/'+f,'utf8');const m=t.match(glue);if(m){g++;ex=f+' '+m[0]}}
ck(!g,'glued salawat in '+g+' files, e.g. '+ex);
const T=/[ً-ْ]/g,L=/[ء-ي]/g;
for(const k of ['fitan','bulughsaada','tarikhbukhari','tahdhibkamal','jamjawami','thiqat','najm']){let n=0,tot=0;
  for(const f of files.filter(x=>x.startsWith(k+'_ar_'))){const t=fs.readFileSync('coll/'+f,'utf8');const rows=JSON.parse(t.slice(t.indexOf(',[[')+1,t.lastIndexOf(');')));
    for(const r of rows){const l=(r[1].match(L)||[]).length;if(l>15){tot++;if((r[1].match(T)||[]).length<l*0.08)n++}}}
  ck(tot>0&&n===0,k+': '+n+' rows without tashkeel of '+tot)}
const ix=fs.readFileSync('index.html','utf8');
ck(/if \(!b\.an\) b\.an = \{\}/.test(ix),'books without an-map get an empty one (search cards)');ck(/nf\(i \+ 1\) \+ '\. '/.test(ix),'visitor country list numbered');ck(/\(i \+ 1\) \+ '\. '\) \+ x\[0\]/.test(ix),'admin country list numbered');
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
for(const [k,n,re] of [['fitan',3,/فتنوں سے بچا لیا گیا/],['bulughsaada',6,/توحید ہے/],['umdatulahkam',11,/استنجا/]]){
  await p.goto('http://localhost:8765/#/s/'+k+'/n/'+n);await p.waitForSelector('.card',{timeout:25000});await p.evaluate(()=>document.querySelectorAll('.sheetbg,#ipop').forEach(x=>x.remove()));await p.waitForTimeout(2500);
  const t=await p.evaluate(()=>[...document.querySelectorAll('.babtr')].map(x=>x.textContent).join('|'));ck(re.test(t),k+' urdu bab title: '+t.slice(0,60))}
ck(!errs.length,'js errors '+errs[0]);console.log(bad?'FAIL':'PASS fixes_1110');await b.close();process.exit(bad?1:0)})()
