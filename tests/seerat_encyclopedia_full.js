// Seerat Encyclopedia (seeratency): 7 volumes, one row per printed page, volume/page labels, chapter hero, verses, notes (owner 27-11-2026)
const {chromium}=require('playwright'),fs=require('fs');(async()=>{
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const reg=fs.readFileSync(__dirname+'/../coll/index.js','utf8'),A=JSON.parse(reg.slice(reg.indexOf('COLLS(')+6,reg.lastIndexOf(')'))),E=A.find(e=>e.key==='seeratency');
ok(E&&E.count===3635&&E.sections.length===58&&E.pg,'registry');ok(A[A.length-1].key==='seeratency','registry end');
const rows=[];E.files.ur.forEach(x=>{const t=fs.readFileSync(__dirname+'/../coll/'+x[2],'utf8');rows.push(...JSON.parse(t.slice(t.indexOf(',[[')+1,t.lastIndexOf(')'))))});
ok(rows.length===3635&&rows.every((r,i)=>r[0]===i+1),'ids sequential');
const vols={};rows.forEach(r=>{const v=Math.floor(r[3].v/100000);vols[v]=(vols[v]||0)+1});
ok(JSON.stringify(vols)===JSON.stringify({1:526,2:588,3:498,4:486,5:540,6:494,7:503}),'rows per volume '+JSON.stringify(vols));
ok(rows.every((r,i)=>i===0||r[3].v>rows[i-1][3].v||Math.floor(r[3].v/100000)>Math.floor(rows[i-1][3].v/100000)),'pages ascend');
ok(rows.find(r=>r[3].v===100148)[1].includes('قطع کرتی ہیں جن میں سے اہم وادی الرمہ'),'jild 1 p148 text');
ok(rows.find(r=>r[3].v===300239)[1].includes('اللہ تعالیٰ کی طرف سے صبر کی تلقین'),'jild 3 p239 text');
ok(E.sections.some(s=>s[1].startsWith('جلد 3 — باب 5')),'jild 3 chapter 5 section');
ok(!rows.some(r=>/[ﷺؓؒؑ]/.test(r[1])),'no honorific symbols');
ok(!rows.some(r=>/"/.test(r[1].split('\n').filter(l=>!/^\[تصویر|^\d|[A-Za-z]{3}/.test(l)).join(''))),'no straight quotes in Urdu text');
// 28-11-2026: the 18 pages the owner's PDFs lacked (jild 3 printed 258 259 262 263 266 267 270 271 274 275 278 279 282 283 286 287, jild 2 printed 468 469) from the owner's photos
for(const [v,pg,sw] of [[3,258,''],[3,259,''],[3,262,''],[3,263,''],[3,266,''],[3,267,''],[3,270,''],[3,271,'ستم رانیاں'],[3,274,''],[3,275,''],[3,278,''],[3,279,''],[3,282,'انتالیس'],[3,283,'ہجرت حبشہ'],[3,286,'بوانہ'],[3,287,'آل یاسر'],[2,468,''],[2,469,'']]){
 const r=rows.find(x=>x[3].v===v*100000+pg);ok(!!r,'owner page v'+v+' p'+pg);if(!r)continue;
 ok(r[3].im&&r[3].im[0]==='v'+v+'_p'+pg+'.jpg'&&fs.existsSync(__dirname+'/../seerat/img/'+r[3].im[0]),'picture v'+v+' p'+pg);
 ok(!r[3].mp,'text row (not image-only) v'+v+' p'+pg);ok(sw===''||r[1].includes(sw),'text check v'+v+' p'+pg+' '+sw);
 const nm=(r[1].match(/\((\d+)\)/g)||[]).filter(m=>+m.slice(1,-1)<=9).length,nn=r[3].fn?r[3].fn.split('\n').length:0;ok(nn===0||nm>=nn,'marks placed v'+v+' p'+pg);
 ok(!/[A-Za-z]{2}/.test(r[1].replace(/^\[تصویر.*$/mg,'')),'no Latin letters v'+v+' p'+pg);}
{const i=rows.findIndex(x=>x[3].v===300271);ok(E.sections.find(s=>s[1].startsWith('جلد 3 — باب 5')).slice(2,3)[0]===i+1,'jild 3 chapter 5 starts at its opener p271 (row '+(i+1)+')');}
ok(rows.find(x=>x[3].v===300287)[1].includes('سیدنا یاسر بن عامر'),'p287 last paragraph');
ok(rows.find(x=>x[3].v===200469)[1].includes('تم کو تمام سچائی کی راہ دکھائے گا'),'jild 2 p469 item 5');
ok(rows.find(x=>x[3].v===200468)[1].includes('رُوحِ حق'),'jild 2 p468 item 4');
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
const fsx=require('fs');ok(fsx.readdirSync(__dirname+'/../seerat/img').length===1266,'1266 page pictures (jild 1-7; 18 are photos of the owner)');
const p2=await b.newPage({viewport:{width:390,height:844}});await p2.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});
await p2.goto('http://localhost:8765/index.html#/sec/seerah');await p2.waitForTimeout(2500);ok(await p2.locator('a[href="#/s/seeratency"]').count()===1,'Seerah folder lists the book');
await p2.goto('http://localhost:8765/index.html#/hb');await p2.waitForTimeout(2500);ok(await p2.locator('a[href="#/s/seeratency"]').count()===0,'not in the hadith list');
await b.close();console.log(bad?'FAILED '+bad:'OK');process.exit(bad?1:0)})();
