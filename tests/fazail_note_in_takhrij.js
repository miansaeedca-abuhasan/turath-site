// Guard: Arabic scholarly notes in Fazail al-Sahaba sit in the takhrij paragraph (not above the Urdu text) and carry no stray « » marks.
const fs=require('fs');process.chdir(__dirname+'/..');let bad=[];
let C;new Function('COLLS',fs.readFileSync('coll/index.js','utf8'))(d=>C=d);
const b=C.find(x=>x.key==='fazail'),rows=[];for(const [s,e,f] of b.files.ur)new Function('COLLDATA',fs.readFileSync('coll/'+f,'utf8'))((k,l,a)=>rows.push(...a));
const urq=/[ٹڈڑںھےکگچپژۓ]|رضی|صلی|سیدنا|ہے|ہیں/;
for(const r of rows){const f=(r[1]||'').split('\n')[0];if(f.length>40&&!urq.test(f)&&f[0]!=='§')bad.push('Arabic-only first line in entry '+r[0]);}
const r=rows.find(x=>x[0]===383);
if(!/ولا يقاس عليه غيره/.test(r[2]))bad.push('383 takhrij lacks note');
if(/[«»]/.test(r[2]))bad.push('383 takhrij has « »');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');process.exit(bad.length?1:0);
