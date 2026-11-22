#!/usr/bin/env python3
# Urdu tafsirs: a Quran verse written in plain «( … )» / «« … »» with a reference after it  ->  ﴿ … ﴾ [سورۃ: آیت]
# Arabic letters of the verse get the Arabic shapes (ه ي ك) so the site shows them in the Arabic font.
import re,json,glob,sys,collections
DRY='--dry' in sys.argv
meta=open('quran/meta.js',encoding='utf8').read()
names=[x[1] for x in json.loads(re.search(r'"surahs":(\[\[.*?\]\]),"juz"',meta).group(1))]
HAR=re.compile('[\u064B-\u0652\u0670]')
def key(n):
    n=re.sub('[\u064B-\u0653\u0670\u0640ۭۚۖۗۘۙۛۜ"“”’‘۔،.]','',n)
    n=n.replace('سورۃ','').replace('سورة','').replace('سورہ','')
    n=re.sub('[ةۃہھ]','ه',n);n=re.sub('[يیىے]','ي',n);n=n.replace('ک','ك')
    n=re.sub('[أإآٱ]','ا',n);n=n.replace('ء','').replace('ؤ','و').replace('ئ','ي')
    n=re.sub(r'[\s\-_]','',n)
    return re.sub('^ال','',n)
IDX={}
for i,n in enumerate(names,1):IDX[key(n)]=i
for al,i in {'ابراهیم':14,'بنی اسرائیل':17,'المومنون':23,'المومن':40,'مومن':40,'المؤمن':40,'غافر':40,'حم السجدہ':41,'حم السجدۃ':41,'حٰم السجدہ':41,'حٰم السجدۃ':41,'حٰمٓ السجدہ':41,'حمٓ السجدۃ':41,'الدھر':76,'الدہر':76,'الہب':111,'اللهب':111,'العكنبوت':29,'العنكبوب':29,'الزاریات':51,'الذاریات':51,'قٓ':50,'ق':50,'یسٓ':36,'صٓ':38,'الكهف':18}.items():IDX[key(al)]=i
def sname(i):  # Urdu spelling of the name, as the site shows it
    return names[i-1].replace('ة','ۃ').replace('ي','ی').replace('ى','ی').replace('ك','ک').replace('ه','ہ') if False else names[i-1].replace('ة','ۃ').replace('ي','ی').replace('ى','ی')
AYC=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6]
UD=str.maketrans('0123456789٠١٢٣٤٥٦٧٨٩','۰۱۲۳۴۵۶۷۸۹۰۱۲۳۴۵۶۷۸۹')
def toint(s):return int(s.translate(str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩','01234567890123456789')))
def arab_ok(s):
    ws=s.split()
    if not ws:return False
    n=sum(1 for w in ws if HAR.search(w))
    return len(HAR.findall(s))>=3 and n/len(ws)>=0.75
def ar_letters(s):
    s=s.replace('ہ','ه').replace('ۃ','ة').replace('ک','ك').replace('ھ','ه')
    s=re.sub(r'([\u064E\u0670])ی(?![\u0600-\u06FF\u064B-\u0652])',r'\1ى',s)
    return s.replace('ی','ي').replace('ے','ي')
def clean_verse(s):
    s=re.sub(r'\s*\d+\s*[؀۝]?\s*(?=[ۭۖ-ۜ]*\s*$)','',s)     # trailing verse number (14؀)
    s=re.sub(r'\s*[۝؀]\s*ۭ?\s*$','',s)
    s=re.sub(r'[\s۔،.]+$','',s)
    s=s.strip();s=re.sub(r'^[ۖ-ۜؕ-ؚ]+','',s).strip()          # leading waqf mark
    return ar_letters(s)
st=collections.Counter()
def mk(verse,n,a):
    if not(1<=n<=114) or not(1<=a<=AYC[n-1]):st['badref']+=1;return None
    st['ok']+=1
    return '﴿'+clean_verse(verse)+'﴾ ['+sname(n)+': '+str(a).translate(UD)+']'
NAME=r'([^\s:\d()\[\]]+(?: [^\s:\d()\[\]]+)?)'
BODY=r'([^()«»\[\]﴿﴾]{6,1800}?)'
def lookup(nm):return IDX.get(key(nm))
def sub_makki(m):
    if not arab_ok(m.group(1)):return m.group(0)
    return mk(m.group(1),int(m.group(2)),int(m.group(3))) or m.group(0)
def sub_num_name_num(m):   # ( … ) 16۔ النحل :98)  /  ( … ) 47۔ القصص 28)
    if not arab_ok(m.group(1)):return m.group(0)
    a,nm,b=toint(m.group(2)),m.group(3),toint(m.group(4));i=lookup(nm)
    if i is None:st['noname']+=1;return m.group(0)
    if i==a:n,ay=a,b
    elif i==b:n,ay=b,a
    else:st['mismatch']+=1;return m.group(0)
    return mk(m.group(1),n,ay) or m.group(0)
def sub_name_num(m):       # ( … ) [ النحل : 98]   /  « … » ( 39-النحل : 98 ، 99 )
    if not arab_ok(m.group(1)):return m.group(0)
    i=lookup(m.group(2))
    if i is None:st['noname']+=1;return m.group(0)
    nums=[toint(x) for x in re.findall(r'[\d۰-۹٠-٩]+',m.group(3))]
    r=mk(m.group(1),i,nums[0])
    if r is None:return m.group(0)
    if len(nums)>1:r=r[:r.rindex(':')+2]+'-'.join(str(x).translate(UD) for x in nums)+']'
    return r
RX=[
 (re.compile(r'\(\s*'+BODY+r'\)\s*(\d{3}):(\d{1,3})'),sub_makki),
 (re.compile(r'\(\s*'+BODY+r'(?:\d+\s*[؀۝]\s*ۭ?)?\)\s*(\d+)\s*[۔.]\s*'+NAME+r'\s*:?\s*(\d+)\s*\)'),sub_num_name_num),
 (re.compile(r'\(\s*'+BODY+r'\)\s*\[\s*'+NAME+r'\s*:\s*([\d۰-۹٠-٩]+)\s*\]'),sub_name_num),
 (re.compile(r'\(\s*'+BODY+r'\)\s*\(\s*'+NAME+r'\s*[:：]\s*([\d۰-۹٠-٩]+)\s*\)'),sub_name_num),
 (re.compile(r'[«]\s*'+BODY+r'[»]\s*(?:[\d۱-۹]+\s*؎\s*)?\(\s*(?:\d+\s*[-–]\s*)?'+NAME+r'\s*[:：]\s*([\d۰-۹٠-٩]+(?:\s*[،,\-–]\s*[\d۰-۹٠-٩]+)?)\s*\)'),sub_name_num),
]
def fix(t):
    for rx,f in RX:t=rx.sub(f,t)
    return t
FIXTAIL=re.compile(r'[\s۔،.]+﴾(?= \[[^\]]+\])')
for f in sorted(glob.glob('quran/tafsir/ur_*.js')):
    s=open(f,encoding='utf8').read();a=s.index('{');b=s.rindex('}')
    d=json.loads(s[a:b+1]);ch=0
    for sn,rows in d.items():
        for r in rows:
            t=FIXTAIL.sub('﴾',fix(r[2]))
            if t!=r[2]:ch+=1;r[2]=t
    if ch:
        print(f,ch)
        if not DRY:open(f,'w',encoding='utf8').write(s[:a]+json.dumps(d,ensure_ascii=False,separators=(',',':'))+s[b+1:])
print(dict(st))
