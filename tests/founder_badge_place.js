// Founder badge: never over page content. Phone/app: strip under the top bar, after 5 s it slides left and only the star stays.
// Wide screen: sits just above the prayer-times panel.
const {chromium}=require('playwright');let bad=[];const ok=(c,m)=>{if(!c){bad.push(m);console.log('FAIL',m)}};
(async()=>{
 const b=await chromium.launch();
 const mk=async(w,h)=>{const c=await b.newContext({viewport:{width:w,height:h}});await c.addInitScript(()=>{try{localStorage.setItem('tk_founder',JSON.stringify({n:'miansaeedca',r:'founder',p:0}));localStorage.nosplash='1'}catch(e){}});const p=await c.newPage();await p.route('**/api/owner**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,user:'miansaeedca',role:'founder',pending:0})}));await p.goto('http://localhost:8765/index.html');await p.waitForSelector('#founderBadge',{timeout:8000});return p};
 // phone
 let p=await mk(390,800);await p.waitForTimeout(800);
 let r=await p.evaluate(()=>{const b=document.getElementById('founderBadge').getBoundingClientRect(),h=document.querySelector('header.appbar').getBoundingClientRect();return {bt:b.top,bw:b.width,hb:h.bottom,inStrip:!!document.querySelector('#founderStrip #founderBadge')}});
 ok(r.inStrip,'phone: badge lives in its own strip');ok(r.bt>=r.hb-1,'phone: badge is below the top bar ('+r.bt+' vs '+r.hb+')');ok(r.bw>120,'phone: full badge first ('+r.bw+')');
 await p.waitForTimeout(5800);
 r=await p.evaluate(()=>{const b=document.getElementById('founderBadge').getBoundingClientRect();return {bw:b.width,bl:b.left,txt:getComputedStyle(document.querySelector('#founderBadge .ftx')).opacity}});
 ok(r.bw<40&&r.bl<20,'phone: after 5 s only the star stays at the left ('+r.bw+','+r.bl+')');ok(+r.txt===0,'phone: text hidden');
 await p.context().close();
 // desktop
 p=await mk(1400,800);await p.waitForSelector('.slt',{timeout:8000}).catch(()=>{});await p.waitForTimeout(2200);
 r=await p.evaluate(()=>{const s=document.querySelector('.slt'),b=document.getElementById('founderBadge').getBoundingClientRect();if(!s)return null;const q=s.getBoundingClientRect();return {bb:b.bottom,bl:b.left,bw:b.width,st:q.top,sl:q.left}});
 ok(r,'desktop: prayer panel present');if(r){ok(r.bb<=r.st+1,'desktop: badge ends above the panel ('+r.bb+' vs '+r.st+')');ok(Math.abs(r.bl-r.sl)<3,'desktop: badge aligned with the panel ('+r.bl+' vs '+r.sl+')');ok(r.bw>120,'desktop: badge stays full');}
 await b.close();process.exit(bad.length?1:(console.log('PASS founder_badge_place'),0));
})();
