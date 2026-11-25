import sys,json,os,glob,re,time
sys.path.insert(0,'tools/pages')
from align import *
idx=open('coll/index.js',encoding='utf8').read();j=json.loads(idx[idx.index('(')+1:idx.rindex(')')])
E_=epubs();res={}
for x in j:
    k=x['key']
    if x.get('grp')!='ar' or not k.startswith('sh') or k[2:] not in E_: continue
    t=time.time()
    try:
        R,P,out,miss=align(k,E_[k[2:]][-1])
    except Exception as e:
        print(k,'ERR',e,flush=True);continue
    mono=sum(1 for a,b in zip(out,out[1:]) if b<a)
    print(k,len(R),len(P),'miss',miss,'back',mono,'juz',max(o[0] for o in out),'%.0fs'%(time.time()-t),flush=True)
