// Urdu books: 3+ Arabic words typed WITHOUT harakat (isnad/quotation) must show in the Arabic font in « »; Urdu sentences must never be touched (measured on all Urdu books 27-11-2026)
const {chromium}=require('playwright');let bad=[];
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:430,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.ui='ur';localStorage.nosplash='1';localStorage.newsSeen='20261127a';localStorage.newsDay=new Date().toDateString()}catch(e){}});
await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.rich&&typeof rich==='function',{timeout:20000}).catch(()=>{});
const r=await p.evaluate(()=>{try{const f=(t)=>rich(t,'ur').map(n=>typeof n==='string'?'T:'+n:(n.nodeType===3?'T:'+n.nodeValue:(n.className+':'+n.textContent)));
 return {a:f('اس نے کہا ہے الصلوة وايتاء الزكوة اور پھر چلا گیا'),b:f('وہ کہتا ہے کہ ابن عباس نے یہ بات کہی تھی اور پھر وہ چلا گیا۔'),c:f('سیدنا ابن عمر رضی اللہ عنہما نے فرمایا کہ تم لوگ کیا کرتے ہو'),d:f('على سيد المرسلين وعلى آله')}}catch(e){return {err:String(e)}}});
if(r.err)bad.push(r.err);else{
 if(!r.a.some(x=>/^arq/.test(x)&&/الصلوة وايتاء الزكوة/.test(x)))bad.push('unvocalized Arabic not in Arabic font '+JSON.stringify(r.a));
 if(r.b.length!==1||r.b[0].indexOf('T:')!==0)bad.push('plain Urdu touched '+JSON.stringify(r.b));
 if(r.c.some(x=>/^arq/.test(x)&&/رضی|فرمایا/.test(x)))bad.push('honorific/Urdu wrongly Arabic '+JSON.stringify(r.c));
 if(!r.d.some(x=>/^arq/.test(x)))bad.push('full Arabic line '+JSON.stringify(r.d));}
await b.close();console.log(bad.length?'FAIL '+bad.join(' | '):'PASS arabic_unvocalized_runs');process.exit(bad.length?1:0)})();
