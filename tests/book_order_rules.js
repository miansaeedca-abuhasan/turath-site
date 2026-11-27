// Owner rulings 26-11-2026: main hadith list = Jami, Talkhis, famous translated books, Jami sub-books, other hadith books, THEN the books on the Companions; folders (Sahaba, Seerah): books translated into the reader's language first, then the others; newer ones after older ones
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();
for(const ui of['ur','en','ar']){
 const c=await b.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});const p=await c.newPage();
 await p.addInitScript(u=>{try{localStorage.setItem('ui',u);localStorage.setItem('newsSeen','20261126a')}catch(e){}},ui);
 const keys=async h=>{await p.goto('http://localhost:8765/#'+h);await p.reload();await p.waitForFunction(()=>document.querySelectorAll('a.hbrow[data-k]').length>5,{timeout:60000}).catch(()=>{});await p.waitForTimeout(1500);return p.evaluate(()=>[...document.querySelectorAll('a.hbrow[data-k]')].map(a=>a.dataset.k).filter((k,i,a)=>a.indexOf(k)===i))};
 const L=await keys('/hb'),ix=k=>L.indexOf(k);
 const hadithLast=Math.max(...['bukhari','muslim','abudawud','ibnmajah','ibnwahbur','qiraatkhalfur','ibnabishaibaur'].map(ix));
 const SAH=['asabahur','asadghabaur','tabaqatur','sh9767','sh146'].filter(k=>ix(k)>=0);
 ck(ix('bukhari')>=0&&hadithLast>=0,ui+': hadith books listed');
 ck(SAH.every(k=>ix(k)>hadithLast),ui+': books on the Companions come after the hadith books '+SAH.map(k=>k+'@'+ix(k))+' last hadith@'+hadithLast);
 if(ui==='ur'){ck(ix('bukhari')<ix('ibnwahbur')&&ix('ibnwahbur')<ix('qiraatkhalfur')&&ix('qiraatkhalfur')<ix('ibnabishaibaur'),'ur: new translated books after the old ones, in order added');}
 for(const sec of['sahaba','seerah']){
  const S=await keys('/sec/'+sec);
  const reg=await p.evaluate(async()=>{const c=await COLL.list();return Object.fromEntries(c.map(x=>[x.key,x.langs||[]]))});
  const trn=k=>ui==='ar'?(reg[k]||[]).length>1:(reg[k]||[]).includes(ui);
  const first=S.findIndex(k=>!trn(k));
  ck(first<0||S.slice(first).every(k=>!trn(k)),ui+' '+sec+': translated books first, then the others');
  if(sec==='sahaba'&&ui==='ur'){const t=S.filter(trn);ck(t.indexOf('asabahur')>t.indexOf('shaansahabaur')&&t.indexOf('tabaqatur')>t.indexOf('asadghabaur'),'ur sahaba: new translated books after the old translated ones: '+t.join(','));}
 }
 await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS book_order_rules')})();
