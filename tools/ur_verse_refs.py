#!/usr/bin/env python3
"""Urdu translated books: a verse reference «[الروم: 22]» / «[المائدة:67]» is written the Urdu way: Urdu digits and Urdu spelling of the surah name «[الروم: ۲۲]»
(owner rulings: numbers in Urdu text in Urdu digits; surah names in the Urdu spelling). Rows of coll/<key>_ur_* and the chapter titles of the registry.
Usage: ur_verse_refs.py [--dry] key [key …]"""
import json,re,os,sys,hashlib,datetime
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
DRY='--dry' in sys.argv;keys=[a for a in sys.argv[1:] if not a.startswith('--')]
T=open('coll/index.js',encoding='utf8').read();a=T.index('(')+1;b=T.rindex(')');reg=json.loads(T[a:b])
off=json.load(open('offline.json',encoding='utf8'))
UD=str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹')
RE=re.compile(r'\[(\s*[؀-ۿ][؀-ۿ ]{0,38}?)\s*[:：]\s*([0-9۰-۹٠-٩]+)(\s*[-–]\s*[0-9۰-۹٠-٩]+)?\s*\]')
def nm(s):return s.strip().replace('ة','ۃ').replace('ي','ی').replace('ى','ی').replace('ك','ک').replace('ه','ہ')
def dg(s):return s.translate(str.maketrans('٠١٢٣٤٥٦٧٨٩0123456789','۰۱۲۳۴۵۶۷۸۹۰۱۲۳۴۵۶۷۸۹'))
n=[0]
def fix(t):
    def r(m):
        n[0]+=1;return '['+nm(m.group(1))+': '+dg(m.group(2))+(' - '+dg(m.group(3)).strip(' -–') if m.group(3) else '')+']'
    return RE.sub(r,t)
for bk in reg:
    if bk['key'] not in keys:continue
    for s in bk.get('sections',[]):
        if isinstance(s[1],str):s[1]=fix(s[1])
    for f in bk['files']['ur']:
        t=open('coll/'+f[2],encoding='utf8').read();x=t.index('[[');y=t.rindex(']]')+2
        rows=json.loads(t[x:y])
        for r in rows:r[1]=fix(r[1])
        t2=t[:x]+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+t[y:]
        if t2==t or DRY:continue
        h=hashlib.md5(t2.encode()).hexdigest();fn=f[2];nf=re.sub(r'_[0-9a-f]{6}\.js$','_'+h[:6]+'.js',fn)
        open('coll/'+nf,'w',encoding='utf8').write(t2)
        if nf!=fn:os.remove('coll/'+fn)
        f[2]=nf
        for g in off['groups']:
            for z in g['f']:
                if z[0]=='coll/'+fn:g['b']+=len(t2.encode())-z[3];z[0]=z[2]='coll/'+nf;z[1]=h[:10];z[3]=len(t2.encode())
print('references fixed',n[0])
if not DRY:
    open('coll/index.js','w',encoding='utf8').write(T[:a]+json.dumps(reg,ensure_ascii=False,separators=(',',':'))+T[b:])
    off['v']=datetime.datetime.now(datetime.UTC).strftime('%Y%m%d%H%M');open('offline.json','w',encoding='utf8').write(json.dumps(off,ensure_ascii=False,separators=(',',':')))
