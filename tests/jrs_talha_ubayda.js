// Talha / Abu Ubaydah entries come from the hadith themselves; no dot inside the name in hadith 4837
const fs=require('fs');let bad=[];let D;window={TURATH_JRS:x=>{D=x}};eval(fs.readFileSync('data/jrs.js','utf8'));
const by=a=>D.n.find(x=>x.nm.ar===a);
const t=by('طلحة بن عبيد الله'),o=by('طلحة (غير ابن عبيد الله)'),u=by('أبو عبيدة بن الجراح');
if(!t||JSON.stringify(t.h)!==JSON.stringify([26,699,1725,2173,2521,4295,4837,5321,5469,5870,9937,10859,13050,14840,15662].sort((a,b)=>a-b))||t.c!==15)bad.push('Talha ibn Ubaydillah hadith '+(t&&t.h));
if(!o||JSON.stringify(o.h)!=='[15206]'||o.c!==1)bad.push('other Talha');
if(!u||JSON.stringify(u.h)!=='[446,3097,8181,9336]')bad.push('Abu Ubaydah ibn al-Jarrah');
if(D.n.some(x=>x.nm.ar==='أبو عبيدة'||x.nm.ar==='طلحة'))bad.push('bare ambiguous names remain');
for(const f of fs.readdirSync('data').filter(f=>/^d\d+\.js$/.test(f))){if(/بْنِ\.["\s]*,?["\s]*عُبَيْدِ/.test(fs.readFileSync('data/'+f,'utf8')))bad.push('dot inside name in '+f);}
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');process.exit(bad.length?1:0);
