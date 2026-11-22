#!/usr/bin/env python3
"""Tafsir Bhatwi (Urdu, quran/tafsir/ur_bhuttavi_N.js):
 1. Arabic phrases inside the Urdu text lose the Urdu quote marks (’’ ‘‘ “ ”), the double brackets (( )) and stray spaces around them – the site itself puts them in « » (owner's bracket ruling);
    verses stay in ﴿ ﴾.
 2. A hadith reference [ بخاری، کتاب، باب … : ۴۷۰۳ ، عن … ] becomes [ بخاری (۴۷۰۳)، عن … ]: book name + the number in brackets; kitab and bab stay only where there is no hadith number.
Usage: bhatwi_arabic.py [--dry] [--show N]"""
import re,json,sys,os,glob,random,collections
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
DRY='--dry' in sys.argv
URDU=set('ٹڈڑںےۓہھگچپژکیۃ')
HAR=re.compile('[ً-ْٰٓ-ٕ]')
def is_ar(w):
    w2=re.sub(r'[^؀-ۿ]','',w)
    if not w2 or any(c in URDU for c in w2):return False
    return bool(HAR.search(w2)) or bool(re.search('[يكةىأإٱؤئ]',w2))
STRICT=set('ٹڈڑںےۓگچپژ')
def is_ar2(w,k=2):   # fully vocalized word typed with Urdu-shaped ہ ی ک ۃ (the hadith Arabic of this book): it is Arabic, only the letter shapes are Urdu
    w2=re.sub(r'[^\u0600-\u06FF]','',w)
    return bool(w2) and not any(c in STRICT for c in w2) and len(HAR.findall(w2))>=k
def conv(w,k=2):
    if not is_ar2(w,k):return w
    w=w.replace('ہ','ه').replace('ۃ','ة').replace('ک','ك').replace('ھ','ه')
    w=re.sub(r'([\u064E\u0670])ی(?![\u0600-\u06FF\u064B-\u0652])',r'\1ى',w)
    return w.replace('ی','ي')
def conv_text(s,k=2):
    return re.sub(r'\S+',lambda m:conv(m.group(0),k),s)
def neutral(w):  # punctuation / digits / bracket pieces / unmarked short Arabic particles
    return not re.search('[ء-يٱ-ۓ]',re.sub('[ً-ْـ]','',w)) or w in('و','في','من','عن','على','إلى','لا','ما','أن','إن','قد','ثم','أو','أي')
def arabic_only(s,k=2):
    ws=[w for w in re.split(r'\s+',s.strip()) if w]
    if not ws:return False
    n=0
    for w in ws:
        if is_ar(w) or is_ar2(w,k):n+=1
        elif neutral(w):continue
        else:return False
    return n>=1
st=collections.Counter()
DB=re.compile(r'\(\(\s*([^()]{1,4000}?)\s*\)\)')
QO=('’’','‘‘','”','“','"')   # a quote mark of either shape can open or close
QCH='’‘“”"'
MARK=re.compile(r'^\(\s*[^\s()]{1,3}\s*\)$')   # the (س) (ض) (ن) verb-form marks of the book
def tok_ok(w):
    return is_ar(w) or is_ar2(w) or neutral(w) or bool(MARK.match(w))
def scan_quotes(t):
    out=[];i=0;n=len(t)
    while i<n:
        op=next((q for q in QO if t.startswith(q,i)),None)
        if op:
            pos=i+len(op);words=[];ok=False
            while True:
                m=re.compile(r'\s*').match(t,pos);pos=m.end()
                m=re.compile(r'[^\s’‘“”"]+').match(t,pos)
                if not m:break
                if not tok_ok(m.group(0)):words=[];break
                words.append(m.group(0));pos=m.end()
            if words and any(is_ar(w) or is_ar2(w) for w in words) and (len(words)>=2 or any(is_ar(w) for w in words)):
                m=re.compile(r'\s*').match(t,pos);q=next((q for q in QO if t.startswith(q,m.end())),None)
                if q:
                    inner=conv_text(t[i+len(op):m.start()].strip())
                    st['quotes']+=1
                    L=bool(out) and re.match(r'[\u0621-\u06FF\d]',out[-1][-1]) is not None
                    end=m.end()+len(q);R=end<n and re.match(r'[\u0621-\u06FF\d]',t[end]) is not None
                    out.append((' ' if L else '')+inner+(' ' if R else ''));i=end;continue
        out.append(t[i]);i+=1
    return ''.join(out)
def fix_ar(t):
    def f(m):
        inner=m.group(1)
        if arabic_only(re.sub(r'[﴿﴾]','',inner),1):
            st['(( ))']+=1
            pc=m.string[m.start()-1] if m.start()>0 else ' ';nc=m.string[m.end()] if m.end()<len(m.string) else ' '
            L=re.match(r'[\u0621-\u06FF\d]',pc) is not None;R=re.match(r'[\u0621-\u06FF\d]',nc) is not None
            return (' ' if L else '')+conv_text(inner,1)+(' ' if R else '')
        return m.group(0)
    t=DB.sub(f,t)
    t=scan_quotes(t)
    t=re.sub(r'[’‘“”]{1,2}\s*(﴿[^﴾]*﴾)\s*[’‘“”]{1,2}',lambda m:(st.update(['verse quotes']) or m.group(1)),t)
    t=re.sub(r'([\u064B-\u0652\u0670][\u0600-\u06FF]{0,2}[.…:]+)(?=[\u0621-\u06FF])',lambda m:(st.update(['glued']) or m.group(1)+' '),t)
    return t
# ---- hadith references: [ بخاری، کتاب، باب … : ۴۷۰۳ ] -> [ بخاری (۴۷۰۳) ] ----
BOOKS=r'(?:بخاري|بخاری|مسلم|ترمذي|ترمذی|أبوداؤد|أبو داؤد|ابوداؤد|ابو داؤد|نسائي|نسائی|ابن ماجہ|ابن ماجه|دارمي|دارمی|ابن حبان|مؤطا|موطا)'
NAME_FIX={'بخاري':'بخاری','ترمذي':'ترمذی','نسائي':'نسائی','أبو داؤد':'أبوداؤد','ابو داؤد':'أبوداؤد','ابوداؤد':'أبوداؤد'}
NUMS=r'[۰-۹]+(?:\s*؍\s*[۰-۹]+)?(?:\s*[،]\s*[۰-۹]+)*'
TAIL=r'(?=\s*$|\s*[،]?\s*(?:عن|و ?صح|صح|و ?قال|قال|و ?إسناد|إسناد|و ?ھو|نیز|و ?حسن|حسن|و ?ضعف|و ?اس|تعلیق|و ?سند)|\s+عن\b)'
LONG=re.compile(r'^(\s*(?:دیکھیے\s+)?)('+BOOKS+r')(?:\s*[،,]\s*|\s+(?=\S+،\s*باب))(.+?)\s*[:：]?\s*('+NUMS+r')'+TAIL+r'(.*)$',re.S)
SHORT=re.compile(r'^(\s*(?:دیکھیے\s+)?)('+BOOKS+r')\s*[:：]\s*('+NUMS+r')(.*)$',re.S)
def nums(book,x):
    x=re.sub(r'\s+','',x)
    if book=='مسلم':x=re.sub(r'[۰-۹]+؍','',x)   # Muslim «in-book number ؍ Fuad Abdul Baqi number»: the Fuad number is the one that is quoted
    return x.replace('،','، ')
def fix_sub(sub):
    m=LONG.match(sub)
    if m and re.search(r'باب|کتاب|[\u0621-\u06FF]{3,}',m.group(3)) and not re.fullmatch(r'[۰-۹\s،:]+',m.group(3)):
        st['ref long']+=1
        return m.group(1)+NAME_FIX.get(m.group(2),m.group(2))+' ('+nums(m.group(2),m.group(4))+')'+m.group(5)
    m=SHORT.match(sub)
    if m:
        st['ref short']+=1
        return m.group(1)+NAME_FIX.get(m.group(2),m.group(2))+' ('+nums(m.group(2),m.group(3))+')'+m.group(4)
    return sub
BR=re.compile(r'\[([^\[\]]{3,700})\]')
def fix_refs(t):
    def f(m):
        inner=m.group(1)
        if not re.search(BOOKS,inner[:30]):return m.group(0)
        parts=re.split(r'(۔\s*)',inner)
        for k in range(0,len(parts),2):parts[k]=fix_sub(parts[k])
        return '['+''.join(parts)+']'
    return BR.sub(f,t)
if __name__=='__main__':
    show=int(sys.argv[sys.argv.index('--show')+1]) if '--show' in sys.argv else 0
    files=sorted(glob.glob('quran/tafsir/ur_bhuttavi_*.js'));ex=[]
    for f in files:
        s=open(f,encoding='utf8').read();a=s.index('{');b=s.rindex('}');d=json.loads(s[a:b+1])
        for sn,rows in d.items():
            for r in rows:
                n=fix_refs(fix_ar(r[2]))
                if n!=r[2] and len(ex)<4000:ex.append((r[2],n))
                r[2]=n
        if not DRY:open(f,'w',encoding='utf8').write(s[:a]+json.dumps(d,ensure_ascii=False,separators=(',',':'))+s[b+1:])
    print(dict(st))
    random.seed(1)
    for o,n in random.sample(ex,min(show,len(ex))):
        i=next(k for k in range(min(len(o),len(n))) if o[k]!=n[k])
        print('OLD',o[max(0,i-30):i+90].replace('\n','⏎'));print('NEW',n[max(0,i-30):i+90].replace('\n','⏎'));print()
