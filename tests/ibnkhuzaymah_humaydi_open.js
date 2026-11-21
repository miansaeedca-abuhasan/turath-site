const {chromium,devices}=require('playwright');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();
for(const [name,ctxo] of [['phone',{...devices['Pixel 5']}],['desktop',{viewport:{width:1280,height:900}}]]){
const c=await b.newContext({...ctxo,serviceWorkers:'block'});const p=await c.newPage();
await p.addInitScript(()=>{try{localStorage.setItem('newsSeen','20261121a');localStorage.setItem('ui','ur')}catch(e){}});
const open=async(h,re)=>{await p.goto('http://localhost:8765/#'+h);await p.reload();await p.waitForFunction(r=>new RegExp(r).test(document.body.innerText),re,{timeout:30000}).catch(()=>{});return p.evaluate(()=>document.body.innerText)};
let t=await open('/s/ibnkhuzaymahur/n/1','یحییٰ|یحیی بن یعمر');
ck(/بَابُ ذِكْرِ الْخَيْرِ الثَّابِتِ/.test(t)&&/نبی اکرم صلی اللہ علیہ وسلم سے ثابت حدیث/.test(t),name+' ibn: Arabic and Urdu bab');
ck(/تحقیق و تخریج/.test(t)&&/مسلم|ترمذی/.test(t)&&/فوائد/.test(t),name+' ibn: takhrij heading, takhrij and fawaid');
ck(!/\(1\)\s*$/m.test(t.split('تحقیق')[0].slice(-40)),name+' ibn: no raw (1) mark at the end of the translation');
t=await open('/s/ibnkhuzaymahur/n/739','حضرت|رضی');
ck(/740/.test(t),name+' ibn: row 739 is printed 740');
t=await open('/s/humaydiur/n/1','سیدنا علی بن ابی طالب');
ck(/تحقیق و تخریج/.test(t)&&/سنن ابی داود/.test(t)&&/فوائد/.test(t),name+' humaidi: takhrij and fawaid');
t=await open('/s/ibnkhuzaymahur?idx','عرض ناشر');
ck(/عرض ناشر/.test(t)&&/حالات زندگی/.test(t),name+' ibn: intro blocks on the contents page');
t=await open('/s/humaydiur?idx','تقریظ');
ck(/تقریظ/.test(t)&&/امام حمیدی کے حالات/.test(t),name+' humaidi: intro blocks on the contents page');
await c.close()}
await b.close();if(bad)process.exit(1);console.log('PASS ibnkhuzaymah_humaydi_open')})();
