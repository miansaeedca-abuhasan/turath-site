#!/usr/bin/env python3
"""Refresh the ?h= content hashes of the data files after any change to them
(data/d*.js, dr*.js, bn*.js, jstruct.js, madkhal.js), so phones never keep an old copy."""
import re,hashlib,os,subprocess,json
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
md=lambda f:hashlib.md5(open(f,'rb').read()).hexdigest()[:10]
d1=open('data/d1.js',encoding='utf8').read()
d1=re.sub(r'(data/(?:dr|bn)\d+\.js)\?h=[0-9a-f]{10}',lambda m:m.group(1)+'?h='+md(m.group(1)),d1)
d1=re.sub(r'"jsh":"[0-9a-f]{10}"','"jsh":"'+md('jstruct.js')+'"',d1)
d1=re.sub(r'"mkh":"[0-9a-f]{10}"','"mkh":"'+md('data/madkhal.js')+'"',d1)
open('data/d1.js','w',encoding='utf8').write(d1)
subprocess.check_call(['node','tools/mkmeta.js'])   # data/meta.js = d*.js without the hadith text
ix=open('index.html',encoding='utf8').read()
ix=re.sub(r'(data/meta\.js)\?h=[0-9a-f]{10}',lambda m:m.group(1)+'?h='+md('data/meta.js'),ix)
ix=re.sub(r'(data/d\d+\.js)\?h=[0-9a-f]{10}',lambda m:m.group(1)+'?h='+md(m.group(1)),ix)
open('index.html','w',encoding='utf8').write(ix)
try:
    o=json.load(open('offline.json',encoding='utf8'));c=[g for g in o['groups'] if g['id']=='core'][0]
    h=md('data/meta.js');ent=['data/meta.js',h,'data/meta.js?h='+h,os.path.getsize('data/meta.js')]
    c['f']=[x for x in c['f'] if x[0]!='data/meta.js']+[ent]
    open('offline.json','w',encoding='utf8').write(json.dumps(o,ensure_ascii=False,separators=(',',':')))
except Exception as e: print('offline.json not updated',e)
print('hashes refreshed')
