// Salaf (siyar): every person is ONE box (never separate cards, no foreign heading); the detailed biographies
// (tools/salaf/bio) are one row with ✦-headed parts + footnotes; a name search lists the person first.
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const fs=require('fs');const S=fs.readFileSync('coll/index.js','utf8'),L=JSON.parse(S.slice(S.indexOf('(')+1,S.lastIndexOf(')')));
const e=L.find(x=>x.key==='siyar');
const rd=(lg)=>{let o=[];for(const f of e.files[lg]){const t=fs.readFileSync('coll/'+f[2],'utf8');o=o.concat(JSON.parse(t.slice(t.indexOf('",[')+2,t.lastIndexOf(')'))))}return o};
const ar=rd('ar'),ur=rd('ur');
ck(ar.length===e.count&&ur.length===e.count&&e.kind.length===e.count,'row counts equal');
ck(ar.every((r,i)=>r[0]===i+1)&&ur.every((r,i)=>r[0]===i+1),'rows contiguous');
const u=ur[e.count-1],a=ar[e.count-1];
ck(u[1].startsWith('§شخصیت کا خلاصہ')&&(u[1].match(/^§/gm)||[]).length>=10,'Uways row: header card + headed parts');
ck(u[3]&&u[3].fn&&/^\(1\) /m.test(u[3].fn)&&(u[1].match(/\(\d{1,2}\)/g)||[]).length===(u[3].fn.match(/^\(\d+\) /gm)||[]).length,'footnote marks = notes');
ck(!/[A-Za-z]{2}/.test(u[1]+u[3].fn),'no Latin letters');
ck(a[1].split('\n').length>=5&&/^مصدر: سیر/.test(a[2]),'Arabic source paragraphs + label');
ck(!/\{\{|\}\}|\x01|\x02/.test(u[1]+u[3].fn),'no build placeholders');
const sec=e.sections.find(x=>x[0]===57);ck(sec[2]===e.count&&sec[3]===e.count&&sec[1].includes('اویس'),'section 57 = the one row');
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:420,height:900}});
await pg.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
for(const no of [57,32,54]){
 await pg.goto('http://localhost:8765/index.html#/s/siyar/'+no);await pg.waitForSelector('.sbio',{timeout:30000});await pg.waitForTimeout(800);
 const r=await pg.evaluate(()=>({box:document.querySelectorAll('.sbio').length,cards:document.querySelectorAll('#list .card:not(.sbio)').length,t:document.querySelector('.sbio-t').innerText,sub:document.querySelectorAll('.sbio .subh').length,fn:document.querySelectorAll('.sbio .pfnbox').length}));
 ck(r.box===1&&r.cards===0,no+': one box, no separate cards '+JSON.stringify(r));ck(!/عمر بن خطاب/.test(r.t)||no===0,no+': title is the person ('+r.t+')');
 if(no===57)ck(r.sub>=10&&r.fn===1,'57 headings and one notes box');}
await pg.goto('http://localhost:8765/#/s/siyar');await pg.waitForFunction(()=>window.COLL&&COLL.bookSearch,null,{timeout:30000});await pg.waitForTimeout(2500);
await pg.evaluate(()=>COLL.bookSearch('siyar'));await pg.waitForSelector('.sheet input.filter');await pg.fill('.sheet input.filter','اویس قرنی');await pg.waitForSelector('.sheet .sbio-hit',{timeout:60000});
const h=await pg.evaluate(()=>[...document.querySelectorAll('.sheet .sbio-hit .sbio-t')].map(x=>x.innerText));
ck(/اویس قرنی/.test(h[0]||''),'search: the person first: '+h.join(' | '));ck(new Set(h).size===h.length,'search: one box per person');
await br.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
