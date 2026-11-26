// owner 26-11-2026: tafsir hub rows / group headings / ayah tafsir box carry the «تدبر و عمل» look (gold accent, star heading, sky-blue box), no overflow
const {chromium}=require('playwright');let bad=[];
(async()=>{const b=await chromium.launch();
for(const w of [430,1200]){const p=await(await b.newContext({viewport:{width:w,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.ui='ur';localStorage.lang='ur';localStorage.newsSeen='20261125b';localStorage.newsDay=new Date().toDateString()}catch(e){}});
await p.goto('http://localhost:8765/index.html#/q/tafsir');await p.waitForSelector('a.tfrow',{timeout:25000});
const r=await p.evaluate(()=>{const a=document.querySelector('a.tfrow'),g=document.querySelector('p.grp.tfgrp');const ca=getComputedStyle(a),cg=getComputedStyle(g),cb=getComputedStyle(g,'::before');
 return{bw:ca.borderInlineStartWidth,bc:ca.borderInlineStartColor,gb:cg.borderBottomStyle,star:cb.content,sw:document.documentElement.scrollWidth}});
if(r.bw!=='3px'||!/201, 162, 74/.test(r.bc))bad.push(w+' row accent '+JSON.stringify(r));if(r.gb!=='double')bad.push(w+' grp line');if(r.star==='none'||r.star==='normal')bad.push(w+' star');if(r.sw>w+8)bad.push(w+' h-scroll');}
console.log(bad.length?'FAIL '+bad.join('|'):'PASS tafsir_design_polish');await b.close();process.exit(bad.length?1:0)})();
