// Al-Adab al-Ali: group headings count hadith numbers, so each group must list its own chapters and open
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const fs=require('fs');const S=fs.readFileSync('coll/index.js','utf8'),L=JSON.parse(S.slice(S.indexOf('(')+1,S.lastIndexOf(')')));
for(const k of ['adabaali','adabaalien']){const e=L.find(x=>x.key===k);ck(e.sections.every(x=>!/ (في|من|إلى|على) |^باب (ال|لا |ما |من |إن |كفارة)/.test(x[1])),k+': every bab title has an Urdu translation');ck(e.heads.every(h=>!/ ما جاء /.test(h[1])),k+': every group title is Urdu')}
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:430,height:900}});
await pg.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await pg.goto('http://localhost:8765/index.html#/s/adabaali?idx');await pg.waitForSelector('details.grpbox',{timeout:30000});
const t=await pg.evaluate(()=>[...document.querySelectorAll('details.grpbox summary .cs')].map(x=>x.textContent));
ck(t.length===20,'20 groups '+t.length);ck(t.every(x=>!/(^|\D)[0۰]\s/.test(x)||/[1-9۱-۹]/.test(x)),'no empty group');
ck(!t.some(x=>/^[^\d۰-۹]*[0۰]\D+[0۰]/.test(x)),'no 0/0 group: '+t.slice(-5).join(' | '));
const n=await pg.evaluate(()=>{const d=[...document.querySelectorAll('details.grpbox')];const l=d[d.length-1];l.open=true;return d.length});
await pg.waitForSelector('details.grpbox[open] a.srow2',{timeout:10000});
const rows=await pg.evaluate(()=>document.querySelectorAll('details.grpbox[open] a.srow2').length);ck(rows===14,'last group lists 14 chapters '+rows);
await pg.click('details.grpbox[open] a.srow2');await pg.waitForSelector('.card .mt.ar',{timeout:30000});
ck(/#\/s\/adabaali\/\d+/.test(pg.url()),'chapter opens '+pg.url());
await br.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
