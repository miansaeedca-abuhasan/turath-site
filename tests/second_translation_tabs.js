// Abu Dawud, Ibn Majah, Nasai, Muslim: a second Urdu translation (Darussalam translators named on the tab) next to the first; the first stays as before; no symbols/abbreviations in the second
const fs=require('fs');const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const S=__dirname+'/../coll/';const idx=fs.readFileSync(S+'index.js','utf8');const M=JSON.parse(idx.slice(idx.indexOf('(')+1,idx.lastIndexOf(')')));const B={};M.forEach(b=>B[b.key]=b);
const want={abudawud:['ابو عمار عمر فاروق سعیدی',5000],ibnmajah:['عطاء اللہ ساجد',4000],nasai:['حافظ محمد امین',5000],muslim:['جلالپوری',6500]};
for(const k in want){const b=B[k];ck(b.trn2&&b.trn2.ur.includes(want[k][0]),k+' translator name');let n=0,sym=0,first=0;
 for(const [a,e,fn] of b.files.ur){const t=fs.readFileSync(S+fn,'utf8');const rows=JSON.parse(t.slice(t.indexOf('[['),t.lastIndexOf(']]')+2));rows.forEach(r=>{first++;const x=r[3];if(x&&x.u2){n++;if(/[ﷺؓؒؑؐ﷜﷠﷢﷤﷫]|\(\s*رض\s*\)/.test(x.u2+(x.f2||'')))sym++;}})}
 ck(n>=want[k][1],k+' rows with second translation '+n);ck(sym===0,k+' no honorific symbols '+sym);ck(b.files.ur.length>=8,k+' ur split in small files');}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
for(const k in want){await p.goto('http://localhost:8765/#/s/'+k+'/1');await p.reload();await p.waitForTimeout(4500);await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(e=>e.remove()));
 const t=await p.evaluate(()=>[...document.querySelectorAll('.trbtn')].map(e=>e.textContent).join('|'));ck(t.includes(want[k][0])&&t.includes('اردو'),k+' tabs '+t.slice(0,80));}
ck(errs.length===0,'errors '+errs[0]);await b.close();console.log(bad?'FAILED':'PASS second_translation_tabs');process.exit(bad?1:0)})();
