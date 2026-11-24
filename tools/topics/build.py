"""Builds topics/index_<h>.js, topics/<id>_<h>.js (verses + Jami chapters with the hadith numbers) and topics/w/<id>_<book>_<h>.js (da'if / mawdu' hadith).
Run: node -e "global.TURATH_JSTRUCT=x=>require('fs').writeFileSync('/tmp/jstruct.json',JSON.stringify(x));require('./jstruct.js')" ; python3 tools/topics/build.py ; python3 tools/topics/offline.py"""
import json,re,os,sys,hashlib
HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.join(HERE,'..','..');os.chdir(ROOT)
sys.path.insert(0,HERE)
from defs import T,W,WX
J=json.load(open('/tmp/jstruct.json'))
JK=json.load(open(os.path.join(HERE,'jamik_kitabs.json'),encoding='utf8'))  # the 67 kitabs / 6713 babs of the full Jami (api toc?book=jamik)
TOCMAP={}
for _k in JK:
    for _ci,_c in enumerate(_k[2]):
        if _c[2]: TOCMAP[_c[2][0]]=(_k[0],_ci)
def qload(f):
    s=open(f,encoding='utf8').read();return json.loads(s[s.index('(')+1:s.rindex(')')])[1]
AR=qload('quran/ar_uthmani.js');UR=qload('quran/ur_junagarhi.js')
m=open('quran/meta.js',encoding='utf8').read();META=json.loads(m[m.index('(')+1:m.rindex(')')])
SUR=META['surahs'];OFF=[0]
for s_ in SUR: OFF.append(OFF[-1]+s_[4])
assert len(AR)==6236==len(UR)==OFF[-1]
def verses(spec):
    out=[]
    for tok in spec.split():
        a,b=tok.split(':');s=int(a);x,y=(b.split('-') if '-' in b else (b,b));x=int(x);y=int(y)
        assert 1<=s<=114 and 1<=x<=y<=SUR[s-1][4],tok
        out.append((s,x,y))
    out.sort();mg=[]
    for s,x,y in out:
        if mg and mg[-1][0]==s and x<=mg[-1][2]+1: mg[-1][2]=max(mg[-1][2],y)
        else: mg.append([s,x,y])
    return mg
CI=open('coll/index.js',encoding='utf8').read();CIX={e['key']:e for e in json.loads(CI[CI.index('(')+1:CI.rindex(')')])}
GR=[('m',re.compile('موضوع|مكذوب|مختلق|لا اصل له|باطل')),('d',re.compile('ضعيف|منكر|واه|شاذ|متروك')),('s',re.compile('صحيح|متفق عليه|حسن|جيد|قوي'))]
HAR=re.compile('[ً-ْٰـ]')
def gcat(g):
    t=re.sub('[ً-ْٰ]','',g);t=re.sub('[أإآ]','ا',t);best='';pos=10**9
    for c,r in GR:
        mm=r.search(t)
        if mm and mm.start()<pos: pos=mm.start();best=c
    return best
def rows_of(k):
    e=CIX[k];out=[]
    for f in e['files']['ar']:
        s=open('coll/'+f[2],encoding='utf8').read();out+=json.loads(s[s.index('[['):s.rindex(')')])
    return e,out
def printed(e):
    an=e.get('an') or {};mp={}
    for k,v in an.items():
        if k!='_r': mp[int(k)]=str(v)
    for a,v,c in an.get('_r',[]):
        for i in range(c): mp[a+i]=str(v+i)
    return mp
import glob
DR={}
for _f in sorted(glob.glob('data/dr*.js')):
    _s=open(_f,encoding='utf8').read();DR.update(json.loads(_s[_s.index('(')+1:_s.rindex(')')]))
DRM=re.compile(r'حديث[اً]? (?:موضوع|باطل|مكذوب)|هذا (?:الحديث )?(?:موضوع|باطل|مكذوب)|(?:فهو|وهو) (?:موضوع|باطل)|موضوع(?:ة)? على|حديث[اً]? لا أصل له|فلا أصل له')
DRD=re.compile(r'حديث[اً]? (?:ضعيف|منكر|واه)|هذا (?:الحديث )?(?:ضعيف|منكر)|(?:إسناده|اسناده|فإسناده) (?:ضعيف|واه)|(?:فهو|وهو) (?:ضعيف|منكر) |ضعيف جد[اً] ')
DRX=re.compile(r'ليس بضعيف|غير ضعيف|ليس بمنكر|ليس بموضوع|ليس موضوع|ليس بباطل|لا ضعف|لا نكارة|المجروحين|منكر الحديث|رمي بالكذب|الميزان|التقريب|الجرح|تهذيب|الكامل لابن عدي')
def drcut(p,pos):
    if len(p)<=900: return p
    a=max(0,pos-350);z=min(len(p),a+900)
    if a: a=p.find(' ',a)+1 or a
    t=p[a:z]
    if z<len(p): t=t.rsplit(' ',1)[0]+' …'
    return ('… ' if a else '')+t
def dirasa(ids):
    M=[];D=[];seen=set()
    for i in ids:
        for p in DR.get(str(i),[]):
            if p in seen or DRX.search(p): continue
            m1=DRM.search(p);m2=DRD.search(p)
            if not (m1 or m2): continue
            seen.add(p)
            if m1 and (not m2 or m1.start()<=m2.start()): M.append([i,drcut(p,m1.start())])
            else: D.append([i,drcut(p,m2.start())])
    return M,D
BK={}
for k in {b for d in W.values() for b in d}: BK[k]=rows_of(k)+(printed(CIX[k]),)
os.makedirs('topics/w',exist_ok=True)
if os.path.isdir('topics/r'):
    for f in os.listdir('topics/r'): os.remove('topics/r/'+f)
for f in os.listdir('topics/w'): os.remove('topics/w/'+f)
idx=[];report=[]
for t in T:
    id,ur,ar,en,q,kit,kw=t[:7];only=t[7] if len(t)>7 else None;extra=t[8] if len(t)>8 else []
    kw=list(kw)+list(extra)
    qs=[];n=0
    for s,x,y in verses(q):
        qs.append([s,x,y,[AR[OFF[s-1]+i-1] for i in range(x,y+1)],[UR[OFF[s-1]+i-1] for i in range(x,y+1)]]);n+=y-x+1
    pos=[x for x in kw if not x.startswith('!')];neg=[x[1:] for x in kw if x.startswith('!')]
    rx=re.compile('|'.join(pos)) if pos else None;nx=re.compile('|'.join(neg)) if neg else None
    H=[];nh=0;nb=0
    for k in J:
        whole=k[0] in kit
        if not whole and only is not None and k[0] not in only: continue
        babs=[]
        for b in k[2]:
            if not b[2]: continue
            if whole or (rx and rx.search(b[1]) and not (nx and nx.search(b[1]))): babs.append([b[1],b[2]])
        if babs: H.append([k[0],k[1],babs])
    # regroup under the 67 kitabs of the full Jami (own bab titles + the Jami group heading «جموع …»); the topic's own kitabs first
    prim=set();flat=[]
    for k in H:
        for b in k[2]:
            kn,ci=TOCMAP[b[1][0]];flat.append((kn,ci))
            if k[0] in kit: prim.add(kn)
    byk={}
    for kn,ci in flat: byk.setdefault(kn,[]).append(ci)
    H=[]
    for kn in sorted(byk,key=lambda x:(x not in prim,x)):
        K=JK[kn-1];H.append([kn,K[1],[[K[2][ci][0],K[2][ci][2],0,K[2][ci][1]] for ci in sorted(byk[kn])]])
    cur=1
    for k in H:
        for b in k[2]: b[2]=cur;cur+=len(b[1]);nb+=1
    nh=cur-1
    body='TOPIC(%s,%s);'%(json.dumps(id),json.dumps({'q':qs,'h':H},ensure_ascii=False,separators=(',',':')))
    fn='%s_%s.js'%(id,hashlib.md5(body.encode()).hexdigest()[:8])
    open('topics/'+fn,'w',encoding='utf8').write(body)
    wl=[];wx=WX.get(id);wneg=bool(wx and wx.startswith('!'));wre=re.compile(wx[1:] if wneg else wx) if wx else None
    for bk,secs in W.get(id,{}).items():
        e,rows,pn=BK[bk];sec={x[0]:x for x in e['sections']};M=[];D=[]
        for sn in secs:
            a,b=sec[sn][2],sec[sn][3]
            for r in (x for x in rows if a<=x[0]<=b):
                if len(r)<3 or not isinstance(r[2],str) or not r[2]: continue
                segs=[x.strip() for x in r[2].split('؛') if x.strip()];seg=next((x for x in segs if 'الألباني' in x),segs[0] if segs else '')
                c=gcat(seg)
                if c not in ('d','m'): continue
                if wre:
                    tx=HAR.sub('',r[1]);hit=bool(wre.search(tx))
                    if hit==wneg: continue
                tt=r[1] if len(r[1])<=700 else r[1][:700].rsplit(' ',1)[0]+' …'
                (M if c=='m' else D).append([r[0],pn.get(r[0],str(r[0])),sn,seg,tt])
        if M or D:
            wb='TOPICW(%s,%s,%s);'%(json.dumps(id),json.dumps(bk),json.dumps({'m':M,'d':D},ensure_ascii=False,separators=(',',':')))
            wf='w/%s_%s_%s.js'%(id,bk,hashlib.md5(wb.encode()).hexdigest()[:8]);open('topics/'+wf,'w',encoding='utf8').write(wb);wl.append([bk,len(M),len(D),wf,len(wb.encode())])
    ids=[i for k in H for bb in k[2] for i in bb[1]];dm,dd=dirasa(ids);dri=None
    if dm or dd:
        rb='TOPICR(%s,%s);'%(json.dumps(id),json.dumps({'m':dm,'d':dd},ensure_ascii=False,separators=(',',':')))
        rf='r/%s_%s.js'%(id,hashlib.md5(rb.encode()).hexdigest()[:8]);os.makedirs('topics/r',exist_ok=True);open('topics/'+rf,'w',encoding='utf8').write(rb);dri=[rf,len(rb.encode()),len(dm),len(dd)]
    idx.append([id,ur,ar,en,n,nh,nb,fn,len(body.encode()),wl,dri])
    report.append((id,n,nh,nb,[(w[0],w[1],w[2]) for w in wl],[(k[1][:22],sum(len(b[1]) for b in k[2])) for k in H if k[0] not in kit]))
for f in os.listdir('topics'):
    if f.endswith('.js') and not any(f==i[7] for i in idx) and not f.startswith('index'): os.remove('topics/'+f)
SN=[[x[1],x[1].replace('ة','ۃ').replace('ي','ی').replace('ى','ی'),x[0],x[4]] for x in SUR]
ED=[[e['key'],e['lang'],e['ur'],e['en']] for e in META['editions'] if not e['key'].startswith('ar_')]
tf=open('quran/tafsir/index.js',encoding='utf8').read();TL=json.loads(tf[tf.index('(')+1:tf.rindex(')')])
TF=[[x['key'],x['lang'],x['ur'],x['en']] for x in TL['list']]
ib='TOPICS(%s,%s,%s,%s);'%tuple(json.dumps(v,ensure_ascii=False,separators=(',',':')) for v in (idx,SN,ED,TF))
ih='index_%s.js'%hashlib.md5(ib.encode()).hexdigest()[:8]
for f in os.listdir('topics'):
    if f.startswith('index'): os.remove('topics/'+f)
open('topics/'+ih,'w',encoding='utf8').write(ib)
h=open('index.html',encoding='utf8').read();h=re.sub(r"topics/index_[0-9a-f]{8}\.js","topics/"+ih,h);open('index.html','w',encoding='utf8').write(h)
for r in report:print(r[0],'ayat',r[1],'hadith',r[2],'babs',r[3],'weak',r[4],'extra',r[5])
