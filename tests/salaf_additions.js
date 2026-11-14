// Salaf (siyar) additions: data integrity + the new section opens with Arabic, Urdu and a linked, page-labelled source
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const fs=require('fs');const S=fs.readFileSync('coll/index.js','utf8'),L=JSON.parse(S.slice(S.indexOf('(')+1,S.lastIndexOf(')')));
const e=L.find(x=>x.key==='siyar');
const rd=(lg)=>{let o=[];for(const f of e.files[lg]){const t=fs.readFileSync('coll/'+f[2],'utf8');o=o.concat(JSON.parse(t.slice(t.indexOf('",[')+2,t.lastIndexOf(')'))))}return o};
const ar=rd('ar'),ur=rd('ur');
ck(ar.length===e.count&&ur.length===e.count,'ar/ur row counts equal count '+ar.length+'/'+ur.length+'/'+e.count);
ck(ar.every((r,i)=>r[0]===i+1)&&ur.every((r,i)=>r[0]===i+1),'rows contiguous');
ck(e.kind.length===e.count,'kind string covers every row');
// every appended row (2175..count) belongs to exactly one person's section (a detailed text may take over an old section, then that section points to the appended rows)
{const cnt=new Array(e.count+2).fill(0);for(const x of e.sections)if(!(x[5]&&x[5].src))for(let n=x[2];n<=x[3];n++)cnt[n]++;let okT=true;for(let n=2175;n<=e.count;n++)if(cnt[n]!==1)okT=false;ck(okT,'new rows each belong to exactly one section');
 ck(e.sections.every(x=>x[3]>=x[2])&&new Set(e.sections.map(x=>x[0])).size===e.sections.length,'section ranges sane, ids unique');
 const hid=[];for(let n=1;n<=2174;n++)if(!cnt[n])hid.push(n);ck(hid.length>=8&&hid.length<40&&hid.includes(139)&&hid.includes(146),'only a few old short rows are taken over: '+hid.length);}
const nw=ar.slice(2174);
ck(nw.length>0&&nw.every(r=>/^مصدر: سیر اعلام النبلاء \(\d+\/\d+/.test(r[2])&&r[3]&&r[3][0]==='sh10906'),'every new row has a volume/page label and a source link');
ck(ur.slice(2174).every(r=>r[1].length>40&&!/[A-Za-z]{3}/.test(r[1])&&!/[٠-٩]/.test(r[1])),'new Urdu rows are real Urdu with English digits');
ck(e.heads.every((h,i)=>!i||h[0]>e.heads[i-1][0]),'heads ascending');
// the old part is untouched
ck(ar[2173][0]===2174&&ur[0][1].startsWith('سیدنا مصعب'),'base rows unchanged');
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:430,height:900}});
await pg.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
const last=54;
await pg.goto('http://localhost:8765/index.html#/s/siyar/'+last);await pg.waitForSelector('.card .mt.ar',{timeout:30000});
const t=await pg.evaluate(()=>document.body.innerText);
ck(/ابو مسلم خولانی|أبو مسلم الخولاني/.test(t),'new person shows');ck(/سیر اعلام النبلاء \(\d+\//.test(t),'page label shows');
ck(await pg.evaluate(()=>document.querySelectorAll('.card .mt.ar').length)>=5,'paragraphs listed');
await br.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
