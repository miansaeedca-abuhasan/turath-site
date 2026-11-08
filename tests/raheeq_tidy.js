// Guard: Raheeq text has no space before ۔ ، ؛, no Arabic-heh "غیره", and no paragraph over ~1400 characters that could be split at a sentence end.
const fs=require('fs');process.chdir(__dirname+'/..');let bad=[];
let C;new Function('COLLS',fs.readFileSync('coll/index.js','utf8'))(d=>C=d);
const b=C.find(x=>x.key==='raheeq'),rows=[];for(const [s,e,f] of b.files.ur)new Function('COLLDATA',fs.readFileSync('coll/'+f,'utf8'))((k,l,a)=>rows.push(...a));
const all=rows.map(r=>r[1]).join('\n');
if(/[^\s۔،؛] [۔،؛]/.test(all))bad.push('space before danda/comma');
if(/غیره|گیے/.test(all))bad.push('known spelling slip');
const long=all.split('\n').filter(p=>p.length>1400).length;if(long>20)bad.push('long paragraphs '+long);
const mid=all.split('\n').filter((p,i,a)=>i&&a[i-1].length>60&&!/[۔؟!:»’‘”\]\)"\.﴾؛ً-ْ]\s*$/.test(a[i-1])&&!/\(\d+\)\s*$/.test(a[i-1])&&/^[ء-ۓ]/.test(p)&&!/[ً-ْ]/.test(p.split(/\s+/)[0])&&!/[ً-ْ]/.test(a[i-1].trim().split(/\s+/).pop())).length;if(mid>0)bad.push('mid-sentence line breaks '+mid);
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');process.exit(bad.length?1:0);
