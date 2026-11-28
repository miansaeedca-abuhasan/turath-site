#!/usr/bin/env python3
"""Seerat Encyclopedia (Dar-us-Salam, 7 vols) `seeratency` (owner 27-11-2026). Input: folder with SeeratEncyclopediaVol1..7_Mukammal.json (list of {page,content,images}).
One row per PRINTED PAGE (JSON page = printed page; checked on jild 1 p148, jild 3 p239/p256). Row = page text: «§heading» lines, paragraphs, «[تصویر: …]» lines kept, marks «(n)» + ext {fn,im,v}.
Chapters = pages whose first lines are «باب N» (N running per volume); glossary «تفصیل حواشی …» to volume end. Then: tools/order_tail.py, tools/rehash.py, bump sw.js."""
import os,sys,re,json,glob,hashlib
SRC=sys.argv[1]
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','..'))
sys.path.insert(0,'tools/pages')
KEY='seeratency'
UD=str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹');DU=str.maketrans('۰۱۲۳۴۵۶۷۸۹¹²³⁴⁵⁶⁷⁸⁹','01234567891234567891'.replace('1','1')[:0]+'0123456789123456789')
SUP=dict(zip('¹²³⁴⁵⁶⁷⁸⁹','123456789'))
def num(s):
    s=''.join(SUP.get(c,c) for c in s);return int(s.translate(str.maketrans('۰۱۲۳۴۵۶۷۸۹','0123456789')))
D='[۰-۹0-9¹²³⁴⁵⁶⁷⁸⁹]'
NS=re.compile(r'^(%s{1,2})\s*[۔\-\.]?\s+(?=\S)'%D)
IMG=re.compile(r'^\[تصویر')
LEG=re.compile(r'^(نقشے کے اہم مقامات|اشارات|شجرے کے|شجرے کا|خاکے کے)')
rep=[];rows=[];secs=[];pgv=[]
def split_notes(L):
    """returns body lines, notes list, tail (image/legend lines after the notes)"""
    L=[l for l in L]
    if L and re.match(r'^حواشی\s*:?$',L[-1]): pass
    best=None
    for i,l in enumerate(L):
        if IMG.match(l): continue
        m=NS.match(l)
        if m and num(m.group(1))==1: best=i
    if best is None: return L,[],[]
    notes=[];tail=[];exp=1;ok=True
    for l in L[best:]:
        if IMG.match(l) or LEG.match(l) or tail: tail.append(l);continue
        m=NS.match(l)
        if m and num(m.group(1))==exp:
            notes.append(l[m.end():].strip());exp+=1
            # several notes on one line
            while True:
                mm=re.search(r'\s(%s{1,2})\s*[۔\-\.]?\s+(?=\S)'%D,notes[-1])
                if mm and num(mm.group(1))==exp and mm.start()>3:
                    rest=notes[-1][mm.end():];notes[-1]=notes[-1][:mm.start()].strip();notes.append(rest.strip());exp+=1
                else: break
        elif m and num(m.group(1))>exp: ok=False;break
        else:
            if notes: notes[-1]+=' '+l
            else: ok=False;break
    if not ok or not notes: return L,[],[]
    refish=sum(1 for n in notes if re.search(r'[\d۰-۹]|ص|کتاب|صحیح|تفسیر|دیکھ',n))
    if len(notes)>8 or refish<len(notes)*0.6 or any(len(n)>600 for n in notes):
        rep.append('notes rejected (%d)'%len(notes));return L,[],[]
    b=L[:best]
    if b and re.match(r'^حواشی\s*:?$',b[-1]): b=b[:-1]
    return b,notes,tail
def mark_body(body,k):
    """footnote call-marks are found BY VALUE (the print does not order them): a single-digit token n right after text/punctuation, not part of a number, ratio, list or reference"""
    text='\n'.join(body);placed=0;used=[]
    for n in range(1,k+1):
        v='(?:%d|%s|%s)'%(n,str(n).translate(str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹')),'¹²³⁴⁵⁶⁷⁸⁹'[n-1])
        P='۔\\.\\)»”“"’‘،؛؟!﴾'
        pt=re.compile(r'\(\s*%s\s*\)|(?<=[%s\u0600-\u06ff\u064b-\u0652])%s(?=$|\s|[۔،\.\)])|(?<=[%s])[ \u00a0]%s(?=$|\s|[۔،\.\)])'%(v,P,v,P,v),re.M)
        for m in pt.finditer(text):
            a=m.start()
            if any(abs(a-u)<2 for u in used): continue
            pre=text[max(0,a-3):a]
            if re.search(r'[\d۰-۹:/\-]\s?$',pre) and not m.group(0).startswith('('): continue
            text=text[:a]+'(%d)'%n+text[m.end():];used=[u+(len('(%d)'%n)-(m.end()-a)) if u>a else u for u in used]+[a];placed+=1;break
    return text.split('\n'),placed
def quotes(l):
    l=re.sub(r'[”“]([^”“\n]*)[”“]',lambda m:'’’'+m.group(1)+'‘‘',l)
    if '’’' in l or '‘‘' in l: return re.sub(r'"([^"]*)"',lambda m:'’'+m.group(1)+'‘',l)
    n=l.count('"')
    if not n: return l
    if n%2==0: return re.sub(r'"([^"]*)"',lambda m:'’’'+m.group(1)+'‘‘',l)
    if l.startswith('"'): return '’’'+re.sub(r'"([^"]*)"',lambda m:'’'+m.group(1)+'‘',l[1:])
    if l.rstrip('()0123456789 ').endswith('"'):
        i=l.rindex('"');return re.sub(r'"([^"]*)"',lambda m:'’'+m.group(1)+'‘',l[:i])+'‘‘'+l[i+1:]
    return l.replace('"','‘‘')
def head(l,prev,nxt,first):
    if len(l)>70 or len(l)<3: return False
    if re.search(r'[۔؟!:"”’‘»،؛\)\]\.]$',l) or l[0] in '[(﴿"“’' or re.match(r'^%s'%D,l): return False
    if re.search(r'[ً-ْ]{2}',l): return False
    if re.match(r'^(نقشے|اشارات|شجرے)',l): return False
    if first and not (nxt and len(nxt)>55 and (prev is None)): return False
    if nxt is None: return False
    return True
files=sorted(glob.glob(SRC+'/*SeeratEncyclopediaVol*_Mukammal*.json'),key=lambda f:int(re.search(r'Vol(\d)',f).group(1)))
assert len(files)==7
cnt=0;mk_unplaced=0
MISS={1:list(range(10,29))}   # images: v1 = PDF page p, v3 = PDF page p+2 (checked by content)
# jild 3 printed 258 259 262 263 266 267 270 271 274 275 278 279 282 283 286 287 and jild 2 printed 468 469 are NOT in the owner's PDFs (jild 3 pp.260-291 of the PDF are duplicate scans);
# the owner supplied photos of the printed pages (28-11-2026), transcribed by hand from the photos -> owner_pages.json ({v,page,content,images}); the page picture is the photo itself
OWNER=json.load(open(os.path.join('tools/addbook/seerat','owner_pages.json'),encoding='utf-8'))
for f in files:
    v=int(re.search(r'Vol(\d)',f).group(1));d=json.load(open(f,encoding='utf-8'))
    chap=0;gloss=False;started=False;cur=None
    # pages the JSON lacks: image-only rows (page scans rendered from the owner's PDF; PDF page = printed + off)
    for pp in MISS.get(v,[]): d.append({'page':pp,'content':'','images':['v%d_p%d.jpg'%(v,pp)],'mp':1})
    for e in OWNER:
        if e['v']==v:
            assert all(x['page']!=e['page'] for x in d),('page exists',v,e['page']);d.append({'page':e['page'],'content':e['content'],'images':e['images']})
    d.sort(key=lambda e:e['page'])
    for e in d:
        p=e['page'];L=[l.strip() for l in e['content'].split('\n') if l.strip()]
        body,notes,tail=split_notes(L)
        # chapter opener
        sect=None
        for i,l in enumerate(body[:3]):
            m=re.match(r'^باب\s*([0-9۰-۹]+)\s*$',l)
            if m and num(m.group(1))==chap+1:
                chap+=1;t=[x for x in body[i+1:i+3] if x!='سیرت انسائیکلوپیڈیا'];sect='جلد %d — باب %d: %s'%(v,chap,t[0] if t else '');break
        if not sect and not gloss and re.match(r'^تفصیل حواشی',body[0] if body else ''): gloss=True;sect='جلد %d — تفصیل حواشی'%v
        if not sect and not started: sect='جلد %d — ابتدائی صفحات'%v;started=True
        if sect and (not secs or secs[-1][1]!=sect): secs.append([None,sect,len(rows)+1,0,''])
        started=True
        if e.get('mp'):
            cnt+=1;rows.append([cnt,'اس صفحے کا متن فائل میں شامل نہیں؛ اصل صفحہ کی تصویر دی گئی ہے۔','',{'v':v*100000+p,'im':e['images'],'mp':1}]);pgv.append(v*100000+p);continue
        # marks / notes
        mk=0
        if notes:
            b2,mk=mark_body(body,len(notes))
            if mk==0:
                rep.append('v%d p%d: no marks -> notes dropped back to body'%(v,p));body=L;notes=[];tail=[]
            else: body=b2
            if notes and mk<len(notes): mk_unplaced+=len(notes)-mk;rep.append('v%d p%d: marks %d notes %d'%(v,p,mk,len(notes)))
        out=[]
        for j,l in enumerate(body):
            l=quotes(l)
            prev=body[j-1] if j else None;nxt=body[j+1] if j+1<len(body) else None
            if head(l,prev,nxt,j==0): out.append('§'+l)
            else: out.append(l)
        for j in range(1,len(out)):
            if out[j-1].startswith('﴿') and re.match(r'^«.*»(\(\d+\))?$',out[j]):
                m=re.match(r'^«(.*)»(\(\d+\))?$',out[j]);out[j]='’’'+m.group(1)+'‘‘'+(m.group(2) or '')
        out+= [quotes(x) for x in tail]
        ext={'v':v*100000+p}
        if gloss: ext['g']=1
        if notes: ext['fn']='\n'.join('(%d) %s'%(i+1,n) for i,n in enumerate(notes))
        if e.get('images'): ext['im']=e['images']
        cnt+=1
        rows.append([cnt,'\n'.join(out),'',ext]);pgv.append(v*100000+p)
for i,s in enumerate(secs):
    s[0]=i+1;s[3]=(secs[i+1][2]-1) if i+1<len(secs) else len(rows)
# write coll files
def jd(x): return json.dumps(x,ensure_ascii=False,separators=(',',':'))
for fn in glob.glob('coll/%s_*'%KEY): os.remove(fn)
fl=[];cur=[];size=0
def flush():
    global cur,size
    if not cur: return
    body='COLLDATA("%s","ur",%s)'%(KEY,jd(cur));h=hashlib.md5(body.encode()).hexdigest();name='%s_ur_%d_%s.js'%(KEY,len(fl)+1,h[:6])
    open('coll/'+name,'w',encoding='utf-8').write(body);fl.append([cur[0][0],cur[-1][0],name,len(body.encode()),h[:10]]);cur=[];size=0
for r in rows:
    cur.append(r);size+=len(r[1])+len(r[3].get('fn',''))
    if size>90000: flush()
flush()
# pg labels
import align
R=[[r[0]] for r in rows]
pgfile,pgsz=align.write(KEY,R,[(x//100000,x%100000) for x in pgv])
entry={"key":KEY,"ar":"سیرت انسائیکلوپیڈیا (اللؤلؤ المكنون)","ur":"سیرت انسائیکلوپیڈیا (اللؤلؤ المکنون)","en":"Seerat Encyclopedia (al-Lu'lu' al-Maknun)",
"sub":{"ur":"7 جلدیں — نگران اعلیٰ: عبدالمالک مجاہد؛ دار السلام","ar":"7 مجلدات — إشراف: عبد المالك مجاهد؛ دار السلام","en":"7 volumes — supervised by Abdul Malik Mujahid; Darussalam"},
"sections":secs,"prose":True,"langs":["ur"],"files":{"ur":[[a,b,n] for a,b,n,_,_ in fl]},"count":len(rows),"pg":pgfile,
"pub":{"ur":"دار السلام","ar":"دار السلام","en":"Darussalam"},"showpub":True}
s=open('coll/index.js',encoding='utf-8').read();A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')]);A=[e for e in A if e['key']!=KEY];A.append(entry)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+jd(A)+')')
o=json.load(open('offline.json',encoding='utf-8'));o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
ff=[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in fl]+[['coll/pg/'+pgfile,hashlib.md5(open('coll/pg/'+pgfile,'rb').read()).hexdigest()[:10],'coll/pg/'+pgfile,pgsz]]
o['groups'].append({"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":ff,"b":sum(x[3] for x in ff)})
open('offline.json','w',encoding='utf-8').write(jd(o))
rep.append('rows %d sections %d unplaced marks %d'%(len(rows),len(secs),mk_unplaced))
open('tools/addbook/seerat/report.txt','w',encoding='utf-8').write('\n'.join(rep))
print(rep[-1],len(rep),'files',len(fl))
