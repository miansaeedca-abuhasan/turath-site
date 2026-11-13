const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:780}});let bad=[];
const keys=async ui=>{const p=await b.newPage({viewport:{width:360,height:780}});await p.addInitScript(u=>{localStorage.ui=u;localStorage.newsDay=String(new Date().toDateString())},ui);await p.goto('http://localhost:8765/#/hb');await p.waitForSelector('.hbrow',{timeout:60000});await p.waitForTimeout(2500);const r=await p.evaluate(()=>[...document.querySelectorAll('.hbrow')].map(a=>a.dataset.k));await p.close();return r};
const idx=(k,x)=>k.indexOf(x);
for(const ui of ['ur','en']){const k=await keys(ui);
 const want=['jamik','jami','bukhari','muslim','abudawud','tirmidhi','nasai','ibnmajah'];
 want.forEach((x,i)=>{if(k[i]!==x)bad.push(ui+' position '+(i+1)+' is '+k[i]+' expected '+x)});
 const s=['seerah','fazail',ui==='ur'?'adabaali':'adabaalien',...(ui==='ur'?['fitan']:[])].map(x=>idx(k,x));
 if(s.some(v=>v<0)||s.some((v,i)=>i&&v<s[i-1]))bad.push(ui+' jami sub-books out of Jami order '+s);
 if(k.includes('adabaali')&&k.includes('adabaalien'))bad.push(ui+' Al-Adab al-Ali listed twice');
 if(idx(k,'fitan')>=0&&idx(k,'fitan')<8)bad.push(ui+' fitan too early');
}
const ar=await keys('ar');if(ar.slice(0,6).join()!=='jamik,jami,tuhfa,hifzhadith,fitan,adabaali')bad.push('arabic order changed '+ar.slice(0,6));
console.log(bad.length?'FAIL '+bad.join('|'):'PASS book_list_order');await b.close()})();
