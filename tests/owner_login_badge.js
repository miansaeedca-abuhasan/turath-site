// founder login: English login page, eye button, role badge after sign-in (editor blue, founder green/orange with pending count), gone after sign-out
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let bad=[];
for(const role of ['founder','editor']){
const p=await b.newPage();let signed=false;
await p.route('**/api/owner*',r=>{const a=new URL(r.request().url()).searchParams.get('a');const j=o=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(o)});
 if(a==='login'){signed=true;return j({ok:true,user:'abuhasan',role})}if(a==='logout'){signed=false;return j({ok:true})}
 if(a==='me')return j({ok:signed,setup:true,role,user:'abuhasan',pending:role==='founder'?2:undefined});if(a==='pending')return j({list:[{id:1,k:'banner',v:{on:true},who:'ed@x.com',t:Date.now()}]});return j({})});
await p.goto('http://localhost:8765/#/owner');await p.waitForSelector('#ownerPwEye',{timeout:20000});
const t=await p.evaluate(()=>document.querySelector('#ownerPwEye').closest('.card').innerText);
if(/[؀-ۿ]/.test(t))bad.push('login card has Urdu/Arabic');
if(!/Founder Login/.test(t)||!/Sign in/.test(t))bad.push('English labels missing');
if(await p.$('#founderBadge'))bad.push('badge before login');
const ty=()=>p.evaluate(()=>document.querySelector('#ownerPwEye').parentElement.querySelector('input').type);
if(await ty()!=='password')bad.push('start not hidden');
await p.click('#ownerPwEye');if(await ty()!=='text')bad.push('not shown');
await p.fill('input[type=email]','abuhasan@example.com');await p.fill('#ownerPwEye >> xpath=../input','x');
await p.click('text=Sign in');await p.waitForSelector('#founderBadge',{timeout:5000}).catch(()=>bad.push(role+': no badge after login'));
await p.waitForTimeout(800);
const bt=await p.evaluate(()=>(document.getElementById('founderBadge')||{}).textContent||'');
if(!new RegExp(role==='editor'?'Editor':'Founder').test(bt)||!/abuhasan/.test(bt))bad.push(role+': badge text '+bt);
if(role==='founder'&&!/\d pending/.test(bt))bad.push('pending count missing: '+bt);
const tabs=await p.evaluate(()=>[...document.querySelectorAll('.lbtn')].map(x=>x.textContent).join('|'));
if(role==='editor'&&/منظوری|زائرین|ڈائری|تربیہ/.test(tabs))bad.push('editor sees founder-only tabs: '+tabs);
if(role==='founder'&&!/منظوری/.test(tabs))bad.push('founder lacks approval tab: '+tabs);
await p.reload();await p.waitForSelector('#founderBadge',{timeout:8000}).catch(()=>bad.push(role+': badge missing after reload'));
signed=false;await p.reload();await p.waitForTimeout(1500);if(await p.$('#founderBadge'))bad.push(role+': badge stays after session ended');
await p.close();}
console.log(bad.length?'FAIL '+bad.join('|'):'PASS owner_login_badge');await b.close();process.exit(bad.length?1:0)})();
