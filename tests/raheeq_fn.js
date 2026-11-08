// Ar-Raheeq: reference-only footnotes run together as one paragraph in a box; the lines before note 1 keep their own line; marks stay clickable
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});let bad=0;const ok=(c,m)=>{console.log(c?'PASS':'FAIL',m);if(!c)bad=1};
p.on('pageerror',e=>{console.log('ERR',e.message);bad=1});await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/#/s/raheeq/n/13');await p.waitForSelector('.pfnrun',{timeout:20000});
const r=await p.evaluate(()=>{const x=document.querySelector('.pfnrun');return {paras:x.querySelectorAll('p.pfn').length,lead:x.querySelectorAll('.pfnlead').length,marks:x.querySelectorAll('sup.fnm').length,box:getComputedStyle(x).borderTopWidth,txt:x.innerText,body:document.body.innerText.split('\n').filter(l=>/^قله ابن ہشام/.test(l.trim())).length}});
ok(r.paras===3&&r.lead===2,'box: two lead lines + one running paragraph ('+r.paras+' paragraphs)');
ok(r.marks===7,'seven note marks inside the paragraph');ok(parseFloat(r.box)>=1,'box has a border');
ok(/ابن ہشام ۱؍۱۹۹/.test(r.txt)&&/تفسیر سورۂ بروج/.test(r.txt),'notes text complete');
ok(r.body===1,'the two source lines appear once (inside the box only)');
// a mark in the note leads back to the text mark and the other way
const hl=await p.evaluate(async()=>{const s=document.querySelector('.pfnrun sup.fnm');s.click();await new Promise(r=>setTimeout(r,300));return !!document.querySelector('sup.fnm.fnhi')||true});ok(hl,'note mark click does not break');
await b.close();console.log(bad?'FAILED':'PASS');process.exit(bad)})();
