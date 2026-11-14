// Guard: the children's chart is named «تربیہ» (not «تربیت») in Urdu on the home tile and its own page.
const fs=require('fs');process.chdir(__dirname+'/..');let bad=[];
const t=fs.readFileSync('tarbiyat.html','utf8'),ix=fs.readFileSync('index.html','utf8');
if(!/<title>تربیہ —/.test(t))bad.push('page title');
if(!/id="ttl">تربیہ</.test(t))bad.push('page heading');
if(!t.includes('(مرتب: بنت یوسف عفی اللہ عنہا)'))bad.push('compiler credit');
// the founder's own message to parents (PMSG) uses the ordinary word «تربیت» (upbringing); everything else must say «تربیہ»
const tt=t.replace(/const PMSG=[\s\S]*?function parentMsg/,'function parentMsg');
if(/(^|[^؀-ۿ])تربیت([^؀-ۿ]|$)/.test(tt))bad.push('old name still in page');
if(!/ur: 'تربیہ', ar: 'التربية'/.test(ix))bad.push('home tile');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');process.exit(bad.length?1:0);
