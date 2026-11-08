// Guard: selecting text in a reading page shows the bar (note, copy with reference, copy plain, share, 4 colours); highlights persist across reload; note dialog saves.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(),ctx=await b.newContext({viewport:{width:900,height:800},permissions:['clipboard-read','clipboard-write']}),p=await ctx.newPage();let bad=[];
await p.addInitScript(()=>{if(!sessionStorage.x){localStorage.ui='ur';sessionStorage.x=1}});
await p.goto('http://localhost:8765/#/h/100?one');await p.waitForSelector('.hpill',{timeout:15000});await p.waitForTimeout(1500);
const pick=async()=>p.evaluate(()=>{const v=document.querySelector('#view');const w=document.createTreeWalker(v,NodeFilter.SHOW_TEXT);let n,best=null;while(n=w.nextNode()){if(/[ء-ي]/.test(n.data)&&n.data.trim().length>25&&!n.parentElement.closest('button,script,style')){best=n;break}}
 if(!best)return null;const r=document.createRange();r.setStart(best,2);r.setEnd(best,14);const s=getSelection();s.removeAllRanges();s.addRange(r);return String(s)});
const t=await pick();if(!t)bad.push('no text to select');
await p.waitForSelector('.selbar:not([hidden])',{timeout:4000}).catch(()=>bad.push('bar not shown'));
const n=await p.evaluate(()=>({b:document.querySelectorAll('.selbar .sb-b').length,c:document.querySelectorAll('.selbar .sb-c').length}));
if(n.b!==4||n.c!==4)bad.push('bar buttons '+JSON.stringify(n));
await p.click('.selbar .sb-b[title="حوالے کے ساتھ کاپی"]');let cp=await p.evaluate(()=>navigator.clipboard.readText());
if(!cp.includes(t.trim())||!/📲/.test(cp))bad.push('copy with ref lacks reference/link: '+cp.slice(0,80));
await pick();await p.waitForSelector('.selbar:not([hidden])');await p.click('.selbar .sb-b[title="بغیر حوالہ کاپی"]');cp=await p.evaluate(()=>navigator.clipboard.readText());
if(cp.trim()!==t.trim())bad.push('plain copy differs: '+cp.slice(0,60));
await pick();await p.waitForSelector('.selbar:not([hidden])');await p.click('.selbar .sb-c[data-c="2"]');
if(await p.$$eval('mark.uhl[data-c="2"]',a=>a.length)<1)bad.push('highlight not applied');
await p.reload();await p.waitForSelector('mark.uhl',{timeout:8000}).catch(()=>bad.push('highlight lost after reload'));
await p.click('mark.uhl');await p.waitForSelector('.selnote');await p.fill('.selnote textarea','یاد داشت');await p.click('.sn-save');
const saved=await p.evaluate(()=>JSON.parse(localStorage.turath_hl)[0].n);if(saved!=='یاد داشت')bad.push('note not saved');
await p.click('mark.uhl');await p.click('.sn-del');if(await p.$$eval('mark.uhl',a=>a.length))bad.push('highlight not removed');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
