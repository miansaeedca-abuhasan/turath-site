// owner 27-11-2026: Quran Encyclopedia (Urdu + English): verse = card in verse colour, verse numbers = small circles,
// translation after it, reference «[Surah: n]» at the END; English references no longer «(Quran, Surah-2, …)»
const {chromium}=require('playwright'),fs=require('fs'),glob=fs.readdirSync('coll').filter(f=>/^qencen_en_/.test(f));
let bad=0;const ok=(c,m)=>{console.log((c?'ok  ':'FAIL')+' '+m);if(!c)bad++};
(async()=>{
 const all=glob.map(f=>fs.readFileSync('coll/'+f,'utf8')).join('');
 ok(!/\(\s*Quran\s*,/.test(all),'English data has no «(Quran, Surah-…)» references');
 ok((all.match(/\[[A-Za-z][^\]\\]{1,40}: \d[^\]]*\]/g)||[]).length>1300,'English references are «[Name: n]»');
 ok(/\[Al-Baqara: 1-4\]/.test(all),'«Verses-1-4» → [Al-Baqara: 1-4]');
 const b=await chromium.launch();
 async function open(ui,route){const p=await b.newPage({viewport:{width:900,height:900}});await p.addInitScript(u=>{localStorage.ui=u;localStorage.nosplash='1'},ui);await p.goto('http://localhost:8765/index.html'+route);await p.waitForTimeout(5000);return p;}
 let p=await open('en','#/s/qencen/2');
 let r=await p.evaluate(()=>{const a=[...document.querySelectorAll('.qe-ayah')];const m=a.find(x=>x.querySelectorAll('.ayn').length>=2);const refs=[...document.querySelectorAll('.qe-ref')].map(x=>x.textContent).filter(x=>/^[\[(]Quran|^\[/.test(x));
  return {n:a.length,withQ:a.filter(x=>x.querySelector('.qayah')).length,circ:m?m.querySelectorAll('.ayn').length:0,rawNum:a.some(x=>/[٠-٩]/.test(x.textContent)),refs:refs.slice(0,3),oldRef:refs.some(x=>/^\(Quran/.test(x)),maroon:m?getComputedStyle(m.querySelector('.qayah')).color:''}});
 ok(r.withQ>25,'English: Quran verse cards carry the verse colour span ('+r.withQ+')');
 ok(r.circ>=2&&!r.rawNum,'English: verse numbers are circles, no raw Arabic-Indic digits ('+r.circ+')');
 ok(r.refs.length>=1&&r.refs.every(x=>/^\[.+: .+\]/.test(x))&&!r.oldRef,'English: references «[Surah: n]» '+r.refs[0]);
 await p.close();
 p=await open('ur','#/s/qenc/2');
 r=await p.evaluate(()=>{const a=[...document.querySelectorAll('.qe-ayah')];const t=a.map(x=>{const n=x.nextElementSibling;return n&&n.classList.contains('qe-tr')});const order=a.filter(x=>x.nextElementSibling&&x.nextElementSibling.classList.contains('qe-tr')&&x.nextElementSibling.nextElementSibling&&x.nextElementSibling.nextElementSibling.classList.contains('qe-ref')).length;
  return {n:a.length,tr:t.filter(Boolean).length,order,refs:[...document.querySelectorAll('.qe-ref')].length,inl:[...document.querySelectorAll('.qe-p')].filter(x=>/﴿/.test(x.textContent)).length}});
 ok(r.n>40,'Urdu: verse cards ('+r.n+')');
 ok(r.tr>r.n*0.8&&r.order>r.n*0.7,'Urdu: verse → translation → reference ('+r.order+'/'+r.n+')');
 ok(r.inl===0,'Urdu: no verse left inside a running paragraph');
 await b.close();process.exit(bad?1:0)})();
