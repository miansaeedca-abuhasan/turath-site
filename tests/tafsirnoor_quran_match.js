// Tafsir Noor al-Huda: Arabic ayah blocks were compared with the full Quran (quran/ar_indopak.js): waqf marks and ayah numbers come from it
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const idx=fs.readFileSync(__dirname+'/../coll/index.js','utf8');
const files=[...new Set(idx.match(/tafsirnoor_ur_\d+_[0-9a-f]+\.js/g))];
let all='';const rows={};
for(const f of files){const t=fs.readFileSync(__dirname+'/../coll/'+f,'utf8');const m=t.match(/COLLDATA\("tafsirnoor","ur",(\[[\s\S]*\])\)/);for(const r of JSON.parse(m[1]))rows[r[0]]=r[1];}
const R=i=>rows[i]||'';
ck(R(293).includes('۰۰۱۲۸'),'row 293 ayah number 128 (printed book had 12)');
ck(/۰۰۲۷۰/.test(R(612))&&/۰۰۲۷۱/.test(R(612)),'row 612 ayat 270 and 271');
ck(/الْعٰلَمِيْنَۙ۰۰۱/.test(R(3))||/۰۰۱﴾/.test(R(3)),'Fatiha: الحمد is number 1 as in the printed book');
let ayahs=0,carrier=0;for(const t of Object.values(rows))for(const b of t.match(/﴿[^﴾]*﴾/g)||[]){ayahs++;if(/[ؐؑؒ]۰۰/.test(b))carrier++}
ck(ayahs>25000,'ayah blocks count '+ayahs);
ck(carrier<=35,'old font end-marks (ؒ ؑ) before ayah number: '+carrier);
ck(/\(Law of Heritence\)/.test(R(3375)),'English words of the printed book stay (owner ruling: only emails and stray glyph letters are removed)');
ck(!/@/.test(Object.values(rows).join('')+idx),'no e-mail address anywhere');
if(bad)process.exit(1);console.log('PASS tafsirnoor_quran_match');
