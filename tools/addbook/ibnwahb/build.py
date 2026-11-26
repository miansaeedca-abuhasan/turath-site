#!/usr/bin/env python3
"""Muwatta Ibn Wahb (owner's JSON `Mouta_Ibn_Wehab_Mukammal.json`, 26-11-2026; Ansar as-Sunnah Publications, tr. + takhrij Ata Ullah Salafi) -> coll book `ibnwahbur`
(ar + ur, 521 hadith, 8 kutub, intro = «عرض ناشر / تقریظ / سوانح عمری»).  usage: python3 tools/addbook/ibnwahb/build.py <json>
Row (ur): [n, "<urdu> (1)", "", {"k": "(1) <hukm/takhrij>"}]  — the reader shows «تحقیق و تخریج» without the note number (same as Muwatta Ansar).
Then: python3 tools/takhrij_short.py ; python3 tools/rehash.py ; bump sw.js"""
import json,re,sys,os,hashlib
here=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,os.path.join(here,'..','muwatta'))
os.chdir(os.path.join(here,'..','..','..'))
import common
common.seg_fix=lambda t:t.replace('؁','').replace('ـ','')      # dagger alif stays (owner ruling 21-11-2026)
from common import urx,final_clean,ar_clean,verse_line
KEY='ibnwahbur'
d=json.load(open(sys.argv[1],encoding='utf-8'))
H=[h for k in d['kutub'] for h in k['hadiths']]; assert [h['number'] for h in H]==list(range(1,len(H)+1))==list(range(1,522))
def quotes(t):   # straight / curly double quotes -> ’’ ‘‘ (Urdu rule)
    o=[]
    for i,ch in enumerate(t):
        if ch not in '”“"': o.append(ch);continue
        prev=t[i-1] if i else ' ';nxt=t[i+1] if i+1<len(t) else ' '
        o.append('’’' if (prev in ' \n(:،[' or i==0) and nxt not in ' \n' else '‘‘')
    return ''.join(o)
VR=re.compile(r'\s*﴿\s*([^﴾]*?)\s*﴾\s*[\(\[]([^()\[\]]{2,40})[\)\]]\s*(?:[”“"]([^”“"]*)[”“"])?',re.S)
def verses(t):
    def f(m):
        v,ref,tr=m.group(1),m.group(2),m.group(3)
        line=verse_line('﴿ '+v+' ﴾ ('+ref+')') or m.group(0)
        out='\n'+line+'\n'
        if tr is not None: out+='’’'+tr.strip()+'‘‘\n'
        return out
    return VR.sub(f,t)
def U(t): return urx(quotes(verses(t.replace('\r',''))))
# Arabic: the file has the Urdu-script honorifics inside the Arabic text -> the Arabic wording (written in full, vocalized)
AH=[('صلی اللہ علیہ وسلم','صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ'),('صلى الله عليه وسلم','صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ'),('رضی اللہ عنہما','رَضِيَ اللَّهُ عَنْهُمَا'),('رضی اللہ عنہم','رَضِيَ اللَّهُ عَنْهُمْ'),('رضی اللہ عنہا','رَضِيَ اللَّهُ عَنْهَا'),('رضی اللہ عنہ','رَضِيَ اللَّهُ عَنْهُ'),('رحمہ اللہ','رَحِمَهُ اللَّهُ')]
cnt={'ar_honorific':0}
def AR(t):
    t=ar_clean(t)
    for a,b in AH: cnt['ar_honorific']+=t.count(a); t=t.replace(a,b)
    t=re.sub(r'\s*[۔]\s*$','.',t.strip()); t=t.replace('۔','.')
    t=re.sub(r'\s+([\.،:؟])',r'\1',t); t=re.sub(r'\s+',' ',t).strip()
    if t and not re.search(r'[\.:؟»\)\]]$',t): t+='.'
    return t
ar=[];ur=[]
for h in H:
    n=h['number']; k=final_clean(h['takhrij'].replace('\n',' '))
    ur.append([n,U(h['urdu']).strip()+' (1)','',{'k':'(1) '+k}])
    ar.append([n,AR(h['arabic'])])
# sections = kutub; heads
AN={'کتاب الطہارۃ':'كِتَابُ الطَّهَارَةِ','کتاب الاشربۃ':'كِتَابُ الْأَشْرِبَةِ','کتاب المناسک':'كِتَابُ الْمَنَاسِكِ','کتاب الزکاۃ':'كِتَابُ الزَّكَاةِ','کتاب الصلاۃ':'كِتَابُ الصَّلَاةِ','کتاب النکاح':'كِتَابُ النِّكَاحِ','کتاب الصوم':'كِتَابُ الصَّوْمِ','کتاب القسامۃ والعقول والدیات':'كِتَابُ الْقَسَامَةِ وَالْعُقُولِ وَالدِّيَاتِ'}
SEC=[];HEADS=[]
for i,k in enumerate(d['kutub']):
    a,b=k['hadiths'][0]['number'],k['hadiths'][-1]['number']; assert k['name'] in AN
    SEC.append([i+1,k['name'],a,b,AN[k['name']]]); HEADS.append([a,k['name'],AN[k['name']]])
# intro
INTRO=[]
for key in('arz_e_nashir','taqriz','sawanih_umri'):
    L=[p.strip() for p in d['front_matter'][key].replace('\r','').split('\n\n') if p.strip()]
    title=L[0]; INTRO.append([title,[U(p) for p in L[1:]]])
def jd(x): return json.dumps(x,ensure_ascii=False,separators=(',',':'))
for f in os.listdir('coll'):
    if f.startswith(KEY+'_'): os.remove('coll/'+f)
def write(l,rows):
    files=[];cur=[];size=0
    def fl():
        nonlocal cur,size
        if not cur: return
        body='COLLDATA("%s","%s",%s)'%(KEY,l,jd(cur)); h=hashlib.md5(body.encode()).hexdigest()[:6]; nm=f'{KEY}_{l}_{len(files)+1}_{h}.js'
        open('coll/'+nm,'w',encoding='utf-8').write(body); files.append([cur[0][0],cur[-1][0],nm,len(body.encode()),hashlib.md5(body.encode()).hexdigest()[:10]]); cur=[];size=0
    for r in rows:
        cur.append(r); size+=len(jd(r))
        if size>150000: fl()
    fl(); return files
FA=write('ar',ar);FU=write('ur',ur)
s=open('coll/index.js',encoding='utf-8').read(); A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
entry={"key":KEY,"ar":"موطأ ابن وهب (الترجمة الأردية)","ur":"موطا ابن وہب (اردو ترجمہ و تخریج)","en":"Muwatta Ibn Wahb (Urdu translation and takhrij)","langs":["ar","ur"],
 "sections":SEC,"heads":HEADS,"count":len(H),"intro":INTRO,
 "sub":{"ur":"ترجمہ و تخریج: مولانا عطاء اللہ سلفی","ar":"ترجمة وتخريج: مولانا عطاء الله سلفي","en":"Translation and takhrij by Maulana Ata Ullah Salafi"},
 "author":["ibnwahb","عبد الله بن وهب","عبد اللہ بن وہب","Abdullah ibn Wahb",198],
 "trn":{"ur":"مولانا عطاء اللہ سلفی","en":"Maulana Ata Ullah Salafi"},
 "pub":{"ur":"انصار السنہ پبلیکیشنز، لاہور","ar":"أنصار السنة للنشر، لاهور","en":"Ansar as-Sunnah Publications, Lahore"},
 "files":{"ar":[[a,b,n] for a,b,n,_,_ in FA],"ur":[[a,b,n] for a,b,n,_,_ in FU]}}
A=[e for e in A if e['key']!=KEY]; A.append(entry)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+jd(A)+')')
o=json.load(open('offline.json',encoding='utf-8')); o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
F=FA+FU
o['groups'].append({"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in F],"b":sum(x[3] for x in F)})
open('offline.json','w',encoding='utf-8').write(jd(o))
print('hadith',len(H),'ar files',len(FA),'ur files',len(FU),cnt)
