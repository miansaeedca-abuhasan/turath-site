// Makes the ready-made «today's ayah / hadith» files: dc/<ui>_<n>.js (n = day number / 30).  Run:  node tools/dcgen.js   (needs the local server on :8765)
// Re-run it every few months (tests/daily_pre.js fails when the next 60 days are not covered).
const {chromium}=require('playwright'),fs=require('fs');
const UIS=['ur','ar','en','bn','hi','gu','fr'],AHEAD=+process.argv[2]||430;
(async()=>{const b=await chromium.launch();fs.mkdirSync('dc',{recursive:true});
for(const f of fs.readdirSync('dc'))fs.unlinkSync('dc/'+f);
for(const ui of UIS){const c=await b.newContext({viewport:{width:412,height:800},serviceWorkers:'block'}),p=await c.newPage();
await p.addInitScript(u=>{localStorage.nosplash='1';localStorage.ui=u;delete localStorage.qset},ui);
await p.goto('http://localhost:8765/#/');await p.waitForFunction(()=>window.QURAN&&window.TODAY&&window.TODAY.hadithOfDay,null,{timeout:60000});
const out=await p.evaluate(async AHEAD=>{const t=new Date(),d0=Math.floor(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())/864e5)-1,R={};
for(let dn=d0;dn<d0+AHEAD;dn++){const a=await QURAN.ayahOfDay(dn).catch(()=>null);let h=await TODAY.hadithOfDay(dn).catch(()=>null);
 if(h){const ui=document.documentElement.lang;h={ar:TODAY.clipFor(h.ar||'',260),tr:h.tr?TODAY.clipFor(h.tr,320):'',lang:h.lang,ref:h.ref,href:h.href}}
 R[dn]={a:a?{s:a.s,a:a.a,ar:a.ar,tr:a.tr,lang:a.lang,ref:a.ref,href:a.href}:null,h};}
return R},AHEAD);
const ch={};for(const dn in out){const k=Math.floor(+dn/30);(ch[k]=ch[k]||{})[dn]=out[dn]}
for(const k in ch)fs.writeFileSync(`dc/${ui}_${k}.js`,`DCH(${JSON.stringify(ui)},${k},${JSON.stringify(ch[k])});`);
console.log(ui,Object.keys(out).length,'days, null ayah',Object.values(out).filter(x=>!x.a).length,'null hadith',Object.values(out).filter(x=>!x.h).length);
await c.close()}
await b.close()})();
