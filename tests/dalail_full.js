// Dala'il an-Nubuwwah (Urdu) dalailur, owner JSON Run-1..3, 27-11-2026
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const rd=(k,l)=>fs.readdirSync('coll').filter(f=>f.startsWith(k+'_'+l+'_')).sort((a,b)=>+a.split('_')[2]-+b.split('_')[2]).flatMap(f=>{const s=fs.readFileSync('coll/'+f,'utf8');return JSON.parse(s.slice(s.indexOf('",[')+2,s.lastIndexOf(')')))});
const idx=fs.readFileSync('coll/index.js','utf8');const A=JSON.parse(idx.slice(idx.indexOf('COLLS(')+6,idx.lastIndexOf(')')));
const E=A.find(e=>e.key==='dalailur'),L=A.find(e=>e.key==='dalail');
const ur=rd('dalailur','ur'),ar=rd('dalailur','ar'),lib=rd('dalail','ar');
ck(E&&ur.length===3336&&ar.length===3336&&E.count===3336,'3336 entries');
ck(ur.every((r,i)=>r[0]===i+1)&&ar.every((r,i)=>r[0]===i+1),'ids sequential');
ck(E.sections.length>=666&&E.sections[0][2]===1&&E.sections[E.sections.length-1][3]===3336&&E.sections.every((s,i)=>i===0||s[2]===E.sections[i-1][3]+1),'sections continuous');
const stray=ur.filter(r=>/[A-Za-z@#$_¤ﷺؓؒؑ]/.test(r[1]));
ck(stray.length<=1,'stray latin letters only the one unresolved «r» (entry 433): '+stray.map(r=>r[0]));
const ub=ur.filter(r=>(r[1].match(/’’/g)||[]).length!==(r[1].match(/‘‘/g)||[]).length);ck(ub.length<=45&&ub.every(r=>Math.abs((r[1].match(/’’/g)||[]).length-(r[1].match(/‘‘/g)||[]).length)<=2),'Urdu quote marks: only the few OCR-stray rows unbalanced (source quotes run over entries): '+ub.length);
const m=ar.filter(r=>r[1]);ck(m.length>2500,'Arabic attached to >2500 entries: '+m.length);
const pos=ar.filter(r=>r[1]).map(r=>lib.findIndex(x=>x[1]===r[1]));
ck(pos.every((p,i)=>p>=0&&(i===0||p>pos[i-1])),'Arabic rows are library rows, in library order, none used twice');
ck(ur[1][1].includes('ہمیں خبر دی')&&/ابو بکر محمد بن حسن بن فورک/.test(ur[0][1]),'first entries');
ck(E.trn&&E.author&&E.author[0]==='bayhaqi','translator + author');
if(bad)process.exit(1);console.log('PASS dalail_full');
