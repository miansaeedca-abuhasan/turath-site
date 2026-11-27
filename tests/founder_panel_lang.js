// Founder panel (#/owner): Urdu when the app language is Urdu, English otherwise (owner 26-11-2026). The server is mocked.
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();
for(const [ui,ur] of [['ur',true],['en',false],['ar',false]]){
 const c=await b.newContext({viewport:{width:420,height:900},serviceWorkers:'block'});const p=await c.newPage();
 await p.route('**/api/owner*',r=>{const a=new URL(r.request().url()).searchParams.get('a');
  const j=a==='me'?{ok:true,user:'t',role:'founder',pending:2}:a==='pub'?{}:{ok:true};r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(j)})});
 await p.route('**/api/diary*',r=>r.fulfill({status:200,contentType:'application/json',body:'{"institutions":113,"active30":113,"teachers":49,"parents":76,"students":275}'}));
 await p.route('**/api/tarbiyat*',r=>r.fulfill({status:200,contentType:'application/json',body:'{"families":39,"kids":81,"active7":9}'}));
 await p.addInitScript(u=>{try{localStorage.ui=u;localStorage.newsSeen='20261126a';localStorage.setItem('owner',JSON.stringify({n:'t'}))}catch(e){}},ui);
 await p.goto('http://localhost:8765/#/owner');await p.reload();
 await p.waitForSelector('.card h2',{timeout:30000}).catch(()=>{});
 const T=()=>p.evaluate(()=>document.querySelector('.card h2')?document.querySelector('.card h2').closest('.card').innerText:'');
 let t=await T();
 ck(ur?/بانی پینل/.test(t):/Founder panel/.test(t)&&/Log out/.test(t)&&/Announcement/.test(t)&&/Approvals \(2\)/.test(t),ui+': title/tabs');
 ck(ur||!/[؀-ۿ]/.test(t.replace(/(Urdu|اردو)/g,'')),ui+': no Urdu letters left in English panel  '+(ur?'':(t.match(/[؀-ۿ]+/g)||[]).join(' ')));
 const tabs=ur?['خبریں','چلتی پٹی','زائرین','تصحیح کی اطلاعات','ڈائری اقرار نامے','تربیہ پیغامات','متن کی اصلاح','ترتیبات']:['News','Ticker','Visitors','Correction reports','Diary pledges','Tarbiyah messages','Text corrections','Settings'];
 for(const n of tabs){await p.getByRole('button',{name:n,exact:true}).first().click().catch(()=>ck(false,ui+': tab '+n));await p.waitForTimeout(400);
  const x=await T();if(!ur)ck(!/[؀-ۿ]/.test(x.replace(/(Urdu|اردو|العربية)/g,'')),ui+': tab '+n+' has Urdu: '+(x.match(/[؀-ۿ]+/g)||[]).slice(0,8).join(' '));}
 if(!ur){const d=await p.evaluate(()=>document.querySelector('.card h2').closest('.card').getAttribute('dir'));ck(d==='ltr',ui+': ltr')}
 await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS founder_panel_lang')})();
