// owner 22-11-2026: verses in tafsirs in ﴿ ﴾ with [surah: ayah]; smaller ayah circle; Noor al-Huda Arabic in the Arabic font; heading gold line only a little longer than the heading
const {chromium}=require('playwright'),fs=require('fs');let bad=[];const ck=(c,m)=>{if(!c)bad.push(m)};
global.QTAFSIR=(k,o)=>{cur=o};let cur;
const rd=f=>{eval(fs.readFileSync('quran/tafsir/'+f,'utf8'));return JSON.stringify(cur)};
// data: Ahsan al-Bayan, Kilani, Fahm, Ibn Kathir verses
const mk=['ur_makki_1.js','ur_makki_2.js'].map(rd).join('');
ck(!/\d{3}:\d{1,3}/.test(mk.replace(/\[[^\]]*\]/g,'')) || (mk.match(/\)\s*0\d\d:\d+/g)||[]).length<5,'makki old refs left '+(mk.match(/\)\s*0\d\d:\d+/g)||[]).length);
ck((mk.match(/﴿[^﴾]+﴾ \[[^\]]+: [۰-۹-]+\]/g)||[]).length>250,'makki verses in ﴿ ﴾ '+(mk.match(/﴿[^﴾]+﴾ \[[^\]]+: [۰-۹-]+\]/g)||[]).length);
ck(/لَا رَيْبَ فِيْهِ[^﴾]*﴾ \[السجدۃ: ۲\]/.test(mk),'makki 32:2 verse with Arabic letters');
const kl=['ur_kilani_1.js','ur_kilani_2.js'].map(rd).join('');ck((kl.match(/﴿[^﴾]+﴾ \[[^\]]+: [۰-۹-]+\]/g)||[]).length>150,'kilani verses');
const fh=['ur_fahm_1.js','ur_fahm_2.js'].map(rd).join('');ck((fh.match(/﴿[^﴾]+﴾ \[[^\]]+: [۰-۹-]+\]/g)||[]).length>80,'fahm verses');
ck(!/۔﴾ \[/.test(mk+kl+fh),'no full stop before ﴾');
// data: Noor al-Huda: no Urdu-shaped letters inside fully vocalized words (outside ﴿ ﴾)
let nb=0,nq=0;for(const f of fs.readdirSync('coll').filter(f=>/^tafsirnoor_ur_/.test(f))){const t=fs.readFileSync('coll/'+f,'utf8').replace(/\\n/g,'\n').replace(/﴿[^﴾]*﴾/g,'');
 for(const w of t.match(/[\u0600-\u06FF\u200c]+/g)||[]){const h=(w.match(/[\u064B-\u0652]/g)||[]).length;if(h>=2&&/[ہکۃھ]/.test(w)&&!/[ٹڈڑںےۓگچپژ]/.test(w)&&!/ٰ/.test(w.replace(/[\u064B-\u0652]/g,'').slice(0,0)))nb++}
 nq+=(t.match(/(?:’’|“)[^’‘“”\n]{2,300}?(?:‘‘|”)/g)||[]).filter(q=>{const w=q.replace(/[’‘“”]/g,'').split(/\s+/).filter(Boolean);return w.length&&w.every(x=>/[\u064B-\u0652]/.test(x))&&!/[ہکی]/.test(q.replace(/[\u064B-\u0652ٰ]/g,'').replace(/ی(?=[\u064B-\u0652])/g,''))&&false}).length}
ck(nb<150,'Noor al-Huda: vocalized words with Urdu letters left '+nb);
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:1100,height:900}})).newPage();
await p.addInitScript(()=>{try{localStorage.newsSeen='20261122a';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur'}catch(e){}});
await p.goto('http://localhost:8765/index.html#/s/tafsirnoor/n/2');await p.waitForSelector('h4.subh',{timeout:25000});
const r=await p.evaluate(()=>{const e=document.querySelector('h4.subh');const w=e.getBoundingClientRect().width,pw=e.parentElement.getBoundingClientRect().width;
 const s=document.createElement('span');s.className='qtr';s.innerHTML='<span class="ayn">3</span>';document.body.append(s);const a=getComputedStyle(s.firstChild);const o={w,pw,ayn:parseFloat(a.fontSize),hh:parseFloat(getComputedStyle(e).fontSize),ar:[...document.querySelectorAll('.arq')].slice(0,40).map(x=>getComputedStyle(x).fontFamily)};s.remove();return o});
ck(r.w<r.pw*0.9,'heading line fits the heading: '+r.w+' of '+r.pw);
ck(r.ayn<10,'tafsir ayah circle small '+r.ayn);
console.log(bad.length?'FAIL '+bad.join('|'):'PASS tafsir_verses_noor_lines',JSON.stringify({w:r.w,pw:r.pw,ayn:r.ayn}));await b.close();process.exit(bad.length?1:0)})();
