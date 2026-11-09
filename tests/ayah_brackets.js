// Guard: verses in chapter titles and chapter texts of al-Jami al-Kamil carry ﴿ ﴾ (coloured as verses), no verse number inside, and the printed index has 67 books
const fs=require('fs');process.chdir(__dirname+'/..');const bad=[];
const js=fs.readFileSync('jstruct.js','utf8');
const nT=(js.match(/﴿/g)||[]).length;if(nT<1000)bad.push('titles with brackets '+nT);
let nI=0;for(const f of fs.readdirSync('intro').filter(x=>/^jk\d+\.js$/.test(x))){const t=fs.readFileSync('intro/'+f,'utf8');nI+=(t.match(/﴿/g)||[]).length;
  if(/﴿[^﴾]*[\(（]\s*\d+\s*[\)）][^﴾]*﴾/.test(t))bad.push('verse number inside brackets in '+f);}
if(/﴿[^﴾]*[\(（]\s*\d+\s*[\)）][^﴾]*﴾/.test(js))bad.push('verse number inside brackets in titles');
if(nI<1500)bad.push('intro verses '+nI);
if(!js.includes('ما جاء في زكاة عروض التجارة')||!fs.readFileSync('intro/jk14.js','utf8').includes('أورد الإمام البخاريّ هذه الآية'))bad.push('zakat trade group missing');
const ix=fs.readFileSync('index.html','utf8');
if(!/function chTi\(/.test(ix)||!/\.\.\.chTi\(c\)/.test(ix)||!/\.\.\.chTi\(c,true\)/.test(ix))bad.push('chapter titles must use chTi (verse colour)');
if(!/function jRegroup/.test(ix)||!/J_SPLIT/.test(ix))bad.push('67-book regroup missing');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS '+nT+' '+nI);process.exit(bad.length?1:0);
