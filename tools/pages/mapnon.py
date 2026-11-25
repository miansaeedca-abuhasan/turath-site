#!/usr/bin/env python3
"""Which EPUB belongs to which Arabic library book whose key is not sh<id> (tools/pages/map.json: key -> epub id).
A pair is accepted when >=60 % of 24 evenly sampled row starts (first 20 letters) are found in the epub text."""
import sys,os,json,io
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from align import *
idx=open('coll/index.js',encoding='utf8').read();j=json.loads(idx[idx.index('(')+1:idx.rindex(')')])
E_=epubs();have={x['key'] for x in j if x.get('pg')}
keys=[x['key'] for x in j if x.get('grp')=='ar' and not x['key'].startswith('sh') or (x.get('grp')=='ar' and x['key'][2:].isdigit()==False)]
keys=[k for k in dict.fromkeys(keys) if k not in have]
un=[i for i in E_ if 'sh'+i not in {x['key'] for x in j}]
txt={}
for i in un:
    try: txt[i]=''.join(p[2] for p in pages(E_[i][-1]))
    except Exception as e: print('skip',i,e)
res={}
for k in keys:
    R=list(rows(k))
    if len(R)<5: continue
    S=[N(R[int(n*(len(R)-1)/23)][1])[:20] for n in range(24)];S=[s for s in S if len(s)>=12]
    best=(0,None)
    for i,t in txt.items():
        h=sum(1 for s in S if s in t)/max(1,len(S))
        if h>best[0]:best=(h,i)
    print(k,best,flush=True)
    if best[0]>=0.6:res[k]=best[1]
json.dump(res,open('tools/pages/map.json','w'),indent=1);print(res)
