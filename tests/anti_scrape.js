// AI / scraper protection (owner 26-11-2026): robots.txt blocks AI + bulk crawlers, data folders carry noai headers, 10-page copy quota stays
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const r=fs.readFileSync('robots.txt','utf8'),h=fs.readFileSync('_headers','utf8');
for(const b of['GPTBot','ClaudeBot','CCBot','Google-Extended','PerplexityBot','Bytespider','anthropic-ai'])ck(new RegExp('User-agent: '+b+'\\nDisallow: /').test(r),b+' blocked');
ck(/Disallow: \/coll\//.test(r)&&/Disallow: \/api\//.test(r),'data + api disallowed for others');
ck(/\/coll\/\*\n  X-Robots-Tag: noindex, noarchive, noai/.test(h),'coll noai header');
ck(/CQ_MAX=30000/.test(fs.readFileSync('index.html','utf8')),'copy quota 30000 chars (10 pages) kept');
if(bad)process.exit(1);console.log('PASS anti_scrape');
