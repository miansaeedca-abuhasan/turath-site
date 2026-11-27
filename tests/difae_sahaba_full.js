// Difa-e-Sahaba wa Ahl al-Bayt (Urdu): registry, rows, marks/notes, PDF-checked fixes, Sahaba folder, news line, reader
const {chromium}=require('playwright'),fs=require('fs');let bad=[];
const reg=fs.readFileSync(__dirname+'/../coll/index.js','utf8'),A=JSON.parse(reg.slice(reg.indexOf('COLLS(')+6,reg.lastIndexOf(')'))),E=A.find(e=>e.key==='difaesahabaur');
let rows=[];
if(!E)bad.push('not registered');else{
 if(E.count!==148)bad.push('row count '+E.count);
 if(E.sections.length!==14)bad.push('sections '+E.sections.length);
 if(A[A.length-3].key!=='difaesahabaur')bad.push('registry end');
 let prev=0;E.files.ur.forEach(f=>{if(f[0]!==prev+1)bad.push('gap before file '+f[2]);prev=f[1]});if(prev!==E.count)bad.push('files end '+prev);
 E.files.ur.forEach(f=>{const s=fs.readFileSync(__dirname+'/../coll/'+f[2],'utf8');rows.push(...JSON.parse(s.slice(s.indexOf(',',s.indexOf('"ur"'))+1,-1)))});
 rows.forEach((r,i)=>{if(r[0]!==i+1)bad.push('id '+r[0]);const t=r[1],ms=[...t.matchAll(/\((\d{1,3})\)/g)].map(m=>+m[1]),fn=r[3]?[...r[3].fn.matchAll(/^\((\d{1,3})\)/gm)].map(m=>+m[1]):[];
  if(ms.join()!==fn.join())bad.push('marks/notes differ in row '+r[0]+' '+ms.length+'/'+fn.length);
  if(/[❶-❿➀-➉①-⑳㉑-㉟㊱-㊿⃝]/.test(t+(r[3]?r[3].fn:'')))bad.push('raw mark in row '+r[0]);
  if(/[ﷺﷻؓؒؑ]/.test(t))bad.push('symbol in row '+r[0]);
  if(/[“”]/.test(t))bad.push('straight/curly quote left in row '+r[0])});
 const all=rows.map(r=>r[1]).join('\n');
 if(!all.includes('[فتح الباری ۷/۷]'))bad.push('printed p.44 passage missing');
 if(!all.includes('تم میں سے پچاس افراد'))bad.push('p.44 hadith missing');
 if(/﴾ \(\d|﴾\s*\(/.test(all))bad.push('verse ref still in round brackets');
 if(!/خالِدُونَ|خَالِدُونَ \d|هُمْ فِيهَا خَالِدُونَ ۱۱/.test(all))bad.push('Fadak verse numbers (ayah circles) missing');
 if(!rows[3]||!rows[0][1].startsWith('§عرض ناشر'))bad.push('first row');
}
const sk=fs.readFileSync(__dirname+'/../index.html','utf8');
if(!/sahaba:\[[^\]]*'tabaqatur','difaesahabaur'/.test(sk))bad.push('not in Sahaba folder');
const nw=JSON.parse(fs.readFileSync(__dirname+'/../news.json','utf8'));if(!nw.some(c=>c.keys.includes('difaesahabaur')))bad.push('no news line');
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:430,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.ui='ur';localStorage.nosplash='1'}catch(e){}});
await p.goto('http://localhost:8765/index.html#/s/difaesahabaur?idx');await p.waitForSelector('.snum',{timeout:25000});
const n=await p.$$eval('.snum',x=>x.length);if(n<14)bad.push('section list '+n);
await p.goto('http://localhost:8765/index.html#/sec/sahaba');await p.waitForTimeout(1500);
const t=await p.evaluate(()=>document.body.innerText);if(!/دفاع صحابہ و اہل بیت/.test(t))bad.push('not listed in Sahaba page');
await p.goto('http://localhost:8765/index.html#/s/difaesahabaur/5');await p.waitForSelector('.bkitem',{timeout:25000});await p.waitForTimeout(800);
const r=await p.evaluate(()=>({items:document.querySelectorAll('.bkitem').length,fn:document.querySelectorAll('.pfnbox').length}));
if(r.items<1||r.fn<1)bad.push('reader '+JSON.stringify(r));
await b.close();console.log(bad.length?'FAIL '+bad.slice(0,15).join(' | '):'PASS difae_sahaba_full');process.exit(bad.length?1:0)})();
