// Guard: Raheeq Quran verses are vocalized from our Quran data, in ﴿ ﴾ with a [سورہ: آیت] reference; no verse is left bare.
const fs=require('fs');process.chdir(__dirname+'/..');let bad=[];
let C;new Function('COLLS',fs.readFileSync('coll/index.js','utf8'))(d=>C=d);
const b=C.find(x=>x.key==='raheeq'),rows=[];for(const [s,e,f] of b.files.ur)new Function('COLLDATA',fs.readFileSync('coll/'+f,'utf8'))((k,l,a)=>rows.push(...a));
const all=rows.map(r=>r[1]).join('\n');
const n=(all.match(/﴿[^﴾]+﴾/g)||[]).length;if(n<120)bad.push('too few verses '+n);
const tk=(all.match(/﴿[^﴾]+﴾/g)||[]).filter(v=>!/[ً-ْ]/.test(v));if(tk.length)bad.push('unvocalized verse '+tk[0].slice(0,40));
if(/﴿[^﴾]*[۰-۹0-9]{2,}[^﴾]*﴾/.test(all))bad.push('digits inside verse brackets');
const t=rows.find(r=>r[0]===53)[1];if(!/﴿وَعَجِبُوٓاْ[^﴾]+﴾ \[ص: ۴\]/.test(t))bad.push('entry 53 verse lacks reference');
if(/\]\s*\[[^\]]+: *[۰-۹]+\]\s*\[/.test(all)&&/\[([^\]:]+: *[۰-۹\- ]+)\]\s*\[\1\]/.test(all))bad.push('doubled reference');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS '+n+' verses');process.exit(bad.length?1:0);
