#!/usr/bin/env python3
"""Musnad al-Humaydi (Urdu, key `humaydiur`): second translator (Maulana Abu Saeed Roshan Deen Bashir, Maktaba Rahmaniya) as tab `u2`
+ the translator's short introduction of every narrator (footnote of the printed page) shown under the Sahabi's name, before the first hadith.
usage: python3 tools/humaydi2/build.py <Musnad_Humaidi_Mukammal.json>
 - hadith are aligned to the site rows by their Arabic text (monotone alignment); the 3 hadith that this translator numbers separately
   (his 436, 636, 1077) are written into the neighbouring row (436 before 436م, 636 / 1077 after the previous one)
 - row[3].u2 = his Urdu (+ «تخریج: …» line when he prints one); registry `trn2`; narrator introductions -> coll/humaydiur_nt_1_<md5>.js (COLLNT, `ntx`)
 - Urdu quote marks of the text: ’’ … ‘‘ ; the stray «(۲) » in front of one introduction is dropped"""
import json,re,sys,os,glob,hashlib,subprocess
import numpy as np
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
KEY='humaydiur'
src=json.load(open(sys.argv[1],encoding='utf8'))
def norm(s):
    s=re.sub(r'[ً-ٰٟـۖ-ۭ]','',s)
    s=s.replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ة','ه').replace('ى','ي').replace('ی','ي').replace('ک','ك')
    return ' '.join(re.findall(r'[ء-ي]+',s))
def load(lang):
    out=subprocess.run(['node','-e','''const fs=require('fs'),vm=require('vm');let reg;vm.runInNewContext(fs.readFileSync("coll/index.js","utf8"),{COLLS:a=>{reg=a}});
const e=reg.find(x=>x.key==="%s");let rows=[];for(const [a,b,f] of e.files["%s"])vm.runInNewContext(fs.readFileSync("coll/"+f,"utf8"),{COLLDATA:(k,l,r)=>rows.push(...r)});
console.log(JSON.stringify({rows,sections:e.sections}))'''%(KEY,lang)],capture_output=True,text=True,check=True).stdout
    return json.loads(out)
A=load('ar');U=load('ur');secs=A['sections']
hs=[(mi,hi,h) for mi,x in enumerate(src['musnads']) for hi,h in enumerate(x['hadiths'])]
def sh(t):
    w=norm(t).split();return set(zip(w,w[1:],w[2:])) if len(w)>2 else set(w)
S=[sh(r[1]) for r in A['rows']];J=[sh(h['arabic']) for _,_,h in hs];n,m=len(S),len(J)
M=np.zeros((n,m),dtype=np.float32);inv={}
for j,s in enumerate(J):
    for g in s:inv.setdefault(g,[]).append(j)
for i,s in enumerate(S):
    cnt={}
    for g in s:
        for j in inv.get(g,()):cnt[j]=cnt.get(j,0)+1
    for j,c in cnt.items():M[i,j]=c/(len(s)+len(J[j])-c)
dp=np.zeros((n+1,m+1),dtype=np.float32);bt=np.zeros((n+1,m+1),dtype=np.int8)
for i in range(1,n+1):
    for j in range(1,m+1):
        b=dp[i-1][j-1]+M[i-1,j-1];k=0
        if dp[i-1][j]>b:b=dp[i-1][j];k=1
        if dp[i][j-1]>b:b=dp[i][j-1];k=2
        dp[i,j]=b;bt[i,j]=k
i,j=n,m;pj={}
while i>0 and j>0:
    k=bt[i,j]
    if k==0:pj[j-1]=i-1;i-=1;j-=1
    elif k==1:i-=1
    else:j-=1
assert len(pj)==n==len(set(pj.values())),'every site row must be matched'
extra=[j for j in range(m) if j not in pj]
NUM=lambda j:hs[j][2]['number']
assert [NUM(j) for j in extra]==['۴۳۶','۶۳۶','۱۰۷۷'],[NUM(j) for j in extra]
rows_of={i:[j] for j,i in pj.items()}
for j in extra:
    if NUM(j)=='۴۳۶':rows_of[pj[j+1]].insert(0,j)      # printed before 436م, same row
    else:rows_of[pj[j-1]].append(j)                   # a continuation of the previous hadith
Q=lambda t:t
def q(t):
    t=t.replace('”','’’').replace('“','‘‘')
    out=[];o=True
    for ch in t:
        if ch=='"':out.append('’’' if o else '‘‘');o=not o
        else:out.append(ch)
    return ''.join(out)
def clean(t):return re.sub(r'[ \t]+\n','\n',q(t.strip()))
def u2_of(i):
    ps=[]
    for j in rows_of[i]:
        h=hs[j][2];ps.append(clean(h['urdu']))
        if h['takhrij'].strip():ps.append('تخریج: '+clean(h['takhrij']))
    return '\n'.join(ps)
# narrator introductions -> section of the first hadith of the musnad
def sec_of(row):
    return next(s[0] for s in secs if s[2]<=row+1<=s[3])
first={}
for j,(mi,hi,h) in enumerate(hs):first.setdefault(mi,j)
NT={};who='مولانا ابو سعید روشن دین بشیر'
for mi,x in enumerate(src['musnads']):
    bios=[h['sharh'] for h in x['hadiths'] if h['sharh'].strip()]
    if not bios:continue
    assert len(bios)==1
    s=sec_of(pj[first[mi]]);assert s not in NT,('two introductions in one section',s)
    NT[str(s)]=['§تعارف راوی حدیث ('+who+')',clean(re.sub(r'^\s*\([۰-۹]+\)\s*','',bios[0]))]
# rows
new=[]
for i,r in enumerate(U['rows']):
    r=list(r)
    while len(r)<3:r.append('')
    o=dict(r[3]) if len(r)>3 and isinstance(r[3],dict) else {}
    o['u2']=u2_of(i);r=r[:3]+[o]
    new.append(r)
for f in glob.glob('coll/%s_ur_*.js'%KEY)+glob.glob('coll/%s_nt_*.js'%KEY):os.remove(f)
files=[];cur=[];size=0
def flush():
    global cur,size
    if not cur:return
    body='COLLDATA("%s","ur",%s)'%(KEY,json.dumps(cur,ensure_ascii=False,separators=(',',':')))
    h=hashlib.md5(body.encode()).hexdigest()[:6];name='%s_ur_%d_%s.js'%(KEY,len(files)+1,h)
    open('coll/'+name,'w',encoding='utf8').write(body)
    files.append([cur[0][0],cur[-1][0],name,len(body.encode()),hashlib.md5(body.encode()).hexdigest()[:10]]);cur=[];size=0
for r in new:
    cur.append(r);size+=len(json.dumps(r,ensure_ascii=False))
    if size>180000:flush()
flush()
body='COLLNT("%s",%s)'%(KEY,json.dumps(NT,ensure_ascii=False,separators=(',',':')))
h=hashlib.md5(body.encode()).hexdigest()[:6];ntn='%s_nt_1_%s.js'%(KEY,h);open('coll/'+ntn,'w',encoding='utf8').write(body)
s=open('coll/index.js',encoding='utf8').read()
reg=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
e=[x for x in reg if x['key']==KEY][0]
e['files']['ur']=[[a,b,nm] for a,b,nm,_,_ in files]
e['trn2']={'ur':who,'en':'Maulana Abu Saeed Roshan Deen Bashir'}
e['ntx']=[[1,len(secs),ntn]]
open('coll/index.js','w',encoding='utf8').write('COLLS('+json.dumps(reg,ensure_ascii=False,separators=(',',':'))+')')
o=json.load(open('offline.json'));g=[x for x in o['groups'] if x['id']=='c_'+KEY][0]
g['f']=[x for x in g['f'] if '_ur_' not in x[0] and '_nt_' not in x[0]]
g['f']+= [['coll/'+nm,hh,'coll/'+nm,sz] for a,b,nm,sz,hh in files]
nb=body.encode();g['f'].append(['coll/'+ntn,hashlib.md5(nb).hexdigest()[:10],'coll/'+ntn,len(nb)])
g['b']=sum(x[3] for x in g['f'])
json.dump(o,open('offline.json','w'),ensure_ascii=False,separators=(',',':'))
print('rows',len(new),'files',len(files),sum(f[3] for f in files)//1024,'KB','intros',len(NT),'merged',[(NUM(j),) for j in extra])
