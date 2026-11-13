// the «these tafsirs are not found in an open source» note must never show under a tafsir
const fs=require('fs');const h=fs.readFileSync('index.html','utf8');
if(/T\('tafsirMissing'\)/.test(h)){console.log('FAIL tafsirMissing note is shown again');console.log('FAILED');process.exit(1)}
console.log('OK');
