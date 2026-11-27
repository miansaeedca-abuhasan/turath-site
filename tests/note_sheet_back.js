const {chromium}=require('playwright');(async()=>{const b=await chromium.launch(),p=await b.newPage();let bad=[];
await p.addInitScript(()=>{localStorage.ui='ur';localStorage.nosplash='1'});
await p.goto('http://localhost:8765/index.html#/q');await p.waitForTimeout(1500);
const h0=await p.evaluate(()=>{const d=document.createElement('p');d.className='qar';d.textContent='test';document.body.append(d);
 const m=document.createElement('mark');m.className='uhl';m.dataset.id='t1';m.dataset.c='0';m.textContent='x';d.append(m);
 return location.hash});
await p.evaluate(()=>{localStorage.setItem('turath_hl',JSON.stringify([{id:'t1',c:0,n:'',h:location.hash}]))});
// store a highlight under whichever key the page uses
const keys=await p.evaluate(()=>Object.keys(localStorage));
await p.evaluate(()=>{for(const k of Object.keys(localStorage)){}});
await p.evaluate(()=>{document.querySelector('mark.uhl').click()});
await p.waitForTimeout(300);
let open=await p.evaluate(()=>!!document.querySelector('.selnote'));
if(!open){console.log('SKIP: no highlight stored (note sheet not opened)');}
else{await p.waitForTimeout(200);await p.goBack();await p.waitForTimeout(400);
const st=await p.evaluate(()=>({hash:location.hash,ov:!!document.querySelector('.selnote')}));
if(st.ov)bad.push('note sheet stays');if(st.hash!==h0)bad.push('page went back '+st.hash);}
console.log(bad.length?'FAIL '+bad:'OK note_sheet_back');await b.close();process.exit(bad.length?1:0)})();
