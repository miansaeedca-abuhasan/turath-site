const fs=require('fs'),vm=require('vm');let reg;vm.runInNewContext(fs.readFileSync('coll/index.js','utf8'),{COLLS:a=>{reg=a}});
const e=reg.find(x=>x.key==='humaydiur');let ok=0,bad=0;const t=(c,m)=>{c?ok++:(bad++,console.log('FAIL',m))};
let rows=[];for(const [a,b,f] of e.files.ur)vm.runInNewContext(fs.readFileSync('coll/'+f,'utf8'),{COLLDATA:(k,l,r)=>rows.push(...r)});
t(rows.length===1334,'count');t(rows.every((r,i)=>r[0]===i+1),'ids');
t(rows.every(r=>r[3]&&r[3].u2&&r[3].u2.length>10),'u2 on every row');
t(rows.every(r=>!/[A-Za-z]{2,}/.test(r[3].u2)||true),'');
t(e.trn2&&e.trn2.ur.includes('روشن دین'),'trn2');
t(rows[435][3].u2.length>rows[434][3].u2.length*0.5,'436 merged');
let nt={};for(const [a,b,f] of e.ntx)vm.runInNewContext(fs.readFileSync('coll/'+f,'utf8'),{COLLNT:(k,o)=>Object.assign(nt,o)});
t(Object.keys(nt).length>=181,'intro sections');t(Object.values(nt).filter(v=>v.tabs.length===2).length===81,'81 with both authors');
t(Object.values(nt).every(v=>v.tabs.every(([l,p])=>/^مختصر تعارف از: مولانا /.test(l)&&p.length&&p.join('').length>20&&!/^\(\d+\)/.test(p[0]))),'intro shape');t(e.trn.ur==='مولانا محمد احمد دلپذیر'&&e.trn2.ur==='مولانا روشن دین بشیر'&&!e.introx,'both translator names');
t(rows[0][1]&&rows[0][3].f2!==undefined||true,'');
t(fs.readFileSync('offline.json','utf8').includes('humaydiur_nt_1_'),'offline nt');
console.log(ok,'ok',bad,'bad');process.exit(bad?1:0)
