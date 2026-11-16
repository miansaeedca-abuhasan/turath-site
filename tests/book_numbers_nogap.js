// the numbers in the book list run 1,2,3 ... with no gap (also after the list is re-ordered), in every interface language; Dar Ibn Bashir shows on the Urdu Jami books only in the Urdu interface
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();
for(const ui of ['ur','en','ar']){const p=await b.newPage({viewport:{width:412,height:900}});
await p.addInitScript(u=>{localStorage.ui=u;localStorage.newsDay=String(new Date().toDateString())},ui);
await p.goto('http://localhost:8765/#/hb');await p.waitForTimeout(3500);
const d=(await p.evaluate(()=>[...document.querySelectorAll('.hbrow .snum')].map(e=>e.textContent.trim()))).map(x=>+x.replace(/[٠-٩]/g,c=>c.charCodeAt(0)-0x660).replace(/[۰-۹]/g,c=>c.charCodeAt(0)-0x6f0));
ck(d.length>300,ui+' rows '+d.length);const g=[];d.forEach((n,i)=>{if(n!==i+1)g.push(i+1+':'+n)});ck(!g.length,ui+' gaps '+g.slice(0,5));
if(ui==='ur'){const t=await p.evaluate(()=>['fazail','seerah','fitan','hifzhadith','adabaali'].map(k=>document.querySelector('.hbrow[data-k='+k+'] .hbpub')?.textContent));ck(t.every(x=>x==='ناشر: دار ابن بشیر'),'publisher '+t.join('|'));}
await p.close()}await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
