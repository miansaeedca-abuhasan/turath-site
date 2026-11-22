import os,re,json,zipfile,collections,glob
A='/mnt/user-data/attachments/c78c1915-dfa8-5395-875d-805b90bb4e15/'
DAG='ٰ'
TOK=re.compile(r'[ء-ٰٟٮ-ۓۺ-ۿ]+')
DIA=re.compile('[ً-ٰٟـۖ-ۭ]')
CAN=str.maketrans({'ي':'ی','ى':'ی','ك':'ک','ه':'ہ','ھ':'ہ','ة':'ۃ','ې':'ی'})
URL=re.compile('[ٹڈڑںےہھگچپژکۓ]')
def paragraphs(path):
    e=path.rsplit('.',1)[-1].lower()
    if e=='json':
        d=json.load(open(path,encoding='utf8'))
        def walk(x):
            if isinstance(x,str): yield x
            elif isinstance(x,list):
                for y in x: yield from walk(y)
            elif isinstance(x,dict):
                for y in x.values(): yield from walk(y)
        yield from walk(d)
    elif e=='docx':
        z=zipfile.ZipFile(path);x=z.read('word/document.xml').decode('utf8','ignore')
        for p in re.findall(r'<w:p[ >].*?</w:p>',x,flags=re.S):
            yield ''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>',p))
    else:
        for l in open(path,encoding='utf8',errors='ignore'): yield l
def toks(s):
    """list of (plain_key, form, dagger_pos_in_base) for each token"""
    out=[]
    for w in TOK.findall(s):
        c=w.translate(CAN)
        base=DIA.sub('',c)
        # dagger positions: after a yeh, index in base letters
        dpos=None
        if DAG in c:
            m=re.search('ی(?:[ً-ٟ]*)ٰ',c)
            if m:
                dpos=len(DIA.sub('',c[:m.start()]))   # index of yeh in base
        out.append((base,w,dpos))
    return out
def urdu_par(s): return len(URL.findall(s))>=3
class Lex:
    def __init__(s,files):
        s.D=collections.defaultdict(collections.Counter)   # base -> dpos counter (None = plain)
        s.C3=collections.defaultdict(collections.Counter);s.CL=collections.defaultdict(collections.Counter);s.CR=collections.defaultdict(collections.Counter)
        for f in files:
            for p in paragraphs(f):
                if not urdu_par(p): continue
                T=toks(p)
                for i,(b,w,dp) in enumerate(T):
                    if 'ی' not in b: continue
                    s.D[b][dp]+=1
                    l=T[i-1][0] if i else '^';r=T[i+1][0] if i+1<len(T) else '$'
                    s.C3[(l,b,r)][dp]+=1;s.CL[(l,b)][dp]+=1;s.CR[(b,r)][dp]+=1
        # keep only bases that ever had a dagger
        s.cand={b for b,c in s.D.items() if any(k is not None for k in c)}
    def decide(s,l,b,r):
        """returns ('d',pos) restore, ('p',) keep plain, ('u',) unresolved"""
        c=s.D[b]
        daggers={k for k in c if k is not None}
        if len(daggers)!=1: return ('u','multi-pos')
        pos=next(iter(daggers))
        if c.get(None,0)==0: return ('d',pos,'all')
        for tbl,key in ((s.C3,(l,b,r)),(s.CL,(l,b)),(s.CR,(b,r))):
            k=tbl.get(key)
            if k:
                d=k.get(pos,0);p=k.get(None,0);t=d+p
                if p==0: return ('d',pos,'ctx')
                if d==0: return ('p',)
                if d/t>=0.9: return ('d',pos,'maj-ctx')
                if p/t>=0.9: return ('p',)
        t=sum(c.values());d=c[pos]
        if d/t>=0.9: return ('d',pos,'maj')
        if d/t<=0.1: return ('p',)
        return ('u','ambig')
def restore_text(s,lex,stats):
    T=toks(s)
    if not any(b in lex.cand for b,_,_ in T): return s
    # walk tokens in order and rebuild by position
    out=[];last=0;idx=0
    for m in TOK.finditer(s):
        w=m.group();b,_,dp=T[idx];l=T[idx-1][0] if idx else '^';r=T[idx+1][0] if idx+1<len(T) else '$';idx+=1
        if DAG in w or b not in lex.cand or 'ی' not in b: continue
        dec=lex.decide(l,b,r)
        stats[(b,dec[0])]+=1
        if dec[0]!='d': continue
        pos=dec[1]
        # insert dagger after the pos-th base letter of the site word (must be a yeh)
        cnt=-1;ins=None
        for j,ch in enumerate(w):
            if not DIA.match(ch): cnt+=1
            if cnt==pos:
                if ch.translate(CAN)!='ی': break
                ins=j+1
                while ins<len(w) and DIA.match(w[ins]): ins+=1   # after any marks on the yeh? keep dagger right after yeh
                ins=j+1
                break
        if ins is None: stats[(b,'badpos')]+=1;continue
        out.append(s[last:m.start()]+w[:ins]+DAG+w[ins:]);last=m.end()
    out.append(s[last:]);return ''.join(out)

ARONLY=re.compile('[ً-ْيىكةه]')
def restore_raw(s,lex,stats):
    """s = raw file text (JS/JSON). returns new text."""
    toks_=[(m,m.group()) for m in TOK.finditer(s)]
    keys=[(DIA.sub('',w.translate(CAN))) for m,w in toks_]
    out=[];last=0
    for i,(m,w) in enumerate(toks_):
        b=keys[i]
        if b not in lex.cand or DAG in w: continue
        if ARONLY.search(w): continue          # Arabic-style word (vocalized or with Arabic letters): leave
        if 'ی' not in w: continue
        l=keys[i-1] if i else '^';r=keys[i+1] if i+1<len(keys) else '$'
        dec=lex.decide(l,b,r);stats[(b,dec[0])]+=1
        if dec[0]!='d': continue
        pos=dec[1];cnt=-1;ins=None
        for j,ch in enumerate(w):
            if not DIA.match(ch): cnt+=1
            if cnt==pos:
                if ch=='ی': ins=j+1
                break
        if ins is None: stats[(b,'badpos')]+=1;continue
        stats[(b,'restored')]+=1
        out.append(s[last:m.start()]+w[:ins]+DAG+w[ins:]);last=m.end()
    out.append(s[last:]);return ''.join(out)
