#!/usr/bin/env python3
"""Make offline.json agree with the files on disk: every entry [path,hash,url,size] gets the file's real md5 (first 10 hex) and size, so a phone that
holds the offline pack sees that the file changed and downloads it again (data files without a hash in their name, e.g. quran/tafsir/*.js).
Usage: offline_sync.py [--dry]"""
import json,os,hashlib,re,sys,datetime
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
o=json.load(open('offline.json',encoding='utf8'));n=0;miss=0
for g in o['groups']:
    for x in g['f']:
        p=x[0]
        if not p.startswith('quran/tafsir/'):continue   # coll files carry their hash in the file name (handled by the book tools)
        if not os.path.exists(p):miss+=1;continue
        d=open(p,'rb').read();m=hashlib.md5(d).hexdigest()
        if m.startswith(x[1]) or m.startswith(x[1][:8]) and p.endswith('.bin'):
            if len(d)!=x[3]:g['b']+=len(d)-x[3];x[3]=len(d);n+=1
            continue
        g['b']+=len(d)-x[3];x[1]=m[:10];x[3]=len(d)
        if '?h=' in x[2]:x[2]=re.sub(r'\?h=[0-9a-f]+','?h='+m[:10],x[2])
        n+=1
print('entries updated',n,'missing files',miss)
if '--dry' not in sys.argv and n:
    o['v']=datetime.datetime.now(datetime.UTC).strftime('%Y%m%d%H%M')
    open('offline.json','w',encoding='utf8').write(json.dumps(o,ensure_ascii=False,separators=(',',':')))
