const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:780}});let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
for(const u of ['#/s/adabaali/n/1','#/s/adabaalien/n/1']){
await p.goto('http://localhost:8765/'+u);await p.waitForSelector('p.agrade',{timeout:40000});await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{const g=document.querySelector('p.agrade'),rd=g.querySelector('span.red'),n=[...g.querySelectorAll('a.rlink')];return {red:rd&&rd.textContent,rc:rd&&getComputedStyle(rd).color,redLink:g.querySelectorAll('a.rlink.red').length,links:n.length,cls:g.className,gc:g.querySelectorAll('.gc').length,txt:g.textContent}});
if(!/حسن/.test(r.red||''))bad.push(u+' ruling not red-marked '+r.red);if(r.redLink!==1)bad.push(u+' matching ref not red '+r.redLink);if(r.links<3)bad.push(u+' links');if(r.gc)bad.push(u+' green ruling used');if(/[-]/.test(r.txt))bad.push(u+' marker chars visible');}
console.log(bad.length?'FAIL '+bad.join('; '):'PASS takhrij_jami_style');await b.close();process.exit(bad.length?1:0)})();
