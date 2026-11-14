// Guard: Muwatta (narration of Yahya, sh28107) rebuilt from its epub: 4186 paragraphs, printed numbers N/M kept, order hadith -> takhrij -> meanings of words, notes in the footnote box, no raw marks
const fs=require('fs');let bad=[];const D=s=>s.replace(/[ً-ٰٟ]/g,'');
const idx=fs.readFileSync(__dirname+'/../coll/index.js','utf8');const J=JSON.parse(idx.slice(idx.indexOf('(')+1,idx.lastIndexOf(')')));
const b=J.find(x=>x.key==='sh28107');let rows=0,withFn=0,had=0;
if(b.count!==4186)bad.push('count '+b.count);
for(const [a,z,f] of b.files.ar){const t=fs.readFileSync(__dirname+'/../coll/'+f,'utf8');const r=JSON.parse(t.slice(t.indexOf('",[')+2,t.lastIndexOf(')')));
 for(const q of r){rows++;const s=D(q[1]);const m=s.indexOf('[معاني الكلمات]'),k=s.indexOf('[التخريج]');if(m>=0&&k>=0&&m<k)bad.push('meanings before takhrij '+q[0]);
 if(/\(\^/.test(q[1]))bad.push('raw mark '+q[0]);if(/⦗/.test(q[1]))bad.push('page marker '+q[0]);
 const marks=(q[1].match(/\(\d{1,2}\)/g)||[]).length;const fn=q[3]&&q[3].fn?q[3].fn.split('\n').length:0;if(fn)withFn++;if(marks<fn)bad.push('fewer marks than notes '+q[0]);
 if(/\//.test(b.an[q[0]]||''))had++}}
if(rows!==4186)bad.push('rows '+rows);if(had!==844)bad.push('hadith numbers N/M '+had);if(withFn<1500)bad.push('notes rows '+withFn);
if(b.an[4]!=='4/1')bad.push('an[4]='+b.an[4]);
console.log(bad.length?'FAIL '+bad.slice(0,6).join(' | '):'PASS muwatta_order');process.exit(bad.length?1:0)
