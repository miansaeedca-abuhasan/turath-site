#!/usr/bin/env python3
"""Muhaddith-e-Madina (biography of Dr. Muhammad Abdullah al-Azami, author of Al-Jami al-Kamil) -> coll book `muhaddithmadinaur`.
usage: python3 tools/addbook/muhaddith_madina/build.py <Mohadis_Madina_Mukammal.json>   (run from the repo root, then tools/order_tail.py, tools/rehash.py)"""
import os,json,re,sys,hashlib,glob
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import arabic
KEY='muhaddithmadinaur'
d=json.load(open(sys.argv[1],encoding='utf-8'))
rep=[]
SEC=[(c['title'],s) for c in d['chapters'] for s in c['sections']]
HINDI="'hry Nk;k dqjvku dh"   # Kruti Dev glyphs printed in the book (PDF p.44): शीतल छाया कुरआन की
def fix(t):
    t=t.replace(HINDI,'शीतल छाया कुरआन की')
    t=t.replace('انہیں جلدوں','انیس جلدوں')   # owner 27-11-2026: «19 volumes», the file had «انہیں» (2 places, section «جس کے پاس pdf فائل»)
    # url slips of the file (RTL): https//: -> https://, host dots written as _
    def url(m):
        u=m.group(0).replace('//:','://',1) if '//:' in m.group(0) else m.group(0)
        u=re.sub(r'^(https?://[^/\s?]+)',lambda x:x.group(1).replace('_','.'),u)
        return u
    t=re.sub(r'https?//:\S+',url,t)
    t=re.sub(r'\b(tazkirahhmayyub@gmail)_com\b',r'\1.com',t)
    t=t.replace('”','’’').replace('“','‘‘')
    out=[]
    for ln in t.split('\n'):
        n=ln.count('"')
        if n%2==0 and n:
            parts=ln.split('"');ln=parts[0]
            for j,x in enumerate(parts[1:]): ln+=('’’' if j%2==0 else '‘‘')+x
        elif n: rep.append('odd straight quotes kept: '+ln[:50])
        out.append(ln)
    return '\n'.join(out)
rows=[];secs=[]
def paras(text): return [p.strip() for p in text.split('\n') if p.strip()]
def emit(title,heading,text,notes,newsec):
    global rows
    ps=paras(text)
    cur=[];size=0;first=True
    def flush():
        nonlocal cur,size
        if not cur: return
        txt='\n'.join(cur);nt=[]
        # footnote marks ➀➁➂ -> (n); the rows' own list numbers «(1) …» at line start become «1- …» so they never look like marks
        k=[0]
        if notes:
            txt='\n'.join(re.sub(r'^\((\d{1,2})\)\s',r'\1- ',l) for l in txt.split('\n'))
        def mk(m):
            i=k[0]
            if i>=len(notes): return m.group(0)
            k[0]+=1;nt.append((i+1,notes[i]));return '(%d)'%(i+1)
        txt=re.sub('[➀➁➂]',mk,txt) if notes else txt
        rows.append([txt,'\n'.join('(%d) %s'%(a,b) for a,b in nt)]);cur=[];size=0
    if heading: cur.append('§'+heading)
    for p in ps:
        if size>3500 and not (len(cur)==1 and cur[0].startswith('§')): flush()
        cur.append(p);size+=len(p)
    flush()
# ---- sections
def sec(title): secs.append([title,len(rows)+1])
sec('ابتدائی صفحات')
emit('', '', fix(d['front_matter']['chiragh']),[],True)
emit('', 'عرض مرتب و ناشر', fix(d['front_matter']['arz_e_murattib_o_nashir']),[],False)
last=None
for ch,s in SEC:
    t=s['text'];nt=[f['text'] for f in sorted(s['footnotes'],key=lambda f:f['number'])]
    h=s['heading']
    if h==ch and ch.startswith('تیسرا باب'): h=''
    if t.startswith('بیاد سپوت دار السلام عمر آباد\n(ابو حسن، میاں سعید)'):   # owner's own introduction: his signature as he wishes it (owner standing wish)
        t=t.replace('(ابو حسن، میاں سعید)','(ابو حسن میاں سعید عفی اللہ عنہ)',1)
    if h=='آپ کی مسلم فیملی کا تذکرہ:':   # the file put the note text of mark 1 after a second, spurious mark (printed pp. 23-24 checked)
        m=re.search(r'شیخ اعظمی ➀ (موصوف طائف.*?\(الحسینوی\))\n(کے مدینہ)',t,re.S)
        assert m
        nt=[m.group(1)]
        t=t[:m.start()]+'شیخ اعظمی '+m.group(2)+t[m.end():]
        rep.append('sec «%s»: note of printed p.23 re-attached to its mark (file had it inside the text after a second mark)'%h)
    st=(ch+' — '+s['heading']) if ch!=last and ch!=s['heading'] else s['heading']
    if ' — ' in st and st.split(' — ')[1].rstrip(':') in st.split(' — ')[0]: st=st.split(' — ')[0]
    sec(st.rstrip(':'));last=ch
    t,al=arabic.arabize(fix(t));rep+=['Arabic font (sec «%s»): %s'%(s['heading'][:30],x[:60]) for x in al]
    emit(ch,h,t,[fix(x) for x in nt],False)
# ---- write
for i,(t,a) in enumerate(secs): pass
S=[];for_end=len(rows)
for i,(t,a) in enumerate(secs):
    b=(secs[i+1][1]-1) if i+1<len(secs) else len(rows)
    S.append([i+1,t,a,b,''])
rows=[[i+1,r[0],'',{'fn':r[1]}] if r[1] else [i+1,r[0]] for i,r in enumerate(rows)]
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
entry={"key":KEY,"ar":"من الهندوسية إلى محدث المدينة (رحلة حياة الدكتور محمد عبد الله الأعظمي)","ur":"ہندو سے محدث مدینہ بننے تک کا سفر","en":"From Hinduism to Muhaddith of Madinah (Urdu)",
"sub":{"ur":"ڈاکٹر محمد عبداللہ اعظمی (المعروف بالضیاء)، صاحب الجامع الکامل کے حالات و خدمات — مرتب: محمد ابراہیم بن بشیر الحسینوی، نظر ثانی: ابو حسن میاں سعید",
"ar":"أحوال وخدمات الدكتور محمد عبد الله الأعظمي (المعروف بالضياء) صاحب الجامع الكامل — ترتيب: محمد إبراهيم بن بشير الحسينوي",
"en":"Life and service of Dr. Muhammad Abdullah al-Azami (known as al-Diya), author of Al-Jami al-Kamil — compiled by Muhammad Ibrahim bin Bashir al-Husaynawi"},
"sections":S,"prose":True,"langs":["ur"],"files":{"ur":[[a,b,n] for a,b,n,_,_ in files]},"count":len(rows),"showpub":True,"pub":{"ur":"دار ابن بشیر للبحث والتحقیق","ar":"دار ابن بشير للبحث والتحقيق","en":"Dar Ibn Bashir lil-Bahth wa-l-Tahqiq"}}
s=open('coll/index.js',encoding='utf-8').read()
A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')]);A=[e for e in A if e['key']!=KEY];A.append(entry)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+jd(A)+')')
o=json.load(open('offline.json',encoding='utf-8'));o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
o['groups'].append({"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in files],"b":sum(x[3] for x in files)})
open('offline.json','w',encoding='utf-8').write(jd(o))
rep.append('rows %d, sections %d'%(len(rows),len(S)))
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'report.txt'),'w',encoding='utf-8').write('\n'.join(rep))
print('\n'.join(rep[-6:]))
