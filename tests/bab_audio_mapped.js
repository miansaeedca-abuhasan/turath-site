// owner files 25-11-2026 (chapter transcripts in the Word_Timings zips): chapter -> archive file by spoken title for kitabs 2 12 16 17 47 48 49 52 53 54 67
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad=1;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch(),p=await b.newPage();await p.addInitScript(()=>{localStorage.ui='en'});
await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.ENAUD&&ENAUD.babUrl,null,{timeout:20000});
const r=await p.evaluate(()=>{const u=(k,o)=>{const x=ENAUD.babUrl(k,o);return x&&x.replace(/^.*book/,'book')};
 const all=(k,n)=>[...Array(n)].map((_,i)=>u(k,i+1));const uniq=a=>{const f=a.filter(Boolean);return f.length===new Set(f).size};
 return {n47:all(47,104),n48:all(48,675),n49:all(49,291),n67:all(67,100),n2:all(2,359),n12:all(12,46),n16:all(16,248),n17:all(17,186),n52:all(52,52),n53:all(53,30),n54:all(54,199),n3:[u(3,5),u(3,77)],n60:u(60,1)}});
const f=(k,n)=>'book'+('0'+k).slice(-2)+'_chapter'+('000'+n).slice(-4)+'.mp3';
ck(r.n47[0]===f(47,2)&&r.n47[19]===f(47,84)&&r.n47[61]===f(47,3),'47 start/intro: '+[r.n47[0],r.n47[19],r.n47[61]]);
ck(!r.n47.includes(f(47,1))&&r.n47.filter(Boolean).length===104,'47 file 1 unlinked, 104 linked');
ck(r.n48[468]===f(48,1)&&r.n48[171]===f(48,298)&&r.n48[246]===f(48,260),'48 letters/Zayd swaps: '+[r.n48[468],r.n48[171],r.n48[246]]);
ck(r.n48[27]===null&&r.n48[108]===null&&r.n48.filter(Boolean).length===673,'48 two Arabic-only duplicates have no audio');
[2,34,40,83,152,175].forEach(n=>ck(!r.n48.includes(f(48,n)),'48 file '+n+' must stay unlinked'));
ck(r.n49[203]===f(49,241)&&!r.n49.includes(f(49,240))&&r.n49.filter(Boolean).length===291,'49 merge');
ck(r.n67[1]===f(67,12)&&r.n67[67]==='book66_chapter0008.mp3'&&r.n67.filter(Boolean).length===100-0,'67 mapped: '+[r.n67[1],r.n67[67],r.n67.filter(Boolean).length]);
ck(r.n2[234]===f(2,1)&&r.n17[72]===f(17,75)&&r.n3[0]===f(3,5)&&r.n3[1]===f(3,77)&&r.n60===f(60,1),'spot checks 2/17/3/60');
['n47','n49','n67','n2','n12','n16','n17','n52','n53','n54'].forEach(k=>{const a=r[k].filter(Boolean);ck(a.length===new Set(a).size,k+' unique files')});
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad)})();
