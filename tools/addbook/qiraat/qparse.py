# -*- coding: utf-8 -*-
"""Page-flow JSON of «القراءة خلف الإمام» (owner file Qiraat_Khalf_ul_Imam_Mukammal.json, 26-11-2026) -> narrations, babs, intro.
Each JSON page = {page, content}; content = running header line, printed page line, then paragraphs; footnotes at the end of the page («❶ …», «① …», «۱ …»)."""
import json,re,sys,collections
U2E=str.maketrans('۰۱۲۳۴۵۶۷۸۹','0123456789')
CIRC={c:i+1 for i,c in enumerate('①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳')};CIRC.update({c:i+1 for i,c in enumerate('❶❷❸❹❺❻❼❽❾❿')})
H=re.compile('[ً-ْٰ]');LT=re.compile('[ء-يٱ-ۓ]')
HDR='کتاب قراءۃ خلف الامام'
FNS=re.compile(r'^([①-⑳❶-❿]|[۱-۹][۰-۹]?(?=[\s۔\.]))[۔\.]?\s*(.*)$',re.S)
MARKRE=re.compile(r'([①-⑳❶-❿])|\s*\(([۱-۹][۰-۹]?)\)\s*$|(?<=[۔\.\)\]’”:؟!])\s*([۱-۹][۰-۹]?)\s*$')
def num(s): return int(s.translate(U2E))
def is_ar(ln):
    l=len(LT.findall(ln))
    if l<4: return False
    r=len(H.findall(ln))/l
    return r>=(0.5 if l<15 else 0.55)
def load(path):
    d=json.load(open(path,encoding='utf-8'));return {p['page']:p['content'] for p in d}
def page_parts(k,c):
    L=c.split('\n')
    if L[0].strip()==HDR: L=L[1:]
    if L and re.fullmatch(r'[۰-۹0-9]+',L[0].strip()): L=L[1:]
    # footnote block: from the first note start («1» in some style) to the end of the page
    first=None
    for i,ln in enumerate(L):
        m=FNS.match(ln.strip())
        if m:
            g=m.group(1);n=CIRC.get(g) or num(g)
            if n==1: first=i;break
    body=L if first is None else L[:first];fn=[] if first is None else L[first:]
    notes=[];exp=1
    for ln in fn:
        m=FNS.match(ln.strip())
        if m:
            g=m.group(1);n=CIRC.get(g) or num(g)
            if n==exp: notes.append(m.group(2).strip());exp+=1;continue
        if notes: notes[-1]+=' '+ln.strip()
        else: body.append(ln)
    return body,notes
if __name__=='__main__':
    pg=load(sys.argv[1]);bad=0
    for k in sorted(pg):
        if k<55: continue
        body,notes=page_parts(k,pg[k]);marks=0
        for ln in body:
            marks+=len(re.findall('[①-⑳❶-❿]',ln))
            if not re.search('[①-⑳❶-❿]',ln):
                m=re.search(r'\(([۱-۹][۰-۹]?)\)\s*$|(?:[۔\.\)\]’”:؟!])\s*([۱-۹][۰-۹]?)\s*$',ln)
                if m: marks+=1
        if marks!=len(notes): bad+=1;print('page',k,'marks',marks,'notes',len(notes))
    print('pages with mismatch',bad)
