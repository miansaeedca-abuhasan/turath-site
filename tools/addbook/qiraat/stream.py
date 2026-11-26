# -*- coding: utf-8 -*-
"""stage 1: JSON pages -> ordered stream of items (bab / narration start / arabic / urdu paragraph) with footnote marks as \x01<gid>\x01 and notes in NOTES[gid]."""
import re,json,sys
from qparse import load,is_ar,FNS,CIRC,num,HDR,H,LT
U2E=str.maketrans('۰۱۲۳۴۵۶۷۸۹','0123456789')
E2U=str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹')
CREV={}
for c,i in CIRC.items(): CREV.setdefault(i,[]).append(c)
BAB=re.compile(r'^باب(?:\s*نمبر)?\s*[:：]?\s*([0-9۰-۹]+)\s*$')
MARK=re.compile(r'^\[([0-9۰-۹]+)\]\s*\.*\s*(.*)$',re.S)
CONT=re.compile(r'^\(سابقہ صفحے کے حاشیہ\s*([①-⑳❶-❿])\s*کا بقیہ حصہ\s*:?\)\s*:?\s*(.*)$',re.S)
NOTES={};LOG=[];_g=[0]
NL=re.compile(r'^(?:([①-⑳❶-❿])|([۱-۹][۰-۹]?)(?=[\s۔\.])[۔\.]?|\(([۱-۹0-9][۰-۹0-9]?)\))\s*(.*)$',re.S)
PAREN=[True]
def note_lead(s):
    m=NL.match(s.strip())
    if not m or (m.group(3) and not PAREN[0]): return None
    g=m.group(1)
    n=CIRC[g] if g else num(m.group(2) or m.group(3))
    return n,m.group(4).strip()
def split_page(k,c):
    L=[x for x in c.split('\n')]
    if L and L[0].strip()==HDR: L=L[1:]
    if L and re.fullmatch(r'[۰-۹0-9]+',L[0].strip()): L=L[1:]
    first=None
    for i,ln in enumerate(L):
        nl=note_lead(ln)
        if not nl: continue
        # chain test: from i to the end every note-looking line must continue the numbering
        prev=nl[0];ok=True
        for ln2 in L[i+1:]:
            n2=note_lead(ln2)
            if n2:
                if n2[0] in (prev,prev+1): prev=n2[0]
                else: ok=False;break
        if ok and (nl[0]==1 or i>=len(L)//3 and not (nl[0]<=3 and len(L)-i>30)): first=i;break
    body=L if first is None else L[:first];fn=[] if first is None else L[first:]
    notes=[]
    for ln in fn:
        s=ln.strip();nl=note_lead(s)
        if nl: notes.append([nl[0],nl[1]]);continue
        if notes: notes[-1][1]+=' '+s
        else: body.append(ln)
    if k==250 and len(notes)==3 and notes[2][1].endswith(' صحیح۔'):   # the 4th note «صحیح۔» lost its ❹ in the file (checked on the PDF page 250)
        notes[2][1]=notes[2][1][:-len(' صحیح۔')].strip();notes.append([4,'صحیح۔'])
    return [b for b in body if b.strip()],notes
def tok(j):
    J='(?:%s|%d)'%(str(j).translate(E2U),j)
    cs=''.join(CREV.get(j,[]))
    p=r'\(%s\)|(?<![0-9۰-۹])(?<=[\s۔\.،:’”»\)\]])%s(?![0-9۰-۹])(?=\s|$)'%(J,J)
    if cs: p='['+cs+']|'+p
    return re.compile(p)
PEND=[]
HEADRE=re.compile(r'^(?:باب|فصل)(?:\s*نمبر)?\s*[:：]?\s*\(?[0-9۰-۹]+\)?\s*[:：]?\s*$')
def place_marks(k,body,notes):
    """replace the marks of one page by sentinels; notes whose mark is not on this page wait for the next page"""
    text='\n'.join(body)
    mask='\n'.join(re.sub(r'[0-9۰-۹]','#',l) if (HEADRE.match(l.strip())) else l for l in body)
    # notes left over from the previous page: their mark stands near the start of this page
    left=[]
    pos0=0
    for n,t in []:
        m=tok(n).search(text,pos0,1800)
        if m:
            _g[0]+=1;g=_g[0];NOTES[g]=t
            a=m.start()
            while a>pos0 and text[a-1] in ' \u00a0': a-=1
            text=text[:a]+'\x01%d\x01'%g+text[m.end():];pos0=a+len('\x01%d\x01'%g)
            LOG.append((k,'late mark %d placed'%n))
        else: left.append((n,t))
    PEND[:]=[]
    pos=pos0;out=[];gids=[]
    for n,t in notes:
        m=tok(n).search(mask,pos)
        if not m: LOG.append((k,'ORPHAN note %d (no mark in text): %s'%(n,t[:40])));gids.append(None);continue
        _g[0]+=1;g=_g[0];NOTES[g]=t;gids.append(g)
        rep='\x01%d\x01'%g
        a=m.start()
        while a>pos and text[a-1] in ' \u00a0': a-=1
        out.append(text[pos:a]);out.append(rep);pos=m.end()
    out.append(text[pos:])
    for (n,t),g in zip(notes,gids):
        if g is None: _g[0]+=1;NOTES[_g[0]]=t;out.append(' \x01%d\x01'%_g[0])
    return ''.join(out).split('\n')
def stream(pg,lo,hi,skip=()):
    items=[];prev=None
    for k in range(lo,hi+1):
        if k not in pg or k in skip: continue
        PAREN[0]=k>=55
        body,notes=split_page(k,pg[k])
        if body and CONT.match(body[-1].strip()) or (body and CONT.match(body[0].strip())):
            idx=-1 if CONT.match(body[-1].strip()) else 0
            m=CONT.match(body[idx].strip());j=CIRC[m.group(1)]
            body.pop(idx)
            if prev and j<=len(prev): 
                g=prev[j-1]
                if g: NOTES[g]+=' '+m.group(2).strip()
            else: LOG.append((k,'cont lost'))
        body=place_marks(k,body,notes)
        prev=[int(x) for x in []] or None
        # remember gids of this page in order of appearance
        prev=[int(x) for ln in body for x in re.findall(r'\x01(\d+)\x01',ln)]
        for ln in body:
            s=ln.strip()
            if not s: continue
            items.append((k,s))
    return items
