// iPhone X / old Safari (< 16.4) cannot parse regex lookbehind: one such regex literal stops a whole script (blank page).
// 1) no lookbehind in any regex literal/new RegExp except the guarded try in RRE; 2) the page still works when RegExp refuses lookbehind.
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
for(const f of ['index.html',...fs.readdirSync('.').filter(x=>x.endsWith('.js'))]){const t=fs.readFileSync(f,'utf8');const n=(t.match(/\(\?<[=!]/g)||[]).length;ck(n===(f==='index.html'?1:0),f+': lookbehind count '+n)}
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:390,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.splashT=String(Date.now());const R=RegExp;window.RegExp=new Proxy(R,{construct(t,a,n){if(typeof a[0]==='string'&&/\(\?<[=!]/.test(a[0]))throw new SyntaxError('Invalid regular expression: lookbehind');return Reflect.construct(t,a,n)}})});
await p.goto('http://localhost:8765/');await p.waitForTimeout(5000);
const r=await p.evaluate(()=>({tiles:document.querySelectorAll('.tile,.hometile,a.tl').length}));ck(r.tiles>=8,'home tiles shown '+r.tiles);ck(errs.length===0,'no page errors: '+errs.slice(0,3));
await p.goto('http://localhost:8765/#/hb');await p.waitForTimeout(2500);ck(!errs.length,'hadith books page no errors '+errs.slice(0,2));
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
