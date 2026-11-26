// owner 25-11-2026: Tadabbur (Urdu): lighter sky-blue / red, star ornament on the red bars, spaced ﴿ ﴾ around Quranic phrases, surah top box with Junagarhi / Kailani tabs
const {chromium}=require('playwright');let bad=[];
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:412,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.ui='ur';localStorage.newsSeen='20261125b';localStorage.newsDay=new Date().toDateString();localStorage.removeItem('turath_td_tr')}catch(e){}});
await p.goto('http://localhost:8765/index.html#/s/tadabburur/1');await p.waitForSelector('.tdbox',{timeout:30000}).catch(()=>bad.push('no top box'));await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const q=document.querySelector('.td .tdq'),l=document.querySelector('.td .tdlab'),bx=document.querySelector('.tdbox');return {ban:(document.querySelector('.tdban')||{}).textContent,ar:bx&&bx.querySelector('.tdarv').querySelectorAll('.ayn').length,tr:bx&&bx.querySelector('.tdtrv').textContent.slice(0,40),tabs:[...document.querySelectorAll('.tdtabs button')].map(x=>x.textContent),sel:[...document.querySelectorAll('.tdtabs button')].map(x=>x.getAttribute('aria-selected')),bq:q&&getComputedStyle(q).color,mg:q&&getComputedStyle(q).marginLeft,lab:l&&getComputedStyle(l,'::before').backgroundImage.slice(0,20),lc:l&&getComputedStyle(l).backgroundColor}});
if(!/آیاتھا ۷/.test(r.ban)||!/سورۃ الفاتحۃ مکیۃ/.test(r.ban)||!/رکوعاتھا ۱/.test(r.ban))bad.push('banner '+r.ban);
if(r.ar!==6)bad.push('verse circles '+r.ar);if(!/^سب تعریف اللہ/.test(r.tr))bad.push('junagarhi '+r.tr);
if(r.tabs.length!==4||r.sel[0]!=='true')bad.push('tabs '+JSON.stringify(r.tabs)+r.sel);if(r.bq!=='rgb(79, 166, 230)')bad.push('blue '+r.bq);if(r.mg==='0px')bad.push('phrase margin');if(!/url/.test(r.lab))bad.push('star');if(r.lc!=='rgb(217, 119, 124)')bad.push('red '+r.lc);
await p.click('.tdtabs button:nth-child(3)');await p.waitForTimeout(1500);
const k=await p.evaluate(()=>document.querySelector('.tdtrv').textContent.slice(0,30));if(!/^ہر طرح کی تعریف/.test(k))bad.push('kailani '+k);
const nb=await p.$$eval('.tdbox',x=>x.length);if(nb!==2)bad.push('boxes in pages 1-20: '+nb);
if(errs.length)bad.push('js '+errs[0]);await b.close();console.log(bad.length?'FAIL '+bad.join(' | '):'OK');process.exit(bad.length?1:0)})();
