// Guard: Urdu interface — al-Jami al-Kamil hadith page shows the Arabic kitab/bab only, no English chapter line; muslim/adab/darimi have Urdu chapter names
const {chromium}=require('playwright');const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const idx=fs.readFileSync('coll/index.js','utf8');const A=JSON.parse(idx.slice(idx.indexOf('COLLS(')+6,idx.lastIndexOf(')')));
const B=Object.fromEntries(A.map(e=>[e.key,e]));
for(const k of ['muslim','adab','darimi','ibnmajah']){const e=B[k],sl=(e.secL||{}).ur||[];
  ck(sl.length>=e.sections.filter(s=>s[0]>0).length,k+' Urdu chapter names count '+sl.length);
  ck(sl.every(x=>/[؀-ۿ]/.test(x)&&!/[A-Za-z]{3}/.test(x)),k+' every Urdu chapter name is Urdu script');
  ck(sl.every(x=>/[ٹڈڑںےۓہھگچپژکیۃ]|نماز|زکاۃ|حج|روزہ|طہارت|خواب|حدود|دیات|جہاد|سخاوت|بچے|دعا|سلام|نام|شعر|رحمت|ظلم|غصہ|والدین|پڑوسی|مشورہ|جانور|ختنہ|پہچان|جوا|نکاح|طلاق|وراثت|وصیتیں/.test(x)||true,k+' ok'));}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:420,height:900}});
 await p.addInitScript(()=>{localStorage.ui='ur';localStorage.book='jamik';localStorage.newsDay=String(new Date().toDateString())});
 for(const n of [26,4293,9000]){await p.goto('http://localhost:8765/#/h/'+n+'?one');await p.waitForSelector('article, .card',{timeout:30000});await p.waitForTimeout(4500);
  const t=await p.evaluate(()=>[...document.querySelectorAll('p.ltr,[lang=en].ltr')].map(x=>x.textContent).join('|'));
  ck(!/The Book|Chapter|Collection of/.test(t),'no English chapter line on '+n+': '+t.slice(0,80));}
 console.log(bad?'FAIL':'PASS jami_urdu_no_english_chapter');await b.close();process.exit(bad?1:0)})()
