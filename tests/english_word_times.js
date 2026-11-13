// Guard: word times for English audio of Book 2 exist for hadith 22-757, in order and with sane numbers
const fs=require('fs');const s=fs.readFileSync(__dirname+'/../audio/en/w2.js','utf8');const W=JSON.parse(s.slice(s.indexOf('(')+1,s.lastIndexOf(')')));
let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
for(let n=22;n<=757;n++){const w=W[n];ck(w&&w.length>20,'times for '+n);if(!w)continue;
 ck((w[0][0]==='Hadith'&&(w[1][0]===String(n)||w[1][0]===n+'.'))||w[0][0]===n+'.','starts with the number '+n);ck(w.every(x=>x[2]>=x[1]&&x[1]>=0),'start/end '+n);ck(w.every((x,i)=>!i||x[1]>=w[i-1][1]-0.01),'order '+n)}
ck(!W[758],'no times past 757');
console.log(bad?'FAIL':'PASS english_word_times');process.exit(bad?1:0)
