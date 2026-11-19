// guards: Urdu words with marks stay in the Urdu font; salawat in Urdu books is written in Urdu spelling, spaced, never glued, no Arabic-spelled or ﷺ leftovers
const {chromium}=require('playwright');const fs=require('fs');let bad=0;
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=new Date().toDateString()});
await p.goto('http://localhost:8765/#/s/muslim/n/37');await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const o=rich('یہ فتویٰ ہے ان شاء اللہ تعالیٰ اور سیّدنا ابوبکر رَضِيَ اللَّهُ عَنْهُ','ur');return o.map(x=>x.nodeType===1?'['+x.className+':'+x.textContent+']':x).join('')});
console.log(r);
const r2=await p.evaluate(()=>{const o=rich('سیّدالاولین «و الآخرین» اُمت اندازِ «اِن» شاء اللہ «وَمَا مَدَحْتُ مَقَالَتِي» اور «العالمین»','ur');return o.map(x=>x.nodeType===1?'['+x.className+':'+x.textContent+']':x).join('')});
console.log(r2);
for(const w of ['سیّدالاولین','الآخرین','اُمت','اندازِ','اِن','العالمین']) if(new RegExp('\\[arq:[^\\]]*'+w).test(r2)){console.log('FAIL arabic font for',w);bad++;}
if(!/\[arq:[^\]]*وَمَا/.test(r2)){console.log('FAIL vocalized «» phrase lost its Arabic font');bad++;}
for(const w of ['فتویٰ','تعالیٰ','سیّدنا']) if(new RegExp('\\[arq:[^\\]]*'+w).test(r)){console.log('FAIL arabic font for',w);bad++;}
if(!/\[arq:[^\]]*رَضِيَ/.test(r)){console.log('FAIL real Arabic lost its font');bad++;}
await b.close();
const files=fs.readFileSync(__dirname+'/../coll/index.js','utf8').match(/[A-Za-z0-9_]+_ur_\d+_[0-9a-f]+\.js/g)||[];
for(const f of new Set(files)){if(/^tafsirnoor_/.test(f))continue;const k0=f.split('_')[0];const s=fs.readFileSync(__dirname+'/../coll/'+f,'utf8');
 const d=JSON.parse(s.slice(s.indexOf(',"ur",')+6,s.lastIndexOf(']')+1));
 for(const row of d){const t=(row[1]||'').replace(/«[^»]*»/g,'');
  if(/صلى\s*الله|ﷺ/.test(t)){console.log('FAIL Arabic-spelled salawat',f,row[0]);bad++;break;}
  if(/علیہ وسلم(?=[ا-ی])/.test(t)&&!(k0==='raheeq'&&[79,81,82,85,379].includes(row[0]))){console.log('FAIL glued salawat',f,row[0]);bad++;break;}
  if(/‌/.test(t)&&/رضی\s*‌/.test(t)){console.log('FAIL zwnj in radi allah',f,row[0]);bad++;break;}}}
console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
