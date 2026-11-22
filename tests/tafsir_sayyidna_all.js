// owner 22-11-2026: in every Urdu tafsir «حضرت» before a clear Companion name is «سیدنا / سیدہ»; Muslim «N/M» in one bracket; no (( )) round Arabic in Bhatwi
const fs=require('fs');global.QTAFSIR=(k,o)=>{cur=o};let cur,bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
let left=0,sy=0,dbl=0;
for(const f of fs.readdirSync('quran/tafsir').filter(f=>/^ur_.*_\d+\.js$/.test(f))){eval(fs.readFileSync('quran/tafsir/'+f,'utf8'));const j=JSON.stringify(cur);
 {const k=(j.match(/حضرت (?:عائشہ|ابوہریرہ|ابوبکر|انس|عثمان|ابوذر|خدیجہ|فاطمہ|حفصہ|معاذ|سلمان)(?![\u0600-\u06FF])/g)||[]).length;if(k)console.log(f,k)}
 left+=(j.match(/حضرت (?:عائشہ|ابوہریرہ|ابوبکر|انس|عثمان|ابوذر|خدیجہ|فاطمہ|حفصہ|معاذ|سلمان)(?![؀-ۿ])/g)||[]).length;sy+=(j.match(/سیدنا ابوہریرہ|سیدہ عائشہ/g)||[]).length;
 if(/bhuttavi/.test(f))dbl+=(j.match(/\(\([^()]{0,200}[ً-ْ]{2}/g)||[]).length}
ck(left===0,'«حضرت» left before a Companion: '+left);ck(sy>300,'سیدنا used '+sy);ck(dbl<=4,'Bhatwi (( )) left '+dbl);
{let gl=0;for(const f of fs.readdirSync('quran/tafsir').filter(f=>/^ur_saadi_\d+\.js$/.test(f))){eval(fs.readFileSync('quran/tafsir/'+f,'utf8'));gl+=(JSON.stringify(cur).match(/[\u0600-\u06FF۔][utywrgaSEp](?![A-Za-z])/g)||[]).length}ck(gl===0,'Saadi stray glyph letters (u t y w r g a S E p) left '+gl)}
console.log(bad?'FAIL':'PASS tafsir_sayyidna_all',left,sy,dbl);process.exit(bad?1:0)
