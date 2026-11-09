// Guard: «رواة/مؤلفو الجامع الكامل» folders (مرتب: تراث خیرالقرون) sit in the Jami list, open in tabs, and their data is complete.
const fs=require('fs'),bad=[];
const ix=fs.readFileSync('index.html','utf8'),js=fs.readFileSync('jrs.js','utf8'),dj=fs.readFileSync('data/jrs.js','utf8');
let D;window={TURATH_JRS:x=>{D=x}};eval(dj);
if(D.n.length!==233)bad.push('narrators '+D.n.length);
if(D.s.length!==224)bad.push('sources '+D.s.length);
if(D.total!==16546)bad.push('total');
D.n.forEach(x=>{if(!x.nm.ar||!x.nm.ur||!x.nm.en)bad.push('name '+x.i);if(!x.x.ar||!x.x.ur||!x.x.en)bad.push('intro '+x.i);if(x.h.length!==x.c)bad.push('count '+x.i);if(x.h.some(n=>n<1||n>16546))bad.push('range '+x.i);});
D.s.forEach(x=>{if(!x.ar.title||!x.ur.title||!x.en.title)bad.push('title '+x.i);if(x.h.length!==x.c)bad.push('scount '+x.i);});
if(D.s.filter(x=>!x.h.length).length>6)bad.push('sources without numbers');
if(D.n[0].c!==2447)bad.push('abu hurayrah count');
if(!/#\/jr/.test(ix)||!/#\/js/.test(ix)||!/function jrRows/.test(ix))bad.push('index wiring');
if(!/book!=='jami'&&book!=='jamik'/.test(ix))bad.push('rows only in Jami books');
if(ix.indexOf('...jrRows(),')<0||ix.indexOf('...jrRows(),')>ix.indexOf("href:'#/madkhal'"))bad.push('rows must follow the introduction');
['مرتب: تراث خیرالقرون','مرتب: تراث خير القرون','Compiled by: Turath Khair al-Quroon'].forEach(s=>{if(!js.includes(s))bad.push('byline '+s)});
['intro','total','nums'].forEach(k=>{if(!js.includes("['"+k+"'"))bad.push('tab '+k)});
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');process.exit(bad.length?1:0);
