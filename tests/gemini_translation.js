// «ترجمہ جیمنائی»: server function (mock database + mock Gemini) and the button in the hadith card
const fs=require('fs');const {chromium}=require('playwright');let bad=[];const ck=(c,m)=>{if(!c)bad.push(m)};
(async()=>{
// ---- server function with a mock environment
let src=fs.readFileSync('functions/api/htrans.js','utf8').replace(/^import .*$/m,'').replace(/export (async )?function/g,'$1function');
const mod=new Function('isOwner','crypto','fetch','AbortSignal','Response','URL',src+'\nreturn {onRequest,clean,usable};');
const tables={htrans:new Map(),ip:new Map(),use:new Map()};let calls=0,gem=true,owner=false;
const DB={prepare(sql){const o={args:[],bind(...a){o.args=a;return o},async run(){if(/^INSERT OR REPLACE INTO htrans/.test(sql))tables.htrans.set(o.args[0],{ur:o.args[1]});if(/INTO htrans_ip/.test(sql)){const k=o.args[0];const r=tables.ip.get(k);tables.ip.set(k,{n:(r?r.n:0)+1})}if(/INTO htrans_use/.test(sql)){tables.use.set(o.args[0],{n:(tables.use.get(o.args[0])||{n:0}).n+1})}return {}},async first(){if(/FROM htrans WHERE/.test(sql))return tables.htrans.get(o.args[0])||null;if(/FROM htrans_ip/.test(sql))return tables.ip.get(o.args[0])||null;if(/FROM htrans_use/.test(sql))return tables.use.get(o.args[0])||null;return null}};return o}};
const fetchMock=async()=>{calls++;return {ok:gem,status:gem?200:500,json:async()=>({candidates:[{content:{parts:[{text:'نبی صلی اللہ علیہ وسلم نے فرمایا ﷺ: اعمال کا دارومدار نیتوں پر ہے۔ سیدنا عمر رضی اللہ عنہ سے روایت ہے۔'}]}}]})}};
const m=mod(async()=>owner,crypto,fetchMock,AbortSignal,Response,URL);
const AR='عن عمر بن الخطاب رضي الله عنه قال سمعت رسول الله صلى الله عليه وسلم يقول إنما الأعمال بالنيات';
const post=(ar,o)=>m.onRequest({request:new Request('https://x.test/api/htrans',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://x.test','CF-Connecting-IP':o||'1.1.1.1'},body:JSON.stringify({ar})}),env:{DB,GEMINI_API_KEY:'k',HTRANS_USER:'2',HTRANS_DAILY:'100'}});
let r=await post(AR),j=await r.json();ck(r.status===200&&j.ur&&!/ﷺ/.test(j.ur)&&j.saved===false,'first translation '+r.status);
ck(/صلی اللہ علیہ وسلم/.test(j.ur),'symbol ﷺ written out');
r=await post(AR);j=await r.json();ck(j.saved===true&&calls===1,'second call comes from the saved copy, no new Gemini call ('+calls+')');
r=await post(AR.replace('عن','عَنْ'));j=await r.json();ck(j.saved===true&&calls===1,'harakat do not change the key');
r=await post(AR+' واحد');ck(r.status===200,'second new text allowed');
r=await post(AR+' اثنان');ck(r.status===429,'person limit after 2 new translations ('+r.status+')');
r=await post('hello world this is english text only');ck(r.status===400,'English text refused');
gem=false;r=await post(AR+' ثالث','2.2.2.2');ck(r.status===502,'Gemini failure -> 502');
ck(m.usable('نص عربي طويل جدا هنا','This is an English reply that is long enough to look like text'+' abc'.repeat(30))===false,'English answer is not usable');
// ---- the button in the hadith card
const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:430,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.newsSeen='20261122a';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur'}catch(e){}});
let posted=0;await p.route('**/api/htrans',async rt=>{posted++;await rt.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ur:'آزمائشی ترجمہ: اعمال کا دارومدار نیتوں پر ہے۔'})})});
await p.goto('http://localhost:8765/index.html#/s/humaydi/n/5');await p.waitForSelector('.mt.ar',{timeout:30000});
const has=await p.$('.gembtn');ck(!!has,'button on an Arabic-only hadith book');
if(has){ck((await has.textContent()).trim()==='ترجمہ جیمنائی','button name');await has.click();await p.waitForSelector('.gembox .tr',{timeout:8000});const t=await p.textContent('.gembox');ck(/آزمائشی ترجمہ/.test(t)&&/مشینی/.test(t),'translation + machine note shown');ck(posted===1,'one request');await has.click();ck(await p.$eval('.gembox',e=>e.hidden),'second tap hides it');await has.click();ck(posted===1,'shown again without a new request')}
await p.goto('http://localhost:8765/index.html#/s/muslim/n/5');await p.waitForSelector('.mt.ar',{timeout:30000});ck(!(await p.$('.gembtn')),'no button on a book that already has an Urdu translation');
await p.goto('http://localhost:8765/index.html#/s/tahdhibkamal/n/5');await p.waitForTimeout(2500);ck(!(await p.$('.gembtn')),'no button on a narrators book');
await b.close();
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS gemini_translation');process.exit(bad.length?1:0)})();
