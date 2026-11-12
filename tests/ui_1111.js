// Guard (11 Nov): one search bar and fewer tiles on the Jami home, «مترجم کتب», English intermediate quiz, narrators of an isnad (father, companion colour), compare page
const {chromium}=require('playwright');const fs=require('fs');let bad=[];const ck=(c,m)=>{if(!c)bad.push(m)};
const qs=fs.readFileSync(__dirname+'/../quiz/data_en.js','utf8');const D=JSON.parse(qs.slice(qs.indexOf(',')+1).replace(/\);?\s*$/,''));
for(const c of ['seerah','sahaba','adhkar']){ck(D.m&&D.m[c]&&D.m[c].length===150,'en m '+c);ck(!(D.m[c]||[]).some(q=>/[ںھےۃیٹڈڑ]/.test(q[0])),'urdu left in en m '+c)}
(async()=>{const b=await chromium.launch(),errs=[];
async function pg(ui,w){const p=await b.newPage({viewport:{width:w||360,height:760}});p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(u=>{localStorage.ui=u;localStorage.book='jamik';localStorage.newsDay=new Date().toDateString();localStorage.cmp='[]'},ui);return p}
let p=await pg('ur');await p.goto('http://localhost:8765/#/b');await p.waitForSelector('.tiles',{timeout:20000});await p.waitForTimeout(1500);
let r=await p.evaluate(()=>({t:[...document.querySelectorAll('.tiles .tile')].map(a=>a.textContent.trim()+'|'+(a.getAttribute('href')||'')),inputs:document.querySelectorAll('main input[type=search]:not([hidden])').length,filter:!!document.querySelector('#kfilter')}));
ck(r.t.length===6,'tiles '+r.t.join(','));ck(!r.t.some(x=>/#\/search|#\/hs/.test(x)),'search tiles remain');ck(r.t.some(x=>/مترجم کتب/.test(x)),'no «مترجم کتب»');ck(!r.filter,'second search bar remains');
await p.fill('#q','1386');await p.waitForSelector('.numhit',{timeout:10000});ck(true,'');
await p.close();
p=await pg('ur');await p.goto('http://localhost:8765/#/s/abudawud/n/858');await p.waitForSelector('.mt.ar',{timeout:20000});await p.waitForTimeout(6000);
r=await p.evaluate(()=>[...document.querySelectorAll('.mt.ar a.rawi')].map(a=>a.textContent.replace(/[ً-ْـ]/g,'').trim()+'|'+a.getAttribute('href')+'|'+a.className));
ck(r.length>=8,'rawis '+r.length);ck(r.every(x=>!/\|#\/n\/0\|/.test(x)),'unresolved narrator: '+r.filter(x=>/#\/n\/0/.test(x)));
ck(r.some(x=>/^أبيه\|#\/n\/\d+/.test(x)),'father not linked');ck(r.some(x=>/رفاعة.*sahabi/.test(x)),'companion not coloured');ck(!r.some(x=>/^(?:حدثنا|أنا|عن)\|/.test(x)),'verb as narrator');
await p.evaluate(()=>{const x=document.getElementById('ipop');if(x)x.remove()});await p.click('.mt.ar a.rawi');await p.waitForSelector('.nsheet .nhead',{timeout:10000});await p.close();
p=await pg('ur');await p.goto('http://localhost:8765/#/cmp');await p.waitForSelector('.cmpform',{timeout:20000});
for(const [q,n] of [['بخاري',1],['مسلم',1]]){await p.fill('.cmpform input[type=search]',q);await p.waitForSelector('.cmpsb');await p.click('.cmpsb');await p.fill('.cmpform input[inputmode=numeric]',String(n));await p.click('.cmpform .btn');await p.waitForTimeout(2500)}
ck(await p.evaluate(()=>document.querySelectorAll('.cmpcols .cmpcell').length)===4,'compare boxes');await p.evaluate(()=>{const x=document.getElementById('ipop');if(x)x.remove()});await p.click('.cmpgo button');await p.waitForSelector('.cmpcard ins, .cmpcard del',{timeout:15000});await p.close();
p=await pg('ur',360);await p.goto('http://localhost:8765/#/hb');await p.waitForSelector('.tiles',{timeout:20000});
ck(await p.evaluate(()=>{const t=document.querySelector('#t1');return t.scrollWidth<=t.clientWidth+1}),'header title is cut');await p.close();
ck(!errs.length,'js errors '+errs[0]);console.log(bad.length?'FAIL '+bad.join(' | '):'PASS ui_1111');await b.close();process.exit(bad.length?1:0)})();
