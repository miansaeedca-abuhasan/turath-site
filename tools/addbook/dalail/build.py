#!/usr/bin/env python3
"""Dala'il an-Nubuwwah (Urdu) `dalailur` — owner's 3 JSON files `Dalail_al-Nubuwwah_Urdu_Run-{1,2,3}.json` (27-11-2026; Imam al-Bayhaqi; Urdu tr. Maulana Muhammad Ismail al-Jarvi;
vol 1-2 Dar ul-Isha'at Karachi / Idara al-Ma'arif Dar al-Uloom Karachi, vol 6 Dar al-I'tisam; PDFs Dalail-un-Nubuwwah-1..3.pdf) -> coll book: 3336 entries, 666 babs (= sections), 7 volumes.
usage: python3 tools/addbook/dalail/build.py <folder with the 3 JSON files>      then tools/order_tail.py, tools/rehash.py, bump sw.js
Arabic = the library book `dalail` (3049 Arabic rows). Urdu entries are matched to Arabic rows by narrator names (full-text + first-40-word tf-idf cosine, monotone DP anchors, then the gaps between
anchors: equal gaps one-to-one, unequal gaps a local DP). Urdu entries without a sure Arabic row get an EMPTY Arabic row (report: tools/addbook/dalail/report.txt).
ur row: [id, text+" (1)", "", {"k":"(1) hukm: takhrij","f":"fawaid / sharh"}]; text order = (sub)heading lines «§», the Arabic lines printed in the Urdu book (in « »), the Urdu."""
import json,re,sys,os,glob,math,collections,hashlib
import numpy as np,scipy.sparse as sp
here=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,os.path.join(here,'..','muwatta'))
os.chdir(os.path.join(here,'..','..','..'))
import common
common.seg_fix=lambda t:t.replace('؁','').replace('ـ','')
from common import urx,final_clean
KEY='dalailur'
D=[json.load(open(f,encoding='utf-8')) for f in sorted(glob.glob(os.path.join(sys.argv[1],'*Run-*.json')),key=lambda f:re.search(r'Run-(\d)',f).group(1))]
E=[h for d in D for h in d['hadiths']]
assert len(E)==3336
s0=open('coll/index.js',encoding='utf-8').read();REG=json.loads(s0[s0.index('COLLS(')+6:s0.rindex(')')])
LIB=[b for b in REG if b['key']=='dalail'][0]
R=[]
for f in LIB['files']['ar']:
    t=open('coll/'+f[2],encoding='utf-8').read();R+=json.loads(t[t.index('",[')+2:t.rindex(')')])
# the library rows are paragraphs, one row sometimes holds the end of a section and the first narration, or two narrations: every row is cut
# at each new isnad start («… . وأخبرنا …») so that one piece = one narration (the text itself is never changed, only cut)
def cut_rows(R):
    out=[]
    for r in R:
        t=r[1];idx=[i for i,c in enumerate(t) if not('ً'<=c<='ٰ')];pl=''.join(t[i] for i in idx);pos=[0]
        for m in re.finditer(r'(?<=[\.؟!»\]\)])\s+(?=(?:و)?(?:أخبرنا|أخبرني|حدثنا|حدثني|أنبأنا|أخبرناه)\b)',pl):
            if m.end()<len(idx):pos.append(idx[m.end()])
        for m in re.finditer(r'\*\s+',t):pos.append(m.end())   # «* » = an edition marker between narrations / sections
        pos=sorted(set(pos));pos.append(len(t))
        buf='';r0=len(out)
        for x,y in zip(pos,pos[1:]):
            tx=t[x:y].strip()
            if tx.endswith('*'):tx=tx[:-1].strip()
            if not tx:continue
            buf=(buf+' '+tx).strip() if buf else tx
            if len(re.sub(r'[ً-ٰ\s]','',buf))>=150:out.append([len(out)+1,buf]);buf=''   # a piece shorter than 150 letters (a bare «(ح)» isnad fragment) is joined to the next one
        if buf:
            if len(out)>r0:out[-1][1]=(out[-1][1]+' '+buf).strip()
            else:out.append([len(out)+1,buf])
    return out
R=cut_rows(R)
# ------------------------------------------------------------------ alignment
MP={'ی':'ي','ے':'ي','ى':'ي','ک':'ك','ڪ':'ك','ہ':'ه','ۃ':'ه','ھ':'ه','ة':'ه','إ':'ا','أ':'ا','آ':'ا','ٱ':'ا','ڈ':'د','ڑ':'ر','ٹ':'ت','پ':'ب','چ':'ج','گ':'ك','ژ':'ز','ں':'ن'}
SW=set('اخبرنا حدثنا قال بن عن ابن ابو عبد الله رسول صلي عليه وسلم وقال انه الذي الذين فقال'.split())
def sk(t):
    t=re.sub('[ً-ٰٟ]','',t);t=re.sub(r'\[\(?[٠-٩0-9]+\)?\]','',t);t=''.join(MP.get(c,c) for c in t)
    t=t.replace('ؤ','و').replace('ئ','ي').replace('ء','');o=[]
    for x in re.findall(r'[ا-ي]+',t):
        if x.startswith('ال') and len(x)>3:x=x[2:]
        if len(x)>2 and x not in SW:o.append(x)
    return o
def cos(n):
    UT=[sk(u['urdu'])[:n] if n else sk(u['urdu']) for u in E];RT=[sk(r[1])[:n] if n else sk(r[1]) for r in R]
    df=collections.Counter()
    for t in UT+RT:
        for w in set(t):df[w]+=1
    N=len(UT)+len(RT);idf={w:math.log(N/c) for w,c in df.items()};voc={}
    def M(T):
        r=[];c=[];d=[]
        for i,t in enumerate(T):
            cn=collections.Counter(t);v={w:(1+math.log(k))*idf[w] for w,k in cn.items()};nn=math.sqrt(sum(x*x for x in v.values())) or 1
            for w,x in v.items():r.append(i);c.append(voc.setdefault(w,len(voc)));d.append(x/nn)
        return r,c,d
    a=M(UT);b=M(RT);k=len(voc)
    return (sp.csr_matrix((a[2],(a[0],a[1])),shape=(len(UT),k))@sp.csr_matrix((b[2],(b[0],b[1])),shape=(len(RT),k)).T).toarray().astype(np.float32)
S=np.maximum(cos(40),cos(0)*1.15);n,m=S.shape
def dp(S,thr):
    n_,m_=S.shape;G=S-thr
    D_=np.zeros((n_+1,m_+1),dtype=np.float32);B=np.zeros((n_+1,m_+1),dtype=np.int8)
    for i in range(1,n_+1):
        diag=D_[i-1,:-1]+G[i-1];up=D_[i-1,1:];best=np.maximum(diag,up).tolist();dk=(diag>=up).tolist()
        rw=D_[i];cur=0.0;Bi=B[i]
        for j in range(1,m_+1):
            bj=best[j-1]
            if cur>bj:rw[j]=cur;Bi[j]=2
            else:rw[j]=bj;Bi[j]=0 if dk[j-1] else 1
            cur=rw[j]
    i,j=n_,m_;pairs=[]
    while i>0 and j>0:
        k=B[i,j]
        if k==0 and G[i-1,j-1]>0:pairs.append((i-1,j-1));i-=1;j-=1
        elif k==0:i-=1;j-=1
        elif k==1:i-=1
        else:j-=1
    pairs.reverse();return pairs
F={i:j for i,j in dp(S,0.35) if S[i,j]>=0.35}
def gaps(F):
    prev=(-1,-1);g=[]
    for a in sorted(F.items())+[(n,m)]:
        if a[0]-prev[0]>1:g.append(((prev[0]+1,a[0]),(prev[1]+1,a[1])))
        prev=a
    return g
for eqthr,dpthr,acc in [(0.10,0.20,0.22),(0.12,0.15,0.20),(0.12,0.12,0.20),(0.05,0.06,0.07),(0.03,0.04,0.05)]:   # the last two rounds were spot-checked (names of the isnad agree down to a score of 0.05; below that pairs were wrong)
    for (i0,i1),(j0,j1) in gaps(F):
        ni,nj=i1-i0,j1-j0
        if ni==nj:
            for k in range(ni):
                if S[i0+k,j0+k]>=eqthr:F[i0+k]=j0+k
        elif ni and nj:
            sub=S[i0:i1,j0:j1]
            for a,b in dp(sub,dpthr):
                if sub[a,b]>=acc:F[i0+a]=j0+b
assert len(set(F.values()))==len(F) and all(F[a]<F[b] for a,b in zip(sorted(F)[:-1],sorted(F)[1:]))
# ------------------------------------------------------------------ text
QS=[False]    # the source mixes " “ ” without direction: quotes alternate open/close (state carried over entries of one bab, reset at a new bab)
def quotes(t):
    o=[]
    for ch in t:
        if ch not in '”“"':o.append(ch);continue
        o.append('‘‘' if QS[0] else '’’');QS[0]=not QS[0]
    return ''.join(o)
def UR(t):
    t=t.replace('\r','').replace('الرحیm','الرحیم')
    t=re.sub(r'[ \t]*\n[ \t]*','\n',t)
    return urx(quotes(t)).strip()
AM={'ی':'ي','ک':'ك','ہ':'ه','ے':'ي','ں':'ن','ۃ':'ة','ھ':'ه','ٹ':'ت','پ':'ب','چ':'ج','گ':'ك'}
def AR(l):
    l=''.join(AM.get(c,c) for c in l);l=re.sub(r'\s+',' ',l).strip()
    return '«'+l+'»'
def lines(t):return [x.strip() for x in t.replace('\r','').split('\n') if x.strip()]
ur=[];ar=[];SEC=[];prev_bab=None;prev_sub='';nopair=[]
for k,e in enumerate(E):
    bk=(e['volume'],e['bab_number'],re.sub(r'\s+',' ',e['bab']).strip())
    if bk!=prev_bab:
        QS[0]=False;title=re.sub(r'\s+',' ',urx(quotes(e['bab']))).strip()
        SEC.append([len(SEC)+1,title,k+1,k+1,'']);prev_bab=bk;QS[0]=False
    else:SEC[-1][3]=k+1
    parts=[]
    sub=e['subsection'].strip()
    if sub and sub!=prev_sub:parts.append('§'+re.sub(r'\s+',' ',UR(sub)))
    prev_sub=sub or prev_sub if sub else prev_sub
    for l in lines(e['arabic']):parts.append(AR(l))
    ul=lines(UR(e['urdu']))
    if k==433:ul=['«رَحِمَ اللّٰهُ قُسًّا إِنِّي وَلَأَرْجُو أَنْ يَبْعَثَهُ اللّٰهُ أُمَّةً وَحْدَهُ»' if x=='r' else x for x in ul]  # InPage glyph 'r' = this printed Arabic line (vol 2 printed p.351), read from the PDF
    if ul and any(f.startswith('sub-title at head') for f in e['flags']) and len(ul)>1 and len(ul[0])<160:ul[0]='§'+ul[0]
    parts+=ul
    txt='\n'.join(parts)
    tk=UR(e['takhrij']).strip();hk=UR(e['hukm']).strip()
    if len(tk)>2 and tk[0]=='(' and tk[-1]==')' and tk.count('(')==1:tk=tk[1:-1].strip()
    if hk:tk=hk+(': '+tk if tk else '')
    fw=[]
    for fld in('fawaid','sharh'):
        if e[fld].strip():fw+=lines(UR(e[fld]))
    ex={}
    if tk:ex['k']='(1) '+tk;txt+=' (1)'
    if fw:ex['f']='\n'.join(fw)
    ur.append([k+1,txt,'',ex] if ex else [k+1,txt])
    ar.append([k+1,R[F[k]][1] if k in F else ''])
    if k not in F:nopair.append(k+1)
# ------------------------------------------------------------------ files + registry
def jd(x):return json.dumps(x,ensure_ascii=False,separators=(',',':'))
for f in os.listdir('coll'):
    if f.startswith(KEY+'_'):os.remove('coll/'+f)
def write(l,rows):
    files=[];cur=[];size=0
    def fl():
        nonlocal cur,size
        if not cur:return
        body='COLLDATA("%s","%s",%s)'%(KEY,l,jd(cur));h=hashlib.md5(body.encode()).hexdigest();nm=f'{KEY}_{l}_{len(files)+1}_{h[:6]}.js'
        open('coll/'+nm,'w',encoding='utf-8').write(body);files.append([cur[0][0],cur[-1][0],nm,len(body.encode()),h[:10]]);cur=[];size=0
    for r in rows:
        cur.append(r);size+=len(jd(r))
        if size>150000:fl()
    fl();return files
FA=write('ar',ar);FU=write('ur',ur)
entry={"key":KEY,"ar":"دلائل النبوة للبيهقي (الترجمة الأردية)","ur":"دلائل النبوۃ للبیہقی (اردو ترجمہ)","en":"Dala'il an-Nubuwwah of al-Bayhaqi (Urdu translation)","langs":["ar","ur"],
 "sections":SEC,"count":len(E),
 "sub":{"ur":"ترجمہ: مولانا محمد اسماعیل جروی","ar":"ترجمة: مولانا محمد إسماعيل","en":"Translation by Maulana Muhammad Ismail"},
 "author":LIB['author'],"trn":{"ur":"مولانا محمد اسماعیل","en":"Maulana Muhammad Ismail"},
 "files":{"ar":[[a,b,n] for a,b,n,_,_ in FA],"ur":[[a,b,n] for a,b,n,_,_ in FU]}}
REG=[b for b in REG if b['key']!=KEY];ix=[i for i,b in enumerate(REG) if b['key']=='dalail'][0];REG.insert(ix+1,entry)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+jd(REG)+')')
o=json.load(open('offline.json',encoding='utf-8'));o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
Fl=FA+FU
o['groups'].append({"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in Fl],"b":sum(x[3] for x in Fl)})
open('offline.json','w',encoding='utf-8').write(jd(o))
rep=open(os.path.join(here,'report.txt'),'w',encoding='utf-8')
rep.write('Urdu entries %d, with Arabic row %d, without %d\nUrdu rows without Arabic: %s\nlibrary rows not used: %d\n'%(len(E),len(F),len(nopair),nopair,m-len(F)))
rep.close()
print('rows',len(E),'arabic',len(F),'no arabic',len(nopair),'sections',len(SEC))
