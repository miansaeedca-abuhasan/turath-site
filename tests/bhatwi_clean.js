// owner 22-11-2026: Tafsir Bhatwi – Arabic inside the Urdu text has no Urdu quote marks / (( )) round it (the site puts it in « »), is light purple; hadith references are «book (number)»
const fs=require('fs'),{chromium}=require('playwright');process.chdir(__dirname+'/..');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
let all='';for(const f of fs.readdirSync('quran/tafsir').filter(x=>/^ur_bhuttavi_/.test(x)))all+=fs.readFileSync('quran/tafsir/'+f,'utf8');
{const n=[...all.matchAll(/\(\(\s*[^()]*[\u064B-\u0652][^()]*\)\)/g)].length;ck(n<=20,'(( )) round Arabic left '+n);}
const lng=[...all.matchAll(/\[\s*بخاری،\s*[^\]]{0,160}باب[^\]]{0,200}[۰-۹]+\s*\]/g)].length;ck(lng<5,'long Bukhari references left '+lng);
ck(/\[ مسلم \(۸۰۶\) \]/.test(all)&&/\[ بخاری \(۷۸۲\) \]/.test(all),'short references');
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:430,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.newsSeen='20261122a';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur'}catch(e){}});
await p.goto('http://localhost:8765/index.html#/q/tafsir/ur_bhuttavi/2');await p.waitForTimeout(5000);
const r=await p.evaluate(()=>{const q=[...document.querySelectorAll('.qtr.tf-ur_bhuttavi .arq')];return{n:q.length,col:q.length?getComputedStyle(q[0]).color:'',unb:q.filter(e=>!/^«.*»$/s.test(e.textContent.trim())).length,quote:q.filter(e=>/[’‘“”]/.test(e.textContent)).length}});
ck(r.n>5,'arabic spans '+r.n);ck(r.col==='rgb(155, 93, 229)','purple '+r.col);ck(r.unb===0,'all in « »');ck(r.quote===0,'quote marks inside « » '+r.quote);
await b.close();console.log(bad?'FAIL bhatwi_clean':'PASS bhatwi_clean');process.exit(bad?1:0)})();
