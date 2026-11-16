// Nepali: the interface language list has it, the core labels are Nepali, no honorific glyph box (ﷺ) in Nepali strings, the HadeethEnc book opens with Arabic, Nepali translation and its grade
const {chromium}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.addInitScript(()=>{localStorage.ui='ne';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/s/hadeethenc/n/5');await p.waitForSelector('.card',{timeout:60000});await p.waitForTimeout(3000);
const t=await p.evaluate(()=>document.body.innerText);
ck(/कुर्आन/.test(t)&&/हदीस/.test(t),'Nepali nav labels');
ck(/कुर्आन पढ्ने मुमिनको उदाहरण/.test(t),'Nepali translation of hadith 5');
ck(/صحيح/.test(t),'Arabic grade under the Arabic text');
ck(await p.evaluate(()=>document.documentElement.lang==='ne'),'html lang ne');
const d=await p.evaluate(()=>({ni:I.ne&&Object.keys(I.ne).length,sym:Object.values(I.ne).some(v=>typeof v==='string'&&/ﷺ/.test(v)),langs:UI_LANGS.some(x=>x[0]==='ne'),sq:!!(typeof T==='function'&&T('langs').ne)}));
ck(d.ni>250,'ne strings '+d.ni);ck(!d.sym,'ﷺ in a Nepali string');ck(d.langs,'ne in the language list');ck(d.sq,'Nepali language name');
const c=await p.evaluate(async()=>{const x=await fetch('coll/index.js').then(r=>r.text());const a=JSON.parse(x.slice(x.indexOf('COLLS(')+6,x.lastIndexOf(')')));const e=a.find(e=>e.key==='hadeethenc');return {n:e.count,langs:e.langs,secs:e.sections.length}});
ck(c.n===613&&c.langs.join()==='ar,ne'&&c.secs===7,'book entry '+JSON.stringify(c));
ck(!errs.length,'js errors '+errs[0]);
await b.close();console.log(bad?'FAILED':'OK');process.exit(bad?1:0)})();
