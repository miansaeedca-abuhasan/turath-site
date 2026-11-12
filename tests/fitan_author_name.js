// guard: Kitab al-Fitan names the sharih as «دکتور محمد عبداللہ اعظمی (المعروف بالضیاء) رحمہ اللہ» everywhere
const fs=require('fs');const f=fs.readdirSync(__dirname+'/../coll').filter(x=>/^fitan_ur/.test(x));let bad=0;
for(const n of f){const s=fs.readFileSync(__dirname+'/../coll/'+n,'utf8');
 if(/ضیاء الرحمن|ضياء الرحمن/.test(s)){console.log('FAIL old name in',n);bad++;}
 if((s.match(/دکتور محمد عبداللہ اعظمی \(المعروف بالضیاء\) رحمہ اللہ/g)||[]).length<3){console.log('FAIL new name count');bad++;}}
console.log(bad?'FAILED':'OK');process.exit(bad?1:0);
