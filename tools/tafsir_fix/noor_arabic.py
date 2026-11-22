#!/usr/bin/env python3
"""Tafsir Noor al-Huda (coll/tafsirnoor_ur_*): Arabic words typed with Urdu-shaped letters (ہ ی ک ۃ) showed in the Urdu font.
Fully vocalized words get the Arabic letter shapes (ه ي ك ة), so the site shows them in the Arabic font (« »).
Urdu quote marks (’’ ‘‘ “ ”) that enclose ONLY Arabic are removed (the site brackets Arabic itself).
Usage: noor_arabic.py [--dry] [--show N]"""
import re,sys,json,os,glob,hashlib,datetime,random,collections
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
DRY='--dry' in sys.argv
URDU=set('ٹڈڑںےۓہھگچپژکیۃ');STRICT=set('ٹڈڑںےۓگچپژ')
HAR=re.compile('[ً-ْ]')   # fatha damma kasra shadda sukun tanwin (not the dagger alif / maddah of Urdu words)
def core(w):return re.sub(r'[^؀-ۿ]','',w)
def n_har(w):return len(HAR.findall(core(w)))
def ar_strict(w):  # real Arabic letters already
    c=core(w);return bool(c) and not any(x in URDU for x in c) and (n_har(w)>=1 or bool(re.search('[يكةىأإٱؤئ]',c)))
def conv(w):
    w=w.replace('ہ','ه').replace('ۃ','ة').replace('ک','ك').replace('ھ','ه')
    w=re.sub(r'([َٰ])ی(?![؀-ۿً-ْ])',r'\1ى',w)
    return w.replace('ی','ي')
st=collections.Counter()
def fix_text(t):
    parts=re.split(r'(﴿[^﴾]*﴾|[\u0600-\u06FF\u200c]+)',t)     # Arabic-block runs are the words; everything else is left alone
    idx=[i for i,p in enumerate(parts) if i%2==1 and not p.startswith('﴿')]
    u=lambda w:any(x in URDU for x in w) and not any(x in STRICT for x in w)
    isar={i:(u(parts[i]) and n_har(parts[i])>=2) for i in idx}
    for i in idx:   # a one-mark word (اللہُ) right next to a converted word belongs to the same Arabic phrase
        if not isar[i] and u(parts[i]) and n_har(parts[i])==1:
            for j in (i-2,i+2):
                if isar.get(j) and parts[i+(j-i)//2].strip(' \u200c')=='' :isar[i]='n'
    for i,v in isar.items():
        if v:
            w=parts[i];tail=''
            m=re.match(r'^(.*[\u064B-\u0652])([\u0600-\u06FF]{2,})$',w)   # Arabic word glued to an Urdu word (…نَدرمیانے): split, the tail stays Urdu
            if m and any(x in 'ہیکےںھگ' for x in m.group(2)) and n_har(m.group(2))==0:w,tail=m.group(1),' '+m.group(2);st['split']+=1
            n=conv(w)+tail
            if n!=parts[i]:st['words']+=1;parts[i]=n
    return ''.join(parts)
QRE=re.compile(r'(’’|‘‘|“|”)([^’‘“”\n]{2,500}?)(’’|‘‘|“|”)')
def arabic_only(s):
    ws=[w for w in s.split() if core(w)]
    return bool(ws) and all(ar_strict(w) or not re.search('[ء-يٱ-ۓ]',re.sub('[ً-ْـ]','',core(w))) for w in ws) and sum(n_har(w) for w in ws)>=2
def unquote(t):
    def f(m):
        if arabic_only(m.group(2)):st['unquote']+=1;return m.group(2).strip()
        return m.group(0)
    return QRE.sub(f,t)
def fix(t):return unquote(fix_text(t))
if __name__=='__main__':
    show=int(sys.argv[sys.argv.index('--show')+1]) if '--show' in sys.argv else 0
    idx=open('coll/index.js',encoding='utf8').read();off=json.load(open('offline.json',encoding='utf8'));ex=[]
    for f in sorted(glob.glob('coll/tafsirnoor_ur_*.js')):
        t=open(f,encoding='utf8').read();a=t.index('[[');b=t.rindex(']]')+2
        rows=json.loads(t[a:b]);ch=0
        for r in rows:
            n=fix(r[1])
            if n!=r[1]:
                ch+=1
                if len(ex)<6000:ex.append((r[1],n))
                r[1]=n
        if ch and not DRY:
            t2=t[:a]+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+t[b:]
            h=hashlib.md5(t2.encode()).hexdigest();fn=os.path.basename(f);nf=re.sub(r'_[0-9a-f]{6}\.js$','_'+h[:6]+'.js',fn)
            open('coll/'+nf,'w',encoding='utf8').write(t2)
            if nf!=fn:os.remove(f)
            idx=idx.replace(fn,nf)
            for g in off['groups']:
                for x in g['f']:
                    if x[0]=='coll/'+fn:g['b']+=len(t2.encode())-x[3];x[0]=x[2]='coll/'+nf;x[1]=h[:10];x[3]=len(t2.encode())
    if not DRY:
        open('coll/index.js','w',encoding='utf8').write(idx);off['v']=datetime.datetime.now(datetime.UTC).strftime('%Y%m%d%H%M')
        open('offline.json','w',encoding='utf8').write(json.dumps(off,ensure_ascii=False,separators=(',',':')))
    print(dict(st))
    random.seed(5)
    for o,n in random.sample(ex,min(show,len(ex))):
        i=next((k for k in range(min(len(o),len(n))) if o[k]!=n[k]),0);print(' OLD',o[max(0,i-30):i+90].replace('\n','⏎'));print(' NEW',n[max(0,i-30):i+90].replace('\n','⏎'))
