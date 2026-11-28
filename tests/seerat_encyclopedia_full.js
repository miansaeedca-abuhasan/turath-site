// Seerat Encyclopedia (seeratency): 7 volumes, one row per printed page, volume/page labels, chapter hero, verses, notes (owner 27-11-2026)
const {chromium}=require('playwright'),fs=require('fs');(async()=>{
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const reg=fs.readFileSync(__dirname+'/../coll/index.js','utf8'),A=JSON.parse(reg.slice(reg.indexOf('COLLS(')+6,reg.lastIndexOf(')'))),E=A.find(e=>e.key==='seeratency');
ok(E&&E.count===3633&&E.sections.length===58&&E.pg,'registry');ok(A[A.length-1].key==='seeratency','registry end');
const rows=[];E.files.ur.forEach(x=>{const t=fs.readFileSync(__dirname+'/../coll/'+x[2],'utf8');rows.push(...JSON.parse(t.slice(t.indexOf(',[[')+1,t.lastIndexOf(')'))))});
ok(rows.length===3633&&rows.every((r,i)=>r[0]===i+1),'ids sequential');
const vols={};rows.forEach(r=>{const v=Math.floor(r[3].v/100000);vols[v]=(vols[v]||0)+1});
ok(JSON.stringify(vols)===JSON.stringify({1:526,2:586,3:498,4:486,5:540,6:494,7:503}),'rows per volume '+JSON.stringify(vols));
ok(rows.every((r,i)=>i===0||r[3].v>rows[i-1][3].v||Math.floor(r[3].v/100000)>Math.floor(rows[i-1][3].v/100000)),'pages ascend');
ok(rows.find(r=>r[3].v===100148)[1].includes('قطع کرتی ہیں جن میں سے اہم وادی الرمہ'),'jild 1 p148 text');
ok(rows.find(r=>r[3].v===300239)[1].includes('اللہ تعالیٰ کی طرف سے صبر کی تلقین'),'jild 3 p239 text');
ok(E.sections.some(s=>s[1].startsWith('جلد 3 — باب 5')),'jild 3 chapter 5 section');
ok(!rows.some(r=>/[ﷺؓؒؑ]/.test(r[1])),'no honorific symbols');
ok(!rows.some(r=>/"/.test(r[1].split('\n').filter(l=>!/^\[تصویر|^\d|[A-Za-z]{3}/.test(l)).join(''))),'no straight quotes in Urdu text');
const b=await chromium.launch();
for(const [w,h] of [[390,844],[1200,900]]){
 const p=await b.newPage({viewport:{width:w,height:h}});await p.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});
 await p.goto('http://localhost:8765/index.html#/s/seeratency/3');await p.waitForTimeout(3500);
 const r=await p.evaluate(()=>({hero:!!document.querySelector('.sr-hero .sr-medal'),ht:(document.querySelector('.sr-ht')||{}).textContent,cal:!!document.querySelector('.sr-cal .sr-calar'),ay:document.querySelectorAll('.sr-ayah').length,fig:document.querySelectorAll('.sr-fig figcaption').length,fn:document.querySelectorAll('.sr sup.fnm').length,pg:[...document.querySelectorAll('.pgno')].slice(0,2).map(x=>x.textContent),sect:document.body.innerText.includes('§'),over:document.documentElement.scrollWidth>innerWidth+2}));
 ok(r.hero&&r.ht&&!/§/.test(r.ht),w+' hero');ok(r.cal,w+' calligraphy page');ok(r.ay>3,w+' verse cards');ok(r.fig>0,w+' figure captions');ok(r.fn>3,w+' footnote circles');
 ok(r.pg[0]&&/جلد|الجزء/.test(r.pg[0])&&/صفحہ|الصفحة/.test(r.pg[0])&&/[١٢۱۲]/.test(r.pg[0]),w+' volume/page label '+r.pg[0]);ok(!r.sect,w+' no § leaks');ok(!r.over,w+' no horizontal scroll');
 await p.close();}
{const p=await b.newPage({viewport:{width:390,height:844}});await p.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});await p.goto('http://localhost:8765/index.html#/s/seeratency/3');await p.waitForTimeout(3500);
 await p.evaluate(()=>document.querySelectorAll('.sheetbg').forEach(x=>x.remove()));
 ok(await p.locator('.sr-pgb').count()>0,'page picture button (jild 3 has pictures)');await p.locator('.sr-pgb').first().click();await p.waitForTimeout(1200);
 ok(await p.locator('.sr-lbx img').evaluate(i=>i.naturalWidth>300),'page picture opens');await p.evaluate(()=>history.back());await p.waitForTimeout(500);ok(await p.locator('.sr-lbx').count()===0,'Back closes only the picture');await p.close();}
const fsx=require('fs');ok(fsx.readdirSync(__dirname+'/../seerat/img').length===1264,'1264 page pictures (jild 1-7)');
const p2=await b.newPage({viewport:{width:390,height:844}});await p2.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});
await p2.goto('http://localhost:8765/index.html#/sec/seerah');await p2.waitForTimeout(2500);ok(await p2.locator('a[href="#/s/seeratency"]').count()===1,'Seerah folder lists the book');
await p2.goto('http://localhost:8765/index.html#/hb');await p2.waitForTimeout(2500);ok(await p2.locator('a[href="#/s/seeratency"]').count()===0,'not in the hadith list');
await b.close();console.log(bad?'FAILED '+bad:'OK');process.exit(bad?1:0)})();
