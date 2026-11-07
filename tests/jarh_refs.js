const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});let bad=0;const ok=(c,m)=>{console.log(c?'PASS':'FAIL',m);if(!c)bad=1};
p.on('pageerror',e=>{console.log('ERR',e.message);bad=1});await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/#/n/2');await p.waitForTimeout(8000);
const r=await p.evaluate(()=>({q:document.querySelectorAll('.nj').length,refs:[...document.querySelectorAll('.nj .nref')].map(a=>a.getAttribute('href'))}));
ok(r.q>0,'quotes shown');ok(r.refs.length>0&&r.refs.length<r.q,'some (not all) quotes have refs: '+r.refs.length+'/'+r.q);
ok(r.refs.every(h=>/^#\/s\/(rijal\/\d+|\w+\/n\/\d+)$/.test(h)),'ref hrefs well-formed');
await b.close();process.exit(bad)})();
