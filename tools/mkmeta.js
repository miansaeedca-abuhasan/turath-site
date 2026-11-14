// data/meta.js = everything in data/d1..d10 EXCEPT the 36 MB of hadith text, so the app can start without them.
// Run through tools/rehash.py after any change to data/d*.js.
global.window=global;const fs=require('fs');process.chdir(__dirname+'/..');
for(let i=1;i<=10;i++)eval(fs.readFileSync('data/d'+i+'.js','utf8'));
const D=TURATH_DATA,M={};for(const k of Object.keys(D))if(k!=='hadith')M[k]=D[k];
const refs={};D.hadith.forEach(h=>{if(h.refs&&h.refs.length)refs[h.num]=h.refs});
const LANGN={bn:['تلخیص الجامع الکامل — বাংলা','Talkhis Al-Jame Al-Kamil — বাংলা']};
const FULLB={key:'jamik',name:'الجامع الكامل في الحديث الصحيح الشامل',name_en:'Al-Jame Al-Kamil (full, Arabic)',kind:'full'};
const VIRT=(D.langs||[]).map(l=>{if(!LANGN[l])throw new Error('add the name of language '+l+' to tools/mkmeta.js');return{key:'jami_'+l,name:LANGN[l][0],name_en:LANGN[l][1],kind:'lang',lang:l}});
M.booksList=D.books.slice(0,1).concat([FULLB],VIRT,D.books.slice(1));
fs.writeFileSync('data/meta.js','window.TURATH_META='+JSON.stringify(M)+';window.TURATH_REFS='+JSON.stringify(refs)+';');
console.log('meta.js',Math.round(fs.statSync('data/meta.js').size/1e3)+' KB');
