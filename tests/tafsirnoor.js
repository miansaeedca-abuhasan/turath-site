// Tafsir Noor al-Huda vol 1: listed with the publisher, opens, the intro has the publisher's note, no honorific glyph junk, salawat in full
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/hb');await p.waitForSelector('.hbrow',{timeout:90000});await p.waitForTimeout(2500);
const d=await p.evaluate(async()=>{const x=await fetch('coll/index.js').then(r=>r.text());const a=JSON.parse(x.slice(x.indexOf('COLLS(')+6,x.lastIndexOf(')')));const e=a.find(e=>e.key==='tafsirnoor');
 let rows=[];for(const f of e.files.ur){const t=await fetch('coll/'+f[2]).then(r=>r.text());const j=JSON.parse(t.slice(t.indexOf(',[[')+1,t.lastIndexOf(')')));rows=rows.concat(j)}
 const all=rows.map(r=>r[1]).join('\n');return {n:rows.length,count:e.count,pub:e.pub&&e.pub.ur,intro:e.intro.map(s=>s[0]),last:e.intro[0][1].slice(-2),sal:(all.match(/صلی اللہ علیہ وسلم/g)||[]).length,glued:(all.match(/اللہ علیہ وسلم[ا-ی]/g)||[]).length,arsal:(all.match(/صلى الله عليه وسلم/g)||[]).length,junk:(all.match(/(?:رسول اللہ|نبی کریم) (?:سلیم|ایم|سلام|ملی|مالی|میلی|لیم)(?= )/g)||[]).length}});
ck(d.n===d.count&&d.n>300,'rows '+d.n+' vs '+d.count);
ck(/انصار السنۃ/.test(d.pub),'publisher');
ck(d.intro.join()==='عرض ناشر,تقریظ','intro '+d.intro);
ck(/انصار السنه|انصار السنۃ/.test(d.last.join(' ')),'publisher name at the end of the note');
ck(d.sal>1400,'salawat count '+d.sal);ck(d.glued===0,'glued salawat '+d.glued);ck(d.arsal===0,'arabic spelling salawat '+d.arsal);ck(d.junk===0,'honorific junk '+d.junk);
ck(!errs.length,'js errors '+errs[0]);
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
