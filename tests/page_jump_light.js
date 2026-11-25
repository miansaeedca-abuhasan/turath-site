const {chromium}=require('playwright');
// light: the jump tab loads only the small page file, no text chunk of the book, until «انتقال» is pressed
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:400,height:800}});let reqs=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.newsDay=String(new Date().toDateString())});
await p.goto('http://localhost:8765/#/');await p.waitForTimeout(2500);p.on('request',r=>reqs.push(r.url()));
await p.evaluate(()=>window.COLL.bookSearch('sh9767'));await p.waitForSelector('.pgtabs',{timeout:20000});
await p.click('.pgtabs button:nth-child(2)');await p.waitForFunction(()=>document.querySelector('.pgin').placeholder,{timeout:30000});
const data=reqs.filter(u=>/coll\/sh9767_ar_/.test(u)),pg=reqs.filter(u=>/coll\/pg\/sh9767/.test(u));
if(data.length||pg.length!==1){console.log('FAIL light: text chunks '+data.length+', pg files '+pg.length);process.exit(1)}
await b.close();console.log('OK light');})();
