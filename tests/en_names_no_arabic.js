const fs=require('fs');const s=fs.readFileSync('coll/index.js','utf8');let d;global.COLLS=x=>d=x;eval(s);
const bad=d.filter(b=>/[؀-ۿ]/.test(b.en||'')).map(b=>b.key);
if(bad.length){console.log('FAIL Arabic in en:',bad.join(' '));process.exit(1)}
const b=d.find(x=>x.key==='sh597');if(!/Bukhari and Muslim/.test(b.en)){console.log('FAIL sh597');process.exit(1)}
console.log('PASS en_names_no_arabic',d.length)
