// every Urdu tafsir: durood in one written form, no abbreviations / Arabic spelling / broken forms
const fs=require('fs');let bad=0;
global.QTAFSIR=(k,o)=>{cur=o};let cur;
const files=fs.readdirSync('quran/tafsir').filter(f=>/^ur_.*_\d+\.js$/.test(f));
const rules=[[/صلعم/,'abbrev'],[/(?<![؀-ۿ])صل\s?عم(?![؀-ۿ])/,'abbrev2'],[/صلى\s*الله/,'arabic spelling'],[/صلی اللہ علیہ (?:و آ ?لہ|و ?آ لہ|والہ)/,'wa-aalihi spelling'],[/صلی اللہ علیہ(?= (?:کی|کا|کے|نے|سے|پر|کو)(?![؀-ۿ]))/,'truncated'],[/صلی اللہ علیہو|علیہ و سلم|صل اللہ علیہ/,'misspelt'],[/[ﷺ]/,'symbol']];
let ok=0;
for(const f of files){eval(fs.readFileSync('quran/tafsir/'+f,'utf8'));for(const s in cur)for(const r of cur[s])for(const [re,n] of rules)if(re.test(r[2])){bad++;if(bad<15)console.log('FAIL',f,s,n,r[2].match(re)[0])}ok+=(JSON.stringify(cur).match(/صلی اللہ علیہ وسلم/g)||[]).length}
if(ok<15000){bad++;console.log('too few durood',ok)}
console.log(bad?'FAIL':'PASS',files.length,'files',ok,'durood');process.exit(bad?1:0);
