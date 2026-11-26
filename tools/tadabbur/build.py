#!/usr/bin/env python3
"""«القرآن: تدبر وعمل» (altadabbur.com data, owner's JSON files, 25-11-2026) -> three prose books
tadabburur / tadabburar / tadabburen (one row per mushaf page 1..604, sections = blocks of 20 pages).
usage: python3 tools/tadabbur/build.py <ur.json> <ar.json> <en.json>
Row text: line 0 '§<surah names>'; then lines with a private-use lead mark (read by tadItem in index.html):
 <kind>   section label (deeds / guid / refl / words)        <text>   numbered item (deeds, guidance)
 <verses> reflection: new item, Arabic verses (may be empty)  <text>   reflection text (source in brackets at its end)
 <text>   question (the reader adds the dotted «answer» line) <word><meaning>   word-meaning row"""
import json,re,sys,hashlib,os,glob
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
UR,AR,EN=sys.argv[1:4]
rep=[]
def jd(x): return json.dumps(x,ensure_ascii=False,separators=(',',':'))
U_DIG=str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹'); A_DIG=str.maketrans('0123456789','٠١٢٣٤٥٦٧٨٩')
# Symbol-font honorific codes left in the source (checked against the Arabic file at the same item: u,t,j,k,p)
EN_GL={'':'(peace be upon him)','':'(may Allah be pleased with him)','':'(may Allah be pleased with them)','':'(may Allah be pleased with them both)','':'(peace be upon them)'}
cnt={}
def bump(k,n=1): cnt[k]=cnt.get(k,0)+n
def ws(t): return re.sub(r'[ \t]{2,}',' ',re.sub(r'\s*\n\s*',' ',t)).strip()
def clean_ur(t):
    t=t.replace('‌','').replace('‍','').replace('‏','').replace('­','')
    bump('ur_durood',t.count('ﷺ'))
    t=re.sub(r'\(\s*ﷺ\s*\)','(صلی اللہ علیہ وسلم)',t)
    t=re.sub(r'\s*ﷺ',' صلی اللہ علیہ وسلم',t)
    t=re.sub(r'(?<=صلی اللہ علیہ وسلم)(?=[ء-ۿ])',' ',t) if False else re.sub(r'(صلی اللہ علیہ وسلم)(?=[ء-ۓ])',r'\1 ',t)
    t=t.replace('(','( علیہ السلام').replace('',' علیہ السلام').replace('',' علیہ السلام ')   # Ibrahim / Musa + glyph = علیہ السلام (the Arabic file has علیہ السلام there)
    t=re.sub(r'شعیب g','شعیب علیہ السلام',t); t=re.sub(r'کرامh','کرام علیہم السلام',t)
    bump('ur_allah',len(re.findall('ﷲ',t)))
    t=t.replace('اَﷲُ','اَللّٰهُ').replace('اﷲ','اللہ').replace('ﷲ','اللہ')
    t=t.replace('ـ','')
    t=re.sub(r'(?<![A-Za-z])\d',lambda m:m.group().translate(U_DIG),t) if False else re.sub(r'\d',lambda m:m.group().translate(U_DIG),t)
    t=re.sub(r'(علیہ السلام|علیہم السلام) +(?=[ء-ۓ])',r'\1 ',t)
    t=re.sub(r' {2,}',' ',t)
    t=re.sub(r'\( +','(',t)
    return ws(t)
# Arabic: a bracket holding 2+ words that are found word for word in the Quran (our own quran/ar_uthmani.js) becomes ﴿vocalized Quran text﴾ (blue in the reader);
# brackets that are not found (other wording, explanations, single words) stay as they are
import collections
_q=open('quran/ar_uthmani.js',encoding='utf-8').read(); _q=json.loads(_q[_q.index('QLOAD(')+6:_q.rindex(')')])[1]
def _nz(w):
    w=re.sub(r'[ً-ٰٟۖ-ۭـ‍]','',w)
    w=w.replace('ؤ','و').replace('ئ','ي').replace('ى','ي').replace('ة','ه')
    return re.sub(r'[اأإآٱء]','',w)
_QW=[w for a in _q for w in a.split()]; _QN=[_nz(w) for w in _QW]; _IDX=collections.defaultdict(list)
for _i,_w in enumerate(_QN): _IDX[_w].append(_i)
def _find(ws):
    if not ws or any(not w for w in ws): return None
    for st in _IDX.get(ws[0],[]):
        if _QN[st:st+len(ws)]==ws: return st
    return None
def quran_mark(t):
    def sub(m):
        g=m.group(1)
        if re.search(r'[0-9:]|[A-Za-z]',g) or not re.search(r'[ء-ي]',g): return m.group(0)
        out=[];nw=0
        for pt in [x.strip() for x in g.split('*')]:
            ws=pt.split(); nw+=len(ws); st=_find([_nz(w) for w in ws])
            if st is None: return m.group(0)
            out.append(' '.join(_QW[st:st+len(ws)]))
        if nw<2: return m.group(0)
        bump('ar_verse_marked'); return '﴿'+' '.join(out)+'﴾'
    return re.sub(r'\(([^()]*)\)',sub,t)
def clean_ar(t):
    t=t.replace('‍','').replace('‏','')
    t=quran_mark(t)
    return ws(re.sub(r'\d',lambda m:m.group().translate(A_DIG),t))
def clean_en(t):
    for k,v in EN_GL.items():
        bump('en_glyph',t.count(k)); t=re.sub(r'\(\s*'+k+r'\s*\)',v,t); t=t.replace(k,v)
    return ws(t)
def pages(f): return json.load(open(f,encoding='utf-8'))
J={'ur':pages(UR),'ar':pages(AR),'en':pages(EN)}
for l in J:
    P=J[l]['pages']; assert [int(p['page']) for p in P]==list(range(1,605)),l
CL={'ur':clean_ur,'ar':clean_ar,'en':clean_en}
SEC_HDR={'ur':'سورۃ ','ar':'سورة ','en':''}
def rowtext(l,p):
    c=CL[l]; L=[]; names=[]
    for k in ('deeds','guidance','word_meanings'):
        for x in p[k]:
            n=x.get('surah','').strip()
            if n and n not in names: names.append(n)
    L.append('§'+(' ، ' if l!='en' else ', ').join(n.replace(SEC_HDR[l],'',1) if l!='en' else n for n in names))
    def sec(kind,items):
        if items: L.append(''+kind); L.extend(items)
    deeds=[''+c(x['text']) for x in p['deeds'] if c(x['text'])]
    guid=[''+c(x['text']) for x in p['guidance'] if c(x['text'])]
    refl=[]
    for r in p['reflections']:
        refl.append(''+ws(r.get('verses_ar','')))
        if c(r.get('text','')): refl.append(''+c(r['text']))
        if c(r.get('question','')): refl.append(''+c(r['question']))
        elif r.get('question','')=='' : bump(l+'_noq')
    words=[''+ws(x['word'])+''+c(x['meaning']) for x in p['word_meanings'] if ws(x['word'])]
    if l=='ar': sec('words',words);sec('deeds',deeds);sec('guid',guid);sec('refl',refl)
    else: sec('deeds',deeds);sec('guid',guid);sec('refl',refl);sec('words',words)
    return '\n'.join(L),names
KEYS={'ur':'tadabburur','ar':'tadabburar','en':'tadabburen'}
NAME={'ur':'القرآن: تدبر و عمل','ar':'القرآن: تدبر و عمل','en':'القرآن: تدبر و عمل'}
ARN={'ur':'القرآن تدبر وعمل','ar':'القرآن تدبر وعمل','en':'القرآن تدبر وعمل'}
ENN={'ur':'Al-Qur’an: Tadabbur wa Amal (Urdu)','ar':'Al-Qur’an: Tadabbur wa Amal (Arabic)','en':'Al-Qur’an: Tadabbur wa Amal'}
SUB={'ur':{'ur':'مصحف کے 604 صفحات: ہر صفحے پر آیات پر عمل، قرآنی رہنمائی، غور و فکر کے گوشے اور الفاظ کے معانی','ar':'٦٠٤ صفحات من المصحف: العمل بالآيات والتوجيهات والوقفات التدبرية ومعاني الكلمات','en':'604 Mushaf pages: acting on the verses, Quranic guidance, reflections and word meanings (Urdu)'},
 'ar':{'ur':'مصحف کے 604 صفحات: معانی الکلمات، العمل بالآیات، التوجیہات اور الوقفات التدبریہ (عربی)','ar':'٦٠٤ صفحات من المصحف: معاني الكلمات والعمل بالآيات والتوجيهات والوقفات التدبرية','en':'604 Mushaf pages: word meanings, acting on the verses, guidance and reflections (Arabic)'},
 'en':{'ur':'مصحف کے 604 صفحات: آیات پر عمل، قرآنی رہنمائی، غور و فکر اور الفاظ کے معانی (انگریزی)','ar':'٦٠٤ صفحات من المصحف: العمل بالآيات والتوجيهات والوقفات ومعاني الكلمات (الإنجليزية)','en':'604 Mushaf pages: acting on the verses, Quranic guidance, reflections and word meanings'}}
DU=str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹')
s=open('coll/index.js',encoding='utf-8').read(); A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
o=json.load(open('offline.json',encoding='utf-8'))
ARNAMES=[]   # Arabic surah names per page (from the Arabic file) for the sections' Arabic title
for p in J['ar']['pages']:
    n=[]
    for k in('deeds','guidance','word_meanings'):
        for x in p[k]:
            q=x.get('surah','').replace('سورة ','',1).strip()
            if q and q not in n:n.append(q)
    ARNAMES.append(n)
for l in ('ur','ar','en'):
    KEY=KEYS[l]
    for f in glob.glob(f'coll/{KEY}_*'): os.remove(f)
    rows=[];names=[]
    for p in J[l]['pages']:
        t,nm=rowtext(l,p); rows.append([int(p['page']),t]); names.append(nm)
    files=[];cur=[];size=0
    def fl():
        global cur,size
        if not cur: return
        body='COLLDATA("%s","%s",%s)'%(KEY,l,jd(cur)); h=hashlib.md5(body.encode()).hexdigest()[:6]; nm=f'{KEY}_{l}_{len(files)+1}_{h}.js'
        open('coll/'+nm,'w',encoding='utf-8').write(body)
        files.append([cur[0][0],cur[-1][0],nm,len(body.encode()),hashlib.md5(body.encode()).hexdigest()[:10]]); cur=[]; size=0
    for r in rows:
        cur.append(r); size+=len(r[1])
        if size>90000: fl()
    fl()
    SEC=[];a=1
    while a<=604:
        b=min(604,a+19)
        if 604-b<10: b=604
        nms=[];anm=[]
        for i in range(a-1,b):
            for n in names[i]:
                if n not in nms: nms.append(n)
            for n in ARNAMES[i]:
                if n not in anm: anm.append(n)
        short=lambda x:x
        if l=='ur': nm=' ، '.join(x.replace('سورۃ ','',1) for x in nms); rng='صفحات %s تا %s'%(str(a).translate(DU),str(b).translate(DU))
        elif l=='ar': nm=' ، '.join(nms); rng='الصفحات %s–%s'%(str(a).translate(A_DIG),str(b).translate(A_DIG))
        else: nm=', '.join(nms); rng='Pages %d–%d'%(a,b)
        SEC.append([len(SEC)+1,rng+' — '+nm,a,b,'الصفحات %s–%s: %s'%(str(a).translate(A_DIG),str(b).translate(A_DIG),' ، '.join(anm))]); a=b+1
    entry={"key":KEY,"ar":ARN[l],"ur":NAME[l],"en":ENN[l],"sub":SUB[l],"sections":SEC,"prose":True,"langs":[l],"files":{l:[[a,b,n] for a,b,n,_,_ in files]},"count":604}
    A=[e for e in A if e['key']!=KEY]; A.append(entry)
    o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
    o['groups'].append({"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in files],"b":sum(x[3] for x in files)})
    print(l,'rows',len(rows),'files',len(files),'bytes',sum(x[3] for x in files),'sections',len(SEC))
open('coll/index.js','w',encoding='utf-8').write('COLLS('+jd(A)+')')
open('offline.json','w',encoding='utf-8').write(jd(o))
rep.append('counts: '+jd(cnt)); open('tools/tadabbur/report.txt','w',encoding='utf-8').write('\n'.join(rep)+'\n'); print(cnt)
