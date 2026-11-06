// Guard: install labels sit in a side column on wide screens (Urdu/Arabic left, others right); one install pop-up per device, after the opening video
const fs=require('fs');let bad=0;const ok=(c,m)=>{if(!c){console.log('FAIL',m);bad++}};
const h=fs.readFileSync('index.html','utf8');
ok(/\.gpbar\.side\.R\{right:max\(1rem,calc\(50vw - var\(--mw,46rem\)\/2 - 19rem\)\)\}\.gpbar\.side\.Lf\{left:/.test(h),'side column css (R right, Lf left)');
ok(/row\.className='gpbar side '\+\(rtl\?'Lf':'R'\)/.test(h),'rtl -> left, else right');
ok(/window\.showInstallPopup=function/.test(h)&&/ipopUntil/.test(h),'popup + remembers closing');
ok(/standalone\|\|document\.getElementById\('ipop'\)/.test(h),'no popup inside the installed app');
ok(/play\.google\.com\/store\/apps\/details\?id=com\.turathkhairalquroon\.app/.test(h),'play link');
ok(/getElementById\('splash'\)/.test(h)&&/\.sheetbg/.test(h),'popup waits for opening video and open sheets');
ok(/on:\{click:\(\)=>\{hide\(30\);go\(\);\}\}/.test(h)&&/on:\{click:\(\)=>hide\(7\)\}/.test(h),'buttons wired with on:{click}');
console.log(bad?'FAILED':'PASS');process.exit(bad?1:0)
