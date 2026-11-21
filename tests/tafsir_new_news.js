// the 9 Urdu tafsirs added on 20-11-2026 are announced in that day's «اپڈیٹس» card (one line each, linking to the tafsir) and carry the «نئی» badge for a month
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const n=JSON.parse(fs.readFileSync(__dirname+'/../news.json','utf8')),c=n.find(x=>x.id==='20261120a');
const ks=['ur_makki','ur_sanai','ur_kilani','ur_luqman','ur_hanif','ur_hawashi','ur_azad','ur_fahm','ur_bhuttavi'];
ck(ks.every(k=>{const i=c.keys.indexOf(k);return i>=0&&c.l[i]==='#/q/tafsir/'+k&&/تفسیر/.test(c.i.ur[i])&&c.i.en[i]}),'each tafsir has its line and link');
ck(c.i.ur.length===c.keys.length&&c.i.ur.length===c.l.length&&Object.values(c.i).every(a=>a.length===c.keys.length),'lines/keys/links aligned in every language');
const h=fs.readFileSync(__dirname+'/../index.html','utf8');
ck(ks.every(k=>new RegExp(k+": '2026-12-20'").test(h)),'NEW badge dates');
ck(h.includes('"id":"20261120a"')&&h.includes('"#/q/tafsir/ur_bhuttavi"'),'card also in the app list');
if(bad)process.exit(1);console.log('PASS tafsir_new_news');
