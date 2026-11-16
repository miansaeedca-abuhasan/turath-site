// guard: glued/garbled Urdu words fixed in the translated books stay fixed
const fs=require('fs');let bad=0;
const files=[...new Set((fs.readFileSync(__dirname+'/../coll/index.js','utf8').match(/[A-Za-z0-9_]+_ur_\d+_[0-9a-f]+\.js/g)||[]))];
const pats=[[/فرمایاکہ/,'فرمایاکہ'],[/گااور/,'گااور'],[/(?<=\s)فرتا(?=\s)/,'فرتا'],[/گاا سے/,'گاا سے']];
for(const f of files){const t=fs.readFileSync(__dirname+'/../coll/'+f,'utf8');for(const [p,n] of pats)if(p.test(t)){console.log('FAIL',n,'in',f);bad++}}
console.log(bad?'FAILED':'OK');process.exit(bad?1:0)
