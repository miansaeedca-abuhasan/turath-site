// Raheeq al-Makhtum: pages 79, 81, 82, 85 and 379 of the printed book were corrected from the page photos
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const s=fs.readFileSync('coll/index.js','utf8'),L=JSON.parse(s.slice(s.indexOf('(')+1,s.lastIndexOf(')')));
const e=L.find(x=>x.key==='raheeq');const rows={};
for(const [a,b,f] of e.files.ur){const t=fs.readFileSync('coll/'+f,'utf8');JSON.parse(t.slice(t.indexOf('[['),t.lastIndexOf(')'))).forEach(r=>rows[r[0]]=r[1])}
ck(/پائخانہ پوت دیا/.test(rows[22])&&/مُحَسِّر/.test(rows[22])&&!/شه این شام/.test(rows[22]),'p79 body present, footnote junk gone');
ck(/وہ بچاؤ کرنے کے لائق ہو گئے/.test(rows[23])&&/مزید دس اونٹ/.test(rows[23])&&/یہاں تک کہ اللہ راضی ہو جائے/.test(rows[23])&&/برقرار رکھا/.test(rows[23]),'p81 text');
ck(/ملک شام/.test(rows[23])&&/مؤرخین/.test(rows[23])&&/کھلایا تھا/.test(rows[23])&&!/دودھ پلایا تھا/.test(rows[23])&&/عفا جانب البطحاء/.test(rows[23]),'p82 text and verses');
ck(!/اور تنقیح الفہوم ص ۹۰، رحمۃ للعالمین ۲؍۵۶، ۶۶۔\nوہ بچاؤ/.test(rows[23]),'footnote no longer inside the sentence');
ck(!/تلقيح|دوده/.test(rows[25])&&/خیر ہم کسی نہ کسی طرح/.test(rows[25])&&/ذرا ہم پر مہربانی کر/.test(rows[25])&&/’’ہاں ہاں! بخدا یہ وہی ہے۔‘‘/.test(rows[25]),'p85 text');
ck(/برابر نہیں/.test(rows[227])&&!/برا یہ نہیں/.test(rows[227]),'p379 text');
ck(/ابن ہشام ۲؍۹۴ - حافظ ابن حجر/.test(rows[229]),'p379 footnote');
console.log(bad?'FAILED':'OK');process.exit(bad?1:0);
