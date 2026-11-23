#!/usr/bin/env python3
"""After tools/build_ixl.js: refresh the coll/ixl/* entries of offline.json (path, md5, size) from the files on disk."""
import json,os,hashlib,datetime
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
o=json.load(open('offline.json',encoding='utf8'))
g=next(x for x in o['groups'] if any(f[0].startswith('coll/ixl/') for f in x['f']))
keep=[f for f in g['f'] if not f[0].startswith('coll/ixl/')]
new=[]
for l in sorted(os.listdir('coll/ixl')):
    for f in sorted(os.listdir('coll/ixl/'+l),key=lambda s:int(s[:-3])):
        p='coll/ixl/%s/%s'%(l,f);d=open(p,'rb').read();new.append([p,hashlib.md5(d).hexdigest()[:10],p,len(d)])
g['f']=keep+new;g['b']=sum(f[3] for f in g['f'])
o['v']=datetime.datetime.now(datetime.UTC).strftime('%Y%m%d%H%M')
open('offline.json','w',encoding='utf8').write(json.dumps(o,ensure_ascii=False,separators=(',',':')))
print(g['id'],len(new),'index files,',g['b'],'bytes')
