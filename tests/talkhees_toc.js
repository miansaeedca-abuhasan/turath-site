// Browser check: kitab 60 index lists the verse chapters apart (also two chapters that share number 6 and English title), in order
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let bad=[];
const p=await b.newPage({viewport:{width:420,height:900}});p.on('pageerror',e=>bad.push(e.message));
await p.addInitScript(()=>{if(!sessionStorage.a){localStorage.ui='ur';localStorage.book='jami';sessionStorage.a=1}});
await p.goto('http://localhost:8765/#/k/60');await p.waitForSelector('#list a.card',{timeout:20000});await p.waitForTimeout(1200);
const t=await p.evaluate(()=>[...document.querySelectorAll('#list a.card')].map(a=>a.textContent.replace(/[ً-ٰٟـ]/g,'').replace(/\s+/g,' ').trim()));
const f=s=>t.findIndex(x=>x.includes(s));
const a=f('أَوْ كَصَيِّبٍ'.replace(/[ً-ٰٟ]/g,'')),c=f('وَإِذَا قِيلَ لَهُمْ آمِنُوا'.replace(/[ً-ٰٟ]/g,'')),d=f('يَا أَيُّهَا النَّاسُ اعْبُدُوا'.replace(/[ً-ٰٟ]/g,''));
if(a<0||c<0||d<0)bad.push('verse chapters missing '+[a,c,d]);else if(!(c<a&&a<d))bad.push('verse chapters out of order '+[c,a,d]);
const x=f('إِنِّي رَسُولُ اللَّهِ إِلَيْكُمْ'.replace(/[ً-ٰٟ]/g,'')),y=f('وَمَا أَرْسَلْنَاكَ إِلَّا كَافَّةً'.replace(/[ً-ٰٟ]/g,''));
if(x<0||y<0||x===y)bad.push('same-number chapters merged '+[x,y]);
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS',t.length);await b.close();process.exit(bad.length?1:0)})();
