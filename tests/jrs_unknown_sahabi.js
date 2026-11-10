// Guard: hadith that had no narrator now belong to a Companion; the unnamed ones sit in «نامعلوم صحابی»; no hadith number sits twice in one narrator.
const fs=require('fs');const s=fs.readFileSync(__dirname+'/../data/jrs.js','utf8');const j=JSON.parse(s.slice(s.indexOf('(')+1,s.lastIndexOf(')')));
let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const u=j.n.find(x=>x.nm.ur==='نامعلوم صحابی');ck(u&&u.h.includes(270)&&u.h.includes(425)&&u.c===u.h.length,'unnamed companion holds 270 and 425');
const ab=j.n.find(x=>x.nm.ar==='أبو ذر الغفاري');ck(ab.h.includes(84),'Abu Dharr has hadith 84');
j.n.forEach(x=>{ck(new Set(x.h).size===x.h.length,'duplicate numbers in '+x.nm.ar);ck(x.h.every((v,i)=>!i||x.h[i-1]<v),'sorted '+x.nm.ar);ck(x.x&&x.x.ur&&x.x.ar&&x.x.en,'intro '+x.nm.ar)});
console.log(bad?'FAIL':'PASS');process.exit(bad?1:0)
