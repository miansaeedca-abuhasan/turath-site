// «اپڈیٹس» card of Dala'il an-Nubuwwah (Urdu) 27-11-2026 + entry 434 fixed (printed Arabic line instead of the glyph «r»)
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const nj=JSON.parse(fs.readFileSync('news.json','utf8'));const c=nj.find(x=>x.id==='20261127a');
ck(c&&c.keys.join().startsWith('dalailur,shuabimanur,sahihjamiur'),'card keys');
for(const l of ['ur','ar','en','bn','hi','gu','fr'])ck(c&&c.i[l]&&c.i[l].length>=3&&c.t[l],'lang '+l);
ck(c&&c.l[0]==='#/s/dalailur','link');
ck(fs.readFileSync('index.html','utf8').includes('"id":"20261127a"'),'inline copy');
ck(nj.filter(x=>x.d==='27-11-2026').length===1,'one card per day');
const f=fs.readdirSync('coll').filter(x=>x.startsWith('dalailur_ur_'));
let txt='';for(const x of f){const s=fs.readFileSync('coll/'+x,'utf8');txt+=s}
ck(/«رَحِمَ اللّٰهُ قُسًّا/.test(txt),'434 Arabic line');
ck(!/\\n\s*r\s*\\n|\\nr\\n/.test(txt),'no lone r line');
console.log(bad?'FAILED':'OK');process.exit(bad?1:0)
