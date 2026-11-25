const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage();let bad=0;const t=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
await p.addInitScript(()=>{localStorage.ui='ur'});await p.goto('http://localhost:8765/#/s/humaydiur/1');await p.waitForTimeout(3500);
const nm=await p.$eval('.ntabs .ntname',e=>e.textContent);t(/^١\. سیدنا ابوبکر/.test(nm),'name '+nm);
const tabs=await p.$$eval('.ntabs .trbtn',e=>e.map(x=>x.textContent));t(tabs.join('|')==='مختصر تعارف از: مولانا روشن دین بشیر|مختصر تعارف از: مولانا محمد احمد دلپذیر','tabs '+tabs);
const vis=async()=>p.$$eval('.ntabs .ntpan',e=>e.map(x=>!x.hidden));t((await vis()).join()==='true,false','first shown');
await p.$eval('.ntabs .trbtn:nth-child(2)',e=>e.click());t((await vis()).join()==='false,true','second shown');
t(!(await p.innerText('body')).includes('راویوں کا تعارف'),'old box gone');
const tr=await p.$$eval('.trbtn',e=>e.map(x=>x.textContent).filter(x=>/^مولانا/.test(x)));
await p.goto('http://localhost:8765/#/s/humaydiur/1');await b.close();process.exit(bad?1:0)})()
