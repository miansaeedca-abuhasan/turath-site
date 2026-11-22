const {chromium}=require('playwright');
(async()=>{const br=await chromium.launch();let bad=0;
for(const [name,vp] of [['phone',{width:390,height:800}],['desktop',{width:1400,height:900}]]){
 const ctx=await br.newContext({viewport:vp,serviceWorkers:'block'});const pg=await ctx.newPage();
 let posted=null;
 await pg.route('**/api/report',r=>{posted=JSON.parse(r.request().postData());r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});});
 const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
 await pg.addInitScript(()=>{localStorage.ui='ur';window.__shared=null;navigator.share=async o=>{window.__shared=o;};});
 await pg.goto('http://localhost:8765/index.html#/');await pg.waitForSelector('.gpshare',{timeout:15000}).catch(()=>{});
 const sh=await pg.$('.gpshare');if(!sh){console.log(name,'FAIL no share button');bad++;}else{await sh.evaluate(e=>e.click());const o=await pg.evaluate(()=>window.__shared);if(!o||!/^https?:/.test(o.url||'')){console.log(name,'FAIL share payload',o);bad++;}}
 await pg.goto('http://localhost:8765/index.html#/h/1');await pg.waitForSelector('.acts .rpt',{timeout:20000}).catch(()=>{});
 const rb=await pg.$('.acts .rpt');if(!rb){console.log(name,'FAIL no report button on hadith');bad++;}else{
  await rb.evaluate(e=>e.click());await pg.fill('.rpbox textarea','test correction note');await pg.evaluate(()=>document.querySelector('.rpbox button:not(.rpx)').click());await pg.waitForTimeout(500);
  if(!posted||posted.note!=='test correction note'||!posted.place){console.log(name,'FAIL post',posted);bad++;}
  if(await pg.$('.rpbg')){console.log(name,'FAIL dialog still open');bad++;}}
 await pg.goto('http://localhost:8765/index.html#/s/shaansahabaur');await pg.waitForSelector('.acts .rpt',{timeout:25000}).catch(()=>{});
 if(!(await pg.$('.acts .rpt'))){console.log(name,'FAIL no report button in coll card');bad++;}
 if(errs.length){console.log(name,'errors',errs.slice(0,2));bad++;}
 await ctx.close();}
await br.close();console.log(bad?'FAILED':'OK share_report');process.exit(bad?1:0)})();
