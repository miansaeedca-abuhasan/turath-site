// Tafsir Noor al-Huda: an Arabic ayah block is ONE paragraph (not cut into page lines), and the translation lines after it are ONE paragraph
const fs=require('fs');let bad=[];global.window={};let A;global.COLLS=a=>{A=a};eval(fs.readFileSync('coll/index.js','utf8'));
const e=A.find(x=>x.key==='tafsirnoor');let rows=[];global.COLLDATA=(k,l,r)=>rows.push(...r);
for(const f of e.files.ur)eval(fs.readFileSync('coll/'+f[2],'utf8'));
const UO=/[ٹڈڑگںےھچپژۂۓیک]/,HAR=/[ً-ْٰ]/g,NUM=/۰۰[۰-۹]/;
const isA=p=>{const q=p.replace(/[\s﴿﴾۰-۹0-9()\[\]:،۔.\-–—«»“”‘’*ۖۗۘۙۚۛؕۢۥٰٓ۠]/g,'');return q.length>0&&(p.match(HAR)||[]).length>=2&&!UO.test(q.replace(/ۂ/g,''))&&!/[A-Za-z]/.test(q)};
let splitRuns=0,firstRow=0;
rows.forEach(r=>{const L=r[1].split('\n').slice(1);for(let k=0;k+1<L.length;k++)if(isA(L[k])&&isA(L[k+1])&&(NUM.test(L[k])||NUM.test(L[k+1])||/[﴿﴾]/.test(L[k]+L[k+1]))){splitRuns++;if(!firstRow)firstRow=r[0]}});
if(splitRuns)bad.push('Arabic ayah block still cut into several paragraphs: '+splitRuns+' (first row '+firstRow+')');
// the known example: Baqarah 270-271 (row 612): one Arabic paragraph, then one translation paragraph
const L=rows[611][1].split('\n');const i=L.findIndex(x=>x.startsWith('﴿وَمَاۤ اَنْفَقْتُمْ'));
if(i<0)bad.push('row 612 block missing');else{
 if(!/۰۰۲۷۱﴾$/.test(L[i])||!/۰۰۲۷۰/.test(L[i]))bad.push('row 612 block not whole');
 if(!/^اور تم کسی قسم کا خرچ/.test(L[i+1])||!/گناہ دور کر دے گا/.test(L[i+1])||!/خبر رکھتا ہے$/.test(L[i+1])||L.length!==i+2)bad.push('row 612 translation not one paragraph');}
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS tafsirnoor_blocks');process.exit(bad.length?1:0);
