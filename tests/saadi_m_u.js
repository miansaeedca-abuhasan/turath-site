const fs=require('fs');let bad=0;
for(const f of fs.readdirSync(__dirname+'/../quran/tafsir').filter(x=>/^ur_saadi_/.test(x))){const t=fs.readFileSync(__dirname+'/../quran/tafsir/'+f,'utf8');
 const m=(t.match(/[^\sA-Za-z]m(?![A-Za-z])/g)||[]).length,u=(t.match(/\(u\)|[ء-ي]u(?![A-Za-z])/g)||[]).length;
 if(m||u){bad=1;console.log('FAIL',f,'m',m,'u',u)}}
console.log(bad?'FAIL':'PASS saadi_m_u');process.exit(bad)
