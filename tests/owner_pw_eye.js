// founder login: eye button shows/hides the password
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();let bad=[];
await p.route('**/api/owner*',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:false,setup:false})}));
await p.goto('http://localhost:8765/#/owner');await p.waitForSelector('#ownerPwEye',{timeout:20000});
const ty=()=>p.evaluate(()=>document.querySelector('#ownerPwEye').parentElement.querySelector('input').type);
if(await ty()!=='password')bad.push('start not hidden');
await p.fill('#ownerPwEye >> xpath=../input','abc123');
await p.click('#ownerPwEye');if(await ty()!=='text')bad.push('not shown');
await p.click('#ownerPwEye');if(await ty()!=='password')bad.push('not hidden again');
console.log(bad.length?'FAIL '+bad.join('|'):'PASS owner_pw_eye');await b.close();process.exit(bad.length?1:0)})();
