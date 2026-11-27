// short narrator card on hover (desktop) and long press (phone) (owner 27-11-2026)
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
for(const mob of [false,true]){
const c=await b.newContext(mob?{viewport:{width:390,height:844},hasTouch:true,isMobile:true}:{viewport:{width:1200,height:800}});const p=await c.newPage();
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});
await p.goto('http://localhost:8765/index.html#/c/1/0');await p.waitForSelector('a.rawi',{timeout:20000});await p.waitForTimeout(5000);
await p.evaluate(()=>document.querySelectorAll('.sheetbg,.sheet').forEach(x=>x.remove()));const n=await p.locator('a.rawi.nmatch').count();ok(n>0,(mob?'phone':'desktop')+' matched narrators '+n);
if(n){const a=p.locator('a.rawi.nmatch').first();
 if(!mob){await a.hover();await p.waitForSelector('.ntip.on',{timeout:5000}).catch(()=>{});}
 else{await p.evaluate(()=>{const a=document.querySelector('a.rawi.nmatch');a.dispatchEvent(new Event('touchstart',{bubbles:true}))});await p.waitForSelector('.ntip.on',{timeout:5000}).catch(()=>{});}
 const t=await p.locator('.ntip.on').count();ok(t===1,(mob?'phone':'desktop')+' card shown');
 if(t){const txt=await p.locator('.ntip.on').innerText();ok(txt.length>12,'card text '+txt.slice(0,40));
  const box=await p.locator('.ntip.on').boundingBox();ok(box&&box.x>=0&&box.x+box.width<=(mob?390:1200)+1,'inside screen');
  if(!mob){await p.mouse.move(5,5);await p.waitForTimeout(500);ok(await p.locator('.ntip.on').count()===0,'hides');}
  else{ok(await p.locator('.nsheet').count()===0,'long press did not open the page');}}}
await c.close()}
await b.close();console.log(bad?'FAILED':'OK narrator_hover_card');process.exit(bad?1:0)})();
