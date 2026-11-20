const fs=require('fs');const s=fs.readFileSync('quran/tafsir/index.js','utf8');const m=fs.readFileSync('quran/meta.js','utf8');
const need=['مولانا ثناء اللہ امرتسری','مولانا عبد الرحمٰن کیلانی','محمد لقمان سلفی','مولانا حنیف ندوی','مولانا ابوالکلام آزاد','میاں محمد جمیل','شیخ عبد الرحمٰن السعدی','حافظ ابن کثیر'];
for(const n of need) if(!s.includes(n)){console.log('FAIL',n);process.exit(1)}
if(!m.includes('"ur":"مولانا عبد السلام بھٹوی"')||m.includes('تفسیر بھٹوی')){console.log('FAIL bhuttavi');process.exit(1)}
console.log('PASS tafsir_author_names');
