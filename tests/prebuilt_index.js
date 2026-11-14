// the prebuilt word index (data/ix) = an index built in the browser from the full Jami text, token by token (a sample of 400 words)
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/index.html#/');await p.waitForLoadState('networkidle');
const T=['صلاه','رسول','اله','قال','نبي','حديث','prayer','allah','messenger','zakat','hajj','ابي','هريره','طهور','سبعه','ظل','ظلل','a','و','ص','1','25','muhammad','ان','عن','ال','من','کتاب'];
const r=await p.evaluate(async T=>{await window.localApi('list?limit=1');const w=['صوم','حج','زكاه','جنه','نار','ايمان','علم','عمل','نيه','ليله','قدر','رمضان','ربا','خمر','ماء','بيت','سفر','نكاح','طلاق','بيع','ذكر','دعاء','قرآن','سوره','آيه'];return window.__ixCheck(T.concat(w).concat(w.map(x=>x+'ه')).concat(['pray','fast','charity','faith','night','water','travel','marriage','trade','prophet','paradise','hell','sin','mercy','forgive','heaven']))},T);
ck(r.bad.length===0,'tokens differ: '+r.bad.join(' '));ck(r.N===r.nM,'N '+r.N+' vs '+r.nM);
const q=await p.evaluate(async()=>{const d=await window.localApi('search?q='+encodeURIComponent('انما الاعمال بالنيات')+'&book=jami&mode=all');return [d.total,d.results.length&&d.results[0].num]});ck(q[0]>0,'search finds the hadith of intentions');
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
