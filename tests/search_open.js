// Guard: after a hadith search the best group (lowest order) is open and shows its results at once; the others stay closed with a count pill
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});let bad=[];
p.on('pageerror',e=>bad.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/#/hs');await p.waitForSelector('#hsq',{timeout:15000});await p.waitForTimeout(5000);
await p.evaluate(()=>{document.querySelectorAll('.sheetbg,.sheet,#ipop').forEach(x=>x.remove());document.documentElement.classList.remove('sheetopen')});
await p.fill('#hsq','لا تغضب');await p.click('text=تلاش کریں');await p.waitForSelector('details.gsres',{timeout:20000});await p.waitForTimeout(9000);
const r=await p.evaluate(()=>{const d=[...document.querySelectorAll('details.gsres')];return{n:d.length,open:d.filter(x=>x.open).length,firstOpen:d[0]&&d[0].open,cards:d[0]?d[0].querySelectorAll('article,.card,.rno').length:0}});
if(r.n<2)bad.push('groups '+r.n);if(r.open!==1||!r.firstOpen)bad.push('open groups '+JSON.stringify(r));if(r.cards<1)bad.push('no results shown in open group');
await p.screenshot({path:'/tmp/srfinal.png'});console.log(bad.length?'FAIL '+bad.join(' | '):'PASS '+JSON.stringify(r));await b.close();process.exit(bad.length?1:0)})();
