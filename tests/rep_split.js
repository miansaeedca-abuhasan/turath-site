// reports typed one after the other inside one row of a library book (Tafsir Ibn Abi Hatim row 17 holds 17-22) are shown as separate numbered reports, narrators coloured in each
const {chromium}=require('playwright');
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:430,height:900}});let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
await pg.goto('http://localhost:8765/index.html#/s/sh8658/n/17');await pg.waitForSelector('.card .mt.ar',{timeout:30000});await pg.waitForTimeout(1500);
const r=await pg.evaluate(()=>[...document.querySelectorAll('.card .mt.ar')].map(m=>({n:(m.querySelector('.rsubn')||{}).textContent||null,col:m.querySelectorAll('a,span').length})));
ck(r.length===6,'6 blocks for 17-22: '+r.length);ck(r.slice(1).map(x=>x.n).join()==='18,19,20,21,22','numbers 18..22: '+r.map(x=>x.n));
ck(r.filter((x,i)=>i!=4&&x.col>1).length>=4,'narrators linked');
await pg.goto('http://localhost:8765/index.html#/s/sh8658/n/16');await pg.waitForSelector('.card .mt.ar');await pg.waitForTimeout(800);
ck(await pg.evaluate(()=>document.querySelectorAll('.card .mt.ar').length)===1,'ordinary row stays one block');
await br.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
