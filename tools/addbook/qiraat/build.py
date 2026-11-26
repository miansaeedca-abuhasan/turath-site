#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""القراءة خلف الإمام (Imam Bayhaqi), Urdu tr. + hawashi Amanullah Asim (Ansar as-Sunnah, Lahore) -> coll book `qiraatkhalfur` (owner file Qiraat_Khalf_ul_Imam_Mukammal.json, 26-11-2026).
usage: python3 tools/addbook/qiraat/build.py <json>   then: python3 tools/takhrij_short.py ; python3 tools/rehash.py ; bump sw.js
Rows: ur [id, urdu text with (n) marks, "", {"f":"§حواشی\n(1) note…"}] ; ar [id, arabic].  ids = running number 1..N, `an` = printed number where it differs."""
import re,sys,os,json,hashlib
here=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,here);sys.path.insert(0,os.path.join(here,'..','muwatta'))
ROOT=os.path.join(here,'..','..','..');os.chdir(ROOT)
import common
common.seg_fix=lambda t:t.replace('؁','').replace('ـ','')
from common import urx,final_clean,ar_clean
import stream as S
from qparse import load,is_ar
KEY='qiraatkhalfur'
pg=load(sys.argv[1])
BAB=re.compile(r'^باب(?:\s*نمبر)?\s*[:：]?\s*\(?([0-9۰-۹]+)\)?\s*[:：]?\s*$')
FASL=re.compile(r'^فصل\s*[:：]?\s*([0-9۰-۹]+)\s*$')
def quotes(t):
    t=t.replace('“','”')
    o=[]
    for i,ch in enumerate(t):
        if ch not in '”"': o.append(ch);continue
        prev=t[i-1] if i else ' ';nxt=t[i+1] if i+1<len(t) else ' '
        o.append('’’' if (prev in ' \n(:،[' or i==0) and nxt not in ' \n' else '‘‘')
    return ''.join(o)
AH=[('صلی اللہ علیہ وسلم','صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ'),('صلى الله عليه وسلم','صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ'),('رضی اللہ عنہما','رَضِيَ اللَّهُ عَنْهُمَا'),('رضی اللہ عنہم','رَضِيَ اللَّهُ عَنْهُمْ'),('رضی اللہ عنہا','رَضِيَ اللَّهُ عَنْهَا'),('رضی اللہ عنہ','رَضِيَ اللَّهُ عَنْهُ'),('رحمہ اللہ','رَحِمَهُ اللَّهُ')]
def AR(t):
    t=ar_clean(t)
    for a,b in AH: t=t.replace(a,b)
    t=t.replace('۔','.')
    t=re.sub(r'^\(\(\s*(.*?)\s*\)\)$',r'\1',t.strip())
    t=re.sub(r'\s+([\.،:؟])',r'\1',t); t=re.sub(r'\s+',' ',t).strip()
    return t
VL=re.compile(r'^﴿\s*(.*?)\s*﴾\s*\[([^\]]*)\]\s*$')
def para(t):
    """one Urdu paragraph -> cleaned (marks kept as sentinels)"""
    m=VL.match(t.strip())
    if m: return '﴿ '+ar_clean(m.group(1))+' ﴾ ['+re.sub(r'\s*:\s*',': ',m.group(2).strip())+']'
    t=re.sub(r'^\(\(\s*(.*?)\s*\)\)$',r'\1',t.strip()) if is_ar(t) else t
    return urx(quotes(t.replace('\r','')))
def heading_like(t):
    s=re.sub('\x01\\d+\x01','',t).strip()
    return len(s)<=110 and bool(s) and (s.endswith(':') or s.endswith('：') or not re.search(r'[۔\.\?؟!»”’\)\]]$',s)) and not is_ar(s)
END=re.compile(r'[۔\.\?؟!»”’\)\]:\x01]$|\x01\d+\x01$')
def join_pages(items):
    """join a paragraph cut by a page end (previous line has no end mark, next line is on the next page)"""
    out=[]
    for k,s in items:
        if out and out[-1][0]!=k and not S.MARK.match(s) and not S.BAB.match(s) and not BAB.match(s) and not FASL.match(s):
            pk,ps=out[-1]
            if not END.search(ps) and not is_ar(ps) and not is_ar(s) and not heading_like(ps) :
                out[-1]=(k,ps+' '+s);continue
        out.append((k,s))
    return out
H2=re.compile('[\u064b-\u0652]')
def msplit(txt,run=6):
    """a marker line holds the Arabic and sometimes its Urdu translation in one line: cut where 6 unvocalised words in a row start"""
    t=txt.split(' ')
    for p in range(len(t)):
        if len(t[p:p+run])==run and all(not H2.search(x) for x in t[p:p+run]):
            while p>0 and re.fullmatch(r'ح\.*',t[p]): p+=1
            return ' '.join(t[:p]),' '.join(t[p:])
    return txt,''
# ---------------- main book ----------------
it=S.stream(pg,55,495)
it=join_pages(it)
rows=[];babs=[];cur=None;pre=[];bab=None;pend_fasl=None
def fin():
    global cur
    if cur is not None: rows.append(cur);cur=None
def new_row(pn,ar):
    return {'pn':pn,'ar':ar,'ur':[],'bab':bab['n'] if bab else 0}
i=0
while i<len(it):
    k,s=it[i]
    mb=BAB.match(s)
    if mb:
        fin()
        # arabic title (1+ arabic lines) then one urdu title line
        j=i+1;ar=[]
        while j<len(it) and is_ar(it[j][1]) : ar.append(it[j][1]);j+=1
        if j==i+1 and False: pass
        ur=it[j][1];j+=1
        bab={'n':len(babs)+1,'pn':int(mb.group(1).translate(S.U2E)),'ar':AR(' '.join(ar)),'ur':para(ur),'first':len(rows)+1}
        babs.append(bab);pre=[];i=j;continue
    mf=FASL.match(s)
    if mf:
        # trailing headings of the current narration move too; fasl title = next line
        if cur is not None:
            while cur['ur'] and heading_like(cur['ur'][-1]) and len(cur['ur'])>1: pre.insert(0,cur['ur'].pop())
            fin()
        t=it[i+1][1];pre.append(('F','فصل %s: %s'%(mf.group(1).translate(S.E2U),para(t))));i+=2;continue
    mm=S.MARK.match(s)
    if mm:
        if cur is not None:
            while len(cur['ur'])>1 and heading_like(cur['ur'][-1]) and cur['ur'][-1].rstrip().endswith(':'): pre.insert(0,cur['ur'].pop())
            fin()
        a0,u0=msplit(mm.group(2))
        ar=[a0];j=i+1
        while j<len(it) and is_ar(it[j][1]) and not S.MARK.match(it[j][1]) and not BAB.match(it[j][1]) and not FASL.match(it[j][1]): ar.append(it[j][1]);j+=1
        cur=new_row(int(mm.group(1).translate(S.U2E)),AR(re.sub(r'^\[(?:پہلی|دوسری|تیسری) سند\]\s*','',' '.join(ar))))
        if u0: cur['ur'].append(para(u0))
        cur['pre']=pre;pre=[];i=j;continue
    if cur is None: pre.append(para(s) if not isinstance(s,tuple) else s)
    else: cur['ur'].append(para(s))
    i+=1
fin()
# tail of the book: Arabic closing line after the last Urdu paragraph stays in the last row (as in print)
print('narrations',len(rows),'babs',len(babs))
for b in babs: print(' bab',b['n'],b['pn'],'first row',b['first'],b['ur'][:60])
# the print puts the translation of [115] at the page foot after the notes: row 116 gets it from row 117 (checked on the PDF page 158)
for e,src,pi in ((116,117,1),):
    r=rows[src-1]
    if not rows[e-1]['ur']: rows[e-1]['ur']=[r['ur'].pop(pi)];
    if len(r['ur'])>=2 and r['ur'][0].rstrip().endswith('کہ') : r['ur'][0]=r['ur'][0]+' '+r['ur'].pop(1)
STRAY=[]
# ---------------- rows ----------------
def mk(text,notes):
    """renumber the sentinels of one row/section -> (1)(2)…; returns text, [notes]"""
    out=[];cnt=[0]
    def f(m):
        cnt[0]+=1;out.append(NOTE(int(m.group(1))));return ' (%d)'%cnt[0]
    t=re.sub('\x01(\\d+)\x01',f,text)
    t=re.sub(r' +\n','\n',t); t=t.replace('\n (','\n(')
    return t,out
def NOTE(g):
    n=S.NOTES[g].strip()
    return urx(quotes(final_clean(n)))
def pl(p):
    if isinstance(p,tuple): return '§'+p[1]
    return '§'+p if heading_like(p) else p
UR=[];AR_=[];AN=[]
for n,r in enumerate(rows,1):
    lines=[pl(p) for p in r['pre']]+r['ur']
    text,nt=mk('\n'.join(lines),None)
    text=re.sub(r'\n{2,}','\n',text).strip()
    if re.search('[①-⑳❶-❿]',text): STRAY.append((n,re.findall('.{15}[①-⑳❶-❿].{10}',text)));text=re.sub(' ?[①-⑳❶-❿]','',text)
    ex={}
    if nt: ex['f']='§حواشی\n'+'\n'.join('(%d) %s'%(i+1,x) for i,x in enumerate(nt))
    UR.append([n,text,'',ex] if ex else [n,text])
    AR_.append([n,r['ar']])
    r['id']=n
# printed numbers: printed list (file) vs running id
printed=[r['pn'] for r in rows]
AN={}
for n,pn in enumerate(printed,1):
    if pn!=n: AN[n]=pn
# the printed [41] before 414 is a typo of the file/book (sequence says 413)
for n in range(1,len(rows)):
    if printed[n]==41 and printed[n-1]==412: AN[n+1]=413
# ---------------- sections ----------------
SEC=[];HEADS=[]
for b in babs:
    nx=babs[b['n']]['first']-1 if b['n']<len(babs) else len(rows)
    t=u'باب %d: %s'%(b['n'],b['ur']);SEC.append([b['n'],t,b['first'],nx,b['ar']]);HEADS.append([b['first'],b['ur'],b['ar']])
# ---------------- intro ----------------
TIT=['عرض ناشر','تقریظ','عرض مترجم','امام بیہقی رحمہ اللہ کا تعارف','کتاب کا نام','مؤلف سے نسبت کی توثیق','کتاب کی تالیف میں امام بیہقی رحمہ اللہ','القراءۃ خلف الإمام، للبیہقی؛ کے مخطوطات','القراءۃ خلف الإمام، للبیہقی؛ کے مطبوعہ نسخے']
def isT(s):
    s=s.strip()
    if s.startswith('القراءۃ خلف الإمام، للبیہقی؛ کے') and len(s)<60 and 'نسخ' in s or s.startswith('القراءۃ خلف الإمام، للبیہقی؛ کے مخطوطات'): return s
    return next((t for t in TIT if s==t or (len(t)>12 and s.startswith(t[:14]) and len(s)<len(t)+25)),None)
S._g[0]=10**6
ii=S.stream(pg,16,44)+[(2,'__FATIHA__')]
INTRO=[];sec=None
def close():
    global sec
    if not sec: return
    text,nt=mk('\n'.join(sec[1]),None)
    paras=[p for p in text.split('\n') if p.strip()]
    if nt: paras+=['§حواشی']+['(%d) %s'%(i+1,x) for i,x in enumerate(nt)]
    INTRO.append([sec[0],paras]);sec=None
ii=join_pages([x for x in ii if x[1]!='__FATIHA__'])
for k,s in ii:
    t=isT(s)
    if t and len(s)<len(t)+25 and (not sec or t!=sec[2]): 
        old=sec[1] if sec and sec[2]=='' else None
        if not old: close()
        sec=[para(s),old or [],t];continue
    if sec is None: sec=['عرض ناشر',[],'']
    sec[1].append(pl(para(s)) if heading_like(para(s)) and not S.BAB.match(s) else para(s))
close()
# page 2 (Fatiha) and page 54 (title page of the book)
def plain_page(k,title):
    body,notes=S.split_page(k,pg[k]);body=S.place_marks(k,body,notes)
    text,nt=mk('\n'.join(para(x) if not x.startswith('سُوْرَة') else x for x in body),None)
    ps=[p for p in text.split('\n') if p.strip()]
    return [title,ps]
INTRO.insert(0,plain_page(2,'سورۃ الفاتحہ'))
INTRO.append(plain_page(54,'کتاب کا آغاز'))
print('intro',[(t,len(p)) for t,p in INTRO])
json.dump({'ur':UR,'ar':AR_,'sec':SEC,'heads':HEADS,'intro':INTRO,'an':AN},open('/tmp/qiraat_rows.json','w'),ensure_ascii=False)
print('stray circled marks removed in rows',STRAY);print('empty ur',[r[0] for r in UR if len(r[1])<40]);print('rows',len(UR),'with notes',sum(1 for r in UR if len(r)>3),'an',len(AN),'notes total',sum(r[3]['f'].count('\n(')+0 for r in UR if len(r)>3))
# ---------------- write ----------------
def jd(x): return json.dumps(x,ensure_ascii=False,separators=(',',':'))
for f in os.listdir('coll'):
    if f.startswith(KEY+'_'): os.remove('coll/'+f)
def write(l,rows_):
    files=[];cur=[];size=0
    def fl():
        nonlocal cur,size
        if not cur: return
        body='COLLDATA("%s","%s",%s)'%(KEY,l,jd(cur)); h=hashlib.md5(body.encode()).hexdigest()[:6]; nm=f'{KEY}_{l}_{len(files)+1}_{h}.js'
        open('coll/'+nm,'w',encoding='utf-8').write(body); files.append([cur[0][0],cur[-1][0],nm,len(body.encode()),hashlib.md5(body.encode()).hexdigest()[:10]]); cur=[];size=0
    for r in rows_:
        cur.append(r); size+=len(jd(r))
        if size>150000: fl()
    fl(); return files
FA=write('ar',AR_);FU=write('ur',UR)
# an: ids 57..414 print 56..413, 415..453 print 414..452  (two [56] in the book, [41] for 413)
anr=[[57,56,358],[415,414,39]]
s=open('coll/index.js',encoding='utf-8').read(); A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
entry={"key":KEY,"ar":"القراءة خلف الإمام للبيهقي (الترجمة الأردية)","ur":"قراءۃ خلف الامام للبیہقی (اردو ترجمہ و تخریج)","en":"Qira'ah Khalf al-Imam by al-Bayhaqi (Urdu translation and takhrij)","langs":["ar","ur"],
 "sections":SEC,"heads":HEADS,"count":len(rows),"intro":INTRO,"an":{"_r":anr},
 "sub":{"ur":"ترجمہ و حواشی: مولانا امان اللہ عاصم - تحقیق: شیخ الحدیث حکیم محمد اشفاق احمد","ar":"ترجمة وحواشي: مولانا أمان الله عاصم - تحقيق: الشيخ حكيم محمد أشفاق أحمد","en":"Translation and notes by Maulana Amanullah Asim - verification by Hakim Muhammad Ashfaq Ahmad"},
 "author":["bayhaqi","البيهقي","امام بیہقی","Al-Bayhaqi",458],
 "trn":{"ur":"مولانا امان اللہ عاصم","en":"Maulana Amanullah Asim"},
 "pub":{"ur":"انصار السنہ پبلیکیشنز، لاہور","ar":"أنصار السنة للنشر، لاهور","en":"Ansar as-Sunnah Publications, Lahore"},"showpub":True,
 "files":{"ar":[[a,b,n] for a,b,n,_,_ in FA],"ur":[[a,b,n] for a,b,n,_,_ in FU]}}
A=[e for e in A if e['key']!=KEY]
ix=max(i for i,e in enumerate(A) if e.get('author') and e['author'][0]=='bayhaqi')
A.insert(ix+1,entry)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+jd(A)+')')
o=json.load(open('offline.json',encoding='utf-8')); o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
F=FA+FU
o['groups'].append({"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in F],"b":sum(x[3] for x in F)})
open('offline.json','w',encoding='utf-8').write(jd(o))
print('written',len(FA),len(FU))
