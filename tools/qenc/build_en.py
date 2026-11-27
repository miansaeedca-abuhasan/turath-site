#!/usr/bin/env python3
"""Quran Encyclopedia (English) `qencen` from the owner's docx (27-11-2026).
Usage: build_en.py <Quran_Encyclopedia_English_Proofread.docx>   (then tools/rehash.py, bump sw.js)
Rows: front matter (Prologue, Good News, An important note, A note for the readers, Definitions of various types of hadith), then one row per entry.
Entry titles = the index titles found in order in the body + centred-bold paragraphs + 9 titles spelled differently in the body.
Line marks: «§title», verse «﴿Arabic n Arabic﴾» (docx ﴿n﴾ verse-end markers become inner numbers), «\\ue030» Arabic block without verse marks,
«\\ue040cell\\ue041cell…» table row. The INDEX of the docx is not copied (the site builds its own list of sections/entries)."""
import sys,re,json,hashlib,os,collections
import docx
from docx.oxml.ns import qn
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
src=sys.argv[1]
d=docx.Document(src)
def ptxt(p):
    out=[]
    for e in p.iter():
        if e.tag==qn('w:t'):out.append(e.text or '')
        elif e.tag in (qn('w:tab'),qn('w:br')):out.append(' ')
    return re.sub(r'\s+',' ',''.join(out).replace('\xa0',' ')).strip()
body=d.element.body
items=[]   # ('p',text,centered,bold,size) | ('t',rows)
def isb(p):
    r=[x for x in p.runs if x.text.strip()];return bool(r) and all(x.bold for x in r)
from docx.text.paragraph import Paragraph
from docx.table import Table
for ch in body.iterchildren():
    if ch.tag==qn('w:p'):
        p=Paragraph(ch,d);items.append(('p',ptxt(ch),str(p.alignment).startswith('CENTER'),isb(p)))
    elif ch.tag==qn('w:tbl'):
        t=Table(ch,d);rows=[[re.sub(r'\s+',' ',c.text.replace('\xa0',' ')).strip() for c in r.cells] for r in t.rows];items.append(('t',rows))
T=[(i,x) for i,x in enumerate(items) if x[0]=='p']
txt=lambda i:items[i][1] if items[i][0]=='p' else ''
AR=re.compile('[؀-ۿ]')
def arabic(t):
    l=len(re.findall(r'[A-Za-z]',t));a=len(AR.findall(t));return a>10 and a>l*3
FRONT=['Prologue','Good News','An important note','A note for the readers','Definitions of various types of hadith']
fpos={}
for i,x in T:
    for f in FRONT:
        if x[1]==f and f not in fpos:fpos[f]=i
# first body title = first entry 'Allah(swt)' after the index (second occurrence)
al=[i for i,x in T if x[1]=='Allah(swt)'];body0=al[1]
idxs=[i for i,x in T if al[0]<=i<body0 and x[1]]
norm=lambda s:re.sub(r'[^a-z0-9]','',s.lower())
IDX=[txt(i) for i in idxs if txt(i)!='Bismillah.' and not AR.search(txt(i)) and len(txt(i))<90]
found={};pos=body0
for t in IDX:
    for i,x in T:
        if i>=pos and x[1] and norm(x[1])==norm(t) and len(x[1])<80:found[i]=x[1];pos=i+1;break
for i,x in T:
    if i>=body0 and x[1] and len(x[1])<60 and x[2] and x[3] and i not in found:found[i]=x[1]
for t in ['Knowledge and Science','Masjid-e-Nabawi','Monasticism(Rahbaniyat)','Sail Al-Arim','Struggle(Strife)','Wood-Worm','Yaghuth','Ya’uq','Jizya']:
    for i,x in T:
        if i>=body0 and x[1]==t and x[3] and i not in found:found[i]=t;break
tit=sorted(found)
print('entry titles',len(tit))
def verse(t):
    if '﴿' not in t:return None
    parts=re.split(r'\s*﴿([٠-٩0-9]+)﴾\s*',t.strip());segs=parts[0::2];nums=parts[1::2]
    if not nums:return None
    o=''
    for k,s in enumerate(segs):
        if not s.strip():continue
        o+=(' ' if o else '')+s.strip()
        if k<len(nums):o+=' '+nums[k]
    return '﴿'+o.strip()+'﴾'
def lines_of(a,b):
    out=[]
    for i in range(a,b):
        x=items[i]
        if x[0]=='t':
            out+=[''+''.join(r) for r in x[1]];continue
        t=x[1]
        if not t:continue
        if arabic(t):
            v=verse(t);out.append(v if v else ''+re.sub(r'\s*﴿[٠-٩0-9]+﴾','',t).strip())
        else:out.append(t)
    return out
rows=[];secs=[]
end_front=body0
# front matter rows
fk=sorted(fpos.items(),key=lambda kv:kv[1]);fe=[v for _,v in fk]+[None]
for n,(f,i) in enumerate(fk):
    j=fe[n+1] if n+1<len(fk) else None
    if f==FRONT[-1]:
        # definitions end where the INDEX starts
        j=next(k for k,x in T if x[1]=='INDEX')
    L=lines_of(i+1,j);rows.append(['§'+f]+L)
# Bismillah line before the entries stays out of the entries: it belongs to the front matter row of the definitions? keep as its own tiny row
bi=[i for i,x in T if x[1]=='Bismillah.' and al[0]<i<body0]
nfront=len(rows)
tit2=tit+[len(items)]
for n,i in enumerate(tit):
    L=lines_of(i+1,tit2[n+1]);rows.append(['§'+found[i]]+L)
R=[[k+1,'\n'.join(r)] for k,r in enumerate(rows)]
# sections: front, then by first letter
def letter(t):
    m=re.search(r'[A-Za-z]',t);return m.group(0).upper() if m else '#'
S=[[1,'Introduction',1,nfront]]
cur=None
for k in range(nfront,len(rows)):
    L=letter(rows[k][0][1:])
    if cur and rows[k][0][1:] in ('Firdaus','Jizya'):L=cur
    if rows[k][0][1:]=='Pharaoh(Firaun)':L='F'   # the book itself places them here (after Pharaoh / before Zubur)
    if L!=cur:S.append([len(S)+1,'Letter '+L,k+1,k+1]);cur=L
    else:S[-1][3]=k+1
letters=[s[1] for s in S[1:]];print(letters)
assert len(set(letters))==len(letters),'letters not contiguous'
json.dump({'rows':R,'sections':S},open('/tmp/qen/rows_en.json','w'),ensure_ascii=False)
print(len(R),'rows; sections',len(S),'; bytes',sum(len(r[1].encode()) for r in R))
