"""Builds topics/index.js and topics/<id>.js (run: python3 tools/topics/build.py, then python3 tools/rehash.py is NOT needed; run tools/topics/offline.py)."""
import json,re,os,sys,hashlib
HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.join(HERE,'..','..');os.chdir(ROOT)
sys.path.insert(0,HERE)
from defs import T,W
J=json.load(open('/tmp/jstruct.json'))   # node -e dump of jstruct.js
def qload(f):
    s=open(f,encoding='utf8').read();return json.loads(s[s.index('[',s.index('(')+1)+0:s.rindex(']')+1])[1] if False else json.loads(s[s.index('(')+1:s.rindex(')')])[1]
AR=qload('quran/ar_uthmani.js');UR=qload('quran/ur_junagarhi.js')
m=open('quran/meta.js',encoding='utf8').read();META=json.loads(m[m.index('(')+1:m.rindex(')')])
SUR=META['surahs'];OFF=[0]
for s in SUR: OFF.append(OFF[-1]+s[4])
assert len(AR)==6236==len(UR)==OFF[-1]
def verses(spec):
    out=[]
    for tok in spec.split():
        a,b=tok.split(':');s=int(a);x,y=(b.split('-')+[b])[:2] if '-' in b else (b,b);x=int(x);y=int(y)
        assert 1<=s<=114 and 1<=x<=y<=SUR[s-1][4],tok
        out.append((s,x,y))
    # merge touching / overlapping ranges of the same surah, keep canonical order
    out.sort();mg=[]
    for s,x,y in out:
        if mg and mg[-1][0]==s and x<=mg[-1][2]+1: mg[-1][2]=max(mg[-1][2],y)
        else: mg.append([s,x,y])
    return mg
os.makedirs('topics/w',exist_ok=True)
CI=open('coll/index.js',encoding='utf8').read();CIX={e['key']:e for e in json.loads(CI[CI.index('(')+1:CI.rindex(')')])}
GR=[('m',re.compile('موضوع|مكذوب|مختلق|لا اصل له|باطل')),('d',re.compile('ضعيف|منكر|واه|شاذ|متروك')),('s',re.compile('صحيح|متفق عليه|حسن|جيد|قوي'))]
def gcat(g):
    t=re.sub('[\u064b-\u0652\u0670]','',g);t=re.sub('[أإآ]','ا',t);best='';pos=10**9
    for c,r in GR:
        m=r.search(t)
        if m and m.start()<pos: pos=m.start();best=c
    return best
def rows_of(k):
    e=CIX[k];out=[]
    for f in e['files']['ar']:
        s=open('coll/'+f[2],encoding='utf8').read();out+=json.loads(s[s.index('[['):s.rindex(')')])
    return e,out
def printed(e):
    an=e.get('an') or {};m={}
    for k,v in an.items():
        if k!='_r': m[int(k)]=str(v)
    for a,v,c in an.get('_r',[]):
        for i in range(c): m[a+i]=str(v+i)
    return m
BK={}
for k in {b for d in W.values() for b in d}: BK[k]=rows_of(k)+(printed(CIX[k]),)
for f in os.listdir('topics/w'): os.remove('topics/w/'+f)
os.makedirs('topics',exist_ok=True)
idx=[];report=[]
for id,ur,ar,en,q,kit,kw in T:
    qs=[]
    n=0
    for s,x,y in verses(q):
        qs.append([s,x,y,[AR[OFF[s-1]+i-1] for i in range(x,y+1)],[UR[OFF[s-1]+i-1] for i in range(x,y+1)]]);n+=y-x+1
    H=[];nh=0;nb=0
    for k in J:
        babs=[]
        whole=k[0] in kit
        pos=[x for x in kw if not x.startswith('!')];neg=[x[1:] for x in kw if x.startswith('!')];rx=re.compile('|'.join(pos)) if pos else None;nx=re.compile('|'.join(neg)) if neg else None
        for b in k[2]:
            if not b[2]: continue
            if whole or (rx and rx.search(b[1]) and not (nx and nx.search(b[1]))): babs.append([b[1],len(b[2]),b[2][0]])
        if babs and (whole or rx):
            H.append([k[0],k[1],babs]);nh+=sum(x[1] for x in babs);nb+=len(babs)
    H.sort(key=lambda x:(x[0] not in kit, x[0]))
    body='TOPIC(%s,%s);'%(json.dumps(id),json.dumps({'q':qs,'h':H},ensure_ascii=False,separators=(',',':')))
    h=hashlib.md5(body.encode()).hexdigest()[:8]
    fn='topics/%s_%s.js'%(id,h)
    for f in os.listdir('topics'):
        if f.startswith(id+'_') and f!=fn.split('/')[1]: os.remove('topics/'+f)
    open(fn,'w',encoding='utf8').write(body)
    wl=[]
    for bk,secs in W.get(id,{}).items():
        e,rows,pn=BK[bk];sec={x[0]:x for x in e['sections']};M=[];D=[]
        for sn in secs:
            a,b=sec[sn][2],sec[sn][3]
            for r in (x for x in rows if a<=x[0]<=b):
                if len(r)<3 or not isinstance(r[2],str) or not r[2]: continue
                segs=[x.strip() for x in r[2].split('؛') if x.strip()];seg=next((x for x in segs if 'الألباني' in x),segs[0] if segs else '')   # Albani's judgement when the book gives it, else the first one
                c=gcat(seg)
                if c not in 'dm' or not c: continue
                t=r[1] if len(r[1])<=700 else r[1][:700].rsplit(' ',1)[0]+' …'
                it=[r[0],pn.get(r[0],str(r[0])),sn,seg,t]
                (M if c=='m' else D).append(it)
        if M or D:
            wb='TOPICW(%s,%s,%s);'%(json.dumps(id),json.dumps(bk),json.dumps({'m':M,'d':D},ensure_ascii=False,separators=(',',':')))
            wh=hashlib.md5(wb.encode()).hexdigest()[:8];wf='w/%s_%s_%s.js'%(id,bk,wh)
            open('topics/'+wf,'w',encoding='utf8').write(wb);wl.append([bk,len(M),len(D),wf,len(wb.encode())])
    idx.append([id,ur,ar,en,n,nh,nb,fn.split('/')[1],len(body.encode()),wl])
    report.append((id,n,nh,nb,[(w[0],w[1],w[2]) for w in wl],[(k[1],len(k[2])) for k in H if k[0] not in kit]))
SN=[[x[1],x[1].replace('ة','ۃ').replace('ي','ی').replace('ى','ی'),x[0]] for x in SUR]
ib='TOPICS(%s,%s);'%(json.dumps(idx,ensure_ascii=False,separators=(',',':')),json.dumps(SN,ensure_ascii=False,separators=(',',':')))
ih='index_%s.js'%hashlib.md5(ib.encode()).hexdigest()[:8]
for f in os.listdir('topics'):
    if f.startswith('index'): os.remove('topics/'+f)
open('topics/'+ih,'w',encoding='utf8').write(ib)
h=open('index.html',encoding='utf8').read();h=re.sub(r"topics/index_[0-9a-f]{8}\.js","topics/"+ih,h);open('index.html','w',encoding='utf8').write(h)
for r in report:print(r[0],'ayat',r[1],'hadith',r[2],'babs',r[3],'extra kitabs',r[4])
