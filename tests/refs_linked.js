// Guard: 9121 and 13585 carry a reference linked to our own library; the 209 review hadith keep the book link but no red (wording not decided yet); the site links all but a few follow-up mentions
const {chromium}=require('playwright');const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const H={};for(let i=1;i<=10;i++){const s=fs.readFileSync(__dirname+'/../data/d'+i+'.js','utf8');for(const h of JSON.parse(s.slice(s.indexOf('push(...')+8,s.lastIndexOf(']);')+1)))H[h.num]=h}
ck(H[9121].refs.length===1&&H[9121].refs[0].key==='sh23833'&&H[9121].refs[0].n===1929,'9121 ibn hisham');
ck(H[13585].refs.length===1&&H[13585].refs[0].key==='sh1503'&&H[13585].refs[0].number===3689,'13585 ibn kathir');
const REV=JSON.parse(fs.readFileSync(__dirname+'/fixtures/review209.json','utf8'));let red=0;
for(const n of REV){const h=H[n];for(const r of h.refs||[])if(r.lafz)red++;for(const f of['tks','takhrij'])if(/\([^()]*\)/.test(h[f]||''))red++}
ck(red===0,'review hadith have no red reference: '+red);
(async()=>{const b=await chromium.launch();const errs=[];
async function open(book,num){const p=await b.newPage({viewport:{width:420,height:900}});p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(bk=>{localStorage.ui='ar';localStorage.book=bk;localStorage.newsDay=String(new Date().toDateString())},book);
 await p.goto('http://localhost:8765/#/h/'+num);await p.waitForSelector('article, .card',{timeout:25000});await p.waitForTimeout(5000);
 const r=await p.evaluate(()=>({box:/قارن بمصادره/.test(document.body.innerText)?1:0,txt:(document.querySelector('.shhold')||{textContent:''}).textContent.slice(0,200),red:document.querySelectorAll('p.tk .rlink.red').length,links:document.querySelectorAll('p.tk .rlink').length}));await p.close();return r}
{const r=await open('jami',9121);ck(r.links>0,'9121 reference is a link in the takhrij: '+r.links);ck(r.box>0,'9121 shows its book box: '+JSON.stringify(r))}
ck(/الهيثم بن كليب/.test(fs.readFileSync(__dirname+'/../coll/sh1503_ar_5_99e48e.js','utf8').split('[3689,')[1].slice(0,300)),'sh1503 row 3689 is the Haytham narration');
ck(/اصطلحوا/.test(fs.readFileSync(__dirname+'/../coll/sh23833_ar_1_4cbb57.js','utf8').split('[1929,')[1].slice(0,300).replace(/[\u064b-\u0652]/g,'')),'sh23833 row 1929 is the standard-bearer narration');
const r=await open('jami',3635);ck(r.red===0,'3635 not red: '+r.red);
ck(!errs.length,'js errors '+errs[0]);console.log(bad?'FAIL':'PASS refs_linked');await b.close();process.exit(bad?1:0)})()
