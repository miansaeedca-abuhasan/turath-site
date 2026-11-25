#!/usr/bin/env python3
"""Printed volume/page of every row of an Arabic library book (sh<id>), taken from the owner's EPUB
(each page file carries «الجزء: N - الصفحة: M»).  align.py <id> [--write]  -> stats; --write makes coll/pg/sh<id>.js
Row start text (first letters, diacritics ignored) is searched forward from the page of the previous row."""
import zipfile,re,html,json,glob,os,sys
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
N=lambda t:re.sub(r'[^ء-ي]','',re.sub(r'[ً-ْٰـ]','',t)).replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ى','ي').replace('ة','ه')
def epubs():
    d={}
    for f in sorted(glob.glob('/mnt/user-data/uploads/*.epub')+glob.glob('/mnt/user-data/attachments/*/*.epub')):
        m=re.search(r'(?:^|-)(\d+)\.epub$',os.path.basename(f))
        if m: d.setdefault(m.group(1),[]).append(f)
    return d
def pages(f):
    z=zipfile.ZipFile(f);P=[]
    for n in z.namelist():
        if not n.endswith('.xhtml'):continue
        t=z.read(n).decode('utf8','ignore');m=list(re.finditer(r'الجزء:\s*(\d+)\s*-\s*الصفحة:\s*(\d+)',t)) or list(re.finditer(r'(?:^|[^ا-ي])()الصفحة:\s*(\d+)',t));m=m[-1] if m else None
        if m:P.append((int(m.group(1) or (re.search(r'page(\d+)_',n) or [0,1])[1]),int(m.group(2)),N(html.unescape(re.sub(r'<[^>]+>',' ',t[t.find('<body'):])))))
    P.sort(key=lambda x:(x[0],x[1]));return P
def rows(key):
    for f in sorted(glob.glob('coll/%s_ar_*.js'%key),key=lambda s:int(re.search(r'_ar_(\d+)_',s).group(1))):
        t=open(f,encoding='utf8').read()
        for r in json.loads(t[t.index('",[')+2:t.rindex(')')]): yield r
def align(key,f):
    """sequential forward search (window 40 pages, then 6 for a short key); rows that do not match inherit the page of the previous row;
    after 25 rows in a row without a match, re-synchronise: search the whole rest of the book for the key and accept a hit only when the next 2 row keys
    are found within 8 pages of it (so one false hit can never carry the cursor away)"""
    P=pages(f);R=list(rows(key));K=[N(r[1])[:30] for r in R];out=[];cur=0;miss=0;run=0
    def near(k,lo,W):
        if len(k)<6:return None
        for i in range(lo,min(lo+W,len(P))):
            if k in P[i][2]:return i
        return None
    for n,r in enumerate(R):
        k=K[n];f_=near(k,cur,40)
        if f_ is None: f_=near(k[:14],cur,6)
        if f_ is None and run>=25 and len(k)>=20:
            for i in range(cur,len(P)):
                if k in P[i][2] and all(len(K[m])<20 or near(K[m],i,8) is not None for m in range(n+1,min(n+3,len(R)))): f_=i;break
        if f_ is None: miss+=1;run+=1;out.append(None);continue   # no guess: a row that cannot be found gets no label
        run=0;cur=f_;out.append((P[f_][0],P[f_][1]))
    return R,P,out,miss
if __name__=='__main__':
    key='sh'+sys.argv[1];E=epubs()[sys.argv[1]]
    R,P,out,miss=align(key,E[-1]);print(key,len(R),'rows',len(P),'pages','miss',miss,'juz',sorted(set(p[0] for p in P))[:5],'..',max(p[0] for p in P))

def write(key,R,out):
    """coll/pg/<key>_<md5-6>.js = COLLPG(key,{i:[firstId,count,…],v:'delta,delta,…',m:multivolume})  (v = juz*100000+page, delta-coded base 36, '' = 0)"""
    import hashlib
    ids=[r[0] for r in R];runs=[];s=ids[0];n=1
    for a,b in zip(ids,ids[1:]):
        if b==a+1:n+=1
        else:runs+=[s,n];s=b;n=1
    runs+=[s,n]
    prev=0;tok=[]
    def b36(x):
        a=abs(x);d='';
        while True:
            d='0123456789abcdefghijklmnopqrstuvwxyz'[a%36]+d;a//=36
            if not a:break
        return ('-' if x<0 else '')+d
    for o_ in out:
        if o_ is None: tok.append('x');continue
        v=o_[0]*100000+o_[1];d=v-prev;prev=v;tok.append('' if d==0 else b36(d))
    body=json.dumps({'i':runs,'v':','.join(tok),'m':1 if max(o[0] for o in out if o)>1 else 0},separators=(',',':'))
    data=('COLLPG("%s",%s);'%(key,body)).encode();h=hashlib.md5(data).hexdigest()[:6]
    os.makedirs('coll/pg',exist_ok=True)
    for o in glob.glob('coll/pg/%s_*.js'%key):os.remove(o)
    fn='%s_%s.js'%(key,h);open('coll/pg/'+fn,'wb').write(data);return fn,len(data)
