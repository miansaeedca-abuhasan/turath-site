// narrators of Jami (#/jr/1), English UI on a 360px phone: tabs never overlap/clip, Arabic honorifics use the Arabic font in their own span (owner 25-11-2026)
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();for(const w of [320,360,412,900]){const p=await b.newPage({viewport:{width:w,height:700}});
await p.addInitScript(()=>{localStorage.ui='en';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/jr/1');await p.waitForSelector('.jr .tabs button',{timeout:20000});
const r=await p.evaluate(()=>{const bt=[...document.querySelectorAll('.jr .tabs button')];return {over:bt.filter(x=>x.scrollWidth>x.clientWidth+1||x.scrollHeight>x.clientHeight+1).length,midword:bt.map(x=>x.innerText).filter(t=>/\b\w+-?$/.test('')&&0).length,rects:bt.map(x=>x.getBoundingClientRect()).map(a=>[a.left,a.right,a.top]),arx:document.querySelectorAll('.jr .arx').length,fam:document.querySelector('.jr .arx')&&getComputedStyle(document.querySelector('.jr .arx')).fontFamily}});
ck(r.over===0,w+': tab text overflows');
for(let i=0;i<r.rects.length;i++)for(let j=i+1;j<r.rects.length;j++){const a=r.rects[i],c=r.rects[j];if(a[2]===c[2]&&!(a[1]<=c[0]+1||c[1]<=a[0]+1))ck(0,w+': tabs overlap')}
ck(r.arx>=1&&/arab|naskh|amiri|noto/i.test(r.fam||''),w+': Arabic span font '+r.fam);
await p.close()}
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
