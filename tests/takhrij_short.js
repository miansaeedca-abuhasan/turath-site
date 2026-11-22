// owner 22-11-2026: translated books (not the complete Al-Jami al-Kamil): takhrij as «book (number)», no kitab/bab where a hadith number exists
const fs=require('fs');process.chdir(__dirname+'/..');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const SKIP=/^(silsila|bulughsaada)$/;let long=0,short=0;
global.window={};global.COLLDATA=(k,l,rows)=>{if(SKIP.test(k))return;for(const r of rows){const m=r[3]&&r[3].k;if(!m)continue;
 for(const line of m.split('\n')){const t=line.replace(/^\(\d+\)\s*/,'');
  if(/(?:صحیح\s+)?(?:البخاری|بخاری|مسلم|ترمذی|نسائی|ابن ماجہ|ابوداود|ابو داود|ابی داود)\s*[،:]\s*[^0-9۔\n]{0,120}?(?:کتاب|باب)[^0-9۔\n]{0,160}(?:حدیث|رقم|ح)\s*[:：]\s*\d+(?!\d*\s*[/؍])/.test(t))long++;
  if(/(?:صحیح\s+)?(?:البخاری|بخاری|مسلم)[^،()\n]{0,3},/.test(t))short++}}};
for(const f of fs.readdirSync('coll').filter(x=>/_ur_\d+_/.test(x)))eval(fs.readFileSync('coll/'+f,'utf8'));
ck(long<=10,'long «کتاب … باب … حدیث: N» references left '+long);
const mw=[];global.COLLDATA=(k,l,rows)=>{if(k==='muwattaansar')for(const r of rows)if(r[0]===3)mw.push(r)};
for(const f of fs.readdirSync('coll').filter(x=>/^muwattaansar_ur_\d+_/.test(x)))eval(fs.readFileSync('coll/'+f,'utf8'));
ck(mw.length&&/صحیح البخاری \(\d+/.test(mw[0][3].k)&&!/کتاب مواقیت/.test(mw[0][3].k),'Muwatta 3 takhrij short: '+(mw[0]&&mw[0][3].k.slice(0,120)));
console.log(bad?'FAIL takhrij_short':'PASS takhrij_short (long left '+long+')');process.exit(bad?1:0);
