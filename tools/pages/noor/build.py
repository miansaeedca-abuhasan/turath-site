#!/usr/bin/env python3
"""Printed volume / page of Tafsir Noor al-Huda (`tafsirnoor`, owner 26-11-2026).
Source: the contents files «Fehrist*.inp» (InPage = OLE) of the 15 volumes inside the owner's Tafseer_Final.daa; every line «B<TAB>heading<TAB>page».
Every site row starts with its heading (`§heading`), so the rows of each para are aligned with the contents entries of that para (monotone alignment on the letters
of the headings); a row that is not matched gets NO label (never a guess). Checked 26-11-2026 against the owner's page JSON of vols 1-4 (PDF page = printed page + 1 for 99 % of the rows).
usage: python3 tools/pages/noor/build.py <dir made by daa.py>   (run from the repo root), then python3 tools/rehash.py and bump sw.js"""
import sys,re,glob,json,os,subprocess,difflib,hashlib
D=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,D);sys.path.insert(0,os.path.join(D,'..'))
from ole import OLE
from align import write
root=sys.argv[1]
def text(path):
    o=OLE(path);st,sz=o.streams()['/InPage300'];return o.read(st,sz).decode('utf-16-le','ignore')
ent={}
for v in range(1,16):
    fs=glob.glob('%s/x/Tafseer Final/Vol %d/Fehrist*.inp'%(root,v));u=text(fs[0])
    i=u.find('￿￿....')
    if i<0:i=u.find('￿￿')
    E=[];para=None
    for l in u[i:].split('\r'):
        m=re.match(r'^پارہ\s*\((\d+)\)',l)
        if m:para=int(m.group(1));continue
        m=re.match(r'^([A-Za-z0-9]{0,3})\t(.+?)\t\s*(\d{1,4})\s*$',l)
        if m:E.append([para,m.group(2).strip(),int(m.group(3))])
    for e in E:
        if e[0] is None:e[0]=2*v-1               # entries that stand before the first «پارہ (n)» line of a volume belong to its first para
        if v==10 and e[0]==21:e[0]=20            # vol 10 ends with the first pages of para 21 (the site keeps them in para 20)
    pg=[e[2] for e in E]
    for i,e in enumerate(E):                     # typing slips in the contents (1553 for 155, 3888 for 388): drop one digit so that it fits between the neighbours
        prev=max(pg[:i]) if i else 0;nxt=[x for x in pg[i+1:i+6] if x<10000]
        if i and nxt and e[2]>min(nxt)+40:
            c=str(e[2]);fx=0
            for k in range(len(c)):
                t=int(c[:k]+c[k+1:] or 0)
                if prev<=t<=min(nxt):fx=max(fx,t)
            if fx:print('fixed',e[1][:30],e[2],'->',fx);e[2]=fx;pg[i]=fx
    ent[v]=E
json.dump(ent,open(D+'/fehrist.json','w'),ensure_ascii=False,separators=(',',':'))
js=r'''global.COLLS=a=>{global.REG=a};require('./coll/index.js');
const e=REG.find(x=>x.key=='tafsirnoor');global.R=[];global.COLLDATA=(k,l,r)=>{R.push(...r)};
e.files.ur.forEach(f=>require('./coll/'+f[2]));console.log(JSON.stringify({secs:e.sections,rows:R.map(r=>[r[0],r[1].split('\n')[0].slice(1)])}));'''
d=json.loads(subprocess.check_output(['node','-e',js]));rows=d['rows'];secs=d['secs']
def norm(s):
    s=re.sub(r'[ً-ٰٟۖ-ۭ‌-‏\xa0]','',s)
    for a,b in (('ي','ی'),('ك','ک'),('ى','ی'),('ۂ','ہ'),('ۃ','ہ'),('ھ','ہ'),('ە','ہ'),('ے','ی'),('ئ','ی'),('ؤ','و'),('أ','ا'),('إ','ا'),('آ','ا'),('ٰ','')):s=s.replace(a,b)
    return re.sub(r'[^ء-يٱ-ۓ]','',s)
def sim(a,b):
    if not a or not b:return 0
    return 1 if a==b else difflib.SequenceMatcher(None,a,b).ratio()
def align(R,Ep):
    A=[norm(r[1]) for r in R];B=[norm(e[1]) for e in Ep];n,m=len(A),len(B)
    S=[[0]*(m+1) for _ in range(n+1)];T=[[0]*(m+1) for _ in range(n+1)]
    for i in range(1,n+1):S[i][0]=-0.3*i;T[i][0]=1
    for j in range(1,m+1):S[0][j]=-0.3*j;T[0][j]=2
    for i in range(1,n+1):
        for j in range(1,m+1):
            q=sim(A[i-1],B[j-1]);best=S[i-1][j-1]+(q*2-1 if q>=0.55 else -1);t=0
            if S[i-1][j]-0.3>best:best=S[i-1][j]-0.3;t=1
            if S[i][j-1]-0.3>best:best=S[i][j-1]-0.3;t=2
            S[i][j]=best;T[i][j]=t
    i,j=n,m;out={}
    while i>0 or j>0:
        t=T[i][j] if i>0 and j>0 else (1 if i>0 else 2)
        if t==0:
            if sim(A[i-1],B[j-1])>=0.55:out[i-1]=j-1
            i-=1;j-=1
        elif t==1:i-=1
        else:j-=1
    return out
R_=[];OUT=[];tot=0;lab=0
for v in range(1,16):
    for p in (2*v-1,2*v):
        a,b=secs[p-1][2],secs[p-1][3];R=[r for r in rows if a<=r[0]<=b];Ep=[e for e in ent[v] if e[0]==p];al=align(R,Ep)
        run=0
        for i,r in enumerate(R):
            o=None
            if i in al:
                pg=Ep[al[i]][2]
                if pg>=run-1:o=(v,pg);run=max(run,pg)       # a page running backwards = wrong match: no label
            R_.append(r);OUT.append(o);tot+=1;lab+=o is not None
        print('vol',v,'para',p,'rows',len(R),'labelled',sum(1 for i in range(len(R)) if OUT[-len(R)+i]))
print('rows',tot,'labelled',lab)
fn,sz=write('tafsirnoor',R_,OUT)
idx=open('coll/index.js',encoding='utf8').read();j=json.loads(idx[idx.index('(')+1:idx.rindex(')')])
for x in j:
    if x['key']=='tafsirnoor':x['pg']=fn
open('coll/index.js','w',encoding='utf8').write('COLLS('+json.dumps(j,ensure_ascii=False,separators=(',',':'))+')')
o=json.load(open('offline.json',encoding='utf8'))
g=[g for g in o['groups'] if g['id']=='c_tafsirnoor'][0];g['f']=[f for f in g['f'] if '/pg/' not in f[0]];p='coll/pg/'+fn
g['f'].append([p,hashlib.md5(open(p,'rb').read()).hexdigest()[:10],p,sz]);g['b']=sum(f[3] for f in g['f'])
open('offline.json','w',encoding='utf8').write(json.dumps(o,ensure_ascii=False,separators=(',',':')))
print(fn,sz)
