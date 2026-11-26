#!/usr/bin/env python3
"""Usd al-Ghaba (Urdu: tr. Maulana Muhammad Abdush-Shakur Faruqi, tasheel/tarteeb/new translation by Mufti Nur ul-Islam Haqqani & others, Al-Mizan Lahore)
-> coll book `asadghabaur`, same front page as Al-Isaba (asabahur).  Source: owner's JSON (list of {number,name,text,حواشی}) = argv[1].
JSON has NO letter field and NO footnote marks: letters come from the names (isotonic fit inside each kind), notes with <=6 per entry get their marks at the heading,
longer lists (the Prophet's entry has 38) are shown only in the notes box.  Everything unclear -> tools/asabah/report_asad.txt"""
import json,re,hashlib,os,sys,collections
SRC=sys.argv[1]
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
KEY='asadghabaur'
LET='ابتثجحخدذرزسشصضطظعغفقکلمنہوی'
LN=dict(zip(LET,'الف باء تاء ثاء جیم حاء خاء دال ذال راء زاء سین شین صاد ضاد طاء ظاء عین غین فاء قاف کاف لام میم نون ہاء واؤ یاء'.split()))
M={'آ':'ا','أ':'ا','إ':'ا','ٱ':'ا','ء':'ا','ك':'ک','گ':'ک','ه':'ہ','ھ':'ہ','ۃ':'ہ','ة':'ہ','ي':'ی','ې':'ی','ے':'ی','ى':'ی','ئ':'ی','ؤ':'و','ڑ':'ر'}
KL=['صحابہ کے نام','کنیت والے صحابہ (ابو)','ابن کے نام سے مشہور صحابہ','مبہم صحابہ (فلاں سے، اپنے والد سے…)','صحابیات کے نام','صحابیات کی کنیتیں (ام)','مبہم صحابیات']
BOUND=[('۱',0),('۵۶۵۷',1),('۶۳۴۹',2),('۶۳۹۶',3),('۶۶۸۲',4),('۷۳۵۳',5),('۷۶۲۹',6)]   # first entry number of each kind (checked against the names)
NOLET={3,6}; MUB=28
UD=str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹'); AD=str.maketrans('۰۱۲۳۴۵۶۷۸۹','0123456789')
d=json.load(open(SRC,encoding='utf-8')); rep=[]
# corrections read from the printed pages of the owner's PDF (26-11-2026): tools/asabah/asad_fixes.json
FX=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'asad_fixes.json'),encoding='utf-8')); _seen=set()
for x in d:
    f=FX.get(x['number'])
    if not f or x['number'] in _seen: continue
    _seen.add(x['number'])
    if 'name' in f: x['name']=x['name'].replace(f['name'][0],f['name'][1],1)
    if 'sub' in f: x['text']=x['text'].replace(f['sub'][0],f['sub'][1],1)
    if 'pre' in f: x['text']=f['pre']+x['text']
# printed «(مکرر)» entries (owner 26-11-2026, checked on pdf pp. 1476-1478 = printed vol.6 pp. 359-361): the file numbers them as the plain
# number and puts them in the wrong place; the print has: 3172, 3173, 3174, (مکرر)3172 مرقع/مربع, (مکرر)3173 مزنی, (مکرر)3174 مزین, 3175, 3176
def _find(num,word):
    return next(i for i,x in enumerate(d) if x['number']==num and word in x['name'])
_a=_find('۳۱۷۲','مرقع'); _b=_find('۳۱۷۶','مزنی'); _c=_find('۳۱۷۴','مزین'); _t=next(i for i,x in enumerate(d) if x['number']=='۳۱۷۴' and 'قیطی' in x['name'])
d[_a]['number']='۳۱۷۲ (مکرر)'; d[_b]['number']='۳۱۷۳ (مکرر)'; d[_c]['number']='۳۱۷۴ (مکرر)'
_mv=[d[_a],d[_b],d[_c]]; _ids={id(x) for x in _mv}; d=[x for x in d if id(x) not in _ids]
_p=next(i for i,x in enumerate(d) if x['number']=='۳۱۷۴' and 'قیطی' in x['name']); d[_p+1:_p+1]=_mv
# 6168: the print has two entries (الف) and (ب)
for x in d:
    if x['number']=='۶۱۶۸' and 'والد ابی بکر' in x['name']: x['number']='۶۱۶۸(الف)'
def strip_name(n):
    n=re.sub(r'\s+',' ',n.strip()); n=re.sub(r'^(سیدنا|سیدہ)\s+','',n); return n
def core(n,kind):
    n=re.sub(r'^و\s+','',strip_name(n)); n=re.sub(r'[ً-ٰٟ]','',n); w=n.split()
    if kind in(1,2,5) and w and w[0] in('ابو','ابی','ابن','ام','امہ','بن') and len(w)>1: n=' '.join(w[1:])
    elif kind in(1,5) and w and re.match(r'^ابو',w[0]) and len(w[0])>3: n=w[0][3:]+' '+' '.join(w[1:])
    return re.sub(r'^ال(?=.)','',n.strip())
def letter(n,kind):
    c=core(n,kind); ch=c[0] if c else '?'; ch=M.get(ch,ch)
    return LET.index(ch) if ch in LET else None
def isotonic(Ls):
    n=len(Ls); INF=10**9; cost=[0]*28; back=[]
    for i,l in enumerate(Ls):
        new=[];bk=[]
        for j in range(28):
            best=min(range(j+1),key=lambda k:cost[k]); new.append(cost[best]+(0 if l is None or l==j else 1)); bk.append(best)
        cost=new; back.append(bk)
    j=min(range(28),key=lambda k:cost[k]); out=[]
    for i in range(n-1,-1,-1): out.append(j); j=back[i][j]
    return out[::-1]
nums=[x['number'] for x in d]
bidx=[(nums.index(n),k) for n,k in BOUND]
kind=[None]*len(d)
for a,(i,k) in enumerate(bidx):
    e=bidx[a+1][0] if a+1<len(bidx) else len(d)
    for t in range(i,e): kind[t]=k
kind[0]=-1; kind[1]=-1
LT=[None]*len(d)
for k in range(7):
    ids=[i for i in range(len(d)) if kind[i]==k]
    if k in NOLET:
        for i in ids: LT[i]=MUB
        continue
    Ls=[letter(d[i]['name'],k) for i in ids]; fit=isotonic(Ls)
    for i,l,f in zip(ids,Ls,fit): LT[i]=f
    off=sum(1 for l,f in zip(Ls,fit) if l!=f)
    rep.append(f'حرف: {KL[k]} — {off} ناموں کا پہلا حرف ترتیب سے ہٹ کر تھا، انہیں پڑوسی ناموں کے حرف میں رکھا گیا (املا کی غلطی یا ترتیب)')
    for i,l,f in zip(ids,Ls,fit):
        if l!=f and len(rep)<400: rep.append(f'  حرف بدلا: {d[i]["number"]} {d[i]["name"][:40]}: {LN.get(LET[l],"?") if l is not None else "?"} -> {LN[LET[f]]}')
HEAD=re.compile(r'^\s*((?:باب|حرف)\s[^\n۔]{3,80}?)\s+(?=سیدنا|سیدہ)')
rows=[];idx=[];secs=[];cur=None
for i,x in enumerate(d):
    t=re.sub(r'[ \t]{2,}',' ',x['text']).replace('رررسول','رسول').strip()
    if 'رررسول' in x['text']: rep.append(f'املا درست کیا: {x["number"]} «رررسول» -> «رسول»')
    fns=[re.sub(r'\s+',' ',f).strip() for f in x['حواشی'] if f and f.strip()]
    k=len(fns); marks=''.join('(%d)'%(j+1) for j in range(k)) if 1<=k<=6 else ''
    if k>6: rep.append(f'حواشی بغیر علامت (متن میں جگہ معلوم نہیں): {x["number"] or "مقدمہ"} {x["name"][:30]} — {k} حواشی')
    elif k: rep.append(f'حواشی کی علامت عنوان پر (متن میں جگہ فائل میں نہیں): {x["number"] or "مقدمہ"} {x["name"][:30]} — {k}')
    if i>1:
        w=re.sub(r'[\u064b-\u065f\u0670]','',strip_name(x['name'])).split()
        tt=re.sub(r'[\u064b-\u065f\u0670]','',t[:120])
        if w and w[0] not in('ابو','ابن','ام','و') and w[0] not in tt and not (len(w)>1 and w[1] in tt): rep.append(f'نام اور متن کا آغاز نہیں ملتا (املا؟): {x["number"]} نام «{strip_name(x["name"])[:35]}» — متن «{t[:45]}»')
    pre=''
    if i>1:
        m=HEAD.match(t)
        if m: pre='§'+m.group(1).strip()+'\n'; t=t[m.end():].strip()
        nm=strip_name(x['name'])
        body=pre+('§%s ۔ %s%s\n%s'%(x['number'],nm,marks,t) if x['number'] else '§%s%s\n%s'%(nm,marks,t))
        if not x['number']: rep.append(f'نمبر خالی: {nm} (فائل کی ترتیب {i})')
    else:
        nm=strip_name(x['name']) if i else 'مقدمہ'
        t2=re.sub(r'^\s*'+re.escape(nm)+r'\s*','',t) if i==1 else t
        body='§%s%s\n%s'%(nm,marks,t2)
    if i==1: body=body.replace('§'+nm+marks,'§سیدنا محمد رسول اللہ صلی اللہ علیہ وسلم'+marks,1) if False else body
    fn='\n'.join('(%d) %s'%(j+1,f) for j,f in enumerate(fns))
    rid=len(rows)+1; rows.append([rid,body,'',{'fn':fn} if fn else None])
    key=(kind[i],LT[i] if LT[i] is not None else -1)
    if not cur or cur['key']!=key: cur=dict(key=key,start=rid,end=rid,first=i); secs.append(cur)
    cur['end']=rid
    if i>1: idx.append((rid,(int(re.sub(r'\D','',x['number'].translate(AD)) or 0) if x['number'] else ''),nm,0,kind[i],LT[i]))
c=collections.Counter(s['key'] for s in secs)
for kk,n in c.items():
    if n>1: rep.append(f'حصہ بٹا ہوا: {KL[kk[0]] if kk[0]>=0 else kk} {kk[1]} ({n})')
def jd(x): return json.dumps(x,ensure_ascii=False,separators=(',',':'))
for f in os.listdir('coll'):
    if f.startswith(KEY+'_'): os.remove('coll/'+f)
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
ixf=[None]*29; cnt=[[0]*7 for _ in range(29)]
for j in range(29):
    a=[[rid,n,nm,q,k] for rid,n,nm,q,k,l in idx if l==j]
    for x in a: cnt[j][x[4]]+=1
    if not a: continue
    body='ASBIX("%s",%d,%s)'%(KEY,j,jd(a)); h=hashlib.md5(body.encode()).hexdigest()[:6]
    nm=f'{KEY}_ix_{j}_{h}.js'; open('coll/'+nm,'w',encoding='utf-8').write(body); ixf[j]=[nm,len(body.encode()),hashlib.md5(body.encode()).hexdigest()[:10]]
def title(s):
    k,l=s['key']
    if k==-1: return 'مقدمہ' if s['first']==0 else 'سیدنا محمد رسول اللہ صلی اللہ علیہ وسلم'
    return (f"حرف {LN[LET[l]]} — {KL[k]}" if l<28 else KL[k])
SEC=[[i+1,title(s),s['start'],s['end'],'',{'l':s['key'][1],'k':s['key'][0]} if s['key'][0]>=0 else {}] for i,s in enumerate(secs)]
entry={"key":KEY,"ar":"أسد الغابة في معرفة الصحابة (ترجمة أردية)","ur":"اسد الغابہ فی معرفۃ الصحابہ (اردو)","en":"Usd al-Ghabah fi Ma'rifat as-Sahabah (Urdu)",
"sub":{"ur":"تصنیف: امام عز الدین ابن الاثیر جزری رحمہ اللہ؛ ترجمہ: مولانا محمد عبد الشکور فاروقی؛ تسہیل، ترتیب اور نئی ترجمانی: مولانا مفتی نور الاسلام حقانی، مولانا محمد احمد، غلام ربانی عزیز، حافظ قاری اعجاز احمد اعجاز؛ ناشر: المیزان",
"ar":"تأليف: الإمام عز الدين ابن الأثير الجزري رحمه الله؛ ترجمة أردية: مولانا محمد عبد الشكور فاروقي مع التسهيل والترتيب؛ الناشر: الميزان","en":"By Imam Izz ad-Din Ibn al-Athir al-Jazari (may Allah have mercy on him); Urdu translation by Maulana Muhammad Abdush-Shakur Faruqi, simplified and rearranged by Mufti Nur ul-Islam Haqqani and others; publisher: Al-Mizan"},
"sections":SEC,"prose":True,"langs":["ur"],"files":{"ur":[[a,b,n] for a,b,n,_,_ in files]},"count":len(rows),
"pub":{"ur":"المیزان، لاہور","ar":"الميزان، لاهور","en":"Al-Mizan, Lahore"},
"author":["ibnathir","ابن الأثير","امام ابن اثیر","Ibn al-Athir",630],
"asx":[x[0] if x else '' for x in ixf],"asc":cnt,"asm":[],"ask":KL,"asz":["مبہم"]}
s=open('coll/index.js',encoding='utf-8').read()
A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')]); A=[e for e in A if e['key']!=KEY]
A.insert([e['key'] for e in A].index('asabahur')+1,entry)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+jd(A)+')')
o=json.load(open('offline.json',encoding='utf-8')); o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
ff=[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in files]+[['coll/'+x[0],x[2],'coll/'+x[0],x[1]] for x in ixf if x]
g={"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":ff,"b":sum(x[3] for x in ff)}
k=[x['id'] for x in o['groups']].index('c_asabahur'); o['groups'].insert(k+1,g)
open('offline.json','w',encoding='utf-8').write(jd(o))
open('tools/asabah/report_asad.txt','w',encoding='utf-8').write('\n'.join(rep)+'\n')
print('rows',len(rows),'entries',len(idx),'sections',len(SEC),'files',len(files),'bytes',sum(x[3] for x in files),'report',len(rep))
print({KL[k]:sum(1 for x in idx if x[4]==k) for k in range(7)})
