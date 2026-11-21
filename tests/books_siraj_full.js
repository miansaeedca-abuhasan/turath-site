// Musnad as-Sarraj (Urdu translation, Ansar as-Sunnah): complete 1578, sequential ids, print numbering, notes, takhrij style, news
const fs=require('fs'),vm=require('vm');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const R=__dirname+'/../';
let reg;vm.runInNewContext(fs.readFileSync(R+'coll/index.js','utf8'),{COLLS:a=>{reg=a}});
function load(key,lang){const rows=[];for(const [a,b,f] of reg.find(e=>e.key===key).files[lang]){vm.runInNewContext(fs.readFileSync(R+'coll/'+f,'utf8'),{COLLDATA:(k,l,r)=>rows.push(...r)})}return rows}
const key='musnadsarrajur',N=1578,e=reg.find(x=>x.key===key);ck(e,'registered');
const ar=load(key,'ar'),ur=load(key,'ur');
ck(e.count===N&&ar.length===N&&ur.length===N,'counts '+ar.length+'/'+ur.length);
ck(ar.every((r,i)=>r[0]===i+1)&&ur.every((r,i)=>r[0]===i+1),'ids sequential');
const txt=[];(function w(x){if(typeof x==='string')txt.push(x);else if(Array.isArray(x))x.forEach(w);else if(x&&typeof x==='object')Object.values(x).forEach(w)})([ar,ur,e.intro]);const all=txt.join('\n');
ck(!/[A-Za-z@#$]/.test(all),'no Latin letters/symbols');
ck(!/[ﷺﷻؓؒؑ]/.test(all)&&!/[❶-❿]/.test(all),'no honorific symbols / raw glyph marks');
ck(!/\(\(/.test(all)&&!/یٰ/.test(JSON.stringify(ur)),'no (( and no dagger alif');
ck(!/صلی اللہ(?! علیہ)|رضی اللہ(?! عن)/.test(JSON.stringify(ur)),'honorifics complete in Urdu');
const ks=ur.filter(r=>r[3]&&r[3].k).map(r=>r[3].k);
ck(ks.length===N&&ks.every(k=>!/[۰-۹٠-٩]/.test(k)),'takhrij on every hadith, English digits');
ck(ks.filter(k=>/\((ص )?\d+(\/\d+)?([،]\s*\d+)*\)/.test(k)).length>1300,'takhrij book (number) style');
ck(!ks.some(k=>/رقم|حدیث\s*:\s*\d/.test(k)),'no «رقم» / «حدیث: N» left in takhrij');
// printed numbering
ck(e.an['594']==='594/1'&&e.an['595']==='594/2'&&e.an['596']==='595'&&!e.an['593'],'printed 594/1, 594/2');
ck(e.an['1578']==='1576','last printed 1576');
const i1172=Object.keys(e.an).filter(k=>/\//.test(e.an[k])).map(k=>e.an[k]);ck(i1172.includes('1172/2')&&i1172.length===3,'three x/2 numbers '+i1172);
// notes: Arabic (3 rows) and Urdu/sharh
const arf=ar.filter(r=>r[3]&&r[3].fn);ck(arf.length===3&&arf.map(r=>r[0]).join()==='3,420,430','arabic notes rows 3,420,430');
ck(arf.every(r=>/\(1\)/.test(r[1])&&/^\(1\) /.test(r[3].fn)),'arabic marks (1) + note (1)');
const urf=ur.filter(r=>r[3]&&r[3].fn);ck(urf.length>=66,'rows with notes '+urf.length);
ck(urf.every(r=>{const t=(r[1]+'\n'+(r[3].e||'')),m=[...t.matchAll(/\((\d+)\)/g)].map(x=>+x[1]),ns=r[3].fn.split('\n').map(l=>+l.match(/^\((\d+)\)/)[1]);return ns.every((n,i)=>n===i+1)&&ns.every(n=>m.includes(n))},'every note has its mark in the text, notes numbered 1..n'));
ck(/\(4\)/.test(ur[88][3].e)&&ur[88][3].fn.split('\n').length===16,'row 89: lost mark 4 restored (PDF p.73)');
ck(/«صَدَقَةٌ[^»]*»\(1\)/.test(ur[1409][3].e),'row 1410: mark after the Arabic quote');
ck(e.sections.length===106&&e.sections[0][2]===1&&e.sections[105][3]===N&&e.sections.every((s,i)=>i===0||s[2]===e.sections[i-1][3]+1),'106 sections contiguous');
ck(/"musnadsarrajur":14/.test(fs.readFileSync(R+'index.html','utf8')),'category set');
ck(e.author[0]==='sarraj'&&e.trn.ur==='امان اللہ عاصم'&&e.langs.join()==='ar,ur','author/translator/langs');
ck(reg.find(x=>x.key==='sarraj').count===1577,'existing Arabic Sarraj untouched');
const n=JSON.parse(fs.readFileSync(R+'news.json','utf8')),c=n[0];
ck(c.keys.includes(key)&&c.i.ur.length===c.keys.length&&c.l.includes('#/s/'+key)&&c.i.ur.at(-1).includes('(1578)'),'news line');
ck(/"id":"20261120a"[^\n]*musnadsarrajur/.test(fs.readFileSync(R+'index.html','utf8')),'news in app list');
if(bad)process.exit(1);console.log('PASS books_siraj_full');
