#!/usr/bin/env python3
"""Insert the missing space before «صلى الله عليه وسلم» when it is glued to the previous word (e.g. رسول اللهصلى الله عليه وسلم).
Rewrites the referenced coll chunk files, renames them with the new content hash and updates coll/index.js + offline.json."""
import re,glob,json,hashlib,os,datetime
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
A=re.compile(r'(?<=[ء-يہھےیًّ-ْ])(?=صل[یىي]\s*ا[لّّ]+[ہه]\s*علي[هہ]\s*وسلم|صل[یىي]\s*ا[لّّ]+[ہه]\s*علی[ہه]\s*وسلم)')
idx=open('coll/index.js',encoding='utf8').read()
ref=set(re.findall(r'coll_?/?([A-Za-z0-9_]+_[0-9a-f]{6}\.js)|"([A-Za-z0-9_]+_[0-9a-f]{6}\.js)"',idx) and [a or b for a,b in re.findall(r'coll_?/?([A-Za-z0-9_]+_[0-9a-f]{6}\.js)|"([A-Za-z0-9_]+_[0-9a-f]{6}\.js)"',idx)])
off=open('offline.json',encoding='utf8').read()
n=0
for f in sorted(os.listdir('coll')):
    if f not in ref: continue
    t=open('coll/'+f,encoding='utf8').read()
    t2,c=A.subn(' ',t)
    if not c: continue
    h=hashlib.md5(t2.encode('utf8')).hexdigest()
    nf=re.sub(r'_[0-9a-f]{6}\.js$','_'+h[:6]+'.js',f)
    open('coll/'+nf,'w',encoding='utf8').write(t2)
    if nf!=f: os.remove('coll/'+f)
    idx=idx.replace(f,nf)
    o=json.loads(off)
    for g in o['groups']:
        for x in g['f']:
            if x[0]=='coll/'+f:
                g['b']+=len(t2.encode())-x[3];x[0]=x[2]='coll/'+nf;x[1]=h[:10];x[3]=len(t2.encode())
    off=json.dumps(o,ensure_ascii=False,separators=(',',':'));n+=c
    print(f,'->',nf,c)
open('coll/index.js','w',encoding='utf8').write(idx)
o=json.loads(off);o['v']=datetime.datetime.now(datetime.UTC).strftime('%Y%m%d%H%M')
open('offline.json','w',encoding='utf8').write(json.dumps(o,ensure_ascii=False,separators=(',',':')))
print('fixed',n)
