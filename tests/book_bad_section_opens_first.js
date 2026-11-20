// a remembered / old chapter number that the book does not have must not end in «یہ حدیث نہیں ملی» (seen on a phone for Silsila Ahadith Sahiha): the first chapter opens
const {chromium}=require('playwright');let bad=0;
(async()=>{const b=await chromium.launch();
for(const key of ['silsila','silsilaatraf','tafsirnoor']){
const c=await b.newContext({viewport:{width:390,height:900}});await c.addInitScript(k=>{localStorage.nosplash='1';localStorage.ui='ur';localStorage['rd:'+k]='9999'},key);
const p=await c.newPage();await p.goto('http://localhost:8765/index.html#/s/'+key+'/9999');await p.waitForTimeout(4000);
const t=await p.evaluate(()=>document.body.innerText);
if(/یہ حدیث نہیں ملی/.test(t)||!/فہرست ابواب/.test(t)){bad++;console.log('FAIL',key,t.slice(0,120).replace(/\n/g,' | '))}
await c.close()}
await b.close();process.exit(bad?1:(console.log('PASS book_bad_section_opens_first'),0))})();
