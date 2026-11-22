// Musnad ash-Shafi'i / Saheefa of Ali / Shaan-e-Sahaba open and read well on phone and desktop
const {chromium,devices}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();
for(const [name,o] of [['phone',{...devices['Pixel 5']}],['desktop',{viewport:{width:1280,height:900}}]]){
const c=await b.newContext({...o,serviceWorkers:'block'});const p=await c.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('newsSeen','20261121a');localStorage.setItem('ui','ur')}catch(e){}});
const open=async(h,re)=>{await p.goto('http://localhost:8765/#'+h);await p.reload();await p.waitForFunction(r=>new RegExp(r).test(document.body.innerText),re,{timeout:40000}).catch(()=>{});return p.evaluate(()=>document.body.innerText)};
let t=await open('/s/musnadshafiiur/n/1','سمندر کے پانی کا بیان');
ck(/بَابٌ فِي مَاءِ الْبَحْرِ/.test(t)&&/سمندر کے پانی کا بیان/.test(t),name+' shafii: Arabic and Urdu bab');
ck(/تحقیق و تخریج/.test(t)&&/الترمذی/.test(t)&&/فوائد/.test(t),name+' shafii: takhrij heading, takhrij and fawaid');
t=await open('/s/musnadshafiiur/n/1041','نذر');
ck(/1041/.test(t),name+' shafii: hadith 1041 (volume 2) opens');
t=await open('/s/musnadshafiiur?idx','طہارت کے مسائل');
ck(/طہارت کے مسائل/.test(t)&&/تقریظ/.test(t),name+' shafii: kitab groups and taqreez on the contents page');
t=await open('/s/saheefaaliur?idx','عرض ناشر');
ck(/عرض ناشر/.test(t)&&/مقدمہ/.test(t)&&/فصل ۱/.test(t),name+' saheefa: contents page with intro and chapters');
t=await open('/s/saheefaaliur/1','سیدنا علی بن ابی طالب');
ck(/سیدنا علی بن ابی طالب/.test(t),name+' saheefa: first section reads');
t=await open('/s/shaansahabaur?idx','تقریظ');
ck(/تقریظ/.test(t)&&/باب 1/.test(t),name+' shaan: contents page');
t=await open('/s/shaansahabaur/1','صحابی کی تعریف');
ck(/صحابی کی تعریف/.test(t)&&/بَ|مَنْ صَحِبَ/.test(t),name+' shaan: first chapter opens, Arabic inside');
t=await open('/sec/sahaba','شان صحابہ');
ck(/شان صحابہ بزبان مصطفی علیہ السلام/.test(t),name+' shaan: listed in the Fazail as-Sahabah folder');
await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS new_books3_open')})();
