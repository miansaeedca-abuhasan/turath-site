#!/usr/bin/env python3
"""Jamul Fowaid (Muhammad bin Sulayman al-Maghribi), Urdu, Ansar as-Sunnah Publications: 5 JSON volumes -> rows, sections, intro.
Run: python3 tools/addbook/jamulfawaid/jbuild.py  (writes /tmp/jf_built.json and prints a report); jreg.py writes the site files."""
import sys,os,json,re,glob,collections,difflib
HERE=os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0,os.path.join(HERE,'..','sharhsunna'))
import build as ss
from build import UR,AR,split_title,takh,dash_char,post,digits_ur,quotes,verse_ar,LOG
from common import ar_clean,final_clean
A=ss.A
U2E=ss.U2E
TERM=re.compile(r'[۔\.\?؟!:”“’‘\)\]»﴾]\s*$')
HAR=re.compile('[ً-ْٰ]')
def vols():
    out=[]
    for n in range(1,6):
        f=glob.glob(A+'*Jamul-Fowaid-Jild-J-%d.json'%n)[0]
        out.append(json.load(open(f,encoding='utf8')))
    return out
def dnum(s): return int(s.translate(U2E))
def norm_ar(t):
    t=re.sub('[ً-ْٰـ]','',t or '');t=re.sub('[يىی]','ي',t);t=re.sub('[أإآ]','ا',t);t=t.replace('ة','ه').replace('ۃ','ه')
    return re.sub(r'[^\w]','',t)
def join_txt(parts):
    o=''
    for p in parts:
        p=(p or '').strip()
        if not p: continue
        o=(o+' '+p) if o else p
    return o
def ayat_lines(b):
    m=re.sub(r'^\s*﴿|﴾\s*$','',b['matn'].strip()).strip()
    ref=digits_ur(re.sub(r'^\(|\)$','',(b.get('hawala') or '').strip()))
    tr=' '.join(UR(b.get('tarjuma') or ''))
    tr=tr.strip()
    out=['﴿ '+verse_ar(m)+' ﴾'+((' ['+ref+']') if ref else '')]
    if tr:
        if not re.match(r'^[’‘]',tr): tr='’’'+tr+'‘‘'
        out.append(tr)
    return out
ANOM=[]
def corr_number(v,page,b,prev,nxt):
    """printed number of a hadith block: the «number» field; a few are mistyped in the printed/extracted book (see ANOM report)"""
    n=dnum(b['number'])
    m=re.match(r'\(\s*([۰-۹]+)\s*\)',b['takhreej'].strip())
    t=dnum(m.group(1)) if m else None
    return n,t
FIX={(1,'۴۳۹',848):748,(2,'۲۶۱',2089):2079}   # printed number typed wrongly in the extracted text: the neighbours and the takhreej «(۷۴۸)» / «(۲۰۷۹)» show the right one
def parse():
    V=vols();recs=[];byn={};secs=[];heads=[];NT=collections.defaultdict(list);intro=[]
    stream=[]
    for vi,d in enumerate(V):
        for h in d['hissay']:
            for s in h['safhat']:
                for b in s['blocks']: stream.append((vi+1,h['unwan'],s['safha'],b))
    front=[x for x in stream if not x[1].startswith('کتاب')]
    body=[x for x in stream if x[1].startswith('کتاب')]
    # ---- front matter
    fm=collections.OrderedDict()
    for v,u,p,b in front: fm.setdefault(u,[]).append((p,b))
    hw={}
    for vi,d in enumerate(V):
        for h in d['hissay']:
            for s in h['safhat']:
                for w in s.get('hawashi',[]): hw.setdefault((vi+1,h['unwan']),[]).append((s['safha'],w))
    for u,items in fm.items():
        paras=[];prev=None
        for p,b in items:
            q=b['qism']
            if q=='surkhi': continue
            if q=='ayat':
                paras+=ayat_lines(b);prev=None;continue
            t=b['matn']
            if b.get('zaban')=='arabic':
                paras.append(AR(t,stop=False));prev=None;continue
            ls=UR(t)
            if prev and prev[0]!=p and ls and not TERM.search(prev[1]) and paras:
                paras[-1]=paras[-1]+' '+ls[0];ls=ls[1:]
            paras+=ls;prev=(p,t)
        nt=hw.get((1,u),[])
        if nt:
            paras.append('§حواشی')
            for i,(p,w) in enumerate(nt,1): paras.append('(%d) %s'%(i,' '.join(UR(w['matn']))));LOG['front hashiya without mark in text: %s p%s'%(u,p)]+=1
        intro.append([u,paras])
    # ---- body
    kit=None;lastk=None;cursec=None;pend_kit=None;firstk=True
    cur=None            # record that follows-up M/S/P/A attach to
    lastkind=None;lastpage=None;last_txt={}
    def newsec(title_ur,title_ar):
        nonlocal cursec
        sid=len(secs)+1
        secs.append([sid,title_ur,None,None,title_ar]);cursec=secs[-1]
        return sid
    for v,u,p,b in body:
        q=b['qism']
        m=re.match(r'^[^:]*:\s*(.*?)\s*/\s*(.*)$',u)
        kar,kur=(m.group(1),m.group(2)) if m else (u,u)
        if kit!=u or (kit==u and False):
            pass
        if u!=kit:
            # new hissa = new kitab, or the same kitab continuing in the next volume
            same=(lastk==(kar,kur))
            kit=u
            pend_kit=None if same else (kar,kur)
            if not same: lastk=(kar,kur)
            kit_new=not same
            first_in_hissa=True
        if q=='surkhi':
            ur_t=b['urdu'].strip();ar_t=b['arabic'].strip()
            isk=first_in_hissa and pend_kit and (norm_ar(ar_t)==norm_ar(kar) or norm_ar(ur_t)==norm_ar(kur) or norm_ar(ar_t)==norm_ar(kur))
            first_in_hissa=False
            cur_note=None
            if isk:
                # kitab heading (taken from the kitab list); the next surkhi is the first bab; a section is opened for it when no bab follows
                heads.append([len(secs)+1,kur,kar,True]);pend_kit=('H',ur_t,ar_t);cursec=None
                continue
            ar_t=re.sub(r'^\(\s*(.*?)\s*\)$',r'\1',ar_t);ur_t=re.sub(r'^\(\s*(.*?)\s*\)$',r'\1',ur_t)
            if pend_kit and pend_kit[0]!='H' and pend_kit!=None and not heads_has(heads,len(secs)+1):
                heads.append([len(secs)+1,kur,kar,False])
            newsec(ur_t,ar_t);pend_kit=None
            cur=None;lastkind=None
            continue
        first_in_hissa=False
        if cursec is None:
            if pend_kit and pend_kit[0]=='H': newsec(pend_kit[1] or kur,pend_kit[2] or kar)
            elif not secs: raise SystemExit('no section at start')
            else: cursec=secs[-1]
            pend_kit=None
        if pend_kit and pend_kit[0]!='H':
            heads.append([len(secs)+1 if False else secs.index(cursec)+1,kur,kar,False]);pend_kit=None
        if q=='hadith':
            n=dnum(b['number'])
            n=FIX.get((v,p,n),n)
            if n in byn:
                r=byn[n]
                LOG['parts merged']+=1
                if b['takhreej'].strip():
                    nk=lambda x:re.sub(r'[\s\-ـ،,\.۔]','',x)
                    if r['k'] and difflib.SequenceMatcher(None,nk(r['k']),nk(b['takhreej'])).ratio()<0.9:
                        r['k']+='\n'+b['takhreej'].strip();ANOM.append(('second takhreej part appended',v,p,n))
                    elif not r['k']: r['k']=b['takhreej'].strip()
                r['a'].append(b['arabic']);r['u'].append(b['urdu'])
            else:
                r=dict(n=n,a=[b['arabic']],u=[b['urdu']],k=b['takhreej'].strip(),m=[],e=[],sec=len(secs),v=v,p=p,tk=b.get('tukra'))
                recs.append(r);byn[n]=r;cursec[3]=len(recs)
                if cursec[2] is None: cursec[2]=len(recs)
            cur=recs[-1];lastkind=None
            continue
        # chapter-level text right after a heading (no hadith yet in the section)
        if cur is None or cursec[2] is None:
            sidx=secs.index(cursec)+1
            if q=='ayat': NT[sidx]+=ayat_lines(b)
            else: NT[sidx]+=UR(b['matn'])
            LOG['chapter text']+=1
            continue
        tgt='m' if q=='mufarradat' else 'e'
        if q=='ayat':
            cur['e']+=[''+x for x in ayat_lines(b)];lastkind=None;continue
        t=b['matn']
        L=last_txt.get(id(cur))
        if lastkind==q and lastpage is not None and lastpage!=p and cur[tgt] and not TERM.search(L or '') and not cur[tgt][-1].startswith(''):
            cur[tgt][-1]+=' '+t.strip()
        else: cur[tgt].append(t.strip())
        last_txt[id(cur)]=t;lastkind=q;lastpage=p
    return V,recs,secs,heads,NT,intro
def heads_has(h,i): return any(x[0]==i for x in h)
def takh2(s):
    s=s.strip()
    if not s: return ''
    out=[]
    for ln in s.split('\n'):
        ln=ln.strip();pre=''
        m=re.match(r'^\(([^)]*)\)\s*',ln)
        if m:
            if re.search(r'[،,\-]',m.group(1)) and re.fullmatch(r'[\s۰-۹،,\-]+',m.group(1)): pre='('+re.sub(r'\s*-\s*','-',m.group(1)).translate(U2E).replace('،','، ').replace('  ',' ').strip()+') '
            ln=ln[m.end():]
        ln=ln.replace('\n',' ')
        ln=re.sub(r'\s*\.{3,}\s*',': ',ln)
        ln=re.sub(r'(?<=[۰-۹])\s*[_ـ]\s*(?=[۰-۹])','-',ln)
        ln=re.sub(r'\s+ـ\s+',' - ',ln);ln=re.sub(r'(?<=[۰-۹])ـ(?=\s)',' -',ln);ln=re.sub(r'(?<=[۰-۹])\s+-\s+(?=\S)','، ',ln)
        ln=re.sub(r'(?<=\S)\s+-\s+(?=\S)','، ',ln)
        ln=final_clean(post(ss.sayy(ln))).replace('ـ','')
        ln=ln.translate(U2E)
        ln=re.sub(r'(?<![\u0600-\u06ff])((?:مسند\s+)?احمد|دارمی|مؤطا|موطا)\s*:\s*(\d+(?:\s*[،,]\s*\d+)*)(?!\d)',lambda m:m.group(1)+' ('+re.sub(r'\s*[،,]\s*','، ',m.group(2))+')',ln)
        out.append(pre+ln)
    return '\n'.join(x for x in out if x.strip())
def finish():
    V,recs,secs,heads,NT,intro=parse()
    # page notes whose call-mark is not in the extracted text: appended to the hadith of that page
    notes=[]
    for vi,d in enumerate(V):
        for h in d['hissay']:
            if not h['unwan'].startswith('کتاب'): continue
            for s in h['safhat']:
                for w in s.get('hawashi',[]): notes.append((vi+1,s['safha'],w))
    for v,p,w in notes:
        cand=[r for r in recs if r['v']==v and r['p']==p] or [r for r in recs if r['v']==v and r['p']<=p][-1:]
        tgt=cand[-1]
        tgt['e'].append('حاشیہ: '+w['matn']);LOG['page notes appended to the hadith of the page (no call-mark in text)']+=1
        ANOM.append(('page note without call-mark',v,p,tgt['n']))
    rows=[];AN={};tail=re.compile(r'^\s*[۰-۹]+\s*[ـ\-]\s*')
    for i,r in enumerate(recs,1):
        a=join_txt([tail.sub('',x or '') for x in r['a']]);a=re.sub(r'[”“"]([۰-۹0-9]+)[”“"]',r'\1',a)
        u=join_txt(r['u'])
        kk={}
        k=takh2(r['k'])
        if k: kk['k']=k
        mm=[];
        for t in r['m']: mm+=UR(t)
        if mm: kk['m']='\n'.join(mm)
        ee=[]
        for t in r['e']:
            if t.startswith('\ue000'): ee.append(t[1:])
            else: ee+=UR(t)
        if ee: kk['e']='\n'.join(ee)
        rows.append([i,AR(a.replace('۔','.')).translate(ss.U2A),'\n'.join(UR(u)),kk])
        if r['n']!=i: AN[i]=str(r['n'])
    S=[[a,' '.join(UR(re.sub(r'\.{3,}',' … ',b))) if b else '',c,d,ar_clean(e)] for a,b,c,d,e in secs]
    for x in S:
        if not x[1]: x[1]=x[4];LOG['section without Urdu title: Arabic title used']+=1
    HD=[[h[0],' '.join(UR(re.sub(r'\.{3,}',' … ',h[1]))),ar_clean(h[2])] for h in heads]
    nt={k:v for k,v in NT.items()}
    present=set(r['n'] for r in recs)
    gaps=[n for n in range(1,max(present)+1) if n not in present]
    return rows,S,HD,nt,intro,AN,gaps
if __name__=='__main__':
    rows,S,HD,nt,intro,AN,gaps=finish()
    json.dump({'rows':rows,'secs':S,'heads':HD,'NT':{str(k):v for k,v in nt.items()},'an':{str(k):v for k,v in AN.items()},'intro':intro,'gaps':gaps},open('/tmp/jf_built.json','w'),ensure_ascii=False)
    print('rows',len(rows),'sections',len(S),'heads',len(HD),'NT',len(nt),'an',len(AN),'gaps',gaps)
    print(dict(LOG));print(ANOM)
    sys.exit(0)
if __name__=='__main__' and False:
    V,recs,secs,heads,NT,intro=parse()
    print('records',len(recs),'sections',len(secs),'heads',len(heads),'NT',len(NT))
    print(dict(LOG));print(len(ANOM),ANOM[:10])
