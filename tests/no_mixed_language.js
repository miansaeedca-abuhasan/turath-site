// owner 26-11-2026: no other language inside a UI language (tafsir hub, surah list, book names)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let bad=0;
const chk=async(ui,hash,re,what)=>{const c=await b.newContext();const p=await c.newPage();
 await p.addInitScript(u=>{localStorage.ui=u;localStorage.newsSeen='20261125b';localStorage.newsDay=new Date().toDateString();},ui);
 await p.goto('http://localhost:8765/index.html'+hash);await p.waitForTimeout(2500);
 const t=await p.evaluate(()=>document.body.innerText);const m=t.match(re);
 if(m){bad++;console.log('FAIL',ui,hash,what,m[0]);}else console.log('ok',ui,hash,what);await c.close();};
await chk('en','#/q/tafsir',/[؀-ۿ]/,'arabic script in English tafsir hub');
await chk('ur','#/q',/Al-[A-Z]/,'latin surah name in Urdu list');
await chk('ar','#/q',/Al-[A-Z]/,'latin surah name in Arabic list');
await chk('ar','#/q/tafsir',/Ibn Kathir|Jalalayn/,'latin tafsir name in Arabic UI');
await chk('ur','#/hb',/HadeethEnc/,'latin in Urdu book name');
await chk('ur','#/q/tafsir',/hadith|Ahadith/i,'hadith counts on tafsir rows');
await b.close();if(bad)process.exit(1);console.log('ALL OK');})();
