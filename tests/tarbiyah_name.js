// Guard: the children's chart is named «تربیہ» (not «تربیت») in Urdu on the home tile and its own page.
const fs=require('fs');process.chdir(__dirname+'/..');let bad=[];
const t=fs.readFileSync('tarbiyat.html','utf8'),ix=fs.readFileSync('index.html','utf8');
if(!/<title>تربیہ —/.test(t))bad.push('page title');
if(!/id="ttl">تربیہ</.test(t))bad.push('page heading');
if(/(^|[^؀-ۿ])تربیت([^؀-ۿ]|$)/.test(t))bad.push('old name still in page');
if(!/ur: 'تربیہ', ar: 'التربية'/.test(ix))bad.push('home tile');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');process.exit(bad.length?1:0);
