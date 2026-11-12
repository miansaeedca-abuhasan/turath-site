// Guard: the teachers listed for a Companion in the Narrators Encyclopedia are Companions only (no Tabi'i)
const {chromium}=require('playwright');let bad=[];const ck=(c,m)=>{if(!c)bad.push(m)};
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>bad.push(e.message));
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=new Date().toDateString()});
for(const [id,n] of [[720,0],[2582,3]]){await p.goto('http://localhost:8765/#/n/'+id);await p.waitForSelector('.nhead',{timeout:20000});await p.waitForTimeout(800);
 const sah=await p.evaluate(()=>/صحابي|صحابية/.test(document.querySelector('.nhead').innerText));ck(sah,id+' is a companion');
 await p.evaluate(()=>[...document.querySelectorAll('.nbar,.ntabs button')].find(x=>/اساتذہ/.test(x.textContent)).click());await p.waitForTimeout(600);
 const rows=await p.evaluate(()=>[...document.querySelectorAll('.nlist > *')].filter(x=>x.offsetParent).map(x=>x.innerText));
 ck(n?rows.length===n:rows.length>=30,id+' teachers: '+rows.length+' expected '+n);const hd=await p.evaluate(()=>[...document.querySelectorAll('.ntabs button')].find(x=>/اساتذہ/.test(x.textContent)).textContent);ck(new RegExp('\\('+'\\d+'+'\\)').test(hd),'count shown');ck(rows.every(t=>/صحابي|صحابية/.test(t)),id+': a non-companion among the teachers: '+rows.filter(t=>!/صحابي|صحابية/.test(t)).map(t=>t.split('\n')[0]).join(' ; '));}
console.log(bad.length?'FAIL '+bad.join('|'):'PASS');await b.close()})()
