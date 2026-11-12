// Urdu double quotes run the right way in the Urdu text of Fitan and Sh13064: opening ’’ after a space, closing ‘‘ (never the reverse)
const fs=require('fs');let bad=0;const idx=fs.readFileSync('coll/index.js','utf8');
for(const key of ['fitan','sh13064']){let o=0,c=0;
 for(const f of new Set(idx.match(new RegExp(key+'_ur_\\d+_[0-9a-f]+\\.js','g'))||[])){const s=fs.readFileSync('coll/'+f,'utf8');
  for(const m of s.matchAll(/(.)(‘‘|’’)/g)){const sp=/[\s:،(]/.test(m[1])||m[1]==='"';if(m[2]==='’’'&&sp)o++;if(m[2]==='‘‘'&&sp)c++;}}
 if(!(o>c*5)){bad++;console.log('FAIL reversed quotes in',key,o,c)}}
console.log(bad?'FAILED':'OK');process.exit(bad?1:0)
