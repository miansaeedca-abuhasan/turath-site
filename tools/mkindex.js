// Prebuilt word index of the Jami text, in 256 buckets (data/ix/<family>/<bucket>.bin) so a search loads only the few kilobytes of the words typed.
// Same normalisation as the engine in index.html (a test compares both). Families: jami (Arabic/English text), tuhfa, bn (Bengali layer).
// Bucket file: u32 header length, JSON header {t:[tokens], c:[posting counts], o:[byte offsets]}, then varint postings:
//   per token, per hadith (ascending): delta of (num+2), number of fields, then (field index, count) pairs.
global.window=global;const fs=require('fs'),crypto=require('crypto');process.chdir(__dirname+'/..');
for(let i=1;i<=10;i++)eval(fs.readFileSync('data/d'+i+'.js','utf8'));
const D=TURATH_DATA;
const STRIP=/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const FOLD={'أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ی','ي':'ی','ې':'ی','ے':'ی','ئ':'ی','ك':'ک','ه':'ہ','ھ':'ہ','ة':'ہ','ۃ':'ہ','ۀ':'ہ','ؤ':'و','ں':'ن','ء':' '};
const DIG={};'٠١٢٣٤٥٦٧٨٩'.split('').forEach((c,i)=>DIG[c]=i);'۰۱۲۳۴۵۶۷۸۹'.split('').forEach((c,i)=>DIG[c]=i);
const norm=s=>(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(STRIP,'').replace(/[٠-٩۰-۹]/g,c=>DIG[c]).replace(/[أإآٱىيېےئكهھةۃۀؤںء]/g,c=>FOLD[c]).toLowerCase().replace(/[ʾʿʻʼ’‘']/g,'').replace(/[^\p{L}\p{M}\p{N}\s]|_/gu,' ').replace(/\s+/g,' ').trim();
const stem=t=>{for(const p of ['وال','بال','لل','ال'])if(t.startsWith(p)&&t.length-p.length>=2)return t.slice(p.length);return t};
const toks=s=>norm(s).split(' ').filter(Boolean).map(stem);
const NB=256,bucket=t=>{let h=0;for(const c of [...t].slice(0,2).join(''))h=(h*31+c.charCodeAt(0))>>>0;return h%NB};
const FIELDS=['sanad','matn','takhrij','chapter','translation','sharh','alfaz','buhuth','duroos','extra','intro','intro_kitab','intro_majmu'];
const base=(h)=>{const a=[];if(h.sanad)a.push(['sanad',h.sanad]);h.matn.forEach(t=>a.push(['matn',t]));(h.takhrij||'').split('\n').filter(Boolean).forEach(t=>a.push(['takhrij',t]));
 for(const k of ['chapter_ar','chapter_ur','chapter_en'])if(h[k])a.push(['chapter',h[k]]);if(h.takhrij_en)a.push(['takhrij',h.takhrij_en]);
 for(const k of ['group_ar','group_en'])if(h[k])a.push(['chapter',h[k]]);return a};
const contentTexts=c=>{const a=[];for(const k in c)for(const l in c[k])c[k][l].forEach(t=>a.push([k,t]));return a};
const fam={};
const hasLayer=h=>Object.keys(h.tuhfa||{}).length>0,hasJami=h=>h.demo||Object.keys(h.content||{}).length>0;
fam.jami=D.hadith.filter(hasJami).map(h=>[h.num,base(h).concat(contentTexts(h.content))]);
fam.tuhfa=D.hadith.filter(hasLayer).map(h=>[h.num,base(h).concat(contentTexts(h.tuhfa))]);
for(const l of D.langs){const L={};global.TURATH_LANG=(x,o)=>{if(x===l)Object.assign(L,o)};for(const f of D.langfiles[l])eval(fs.readFileSync(f.replace(/\?.*/,''),'utf8'));
 fam[l]=Object.keys(L).map(n=>[+n,Object.entries(L[n].c||{}).flatMap(([k,a])=>a.map(t=>[k,t]))]).filter(x=>x[1].length)}
const vw=(a,n)=>{while(n>=128){a.push(n&127|128);n=Math.floor(n/128)}a.push(n)};
const man={fields:FIELDS,nb:NB,N:{},h:{}};
fs.rmSync('data/ix',{recursive:true,force:true});
for(const f in fam){fs.mkdirSync('data/ix/'+f,{recursive:true});man.N[f]=fam[f].length;
 const idx=new Map();for(const [id,texts] of fam[f])for(const [fl,t] of texts){const fi=FIELDS.indexOf(fl);if(fi<0)throw new Error('field '+fl);for(const k of toks(t)){let m=idx.get(k);if(!m)idx.set(k,m=new Map());let o=m.get(id);if(!o)m.set(id,o={});o[fi]=(o[fi]||0)+1}}
 const bk=Array.from({length:NB},()=>[]);for(const k of idx.keys())bk[bucket(k)].push(k);man.h[f]=[];
 bk.forEach((keys,b)=>{keys.sort();const bytes=[],hd={t:keys,c:[],o:[]};
  for(const k of keys){const m=idx.get(k);hd.o.push(bytes.length);hd.c.push(m.size);let prev=0;for(const id of [...m.keys()].sort((a,b)=>a-b)){const o=m.get(id),e=Object.keys(o);vw(bytes,id+2-prev);prev=id+2;vw(bytes,e.length);for(const x of e){vw(bytes,+x);vw(bytes,o[x])}}}
  const hj=Buffer.from(JSON.stringify(hd)),len=Buffer.alloc(4);len.writeUInt32LE(hj.length);const buf=Buffer.concat([len,hj,Buffer.from(bytes)]);
  fs.writeFileSync('data/ix/'+f+'/'+b+'.bin',buf);man.h[f].push(crypto.createHash('md5').update(buf).digest('hex').slice(0,8))});
 console.log(f,'items',fam[f].length,'tokens',idx.size)}
fs.writeFileSync('data/ix/m.js','window.TURATH_IXM='+JSON.stringify(man)+';');
let tot=0;for(const f of fs.readdirSync('data/ix'))if(f!=='m.js')for(const x of fs.readdirSync('data/ix/'+f))tot+=fs.statSync('data/ix/'+f+'/'+x).size;
console.log('index',Math.round(tot/1e6*10)/10,'MB');
