#!/usr/bin/env python3
"""Printed volume/page for the Arabic library books: for every sh<id> book that has an EPUB, writes coll/pg/<key>_<hash>.js,
sets registry field `pg` (coll/index.js) and adds the file to the book's group in offline.json. A book whose alignment is poor
(>35 % rows unmatched (matched rows only get a label) or pages running backwards >1 %) is NOT written and is listed in tools/pages/report.txt.
usage: build.py [id id …]   (no ids = all)  ; then python3 tools/rehash.py and bump sw.js"""
import sys,json,os,time,glob,hashlib
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from align import *
only=set(a for a in sys.argv[1:])
idx=open('coll/index.js',encoding='utf8').read();j=json.loads(idx[idx.index('(')+1:idx.rindex(')')])
E_=epubs();rep=[];o=json.load(open('offline.json',encoding='utf8'))
for x in j:
    k=x['key']
    if x.get('grp')!='ar' or not k.startswith('sh'): continue
    if only and k[2:] not in only: continue
    if k[2:] not in E_: rep.append('%s\tno epub\t%s'%(k,x.get('ar')));continue
    try: R,P,out,miss=align(k,E_[k[2:]][-1])
    except Exception as e: rep.append('%s\tERR %s\t%s'%(k,e,x.get('ar')));continue
    oo=[o for o in out if o];back=sum(1 for a,b in zip(oo,oo[1:]) if b<a)
    if miss>len(R)*0.35 or back>len(R)*0.01: rep.append('%s\tpoor miss %d back %d of %d rows\t%s'%(k,miss,back,len(R),x.get('ar')));x.pop('pg',None);continue
    fn,sz=write(k,R,out);x['pg']=fn
    g=[g for g in o['groups'] if g['id']=='c_'+k]
    if g:
        g=g[0];g['f']=[f for f in g['f'] if '/pg/' not in f[0]];p='coll/pg/'+fn
        g['f'].append([p,hashlib.md5(open(p,'rb').read()).hexdigest()[:10],p,sz]);g['b']=sum(f[3] for f in g['f'])
    print(k,len(R),'miss',miss,'back',back,sz//1024,'KB',flush=True)
open('coll/index.js','w',encoding='utf8').write('COLLS('+json.dumps(j,ensure_ascii=False,separators=(',',':'))+')')
open('offline.json','w',encoding='utf8').write(json.dumps(o,ensure_ascii=False,separators=(',',':')))
open('tools/pages/report.txt','w',encoding='utf8').write('\n'.join(rep)+'\n');print('report',len(rep))
