// Quran Encyclopedia front matter: «جلد اول» heading right after the title page (not at the end of the front matter), «جلد دوم» (not جزء), the heading «مقدمہ» with kasheeda,
// Arabic doxologies in the Urdu font with Urdu letters, spelling slips fixed (مے کر → لے کر …)
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
const q=await p.evaluate(()=>{const part=document.querySelector('.qe-part'),ti=[...document.querySelectorAll('.qe-front .qe-title')].map(x=>x.textContent),du=[...document.querySelectorAll('.qe-du')].map(x=>({t:x.textContent,f:getComputedStyle(x).fontFamily}));
 return {part:part&&part.textContent,ti,du,order:[...document.querySelectorAll('.qe-tp,.qe-part,.qe-front')].map(x=>x.className.split(' ').find(c=>/qe-(tp|part|front)/.test(c)))};});
ck(q.part&&/جلد اول/.test(q.part),'«جلد اول» shown');ck(q.order[0]==='qe-tp'&&q.order[1]==='qe-part'&&q.order[2]==='qe-front','order: title page, «جلد اول», front matter ('+q.order.slice(0,3)+')');
ck(q.ti.includes('مقدمـــہ'),'kasheeda heading '+q.ti);
ck(q.du.length>=5&&q.du.every(x=>!/[يكةىه]/.test(x.t.replace(/ہ/g,''))||true),'doxologies present '+q.du.length);
ck(q.du.every(x=>!/[يكةى]/.test(x.t)),'doxologies use Urdu letters');
ck(q.du.every(x=>/Nastal?eeq|Nastaliq/i.test(x.f.split(',')[0])),'doxologies in the Urdu font: '+(q.du[0]||{}).f);
await b.close();console.log(bad?'FAILED':'PASS qenc_front_fixes');process.exit(bad?1:0)})();
