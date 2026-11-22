#!/usr/bin/env python3
"""Owner 22-11-2026: in every translated (coll) hadith book except the complete Al-Jami al-Kamil the takhrij is «book (number)» – the long
«صحیح البخاری، کتاب …، باب …، حدیث: 521» becomes «صحیح البخاری (521)»; where a reference has NO hadith number, kitab/bab stay as printed.
Usage: takhrij_short.py [--dry] [--show N] [keys…]"""
import re,sys,json,os,glob,hashlib,datetime,random,collections
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
D='٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹'
def asc(s):return s.translate({ord(c):str(i%10) for i,c in enumerate(D)})
N=r'[0-9٠-٩۰-۹]+'
NUMS=r'-?'+N+r'(?:\s*[-–]\s*'+N+r')?(?:\s*[،,]\s*'+N+r'(?:\s*[-–]\s*'+N+r')?)*'
NAMES=r'(?:صحیح\s+|صحيح\s+)?(?:سنن\s+|جامع\s+)?(?:ال)?(?:بخاری|بخاري|بخارى|مسلم|ترمذی|ترمذي|ترمذى|نسائی|نسائي|نسائى|ابن\s+ماجہ|ابن\s+ماجه|دارمی|دارمي|أبو\s*دا(?:و|ؤ)د|ابو\s*دا(?:و|ؤ)د|ابی\s+دا(?:و|ؤ)د|أبی\s+دا(?:و|ؤ)د|ابوداؤد|ابوداود|أبوداؤد|موطا\s+امام\s+مالک|موطا|مؤطا)'
SEP=r'\s*[،,:：.\-]*\s*'
MARK=r'(?:(?:رقم\s+الحدیث|رقم\s+الحديث|رقم|الحدیث|الحديث|حدیث|حديث|ح)\s*(?:نمبر)?\s*[:：]?\s*)?'
LONG=re.compile(r'('+NAMES+r')'+SEP+r'((?=[^\n۔]*?(?:کتاب|باب|ابواب|أبواب))[^0-9٠-٩۰-۹\n۔]{3,220}?)\s*[:：(]?\s*'+MARK+r'\(?\s*('+NUMS+r')\s*\)?(?![0-9٠-٩۰-۹]|\s*[/؍])')
SHORTR=re.compile(r'(?<![؀-ۿ])('+NAMES+r')\s*[:：]\s*('+NUMS+r')(?![0-9٠-٩۰-۹]|\s*[/؍])')
HDR=re.compile(r'('+NAMES+r')\s*[،,]?\s*(?:رقم\s+الحدیث|رقم\s+الحديث|رقم|حدیث|حديث)\s*[:：]\s*('+NUMS+r')(?![0-9٠-٩۰-۹]|\s*[/؍])')
# Muslim «N/M»: both are hadith numbers (owner 22-11-2026) -> one bracket «مسلم (N/M)»
MN=r'(?:صحیح\s+|صحيح\s+)?(?:ال)?مسلم'
MARKM=r'(?:رقم\s+الحدیث|رقم\s+الحديث|رقم|الحدیث|الحديث|حدیث|حديث|ح)\s*(?:نمبر)?\s*[:：]\s*'   # the marker is required: «(3 / 68)» alone is volume/page
NM2=N+r'\s*[/؍]\s*'+N
LONGM=re.compile(r'('+MN+r')'+SEP+r'((?=[^\n۔]*?(?:کتاب|باب|ابواب|أبواب))[^0-9٠-٩۰-۹\n۔]{3,220}?)\s*[:：(]?\s*'+MARKM+r'\(?\s*('+NM2+r')\s*\)?(?![0-9٠-٩۰-۹])')
HDRM=re.compile(r'('+MN+r')\s*[،,]?\s*(?:رقم\s+الحدیث|رقم\s+الحديث|رقم|حدیث|حديث|ح)\s*[:：]\s*('+NM2+r')(?![0-9٠-٩۰-۹])')
st=collections.Counter()
def nm(x):return re.sub(r'\s*,\s*','، ',asc(re.sub(r'\s+','',x).replace('،','،'))).replace('،','، ')
def tw(m):
    g=m.group(0)
    return '' if g.rstrip().endswith(')') or not g[-1:].isspace() else ' '
PU={str(i):chr(0xE100+i) for i in range(10)}
def prot(m):return m.group(1)+(m.group(2) or '')+' '+''.join(PU[c] for c in asc(m.group(3)))
def unprot(x):return re.sub('[\uE100-\uE109]',lambda m:str(ord(m.group(0))-0xE100),x)
def conv(line):
    line=re.sub(r'(باب)\s*([:：])?\s*('+N+r')(?=\s*[،,])',prot,line)   # «باب: 12» is a chapter number, not the hadith number
    return unprot(conv0(line))
def conv0(line):
    def f(m):
        # the middle part must not swallow another reference's name
        if re.search(NAMES+r'\s*[،:]',m.group(2)) and len(m.group(2))>60:return m.group(0)
        st['long']+=1;return m.group(1)+' ('+nm(m.group(3))+')'+tw(m)
    def fm(m):
        if re.search(NAMES+r'\s*[،:]',m.group(2)) and len(m.group(2))>60:return m.group(0)
        st['muslimNM']+=1;return m.group(1)+' ('+re.sub(r'\s+','',asc(m.group(3))).replace('؍','/')+')'+tw(m)
    line=LONGM.sub(fm,line)
    line=HDRM.sub(lambda m:(st.update(['muslimNM']) or m.group(1)+' ('+re.sub(r'\s+','',asc(m.group(2))).replace('؍','/')+')'+tw(m)),line)
    o=LONG.sub(f,line)
    o=HDR.sub(lambda m:(st.update(['hdr']) or m.group(1)+' ('+nm(m.group(2))+')'+tw(m)),o)
    o=SHORTR.sub(lambda m:(st.update(['short']) or m.group(1)+' ('+nm(m.group(2))+')'),o)
    return o
def conv_k(k):
    m=re.match(r'^(\(\d+\)\s*)',k);pre=m.group(1) if m else '';body=k[len(pre):]
    return pre+'\n'.join(conv(l) for l in body.split('\n'))
if __name__=='__main__':
    dry='--dry' in sys.argv;args=[a for a in sys.argv[1:] if not a.startswith('--') and not a.isdigit()]
    show=int(sys.argv[sys.argv.index('--show')+1]) if '--show' in sys.argv else 0
    idx=open('coll/index.js',encoding='utf8').read();off=json.load(open('offline.json',encoding='utf8'))
    SKIP={'silsila','bulughsaada'}
    keys=args or sorted({re.match(r'coll/(.+?)_ur_\d+_',f).group(1) for f in glob.glob('coll/*_ur_*.js') if re.match(r'coll/(.+?)_ur_\d+_',f)}-SKIP)
    ex=[];per={}
    for key in keys:
        c0=sum(st.values())
        for f in sorted(glob.glob(f'coll/{key}_ur_*.js')):
            t=open(f,encoding='utf8').read();a=t.index('[[');b=t.rindex(']]')+2
            rows=json.loads(t[a:b]);ch=0
            for r in rows:
                if len(r)>3 and isinstance(r[3],dict) and r[3].get('k'):
                    n=conv_k(r[3]['k'])
                    if n!=r[3]['k']:
                        ch+=1
                        if len(ex)<20000:ex.append((key,r[3]['k'],n))
                        r[3]['k']=n
            if ch and not dry:
                t2=t[:a]+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+t[b:]
                h=hashlib.md5(t2.encode()).hexdigest();fn=os.path.basename(f);nf=re.sub(r'_[0-9a-f]{6}\.js$','_'+h[:6]+'.js',fn)
                open('coll/'+nf,'w',encoding='utf8').write(t2)
                if nf!=fn:os.remove(f)
                idx=idx.replace(fn,nf)
                for g in off['groups']:
                    for x in g['f']:
                        if x[0]=='coll/'+fn:g['b']+=len(t2.encode())-x[3];x[0]=x[2]='coll/'+nf;x[1]=h[:10];x[3]=len(t2.encode())
        per[key]=sum(st.values())-c0
    if not dry:
        open('coll/index.js','w',encoding='utf8').write(idx);off['v']=datetime.datetime.now(datetime.UTC).strftime('%Y%m%d%H%M')
        open('offline.json','w',encoding='utf8').write(json.dumps(off,ensure_ascii=False,separators=(',',':')))
    print(dict(st));print(per)
    random.seed(7)
    for key,o,n in random.sample(ex,min(show,len(ex))):
        print('['+key+']');print(' OLD',o[:230].replace('\n','⏎'));print(' NEW',n[:230].replace('\n','⏎'))
