// Guard: the Jami muqaddima page is a book-like page (title, contents, padded body, no justified stretching) and the Quran Encyclopedia has a title page, chapter-style front matter and ruled entries
const {chromium}=require('playwright');
(async()=>{let bad=[];const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});
p.on('pageerror',e=>bad.push('pageerror '+e.message));await p.addInitScript(()=>{localStorage.ui='ur'});
const clean=()=>p.evaluate(()=>document.querySelectorAll('.sheetbg,.sheet,#ipop').forEach(x=>x.remove()));
await p.goto('http://localhost:8765/#/madkhal');await p.waitForTimeout(6000);await clean();
const m=await p.evaluate(()=>{const b=document.querySelector('.mdk-body'),r=b&&b.getBoundingClientRect(),cs=b&&getComputedStyle(b);return b?{pad:parseFloat(cs.paddingRight),ta:cs.textAlign,h:document.querySelectorAll('.mdk-h').length,toc:document.querySelectorAll('.mdk-toc a').length,title:!!document.querySelector('.mdk-title h2'),w:r.width}:null});
if(!m)bad.push('no .mdk-body');else{if(m.pad<14)bad.push('body not padded '+m.pad);if(m.ta==='justify')bad.push('text is justified');if(m.h<10)bad.push('headings '+m.h);if(m.toc<10)bad.push('toc '+m.toc);if(!m.title)bad.push('no title page')}
await p.goto('http://localhost:8765/#/s/qenc/1');await p.waitForTimeout(6000);await clean();
const q=await p.evaluate(()=>({tp:!!document.querySelector('.qe-tp .qe-au'),front:document.querySelectorAll('.qe-front .qe-title').length,t1:(document.querySelector('.qe-t1')||{}).textContent}));
if(!q.tp)bad.push('no qenc title page');if(q.front<5)bad.push('qenc front matter '+q.front);if(q.t1!=='قرآن انسائیکلوپیڈیا')bad.push('title '+q.t1);
await p.goto('http://localhost:8765/#/s/qenc/2');await p.waitForTimeout(6000);await clean();
const e=await p.evaluate(()=>{const a=[...document.querySelectorAll('.qe-entry')];return {n:a.length,bb:a[0]?getComputedStyle(a[0]).borderBottomWidth:'',t:a[0]&&a[0].querySelector('.qe-title').textContent}});
if(e.n<3)bad.push('entries '+e.n);if(parseFloat(e.bb)<1)bad.push('no rule between entries');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
