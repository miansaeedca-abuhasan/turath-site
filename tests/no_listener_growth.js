// the app froze after a few minutes of use: a hashchange listener was registered inside applyLook(), so every page change doubled the number of listeners.
setTimeout(()=>{console.log('FAIL test hung (the page froze)');process.exit(1)},150000);
// Guard: many page changes must not make the listener count grow, and a page change must stay fast.
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{console.log(c?'PASS':'FAIL',m);if(!c)bad++};
(async()=>{const b=await chromium.launch(),c=await b.newContext({viewport:{width:412,height:800},serviceWorkers:'block'}),p=await c.newPage();
const cd=await c.newCDPSession(p);await cd.send('Performance.enable');
await p.addInitScript(()=>{localStorage.nosplash='1';localStorage.ui='ur';window.__hc=0;const o=EventTarget.prototype.addEventListener;EventTarget.prototype.addEventListener=function(t){if(t==='hashchange')window.__hc++;return o.apply(this,arguments)}});
await p.goto('http://localhost:8765/#/');await p.waitForTimeout(2500);
const L=async()=>{await cd.send('HeapProfiler.collectGarbage');await p.waitForTimeout(300);return (await cd.send('Performance.getMetrics')).metrics.find(x=>x.name==='JSEventListeners').value};
const go=async h=>{await p.evaluate(h=>location.hash=h,h);await p.waitForTimeout(500)};
const R=['#/hb','#/q','#/','#/s/bukhari','#/','#/salaf'];
for(const h of R)await go(h);const a=await L(),hc0=await p.evaluate(()=>window.__hc);
const t0=Date.now();for(let i=0;i<3;i++)for(const h of R)await go(h);const dt=Date.now()-t0;
const z=await L(),hc1=await p.evaluate(()=>window.__hc);
ck(z-a<40,'listeners do not grow with navigation ('+a+' -> '+z+')');
ck(hc1-hc0<=2,'no new hashchange listeners while navigating ('+hc0+' -> '+hc1+')');
ck(dt<18*500+9000,'18 page changes stay fast ('+dt+' ms)');
await b.close();process.exit(bad?1:0)})();
