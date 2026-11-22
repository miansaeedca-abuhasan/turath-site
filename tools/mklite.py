#!/usr/bin/env python3
"""coll/lite.js = coll/index.js without the heavy per-book fields (chapters, printed numbers, intros ...): enough for the book lists, so they open without the 7 MB index.
Run after every change of coll/index.js (tools/rehash.py does it)."""
import json,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
HEAVY={'sections','an','intro','introL','secL','bab','heads','headsL','nn'}
t=open('coll/index.js',encoding='utf8').read();j=json.loads(t[t.index('(')+1:t.rindex(')')])
out=[]
for e in j:
    d={k:v for k,v in e.items() if k not in HEAVY}
    if e.get('sections'):d['s0']=e['sections'][0][0]
    if e.get('nn'):d['nc']=len(e['nn'])   # number of note rows (not hadith): the totals of the home page subtract them
    out.append(d)
s='COLITE('+json.dumps(out,ensure_ascii=False,separators=(',',':'))+')'
open('coll/lite.js','w',encoding='utf8').write(s);print('lite',len(s)//1024,'KB of',len(t)//1024,'KB')
