// today's ayah/hadith come from the small ready-made file: same text as the full-data path, no heavy downloads, and the files cover the next 60 days
const {chromium}=require('playwright'),fs=require('fs');let bad=0;const ck=(c,m)=>{console.log(c?'PASS':'FAIL',m);if(!c)bad++};
const UIS=['ur','ar','en','bn','hi','gu','fr'];
const t=new Date(),d0=Math.floor(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())/864e5);
for(const ui of UIS){let ok=true;for(const dn of [d0,d0+60]){const f=`dc/${ui}_${Math.floor(dn/30)}.js`;if(!fs.existsSync(f)||!new RegExp('"'+dn+'":').test(fs.readFileSync(f,'utf8')))ok=false}ck(ok,'ready-made file covers today and +60 days: '+ui)}
(async()=>{const b=await chromium.launch();
for(const ui of ['ur','en']){
 const get=async(block)=>{const c=await b.newContext({viewport:{width:412,height:800},serviceWorkers:'block'}),p=await c.newPage();const urls=[];p.on('request',r=>urls.push(r.url()));
  if(block)await p.route('**/dc/*',r=>r.abort());
  await p.addInitScript(u=>{localStorage.nosplash='1';localStorage.ui=u;Object.defineProperty(navigator,'connection',{value:{type:'cellular',effectiveType:'4g',saveData:false},configurable:true})},ui);await p.goto('http://localhost:8765/#/');
  await p.waitForFunction(()=>{const t=document.querySelector('#today');return t&&t.querySelectorAll('.card').length>=3&&!/⋯|…\s*$/.test('')},null,{timeout:60000});await p.waitForTimeout(block?6000:2500);
  const txt=await p.evaluate(()=>[...document.querySelectorAll('#today a.card,#today .card')].map(x=>x.innerText.replace(/\s+/g,' ').trim()).filter(x=>x).join('|'));await c.close();return {txt,urls}};
 const A=await get(false),B=await get(true);
 ck(A.txt.length>200&&A.txt===B.txt,ui+': cards identical to the full-data path ('+A.txt.length+' chars)');
 ck(!A.urls.some(u=>/quran\/ar_uthmani|quran\/ur_junagarhi|coll\/index\.js|data\/hl\.js|coll\/fazail/.test(u)),ui+': on mobile data the home loads no Quran text / book index / hadith data ('+A.urls.filter(u=>/quran\/|coll\/|data\/hl/.test(u)).map(u=>u.split('/').pop()).join(',')+')');
}
await b.close();process.exit(bad?1:0)})();
