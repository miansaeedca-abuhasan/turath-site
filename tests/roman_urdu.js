// Guard: Roman Urdu toggle exists, Arabic text is never changed, Urdu is shown in Latin letters and can be reverted.
const fs=require('fs'),bad=[];
const ix=fs.readFileSync('index.html','utf8'),src=fs.readFileSync('roman.js','utf8');
if(!/roman\.js/.test(ix))bad.push('roman.js not loaded');
global.window={};global.MutationObserver=class{observe(){}};global.document={readyState:'loading',addEventListener(){}};global.localStorage={};
eval(src);
const r=window.ROMAN.romanize;
const t=r('سیدنا ابو ہریرہ رضی اللہ عنہ سے روایت ہے کہ نبی صلی اللہ علیہ وسلم نے فرمایا');
if(/[؀-ۿ]/.test(t))bad.push('Arabic letters left: '+t);
if(!/razi Allahu anhu/.test(t)||!/sallallahu alaihi wasallam/.test(t)||!/Abu Hurairah/.test(t))bad.push('honorifics: '+t);
if(r('حدیث نمبر ۱۲۳').indexOf('123')<0)bad.push('digits');
if(!/URDU\s*=/.test(src)||!/ARAB\s*=/.test(src)||!/\.ar,\[lang=ar\]/.test(src))bad.push('Arabic text must be skipped');
if(!/localStorage\.roman/.test(src))bad.push('choice not remembered');
console.log(bad.length?'FAIL '+bad.join(' | '):'PASS');process.exit(bad.length?1:0);
