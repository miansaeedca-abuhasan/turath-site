// guard: «قال ابن جريج أخبرني نافع عن عبد الله بن عمر» inside an isnad keeps all narrators (Nasa'i 626)
const fs=require('fs');const s=fs.readFileSync(__dirname+'/../index.html','utf8');
const a=s.indexOf('const SN_SDIA'),b=s.indexOf('function sanadNames'),e=s.indexOf('\n',b);
const P=new Function(s.slice(a,e)+';return SN_parse;')();
const t="أخبرنا محمد بن إسماعيل، وإبراهيم بن الحسن، قالا حدثنا حجاج، قال قال ابن جريج أخبرني نافع، عن عبد الله بن عمر، أنه كان يقول كان المسلمون";
const r=P(t).map(x=>t.slice(x.a,x.b));let bad=0;
for(const w of ['ابن جريج','نافع','عبد الله بن عمر','حجاج'])if(!r.includes(w)){console.log('FAIL missing',w);bad++;}
const m="حدثنا مسدد، عن أبي هريرة، قال: قال رسول الله صلى الله عليه وسلم: الإيمان بضع وسبعون";
const r2=P(m).map(x=>m.slice(x.a,x.b));if(r2.join('|')!=='مسدد|أبي هريرة'){console.log('FAIL matn',r2);bad++;}
console.log(bad?'FAILED':'OK');process.exit(bad?1:0);
