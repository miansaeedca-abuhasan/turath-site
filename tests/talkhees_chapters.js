// Talkhees chapter assignment checked against the Word/PDF (kitab 60 tafsir had hadith placed in the previous verse's chapter)
const fs=require('fs');process.chdir(__dirname+'/..');
const w={};for(let i=1;i<=10;i++)new Function('window',fs.readFileSync('data/d'+i+'.js','utf8'))(w);
const H=w.TURATH_DATA.hadith,by=new Map(H.map(h=>[h.num,h]));
const bn={};global.TURATH_LANG=(l,d)=>Object.assign(bn,d);for(let i=1;i<=8;i++)eval(fs.readFileSync('data/bn'+i+'.js','utf8'));
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m)}};
const nz=t=>t.replace(/[\u064B-\u065F\u0670\u0640]/g,'');
const has=(n,no,frag)=>{const h=by.get(n);ok(h&&h.chapter_no===no&&nz(h.chapter_ar).includes(nz(frag)),n+' should be in chapter '+no+' '+frag+' (got '+(h&&h.chapter_no+' '+h.chapter_ar.slice(0,30))+')')};
has(11889,4,'خَتَمَ اللَّهُ');has(11890,11,'أَوْ كَصَيِّبٍ');has(11891,12,'يَا أَيُّهَا النَّاسُ');has(11894,12,'يَا أَيُّهَا النَّاسُ');has(11895,13,'وَإِنْ كُنْتُمْ');has(11896,14,'وَبَشِّرِ');has(11898,19,'اسْجُدُوا');has(11899,20,'فَأَزَلَّهُمَا');
ok(/Rainstorm/.test(by.get(11890).chapter_en),'english title of 11890');
ok(/বৃষ্টি/.test(bn['11890'].f.chapter_bn)&&!/অধ্যায়/.test(bn['11890'].f.chapter_bn),'bengali title of 11890');
ok(by.get(11890).chapter_en!==by.get(11889).chapter_en,'11890 must not share the previous chapter');
// two surahs may share chapter number and English title (12339 / 13117): the index must keep them apart by the Arabic title
ok(by.get(12339).chapter_ar!==by.get(13117).chapter_ar,'12339 and 13117 are different chapters');
// places kept exactly as the author arranged them (follow the full Jami' order)
has(5555,6,'النهي عن الثنيا');has(5556,7,'جواز كراء الأرض');has(5564,7,'جواز كراء الأرض');has(5565,8,'المزارعة');has(5567,8,'المزارعة');
// the 7 hadith that sat under a surah-heading chapter now follow the Word/PDF (first verse chapter of the surah)
has(12428,1,'بَرَاءَةٌ مِنَ اللَّهِ');has(12637,1,'سُبْحَانَ الَّذِي أَسْرَىٰ');has(12768,1,'يَا أَيُّهَا النَّاسُ اتَّقُوا');has(12815,1,'قَدْ أَفْلَحَ');has(13187,1,'إِنْ تَكْفُرُوا');
// second place kept in the full Jami' order: 5420 Ibn Umar, 5421 Amr ibn Shu'ayb, 5422 Jabir
const tx=n=>[].concat(by.get(n).matn).join(' ').replace(/[\u064B-\u0652]/g,'');
ok(/ابن عمر/.test(tx(5420)),'5420 Ibn Umar');ok(/عمرو بن شعيب/.test(tx(5421)),'5421 Amr');ok(/جابر/.test(tx(5422)),'5422 Jabir');ok(/المحاقلة/.test(tx(5555)),'5555 Jabir muhaqala');
console.log(fail?'tests/talkhees_chapters FAILED '+fail:'tests/talkhees_chapters ok');process.exit(fail?1:0);
