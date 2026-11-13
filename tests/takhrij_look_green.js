const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:360,height:780}});let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/adabaali/n/1');await p.waitForSelector('p.agrade.jtk',{timeout:40000});await p.waitForTimeout(2000);
const r=await p.evaluate(()=>{const g=document.querySelector('p.agrade.jtk'),ls=[...g.querySelectorAll('a.rlink')],pl=ls.find(a=>!/red|blue|orange|purple/.test(a.className));return {bl:getComputedStyle(g).borderInlineStartWidth,pad:getComputedStyle(g).paddingTop,plain:pl&&getComputedStyle(pl).color,red:(g.querySelector('a.rlink.red')||{}).className&&getComputedStyle(g.querySelector('a.rlink.red')).color,ink:getComputedStyle(g).color}});
if(r.bl!=='3px')bad.push('box edge '+r.bl);if(r.plain!=='rgb(27, 122, 70)')bad.push('plain reference number must be green '+r.plain);if(r.red!=='rgb(192, 0, 0)')bad.push('matching reference must stay red '+r.red);
console.log(bad.length?'FAIL '+bad.join('; '):'PASS takhrij_look_green');await b.close();process.exit(bad.length?1:0)})();
