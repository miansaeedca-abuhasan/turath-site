# page lookup in the Siyar epub: page_of(arabic_text) -> (juz, page)
import glob,re,os,pickle,html
EP=os.environ.get('SIYAR_EPUB_DIR','/tmp/claude-0/-home-claude/c78c1915-dfa8-5395-875d-805b90bb4e15/scratchpad/e/OEBPS/text')
CACHE=os.path.join(os.path.dirname(EP),'pages.pkl')
N=lambda t:re.sub(r'[^ء-ي]','',re.sub(r'[ً-ْٰـ]','',t)).replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ى','ي')
def load():
    if os.path.exists(CACHE): return pickle.load(open(CACHE,'rb'))
    P=[]
    for f in sorted(glob.glob(EP+'/page_*.xhtml')):
        t=open(f,encoding='utf8').read()
        m=re.search(r'الجزء:\s*(\d+)\s*-\s*الصفحة:\s*(\d+)',t)
        b=re.sub(r'<[^>]+>',' ',t[t.find('<body'):]);b=html.unescape(b)
        P.append((int(m.group(1)),int(m.group(2)),N(b)) if m else None)
    P=sorted([p for p in P if p],key=lambda x:(x[0],x[1]))
    pickle.dump(P,open(CACHE,'wb'));return P
def page_of(txt,n=45):
    P=load();k=N(txt)[:n]
    r=[(p[0],p[1]) for p in P if k in p[2]]
    return r
if __name__=='__main__':
    import sys
    print(page_of(sys.argv[1]))

def locate(segs_,n=40):
    """pages (juz,page) of every sentence of a row, scanning forward from the page where the row starts"""
    P=load();k0=N(segs_[0])[:n];cur=None
    for i,p in enumerate(P):
        if k0 in p[2]: cur=i;break
    if cur is None: raise SystemExit('row start not found')
    out=[]
    for s in segs_:
        k=N(s)[:n];f=None
        for i in range(cur,min(cur+60,len(P))):
            if k in P[i][2]: f=i;break
        if f is None: f=cur   # sentence cut by a page break or footnote: keep the cursor page
        cur=f;out.append((P[f][0],P[f][1]))
    return out
