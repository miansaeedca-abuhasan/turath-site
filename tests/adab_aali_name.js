// Owner ruling 21-11-2026: the English name is written «Al-Adab al-Aali» (not «Al-Ali»)
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
for(const f of ['coll/index.js','coll/lite.js','offline.json','news.json','index.html']){const t=fs.readFileSync(__dirname+'/../'+f,'utf8');
 ck(!/Al-Adab al-Ali \(/.test(t),f+' still has «Al-Adab al-Ali (»');ck(/Al-Adab al-Aali \(/.test(t),f+' has «Al-Adab al-Aali»')}
if(bad)process.exit(1);console.log('PASS adab_aali_name');
