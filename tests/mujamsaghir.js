// Guard: «معجم صغیر للطبرانی» (translator Abdul Samad Rialwi): Arabic, takhrij, Urdu translation, fawaid; 1197 entries with unique numbers
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
const reg=await (await fetch('http://localhost:8765/coll/index.js')).text();ck(/"key":"mujamsaghir"[^]*?"count":1197/.test(reg),'registered 1197');
await p.goto('http://localhost:8765/#/s/mujamsaghir/n/1');await p.waitForSelector('.card',{timeout:25000});await p.evaluate(()=>document.querySelectorAll('.sheetbg,#ipop').forEach(n=>n.remove()));await p.waitForTimeout(2500);
let t=await p.evaluate(()=>document.body.innerText);
ck(/أَشْرَفُ الْإِيمَانِ/.test(t),'arabic');ck(/مجمع الزوائد/.test(t),'takhrij');ck(/ابن عمر/.test(t),'urdu translation');ck(/عبدالصمد ریالوی/.test(t),'translator name');
await p.goto('http://localhost:8765/#/s/mujamsaghir/n/101');await p.waitForTimeout(2500);t=await p.evaluate(()=>document.body.innerText);ck(/فوائد/.test(t),'fawaid tab on 101');
const dup=await p.evaluate(async()=>{const x=await fetch('coll/index.js').then(r=>r.text());const m=x.match(/mujamsaghir_ur_1_[0-9a-f]+\.js/);const j=await fetch('coll/'+m[0]).then(r=>r.text());const rows=JSON.parse(j.slice(j.indexOf(',[[')+1,j.lastIndexOf(');')));return [rows.length,new Set(rows.map(r=>r[0])).size]});
ck(dup[0]===1197&&dup[1]===1197,'unique numbers '+dup);ck(!errs.length,'js errors '+errs[0]);
console.log(bad?'FAIL':'PASS mujamsaghir');await b.close();process.exit(bad?1:0)})()
