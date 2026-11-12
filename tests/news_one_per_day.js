// What's new: one card per day and heading, all books of that day listed in it
const fs=require('fs');const n=JSON.parse(fs.readFileSync('news.json','utf8'));const seen={};let bad=0;
for(const e of n){const k=e.d+'|'+e.t.ur;if(seen[k]){bad++;console.log('FAIL second card for',k)}seen[k]=1;}
const ix=fs.readFileSync('index.html','utf8'),i=ix.indexOf('window.NEWS = [\n'),j=ix.indexOf('\n  ];',i);
const emb=ix.slice(i+16,j).split('\n').filter(l=>l.trim().startsWith('{')).length;if(emb!==n.length){bad++;console.log('FAIL embedded news differs',emb,n.length)}
console.log(bad?'FAILED':'OK');process.exit(bad?1:0)
