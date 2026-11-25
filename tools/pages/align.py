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
    for zf in sorted(glob.glob('/mnt/user-data/uploads/*.zip')+glob.glob('/mnt/user-data/attachments/*/*.zip')):   # epubs delivered inside a zip (e.g. New_folder_5.zip)
        if 'Readalong' in zf or 'Jami_Kamil' in zf: continue
        try: z=zipfile.ZipFile(zf)
        except Exception: continue
        for n in z.namelist():
            m=re.search(r'(?:^|/)(\d+)\.epub$',n)
            if m: d.setdefault(m.group(1),[]).append((zf,n))
    return d
def pages(f):
    if isinstance(f,tuple):
        import io;f=io.BytesIO(zipfile.ZipFile(f[0]).read(f[1]))
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

def align2(key,f):
    """fallback for books whose EPUB is another edition (no editor's introduction, headings differ): anchors = rows whose first 30 letters occur in the EPUB
    (every occurrence is a candidate); the longest non-decreasing chain of pages is kept (one false hit can never carry the cursor away); rows between two
    anchors are searched only inside the pages of that gap (key of >=6 letters, forward); rows not found get no label."""
    import bisect
    P=pages(f);R=list(rows(key));NR=[N(r[1]) for r in R];K=[x[:30] for x in NR]
    big='|'.join(p[2] for p in P);st=[];o=0
    for p in P: st.append(o);o+=len(p[2])+1
    cand=[]
    OFF=(0,30,60,100)   # a heading/footnote mark in front of the text: try later parts of the row as well
    huge=len(big)>20000000   # very large book: search only a window ahead of the last hit (a global find per row would take hours)
    last=0
    for x in NR:
        c=[]
        for o_ in OFF:
            k=x[o_:o_+30]
            if len(k)<20:break
            if huge:
                i=big.find(k,last,last+4000000)
                if i>=0:c.append(bisect.bisect_right(st,i)-1);last=i
            else:
                i=big.find(k)
                while i>=0 and len(c)<8:
                    c.append(bisect.bisect_right(st,i)-1);i=big.find(k,i+1)
            if c:break
        cand.append(c)
    tails=[];tid=[];prev={}   # LIS over (row,page) with non-decreasing pages
    for n,c in enumerate(cand):
        for pg in sorted(set(c),reverse=True):
            j=bisect.bisect_right(tails,pg)
            prev[(n,pg)]=tid[j-1] if j>0 else None
            if j==len(tails):tails.append(pg);tid.append((n,pg))
            else:tails[j]=pg;tid[j]=(n,pg)
    anc={};cur=tid[-1] if tid else None
    while cur is not None:anc[cur[0]]=cur[1];cur=prev[cur]
    out=[None]*len(R);lo=0;miss=0;ks=sorted(anc)
    def near(k,a,b):
        if len(k)<6:return None
        for i in range(a,min(b+1,a+60,len(P))):   # a row lies close to its neighbours: 60 pages are enough (and keep very large books fast)
            if k in P[i][2]:return i
        return None
    pa=0;n=0
    for ai in range(len(ks)+1):
        end=ks[ai] if ai<len(ks) else len(R);hi=anc[ks[ai]] if ai<len(ks) else len(P)-1
        for m in range(n,end):
            r=near(K[m],pa,hi)
            if r is None:r=near(K[m][:14],pa,hi)
            if r is None:
                for o_ in OFF[1:]:
                    kk=NR[m][o_:o_+30]
                    if len(kk)<20:break
                    r=near(kk,pa,hi)
                    if r is not None:break
            if r is not None:out[m]=(P[r][0],P[r][1]);pa=r
        if ai<len(ks):out[ks[ai]]=(P[hi][0],P[hi][1]);pa=hi;n=ks[ai]+1
    last=None;i=0   # an unmatched row lying between two rows on the SAME page is certainly on that page
    while i<len(out):
        if out[i] is None:
            j=i
            while j<len(out) and out[j] is None:j+=1
            if i>0 and j<len(out) and out[i-1]==out[j]:
                for m in range(i,j):out[m]=out[j]
            i=j
        else:i+=1
    miss=sum(1 for o_,x in zip(out,NR) if o_ is None and len(x)>=12)   # marker rows («~٨١٦-١», «٢») are not counted
    return R,P,out,miss

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
