const {chromium}=require('playwright');let bad=[];const ck=(c,m)=>{if(!c)bad.push(m)};
(async()=>{const b=await chromium.launch();
async function pg(){const p=await b.newPage({viewport:{width:360,height:760}});p.on('pageerror',e=>bad.push(e.message));await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=new Date().toDateString()});return p}
let p=await pg();await p.goto('http://localhost:8765/#/s/muslim?idx');await p.waitForSelector('.fbhint',{timeout:20000});
let t=await p.textContent('.fbhint');console.log(t);ck(/\d+\/\d+/.test(t),'muslim two numberings');
await p.goto('http://localhost:8765/#/s/fadailahmad?idx');await p.waitForSelector('.fbhint',{timeout:20000});t=await p.textContent('.fbhint');console.log(t);ck(/ترقیم تراث خيرالقرون/.test(t),'ours label');
await p.fill('#csearch','1');await p.click('.bknum');await p.fill('#csearch','99999');await p.waitForTimeout(1500);ck(!(await p.$('.card .big')),'zero for too big');
p=await pg();await p.goto('http://localhost:8765/#/b');await p.waitForSelector('.tiles');await p.evaluate(()=>{const x=document.querySelector('#ipop');if(x)x.remove()});
await p.waitForTimeout(1500);console.log(await p.getAttribute('#q','placeholder'));
await p.click('text=حدیث نمبر');await p.waitForTimeout(1500);console.log(await p.getAttribute('#hfind','placeholder'));await p.fill('#hfind','999999');await p.click('.sfoot button:last-child');ck(!!(await p.$('#hfind')),'dialog stays on big number');
console.log(bad.length?'FAIL '+bad.join('|'):'PASS');await b.close()})()
