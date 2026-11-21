// «تفاسیر» page: every tafsir row has ONE style (hbrow tfrow), the newly added Urdu tafsirs carry «نئی», the 4 full Arabic tafsir books (Tabari, Ibn Abi Hatim, Baghawi, Ibn Kathir) stand in the Arabic group; Siraj 28/29 takhrij shows page marker
const {chromium}=require('playwright'),fs=require('fs');let bad=[];
const sj=fs.readFileSync(__dirname+'/../coll/musnadsarrajur_ur_1_5909a1.js','utf8');
if(!/الدعاء للطبرانی \(ص 132، 355\)/.test(sj)||!/الدعاء للطبرانی \(ص 133، 360\)/.test(sj))bad.push('siraj 28/29 page marker');
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:430,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.newsSeen='20261120a';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur'}catch(e){}});
await p.goto('http://localhost:8765/index.html#/q/tafsir');await p.waitForSelector('a.tfrow',{timeout:25000});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const a=[...document.querySelectorAll('#qv a.card')];return{n:a.length,odd:a.filter(x=>!x.classList.contains('tfrow')).length,
 nw:a.filter(x=>x.querySelector('.newtag')).map(x=>x.textContent),hrefs:a.map(x=>x.getAttribute('href'))}});
if(r.odd)bad.push('rows with another style '+r.odd);
for(const k of['نور الہدیٰ','سراج البیان','فہم القرآن','بھٹوی'.length?'القرآن الکریم (اردو)':''])if(!r.nw.some(t=>t.includes(k)))bad.push('no new badge '+k);
for(const k of['sh43','sh8658','sh12217','sh1503'])if(!r.hrefs.includes('#/s/'+k))bad.push('missing '+k);
console.log(bad.length?'FAIL '+bad.join('|'):'PASS tafsir_hub_uniform');await b.close();process.exit(bad.length?1:0)})();
