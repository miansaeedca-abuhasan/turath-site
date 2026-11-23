const fs=require('fs');let ok=true;
for(const n of [1,2,3]){const t=fs.readFileSync(`quran/tafsir/ur_saadi_${n}.js`,'utf8');
 if(/\(u\)/.test(t)){console.log('FAIL (u) in',n);ok=false}
 if(n==2&&/(?<![A-Za-z])m(?![A-Za-z])/.test(t)){console.log('FAIL stray m');ok=false}
 if(!/موسیٰ علیہ السلام/.test(t)){console.log('FAIL no alayhis');ok=false}}
console.log(ok?'PASS saadi_u_m':'FAIL');process.exit(ok?0:1)
