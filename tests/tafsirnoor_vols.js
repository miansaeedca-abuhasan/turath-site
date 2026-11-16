// Tafsir Noor al-Huda vols 1-4: all volumes present, sections cover every row, no «بھی» garbled for the honorific after Sahaba names, no page-header junk
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const x=fs.readFileSync('coll/index.js','utf8');const a=JSON.parse(x.slice(x.indexOf('COLLS(')+6,x.lastIndexOf(')')));const e=a.find(e=>e.key==='tafsirnoor');
let rows=[];for(const f of e.files.ur){const t=fs.readFileSync('coll/'+f[2],'utf8');rows=rows.concat(JSON.parse(t.slice(t.indexOf(',[[')+1,t.lastIndexOf(')')))).slice(0)}
ck(rows.length===e.count&&rows.length>1500,'rows '+rows.length);
ck(rows.every((r,i)=>r[0]===i+1),'row numbers continuous');
let nx=1;for(const s of e.sections){ck(s[2]===nx,'section start '+s[1]+' '+s[2]+' vs '+nx);nx=s[3]+1}ck(nx===rows.length+1,'sections cover all rows '+nx);
ck(e.sections.some(s=>/الاعراف/.test(s[1]))&&e.sections.some(s=>/النساء/.test(s[1]))&&e.sections.some(s=>/المائدہ/.test(s[1])),'surahs of vols 2-4');
const all=rows.map(r=>r[1]).join('\n');
const names='ابن عباس|ابن عمر|ابن مسعود|ابو ہریرہ|عمر بن خطاب|عائشہ|انس بن مالک|جابر بن عبد اللہ|عبد اللہ بن عمر|عبد اللہ بن مسعود|عبد اللہ بن عباس|عبداللہ بن عباس|ابو سعید خدری';
const j=all.match(new RegExp('(?:'+names+') بھی (?:اللہ|ان|انھوں|انہیں|نہیں|اہلیہ|نہ|انھیں|انہوں) ','g'))||[];
ck(j.length===0,'garbled honorific «بھی» after Sahaba '+j.length+' '+j[0]);
const h=all.match(/تف[^\s]{1,4} (?:لوالد|نو|نور)[^\n]{0,14}جلد ?\d/g)||[];ck(h.length===0,'page header junk '+h.length);
const r=all.match(/\d سورۃ [^\n:]{2,18} : \d/g)||[];ck(r.length===0,'running surah header '+r.length);
console.log(bad?'FAILED':'OK');process.exit(bad?1:0);
