"""Arabic phrases inside the Urdu text of the Quran Encyclopedia (qenc): detection + letter shapes."""
import re,unicodedata
N=lambda t:unicodedata.normalize('NFC',t)
URDU_ONLY=set('ٹڈڑںےۓگچپژ')
HAR=re.compile('[ً-ْ]')
STOP=set('تالیف تاليف سورة سورۃ سورہ کے کی کا کو ہے ہیں اور میں سے نے پر وہ یہ جو کہ بھی نہیں ایک اس تھا تھی تھے لیے لئے کیا کیوں ہر کر والا والی والے جس جن اپنا اپنی اپنے ساتھ پھر تو ہوا ہوئی ہوں'.split())
CONN=set('من في فی على علی إلى الى إلی إلي عن لا ما أن ان إن و ثم أو او إذا اذا كان کان قال قالت لم لن ولا وما وأن فما فمن وفي وفی وعلى وعلی ومن وإن به بها له لها هو هي هذا هذه ذلك ذلک إلا الا بين بل قد كل کل أنا انا أنت الله اللہ علیہ عليه وسلم وسلم صلی صلى رسول رضی رضي عنه عنہ'.split())
def core(w):return re.sub(r'[^؀-ۿ]','',w)
def bare(w):return re.sub('[ً-ْٰ]','',core(w))
def is_u(w):
    c=core(w);return any(x in URDU_ONLY for x in c) or bare(w) in STOP
def cls(w):
    w=N(w);c=core(w)
    if not re.search('[ء-يٱ-ۓ]',c):return 'P'
    if is_u(w):return 'U'
    b=bare(w);h=len(HAR.findall(c))
    hv=len(re.findall('[ًٌٍَُّْ]',c))
    if h>=2 and hv>=1 or (hv>=1 and b not in CONN) or re.search('[أإٱة]',b) or 'ه' in b:return 'S'
    if b in CONN:return 'C'
    if b.startswith('ال') and len(b)>3:return 'L'
    return 'A'
def arabic_phrase(text):
    text=N(text)
    ws=[w for w in re.split(r'\s+',re.sub(r'[«»“”"’‘]','',text).strip()) if re.search('[ء-ۓ]',w)]
    if not ws:return False
    k=[cls(w) for w in ws]
    if 'U' in k:return False
    s=k.count('S');l=k.count('L');c=k.count('C');am=k.count('A')*0.5
    if s==0 and not(l>=1 and len(ws)>=2 and (l+c)>=len(ws)*0.6):return False
    return (s+l+c+am)/len(ws)>=0.6
EXC=set('علي الي إلي حتي متي سوي هدي اولي أولي بلي موسي عيسي يحيي الكبري الصغري الوسطي الحسني الاخري الأخري الأعلي الاعلي الهدي التقوي مولي الاولي الأولي الفتوي فتوي دعوي تعالي لدي القربي الشوري الاسري وعلي صلي وصلي أزكي ازكي وأزكي اسري المثني المنتهي سيدي'.split())
def to_ar(t):
    t=N(t);out=[]
    for m in re.finditer(r'[؀-ۿ]+|[^؀-ۿ]+',t):
        w=m.group(0)
        if not re.match('[؀-ۿ]',w):out.append(w);continue
        w=w.replace('ہ','ه').replace('ۃ','ة').replace('ک','ك').replace('ھ','ه').replace('ے','ي').replace('ۓ','ي')
        w=re.sub(r'(?<![هھ])ـ+','',w)
        b=bare(w).replace('ی','ي')
        if re.search('َ[یي]$',w) and len(bare(w))>=3:w=w[:-1]+'ى'
        elif bare(w).endswith('ی') and re.search('ی$',w):
            i=w.rindex('ی');w=w[:i]+('ى' if b in EXC else 'ي')+w[i+1:]
        out.append(w.replace('ی','ي'))
    return ''.join(out)
