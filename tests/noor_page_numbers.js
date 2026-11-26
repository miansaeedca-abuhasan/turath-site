// Tafsir Noor al-Huda: printed volume / page under every row + «جلد اور صفحہ» jump (owner 26-11-2026; pages from the contents files of his Tafseer_Final.daa)
const fs=require('fs'),{chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const idx=fs.readFileSync('coll/index.js','utf8'),E=JSON.parse(idx.slice(idx.indexOf('(')+1,idx.lastIndexOf(')'))).find(x=>x.key==='tafsirnoor');
ck(E&&E.pg&&fs.existsSync('coll/pg/'+E.pg),'registry pg file');
const src=fs.readFileSync('coll/pg/'+E.pg,'utf8');let D;global.COLLPG=(k,d)=>{D=d};eval(src);
const v=D.v.split(','),m=new Map();let x=0,at=0;for(let i=0;i<D.i.length;i+=2)for(let n=D.i[i],e=n+D.i[i+1];n<e;n++,at++){const q=v[at];if(q==='x')continue;if(q)x+=parseInt(q,36);m.set(n,x)}
ck(m.size>=8050&&m.size<=8096,'labelled rows '+m.size+' of 8096');
const vols=new Set([...m.values()].map(z=>Math.floor(z/100000)));ck(vols.size===15&&Math.min(...vols)===1&&Math.max(...vols)===15,'15 volumes');
ck(m.get(1)===100000+Math.floor(m.get(1)%100000)&&m.get(1)%100000<=94,'row 1 = Fatiha, vol 1 page '+m.get(1));
// pages never run backwards inside a volume
let back=0,last=0;[...m.entries()].sort((a,b)=>a[0]-b[0]).forEach(([n,z])=>{if(z<last-1&&Math.floor(z/100000)===Math.floor(last/100000))back++;last=z});ck(back===0,'pages run backwards '+back);
(async()=>{const b=await chromium.launch();
for(const [name,vp] of [['phone',{width:400,height:850}],['desktop',{width:1280,height:900}]]){
const c=await b.newContext({viewport:vp});const p=await c.newPage();await p.addInitScript(()=>{try{localStorage.ui='ur';localStorage.newsSeen='20261125b';localStorage.newsDay=new Date().toDateString()}catch(e){}});
await p.goto('http://localhost:8765/#/s/tafsirnoor/n/1');await p.reload();await p.waitForSelector('.pgno',{timeout:40000}).catch(()=>{});
let t=await p.evaluate(()=>document.querySelector('.pgno')?document.querySelector('.pgno').innerText:'');ck(/جلد/.test(t)&&/صفحہ/.test(t)&&/[۰-۹]/.test(t),name+': label on row 1 «'+t.replace(/\n/g,' ')+'»');
await p.goto('http://localhost:8765/#/s/tafsirnoor/1');await p.reload();await p.waitForSelector('.pgno',{timeout:40000}).catch(()=>{});
const n=await p.evaluate(()=>document.querySelectorAll('.pgno').length);ck(n>=3,name+': labels in the section list '+n);
await p.goto('http://localhost:8765/#/s/tafsirnoor?idx');await p.reload();await p.waitForTimeout(2500);
await p.click('#hsbtn');await p.waitForSelector('.pgtabs',{timeout:20000});
const tb=await p.evaluate(()=>document.querySelector('.pgtabs').innerText);ck(/جلد اور صفحہ/.test(tb),name+': jump tab «'+tb.replace(/\n/g,' ')+'»');
await p.click('.pgtabs button:last-child');await p.waitForFunction(()=>{const i=document.querySelector('.pgin');return i&&i.placeholder},null,{timeout:20000});
const ins=await p.$$('.pgin');await ins[0].fill('5');await ins[1].fill('30');await p.click('.pgjump .lbtn');
await p.waitForFunction(()=>/#\/s\/tafsirnoor\/n\/\d+/.test(location.hash),null,{timeout:20000}).catch(()=>{});
const h=await p.evaluate(()=>location.hash);ck(/\/n\/\d+$/.test(h),name+': jump opens a row '+h);
await p.waitForSelector('.pgno',{timeout:20000}).catch(()=>{});const lb=await p.evaluate(()=>(document.querySelector('.pgno')||{}).innerText||'');ck(/جلد\s*۵/.test(lb)&&/صفحہ\s*۲/.test(lb)&&/۳۰ اس عنوان/.test(await p.evaluate(()=>document.body.innerText)),name+': row of vol 5 p.30 «'+lb.replace(/\n/g,' ')+'»');
await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS noor_page_numbers')})();
