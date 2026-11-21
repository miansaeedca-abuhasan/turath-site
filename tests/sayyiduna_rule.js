// Owner rule: a Companion written «حضرت … رضی اللہ عنہ(ا)» shows as «سیدنا / سیدہ …» in every Urdu coll book; tabi'in (رحمہ اللہ) keep «حضرت»
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const R=__dirname+'/../coll/';let left=0,files=[];
for(const f of fs.readdirSync(R).filter(x=>/_ur_\d+_/.test(x))){const t=fs.readFileSync(R+f,'utf8');const m=t.match(/حضرت(?:\s+[^\s،۔:؛“”’‘()«»"﴿﴾\\]+){1,3}?\s+رضی اللہ عن[ہھ]ا?(?![مّ])/g)||[];
 const bad_=m.filter(x=>!/^حضرت (حسن|مالک بن اوس) رضی/.test(x)&&!/\s(نے|کہ|کہا|کی|کے|کو|سے|میں|پر|اور|نبی|رسول)\s/.test(x));if(bad_.length){left+=bad_.length;files.push(f)}}
ck(left===0,'«حضرت … رضی اللہ عنہ» left in '+left+' places, e.g. '+files.slice(0,3));
const t=fs.readFileSync(R+fs.readdirSync(R).find(x=>/^ibnkhuzaymahur_ur_1_/.test(x)),'utf8');
ck(/حضرت یحیی بن یعمر سے روایت/.test(t)&&/سیدنا عبداللہ بن عمر رضی اللہ عنہما|عبداللہ بن عمر رضی اللہ عنہما/.test(t),'tabi\'i keeps «حضرت», pair «عنہما» untouched');
if(bad)process.exit(1);console.log('PASS sayyiduna_rule');
