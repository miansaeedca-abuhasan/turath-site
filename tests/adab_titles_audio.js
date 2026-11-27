// Owner 27-11-2026: English/Bengali Jami sub-book (adabaalien): no Urdu headings, no translator tabs on top, 🔊 button plays the audio of the hadith's own Jami number
const {chromium}=require('playwright');const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const UR=/[؀-ۿ]/;
const s=fs.readFileSync('coll/index.js','utf8'),A=JSON.parse(s.slice(s.indexOf('COLLS(')+6,s.lastIndexOf(')')));const e=A.find(x=>x.key==='adabaalien');
ck(e.secL&&e.secL.en.length===467&&e.secL.bn.length===467&&e.headsL.en.length===20&&e.headsL.bn.length===20,'secL/headsL complete');
ck(!e.secL.en.concat(e.headsL.en).some(x=>UR.test(x)),'English titles carry no Arabic/Urdu letters');
(async()=>{const b=await chromium.launch();
for(const ui of ['en','bn']){
 const p=await b.newPage({viewport:{width:400,height:900}});await p.addInitScript(u=>{localStorage.ui=u;localStorage.nosplash='1';window.__pl=[];HTMLMediaElement.prototype.play=function(){window.__pl.push(this.src);return Promise.resolve();};},ui);
 await p.goto('http://localhost:8765/index.html#/s/adabaalien?idx');await p.waitForSelector('details.grpbox',{timeout:30000});
 const l=await p.evaluate(()=>({t:[...document.querySelectorAll('details.grpbox .gt')].map(x=>x.textContent),chips:document.querySelectorAll('.lchips .chip').length,intro:document.querySelectorAll('details.intro').length}));
 ck(l.t.length>0&&l.t.every(x=>!UR.test(x)),ui+': group titles not Urdu '+l.t[0]);ck(l.chips===0,ui+': no translator chips');ck(l.intro===0,ui+': no Urdu intro boxes');
 await p.goto('http://localhost:8765/index.html#/s/adabaalien/1');await p.waitForSelector('.card .mt.ar',{timeout:30000});await p.waitForTimeout(2500);
 const h=await p.evaluate(()=>({chips:document.querySelectorAll('.lchips .chip').length,head:document.querySelector('header,.top,.bar')&&document.title,au:[...document.querySelectorAll('.acts button')].filter(x=>x.textContent==='🔊'&&!x.hidden).length}));
 ck(h.chips===0,ui+': chapter page has no translator chips');ck(h.au>=1,ui+': audio button on hadith');
 await p.evaluate(()=>[...document.querySelectorAll('.acts button')].find(x=>x.textContent==='🔊'&&!x.hidden).click());await p.waitForTimeout(1500);
 const pl=await p.evaluate(()=>window.__pl);ck(pl.some(u=>/\/13827\.mp3$/.test(u)&&u.includes('/'+ui+'/')),ui+': plays /'+ui+'/13827.mp3 '+JSON.stringify(pl));
 await p.close();}
await b.close();console.log(bad?'FAILED':'adab titles/audio OK');process.exit(bad?1:0);})();
