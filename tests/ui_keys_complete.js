// Guard: every UI language has every label of the English table (no English showing in the Arabic/other UIs).
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const o=[];for(const l of ['ur','ar','bn','hi','gu','fr'])Object.keys(I.en).forEach(k=>{if(!(k in I[l]))o.push(l+'.'+k)});return o});
await b.close();console.log(r.length?'FAIL missing '+r.join(','):'PASS');process.exit(r.length?1:0)})();
