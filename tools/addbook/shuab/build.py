#!/usr/bin/env python3
"""Shu'ab al-Iman (Urdu) `shuabimanur` — owner's 7 JSON files `*ShuabUlImanVol{1..7}_Mukammal.json` (26-11-2026; Imam al-Bayhaqi; Urdu tr. Maulana Qazi Malik Muhammad Ismail,
Darul Isha'at Karachi, 2007).  usage: python3 tools/addbook/shuab/build.py <folder holding the 7 JSON files>
1. page lines: running header + printed page number removed; page-bottom notes (lines from the first «(N)......» / «(N) (M)» line to the page end) are cut off and attached as takhrij (`k`) to the
   entry with that hadith number (else to the last entry of that page).
2. entry = line that starts with a hadith number (formats «N:......», «N ......», «N۔», «N text»); the longest non-decreasing run of the numbers is trusted, a numbered line that falls out of
   the run but opens like an isnad is still an entry (printed number replaced by previous+1 — the print has typos such as 795 for 695).  Lines that follow belong to the entry, but from the
   first «باب/فصل/ایمان کا … شعبہ» heading (or from trailing short heading lines) they belong to the NEXT entry (as «§heading» + prose).
3. Arabic = the library book `shuabiman` (Arabic rows with isnad): each Urdu entry is matched to its Arabic row by narrator names (anchors with a unique high idf score, then a banded
   alignment between the anchors).  Urdu entries without an Arabic row get an empty Arabic row; the report lists them.
ids = running 1..N; registry `an` = the printed numbers.  Then: python3 tools/rehash.py ; bump sw.js"""
import json,re,sys,os,glob,math,bisect,collections,hashlib
here=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,os.path.join(here,'..','muwatta'))
os.chdir(os.path.join(here,'..','..','..'))
import common
common.seg_fix=lambda t:t.replace('؁','').replace('ـ','')
from common import urx,final_clean,verse_line
KEY='shuabimanur'
T9=str.maketrans('۰۱۲۳۴۵۶۷۸۹','0123456789')
V={}
for k in range(1,8):
    f=[x for x in glob.glob(os.path.join(sys.argv[1],'*ShuabUlImanVol%d_Mukammal.json'%k))][0]
    V[k]=json.load(open(f,encoding='utf-8'))
HDR=re.compile(r'^(ترجمہ\s*)?شعب\s*الایمان\s*\.{2,}\s*جلد|^شعب\s*الایمان\s*\.{2,}')
NOTE=re.compile(r'^\(([۰-۹]+)\)\s*')
STRN=re.compile(r'^\(([۰-۹][۰-۹\s،\-–و]*)\)\s*(\.{2,}|\([۰-۹]+\))')
STRONG=re.compile(r'^([۰-۹]+)\s*(?::\s*(?:\.{2,}|[۔]{2,})?|[۔]\s|\.{3,}|\.\s)')
WEAK=re.compile(r'^([۰-۹]+)\s+(?=[^\s۰-۹\(])')
OPEN=re.compile(r'^(?:\(?\s*مکرر|\(?کا\s+رہے|اور\s+ہمیں\s+(?:خبر|حدیث)|ہمیں\s+(?:خبر|حدیث|بتایا)|ہم\s+کو\s+خبر|مجھے\s+خبر|مجھے\s+حدیث)')
HL=re.compile(r'^(باب|فصل|ایمان کا |ایمان کے شعبوں|دوسرا شعبہ|تیسرا شعبہ)')
END=('۔','؟','!','”','’','‘','﴾',')',']','.',':','؛')
def page_lines(vol):
    """-> body [(page,text)], notes {page:[(key,text)]}"""
    body=[];notes={}
    for pg in V[vol]:
        L=[l.rstrip() for l in pg['content'].split('\n') if l.strip()];i=0
        if L and HDR.match(L[0].strip()):
            i=1
            if i<len(L) and re.fullmatch(r'[۰-۹]+',L[i].strip()): i+=1
        L=L[i:];cut=len(L)
        for j,l in enumerate(L):
            if STRN.match(l): cut=j;break
        for l in L[:cut]: body.append((pg['page'],l))
        cur=None
        for l in L[cut:]:
            m=STRN.match(l)
            if m:
                key=int(re.match(r'[۰-۹]+',m.group(1)).group(0).translate(T9)); txt=l[m.end(1)+2:].lstrip('.').strip() if False else re.sub(r'^\([^)]*\)\s*(\.{2,})?\s*','',l,count=1).strip()
                cur=[key,txt];notes.setdefault(pg['page'],[]).append(cur)
            elif cur: cur[1]+=' '+l.strip()
    return body,notes
def lnds(a):
    tails=[];ti=[];prev=[-1]*len(a)
    for i,x in enumerate(a):
        p=bisect.bisect_right(tails,x)
        if p==len(tails): tails.append(x);ti.append(i)
        else: tails[p]=x;ti[p]=i
        prev[i]=ti[p-1] if p else -1
    cur=ti[-1];out=set()
    while cur!=-1: out.add(cur);cur=prev[cur]
    return out
def entries(body):
    idx=[];ns=[]
    for i,(p,s) in enumerate(body):
        if NOTE.match(s): continue
        m=STRONG.match(s) or WEAK.match(s)
        if m:
            rest=s[m.end():].strip()
            if len(rest)>=25 and not re.match(r'^[۔\-ـ]',rest): idx.append(i);ns.append((int(m.group(1).translate(T9)),rest))
    ent=[];typo=[];last=None
    def run_ok(k):   # a run of 5 consecutive numbers with long texts follows: the numbering simply continues there
        c=0
        for q in range(k,min(k+5,len(idx))):
            if q>k and not (ns[q-1][0]<ns[q][0]<=ns[q-1][0]+3): return False
            if len(ns[q][1])<120: c+=1
        return c<=1
    for k,i in enumerate(idx):
        n,rest=ns[k]
        if last is None or last<n<=last+3 or (n==last and OPEN.match(rest)):
            ent.append([i,n,False]);last=n;continue
        if k+1<len(idx) and run_ok(k) and (n>last or (n>=100 and len(rest)>=120)):
            ent.append([i,n,False]);last=n;continue
        if len(rest)>=80 and OPEN.match(rest):
            last+=1;ent.append([i,last,True]);typo.append((body[i][0],n))
    return ent,typo
# ---------------------------------------------------------------- all volumes
E=[];FRONT=[];TYPO=[]
for v in range(1,8):
    body,notes=page_lines(v);ent,typo=entries(body);TYPO+= [(v,)+t for t in typo]
    FRONT.append((v,body[:ent[0][0]]))
    for k,(i,n,t) in enumerate(ent):
        j=ent[k+1][0] if k+1<len(ent) else len(body)
        first=re.sub(STRONG,'',body[i][1],count=1) if STRONG.match(body[i][1]) else re.sub(WEAK,'',body[i][1],count=1)
        E.append({'vol':v,'page':body[i][0],'n':n,'typo':t,'lines':[(body[i][0],first.strip())]+body[i+1:j],'notes':[]})
    # takhrij notes -> entry
    byn=collections.defaultdict(list)
    for e in E:
        if e['vol']==v: byn[e['n']].append(e)
    for pg,L in notes.items():
        for key,txt in L:
            cand=[e for e in byn.get(key,[]) if abs(e['page']-pg)<=3]
            if not cand:
                cand=[e for e in E if e['vol']==v and e['page']<=pg][-1:] or [e for e in E if e['vol']==v][:1]
            cand[0]['notes'].append(txt)
# prefix (headings/prose that belong to the NEXT entry)
for k,e in enumerate(E):
    ls=e['lines'];e['pre']=[]
    h=next((i for i in range(1,len(ls)) if HL.match(ls[i][1]) and len(ls[i][1])<=140),None)
    if h is None:
        t=len(ls)
        while t>1 and len(ls[t-1][1])<=80 and not ls[t-1][1].endswith(END) and not re.match(r'^\(?[۰-۹]',ls[t-1][1]): t-=1
        h=t if t<len(ls) else None
    if h is not None:
        e['carry']=ls[h:];e['lines']=ls[:h]
    else: e['carry']=[]
for k,e in enumerate(E):
    if k and E[k-1]['carry'] and E[k-1]['vol']==e['vol']: e['pre']=E[k-1]['carry']
    elif k and E[k-1]['carry']: e['pre']=E[k-1]['carry']
for v,fr in FRONT:   # lines before the first entry of a volume: the volume's first entry gets them (volume 1: the translator's intro is cut below)
    first=next(e for e in E if e['vol']==v)
    if v==1: continue
    first['pre']=fr+first['pre']
# ---------------------------------------------------------------- the library's Arabic rows
lib=[]
for f in sorted(glob.glob('coll/shuabiman_ar_*.js')):
    s=open(f,encoding='utf-8').read();lib+=json.loads(s[s.index(',[[')+1:s.rindex(')')])
lib.sort(key=lambda r:r[0])
HK=re.compile(r'[ً-ٰٟۖ-ۭـ]')
MAP=str.maketrans({'أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ة':'ہ','ه':'ہ','ھ':'ہ','ۃ':'ہ','ى':'ی','ي':'ی','ې':'ی','ئ':'ی','ے':'ی','ك':'ک','ؤ':'و','ء':'','ذ':'ز','ظ':'ز','ض':'ز','ث':'س','ص':'س','ط':'ت','ۂ':'ہ','ں':'ن'})
STOP=set('بن ابن عن ان انه قال حدثنا اخبرنا وهو وهي وحدثنا واخبرنا بنا ثنا انا نا في من الى على ابو'.split())
def toks(t,n=450):
    t=HK.sub('',t)[:n];t=re.sub(r'[^ء-ؿف-يٱ-ۓ\s]',' ',t).translate(MAP);t=re.sub(r'عبد\s+ال','عبدال',t);o=[]
    for w in t.split():
        if w.startswith('ال') and len(w)>3: w=w[2:]
        elif w.startswith('وال') and len(w)>4: w=w[3:]
        if len(w)>=3 and w not in STOP: o.append(w)
    return o
LT=[set(toks(r[1])) for r in lib];N=len(LT);df=collections.Counter(w for s in LT for w in s);idf={w:math.log(N/c) for w,c in df.items()}
inv=collections.defaultdict(list)
for i,s in enumerate(LT):
    for w in s: inv[w].append(i)
US=[set(toks(e['lines'][0][1],500)) for e in E]
def sim(a,b):
    c=a&b
    if not c: return 0.0
    x=sum(idf.get(w,0) for w in c);y=math.sqrt(sum(idf.get(w,0) for w in a)*sum(idf.get(w,0) for w in b));return 10*x/y if y else 0
A=[]
for k,u in enumerate(US):
    sc=collections.Counter()
    for w in u:
        if w in idf and df[w]<300:
            for i in inv[w]: sc[i]+=idf[w]
    top=sc.most_common(2)
    if top and top[0][1]>=22 and (len(top)<2 or top[0][1]>=1.4*top[1][1]): A.append((k,top[0][0]))
seq=[a[1] for a in A];keep=lnds_=None
tails=[];ti=[];pv=[-1]*len(seq)
for i,x in enumerate(seq):
    p=bisect.bisect_left(tails,x)
    if p==len(tails): tails.append(x);ti.append(i)
    else: tails[p]=x;ti[p]=i
    pv[i]=ti[p-1] if p else -1
cur=ti[-1];ch=[]
while cur!=-1: ch.append(A[cur]);cur=pv[cur]
ch.reverse()
def align(u0,u1,l0,l1):
    nu,nl=u1-u0,l1-l0
    if nu<=0 or nl<=0: return []
    D=[[0.0]*(nl+1) for _ in range(nu+1)];B=[[0]*(nl+1) for _ in range(nu+1)]
    for i in range(1,nu+1): D[i][0]=D[i-1][0]-1.0;B[i][0]=1
    for j in range(1,nl+1): D[0][j]=D[0][j-1]-4.0;B[0][j]=2
    for i in range(1,nu+1):
        us=US[u0+i-1]
        for j in range(1,nl+1):
            m=D[i-1][j-1]+sim(us,LT[l0+j-1])-1.0;a=D[i-1][j]-1.0;b=D[i][j-1]-4.0
            if m>=a and m>=b: D[i][j]=m;B[i][j]=0
            elif a>=b: D[i][j]=a;B[i][j]=1
            else: D[i][j]=b;B[i][j]=2
    i,j=nu,nl;out=[]
    while i>0 or j>0:
        t=B[i][j]
        if i>0 and j>0 and t==0: out.append((u0+i-1,l0+j-1));i-=1;j-=1
        elif i>0 and (t==1 or j==0): i-=1
        else: j-=1
    return out[::-1]
pts=[(-1,-1)]+ch+[(len(E),len(lib))];pair={}
for (u0,l0),(u1,l1) in zip(pts,pts[1:]):
    if u0>=0: pair[u0]=l0
    for u,l in align(u0+1,u1,l0+1,l1): pair[u]=l
# ---------------------------------------------------------------- rows
def quotes(t):
    o=[]
    for i,ch in enumerate(t):
        if ch not in '”“"': o.append(ch);continue
        prev=t[i-1] if i else ' ';nxt=t[i+1] if i+1<len(t) else ' '
        o.append('’’' if (prev in ' \n(:،[' or i==0) and nxt not in ' \n' else '‘‘')
    return ''.join(o)
VR=re.compile(r'\s*﴿\s*([^﴾]*?)\s*﴾\s*[\(\[]([^()\[\]]{2,40})[\)\]]\s*(?:[”“"]([^”“"]*)[”“"])?',re.S)
def verses(t):
    def f(m):
        v,ref,tr=m.group(1),m.group(2),m.group(3)
        line=verse_line('﴿ '+v+' ﴾ ('+ref+')') or m.group(0);out='\n'+line+'\n'
        if tr is not None: out+='’’'+tr.strip()+'‘‘\n'
        return out
    return VR.sub(f,t)
def U(t): return urx(quotes(verses(t.replace('\r',''))))
def isHead(x): return len(x)<=110 and not x.endswith(('۔','؟','.')) and not re.match(r'^\(?[۰-۹]',x) or bool(HL.match(x) and len(x)<=140)
def para(ls):
    """lines (page,text) -> paragraphs: a line that ends a page without end punctuation is joined with the next page's first line"""
    out=[]
    for p,x in ls:
        if out and out[-1][0]!=p and not out[-1][1].endswith(END): out[-1]=(p,out[-1][1]+' '+x)
        else: out.append((p,x))
    return [x for _,x in out]
ur=[];ar=[];AN=[];nopair=[]
for k,e in enumerate(E):
    parts=[]
    for x in para(e['pre']): parts.append(('§'+U(x)) if isHead(x) else U(x))
    body=para(e['lines'])
    parts+= [U(x) for x in body]
    txt='\n'.join(p for p in parts if p.strip())
    ex={}
    if e['notes']: ex['k']='(1) '+final_clean(' '.join(n.strip() for n in e['notes']));txt=txt.rstrip()+' (1)'
    ur.append([k+1,txt,'',ex] if ex else [k+1,txt])
    ar.append([k+1,lib[pair[k]][1] if k in pair else ''])
    if k not in pair: nopair.append(k+1)
    AN.append(e['n'])
# registry `an`: runs of printed = id + offset
R=[];i=0
while i<len(AN):
    off=AN[i]-(i+1);j=i
    while j+1<len(AN) and AN[j+1]-(j+2)==off: j+=1
    R.append([i+1,AN[i],j-i+1]);i=j+1
AN_={'_r':[r for r in R if r[1]!=r[0]]}
# sections: the library's sections through the matched Arabic rows
import re as _re
s0=open('coll/index.js',encoding='utf-8').read();REG=json.loads(s0[s0.index('COLLS(')+6:s0.rindex(')')])
LIB=[b for b in REG if b['key']=='shuabiman'][0]
def lsec(lid):
    for s in LIB['sections']:
        if s[2]<=lid<=s[3]: return s[0]
    return LIB['sections'][0][0]
cur=LIB['sections'][0][0];sec_of=[]
for k in range(len(E)):
    if k in pair: cur=max(cur,lsec(lib[pair[k]][0]))
    sec_of.append(cur)
SEC=[];
for s in LIB['sections']:
    ids=[k+1 for k in range(len(E)) if sec_of[k]==s[0]]
    if not ids: continue
    a,b=ids[0],ids[-1]
    # Urdu title: the book's own heading «ایمان کا … شعبہ» + the next heading line, found in the entry's carried headings
    first=E[a-1];hd=[x for _,x in first['pre']]
    tt=None
    for q,x in enumerate(hd):
        if 'شعبہ' in x and q+1<len(hd) and isHead(hd[q+1]): tt=urx(hd[q+1].strip('’‘“”" '));break
    n=len(SEC)+1
    SEC.append([n,tt or ('شعبہ %d'%s[0]),a,b,re.sub(r'^[٠-٩0-9]+\.\s*','',s[1]) if s[1] else ''])
# the translator's introduction (volume 1 pages 20-26): kept as intro items
INTRO=[];cur=None
fr1=[x for p,x in FRONT[0][1] if 20<=p]
for x in fr1:
    if isHead(x) and len(x)<60 and not x.startswith('❶'):
        cur=[urx(x.strip(':： ')),[]];INTRO.append(cur)
    elif cur is None: cur=[urx('تعارف'),[]];INTRO.append(cur);cur[1].append(U(x))
    else: cur[1].append(U(x))
INTRO=[i for i in INTRO if i[1]]
def jd(x): return json.dumps(x,ensure_ascii=False,separators=(',',':'))
for f in os.listdir('coll'):
    if f.startswith(KEY+'_'): os.remove('coll/'+f)
def write(l,rows):
    files=[];cur=[];size=0
    def fl():
        nonlocal cur,size
        if not cur: return
        body='COLLDATA("%s","%s",%s)'%(KEY,l,jd(cur));h=hashlib.md5(body.encode()).hexdigest()[:6];nm=f'{KEY}_{l}_{len(files)+1}_{h}.js'
        open('coll/'+nm,'w',encoding='utf-8').write(body);files.append([cur[0][0],cur[-1][0],nm,len(body.encode()),hashlib.md5(body.encode()).hexdigest()[:10]]);cur=[];size=0
    for r in rows:
        cur.append(r);size+=len(jd(r))
        if size>150000: fl()
    fl();return files
FA=write('ar',ar);FU=write('ur',ur)
entry={"key":KEY,"ar":"شعب الإيمان للبيهقي (الترجمة الأردية)","ur":"شعب الایمان (اردو ترجمہ)","en":"Shu'ab al-Iman (Urdu translation)","langs":["ar","ur"],
 "sections":SEC,"count":len(E),"intro":INTRO,"an":AN_,
 "sub":{"ur":"ترجمہ: مولانا قاضی ملک محمد اسماعیل","ar":"ترجمة: مولانا قاضي ملك محمد إسماعيل","en":"Translation by Maulana Qazi Malik Muhammad Ismail"},
 "author":LIB['author'],"trn":{"ur":"مولانا قاضی ملک محمد اسماعیل","en":"Maulana Qazi Malik Muhammad Ismail"},
 "pub":{"ur":"دارالاشاعت، کراچی","ar":"دار الإشاعة، كراتشي","en":"Darul Isha'at, Karachi"},"showpub":True,
 "files":{"ar":[[a,b,n] for a,b,n,_,_ in FA],"ur":[[a,b,n] for a,b,n,_,_ in FU]}}
REG=[b for b in REG if b['key']!=KEY]
ix=[i for i,b in enumerate(REG) if b['key']=='shuabiman'][0]
REG.insert(ix+1,entry)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+jd(REG)+')')
o=json.load(open('offline.json',encoding='utf-8'));o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
F=FA+FU
o['groups'].append({"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in F],"b":sum(x[3] for x in F)})
open('offline.json','w',encoding='utf-8').write(jd(o))
rep=open(os.path.join(here,'report.txt'),'w',encoding='utf-8')
rep.write('entries %d, with Arabic %d, without %d\nlast number %d (the book ends at 11269)\n'%(len(E),len(pair),len(nopair),AN[-1]))
rep.write('numbers replaced (typos in the print): %d\n'%len(TYPO)); rep.write('typo pages: %s\n'%TYPO[:200])
gaps=[(a,b) for a,b in zip(AN,AN[1:]) if b not in(a,a+1)];rep.write('gaps in the printed numbers (%d): %s\n'%(len(gaps),gaps))
rep.write('Urdu rows without Arabic (row ids): %s\n'%nopair)
used=set(pair.values());rep.write('library rows not used: %s\n'%[lib[i][0] for i in range(len(lib)) if i not in used])
rep.close()
print('rows',len(E),'arabic',len(pair),'no arabic',len(nopair),'sections',len(SEC),'intro',len(INTRO),'last',AN[-1])
