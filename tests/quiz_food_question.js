// owner 25-11-2026: the question must not contain the answer word («میٹھی»)
const s=require('fs').readFileSync(__dirname+'/../quiz/data_ur.js','utf8');let bad=0;
const m=s.match(/\["پیارے نبی صلی اللہ علیہ وسلم کو کھانے میں کونسی چیز پسند تھی؟",([^\]]*)\]/);
if(!m){console.log('FAIL new question missing');bad++}else{const o=m[1].split('","').map(x=>x.replace(/"/g,''));
 if(o[0]!=='شہد اور میٹھی چیز'||!['مصالحے دار','کڑوی چیز','نمکین'].every(x=>o.includes(x))||o.length!==5)bad++,console.log('FAIL options',o)}
if(/کون سی میٹھی چیز پسند/.test(s))bad++,console.log('FAIL old question still there');
console.log(bad?'FAILED':'OK');process.exit(bad?1:0)
