const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:390,height:800}});let bad=0;await p.addInitScript(()=>{localStorage.ui='ur'});await p.goto('http://localhost:8765/');await p.waitForTimeout(9000);
const r=await p.$eval('.tick',e=>{const t=e.querySelector('.ti'),a=e.getBoundingClientRect(),c=t.getBoundingClientRect();return{fs:parseFloat(getComputedStyle(t).fontSize),h:a.height,th:c.height}});
if(r.fs>13||r.th>r.h-2){bad=1;console.log('FAIL',r)}console.log(bad?'':'ok',r);await b.close();process.exit(bad)})()
