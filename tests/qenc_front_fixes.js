// Quran Encyclopedia front matter: «جلد اول» heading right after the title page (not at the end of the front matter), «جلد دوم» (not جزء), the heading «مقدمہ» with kasheeda,
// Arabic doxologies in the Arabic font with Arabic letters, headings centred, spelling slips fixed (مے کر → لے کر …)
const fs=require('fs'),{chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const idx=fs.readFileSync(__dirname+'/../coll/index.js','utf8');
const fl=[...idx.match(/"files":\{"ur":\[\[1,19,"(qenc_ur_1_\w+\.js)"/)];
const rows=n=>JSON.parse(fs.readFileSync(__dirname+'/../coll/'+n,'utf8').match(/\[\[[\s\S]*\]\]/)[0]);
const r1=rows(fl[1]),t=i=>(r1.find(r=>r[0]===i)||[])[1]||'';
ck(t(2)==='§قرآن انسائیکلوپیڈیا\n§جلد اول','row 2 is «جلد اول»');
ck(/^§پیش لفظ/.test(t(3))&&/^§مقدمہ/.test(t(5))&&/^§اصطلاحاتِ/.test(t(10))&&/^§ابابيل/.test(t(11)),'front matter rows 3-10, entries from 11');
const all=r1.map(r=>r[1]).join('\n');
for(const w of ['مے کر','خدمیت','اہتھوں','ربا العالمين','رب ا العالمين','مقدی ','نےسرزمیں','جزء اول','ذریعےسےمسلمانوں','اورمختلف'])ck(!all.includes(w),'still has «'+w+'»');
ck(all.includes('لے کر دنیا کے چپے چپے'),'«لے کر» present');
const idx9=idx.match(/\[336,379,"(qenc_ur_9_\w+\.js)"/)[1];ck(/§جلد دوم/.test(rows(idx9).map(r=>r[1]).join('\n'))&&!/جزء دوم/.test(rows(idx9).map(r=>r[1]).join('\n')),'«جلد دوم»');
ck(r1.every(r=>r.length===4),'rows keep their 4 fields');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});
const clean=()=>p.evaluate(()=>document.querySelectorAll('.sheetbg,.sheet,#ipop').forEach(x=>x.remove()));
await p.goto('http://localhost:8765/#/s/qenc/1');await p.waitForTimeout(6000);await clean();
const q=await p.evaluate(()=>{const part=document.querySelector('.qe-part'),ti=[...document.querySelectorAll('.qe-front .qe-title')].map(x=>x.textContent),dox=[...document.querySelectorAll('.qe-dox')].map(x=>({t:x.textContent,f:getComputedStyle(x).fontFamily,a:getComputedStyle(x).textAlign})),tia=[...document.querySelectorAll('.qe-front .qe-title')].map(x=>getComputedStyle(x).textAlign),sub=[...document.querySelectorAll('.qe-sub')].map(x=>x.textContent);
 return {part:part&&part.textContent,ti,dox,tia,sub,order:[...document.querySelectorAll('.qe-tp,.qe-part,.qe-front')].map(x=>x.className.split(' ').find(c=>/qe-(tp|part|front)/.test(c)))};});
ck(q.part&&/جلد اول/.test(q.part),'«جلد اول» shown');ck(q.order[0]==='qe-tp'&&q.order[1]==='qe-part'&&q.order[2]==='qe-front','order: title page, «جلد اول», front matter ('+q.order.slice(0,3)+')');
ck(q.ti.includes('مقدمہ')&&!q.ti.some(x=>/ـ/.test(x)),'heading «مقدمہ» plain (the Kasheeda font draws it) '+q.ti);
ck(q.dox.length>=5,'Arabic doxologies present '+q.dox.length);
ck(q.dox.every(x=>!/[ہیکۃ]/.test(x.t)),'doxologies use Arabic letters');
ck(q.dox.every(x=>/Amiri|Scheherazade|Naskh/i.test(x.f)),'doxologies in the Arabic font: '+(q.dox[0]||{}).f);
ck(q.dox.every(x=>x.a==='center')&&q.ti.length>0&&q.tia.every(a=>a==='center'),'headings and doxologies centred');
ck(!q.sub.some(x=>/خموشی|معذرت|یہ کہہ کے|اللہ اگر توفیق/.test(x)),'poetry / note lines are not bold headings '+q.sub.filter(x=>x.length>25));
await b.close();console.log(bad?'FAILED':'PASS qenc_front_fixes');process.exit(bad?1:0)})();
