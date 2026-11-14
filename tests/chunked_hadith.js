// The chunked Jami data (data/hl.js light list + data/h/*.js full text) must say exactly what data/d1..d10 say, for every hadith
const fs=require('fs'),crypto=require('crypto');process.chdir(__dirname+'/..');let bad=0;const ck=(c,m)=>{if(!c){bad++;if(bad<15)console.log('FAIL',m)}};
const w={};for(let i=1;i<=10;i++)new Function('window',fs.readFileSync('data/d'+i+'.js','utf8'))(w);
const O=new Map(w.TURATH_DATA.hadith.map(h=>[h.num,h]));
const g={};new Function('window',fs.readFileSync('data/hl.js','utf8'))(g);new Function('window',fs.readFileSync('data/meta.js','utf8'))(g);
const HL=g.TURATH_HL,R=g.TURATH_REFS;ck(HL.r.length===O.size,'same number of hadith '+HL.r.length+'/'+O.size);
HL.r.forEach((r,i)=>{const o=O.get(r[0]);if(!o)return ck(false,'unknown '+r[0]);const t=HL.t[r[2]];
 for(const k in t)if(JSON.stringify(t[k])!==JSON.stringify(o[k]))ck(false,r[0]+' light field '+k);
 ck(!!r[1]===!!o.demo,r[0]+' demo');ck(JSON.stringify(r[3]===null?undefined:r[3])===JSON.stringify(o.grade),r[0]+' grade');ck(r[4]===(o.matn[0]||'').slice(0,160),r[0]+' first line');
 ck(!!(r[5]&1)===!!Object.keys(o.content||{}).length&&!!(r[5]&2)===!!Object.keys(o.tuhfa||{}).length,r[0]+' flags');ck(JSON.stringify(R[r[0]]||[])===JSON.stringify(o.refs||[]),r[0]+' refs');});
let seen=0;global.TURATH_CHUNK=(c,recs)=>recs.forEach(x=>{const o=O.get(x.num),a=Object.assign({},o);delete a.refs;ck(JSON.stringify(a)===JSON.stringify(x),x.num+' full record');seen++});
HL.h.forEach((h,c)=>{const b=fs.readFileSync('data/h/'+c+'.js','utf8');ck(crypto.createHash('md5').update(b).digest('hex').slice(0,10)===h,'chunk '+c+' hash');eval(b)});
ck(seen===O.size,'chunks hold every hadith '+seen);
console.log(bad?'FAILED':'OK');process.exit(bad?1:0);
