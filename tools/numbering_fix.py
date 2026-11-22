#!/usr/bin/env python3
"""Library books (grp 'ar') whose rows are paragraphs: a row that starts with the printed number («١ - …») keeps it as its number
(registry 'an' row -> printed number, the number is taken out of the text because the site shows it in red in front), every other row
(title page, basmala, headings, «باب …», continuation of the previous hadith) becomes a note without a number (registry 'nn').
Only books where >= 60% of the rows start with a number and the numbers do not run backwards often. Not the narrator-book structures (RJ_LIB / RJ_STRUCT).
Usage: numbering_fix.py [--dry] [key ...]   (no key = every book that qualifies)"""
import json,re,os,sys,hashlib,datetime
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
DRY='--dry' in sys.argv;keys=[a for a in sys.argv[1:] if not a.startswith('--')]
html=open('index.html',encoding='utf8').read()
RJ=set(re.findall(r"'([^']+)'",re.search(r"const RJ_LIB = \[([^\]]*)\]",html).group(1))+re.findall(r"'([^']+)'",re.search(r"const RJ_STRUCT = \[([^\]]*)\]",html).group(1)))
T=open('coll/index.js',encoding='utf8').read();a=T.index('(')+1;b=T.rindex(')');reg=json.loads(T[a:b])
off=json.load(open('offline.json',encoding='utf8'))
D=str.maketrans('٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹','01234567890123456789')
NUM=re.compile(r'^(\s*[\(\[]?)([0-9٠-٩۰-۹]+)([\)\]]?\s*[-–—.،:]\s*)(?=\S)')
def runs(m):
    out=[];
    for k in sorted(m):
        if out and out[-1][0]+out[-1][2]==k and out[-1][1]+out[-1][2]==m[k]:out[-1][2]+=1
        else:out.append([k,m[k],1])
    return out
def split(t):
    L=t.split('\n');i=0
    while i<len(L)-1 and L[i].startswith('§'):i+=1
    return L,i
done=[]
for bk in reg:
    k=bk['key']
    if bk.get('grp')!='ar' or not bk.get('files') or not bk['files'].get('ar') or bk.get('nn') or k in RJ:continue
    if keys and k not in keys:continue
    files=[];rows=[]
    for f in bk['files']['ar']:
        t=open('coll/'+f[2],encoding='utf8').read();x=t.index('[[');y=t.rindex(']]')+2
        r=json.loads(t[x:y]);files.append((f,t,x,y,r));rows+=r
    num=0;prev=0;back=0
    for r in rows:
        L,i=split(r[1]);m=NUM.match(L[i])
        if m:
            num+=1;v=int(m.group(2).translate(D))
            if v<prev:back+=1
            prev=v
    if not rows or num/len(rows)<0.6 or back>0.05*num:continue
    an={};nn={}
    for r in rows:
        L,i=split(r[1]);m=NUM.match(L[i])
        if m:
            an[r[0]]=int(m.group(2).translate(D));L[i]=L[i][m.end():];r[1]='\n'.join(L)
        else:nn[r[0]]=1
    done.append((k,bk['ar'],len(rows),num,len(nn)))
    if DRY:continue
    for f,t,x,y,r in files:
        t2=t[:x]+json.dumps(r,ensure_ascii=False,separators=(',',':'))+t[y:]
        h=hashlib.md5(t2.encode()).hexdigest();fn=f[2];nf=re.sub(r'_[0-9a-f]{6}\.js$','_'+h[:6]+'.js',fn)
        open('coll/'+nf,'w',encoding='utf8').write(t2)
        if nf!=fn:os.remove('coll/'+fn)
        f[2]=nf
        for g in off['groups']:
            for z in g['f']:
                if z[0]=='coll/'+fn:g['b']+=len(t2.encode())-z[3];z[0]=z[2]='coll/'+nf;z[1]=h[:10];z[3]=len(t2.encode())
    bk['an']={'_r':runs(an)};bk['nn']=nn
for d in done:print(*d)
print(len(done),'books')
if not DRY and done:
    open('coll/index.js','w',encoding='utf8').write(T[:a]+json.dumps(reg,ensure_ascii=False,separators=(',',':'))+T[b:])
    off['v']=datetime.datetime.now(datetime.UTC).strftime('%Y%m%d%H%M');open('offline.json','w',encoding='utf8').write(json.dumps(off,ensure_ascii=False,separators=(',',':')))
