// Hifz «تکرار» on a phone: no sideways overflow, translation tap works, playing hides the settings, the word being recited is lit, ✕ brings the settings back
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:360,height:740},hasTouch:true,isMobile:true,deviceScaleFactor:2});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.addInitScript(()=>{localStorage.ui='en';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/index.html#/hifz/rep?s=11&f=78&t=80');await p.waitForSelector('.hzayah .hzay',{timeout:40000});
ck(await p.evaluate(()=>document.documentElement.scrollWidth)<=360,'no sideways overflow');
await p.tap('.hzfield .segb:nth-child(2)');await p.waitForTimeout(3000);
await p.evaluate(()=>{window.Audio=function(u){const t0=Date.now();const self=this;this.duration=6;Object.defineProperty(this,'currentTime',{get(){return Math.min(6,(Date.now()-t0)/1000)}});this.play=()=>{setTimeout(()=>self.onended&&self.onended(),6000);return Promise.resolve()};this.pause=()=>{};this.ended=false}});
await p.tap('.hzplay');await p.waitForTimeout(2500);
const st=await p.evaluate(()=>({form:document.querySelector('.hzform').hidden,cur:document.querySelectorAll('.hzcur').length,tr:document.querySelector('.hzTr').textContent.length}));ck(st.form&&st.cur===1&&st.tr>20,'stage view '+JSON.stringify(st));
await p.screenshot({path:'/tmp/rep_play2.png'});
await p.tap('.hzx');await p.waitForTimeout(500);ck(!(await p.evaluate(()=>document.querySelector('.hzform').hidden)),'settings back after ✕');
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})()
