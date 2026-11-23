// Tafsir Luqman (Urdu): the Uraina story says «اونٹوں» (a durood had been glued into the word)
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const s=fs.readFileSync(__dirname+'/../quran/tafsir/ur_luqman_1.js','utf8');
ck(s.includes('اونٹوں کو ہنکا کرلے گئے'),'اونٹوں کو ہنکا کرلے گئے');ck(!/اونٹ صلی اللہ علیہ وسلم/.test(s),'no durood inside اونٹ');
console.log(bad?'FAIL':'PASS luqman_unton');process.exit(bad?1:0);
