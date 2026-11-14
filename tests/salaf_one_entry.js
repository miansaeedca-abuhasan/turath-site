// Salaf: a person is ONE entry. The detailed Abu Muslim al-Khawlani text sits in the place of his old short entry (same section, same title),
// his paragraphs show his name once in a search, and the old short rows are not searched any more
const {chromium}=require('playwright');let bad=[];const ok=(c,m)=>{if(!c)bad.push(m)};
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});p.on('pageerror',e=>bad.push('pageerror '+e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/siyar');await p.waitForFunction(()=>window.COLL&&COLL.bookSearch,null,{timeout:30000});await p.waitForTimeout(3000);
// data: one section for him, in the old place, no second «detailed» group at the end
const d=await p.evaluate(async()=>{const r=await fetch('coll/index.js').then(x=>x.text());const j=JSON.parse(r.slice(r.indexOf('(')+1,r.lastIndexOf(')')));const s=j.find(x=>x.key==='siyar');
 return {abu:s.sections.filter(x=>/أبو مسلم الخولاني/.test(x[4])),ids:s.sections.map(x=>x[0]),heads:s.heads.map(h=>h[1]),idx:s.sections.findIndex(x=>x[0]===54),count:s.count,last:s.sections[s.sections.length-1]}});
ok(d.abu.length===1&&d.abu[0][0]===54&&d.abu[0][3]-d.abu[0][2]+1>=8,'Abu Muslim is one section (id 54) with all the detailed paragraphs: '+JSON.stringify(d.abu));
ok(d.idx===53,'he stays in his place among the tabi\'in (index '+d.idx+')');
ok(!d.heads.some(h=>/تفصیلی سوانح/.test(h)),'no separate «detailed biographies» group at the end');
ok(new Set(d.ids).size===d.ids.length,'section ids are unique');
await p.evaluate(()=>COLL.bookSearch('siyar'));await p.waitForSelector('.sheet input.filter',{timeout:20000});
await p.fill('.sheet input.filter','ابو مسلم خولانی');await p.waitForSelector('.sheet .qsbar',{timeout:60000});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>[...document.querySelectorAll('.sheet .bsres .card')].filter(x=>x.querySelector('.rno')).slice(0,12).map(x=>({t:x.innerText.replace(/\s+/g,' '),h:x.querySelectorAll('.babbox').length,n:parseInt((x.querySelector('.hn')||{}).textContent,10)})));
ok(r.length>=8,'results found '+r.length);
const first=r.filter(x=>x.n>=2220&&x.n<=2227);ok(first.length>=5,'his own paragraphs come first '+first.length);ok(r.slice(0,first.length).every(x=>x.n>=2220&&x.n<=2227),'own paragraphs are at the top');
ok(first[0].h===1&&first.slice(1).every(x=>x.h===0),'one heading for the person, none repeated on the next paragraphs: '+first.map(x=>x.h).join());
ok(/أبو مسلم الخولاني/.test(first[0].t),'the person\'s heading is on the first result');
ok(!first.some(x=>/مَاتَ أَبُو مُسْلِمٍ بِأَرْضِ الرُّوْمِ/.test(x.t)&&/سیر اعلام النبلاء \(4\/7\)/.test(x.t)),'the old short rows (printed 4/7 label) are not shown');
const nums=await p.evaluate(()=>[...document.querySelectorAll('.sheet .bsres .card .hn')].map(x=>parseInt(x.textContent,10)).filter(Boolean));
ok(nums.length>=8&&!nums.some(n=>n>=139&&n<=146),'no old short row (139-146) in the results: '+nums.slice(0,12));
// the flour story of the old entry is kept in the detailed one
await p.fill('.sheet input.filter','عطاء الخراساني');await p.waitForTimeout(1800);
ok(await p.evaluate(()=>/دقيق|دَقِيْقٌ/.test(document.querySelector('.sheet .bsres').innerText)),'the dirham-and-flour story of the old short entry is inside the detailed one');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
