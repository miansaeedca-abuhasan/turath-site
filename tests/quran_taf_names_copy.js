// Guard: tafsir names carry their language in brackets, Urdu ones first; the copy window offers the tafsir when one is open; the inline tafsir box is wide on phones; Adab takhrij label names the muhaqqiq
const {chromium}=require('playwright');let bad=[];
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:780}});p.on('pageerror',e=>bad.push('pageerror '+e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString());localStorage.qset=JSON.stringify({mode:'list',tr:['ur_junagarhi'],tafsir:'ur_ibnkathir',tafOn:true})});
await p.goto('http://localhost:8765/#/q/s/2/4');await p.waitForTimeout(7000);
const w=await p.evaluate(()=>{const e=document.querySelector('.intaf'),c=e&&e.closest('.card');return e?[e.getBoundingClientRect().width,c.getBoundingClientRect().width]:null});
if(!w||w[0]<w[1]-14)bad.push('tafsir box narrow '+JSON.stringify(w));
await p.evaluate(()=>{const x=[...document.querySelectorAll('button')].find(b=>/تراجم منتخب/.test(b.getAttribute('aria-label')||b.title||''));x&&x.click()});await p.waitForTimeout(2500);
const names=await p.evaluate(()=>[...document.querySelectorAll('.sheetbg label.srow')].map(x=>x.innerText.trim()));
const ik=names.findIndex(x=>/ابنِ کثیر/.test(x));if(ik<0||!/\(اردو\)/.test(names[ik]))bad.push('ibn kathir urdu name: '+names.join('|'));
const iu=names.findIndex(x=>/\(اردو\)/.test(x)),ia=names.findIndex(x=>/\(عربی\)/.test(x));if(!(iu>=0&&ia>iu))bad.push('urdu tafsirs not before arabic');
await p.goto('http://localhost:8765/#/s/adabaali');await p.waitForTimeout(6000);
const t=await p.evaluate(()=>document.body.innerText);if(!/تحقیق و تخریج\s+دکتور محمد عبداللہ اعظمی/.test(t))bad.push('adab takhrij label');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
