// Guard: Arabic quotes « » inside the home-page daily hadith/adhkar Urdu text carry full i'rab.
const fs=require('fs');process.chdir(__dirname+'/..');let bad=[],n=0,D;
new Function('DAILY',fs.readFileSync('daily.js','utf8'))(d=>D=d);
const WAIT=['11213','11214','11216','11218','11224','11229'];// no complete vocalized source yet: left unvocalized on purpose, never patched from other texts
for(const [k,v] of Object.entries(D.hadith)){if(WAIT.includes(k))continue;for(const m of v.ur.matchAll(/«([^»]+)»/g)){const g=m[1];if(!/[ء-ي]{3}/.test(g))continue;n++;
 const L=(g.match(/[ء-ي]/g)||[]).length,T=(g.match(/[ً-ْ]/g)||[]).length;if(T<L*0.5)bad.push(k+': '+g.slice(0,30));}}
if(n<20)bad.push('too few quotes '+n);
console.log(bad.length?'FAIL '+bad.slice(0,5).join(' | '):'PASS '+n);process.exit(bad.length?1:0);
