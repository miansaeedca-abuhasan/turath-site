const {chromium}=require('playwright');
(async()=>{const br=await chromium.launch();let bad=0;
for(const [n,vp] of [['phone',{width:390,height:800}],['desktop',{width:1280,height:900}]]){
 const pg=await br.newPage({viewport:vp});
 await pg.addInitScript(()=>{try{localStorage.setItem('splashT',String(Date.now()))}catch(e){}});
 await pg.goto('http://localhost:8765/index.html#/');await pg.waitForSelector('.datebar .dshare',{timeout:15000}).catch(()=>{});
 await pg.waitForSelector('.tick',{timeout:15000}).catch(()=>{});
 const r=await pg.evaluate(()=>{const d=document.querySelector('.datebar'),t=document.querySelector('.tick'),s=d&&d.querySelector('.dshare');
  const hj=d&&d.querySelector('.dhj'),gr=d&&d.querySelector('.dgr');
  const R=e=>e&&e.getBoundingClientRect();
  return {bar:!!document.querySelector('.gpb.gpshare, .gpbar .gpshare'),d:R(d)&&R(d).height,t:R(t)&&R(t).height,
   order:s&&hj&&gr?(R(hj).left<R(s).left?'hj<s':'s<hj')+'|'+(R(s).left<R(gr).left?'s<gr':'gr<s'):null,
   fits:d&&d.scrollWidth<=d.clientWidth+1,pad:getComputedStyle(t,'::before').width}});
 if(r.bar){console.log(n,'FAIL green share bar still there');bad++}
 if(!r.d||Math.abs(r.d-r.t)>1){console.log(n,'FAIL heights',r.d,r.t);bad++}
 if(!r.order||!/hj<s\|s<gr/.test(r.order.replace(/\|/,'|'))&&!/s<hj\|gr<s/.test(r.order)){console.log(n,'FAIL order',r.order);bad++}
 if(!r.fits){console.log(n,'FAIL datebar overflow');bad++}
 await pg.screenshot({path:'/tmp/home_'+n+'.png',clip:{x:0,y:0,width:vp.width,height:400}});
 console.log(n,JSON.stringify(r));await pg.close();}
await br.close();console.log(bad?'FAIL':'PASS');process.exit(bad?1:0)})();
