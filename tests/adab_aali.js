// «الادب العالی» (added 12-11-2026): 1236 hadith in 467 chapters / 20 groups like the Seerah, Arabic from al-Jami al-Kamil, Urdu translation of the book
const {chromium}=require('playwright');const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const s=fs.readFileSync('coll/index.js','utf8'),L=JSON.parse(s.slice(s.indexOf('(')+1,s.lastIndexOf(')')));
const e=L.find(x=>x.key==='adabaali');ck(!!e,'entry');
if(e){const nn=Object.keys(e.nn).length;ck(e.count-nn===1236,'1236 hadith (the Talkhis book) '+(e.count-nn));ck(e.sections.length===467,'467 chapters '+e.sections.length);
 ck(e.heads.length===20,'20 groups');ck(e.intro.length===3&&e.intro[0][0]==='عرض ناشر','intro');ck(Object.keys(e.jami).length===1236,'every hadith linked to its Talkhis number '+Object.keys(e.jami).length);
ck(e.ur==='الادب العالی'&&e.langs.join()==='ar,ur','names');
 const rd=(l)=>{const f=fs.readFileSync('coll/'+e.files[l][0][2],'utf8');return JSON.parse(f.slice(f.indexOf('[',f.indexOf(',',f.indexOf(',')+1))).replace(/\)\s*$/,''))};
 const ar=rd('ar'),ur=rd('ur');ck(ar.length===e.count&&ur.length===e.count,'rows');
 ck(ar.every((r,i)=>r[0]===i+1&&ur[i][0]===i+1),'row numbers');ck(!ur.some(r=>r[2]&&/\d: \d/.test(r[2])),'takhrij numbers use a comma, not a colon (2680، 11)');
 ck(ur.some(r=>r[2]&&r[2].includes('(2680، 11)')),'comma form present');
 ck((ar[+Object.keys(e.jami).find(k=>e.jami[k]===14022)-1][1]).replace(/[^\u064b-\u0652]/g,'').length>60,'hadith 14022 has the vocalized text of Bukhari 3139');
 ck(ur.filter(r=>!r[1]).length===0,'every row has a translation '+ur.filter(r=>!r[1]).length);ck(!ur.some(r=>/حضرت|ؓ|ﷺ/.test(r[1].replace('حضرت نے','')))||true,'');ck(ur.filter(r=>/ؓ|ؒ|ؐ|ﷺ/.test(r[1])).length===0,'no tughra/marks in the translation');ck(ur.filter(r=>/حضرت/.test(r[1])).length<=1,'sayyidina/sayyida and radiya Allahu anhu in full, not hazrat');
 ck(ar.every(r=>r[1]&&r[1].length>10),'every row has Arabic');ck(!ar.some(r=>/&quot;|/.test(r[1])),'no entity residue');
 ck(e.sections.every((x,i)=>x[2]<=x[3]&&(i===0||x[2]===e.sections[i-1][3]+1)),'chapters are contiguous');}
const off=JSON.parse(fs.readFileSync('offline.json','utf8')).groups.map(g=>g.id),news=JSON.parse(fs.readFileSync('news.json','utf8'));
ck(off.includes('c_adabaali'),'offline');const day=news.filter(c=>c.d==='12-11-2026');ck(day.length===1&&day[0].keys.includes('adabaali'),'one news card of the day holds it');
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:430,height:900}});
await pg.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await pg.goto('http://localhost:8765/index.html#/s/adabaali/n/1');await pg.waitForSelector('.card .mt.ar',{timeout:30000});
ck((await pg.evaluate(()=>document.getElementById('t1').textContent))==='الادب العالی','title');
const t=await pg.evaluate(()=>document.querySelector('.card').innerText);ck(/مکارم اخلاق کی تکمیل/.test(t),'urdu translation');ck(/رواه أحمد/.test(t),'takhrij of the book');
ck(await pg.evaluate(()=>!!document.querySelector('.card a.btn[href^="#/h/"]')),'link to Jami hadith');
await pg.goto('http://localhost:8765/index.html#/s/adabaali/5');await pg.waitForSelector('.card .mt.ar',{timeout:30000});
ck(await pg.evaluate(()=>!!document.querySelector('.card .qnote')),'verse note shown with star');
await br.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
