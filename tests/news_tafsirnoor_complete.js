// «اپڈیٹس»: one announcement for the complete Tafsir Noor al-Huda (15 volumes); the old "volume 1" line is gone
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const n=JSON.parse(fs.readFileSync(__dirname+'/../news.json','utf8')),h=fs.readFileSync(__dirname+'/../index.html','utf8');
const hits=n.filter(x=>(x.keys||[]).includes('tafsirnoor'));
ck(hits.length===1&&hits[0].id==='20261119a','exactly one tafsirnoor card (today\'s single card)');
ck(hits[0].i.ur.some(x=>/مکمل 15 جلدوں پر مشتمل/.test(x)&&/انصار السنۃ پبلیکیشنز/.test(x)),'Urdu line: complete 15 volumes + publisher');
ck(!/جلد 1 \(سورۃ الفاتحہ/.test(JSON.stringify(n))&&!/جلد 1 \(سورۃ الفاتحہ/.test(h),'old volume-1 line removed everywhere');
ck(/"id":\s*"20261119a"[^\n]*tafsirnoor/.test(h),'announcement is in the app list');
ck(n.find(x=>x.id==='20261115a').keys.join()==='mujamawsat','old card keeps only Mu‘jam Awsat');
if(bad)process.exit(1);console.log('PASS news_tafsirnoor_complete');
