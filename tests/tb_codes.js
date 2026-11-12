const {chromium}=require('playwright');let bad=[];const ck=(c,m)=>{if(!c)bad.push(m)};
(async()=>{const b=await chromium.launch(),ctx=await b.newContext({viewport:{width:360,height:760},acceptDownloads:true}),p=await ctx.newPage();p.on('pageerror',e=>bad.push(e.message));
const calls=[];
await p.route('**/api/tarbiyat',async r=>{const j=JSON.parse(r.request().postData());calls.push(j);let o={ok:1};
 if(j.a==='create')o={ok:1,role:'parent',family:j.family,me:null,acts:[],reminds:[],token:'t',parentCode:'ABCD2345',kids:[{id:7,name:j.kids[0],code:'KID234'}]};
 await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(o)})});
await p.goto('http://localhost:8765/tarbiyat.html');await p.waitForSelector('text=خاندان');
await p.click('.card button.sec:has-text("خاندان")');await p.fill('input[placeholder="مثلاً: ہمارا گھر"]','گھر');await p.fill('input[placeholder="بچے کا نام"]','علی');
await p.click('button:has-text("چارٹ بنائیں")');await p.waitForSelector('.printme');
const t=await p.textContent('.printme');ck(/ABCD2345/.test(t)&&/KID234/.test(t),'codes shown');
const btns=await p.evaluate(()=>[...document.querySelectorAll('.printme button')].map(x=>x.textContent));console.log(btns);
ck(btns.includes('پرنٹ')&&btns.includes('تصویر محفوظ کریں')&&btns.some(x=>x.includes('پیچھے')),'buttons');
const dl=p.waitForEvent('download');await p.click('button:has-text("تصویر محفوظ کریں")');const d=await dl;const path=await d.path();const sz=require('fs').statSync(path).size;console.log('png',sz);ck(sz>5000&&d.suggestedFilename().endsWith('.png'),'image saved');
await p.click('button:has-text("پیچھے")');await p.fill('.card input >> nth=1','احمد');await p.click('button:has-text("محفوظ کریں اور کوڈ دیکھیں")');await p.waitForSelector('.printme');
const t2=await p.textContent('.printme');ck(/احمد/.test(t2)&&/ABCD2345/.test(t2)&&/KID234/.test(t2),'renamed, same codes');
ck(calls.some(c=>c.a==='kidname'&&c.name==='احمد'&&c.kid===7),'kidname called');ck(!calls.some(c=>c.a==='kidcode'||c.a==='parentcode'),'no new codes');
await p.setViewportSize({width:360,height:760});const w=await p.evaluate(()=>document.documentElement.scrollWidth);ck(w<=362,'fits phone '+w);
console.log(bad.length?'FAIL '+bad.join('|'):'PASS');
await b.close()})()
