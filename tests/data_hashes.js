// Guard: every ?h= hash in index.html / data/d1.js equals the real content hash of its file, so no phone keeps an old data file
const fs=require('fs'),cr=require('crypto');process.chdir(__dirname+'/..');
const md=f=>cr.createHash('md5').update(fs.readFileSync(f)).digest('hex').slice(0,10);
let bad=[];
for(const [file,txt] of [['index.html',fs.readFileSync('index.html','utf8')],['data/d1.js',fs.readFileSync('data/d1.js','utf8')]]){
  for(const m of txt.matchAll(/(data\/(?:d|dr|bn)\d+\.js)\?h=([0-9a-f]{10})/g)) if(md(m[1])!==m[2])bad.push(file+': '+m[1]+' stale');}
const d1=fs.readFileSync('data/d1.js','utf8');
const j=d1.match(/"jsh":"([0-9a-f]{10})"/)[1],k=d1.match(/"mkh":"([0-9a-f]{10})"/)[1];
if(md('jstruct.js')!==j)bad.push('jstruct.js stale');if(md('data/madkhal.js')!==k)bad.push('madkhal.js stale');
console.log(bad.length?'FAIL '+bad.join(' | ')+' (run: python3 tools/rehash.py)':'PASS');process.exit(bad.length?1:0);
