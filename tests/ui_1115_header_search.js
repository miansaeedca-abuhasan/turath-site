// guard: the header search icon (#hsbtn) is visible on home, reader, library list/book pages (phone width); dirasa has no border; prev/next pill present in readers
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});let bad=0;
for(const h of ['#/','#/h/3','#/s/bukhari','#/s/bukhari/n/3']){await p.goto('http://localhost:8765/index.html'+h);await p.waitForTimeout(1500);
 const v=await p.evaluate(()=>{const e=document.getElementById('hsbtn');return !!e&&e.offsetParent!==null});if(!v){console.log('FAIL hsbtn hidden at',h);bad++;}}
await p.goto('http://localhost:8765/index.html#/h/3');await p.waitForTimeout(1500);
if(!await p.evaluate(()=>!!document.querySelector('.hpill'))){console.log('FAIL hpill missing');bad++;}
const bd=await p.evaluate(()=>{const d=document.createElement('details');d.className='dirasa';document.body.append(d);const s=getComputedStyle(d).borderTopWidth;d.remove();return s});
if(parseFloat(bd)!==0){console.log('FAIL dirasa border',bd);bad++;}
await p.goto('http://localhost:8765/index.html#/');await p.waitForTimeout(800);await p.click('#hsbtn');await p.waitForTimeout(800);
if(await p.evaluate(()=>location.hash)!=='#/hs'){console.log('FAIL home search route');bad++;}
console.log(bad?'FAILED':'OK');await b.close();process.exit(bad?1:0)})();
