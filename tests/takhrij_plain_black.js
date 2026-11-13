const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:780}});let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString());localStorage.look=JSON.stringify({color:'maroon',mode:'light',urdu:'jameel',uv:3})});
for(const u of ['#/s/seerah/3','#/s/fitan/1']){
await p.goto('http://localhost:8765/'+u);await p.waitForSelector('p.agrade',{timeout:60000});await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{const g=document.querySelector('p.agrade'),rd=g.querySelector('span.red');return {c:getComputedStyle(g).color,ink:getComputedStyle(document.body).color,red:rd&&rd.textContent,rc:rd&&getComputedStyle(rd).color,bd:getComputedStyle(g).borderInlineStartColor}});
if(r.c!==r.ink)bad.push(u+' takhrij text not plain black '+r.c);if(!r.red)bad.push(u+' ruling word not red-marked');if(r.rc!=='rgb(192, 0, 0)')bad.push(u+' ruling colour '+r.rc);if(r.bd!=='rgb(47, 127, 192)')bad.push(u+' box follows theme '+r.bd);}
console.log(bad.length?'FAIL '+bad.join('|'):'PASS takhrij_plain_black');await b.close()})();
