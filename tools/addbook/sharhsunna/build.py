#!/usr/bin/env python3
"""Sharh as-Sunnah (al-Baghawi), Urdu, Ansar as-Sunnah Publications: JSON volumes -> rows, sections, notes, intro.
Run: python3 tools/addbook/sharhsunna/build.py  (writes /tmp/ss_built.json and prints a report); register.py writes the site files."""
import sys,os,json,re,collections
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','muwatta'))
import common
common.seg_fix=lambda t:t.replace('؁','').replace('ـ','')   # dagger alif stays
from common import ar_clean,final_clean,sayy,verse_line
A='/mnt/user-data/attachments/c78c1915-dfa8-5395-875d-805b90bb4e15/'
FILES=['d617a1d3-Sharh-As-Sunnah-Vol-1_Corrected6.json','308d7ea4-Sharh-As-Sunnah-Vol-2_Corrected4.json','d9dba4db-Sharh-As-Sunnah-Vol-3_Corrected.json','89593c35-Sharh-As-Sunnah-Vol-4_Corrected2.json','337e8465-Sharh-As-Sunnah-Vol-5.json','aee059b3-Sharh-As-Sunnah-Vol-6.json']
U2E=str.maketrans('۰۱۲۳۴۵۶۷۸۹','0123456789');E2U=str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹');U2A=str.maketrans('۰۱۲۳۴۵۶۷۸۹','٠١٢٣٤٥٦٧٨٩');L2A=str.maketrans('0123456789','٠١٢٣٤٥٦٧٨٩')
HAR=re.compile('[ً-ْٰ]')
STOPQ=set('’’')
LOG=collections.Counter()
# ---------- quotes / verses / honorifics (same logic as the Muwatta Ansar build) ----------
def quotes(t):
    o=[]
    for i,ch in enumerate(t):
        if ch not in '”“"': o.append(ch);continue
        prev=t[i-1] if i else ' ';nxt=t[i+1] if i+1<len(t) else ' '
        o.append('’’' if (prev in ' \n(:،[' or i==0) and nxt not in ' \n' else '‘‘')
    return ''.join(o)
CUT=['رضی اللہ','رحمہ','علیہ السلام','علیہا السلام','صلی اللہ','۔','’’','‘‘',':','«','»','؟']
def sayy2(t):
    reps=[]
    for m in re.finditer(r'رضی اللہ عنہ[مما]',t):
        a=max(0,m.start()-90);w=t[a:m.start()]
        for c in CUT:
            i=w.rfind(c)
            if i>=0: w=w[i+len(c):]
        a=m.start()-len(w)
        for h in re.finditer(r'(?<!\w)حضرت(?=\s)',w): reps.append(a+h.start())
    for p in sorted(set(reps),reverse=True): t=t[:p]+'سیدنا'+t[p+4:]
    return t
AN=''
def dash_char(t):
    """the printed book uses «-» for the Urdu full stop (۔) and for the Arabic one (.)"""
    def f(m):
        pre=t[max(0,m.start()-14):m.start()]
        w=re.split(r'[\s»]',pre.rstrip())[-1] if pre.strip() else ''
        return ('.' if HAR.search(w) else '۔')
    return re.sub(r'(?<=[^\d\s\-/])\s*-(?=\s|$|[”“’‘\)\]»\ue001\(\[﴿«\.])',f,t)
def post(t):
    t=re.sub(r'^\s*-\s*','',t)                       # a dash at the start of a line is only a separator
    t=re.sub(r'-\s*(?=﴾)','',t)                        # printed ayah break inside a verse
    t=re.sub(r'-(?=:)','',t)
    t=re.sub(r'(?<=[\)‘’])-(?=[\u0600-\u06ff])','۔ ',t)
    t=re.sub(r'(?<=ہے|تک)-(?=[پ])','۔ ',t)
    t=re.sub(r'(?<=[۰-۹])-(?=\s)','۔',t)
    return t
def digits_ur(t): return t.translate(E2U)
VA2=re.compile(r'\s*﴿\s*([^﴾]*?)\s*﴾\s*(?:\.{2,}|…+)\s*([^’﴿﴾\n]{1,70}?)\s*’’(.*?)‘‘\s*\(([^()]{2,40})\)',re.S)
VA=re.compile(r'\s*﴿\s*([^﴾]*?)\s*﴾\s*(?:\.{2,}|…+)\s*’’(.*?)‘‘\s*(?:\(([^()]{2,40})\))?',re.S)
def verse_ar(v):
    v=re.sub(r'\s*-\s*',' ',v)           # «-» inside a verse is only the printed ayah break
    v=re.sub(r'\s*﴿\s*([۰-۹0-9]+)\s*﴾',r' \1',v)
    return ar_clean(v).strip()
def split_verses(t):
    def f(m):
        ref=(m.group(3) or '').strip()
        ref=digits_ur(ref)
        out='\n﴿ '+verse_ar(m.group(1))+' ﴾'+((' ['+ref+']') if ref else '')+'\n'
        out+='’’'+m.group(2).strip()+'‘‘\n'
        return out
    t=VA.sub(f,t)
    def g(m):
        ref=digits_ur(m.group(4).strip())
        return '\n﴿ '+verse_ar(m.group(1))+' ﴾ ['+ref+']\n'+m.group(2).strip()+' ’’'+m.group(3).strip()+'‘‘\n'
    return VA2.sub(g,t)
def UR(t):
    """Urdu running text (translation, sharh, fawaid, notes, intros) -> list of lines"""
    out=[]
    for l in t.split('\n'):
        l=l.strip()
        if not l: continue
        l=l.replace('ـ','').replace('؁','').replace('\xa0',' ')
        l=l.replace('آنحضرت',AN)
        l=re.sub(r'\(\(\s*(.*?)\s*-?\s*\)\)',lambda m:'(('+m.group(1).strip()+'))',l)
        l=re.sub(r'﴿([^﴾]*)﴾',lambda m:'﴿'+re.sub(r'\s+-\s*$|\s*-\s+',' ',m.group(1)).rstrip()+'﴾',l)
        l=re.sub(r'\s*-+\s*\.{3,}\s*','\n',l)       # «-......» separates an Arabic passage from its Urdu translation: two paragraphs
        l=re.sub(r'-{2,}','-',l);l=re.sub(r'-(?=،)','',l)
        l=dash_char(l)
        l=digits_ur(l)
        l=quotes(l)
        l=re.sub(r'\(\(([^()]*)\)\)',lambda m:'«'+re.sub(r'\s+',' ',m.group(1)).strip()+'»',l)
        l=re.sub(r'\(\(([^()]*)\)',lambda m:'«'+m.group(1).strip()+'»',l)
        l=sayy(l);l=sayy2(l);l=l.replace(AN,'آنحضرت')
        l=split_verses(l)
        for x in l.split('\n'):
            x=final_clean(post(x))
            if x: out.append(x)
    return out
def AR(t,stop=True):
    t=t.replace('\xa0',' ')
    t=re.sub(r'﴿([^﴾]*)﴾',lambda m:'﴿'+re.sub(r'\s*-\s*',' ',m.group(1)).strip()+'﴾',t)
    t=t.replace('((','').replace('))','')
    t=re.sub(r'-(?=،)','',t)
    t=re.sub(r'-\.','.',t)
    t=re.sub(r'\s*-(?=\s|$|[)\]»])','.',t)
    t=re.sub(r'﴾\s*\(([^()]{2,40})\)',lambda m:'﴾ ['+m.group(1)+']',t)
    t=re.sub(r'\[([^\]]*)\]',lambda m:'['+m.group(1).translate(U2A).translate(L2A)+']',t)
    t=re.sub(r'\s+',' ',t).replace(' .','.').strip()
    t=re.sub(r'\.{2,}\s*\.$','.',t)
    if stop and t and not re.search(r'[\.:؟»\)\]﴾]$',t): t+='.'
    return t
URL=re.compile('[ٹڈڑںےہھگچپژکیۃ]')
H1=re.compile('[\u064b-\u0652]')
def split_title(t):
    """the printed titles run the Arabic title and its Urdu title together: Arabic words (vocalised) first, then Urdu"""
    t=re.sub(r'\s+',' ',t).strip();w=t.split(' ')
    last=-1
    for i,x in enumerate(w):
        if H1.search(x) and not URL.search(x): last=i
    if last<0:      # no vocalised word: Arabic-only words at the start (no Urdu letters)
        while last+1<len(w) and not URL.search(w[last+1]): last+=1
    return ' '.join(w[:last+1]),' '.join(w[last+1:])
def takh(s,num):
    s=re.sub(r'^\s*\([^)]*\)\s*','',s or '').replace('\n',' ')
    s=re.sub(r'\s*\.{3,}\s*',': ',s)
    s=dash_char(s)
    s=re.sub(r'(?<=[۰-۹])\s*[_ـ]\s*(?=[۰-۹])','-',s)
    s=final_clean(post(sayy(s))).replace('ـ','')
    return s.translate(U2E)
def load():
    vols=[json.load(open(A+f,encoding='utf8')) for f in FILES]
    return vols
def build():
    vols=load();rows=[];secs=[];heads=[];NT={};AN_={}
    rid=0;sid=0;lastk=None
    for vi,d in enumerate(vols):
        H=d['hadiths'];pool=collections.defaultdict(collections.deque)
        for h in H: pool[h['number']].append(h)
        used=0
        for k in d['kitabs']:
            kar,kur=split_title(k['title'])
            for b in k['babs']:
                sid+=1;first=rid+1
                for nn in b['hadith_numbers']:
                    h=pool[nn].popleft();used+=1   # the volume's own bab lists give the printed order (volume 1 prints 721 inside the previous bab)
                    rid+=1
                    ar=AR(h['arabic']);ur='\n'.join(UR(h['urdu']))
                    kk={}
                    tk=takh(h['takhrij'],h['number'])
                    if tk: kk['k']=tk
                    sh='\n'.join(UR(h['sharh']))
                    if sh: kk['e']=sh
                    fw='\n'.join(UR(h['fawaid']))
                    if fw: kk['f']=fw
                    rows.append([rid,ar,ur,kk])
                    pn=h['number'].translate(U2E)
                    if pn!=str(rid): AN_[rid]=pn
                    if re.sub(r'\s+','',h['bab'])!=re.sub(r'\s+','',b['title']): LOG['hadith bab field differs from bab list (vol %d)'%(vi+1)]+=1
                bar,bur=split_title(b['title'])
                if not bur: bur=bar
                secs.append([sid,' '.join(UR(bur)),first,rid,ar_clean(bar)])
                if b['intro'].strip(): NT[sid]=UR(b['intro'])
                if (kar,kur)!=lastk: heads.append([sid,' '.join(UR(kur)),ar_clean(kar)]);lastk=(kar,kur)
        assert used==len(H) and not any(pool.values()),(vi,used,len(H),[k for k,v in pool.items() if v])
    return vols,rows,secs,heads,NT,AN_
def circ(c):
    o=ord(c)
    if 0x2460<=o<=0x2473: return o-0x2460+1
    if 0x2776<=o<=0x277F: return o-0x2776+1
    if 0x24EB<=o<=0x24F4: return o-0x24EB+11
    return None
CIRC=re.compile('[\u2460-\u2473\u2776-\u277f\u24eb-\u24f4]')
def front(vols):
    f=vols[0]['front'];intro=[]
    for k,v in f.items():
        paras=[];notes=v['hawashi'];cnt=[0]
        lines=[]
        for l in v['text'].split('\n'):
            l=l.strip()
            if not l: continue
            m=re.match(r'^('+CIRC.pattern+r')\s*(?:…+|\.{3,})?\s*',l)
            if m:   # a numbered list item (printed as a circled digit), not a footnote
                l='%d۔ '%circ(m.group(1))+l[m.end():];LOG['list items']+=1
            def mk(mm):
                cnt[0]+=1;return ' \ue001%d\ue002'%cnt[0]
            l=CIRC.sub(mk,l)
            lines.append(l)
        for l in lines:
            if HAR.search(l) and not re.search(r'[ٹڈڑںےہھگچپژکیۃ]',l) and '\ue001' not in l:
                vl=verse_line(l)
                paras.append(vl if vl else AR(l,stop=False));continue
            for x in UR(l):
                if re.search(r':$',x) and len(x.split())<=4 and not x.startswith('﴿') and '\ue001' not in x: x='§'+x.rstrip(':').strip()
                paras.append(x)
        paras=[re.sub(r'\ue001([۰-۹]+)\ue002',lambda m:'('+m.group(1).translate(U2E)+')',p) for p in paras]
        LOG['footnote marks %s'%k]=(cnt[0],len(notes))
        if notes:
            paras.append('§حواشی')
            for i,n in enumerate(notes,1):
                nt=re.sub(r'(?<=[۰-۹])\s*-\s*(?=[^\d\s])',' ۔ ',n['text']);nt=re.sub(r'(?<=[۰-۹])\s*-\s*$','۔',nt)
                paras.append('(%d) %s'%(i,' '.join(UR(nt))))
        intro.append([v['title'],paras])
    return intro
if __name__=='__main__':
    vols,rows,secs,heads,NT,AN_=build()
    intro=front(vols)
    json.dump({'rows':rows,'secs':secs,'heads':heads,'NT':{str(k):v for k,v in NT.items()},'an':{str(k):v for k,v in AN_.items()},'intro':intro},open('/tmp/ss_built.json','w'),ensure_ascii=False)
    print('rows',len(rows),'sections',len(secs),'heads',len(heads),'notes',len(NT),'an',len(AN_))
    print(dict(LOG))
