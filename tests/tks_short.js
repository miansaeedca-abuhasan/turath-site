// Guard: in Talkhis al-Jami al-Kamil the takhrij is the short printed form (book names + hadith numbers, tiny notes); the long takhrij with isnad belongs to the full Jami only
const {chromium}=require('playwright');const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
let n=0,miss=0,long=0;
for(let i=1;i<=10;i++){const s=fs.readFileSync(__dirname+'/../data/d'+i+'.js','utf8');const a=JSON.parse(s.slice(s.indexOf('push(...')+8,s.lastIndexOf(']);')+1));
 for(const h of a){if(h.num<=0)continue;n++;if(!h.tks)miss++;else if(/حدثنا|أخبرنا|كلاهما|(?<!ومن )من طريق(?!ه)/.test(h.tks.replace(/[-]/g,'')))long++;}}
ck(n===16546,'16546 hadith '+n);ck(miss===0,'every hadith has a short takhrij: '+miss);ck(long<=12,'short takhrij has no isnad text: '+long);
(async()=>{const b=await chromium.launch();const errs=[];
async function open(book,num){const p=await b.newPage({viewport:{width:420,height:900}});p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(bk=>{localStorage.ui='ar';localStorage.book=bk;localStorage.newsDay=String(new Date().toDateString())},book);
 await p.goto('http://localhost:8765/#/h/'+num);await p.waitForSelector('p.tk',{timeout:25000});
 const t=await p.evaluate(()=>[...document.querySelectorAll('p.tk.ar')].map(x=>x.textContent).join(' | '));
 const red=await p.evaluate(()=>[...document.querySelectorAll('p.tk.ar *')].filter(e=>/lafz|red/.test(e.className||'')).length);await p.close();return {t,red}}
let r=await open('jami',10345);ck(/رواه البخاري.*4889.*ومسلم.*2054/.test(r.t),'talkhis 10345 short: '+r.t.slice(0,160));ck(!/كلاهما|حدثنا/.test(r.t),'talkhis 10345 has no isnad');ck(/واللفظ للبخاري/.test(r.t),'wording note kept');ck(r.red>0,'wording book reference is red');
r=await open('jami',1);ck(/5070/.test(r.t)&&/1907/.test(r.t)&&!/الحميدي/.test(r.t),'talkhis 1 short: '+r.t.slice(0,160));
r=await open('jamik',10345);ck(/كلاهما من طريق/.test(r.t),'full Jami keeps the long takhrij: '+r.t.slice(0,120));
ck(!errs.length,'js errors '+errs[0]);console.log(bad?'FAIL':'PASS tks_short');await b.close();process.exit(bad?1:0)})()
