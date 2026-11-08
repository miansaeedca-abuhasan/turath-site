// Guard: the detailed study (دراسة) paragraphs of the full Jami' that were missing from the data are present, and the study loader covers every hadith number
const fs=require('fs');process.chdir(__dirname+'/..');
const w={};for(let i=1;i<=10;i++)new Function('window',fs.readFileSync('data/d'+i+'.js','utf8'))(w);
const H=new Map(w.TURATH_DATA.hadith.map(h=>[h.num,h]));
const dr={};global.TURATH_DR=d=>Object.assign(dr,d);for(let i=1;i<=10;i++)eval(fs.readFileSync('data/dr'+i+'.js','utf8'));
let bad=[];const ok=(c,m)=>{if(!c)bad.push(m)};
ok((dr[4455]||[]).length===6&&/الجرح والتعديل/.test(dr[4455].join(' ')),'4455 study');
ok((dr[6955]||[]).length===10&&/ماعز/.test(dr[6955].join(' ')),'6955 study');
ok((dr[16546]||[]).length===4,'16546 study');
for(const n of [4455,6955,16546,9368,12287,10841])ok(H.get(n)&&H.get(n).dr,n+' has the study flag');
const files=w.TURATH_DATA.drfiles;for(const n of Object.keys(dr).map(Number))ok(files.some(f=>n>=f[0]&&n<=f[1]),n+' study not reachable by the loader');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');process.exit(bad.length?1:0);
