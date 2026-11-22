// owner 22-11-2026: Tafsir Ibn Kathir (Urdu): no ؓ ؒ ؑ symbols, no Arabic-spelled durood, «حضرت» before Companions is «سیدنا / سیدہ»
const fs=require('fs');process.chdir(__dirname+'/..');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
let all='';for(const f of fs.readdirSync('quran/tafsir').filter(x=>/^ur_ibnkathir_/.test(x)))all+=fs.readFileSync('quran/tafsir/'+f,'utf8');
ck(!/[ؓؒؑ]/.test(all),'symbols left');ck(!/صلى الله عليه وسلم|صلي الله عليه وسلم/.test(all),'Arabic durood left');
ck(!/حضرت (?:ابن عباس|ابن عمر|ابو ?بکر|ابوہریرہ|عمر|عثمان|علی|عائشہ|ابن مسعود)\b/.test(all),'حضرت before a Companion');
ck((all.match(/سیدنا/g)||[]).length>3000,'سیدنا count');ck(/سیدہ عائشہ رضی اللہ عنہا/.test(all),'سیدہ عائشہ رضی اللہ عنہا');
ck(!/(?:ابن عباس|ابن عمر) رضی اللہ عنہ(?!ما)/.test(all),'pair form');ck(!/عائشہ رضی اللہ عنہ(?!ا)/.test(all),'woman form');
ck(/صلی اللہ علیہ وسلم/.test(all),'Urdu durood');
console.log(bad?'FAIL ibnkathir_honorifics':'PASS ibnkathir_honorifics');process.exit(bad?1:0);
