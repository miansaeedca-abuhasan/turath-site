// Tafsir Ibn Kathir (Urdu): the 161 whole sections that were missing (compared with the 2nd edition file) are back (Isra 17:1, Maidah 5:2-3, Nur 24, Furqan 25 ...)
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const O={};for(let i=1;i<=4;i++){const s=fs.readFileSync(__dirname+'/../quran/tafsir/ur_ibnkathir_'+i+'.js','utf8');global.QTAFSIR=(k,o)=>Object.assign(O,o);new Function(s)();}
const len=(s,a)=>O[s].filter(g=>g[0]<=a&&a<=g[1]).reduce((n,g)=>n+g[2].length,0);
ck(len(17,1)>70000,'17:1 '+len(17,1));ck(len(5,2)>30000,'5:2 '+len(5,2));ck(len(24,27)>8000,'24:27 '+len(24,27));ck(len(25,7)>5000,'25:7 '+len(25,7));
ck(/اللہ تعالیٰ اپنی ذات کی عزت و عظمت/.test(O[17][0][2]),'Isra opening paragraph');
console.log(bad?'FAILED':'PASS ibnkathir_restored_sections');process.exit(bad?1:0);
