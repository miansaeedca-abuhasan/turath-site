#!/usr/bin/env python3
"""Sahih al-Jami' as-Saghir (Albani) — Urdu translation book `sahihjamiur` from the owner's xlsx (sheet «Hadith»: hadith_number, hadith_arb,
hadith_trajama, takhreej, albani_hukam; sheet «Abwab»: 74 chapter titles ar/ur).  26-11-2026.
ar row = [id, arabic]; ur row = [id, urdu+" (1)", "", {"k":"(1) takhrij"}]; ids = running 1..8212 (xlsx order); registry `an` = printed number
(8201 plain, 11 bracketed extra hadith «330/1», printed 3832 does not exist).  Sections = the 58 headings of the epub (حرف / فصل) with the xlsx's Urdu titles.
usage: python3 tools/addbook/sahihjami/build_ur.py <xlsx>  [needs /tmp/sj/rows_ar.json from build_ar.py]  then tools/rehash.py"""
import openpyxl,json,re,sys,os,hashlib
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','..'))
KEY='sahihjamiur'
wb=openpyxl.load_workbook(sys.argv[1],read_only=True)
X=[[str(c) for c in r] for r in list(wb['Hadith'].iter_rows(values_only=True))[1:]]
AB=list(wb['Abwab'].iter_rows(values_only=True))
CH=[(int(r[0]),r[1],r[2]) for r in AB[2:] if r[0] not in (None,'None')]
assert len(X)==8212
T=str.maketrans('٠١٢٣٤٥٦٧٨٩','0123456789');UD=str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹')
meta=open('quran/meta.js',encoding='utf8').read()
NAMES=[x[1] for x in json.loads(re.search(r'"surahs":(\[\[.*?\]\]),"juz"',meta).group(1))]
def key(n):
    n=re.sub('[ً-ٰٓـ]','',n).replace('سورة','').replace('سورۃ','')
    n=re.sub('[ةۃهھ]','ه',n);n=re.sub('[يیىے]','ي',n);n=re.sub('[أإآٱ]','ا',n);n=n.replace('ء','').replace('ؤ','و').replace('ئ','ي')
    return re.sub(r'\s','',n).replace('ال','',1) if n.replace(' ','').startswith('ال') else re.sub(r'\s','',n)
IDX={key(n):i for i,n in enumerate(NAMES,1)}
unref=[]
def refs(t):
    def f(m):
        nm=m.group(1).strip();i=IDX.get(key(nm))
        if not i: unref.append(nm);return m.group(0)
        sn=NAMES[i-1].replace('ة','ۃ').replace('ي','ی').replace('ى','ی')
        return '['+sn+(': '+m.group(2).translate(UD) if m.group(2) else '')+']'
    return re.sub(r'\[سورة\s+([^\]:\d]+?)\s*(?::\s*([0-9]+))?\s*\]',f,t)
FIXW={'تمہara ان':'تمہارا ان'}
def urdu(t):
    t=t.replace('ﷺ','صلی اللہ علیہ وسلم').replace('।','۔')
    for a,b in FIXW.items(): t=t.replace(a,b)
    if t.count('¤')>1:     # dialogue: every quoted part is its own top-level quote
        t=re.sub(r'”\s*([^”“]*?)\s*“',lambda m:'’’'+m.group(1)+'‘‘',t).replace(' ¤ ',' ').replace('¤','')
        return re.sub(r'\s+',' ',t).translate(UD).strip()
    pre,sep,body=t.partition('¤')
    assert sep
    pre=pre.strip();body=body.strip()
    if body.startswith('”'): body=body[1:].strip()
    L=body.rfind('“')                    # the closing quote of the hadith; what follows (a verse reference or an explanation in brackets) stays after it
    tail='';
    if L>=0: body,tail=body[:L].strip(),body[L+1:].strip()
    body=refs(body)
    def vf(m):
        v,tr,ref=m.group(1).strip(),m.group(2),m.group(3)
        out='\n﴿'+v+'﴾'+(' '+ref if ref else '')+'\n'
        if tr: out+='’’'+tr.strip()+'‘‘\n'
        return out
    body=re.sub(r'\s*﴿\s*([^﴾]*?)\s*﴾\s*(?:”([^”“]*)“\s*)?(\[[^\]]*\])?\s*',vf,body)
    body=re.sub(r'"([^"\n]+)"',lambda m:'’'+m.group(1)+'‘',body)
    body=body.replace('¤','')            # a second «(…فرمایا:) ¤ ”…“» inside one hadith: the separator is dropped, its quote is a nested quote
    body=re.sub(r'”\s*([^”“]*?)\s*“',lambda m:'’'+m.group(1)+'‘',body)       # nested quotes ”…“ inside the hadith -> ’…‘
    body=re.sub(r'“\s*([^”“]*?)\s*”',lambda m:'’'+m.group(1)+'‘',body)
    body=re.sub(r"(?<![\w])'([^']+)'",lambda m:'’'+m.group(1)+'‘',body) if False else re.sub(r"(^|[\s(\[])'([^'\n]+)'",lambda m:m.group(1)+'’'+m.group(2)+'‘',body)
    body=re.sub(r'(?:^|(?<=\s))"(?=\S)','’’',body) if False else body
    lines=[l.strip() for l in body.split('\n') if l.strip()]
    if lines and not lines[0].startswith('﴿'): lines[0]='’’'+lines[0]
    else: lines.insert(0,'’’')            # (not used: no hadith starts with a verse)
    if lines[-1].startswith('﴿'): lines.append('‘‘')
    else: lines[-1]+='‘‘'
    if tail: lines[-1]+=' '+refs(tail)
    txt=pre+' '+'\n'.join(lines)
    txt=re.sub(r' *\n *','\n',txt)
    txt=re.sub(r'[ \t]+',' ',txt).replace('( ','(').replace(' )',')')
    txt=txt.translate(str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹'))
    return txt.strip()
ep={}
for r in json.load(open('/tmp/sj/rows_ar.json')):
    m=re.match(r'^([٠-٩]+)\s*(/\s*[٠-٩]+\s*)?-',r[1])
    if m: ep[m.group(1).translate(T)+('M' if m.group(2) else '')]=r[1]
ar=[];ur=[];AN={};notk=[];fromep=[]
for i,x in enumerate(X,1):
    num,arb,tr,tk,hk=x
    a=arb.strip()
    if num.endswith('M'): AN[str(i)]=num[:-1]+'/1'
    elif int(num)!=i: AN[str(i)]=num
    u=urdu(tr)
    t=tk.strip()
    if t.startswith('«') and t.endswith('»'): t=t[1:-1].strip()
    hk=hk.strip()
    if hk not in('','0') and t and re.sub(r'[ً-ْ]','',hk) not in re.sub(r'[ً-ْ]','',t): t=hk+': '+t;fromep.append(num)   # grade only in the hukm column -> put in front (none expected)
    elif hk not in('','0') and not t: t=hk
    if t in('','0'): t='';notk.append(num)
    t=re.sub(r'\s+',' ',t)
    ar.append([i,a])
    ur.append([i,u+(' (1)' if t else ''),'',{'k':'(1) '+t}] if t else [i,u])
# printed numbers -> registry an (runs [startId, startPrinted, count] where the printed number differs from the id; M rows get «N/1»)
nums=[x[0] for x in X]
runs=[];cur=None
for i,n in enumerate(nums,1):
    if n.endswith('M'): cur=None;continue
    n=int(n)
    if n==i: cur=None;continue
    if cur and cur[0]+cur[2]==i and cur[1]+cur[2]==n: cur[2]+=1
    else: cur=[i,n,1];runs.append(cur)
AN2={k:v for k,v in AN.items()}
AN2['_r']=runs
# sections: the 58 headings of the epub (registry sh10757 sections) -> first hadith after the heading
numid={n:i for i,n in enumerate(nums,1)}
s_=open('coll/index.js',encoding='utf-8').read();J=json.loads(s_[s_.index('COLLS(')+6:s_.rindex(')')])
sh=[e for e in J if e['key']=='sh10757'][0]
H=[c for c in CH if c[0]==1 or c[0]>=18];assert len(H)==len(sh['sections'])==58
RA=json.load(open('/tmp/sj/rows_ar.json'))
st=[]
for sec in sh['sections']:
    rid=sec[2]
    for r in RA[rid:rid+40]:
        m=re.match(r'^([٠-٩]+)\s*(/\s*[٠-٩]+\s*)?-',r[1])
        if m and not m.group(2) and m.group(1).translate(T) in numid: st.append(numid[m.group(1).translate(T)]);break
    else: raise SystemExit('no start for '+sec[1])
assert st==sorted(st) and st[0]==1,st
SECS=[]
for j,(c,ca,cu) in enumerate(H):
    b=st[j+1]-1 if j+1<len(st) else len(X)
    cu=cu.strip().rstrip('۔');ca=ca.strip().rstrip('.')
    if ca.startswith('فصل'): cu=SECS[-1][1].split(' — ')[0]+' — '+cu;ca=SECS[-1][4].split(' — ')[0]+' — '+ca   # the «فصل» of each letter carries the letter's name
    SECS.append([j+1,cu,st[j],b,ca])
print('sections',len(SECS),SECS[:3],SECS[-1])
def jd(x): return json.dumps(x,ensure_ascii=False,separators=(',',':'))
for f in os.listdir('coll'):
    if f.startswith(KEY+'_'): os.remove('coll/'+f)
def write(l,rows):
    files=[];cur=[];size=0
    def fl():
        nonlocal cur,size
        if not cur: return
        body='COLLDATA("%s","%s",%s)'%(KEY,l,jd(cur));h=hashlib.md5(body.encode()).hexdigest();nm='%s_%s_%d_%s.js'%(KEY,l,len(files)+1,h[:6])
        open('coll/'+nm,'w',encoding='utf-8').write(body);files.append([cur[0][0],cur[-1][0],nm,len(body.encode()),h[:10]]);cur=[];size=0
    for r in rows:
        cur.append(r);size+=len(jd(r))
        if size>150000: fl()
    fl();return files
FA=write('ar',ar);FU=write('ur',ur)
entry={"key":KEY,"ar":"صحيح الجامع الصغير وزيادته (الترجمة الأردية)","ur":"صحیح الجامع الصغیر و زیادتہ (اردو ترجمہ)","en":"Sahih al-Jami as-Saghir wa Ziyadatuh (Urdu translation)",
 "langs":["ar","ur"],"sections":SECS,"count":len(X),"an":AN2,
 "sub":{"ur":"عربی متن، اردو ترجمہ از حافظ طلحہ بابر، تحقیق و تخریج از علامہ البانی","ar":"النص العربي والترجمة الأردية لحافظ طلحة بابر والتخريج للعلامة الألباني","en":"Arabic text, Urdu translation by Hafiz Talha Babar, takhrij by Al-Albani"},
 "trn":{"ur":"حافظ طلحہ بابر","en":"Hafiz Talha Babar"},"author":["albani","الألباني","علامہ البانی","Al-Albani",1420],
 "files":{"ar":[[a,b,n] for a,b,n,_,_ in FA],"ur":[[a,b,n] for a,b,n,_,_ in FU]}}
A=[e for e in J if e['key']!=KEY]
ix=max(i for i,e in enumerate(A) if e['key'] in('silsila',))
A.insert(ix+1,entry)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+jd(A)+')')
o=json.load(open('offline.json',encoding='utf-8'));o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
F=FA+FU
k=[g['id'] for g in o['groups']].index('c_silsila')
o['groups'].insert(k+1,{"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in F],"b":sum(x[3] for x in F)})
open('offline.json','w',encoding='utf-8').write(jd(o))
print('rows',len(X),'no takhrij',notk,'hukm put in front',fromep,'unresolved surah refs',unref)
