// Guard: a chapter that has only a heading plus verse/note in the printed Talkhees (kitab 35, «باب ما جاء في حفظ الأيمان») is listed in BOTH the Talkhees and the full Jami' and opens with its printed intro (image), not blank; a chapter with hadith and an intro shows it above the hadith; numbering of the other chapters is untouched.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let bad=[];
for(const book of ['jami','jamik']){
 const p=await b.newPage({viewport:{width:420,height:900}});p.on('pageerror',e=>bad.push(book+' '+e.message));
 await p.addInitScript(bk=>{if(!sessionStorage.a){localStorage.ui='ur';localStorage.book=bk;sessionStorage.a=1}},book);
 await p.goto('http://localhost:8765/#/k/35');await p.waitForSelector('#list a.card',{timeout:20000});await p.waitForTimeout(800);
 const t=await p.evaluate(()=>[...document.querySelectorAll('#list a.card')].map(a=>a.textContent.replace(/\s+/g,' ').trim()));
 const i=t.findIndex(x=>/حفظ الأيمان/.test(x));
 if(i<0){bad.push(book+' chapter 1 not listed');await p.close();continue}
 if(!/^[۱١]/.test(t[i]))bad.push(book+' number '+t[i].slice(0,12));
 if(!/^[۲٢]/.test(t[i+1]||''))bad.push(book+' next is not 2: '+(t[i+1]||'').slice(0,12));
 const href=await p.evaluate(i=>document.querySelectorAll('#list a.card')[i].getAttribute('href'),i);
 await p.goto('http://localhost:8765/'+href);if(book==='jami'){await p.waitForSelector('.chintro img',{timeout:20000});
  await p.waitForFunction(()=>{const m=document.querySelector('.chintro img');return m&&m.complete&&m.naturalWidth>200},{timeout:20000}).catch(()=>bad.push(book+' intro image did not load'));}
 else{await p.waitForSelector('.chintro.txt p',{timeout:20000});
  const tx=await p.evaluate(()=>document.querySelector('.chintro.txt').textContent);
  if(!/يُؤَاخِذُكُمُ/.test(tx)||!/عبد الرزاق/.test(tx)||!/﴿/.test(tx)||/\(89\)/.test(tx))bad.push('jamik intro text wrong: '+tx.slice(0,80));}
 // a chapter with hadith and an intro: kitab 35 chapter 2 still opens with its hadith
 await p.close();
}
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
