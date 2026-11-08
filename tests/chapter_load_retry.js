// Guard: a chapter data file that fails once is asked for again under a fresh address; if it keeps failing, the chapter shows the note with the file name and status instead of a blank page.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let bad=[];
for(const mode of ['once','always']){
 const ctx=await b.newContext({viewport:{width:420,height:900}}),p=await ctx.newPage();let hits=0;
 await ctx.route(/raheeq_ur_2_[0-9a-f]+\.js/,r=>{hits++;if(mode==='once'&&hits===1)return r.abort();if(mode==='always')return r.fulfill({status:503,body:'x'});r.continue()});
 await p.addInitScript(()=>{if(!sessionStorage.a){localStorage.ui='ur';sessionStorage.a=1}});
 await p.goto('http://localhost:8765/#/s/raheeq/9');await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>({items:document.querySelectorAll('.bkitem').length,note:(document.querySelector('#view .note')||{}).textContent||''}));
 if(mode==='once'&&r.items<1)bad.push('no retry recovery '+JSON.stringify(r));
 if(mode==='always'&&!(r.items===0&&/raheeq_ur_2_/.test(r.note+(await p.evaluate(()=>(window.LOADERR||[]).join())))))bad.push('no diagnostic '+JSON.stringify(r));
 await ctx.close();
}
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
