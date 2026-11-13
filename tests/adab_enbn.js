// Guard: separate book «Al-Adab al-Ali (English and Bengali)»: same 1275 rows / Arabic, 1236 English + Bengali translations, translator name, takhrij; Adab publisher's note updated
const {chromium}=require('playwright');let bad=[];const fs=require('fs');
(async()=>{const I=fs.readFileSync(__dirname+'/../coll/index.js','utf8');const L=JSON.parse(I.slice(I.indexOf('(')+1,I.lastIndexOf(')')));
 const a=L.find(x=>x.key==='adabaali'),n=L.find(x=>x.key==='adabaalien');
 if(!n)return console.log('FAIL no book');
 if(n.count!==a.count||n.langs.join()!=='ar,en,bn')bad.push('index shape');
 if(!/سدمان ظریف طلحہ/.test(n.trn.ur))bad.push('translator');
 if(!/1236 احادیث/.test(a.intro[0][1].join(' ')))bad.push('publisher note not updated');
 const rd=(l)=>{const t=fs.readFileSync(__dirname+'/../coll/'+n.files[l][0][2],'utf8');return JSON.parse(t.slice(t.indexOf('[['),t.lastIndexOf(']')+1))};
 const ar=rd('ar'),en=rd('en'),bn=rd('bn');
 if(en.length!==1236||bn.length!==1236)bad.push('counts '+en.length+'/'+bn.length);
 const r1=en.find(r=>r[0]===1);if(!/perfect noble character/.test(r1[1])||!/হুরাইরাহ/.test(bn.find(r=>r[0]===1)[1]))bad.push('row1 translations');
 if(!r1[2]||!/رواه أحمد/.test(r1[2]))bad.push('takhrij on row1');
 const N=JSON.parse(fs.readFileSync(__dirname+'/../news.json','utf8'));if(!N.some(x=>x.keys.includes('adabaalien')&&x.l[0]==='#/s/adabaalien'))bad.push('news');
 const b=await chromium.launch(),p=await b.newPage({viewport:{width:420,height:900}});p.on('pageerror',e=>bad.push('pageerror '+e.message));
 await p.addInitScript(()=>{localStorage.ui='en';localStorage.newsDay=String(new Date().toDateString())});
 await p.goto('http://localhost:8765/#/s/adabaalien/n/1');await p.waitForSelector('.card .mt.ar',{timeout:30000});await p.waitForTimeout(3000);
 const t=await p.evaluate(()=>document.body.innerText);if(!/perfect noble character/.test(t)||!/Sadman Zarif Talha/.test(t))bad.push('page: '+t.slice(0,300).replace(/\n/g,' '));
 console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');await b.close();process.exit(bad.length?1:0)})();
