// Guard: every data file named by an older deploy's index stays on the server, so a phone holding an old coll/index.js never gets an empty chapter (Raheeq chapters 9 and 11 were blank on a phone).
const {execSync}=require('child_process'),fs=require('fs');process.chdir(__dirname+'/..');let bad=[];
const old=execSync('git log --diff-filter=D --name-only --pretty=format: -n 60 -- "coll/raheeq_*"').toString().split('\n').filter(x=>/^coll\/raheeq_/.test(x));
const miss=[...new Set(old)].filter(f=>!fs.existsSync(f));if(miss.length)bad.push('missing old files: '+miss.slice(0,3).join(','));
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');process.exit(bad.length?1:0);
