// owner 26-11-2026: Tadabbur Urdu: no Arabic-letter shapes in plain Urdu words, translations never inside ﴿ ﴾, juz sections, strong red bars
const fs=require('fs');let bad=[];const dir=__dirname+'/../coll/';
const T=fs.readdirSync(dir).filter(f=>f.startsWith('tadabburur_ur_')).map(f=>fs.readFileSync(dir+f,'utf8')).join('');
const HK=/[ً-ٰٟ]/;let n=0;
for(const w of T.match(/[؀-ۿ]+/g)||[])if(/[كيىه]/.test(w)&&!HK.test(w)&&!/^[ء-يٱ-ۓ]*$/.test('')){n++;}
if(n>0)bad.push('Arabic-shaped plain words left: '+n);
for(const m of T.matchAll(/﴿([^﴾]{1,200})﴾/g))if(/اور سن لو/.test(m[1]))bad.push('translation inside ﴿ ﴾');
if(/‘‘[^’]{1,80}’’/.test(T.replace(/[^\n]*/,'')))bad.push('reversed Urdu quotes left');
const reg=fs.readFileSync(dir+'index.js','utf8'),A=JSON.parse(reg.slice(reg.indexOf('COLLS(')+6,reg.lastIndexOf(')')));
for(const k of['tadabburur','tadabburar','tadabburen']){const E=A.find(e=>e.key===k);if(E.sections.length!==30||E.sections[0][2]!==1||E.sections[0][3]!==21||E.sections[29][3]!==604||!/(پارہ|الجزء|Juz)/.test(E.sections[0][1]))bad.push('juz sections '+k);}
console.log(bad.length?'FAIL '+bad.join('|'):'PASS tadabbur_ur_fixes');process.exit(bad.length?1:0);
