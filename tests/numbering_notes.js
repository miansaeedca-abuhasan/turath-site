// library books: title page / headings / continuation rows carry NO number (a note mark instead), numbered rows show the printed number and the text has no number glued in front
const fs=require('fs'),vm=require('vm'),{chromium}=require('playwright');let bad=[];const ck=(c,m)=>{if(!c)bad.push(m)};
(async()=>{
let R;vm.runInNewContext(fs.readFileSync('coll/index.js','utf8'),{COLLS:a=>{R=a}});
const K=['sh10805','sh5836','sh6044','sh5885','sh6601','sh25868','sh2171','sh5861','sh6023','sh654','sh9810','sh13012'];
for(const k of K){const b=R.find(x=>x.key===k);let m;ck(b&&b.nn&&Object.keys(b.nn).length>0&&b.an&&b.an._r&&b.an._r.length>0,k+' has nn and an');
 let rows=[];for(const f of b.files.ar)vm.runInNewContext(fs.readFileSync('coll/'+f[2],'utf8'),{COLLDATA:(a,l,r)=>{rows.push(...r)}});
 const an={};for(const [n,v,c] of b.an._r)for(let i=0;i<c;i++)an[n+i]=v+i;
 const D=x=>x.replace(/[٠-٩]/g,c=>c.charCodeAt(0)-1632).replace(/[۰-۹]/g,c=>c.charCodeAt(0)-1776);
 const left=rows.filter(r=>an[r[0]]!=null&&(m=>m&&+D(m[1])===an[r[0]])(/^\s*[\(\[]?([0-9٠-٩۰-۹]+)[\)\]]?\s*[-–—.،:]\s*\S/.exec(String(r[1]).split('\n').filter(x=>x[0]!=='§')[0]||'')));
 ck(rows.length&&Object.keys(an).length+Object.keys(b.nn).length===rows.length,k+': every row is numbered or a note');
 ck(left.length===0,k+': printed number still glued in front of the text ('+left.length+')');}const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:430,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.newsSeen='20261122a';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur'}catch(e){}});
await p.goto('http://localhost:8765/index.html#/s/sh6023');await p.waitForSelector('.mt.ar',{timeout:30000});await p.waitForTimeout(1500);
const nums=await p.$$eval('.hn, .qnote',e=>e.slice(0,9).map(x=>x.textContent.trim()));
ck(nums.slice(0,6).every(x=>x==='٭'),'rows 1-6 (basmala, title page) have no number: '+nums.join(' '));
ck(nums[6]==='1-'||nums[6]==='١-','row 7 shows the printed number 1: '+nums[6]);
const t7=await p.$$eval('.mt.ar',e=>e[6]&&e[6].textContent.trim().slice(0,12));ck(t7&&/^1-\s*[^\d١\s]/.test(t7),'number is not repeated in the text: '+t7);
await b.close();console.log(bad.length?'FAIL '+bad.join(' | '):'PASS numbering_notes');process.exit(bad.length?1:0)})();
