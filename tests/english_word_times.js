// Guard: word times for English audio of Book 2 exist for hadith 22-1071, in order and with sane numbers
const fs=require('fs');const W={};for(const f of ['w2','w2b']){const s=fs.readFileSync(__dirname+'/../audio/en/'+f+'.js','utf8');Object.assign(W,JSON.parse(s.slice(s.indexOf('(')+1,s.lastIndexOf(')'))))}
let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
for(let n=22;n<=1071;n++){const w=W[n];ck(w&&w.length>20,'times for '+n);if(!w)continue;
 ck((w[0][0]==='Hadith'&&(w[1][0]===String(n)||w[1][0]===n+'.'))||w[0][0]===n+'.','starts with the number '+n);ck(w.every(x=>x[2]>=x[1]&&x[1]>=0),'start/end '+n);ck(w.every((x,i)=>!i||x[1]>=w[i-1][1]-0.01),'order '+n)}
ck(!W[1072],'no times past 1071');
console.log(bad?'FAIL':'PASS english_word_times');process.exit(bad?1:0)
