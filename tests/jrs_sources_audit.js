// Guard: a hadith number may be listed under an author's book only when that book really carries it
// (cited in the takhrij of the hadith, or its text found in the book). Waqidi's Maghazi had 52 wrong numbers.
const fs=require('fs');let bad=[];
const s=fs.readFileSync('data/jrs.js','utf8');const D=JSON.parse(s.slice(s.indexOf('(')+1,s.lastIndexOf(')')));
const by=i=>D.s.find(x=>x.ar.title.includes(i));
const w=by('المغازي — الواقدي');if(w&&w.h.includes(120))bad.push('Waqidi must not carry hadith 120 (narrator mention only)');
D.s.forEach(x=>{if(x.c!==x.h.length)bad.push('count differs '+x.i)});
const bk=D.s.find(x=>x.ar.title==='صحيح البخاري');if(bk.h.includes(120))bad.push('hadith 120 is Muslim, not Bukhari');
const mu=D.s.find(x=>x.ar.title==='صحيح مسلم');if(!mu.h.includes(120))bad.push('hadith 120 missing from Muslim');
// a book name without an author carries the author's name in the list
const mw=D.s[0];if(!mw.sh||!/مالك/.test(mw.sh.ar)||!/مالک/.test(mw.sh.ur))bad.push('Muwatta author');
const j=fs.readFileSync('jrs.js','utf8');if(!/x\.sh && o\.title\.indexOf/.test(j))bad.push('jrs.js shows author');
const c=fs.readFileSync('coll/index.js','utf8');if(/امام احمد\) – اردو ترجمہ/.test(c))bad.push('double Urdu translation in title');
// citations that appear only in the dirasa/takhrij text count too
const has=(t,n)=>{const x=D.s.find(y=>y.ar.title.includes(t));return x&&x.h.includes(n)};
[['مسند مسدد',16174],['مسند مسدد',15568],['مسند مسدد',15370],['مسند مسدد',12445],['مسند بقي بن مخلد',2619],['المعجم الكبير',2619],['المطالب العالية',15370],['المصنف — عبد الرزاق',15370],['دلائل النبوة — البيهقي',12445],['مسند أحمد',15568]].forEach(([t,n])=>{if(!has(t,n))bad.push('missing '+n+' in '+t)});
console.log(bad.length?'FAIL '+bad.join('; '):'PASS');process.exit(bad.length?1:0);
