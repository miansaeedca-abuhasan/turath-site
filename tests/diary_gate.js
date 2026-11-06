// Guard: Hifz Diary needs >=10 students to register; no fee/transaction wording anywhere
const fs=require('fs');let bad=0;const ok=(c,m)=>{if(!c){console.log('FAIL',m);bad++}};
const h=fs.readFileSync('diary.html','utf8'),j=fs.readFileSync('functions/api/diary.js','utf8');
ok(/function kidsGate/.test(h),'kidsGate exists');
ok(/if\(mode==='reg'&&!\(KIDS>=10\)\)return kidsGate\(\)/.test(h),'reg blocked until KIDS>=10');
ok(/if\(n<10\)return kidsGate\(true\)/.test(h),'<10 stops');
ok(/kids:KIDS/.test(h),'client sends kids');
ok(/parseInt\(b\.kids, 10\) >= 10/.test(j)&&/minkids/.test(j),'server enforces');
ok(h.indexOf('kidsq:')<h.indexOf('kidsq:',h.indexOf('kidsq:')+1)||(h.match(/kidsq:/g)||[]).length>=2,'ur+en texts');
// terms + pledge + e-mail-verified record
const tj=fs.readFileSync('diary-terms.js','utf8'),th=fs.readFileSync('diary-terms.html','utf8');
ok(/function termsPage/.test(h)&&/if\(mode==='reg'&&!AGREE\)return termsPage\(\)/.test(h),'terms page before the form');
ok(/agree:AGREE/.test(h),'client sends pledge');
ok(/noagree/.test(j)&&/INSERT INTO d_terms/.test(j)&&/d_terms \(inst/.test(j),'server stores pledge with institution');
ok(/بری الذمہ/.test(tj)&&/چندہ/.test(tj)&&/10 بچے/.test(tj)&&/ایکسل/.test(tj)&&/وارننگ/.test(tj),'terms clauses present');
ok(/diary-terms\.js/.test(h)&&/diary-terms\.js/.test(th),'single source for both pages');
const files=['diary.html','diary-guide.html','functions/api/diary.js'].filter(f=>fs.existsSync(f));
for(const f of files){const t=fs.readFileSync(f,'utf8');
 ok(!/فیس|ادائیگی|لین دین|\b(fee|fees|payment|invoice|price|billing|transaction)\b/i.test(t),'no fee wording in '+f)}
console.log(bad?'FAILED':'PASS');process.exit(bad?1:0);
