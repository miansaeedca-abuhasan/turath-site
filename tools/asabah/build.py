#!/usr/bin/env python3
"""Al-Isabah (Urdu, Maulana Muhammad Amir Shahzad Alavi, Maktaba Rahmaniya) -> coll book `asabahur`.
Input: the owner's JSON volumes  *Al-Asabah-Urdu-Vol-N.json  (folder = argv[1]).  Vol 3 may be absent (owner sends it later):
re-run with all volumes, ids are sequential in volume order (so entries of later volumes get new ids when vol 3 is added).
Writes: coll/asabahur_ur_<n>_<md5>.js (rows), coll/asabahur_ix_<letter>_<md5>.js (name lists of each letter), registry entry
(coll/index.js, after sh9767), offline.json group c_asabahur, tools/asabah/report.txt (everything unverified / unclear).
Then: python3 tools/rehash.py ; bump sw.js ; tests/asabah_book.js"""
import json,re,glob,hashlib,os,sys,collections
SRC=sys.argv[1] if len(sys.argv)>1 else '/mnt/user-data/attachments/c78c1915-dfa8-5395-875d-805b90bb4e15'
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
KEY='asabahur'
LET='ابتثجحخدذرزسشصضطظعغفقکلمنہوی'
LN=dict(zip(LET,'الف باء تاء ثاء جیم حاء خاء دال ذال راء زاء سین شین صاد ضاد طاء ظاء عین غین فاء قاف کاف لام میم نون ہاء واؤ یاء'.split()))
TOK={'الف':'ا','ہمزہ':'ا','باء':'ب','تاء':'ت','ثاء':'ث','جیم':'ج','حاء':'ح','خاء':'خ','دال':'د','ذال':'ذ','راء':'ر','زاء':'ز','زاي':'ز','سین':'س','شین':'ش','صاد':'ص','ضاد':'ض','طاء':'ط','ظاء':'ظ','عین':'ع','غین':'غ','فاء':'ف','قاف':'ق','کاف':'ک','لام':'ل','میم':'م','نون':'ن','ہاء':'ہ','واؤ':'و','واو':'و','یاء':'ی'}
KINDS=['نام','کنیت','خواتین','خواتین کنیت']
KL=['صحابہ کے نام','کنیت والے صحابہ (ابو)','صحابیات کے نام','صحابیات کی کنیتیں (ام)']
def letter_of(label):
    t=re.sub(r'\(.*?\)','',label).replace('حرف','').split()
    t=t[0] if t else ''
    if t!='الف' and t.startswith('ال') and len(t)>3: t=t[2:]
    return TOK[t]
def qism_of(q):
    q=re.sub(r'[ً-ٰٟ]','',q or '').replace('أ','ا').replace('ٱ','ا')
    for n,w in ((4,'رابع'),(3,'ثالث'),(2,'ثانی'),(2,'الثاني'),(1,'اول')):
        if w in q: return n
    return 0
UD=str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹')
AD=str.maketrans('۰۱۲۳۴۵۶۷۸۹','0123456789')
rep=[]
vols={}
SKIP={int(x) for x in os.environ.get('ASB_SKIP','').split(',') if x}   # vol 3 is incomplete (34 entries missing): the owner sends it later -> ASB_SKIP= (empty) then
for f in glob.glob(SRC+'/*Al-Asabah-Urdu-Vol-*.json'):
    v=int(re.search(r'Vol-(\d+)\.json',f).group(1))
    if v not in SKIP: vols[v]=json.load(open(f,encoding='utf-8'))
print('volumes',sorted(vols))
ENT=[]   # dicts: vol, kind, letter, qism, num, name, text, fns
for v in sorted(vols):
    d=vols[v]; prevk=-1; kind=0 if v!=7 else 1
    last=None
    for i,e in enumerate(d['entries']):
        L=letter_of(e['harf']); k=LET.index(L)
        if v==8:
            if kind==2 and False: pass
            if kind==0: kind=2
            if kind==2 and k<prevk and prevk>=LET.index('ی')-1: kind=3
        prevk=k
        fns=[]
        for f in (e['footnotes'] or []):
            fns.append(f if isinstance(f,str) or f is None else f.get('text'))
        ENT.append(dict(vol=v,kind=kind,L=L,qism=qism_of(e.get('qism')),num=e['number'],name=e['name'],text=e['text'] or '',fns=fns,flags=e.get('flags')))
        last=ENT[-1]
    cl=d.get('closing')
    if cl:
        t=cl if isinstance(cl,str) else cl.get('text')
        ENT.append(dict(vol=v,kind=last['kind'],L=last['L'],qism=0,num=None,name='اختتام جلد '+str(v),text=t,fns=[],closing=True))
# vol 8: kunya of women starts where the letters restart after ی  (checked below)
MARK=re.compile(r'\[([0-9۰-۹]+)\]|✳')
def conv(e):
    """-> (heading, text, fn lines).  Marks [n] / ✳ become (n); a footnote without a mark in the text is printed at the heading."""
    fns=e['fns']; F=len(fns)
    s_all=[e['name'],e['text']]
    nums=[]; star=0
    for s in s_all:
        for m in MARK.finditer(s):
            if m.group(1): nums.append(int(m.group(1).translate(AD)))
            else: star+=1
    keep=[i for i,t in enumerate(fns) if t is not None and str(t).strip()]
    for i,t in enumerate(fns):
        if i not in keep: rep.append(f'حاشیہ خالی (فائل میں null): جلد {e["vol"]} اندراج {e["num"]} {e["name"][:30]} — حاشیہ {i+1}')
    used=set(); 
    if star and not nums:   # vol 7: unnumbered ✳ marks, the first notes without a mark stand at the heading
        lead=F-star
        if lead<0: rep.append(f'✳ زیادہ حواشی کم: جلد {e["vol"]} اندراج {e["num"]} ({star} علامتیں، {F} حواشی)'); lead=0
        seq=iter(range(lead,F+star))
        def idx_of(m): 
            try: return next(seq)
            except StopIteration: return None
    else:
        def idx_of(m): return int(m.group(1).translate(AD))-1 if m.group(1) else None
    disp={}
    for n,i in enumerate(keep): disp[i]=n+1
    def sub(s):
        def r(m):
            i=idx_of(m)
            if i is None or i<0 or i>=F or i not in disp:
                rep.append(f'علامت بغیر حاشیہ ہٹائی: جلد {e["vol"]} اندراج {e["num"]} {e["name"][:30]} علامت {m.group(0)}'); return ''
            used.add(i); return '(%d)'%disp[i]
        out=MARK.sub(r,s)
        out=re.sub(r' +(\(\d+\))',r'\1',out)    # the mark touches its word
        return out
    name=sub(e['name']); text=sub(e['text'])
    lead=[i for i in keep if i not in used]
    if any(i>0 for i in lead) and not (len(lead)==1 and lead[0]==0): rep.append(f'حاشیہ جس کی علامت متن میں نہیں (عنوان پر رکھا): جلد {e["vol"]} اندراج {e["num"]} {e["name"][:30]} — {[i+1 for i in lead]}')
    name+=''.join('(%d)'%disp[i] for i in lead)
    lines=['(%d) %s'%(disp[i],re.sub(r'\s+',' ',str(fns[i])).strip()) for i in keep]
    return name,text,lines
rows=[];idx=[];secs=[];cur=None
for e in ENT:
    cl=e.get('closing')
    if cl:
        t=re.sub(r'(\(\d{1,3}\))',lambda m:m.group(1).translate(UD),e['text'])
        body='§'+e['name']+'\n'+t.strip(); fn=''
    else:
        name,text,lines=conv(e)
        text=re.sub(r'\((\d{1,3})\)(?<!\(\d\))',lambda m:m.group(0),text)
        # ASCII digits in parentheses that are not our marks would become circles: use Urdu digits
        okm=set(re.findall(r'\((\d{1,3})\)',name+text))
        body=('§%s ۔ %s'%(e['num'],name) if e['num'] else '§'+name)+('\n'+text.strip() if text.strip() else '')
        if not text.strip(): rep.append(f'متن خالی (صرف نام): جلد {e["vol"]} اندراج {e["num"]} {e["name"]}')
        fn='\n'.join(lines)
        body=body.replace('نوحؑ','نوح علیہ السلام')
        for m in re.finditer(r'[ﷺﷻؓؒؑ]',body): rep.append('علامت (ؑ وغیرہ) باقی: جلد %s اندراج %s — ...%s'%(e['vol'],e['num'],body[max(0,m.start()-20):m.end()+10].replace('\n',' ')))
    rid=len(rows)+1
    rows.append([rid,body,'',{'fn':fn} if fn else None])
    key=(e['kind'],e['L'])
    if not cur or cur['key']!=key:
        cur=dict(key=key,start=rid,end=rid); secs.append(cur)
    cur['end']=rid
    if not cl: idx.append((rid,e['num'].translate(AD),re.sub(r'\(\d+\)','',name).strip(),e['qism'],e['kind'],e['L']))
# sections must be unique per (kind,letter)
c=collections.Counter(s['key'] for s in secs)
for k,n in c.items():
    if n>1: rep.append(f'حرف کا حصہ دو جگہ بٹا ہوا: {KL[k[0]]} {k[1]} ({n} ٹکڑے)')
# rows -> files
def jd(x): return json.dumps(x,ensure_ascii=False,separators=(',',':'))
for f in glob.glob(f'coll/{KEY}_*'): os.remove(f)
files=[];cur_=[];size=0
def flush():
    global cur_,size
    if not cur_: return
    body='COLLDATA("%s","ur",%s)'%(KEY,jd([[r[0],r[1],r[2],r[3]] if r[3] else [r[0],r[1]] for r in cur_]))
    h=hashlib.md5(body.encode()).hexdigest()[:6]; name=f'{KEY}_ur_{len(files)+1}_{h}.js'
    open('coll/'+name,'w',encoding='utf-8').write(body)
    files.append([cur_[0][0],cur_[-1][0],name,len(body.encode()),hashlib.md5(body.encode()).hexdigest()[:10]]); cur_=[];size=0
for r in rows:
    cur_.append(r);size+=len(r[1])+len((r[3] or {}).get('fn',''))
    if size>180000: flush()
flush()
# name lists per letter
os.makedirs('coll',exist_ok=True)
ixf=[None]*28; cnt=[[0]*4 for _ in range(28)]
for j,L in enumerate(LET):
    a=[[rid,int(n) if n.isdigit() else n,nm,q,k] for rid,n,nm,q,k,l in idx if l==L]
    for x in a: cnt[j][x[4]]+=1
    if not a: continue
    body='ASBIX("%s",%d,%s)'%(KEY,j,jd(a)); h=hashlib.md5(body.encode()).hexdigest()[:6]
    nm=f'{KEY}_ix_{j}_{h}.js'; open('coll/'+nm,'w',encoding='utf-8').write(body); ixf[j]=[nm,len(body.encode()),hashlib.md5(body.encode()).hexdigest()[:10]]
SEC=[[i+1,f"حرف {LN[s['key'][1]]} — {KL[s['key'][0]]}",s['start'],s['end'],'',{'l':LET.index(s['key'][1]),'k':s['key'][0]}] for i,s in enumerate(secs)]
missing=[j for j in range(28) if sum(cnt[j])==0]
partial=[LET.index(x) for x in 'صضطظع'] if 3 not in vols else []
vl=sorted(vols)
sub_ur='ترجمہ: مولانا محمد امیر شہزاد علوی؛ ناشر: مکتبہ رحمانیہ، لاہور — جلد '+'، '.join(map(str,vl))+(' (جلد 3 بعد میں شامل کی جائے گی)' if 3 not in vols else '')
entry={"key":KEY,"ar":"الإصابة في تمييز الصحابة (ترجمة أردية)","ur":"الاصابہ فی تمییز الصحابہ (اردو)","en":"Al-Isabah fi Tamyiz as-Sahabah (Urdu)",
"sub":{"ur":"تصنیف: حافظ ابن حجر عسقلانی رحمہ اللہ؛ "+sub_ur,"ar":"تأليف: الحافظ ابن حجر العسقلاني رحمه الله؛ ترجمة: مولانا محمد أمير شهزاد علوي — المجلدات "+'، '.join(map(str,vl)),"en":"By Hafiz Ibn Hajar al-Asqalani (may Allah have mercy on him); translated by Maulana Muhammad Amir Shahzad Alavi; Maktaba Rahmaniya, Lahore — volumes "+', '.join(map(str,vl))},
"sections":SEC,"prose":True,"langs":["ur"],"files":{"ur":[[a,b,n] for a,b,n,_,_ in files]},"count":len(rows),
"pub":{"ur":"مکتبہ رحمانیہ، لاہور","ar":"المكتبة الرحمانية، لاهور","en":"Maktaba Rahmaniya, Lahore"},
"author":["ibnhajar","ابن حجر العسقلاني","حافظ ابن حجر","Ibn Hajar",852],
"asx":[x[0] if x else '' for x in ixf],"asc":cnt,"asm":partial}
s=open('coll/index.js',encoding='utf-8').read()
A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')]); A=[e for e in A if e['key']!=KEY]
A.insert([e['key'] for e in A].index('sh9767')+1,entry)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+jd(A)+')')
o=json.load(open('offline.json',encoding='utf-8')); o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
ff=[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in files]+[['coll/'+x[0],x[2],'coll/'+x[0],x[1]] for x in ixf if x]
g={"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":ff,"b":sum(x[3] for x in ff)}
k=[x['id'] for x in o['groups']].index('c_sh9767'); o['groups'].insert(k+1,g)
open('offline.json','w',encoding='utf-8').write(jd(o))
open('tools/asabah/report.txt','w',encoding='utf-8').write('\n'.join(rep)+'\n')
print('rows',len(rows),'entries',len(idx),'sections',len(SEC),'files',len(files),'bytes',sum(x[3] for x in files),'report lines',len(rep))
print('letters without entries',[LET[j] for j in missing])
