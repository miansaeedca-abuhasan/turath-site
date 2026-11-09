// Guard: Quran-encyclopedia verses carry exactly the words printed in the author's PDF (partial where he printed partial).
const fs=require('fs');process.chdir(__dirname+'/..');let bad=[];
let C;new Function('COLLS',fs.readFileSync('coll/index.js','utf8'))(d=>C=d);
const b=C.find(x=>x.key==='qenc'),rows=[];for(const [s,e,f] of b.files.ur)new Function('COLLDATA',fs.readFileSync('coll/'+f,'utf8'))((k,l,a)=>rows.push(...a));
const vs=r=>rows.flatMap(x=>x[1].match(/﴿[^﴾]+﴾/g)||[]);
const nz=t=>t.replace(/[آأإٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^ء-ي]/g,'');
const has=(r,t)=>vs(r).some(v=>nz(v)===nz(t));
if(!has(28,'إِنِّيٓ أَعۡلَمُ مَا لَا تَعۡلَمُونَ'))bad.push('Baqara 30 partial (entry 28)');
if(!has(14,'وَلَقَدۡ ذَرَأۡنَا لِجَهَنَّمَ كَثِيرࣰ ا مِّنَ ٱلۡجِنِّ وَٱلۡإِنسِۖ'))bad.push("A'raf 179 partial (entry 14)");
if(!has(8,'وَأَنزَلۡنَآ إِلَيۡكَ ٱلۡكِتَٰبَ بِٱلۡحَقِّ مُصَدِّقࣰ ا لِّمَا بَيۡنَ يَدَيۡهِ مِنَ ٱلۡكِتَٰبِ وَمُهَيۡمِنࣰ ا عَلَيۡهِۖ'))bad.push('Maida 48 partial (entry 8)');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');process.exit(bad.length?1:0);
