// Guard: narrators page — counts come from the real hadith, Companion honorific shown, number shown small, authors grouped.
const fs=require('fs'),bad=[];
const js=fs.readFileSync('jrs.js','utf8'),dj=fs.readFileSync('data/jrs.js','utf8');
let D;window={TURATH_JRS:x=>{D=x}};eval(dj);
const byAr=a=>D.n.find(x=>x.nm.ar===a);
const us=byAr('أسيد بن ظهير');
if(!us)bad.push('Usayd ibn Zuhayr entry missing');
else{if(us.nm.ur!=='اسید بن ظہیر')bad.push('Usayd urdu name');if(JSON.stringify(us.h)!=='[5553,5637]')bad.push('Usayd hadith '+JSON.stringify(us.h));}
if(D.n.some(x=>/زهير/.test(x.nm.ar)&&/أسيد/.test(x.nm.ar)))bad.push('old Usayd spelling');
for(let k=1;k<D.n.length;k++){if(D.n[k].c>D.n[k-1].c)bad.push('narrators not sorted by count at '+k);}
D.n.forEach((x,k)=>{if(x.i!==k+1)bad.push('serial '+k);if(!/^[mf]$/.test(x.g))bad.push('gender '+x.i);if(new Set(x.h).size!==x.h.length)bad.push('dup numbers '+x.i);});
if(D.n.filter(x=>x.c===0).length>1)bad.push('too many narrators without hadith');
// two-narrator hadith appear in both pages
const both=D.n.filter(x=>x.h.includes(3179)).map(x=>x.nm.ar);
if(!(both.includes('عبد الله بن عباس')&&both.includes('جابر بن عبد الله')))bad.push('hadith 3179 must be under both Ibn Abbas and Jabir: '+both);
if(!/RD\s*=/.test(js)||!/رضی اللہ عنہا/.test(js)||!/رضی اللہ عنہ/.test(js))bad.push('honorific');
const bb=js.match(/\.jr \.big b\{[^}]*font:[^;}]*?(\d+(?:\.\d+)?)rem/);if(!bb||parseFloat(bb[1])>1.8)bad.push('big number too large');
// authors: same author's books are contiguous; Malik, Bukhari, Muslim first
const t=x=>x.ur.title;
if(!/الموطأ/.test(t(D.s[0])))bad.push('Malik first');
const idx=re=>D.s.map((x,k)=>re.test(t(x))?k:-1).filter(k=>k>=0);
const bk=D.s.map((x,k)=>/محمد بن إسماعیل البخاری/.test(x.ur.author)?k:-1).filter(k=>k>=0);if(bk[bk.length-1]-bk[0]!==bk.length-1)bad.push('Bukhari books not contiguous');
if(!(idx(/صحیح البخاری/)[0]<idx(/صحیح مسلم/)[0]&&idx(/صحیح البخاری/)[0]===1))bad.push('order Bukhari then Muslim');
const tb=idx(/الطبرانی|المعجم/);const tb2=D.s.map((x,k)=>/سلیمان بن أحمد الطبرانی/.test(x.ur.author)?k:-1).filter(k=>k>=0);
if(tb2[tb2.length-1]-tb2[0]!==tb2.length-1)bad.push('Tabarani books not contiguous');
const by={};D.s.forEach((x,k)=>{const a=(x.ur.author||'').split(/[؛،(]/)[0].replace(/^(الإمام|الحافظ|شیخ الإسلام)\s+/,'').trim().slice(0,22)+'|'+(x.ur.died||'').slice(0,4);(by[a]=by[a]||[]).push(k);});
Object.keys(by).forEach(a=>{const v=by[a];if(v.length>1&&v[v.length-1]-v[0]!==v.length-1&&!/ابن حجر|عماد الدین|نور الدین|شمس الدین|أحمد بن علی/.test(a))bad.push('author scattered: '+a.slice(0,30));});
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');process.exit(bad.length?1:0);
