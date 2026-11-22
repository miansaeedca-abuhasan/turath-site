import json,re,collections
A='/mnt/user-data/attachments/c78c1915-dfa8-5395-875d-805b90bb4e15/'
U2E=str.maketrans('۰۱۲۳۴۵۶۷۸۹','0123456789')
REP=[]
STOP2={'تھے','تھا','تھی','جو','ہے','ہیں','تو','بھی','نہ','یہ','وہ','جب','پھر','ہی'}
STOP={'نے','کہ','کہا','کی','کے','کو','سے','میں','پر','اور','نبی','رسول'}
def final_clean(t):
    t=t.replace('‏','').replace('‎','').replace('​','').replace('\xa0',' ').replace('﻿','')
    t=re.sub(r'[ \t]+',' ',t)
    t=re.sub(r' ([،۔؟!؛)\]])',r'\1',t)
    t=re.sub(r'\( ',r'(',t)
    return t.strip()
def seg_fix(t):
    t=re.sub(r'([یى])ٰ',r'\1',t)
    return t.replace('؁','').replace('ـ','')
SPL=re.compile(r'(\(\(.*?\)\)|«.*?»|﴿.*?﴾)',re.S)
def urx(t):
    parts=SPL.split(t);o=[]
    for i,p in enumerate(parts):
        if i%2==0: o.append(seg_fix(p))
        elif p.startswith('(('): o.append('«'+re.sub(r'\s+',' ',p[2:-2]).strip()+'»')
        else: o.append(p.replace('ـ',''))
    t=''.join(o)
    t=re.sub(r'\(\(([^()]*)\)',lambda m:'«'+m.group(1).strip()+'»',t)
    t=re.sub(r'“\s*(.*?)\s*”',lambda m:'’’'+m.group(1)+'‘‘',t,flags=re.S)
    t=re.sub(r'”\s*(.*?)\s*“',lambda m:'’’'+m.group(1)+'‘‘',t,flags=re.S)
    return final_clean(sayy(t))
def ar_clean(t):
    t=t.replace('‏','').replace('‎','').replace('​','').replace('\xa0',' ')
    t=re.sub(r'\(\(\s*(.*?)\s*\)\)',lambda m:'«'+m.group(1)+'»',t,flags=re.S)
    t=t.replace('((','«').replace('))','»')
    return re.sub(r'[ \t]+',' ',t).strip()
def sayy(t):
    reps=[]
    for m in re.finditer(r'حضرت\s+',t):
        rest=t[m.end():]
        mm=re.match(r'((?:[^\s،۔:؛“”’‘()«»"﴿﴾\\]+\s+){1,5}?)(رضی اللہ عن[ہھ](ا?))(?![مںن])',rest)
        if not mm: continue
        names=mm.group(1).split()
        if any(w in STOP or w=='حضرت' for w in names): continue
        if len(names)>3 and (not any(w in('بن','بنت','ابن') for w in names) or any(w in STOP2 for w in names)): continue
        reps.append((m.start(),m.start()+4,'سیدہ' if mm.group(3) else 'سیدنا'))
    for a,b,r in reversed(reps): t=t[:a]+r+t[b:]
    return t
def verse_line(l):
    m=re.match(r'^﴿\s*(.*?)\s*﴾\s*\(([^)]*)\)\s*$',l)
    if m: return '﴿ '+ar_clean(m.group(1))+' ﴾ ['+seg_fix(re.sub(r'\s*:\s*',': ',m.group(2).strip()))+']'
    return None
