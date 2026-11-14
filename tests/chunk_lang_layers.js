// Bengali layer files (bn1..bn8) all reach the hadith, whichever order they and the 200-hadith chunks arrive in
const fs=require('fs');process.chdir(__dirname+'/..');const bn={};global.TURATH_LANG=(l,d)=>Object.assign(bn,d);for(let i=1;i<=8;i++)eval(fs.readFileSync('data/bn'+i+'.js','utf8'));
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();let bad=0;
for(const n of [3,500,2500,6000,9000,13827,15500]){const p=await b.newPage();
 await p.addInitScript(()=>{localStorage.ui='bn';localStorage.book='jami';localStorage.newsDay=String(new Date().toDateString())});
 await p.goto('http://localhost:8765/#/h/'+n);await p.waitForTimeout(1500);
 const r=await p.evaluate(async n=>{const r=await window.localApi('hadith/'+n+'?book=jami_bn');return JSON.stringify((((r.content||{}).translation||{}).bn)||null)},n);
 const want=JSON.stringify((((bn[n]||{}).c||{}).translation)||null);
 if(r!==want){bad++;console.log('FAIL Bengali layer of hadith',n,r.slice(0,60),want.slice(0,60))}await p.close()}
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
