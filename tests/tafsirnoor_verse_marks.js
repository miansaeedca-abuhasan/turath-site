// Tafsir Noor al-Huda: the verse number at the end of every translated verse is a small circle (⟦N⟧ in the data), codes are gone, copy gives (N)
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const fs=require('fs');
// data: markers are ascending inside one paragraph; none left glued to a raw code; Baqarah 10-12 and Araf 38-39 are exactly as printed
global.COLLS=a=>{global.A=a};eval(fs.readFileSync('coll/index.js','utf8'));
const e=A.find(x=>x.key==='tafsirnoor');let rows=[];global.COLLDATA=(k,l,r)=>rows.push(...r);for(const f of e.files.ur)eval(fs.readFileSync('coll/'+f[2],'utf8'));
let total=0,desc=0,codes=0;
rows.forEach(r=>r[1].split('\n').forEach(p=>{const m=[...p.matchAll(/⟦(\d+)⟧/g)].map(x=>+x[1]);total+=m.length;for(let i=1;i<m.length;i++)if(m[i]!==m[i-1]+1)desc++;
 if(m.length&&/[⟦]\d+⟧\s?[@#$%&*_=+<>]\s/.test(p))codes++;}));
ck(total>5000,'markers '+total);ck(desc<=20,'markers out of order in a paragraph: '+desc);ck(codes===0,'raw code next to a marker '+codes);
const t86=rows[85][1],t1983=rows[1982][1];
ck(/تھے⟦10⟧ اور جب ان سے کہا جاتا ہے/.test(t86)&&/ہیں⟦11⟧ سن لو! بے شک/.test(t86)&&/شعور نہیں رکھتے⟦12⟧/.test(t86),'Baqarah 10-12');
ck(/نہیں جانتے⟦38⟧ اور ان کی پہلی جماعت/.test(t1983)&&/کماتے رہے تھے⟦39⟧/.test(t1983),'Araf 38-39');
const it=JSON.stringify(e.intro[0][1]);ck(!/علی ال ی م|علی الہ دین|علیہم کی/.test(it)&&/علیہم السلام دین حق/.test(it)&&/صلی اللہ علیہ وسلم تشریف/.test(it),'publisher note honorifics');
ck(!/[⟦]/.test(rows.map(r=>r[1].split('\n')[0]).join('')),'no marker in a title');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});
const errs=[];p.on('pageerror',x=>errs.push(String(x)));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/tafsirnoor/n/86');await p.waitForSelector('.bkitem',{timeout:90000});await p.waitForTimeout(1500);
const d=await p.evaluate(()=>({c:document.querySelectorAll('.bkitem .ayn').length,q:[...document.querySelectorAll('.bkitem .qayah .ayn')].map(x=>x.textContent.trim()).join(','),raw:/⟦|⟧/.test(document.body.innerText),n:[...document.querySelectorAll('.bkitem p .ayn')].map(x=>x.textContent.trim()).join(','),cp:typeof CLN==='function'?CLN('کہا⟦10⟧ اور'):'no CLN'}));
ck(d.q==='10,11','verse circles inside the Arabic block (no waqf-carrier 1): '+d.q);ck(d.c>=3,'circles shown '+d.c);ck(!d.raw,'marker text visible');ck(/10/.test(d.n),'circle numbers '+d.n);ck(d.cp==='کہا (10) اور','copy text: '+d.cp);
ck(!errs.length,'js errors '+errs[0]);
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
// guard: no raw ';' honorific glyph after letters, no pictographic honorific outside Arabic blocks
{const fs=require('fs');const idx=fs.readFileSync(__dirname+'/../coll/index.js','utf8');let bad=0;
for(const f of new Set(idx.match(/tafsirnoor_ur_\d+_[0-9a-f]+\.js/g))){const t=fs.readFileSync(__dirname+'/../coll/'+f,'utf8').replace(/﴿[^﴾]*﴾/g,'');
if(/[ء-ۓ];(?=\s|\\n|")/.test(t)){console.log('FAIL raw ; in',f);bad++}
if(/[ﷺؓؑؒ]/.test(t)){console.log('FAIL symbol honorific in',f);bad++}}
if(bad)process.exit(1);console.log('ok honorific guard');}
