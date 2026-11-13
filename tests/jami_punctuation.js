// Jami al-Kamil hadith text keeps the punctuation of the author's Word files (، ؛ : . ؟ !), ends with a full stop, and has no double brackets
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage();let bad=[];
await p.goto('http://localhost:8765/#/h/13827');await p.waitForTimeout(6000);
const r=await p.evaluate(()=>{const H=window.TURATH_DATA.hadith,D=x=>x.replace(/[\u064B-\u0652\u0670\ue000-\uf8ff]/g,''),g=n=>D((H.find(h=>h.num===n)||{matn:['']}).matn.join(' '));
 let dbl=0,nodot=0;H.forEach(h=>{const m=h.matn.join(' ');if(/\(\(|\)\)/.test(m))dbl++;const l=(h.matn[h.matn.length-1]||'').replace(/[-\s]+$/,'');if(l&&!/[.؟!﴾»"”)]$/.test(l))nodot++;});
 return {a:g(10772),b:g(15483),dbl,nodot,n:H.length}});
if(!/\u0642\u0627\u0644:\s*\u0642\u0627\u0644\s/.test(r.a))bad.push('10772 colon after the first qala '+r.a.slice(0,80));
if(!/المسجد، فقال: يا رسول الله،/.test(r.b))bad.push('15483 commas/colon '+r.b.slice(0,120));
if(r.dbl)bad.push('double brackets '+r.dbl);if(r.nodot>60)bad.push('hadith not ending with a full stop '+r.nodot);
console.log(bad.length?'FAIL '+bad.join('; '):'PASS jami_punctuation');await b.close();process.exit(bad.length?1:0)})();
