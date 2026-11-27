#!/usr/bin/env python3
"""Muhaddithin-e-Andulus: Aik Taaruf (Urdu) `andulusur` (owner 27-11-2026). Input: the owner's JSON (list of {page, content}; page 0 = author intro,
pages 21..532 = printed pages; PDF page = printed - 8).  Page text = body paragraphs + page-foot notes («۱- …» / «(۱) …» lines).  Marks «(۱)» of a page are
renumbered per row, notes go to ext.fn.  Rows: author intro, front, one row per person (heading detection, see HEAD) or ~3500 chars, century/section headings = `§`.
Then: python3 tools/order_tail.py ; python3 tools/rehash.py ; bump sw.js ; tests/andulus_book.js"""
import os,json,re,sys,os,hashlib,glob
SRC=sys.argv[1]
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','..'))
KEY='andulusur'
d=json.load(open(SRC,encoding='utf-8'))
UD=str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹');DU=str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩','01234567890123456789')
def num(s): return int(s.translate(DU))
FN=re.compile(r'^\(?([۰-۹0-9]{1,2})\)?\s*(?:[-–۔\.]\s*|\s)(?=\S)')
FN2=re.compile(r'^(?:\(([۰-۹0-9]{1,2})\)\s+|([۰-۹0-9]{1,2})\s*[-–۔\.]\s*|-\s*([۰-۹0-9]{1,2})\s+)')
MK=re.compile(r'\(([۰-۹]{1,2})\)')
rep=[];rows=[];
def split_page(p,content):
    L=[l.strip() for l in content.split('\n') if l.strip()]
    best=None
    for i,l in enumerate(L):
        m=FN2.match(l)
        if m and num(m.group(1) or m.group(2) or m.group(3))==1:
            exp=2;ok=True
            for l2 in L[i+1:]:
                m2=FN2.match(l2)
                if m2:
                    n=num(m2.group(1) or m2.group(2) or m2.group(3))
                    if n==exp: exp+=1
                    elif n<exp and n>1: pass
                    else: ok=False;break
            if ok: best=i
    if best is None:
        k=0;exp=1
        for m in MK.finditer('\n'.join(L)):
            if num(m.group(1))==exp: exp+=1
        k=exp-1
        REF=re.compile(r'؛.*[۰-۹]|[۰-۹]+\s*/\s*[۰-۹]|ترجمہ\s*[۰-۹]')
        tail=[]
        for l in reversed(L):
            if REF.search(l) and not MK.search(l[:6]) and len(tail)<k: tail.insert(0,l)
            else: break
        if k and len(tail)==k: return L[:len(L)-k],tail
        if k==1 and not tail and len(L)>2 and not L[-2].rstrip().endswith(('۔','؟',':')) and L[-1].rstrip().endswith('۔'):
            return L[:-1],[L[-1]]  # unnumbered foot note after a paragraph cut by the page end (p195)
        return L,[]
    body=L[:best];notes=[];cur=None
    for l in L[best:]:
        m=FN2.match(l)
        if m and num(m.group(1) or m.group(2) or m.group(3))==len(notes)+1:
            notes.append(l[m.end():].strip())
        else: notes[-1]+=' '+l
    return body,notes
# ---- pages
pages=[]
for x in d:
    p=x['page']
    if p==0: continue
    body,notes=split_page(p,x['content'])
    mk=[];exp=1
    for m in MK.finditer('\n'.join(body)):
        if num(m.group(1))==exp: mk.append(exp);exp+=1
    if notes and not mk:
        body=[l.strip() for l in x['content'].split('\n') if l.strip()];notes=[]
    if len(mk)!=len(notes): rep.append('p%d: real marks %d notes %d'%(p,len(mk),len(notes)))
    pages.append((p,body,notes))
# ---- paragraph stream with page markers: (page, text, notes_of_page_list_used_flag)
HEAD=re.compile(r'\((?:[^()]*?ھ)\s*[۔\-–ـ]*\s*(?:[^()]*?ھ)[^()]*\)\s*$')
WOM=('ابنة فائز','اسماء بنت','ام الحسن بنت ابو لواء','ام السعد','ام شریح','ام عبد الکریم','ام العلاء','ام الھناء','ام الولید','حفصہ بنت الاستاذ','حفصہ بنت الفقیہ','حمیدہ بنت','خدیجہ بنت','رضیہ مولاة','رقیہ بنت تمام','زینب بنت','عابدہ المدنیہ','عائشہ بنت القاضی','فاطمہ بنت','لیلیٰ (م','نزہت بنت')
CRANGE=[(67,100,199),(79,200,299),(109,300,399),(189,400,499),(291,500,599),(395,600,699),(477,700,799)]
def is_head(l,p=0):
    if 507<=p<527: return l.startswith(WOM) and len(l)<140 and not l.endswith('۔')
    if not ((30 if (69<=p<=85 or 132<=p<=504) else 46)<=len(l)<=125 and l.endswith(')') and 'ھ' in l[-32:] and l.count('(')==1 and not l.startswith('(')): return False
    if re.match(r'^(وفات|شیوخ|تلامذہ|علمی مقام|تصانیف|ولادت|نام)\s*:',l): return False
    if re.search(r'[۔؟]\s',l.split('(')[0]): return False
    ys=re.findall(r'[۰-۹]{3}',l.split('(')[1])
    if not ys: return False
    y=int(''.join(str(ord(c)-0x6f0) for c in ys[-1]))
    for st,lo,hi in CRANGE:
        pass
    rng=[(lo,hi) for st,lo,hi in CRANGE if p>=st]
    if rng and not (rng[-1][0]<=y<=rng[-1][1]+30): return False
    return True
CENT={67:'دوسری صدی ہجری',79:'تیسری صدی ہجری',109:'چوتھی صدی ہجری',189:'پانچویں صدی ہجری',291:'چھٹی صدی ہجری',395:'ساتویں صدی ہجری',477:'آٹھویں صدی ہجری',507:'محدثات',527:'مصادر و مراجع'}
SECT={21:'دیباچہ',27:'مقدمہ',65:'اختصارات',**CENT}
inlist=[False]
LABEL=re.compile(r'^(شیوخ|تلامذہ|اساتذہ|شاگرد|تصانیف|تالیفات|مؤلفات)[^:]{0,25}:')
CONTENTS="""69 71 72 73 75 76 81 82 85
132 134 135 136 138 139 141 143 146 148 150 153 155 157 159 162 163 164 167 168 172 174 177
178 180 182 185 191 192 194 196 197 201 202 204 204 206 207 210 211 212 215 216 217
220 223 225 226 227 230 232 235 237 239 240 241 245 247 248 250 254 256 259 263 267 269 271
272 274 276 277 280 282 284 286 288 293 294 296 300 302 304 307 308 310 311 314 316
318 321 323 327 331 333 336 337 339 340 342 344 346 349 353 355 356 359 362 364 367 369 372
375 378 380 383 387 389 390 397 399 402 405 408 410 414 418 420 423 425 428 431 433
437 440 442 444 448 452 455 458 460 462 465 466 469 472 479 484 487 490 492 495 497 500 504"""
from collections import Counter
EXP=Counter(int(x) for x in CONTENTS.split())   # printed page -> number of persons whose entry starts there (PDF contents; pp.88-129 not in the PDF contents)
def cand(l):
    if not (25<=len(l)<=140) or l.endswith('۔') or l.startswith('('): return False
    if re.match(r'^(وفات|شیوخ|تلامذہ|علمی مقام|تصانیف|تالیفات|ولادت|نام|حالات)',l): return False
    return bool(re.search(r'\([^()]*[۰-۹]{3}\s*ھ[^()]*\)\s*(?:\(\s*[۰-۹]{1,2}\s*\)\s*)?$',l)) or bool(re.search(r'\([^()]*[۰-۹]{3}\s*ھ[^()]*\)\s*[^()۔]{0,60}$',l))
units=[]   # (kind,text,page,notes) kind: h=heading, p=paragraph
# a heading glued to the first words of its paragraph in the JSON line («name (… ھ) paragraph …») is cut into two lines
GL=re.compile(r'^(.{40,125}?\([^()]*[۰-۹]{3}\s*ھ[^()]*\))\s+(\S.{20,})$')
def unglue(p,body):
    out=[]
    for l in body:
        m=GL.match(l)
        if m and is_head(m.group(1),p) and not LABEL.match(l) and not re.match(r'^(وفات|علمی مقام|تالیفات|شیوخ|تلامذہ)',l):
            out+= [m.group(1),m.group(2)]
        else: out.append(l)
    return out
pages=[(p,unglue(p,body),notes) for p,body,notes in pages]
CHOSEN={}
def covered(p): return 69<=p<=85 or 132<=p<=504
# 1) every line that looks like a person heading (old rule) and every looser candidate, with a score
A=[];K=[];_il=False
for p,body,notes in pages:
    if not covered(p): continue
    for j,l in enumerate(body):
        il=_il
        if LABEL.match(l): _il=True
        elif len(l)>130 or l.endswith('۔') or re.match(r'^(علمی مقام|وفات|ولادت|نام|حالات)',l): _il=False
        if is_head(l,p) and not il: A.append((p,j))
        if cand(l):
            prev=body[j-1] if j else ''; nxt=body[j+1] if j+1<len(body) else ''
            v=(1 if (not prev or prev.endswith(('۔',')','؟',':'))) else 0)+(2 if len(nxt)>60 else 0)+(2 if not il else 0)+(0.5 if len(l)>=38 else 0)
            K.append((p,j,v))
# 2) match the printed contents (page of each person) to the detected headings, nearest page within 3 pages, in order
cont=sorted(int(x) for x in CONTENTS.split() if covered(int(x)))
used=set();pos=0;free=[];lastp=0
for c in cont:
    best=None
    for q in A:
        if q in used or q[0]<lastp: continue
        dd=abs(q[0]-c)
        if dd<=3 and (best is None or dd<best[0]): best=(dd,q)
    if best: used.add(best[1]);lastp=best[1][0]
    else: free.append(c)
# 3) contents entries with no detected heading: the best looser candidate within 2 pages
for c in free:
    cs=[(-v,pj,j) for pj,j,v in K if abs(pj-c)<=2 and (pj,j) not in used]
    if cs:
        cs.sort();used.add((cs[0][1],cs[0][2]));rep.append('contents page %d: heading taken by the looser rule on page %d'%(c,cs[0][1]))
    else: rep.append('contents page %d: no heading found'%c)
for p,j in used: CHOSEN.setdefault(p,set()).add(j)
for p,body,notes in pages:
    CHOSEN.setdefault(p,set())
rep.append('contents persons (known part) %d, matched %d'%(len(cont),len(used)))
for p,body,notes in pages:
    mark_i=[0]
    for j,l in enumerate(body):
        if j==0 and p in SECT and (l==SECT[p] or p==65):
            units.append(('s',SECT[p],p,[]))
            if p==65 and l!=SECT[p]:
                rest=l.replace('اختصارات','',1).strip()
                if rest and rest!='مصادر': units.append(('p',rest,p,[]))
            continue
        # marks of this line that are real footnote marks (running 1..len(notes) over the page)
        def real(m):
            if mark_i[0]<len(notes) and num(m.group(1))==mark_i[0]+1:
                mark_i[0]+=1;return '\ue000%d\ue001'%mark_i[0]
            return m.group(0)
        l2=MK.sub(real,l)
        ks=[int(x) for x in re.findall('\ue000(\d+)\ue001',l2)]
        hd=(j in CHOSEN[p]) if covered(p) else is_head(l,p)
        if LABEL.match(l): inlist[0]=True
        elif hd and inlist[0]:
            hd=False;rep.append('DEMOTED p%d %s'%(p,l[:90]))
        elif len(l)>130 or l.endswith('۔') or re.match(r'^(علمی مقام|وفات|ولادت|نام|حالات)',l): inlist[0]=False
        if hd: inlist[0]=False
        units.append(('h' if hd else 'p',l2,p,[notes[k-1] for k in ks]))
# join paragraphs cut by a page end
out=[]
for u in units:
    if out and u[0]=='p' and out[-1][0]=='p' and out[-1][2]!=u[2] and len(out[-1][1])>150 and not re.search(r'[۔؟!:)’”»\]]\s*$',out[-1][1]) and not MK.match(u[1]) :
        out[-1]=('p',out[-1][1]+' '+u[1],out[-1][2],out[-1][3]+u[3]);continue
    out.append(u)
units=out
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'headings.txt'),'w',encoding='utf-8').write('\n'.join('%d\t%s'%(u[2],u[1]) for u in units if u[0]=='h'))
# rows
def finish(cur,rows):
    if not cur: return
    txt=[];notes=[];n=0
    for kind,t,pg,ns in cur:
        if kind in 'sh': txt.append('§'+t);continue
        idx=[0]
        def f(m):
            nonlocal_n=idx[0];idx[0]+=1
            return '(@%d)'%nonlocal_n
        # renumber marks in this paragraph in order
        parts=[];i=0;q=0
        for m in re.finditer('\ue000\d+\ue001',t):
            n+=1;parts.append(t[i:m.start()]);parts.append('(%d)'%n);i=m.end()
            notes.append((n,ns[q] if q<len(ns) else ''));q+=1
        parts.append(t[i:]);txt.append(''.join(parts))
    notes=[x for x in notes]
    full='\n'.join(txt)
    if full.count('"')%2: rep.append('odd straight quotes in row %d'%(len(rows)+1))
    full=re.sub(r'ڈاکٹر صاحب(\s+کی\s+اس\s+گر)',r'ڈاکٹر صاحبہ\1',full)   # owner 27-11-2026: the author is a woman
    full=re.sub(r'"([^"\n]*)"',lambda m:'’’'+m.group(1)+'‘‘',full)
    rows.append([full,'\n'.join('(%d) %s'%(a,b.translate(UD)) for a,b in notes if b)])
cur=[];size=0;secs=[]
intro=d[0]['content'].split('\n',1)
rows.append(['§'+intro[0]+'\n'+re.sub(r'ڈاکٹر صاحب(\s+کی\s+اس\s+گر)',r'ڈاکٹر صاحبہ\1',intro[1].strip()),''])   # the author is a woman (owner 27-11-2026)
secs.append(['مصنفہ کا تعارف',1])
for u in units:
    kind=u[0]
    if kind=='s':
        finish(cur,rows);cur=[];size=0;secs.append([u[1],len(rows)+1]);cur.append(u);continue
    if kind=='h' and cur and any(x[0]=='p' for x in cur):
        finish(cur,rows);cur=[];size=0
    elif size>3500 and kind=='p' and any(x[0]=='p' for x in cur):
        finish(cur,rows);cur=[];size=0
    cur.append(u);size+=len(u[1])+sum(len(x) for x in u[3])
finish(cur,rows)
rows=[[i+1,r[0],'',{'fn':r[1]}] if r[1] else [i+1,r[0]] for i,r in enumerate(rows)]
# sections [id,title,start,end]
S=[];st=[s for s in secs]
for i,(t,a) in enumerate(st):
    b=(st[i+1][1]-1) if i+1<len(st) else len(rows)
    S.append([i+1,t,a,b,''])
nheads=sum(1 for u in units if u[0]=='h')
rep.append('rows %d، sections %d، person headings %d'%(len(rows),len(S),nheads))
def jd(x): return json.dumps(x,ensure_ascii=False,separators=(',',':'))
for f in glob.glob(f'coll/{KEY}_*'): os.remove(f)
files=[];cur=[];size=0
def fl():
    global cur,size
    if not cur: return
    body='COLLDATA("%s","ur",%s)'%(KEY,jd(cur));h=hashlib.md5(body.encode()).hexdigest()[:6];name=f'{KEY}_ur_{len(files)+1}_{h}.js'
    open('coll/'+name,'w',encoding='utf-8').write(body)
    files.append([cur[0][0],cur[-1][0],name,len(body.encode()),hashlib.md5(body.encode()).hexdigest()[:10]]);cur=[];size=0
for r in rows:
    cur.append(r);size+=len(r[1])+(len(r[3]['fn']) if len(r)>3 else 0)
    if size>90000: fl()
fl()
entry={"key":KEY,"ar":"المحدثون في الأندلس: تعريف (ترجمة أردية)","ur":"محدثین اندلس: ایک تعارف","en":"Muhaddithin of Andalusia: An Introduction (Urdu)",
"sub":{"ur":"تالیف: پروفیسر ڈاکٹر جمیلہ شوکت — دوسری سے آٹھویں صدی ہجری کے محدثین اور محدثات کے حالات",
"ar":"تأليف: الأستاذة الدكتورة جميلة شوكت — تراجم المحدثين والمحدثات في الأندلس من القرن الثاني إلى القرن الثامن الهجري",
"en":"By Prof. Dr. Jamila Shaukat — biographies of the muhaddithin and muhaddithat of Andalusia, 2nd to 8th century AH"},
"sections":S,"prose":True,"langs":["ur"],"files":{"ur":[[a,b,n] for a,b,n,_,_ in files]},"count":len(rows)}
s=open('coll/index.js',encoding='utf-8').read()
A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')]);A=[e for e in A if e['key']!=KEY];A.append(entry)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+jd(A)+')')
o=json.load(open('offline.json',encoding='utf-8'));o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
o['groups'].append({"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in files],"b":sum(x[3] for x in files)})
open('offline.json','w',encoding='utf-8').write(jd(o))
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'report.txt'),'w',encoding='utf-8').write('\n'.join(rep))
print('\n'.join(rep[-3:]),len(rep))
