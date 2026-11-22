const fs=require('fs'),g=require('fs').readdirSync('coll');let bad=0;
const rd=p=>g.filter(f=>f.startsWith(p)).map(f=>fs.readFileSync('coll/'+f,'utf8')).join('\n');
const sh=rd('shaansahabaur_ur_'),sa=rd('saheefaaliur_ur_');
const chk=(c,m)=>{if(!c){console.log('FAIL',m);bad++;}};
chk(!/رضی اللہ بن/.test(sh),'رضی اللہ بن');chk(/سیدنا عثمان بن عفان رضی اللہ عنہ ہیں/.test(sh),'uthman line');
chk(/سیدنا علی رضی اللہ عنہ نے بیان کیا: اللہ تعالیٰ کی کتاب/.test(sa),'riwaya 1 supplied text');
chk(/قتادہ رحمہ اللہ نے ابو حسان رحمہ اللہ سے روایت کیا/.test(sa),'riwaya 2 supplied text');
chk(/ادنیٰ/.test(sa)&&/تعالیٰ، فرشتوں/.test(sa),'dagger alif kept (owner 21-11)');
console.log(bad?'FAILED':'PASS shaan_saheefa_fixes');process.exit(bad?1:0);
