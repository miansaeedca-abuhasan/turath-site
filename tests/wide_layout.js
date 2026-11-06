const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let bad=[];
for(const [w,h,min,max] of [[1920,950,1100,1200],[1600,900,900,1100],[1366,768,730,740],[390,800,300,400]]){
const p=await b.newPage({viewport:{width:w,height:h}});await p.addInitScript(()=>{localStorage.ui='ur'});
await p.goto('http://localhost:8765/#/h/100');await p.waitForTimeout(3500);
const r=await p.evaluate(()=>{const m=document.querySelector('main').getBoundingClientRect(),s=document.querySelector('.slt'),o={mw:m.width,l:m.left,r:m.right,sw:document.documentElement.scrollWidth,iw:innerWidth};if(s&&getComputedStyle(s).display!=='none'){const q=s.getBoundingClientRect();o.ov=q.left<m.right&&q.right>m.left&&q.width>0}return o});
if(r.mw<min||r.mw>max)bad.push(w+': main '+r.mw);if(r.ov&&w>=1320)bad.push(w+': widget overlaps main');if(r.sw>r.iw+1)bad.push(w+': h-scroll');await p.close()}
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
