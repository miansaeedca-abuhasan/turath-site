#!/usr/bin/env python3
"""after numbering_fix: the 11 bracketed extra hadith «330 / 1 -[…]» keep their printed number «330/1» (registry an) — run: build_ar.py, numbering_fix.py sh10757, post_ar.py, pages/build.py 10757, rehash"""
import json,re,os,glob,hashlib
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','..'))
KEY='sh10757';D=str.maketrans('٠١٢٣٤٥٦٧٨٩','0123456789')
s=open('coll/index.js',encoding='utf-8').read();A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
e=[x for x in A if x['key']==KEY][0];o=json.load(open('offline.json',encoding='utf-8'))
g=[x for x in o['groups'] if x['id']=='c_'+KEY][0]
pat=re.compile(r'^\s*([٠-٩]+)\s*/\s*([٠-٩]+)\s*-\s*')
n=0
for f in e['files']['ar']:
    t=open('coll/'+f[2],encoding='utf-8').read();x=t.index('[[');y=t.rindex(']]')+2;R=json.loads(t[x:y]);ch=False
    for r in R:
        m=pat.match(r[1]) if str(r[0]) in e.get('nn',{}) else None
        if m:
            e['an'][str(r[0])]=m.group(1).translate(D)+'/'+m.group(2).translate(D);e.get('nn',{}).pop(str(r[0]),None);r[1]=r[1][m.end():];ch=True;n+=1
    if ch:
        body=t[:x]+json.dumps(R,ensure_ascii=False,separators=(',',':'))+t[y:]
        h=hashlib.md5(body.encode()).hexdigest();name=re.sub(r'_[0-9a-f]{6}\.js$','_'+h[:6]+'.js',f[2])
        open('coll/'+name,'w',encoding='utf-8').write(body);os.remove('coll/'+f[2])
        for q in g['f']:
            if q[0]=='coll/'+f[2]:q[0]=q[2]='coll/'+name;q[1]=h[:10];q[3]=len(body.encode())
        f[2]=name
g['b']=sum(q[3] for q in g['f'])
open('coll/index.js','w',encoding='utf-8').write('COLLS('+json.dumps(A,ensure_ascii=False,separators=(',',':'))+')')
open('offline.json','w',encoding='utf-8').write(json.dumps(o,ensure_ascii=False,separators=(',',':')))
print('extra hadith numbered',n)
