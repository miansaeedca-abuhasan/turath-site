// «موضوعات»: list of topics, a topic page with verses, Jami chapters and (last) the da'if / mawdu' hadith marked as such
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad=1;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch(),p=await(await b.newContext({viewport:{width:420,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.newsSeen='20261122a';localStorage.newsDay=new Date().toDateString();localStorage.lang='ur';localStorage.ui='ur'}catch(e){}});
await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(3000);
ck(await p.evaluate(()=>[...document.querySelectorAll('.tile')].some(t=>t.getAttribute('href')==='#/tp')),'home tile «موضوعات»');
await p.goto('http://localhost:8765/index.html#/tp');await p.waitForSelector('a[href="#/tp/salah"]',{timeout:20000});
const names=await p.evaluate(()=>[...document.querySelectorAll('a[href^="#/tp/"] .ct')].map(x=>x.textContent));
ck(['نماز','حج و عمرہ','زکوٰۃ','روزہ','جہاد','انفاق فی سبیل اللہ','حیض','پردہ اور حیا'].every(n=>names.includes(n)),'topics listed: '+names.join('|'));
await p.goto('http://localhost:8765/index.html#/tp/jihad');await p.waitForSelector('.tpay',{timeout:20000});
const r=await p.evaluate(()=>{const secs=[...document.querySelectorAll('details.tpsec')];return{n:secs.length,order:secs.map(s=>s.querySelector('.gt').textContent),ay:document.querySelectorAll('.tpay').length,ar:document.querySelector('.tpar').textContent,ur:document.querySelector('.tpur')&&document.querySelector('.tpur').textContent.length,ref:document.querySelector('.tpref').textContent,kit:document.querySelectorAll('details.tpk').length}});
ck(r.n===3&&r.order[0]==='آیات'&&r.order[1].startsWith('احادیث')&&r.order[2]==='ضعیف اور من گھڑت احادیث','order verses → hadith → weak: '+r.order);
ck(r.ay>10&&/^﴿/.test(r.ar)&&/﴾$/.test(r.ar)&&r.ur>20,'verses with ornate brackets and Urdu');ck(/^\[.+: .+\]$/.test(r.ref),'reference '+r.ref);
// a chapter opens the hadith in al-Jami al-Kamil
await p.click('details.tpsec:nth-of-type(2) details.tpk > summary');await p.waitForSelector('a.tpbab',{timeout:5000});
const href=await p.getAttribute('a.tpbab','href');ck(/^#\/h\/\d+$/.test(href),'chapter link '+href);
await p.click('a.tpbab');await p.waitForTimeout(3500);ck(await p.evaluate(()=>/^#\/(h|c)\/\d+/.test(location.hash)&&localStorage.book==='jamik'),'opens in Jami al-Kamil');
// weak section
await p.goto('http://localhost:8765/index.html#/tp/siyam');await p.waitForSelector('details.tpweak',{timeout:20000});
await p.click('details.tpweak > summary');ck(await p.evaluate(()=>document.querySelector('.tpwarn').textContent.includes('ضعیف یا من گھڑت')),'warning shown');
await p.click('details.tpweak details.tpk > summary');await p.waitForSelector('.tpw',{timeout:15000});
const w=await p.evaluate(()=>({n:document.querySelectorAll('.tpw').length,g:[...document.querySelectorAll('.tpw .gc')].map(x=>x.className+':'+x.textContent).slice(0,3),more:!!document.querySelector('.tpmore')}));
ck(w.n>0&&w.g.every(x=>/gc-(daif|mawdu)/.test(x)),'weak hadith carry their ruling '+w.g);
ck(!errs.length,'page errors '+errs);console.log(bad?'FAIL':'PASS topics_folder');await b.close();process.exit(bad)})();
