// Guard: the companions confirmed by the user in file2 (new narrators + links); tabi'i marked yellow stay unlinked; nothing is guessed
const fs=require('fs');process.chdir(__dirname+'/..');let bad=[];const ck=(c,m)=>{if(!c){bad.push(m)}};
let D;global.window={TURATH_JRS:x=>{D=x}};eval(fs.readFileSync('data/jrs.js','utf8'));
const by=a=>D.n.find(x=>x.nm.ar===a),has=(x,n)=>x&&x.h.includes(n);
ck(has(by('أنس بن مالك'),14080)&&has(by('أنس بن مالك'),14199),'Anas: 14080, 14199 (user wrote his full name)');
ck(has(by('أنس بن مالك'),5281)&&has(by('أنس بن مالك'),14256),'Anas: Qatadah hadith');
const um=by('أم عمارة الأنصارية');ck(um&&has(um,1478)&&has(um,13069),'Umm Umarah merged into one narrator');
ck(!D.n.some(x=>x.nm.ar==='أم عمارة'),'no separate «أم عمارة»');
const za=by('زينب بنت جحش');ck(has(za,6093)&&has(za,11320),'Zaynab bint Jahsh merged');
ck(has(by('عائشة'),8606)&&has(by('عائشة'),13945),'Aishah: Urwah hadith 8606, 13945');
ck(!D.n.some(x=>x.h.includes(10403)&&!/تابع/.test(x.nm.ar)&&x.nm.ar==='عائشة'),'10403 (mursal) not under Aishah');
// tabi'i marked yellow by the user stay unlinked
for(const n of [6648,3704,3819,2837,3975,8049,9143,9198]) ck(!D.n.some(x=>x.h.includes(n)&&x.nm.ar!=='نامعلوم صحابی'&&x.nm.ar!==''),'tabi\'i hadith '+n+' must stay unlinked: '+D.n.filter(x=>x.h.includes(n)).map(x=>x.nm.ar));
ck(has(by('الزبير بن العوام'),8685),'8685 under Zubayr (user wrote it)');
ck(has(by('أبو جحيفة'),2537)&&has(by('أبو جحيفة'),9399)&&has(by('أبو جحيفة'),15533),'Abu Juhayfah three hadith');
const unk=D.n.find(x=>x.nm.ur==='نامعلوم صحابی');for(const n of [1341,1421,13826,11171,4244,12475,10027]) ck(has(unk,n),'unnamed group has '+n);
// the mixed «عبد الرحمن بن عثمان» group is split
const ar=by('عبد الرحمن بن عثمان التيمي');ck(ar&&ar.h.includes(5952)&&!ar.h.includes(7025)&&!ar.h.includes(11986),'Abd al-Rahman b. Uthman not mixed');
D.n.forEach(x=>{if(x.c!==x.h.length&&x.c<x.h.length)bad.push('count '+x.i);if(new Set(x.h).size!==x.h.length)bad.push('dup '+x.i)});
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS jrs_file2');process.exit(bad.length?1:0);
