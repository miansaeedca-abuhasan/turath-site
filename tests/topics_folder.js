// «موضوعات»: topics list, a topic page with verses (+translation/tafsir buttons), numbered Jami hadith with takhrij line, then da'if, and mawdu' LAST with the "lie" warning
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad=1;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:420,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.newsSeen='20261122a';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur';localStorage.removeItem('turath_tp_sel')}catch(e){}});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(3000);
ck(await p.evaluate(()=>[...document.querySelectorAll('.tile')].some(t=>t.getAttribute('href')==='#/tp')),'home tile «موضوعات»');
await p.goto('http://localhost:8765/index.html#/tp');await p.waitForSelector('a[href="#/tp/salah"]',{timeout:20000});
const names=await p.evaluate(()=>[...document.querySelectorAll('a[href^="#/tp/"] .ct')].map(x=>x.textContent));
const need=['نماز','وضو','غسل','تیمم','حج و عمرہ','زکوٰۃ','روزہ','جہاد','حیض','پردہ اور حیا','دوستی اور دشمنی','والدین','اولاد','طلب علم','حب دنیا','فکرِ آخرت','جنت الفردوس','فتنے','قیامت کی نشانیاں'];
ck(need.every(n=>names.some(x=>x.includes(n))),'topics listed, missing: '+need.filter(n=>!names.some(x=>x.includes(n))).join('|'));
ck(!names.includes('طہارت'),'طہارت is split (no single folder)');
ck(names.length>=45,'many topics '+names.length);
// a topic page
await p.goto('http://localhost:8765/index.html#/tp/jihad');await p.waitForSelector('.tpay',{timeout:20000});
const r=await p.evaluate(()=>{const secs=[...document.querySelectorAll('details.tpsec')];return{order:secs.map(s=>s.querySelector('.gt').textContent),ay:document.querySelectorAll('.tpay').length,ar:document.querySelector('.tpar').textContent,tr:document.querySelectorAll('.tptr').length,btn:document.querySelectorAll('.tpbtns .tpb').length}});
ck(r.order.length===4&&r.order[0]==='آیات'&&r.order[1].startsWith('احادیث')&&r.order[2]==='ضعیف احادیث'&&r.order[3].startsWith('من گھڑت')&&/جھوٹ/.test(r.order[3]),'order verses → hadith → da\'if → mawdu\' last: '+r.order);
ck(r.ay>10&&/^﴿/.test(r.ar)&&/﴾$/.test(r.ar)&&r.tr>10&&r.btn>=20,'verses with ornate brackets, default Urdu translation and buttons');
// translation picker: add an English translation
await p.click('.tpay .tpbtns .tpb');await p.waitForSelector('.tppanel .tpchip',{timeout:8000});
await p.evaluate(()=>{[...document.querySelectorAll('.tppanel .tpchip')].find(c=>/Saheeh/.test(c.textContent)).click()});
await p.waitForFunction(()=>[...document.querySelectorAll('.tpay')[0].querySelectorAll('.tpen')].some(x=>/Saheeh/.test(x.textContent)),null,{timeout:15000});
ck(true,'second translation shown');
// tafsir picker
await p.evaluate(()=>document.querySelectorAll('.tpay')[0].querySelectorAll('.tpbtns .tpb')[1].click());await p.waitForTimeout(800);
await p.evaluate(()=>{const c=[...document.querySelectorAll('.tpay')[0].querySelectorAll('.tppanel .tpchip')].find(c=>/ابنِ کثیر|ابن کثیر/.test(c.textContent)&&/اردو/.test(c.textContent));c&&c.click()});
await p.waitForFunction(()=>document.querySelectorAll('.tpay')[0].querySelectorAll('.tptf .tptx').length>0,null,{timeout:20000});
ck(true,'tafsir text shown');
// hadith: kitab → bab → numbered hadith + takhrij line
await p.click('details.tpsec:nth-of-type(2) details.tpk > summary');await p.waitForSelector('details.tpbabd',{timeout:5000});
await p.click('details.tpbabd > summary');await p.waitForSelector('.tphd',{timeout:15000});
const h=await p.evaluate(()=>{const c=document.querySelector('.tphd');return{n:c.querySelector('.tpn').textContent,tk:c.querySelector('.tptk').textContent,a:c.querySelector('.tptk a').getAttribute('href'),g:c.querySelector('.tptk .gc').className}});
ck(/^\d+ - $/.test(h.n),'number '+h.n);ck(/^(صحیح|حسن|متفق علیہ|صحیح لغیرہ|.+): الجامع الکامل \(\d+\)$/.test(h.tk)&&/^#\/h\/\d+$/.test(h.a),'takhrij line '+h.tk);
// weak
await p.goto('http://localhost:8765/index.html#/tp/siyam');await p.waitForSelector('details.tpweak',{timeout:20000});
await p.click('details.tpweak:not(.tpmawdu) > summary');ck(await p.evaluate(()=>document.querySelector('.tpwarn').textContent.includes('ضعیف')),'da\'if warning');
await p.click('details.tpweak:not(.tpmawdu) details.tpk > summary');await p.waitForSelector('.tpw',{timeout:15000});
const w=await p.evaluate(()=>({n:document.querySelectorAll('.tpw').length,g:[...document.querySelectorAll('.tpw .gc')].map(x=>x.className).slice(0,3)}));
ck(w.n>0&&w.g.every(x=>/gc-daif|gc-mawdu/.test(x)),'weak hadith carry their ruling');
// mawdu' on a topic that has some, with the lie warning
await p.goto('http://localhost:8765/index.html#/tp/fitan');await p.waitForSelector('details.tpmawdu',{timeout:20000});
await p.click('details.tpmawdu > summary');ck(await p.evaluate(()=>/جھوٹ/.test(document.querySelector('.tpwarn-lie').textContent)&&/قابل اعتماد نہیں/.test(document.querySelector('.tpwarn-lie').textContent)),'mawdu\' warning says lie');
ck(await p.evaluate(()=>{const s=[...document.querySelectorAll('details.tpsec')];return s[s.length-1].classList.contains('tpmawdu')}),'mawdu\' is the last section');
ck(!errs.length,'page errors '+errs);console.log(bad?'FAIL':'PASS topics_folder');await b.close();process.exit(bad)})();
