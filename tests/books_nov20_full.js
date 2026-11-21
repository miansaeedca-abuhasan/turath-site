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
  ck(!/\(\(|\)\)/.test(all),key+' no (( )) left');
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
const c=n[0];ck(c.id==='20261120a'&&c.keys.join()===Object.keys(want).join(),'news card');
ck(c.i.ur.length===4&&c.i.ur.every((l,i)=>l.includes('('+want[c.keys[i]]+')')),'one line per book with count');
ck(/"id":"20261120a"[^\n]*musnadishaq/.test(h),'news card in app list');
if(bad)process.exit(1);console.log('PASS books_nov20_full');
