#!/usr/bin/env python3
"""Refresh the ?h= content hashes of the data files after any change to them
(data/d*.js, dr*.js, bn*.js, jstruct.js, madkhal.js), so phones never keep an old copy."""
import re,hashlib,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
md=lambda f:hashlib.md5(open(f,'rb').read()).hexdigest()[:10]
d1=open('data/d1.js',encoding='utf8').read()
d1=re.sub(r'(data/(?:dr|bn)\d+\.js)\?h=[0-9a-f]{10}',lambda m:m.group(1)+'?h='+md(m.group(1)),d1)
d1=re.sub(r'"jsh":"[0-9a-f]{10}"','"jsh":"'+md('jstruct.js')+'"',d1)
d1=re.sub(r'"mkh":"[0-9a-f]{10}"','"mkh":"'+md('data/madkhal.js')+'"',d1)
open('data/d1.js','w',encoding='utf8').write(d1)
ix=open('index.html',encoding='utf8').read()
ix=re.sub(r'(data/d\d+\.js)\?h=[0-9a-f]{10}',lambda m:m.group(1)+'?h='+md(m.group(1)),ix)
open('index.html','w',encoding='utf8').write(ix)
print('hashes refreshed')
