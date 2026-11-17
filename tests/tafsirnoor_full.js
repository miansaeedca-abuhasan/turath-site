// Tafsir Noor al-Huda: all 15 volumes (30 paras) from the InPage source; no glyph codes left, no glued honorifics, 30 sections
const fs=require('fs');let bad=[];let A;global.window={};global.COLLS=a=>{A=a};eval(fs.readFileSync('coll/index.js','utf8'));
const e=A.find(x=>x.key==='tafsirnoor');
if(e.sections.length!==30)bad.push('sections '+e.sections.length);
if(!/جلد 1 تا 15/.test(e.sub.ur))bad.push('sub');
let rows=[];global.COLLDATA=(k,l,r)=>rows.push(...r);
for(const f of e.files.ur)eval(fs.readFileSync('coll/'+f[2],'utf8'));
if(rows.length!==e.count||e.count<8000)bad.push('rows '+rows.length+' vs '+e.count);
rows.forEach((r,i)=>{if(r[0]!==i+1)bad.push('row id '+i)});
const T=rows.map(r=>r[1]).join('\n');
const glued=(T.match(/صلی اللہ علیہ وسلم[ء-يٱ-ۓ]/g)||[]).length;if(glued)bad.push('glued '+glued);
const single=(T.match(/(?<![A-Za-z0-9])[etuoryw](?![A-Za-z0-9])/g)||[]).length;if(single>5)bad.push('glyph letters '+single);
if((T.match(/[؀-ۿ]صلی اللہ علیہ وسلم/g)||[]).length)bad.push('salawat glued before');
for(let i=0;i<30;i++){const s=e.sections[i];if(!(s[2]<=s[3]))bad.push('section '+i);if(i&&s[2]!==e.sections[i-1][3]+1)bad.push('gap at '+i);}
if(e.sections[29][3]!==e.count)bad.push('last section end');
if(!rows[0][1].includes('اس سورت کو فاتحہ اس لیے کہا جاتا ہے'))bad.push('first row text');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS tafsirnoor_full');process.exit(bad.length?1:0);
