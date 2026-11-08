// Guards the kitab and majmu' introductions of the Talkhees (from the Word files)
const fs=require('fs');global.window={};const TKD={};
global.window.TURATH_TK=(k,m)=>{TKD[k]=m};
const exp=JSON.parse(fs.readFileSync(__dirname+'/fixtures/tk_intro_expect.json','utf8'));
const need=new Set(exp.map(e=>e[1]));need.forEach(k=>eval(fs.readFileSync(__dirname+'/../intro/tk'+k+'.js','utf8')));
let bad=0;
exp.forEach(([num,k,a0,a1,e0,b0])=>{const o=(TKD[k]||{})['n'+num]||{};
  const chk=(c,m)=>{if(!c)return;if(!(o[m]||[]).includes(c)){bad++;console.log('MISSING',m,num)}};
  chk(a0,'a');chk(a1,'a');chk(e0,'e');chk(b0,'b');});
// existing chapter intros must stay
let total=0;for(let i=1;i<=66;i++){try{eval(fs.readFileSync(__dirname+'/../intro/tk'+i+'.js','utf8'))}catch(e){}}
Object.values(TKD).forEach(m=>total+=Object.keys(m).length);
if(total<1240){bad++;console.log('intro entries too few',total)}
console.log(bad?'FAIL':'PASS talkhees_intros',exp.length,total);process.exit(bad?1:0);
