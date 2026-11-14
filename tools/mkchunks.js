// Splits the Jami hadith (data/d1..d10, 50 MB) into: data/hl.js (light list: numbers, chapters, first line - for lists and tables of contents)
// and data/h/<k>.js (full hadith, 200 per file, loaded only when one of them is opened or a search needs the text).
// Run through tools/rehash.py after any change to data/d*.js.
global.window=global;const fs=require('fs'),crypto=require('crypto');process.chdir(__dirname+'/..');
for(let i=1;i<=10;i++)eval(fs.readFileSync('data/d'+i+'.js','utf8'));
const H=TURATH_DATA.hadith.slice().sort((a,b)=>a.num-b.num),N=200;
const md=s=>crypto.createHash('md5').update(s).digest('hex').slice(0,10);
fs.rmSync('data/h',{recursive:true,force:true});fs.mkdirSync('data/h');
const HEAVY=new Set(['sanad','matn','takhrij','takhrij_en','content','tuhfa','refs','full','dr','rep','tks','voc']);
const tup=new Map(),T=[],rows=[],ch=[];
H.forEach((h,i)=>{const t={};for(const k of Object.keys(h).sort())if(!HEAVY.has(k)&&k!=='num'&&k!=='demo'&&k!=='grade')t[k]=h[k];
 const key=JSON.stringify(t);let id=tup.get(key);if(id==null){id=T.length;tup.set(key,id);T.push(t)}
 rows.push([h.num,h.demo?1:0,id,h.grade===undefined?null:h.grade,(h.matn&&h.matn[0]||'').slice(0,160),(Object.keys(h.content||{}).length?1:0)|(Object.keys(h.tuhfa||{}).length?2:0)]);});
for(let c=0;c*N<H.length;c++){const part=H.slice(c*N,(c+1)*N).map(h=>{const o=Object.assign({},h);delete o.refs;return o});
 const body='TURATH_CHUNK('+c+','+JSON.stringify(part)+');';fs.writeFileSync('data/h/'+c+'.js',body);ch.push(md(body))}
fs.writeFileSync('data/hl.js','window.TURATH_HL='+JSON.stringify({n:N,t:T,r:rows,h:ch})+';');
console.log('hl.js',Math.round(fs.statSync('data/hl.js').size/1e3)+' KB,',ch.length,'chunks, tuples',T.length);
