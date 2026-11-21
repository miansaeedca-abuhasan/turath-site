// Guard: no honorific glued to the word before it (النبيصلى الله عليه وسلم, عباسرضي الله عنه) in Jami data, chapter structure or the coll books
const fs=require('fs');let bad=0;
const L='\\u0621-\\u064a\\u06cc\\u06a9\\u06be\\u06c1\\u06d2\\u064b-\\u0652';
const re=new RegExp('['+L+']{2}(?:صلى الله عليه وسلم|صلی اللہ علیہ وسلم|رضي الله عن|رضی اللہ عن)','g');
const files=[];for(const d of ['data','data/h','coll'])for(const f of fs.readdirSync(d))if(/\.js$/.test(f))files.push(d+'/'+f);files.push('jstruct.js');
for(const f of files){const t=fs.readFileSync(f,'utf8');const m=t.match(re);if(m){bad+=m.length;console.log('FAIL glued in',f,m.length,JSON.stringify(m[0]))}}
console.log(bad?'FAIL':'PASS no_glued_honorific');process.exit(bad?1:0);
