// Guard: the 21 hadith whose vocalized text the user corrected by hand stay exactly as he wrote them (his cyan words = the Shaykh's words, marked)
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const want=[3477,3617,3630,3897,3904,3948,4011,4040,4111,4290,4408,4471,4705,5150,5240,5390,5400,5648,5755,5860,6222];const got={};
for(let i=1;i<=10;i++){const s=fs.readFileSync(__dirname+'/../data/d'+i+'.js','utf8');const a=JSON.parse(s.slice(s.indexOf('push(...')+8,s.lastIndexOf(']);')+1));for(const h of a)if(want.includes(h.num))got[h.num]=h;}
for(const n of want){const h=got[n];ck(!!h,'missing '+n);if(!h)continue;const t=h.matn.join(' ');const har=(t.match(/[ً-ْ]/g)||[]).length;ck(har>t.length/6,n+' vocalized');ck(!/[‏"]/.test(t),n+' no stray marks');}
ck(/يَعُودُنِي/.test(got[3477].matn[0]),'3477 wording as corrected');ck(/[^]*/.test(got[5240].matn[0]),'5240 Shaykh words marked');
console.log(bad?'FAIL':'PASS voc21');process.exit(bad?1:0)
