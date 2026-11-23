// Word index of the TRANSLATIONS: coll/ixl/<lang>/<0..511>.js = SIDXL(lang, shard, {token:"book:delta,delta;book:…"}, [book keys]).
// Same tokens as the page (norm of index.html is read from it, so both always agree), postings = row ids, base-36 deltas ('~id' for non-integer ids).
// Books: every coll book that has the language, except the ones the search leaves out on purpose (SKIP) and tafsirnoor (own search). Rebuild after any text change:
//   node tools/build_ixl.js [lang…]   then   python3 tools/ixl_offline.py   (offline.json) and bump the sw.js cache name.
const fs=require('fs');process.chdir(__dirname+'/..');
global.COLLS=a=>{global.R=a};require('vm').runInThisContext(fs.readFileSync('coll/index.js','utf8'));
const SRC=fs.readFileSync('index.html','utf8').split('\n');const k=SRC.findIndex(l=>l.startsWith("  const norm = s => (s || '').normalize('NFKD')"));
const norm=eval('('+(SRC[k]+SRC[k+1]).replace(/^\s*const norm = /,'').replace(/;\s*$/,'')+')');
const SKIP=new Set((SRC.find(l=>l.includes('const SKIP = new Set'))||'').match(/'[a-z0-9]+'/g).map(s=>s.slice(1,-1)).concat(['tafsirnoor','adabaalien']));
const fnv=w=>{let h=0x811c9dc5;for(let i=0;i<w.length;i++){h^=w.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h%512};
const LANGS=process.argv.slice(2).length?process.argv.slice(2):['ur','en','bn','hi','gu','fr'];
for(const L of LANGS){
  const books=R.filter(b=>(b.langs||[]).includes(L)&&b.files&&b.files[L]&&!SKIP.has(b.key)&&!b.ext);
  const P=new Map();   // token -> Map(bookIdx -> ids[])
  books.forEach((b,bi)=>{
    for(const f of b.files[L].map(x=>x[2].split('/').pop())){
      new Function('COLLDATA',fs.readFileSync('coll/'+f,'utf8'))((kk,ll,rows)=>{
        for(const [id,t] of rows){const seen=new Set();for(const w of norm(t).split(' ')){if(!w||seen.has(w))continue;seen.add(w);
          let m=P.get(w);if(!m)P.set(w,m=new Map());let a=m.get(bi);if(!a)m.set(bi,a=[]);a.push(id)}}
      });
    }
  });
  const sh=Array.from({length:512},()=>({}));
  for(const [w,m] of P){
    const parts=[];for(const bi of [...m.keys()].sort((a,b)=>a-b)){const ids=m.get(bi).sort((a,b)=>a-b);let prev=0;const o=[];
      for(const n of ids){if(Number.isInteger(n)){o.push((n-prev).toString(36));prev=n}else o.push('~'+n)}parts.push(bi.toString(36)+':'+o.join(','))}
    sh[fnv(w)][w]=parts.join(';');
  }
  fs.rmSync('coll/ixl/'+L,{recursive:true,force:true});fs.mkdirSync('coll/ixl/'+L,{recursive:true});
  const names=JSON.stringify(books.map(b=>b.key));let n=0;
  sh.forEach((o,i)=>{if(!Object.keys(o).length)return;fs.writeFileSync('coll/ixl/'+L+'/'+i+'.js','SIDXL('+JSON.stringify(L)+','+i+','+JSON.stringify(o)+','+names+');');n++});
  console.log(L,'books',books.length,'tokens',P.size,'shards',n);
}
