// Silsila Ahadith Sahiha (Urdu, 6 volumes): counts, sequential ids, printed numbers, no stray glyphs/symbols, first rows, honorific rules, opens in the reader
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});
p.on('pageerror',e=>{bad++;console.log('pageerror',e.message)});
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/hb');await p.waitForTimeout(2500);
const r=await p.evaluate(async()=>{
 const idx=await (await fetch('coll/index.js')).text();const A=JSON.parse(idx.slice(idx.indexOf('(')+1,idx.lastIndexOf(')')));const e=A.find(x=>x.key==='silsila');
 const out={e:{count:e.count,secs:e.sections.length,sec0:e.sections[0],secN:e.sections[e.sections.length-1],langs:e.langs,files:Object.keys(e.files)}};
 const get=async(lang)=>{const rows=[];for(const [a,c,n] of e.files[lang]){const t=await (await fetch('coll/'+n)).text();const arr=JSON.parse(t.slice(t.indexOf(',[')+1,t.lastIndexOf(')')).replace(/^"[a-z]+",/,''));rows.push(...arr)}return rows};
 const ar=await get('ar'),ur=await get('ur');out.nar=ar.length;out.nur=ur.length;
 out.seq=ar.every((r,i)=>r[0]===i+1)&&ur.every((r,i)=>r[0]===i+1);
 const all=[...ar.map(r=>r[1]),...ur.map(r=>[r[1],...Object.values(r[3]||{})].join('\n'))].join('\n');
 out.sym=/[ﷺﷻؓؒؑ]/.test(all);out.arDigit=(ur.map(r=>r[1]).join('')).match(/[٠-٩]/g)?.length||0;
 out.hazrat=(ur.map(r=>r[1]).join('')).match(/حضرت\s+\S+\s+رضی/g)?.length||0;
 out.dbl=ar.filter(r=>/\(\(|\)\)/.test(r[1])).length;out.nofull=ar.filter(r=>!/[.»۔؟!:]$/.test(r[1])).length;
 out.latin=ar.filter(r=>/[A-Za-z]/.test(r[1])).length;
 out.first=ur[0][1].slice(0,40);out.firstAr=ar[0][1].slice(0,30);out.last=ur[ur.length-1][1].slice(0,30);
 out.wrong471=ur.filter(r=>/نبی کریم رضی اللہ عنہ/.test(r[1])).length;
 return out});
ck(r.e.count===4117&&r.nar===4117&&r.nur===4117,'counts '+JSON.stringify([r.e.count,r.nar,r.nur]));
ck(r.seq,'ids sequential');ck(!r.sym,'honorific symbols');ck(r.arDigit===0,'arabic-indic digits '+r.arDigit);ck(r.hazrat===0,'«حضرت X رضی» left '+r.hazrat);
ck(r.dbl===0,'double brackets in Arabic');ck(r.nofull===0,'Arabic without full stop '+r.nofull);ck(r.latin===0,'latin in Arabic');ck(r.wrong471===0,'wrong honorific for the Prophet');
ck(r.e.secs===28&&r.e.sec0[2]===1&&r.e.secN[3]===4117,'sections');
ck(/^عبید اللہ بن مقسم/.test(r.first),'first row '+r.first);
// the reader opens the first and the printed-471 hadith
for(const [id,pr] of [[1,'1'],[477,'471']]){
 await p.goto('http://localhost:8765/#/s/silsila/n/'+id);await p.waitForTimeout(2500);
 const t=await p.evaluate(()=>document.body.innerText);
 ck(t.includes(pr),'printed number '+pr+' shown for id '+id);ck(/تحقیق/.test(t),'takhrij label for id '+id);ck(/تشریح/.test(t)||id===1,'sharh tab for id '+id);}
console.log(bad?'FAILED':'OK',JSON.stringify(r).slice(0,300));await b.close();process.exit(bad?1:0)})();
