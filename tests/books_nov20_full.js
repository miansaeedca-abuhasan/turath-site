// four Ansar as-Sunnah books added 20-11-2026: complete counts, sequential ids, no stray glyphs, print numbering, news card
const fs=require('fs'),vm=require('vm');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const R=__dirname+'/../';
let reg;vm.runInNewContext(fs.readFileSync(R+'coll/index.js','utf8'),{COLLS:a=>{reg=a}});
const want={fazailnasai:284,zuhdwaki:533,musnadibrahim:51,musnadishaq:982};
function load(key,lang){const rows=[];for(const [a,b,f] of reg.find(e=>e.key===key).files[lang]){vm.runInNewContext(fs.readFileSync(R+'coll/'+f,'utf8'),{COLLDATA:(k,l,r)=>rows.push(...r)})}return rows}
const cat=fs.readFileSync(R+'index.html','utf8').match(/HB_CAT=\{[^}]*\}/)[0];
for(const key in want){
  const e=reg.find(x=>x.key===key);ck(e,key+' registered');if(!e)continue;
  ck(e.count===want[key],key+' count '+e.count);
  const ar=load(key,'ar'),ur=load(key,'ur');
  ck(ar.length===want[key]&&ur.length===want[key],key+' rows ar/ur '+ar.length+'/'+ur.length);
  ck(ar.every((r,i)=>r[0]===i+1)&&ur.every((r,i)=>r[0]===i+1),key+' ids sequential');
  const txt=[];(function w(x){if(typeof x==='string')txt.push(x);else if(Array.isArray(x))x.forEach(w);else if(x&&typeof x==='object')Object.values(x).forEach(w)})([ar,ur]);const all=txt.join('\n');
  ck(!/[A-Za-z@#$]/.test(all),key+' no Latin letters/symbols in text');
  ck(!/[ﷺﷻؓؒؑ]/.test(all),key+' no honorific symbols');
  const ks=ur.filter(r=>r[3]&&r[3].k).map(r=>r[3].k);
  ck(ks.length>0&&ks.every(k=>!/[۰-۹٠-٩]/.test(k)),key+' takhrij: English digits only');
  ck(ks.every(k=>!/(^|[^ب])رقم\s*:/.test(k)&&!/(حدیث|حديث)\s*:\s*\d+\s*[،۔]?\s*$/.test(k.replace(/دیکھیے.*$/,''))),key+' takhrij: no "رقم: N" / "حدیث: N" left, uses book (N)');
  ck(ks.some(k=>/\(\d+(\/\d+)?\)/.test(k)),key+' takhrij has book (number) style');
  ck(!/[\u06f0-\u06f9]/.test(JSON.stringify(ur.map(r=>r[3]&&r[3].e))),key+' sharh numerals not Persian');
  ck(!/علیصلى|صلی للہ|مالی صلى/.test(JSON.stringify(e.intro)),key+' no glued/damaged honorific in intro');
  ck(!/\(\(/.test(all),key+' no (( left');
  ck(!/یٰ/.test(JSON.stringify(ur)),key+' no dagger alif after yeh in Urdu');
  ck(ar.every(r=>/[.؟!»]\s*$/.test(r[1])||/[.]\s*»?\s*$/.test(r[1])),key+' Arabic rows end with full stop');
  ck(e.sections[0][2]===1&&e.sections[e.sections.length-1][3]===want[key],key+' sections cover all');
  ck(e.sections.every((s,i)=>i===0||s[2]===e.sections[i-1][3]+1),key+' sections contiguous');
  ck(new RegExp('"'+key+'":\\d+').test(cat),key+' category set');
}
const z=reg.find(x=>x.key==='zuhdwaki'),q=reg.find(x=>x.key==='musnadishaq');
ck(!z.an['187']&&z.an['188']==='187'&&z.an['189']==='188','zuhd: printed 187 twice');
ck(q.an['478']==='477'&&q.an['982']==='981'&&!q.an['477'],'ishaq: printed 477 twice, last 981');
ck(q.sections.length===39&&z.sections.length===73&&reg.find(x=>x.key==='fazailnasai').sections.length===82,'section counts');
const n=JSON.parse(fs.readFileSync(R+'news.json','utf8')),h=fs.readFileSync(R+'index.html','utf8');
const c=n[0];ck(c.id==='20261120a'&&c.keys.slice(0,4).join()===Object.keys(want).join(),'news card');
ck(c.i.ur.length===c.keys.length&&Object.keys(want).every((k,i)=>c.i.ur[i].includes('('+want[k]+')')),'one line per book with count');
ck(/"id":"20261120a"[^\n]*musnadishaq/.test(h),'news card in app list');
const fz=reg.find(x=>x.key==='fazailnasai');
ck(fz.trn.ur==='محمد احمد صدیق'&&fz.trn.en==='Muhammad Ahmad Siddiq','fazailnasai translator name');
ck(!/النصری|Nasri/.test(JSON.stringify(n[0])+fs.readFileSync(R+'index.html','utf8').match(/"id":"20261120a"[^\n]*/)[0]),'news: old translator name gone');
ck(!/\b(?:ديا|فرمايا|ركهيں|كهه)\b|صحابه کرام/.test(JSON.stringify(fz.intro)),'fazailnasai intro: no Arabic-letter spellings in Urdu words');
if(bad)process.exit(1);console.log('PASS books_nov20_full');
