// «شکر و ماخذ» names altadabbur.com as the source of «القرآن: تدبر و عمل» in ur / ar / en (owner 26-11-2026)
const fs=require('fs');const s=fs.readFileSync(__dirname+'/../thanks.html','utf8');let bad=[];
const secs=s.split(/<section class="/).slice(1);
['ur','ar','en'].forEach(l=>{if(!secs.some(x=>x.startsWith(l+'"')&&x.includes('altadabbur.com')))bad.push('no credit in '+l)});
console.log(bad.length?'FAIL '+bad:'PASS thanks_tadabbur');process.exit(bad.length?1:0);
