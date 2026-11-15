// the reduced fonts must keep text widths exactly (guards against spoiled shaping) and stay small
const {chromium}=require('playwright'),fs=require('fs');
const CAP={JameelNooriNastaleeq:5.2e6,JameelNooriKasheeda:3.6e6,AlviLahoriNastaleeq:3.3e6};
const EXPECT=JSON.parse(fs.readFileSync(__dirname+'/font_widths.json','utf8'));
(async()=>{let ok=true;for(const n in CAP){const s=fs.statSync(__dirname+'/../fonts/'+n+'.woff2').size;const g=s<CAP[n];console.log(g?'PASS':'FAIL','size',n,s);ok=ok&&g}
const b=await chromium.launch(),p=await b.newPage();await p.addInitScript(()=>{localStorage.nosplash='1';localStorage.ui='ur'});await p.goto('http://localhost:8765/#/');await p.waitForTimeout(1500);
const T=['ابو ہریرہ رضی اللہ عنہ بڑے مشہور و معروف صحابی ہیں، انہوں نے اسلام قبول کیا۔','﴿ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴾ سیدنا عمر بن خطاب','صلی اللہ علیہ وسلم — تراث خيرالقرون ٢٣٤ 1234','کھیتی باڑی، ٹھنڈا پانی، گھوڑے دوڑ، ڈھیر، پہاڑ، اُن کی نصیحتیں'];
const r=await p.evaluate(async(T)=>{const out={};for(const f of ['Jameel Noori Nastaleeq','Jameel Noori Kasheeda','Alvi Lahori Nastaleeq']){await document.fonts.load('32px "'+f+'"',T[0]);const s=document.createElement('span');s.style.cssText='position:absolute;white-space:nowrap;font-size:32px;font-family:"'+f+'",serif';document.body.append(s);out[f]=T.map(t=>{s.textContent=t;return Math.round(s.getBoundingClientRect().width*100)/100})}return out},T);
const g=JSON.stringify(r)===JSON.stringify(EXPECT);console.log(g?'PASS':'FAIL','widths identical');await b.close();process.exit(ok&&g?0:1)})();
