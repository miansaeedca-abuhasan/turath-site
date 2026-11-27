#!/usr/bin/env python3
"""Musnad Ibn Abi Shaiba (Urdu) `ibnabishaibaur` — owner's JSON `Musnad_Ibn_Abi_Shaiba_Mukammal.json` (26-11-2026; Ansar as-Sunnah Publications, translation / tahqiq / takhrij / fawaid-masail Muhammad Hussain Memon;
taqriz Abdullah Nasir Rahmani) -> coll book: 998 hadith in 282 musnads (one per Companion).  usage: python3 tools/addbook/ibnabishaiba/build.py <json>
ur row: [id, urdu+" (1)", "", {"k":"(1) takhrij","f":"fawaid lines"}]; ar row: [id, arabic]; ids = running 1..998, registry `an` = printed numbers where they differ
(the file numbers hadith 136 as 126, skips 258 and prints 627 twice).  Section introductions -> `ntx` (COLLNT).   Then: python3 tools/rehash.py ; bump sw.js"""
import json,re,sys,os,hashlib
here=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,os.path.join(here,'..','muwatta'))
os.chdir(os.path.join(here,'..','..','..'))
import common
common.seg_fix=lambda t:t.replace('؁','').replace('ـ','')
from common import urx,final_clean,ar_clean,verse_line
KEY='ibnabishaibaur'
d=json.load(open(sys.argv[1],encoding='utf-8'))
S=d['musnad'];H=[h for s in S for h in s['hadiths']]
assert len(H)==998==d['total_hadiths']
def quotes(t):
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
AH=[('صلی اللہ علیہ وسلم','صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ'),('صلى الله عليه وسلم','صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ'),('رضی اللہ عنہما','رَضِيَ اللَّهُ عَنْهُمَا'),('رضی اللہ عنہم','رَضِيَ اللَّهُ عَنْهُمْ'),('رضی اللہ عنہا','رَضِيَ اللَّهُ عَنْهَا'),('رضی اللہ عنہ','رَضِيَ اللَّهُ عَنْهُ'),('رحمہ اللہ','رَحِمَهُ اللَّهُ')]
def AR(t):
    t=ar_clean(t)
    for a,b in AH: t=t.replace(a,b)
    t=re.sub(r'\s*[۔]\s*$','.',t.strip()); t=t.replace('۔','.')
    t=re.sub(r'^\(\(\s*(.*?)\s*\)\)$',r'\1',t)
    t=re.sub(r'\s+([\.،:؟])',r'\1',t); t=re.sub(r'\s+',' ',t).strip()
    if t and not re.search(r'[\.:؟»\)\]]$',t): t+='.'
    return t
def nrm(s): return re.sub(r'[ً-ْـ]','',s).replace('ہ','ه').replace('ی','ي').replace('ے','ي').replace('ک','ك').replace('أ','ا').replace('إ','ا')
def tk(h):
    t=final_clean(h['takhrij'].replace('\n',' ')).strip();hk=h['hukm'].strip()
    if hk and (not t or nrm(hk) not in nrm(t)): t=(hk+': '+t) if t else hk     # both fields are the book's own words
    return t
SH=re.compile(r'\s+(?=[۱-۹][۰-۹]?۔)')
def fw(h):
    out=[]
    for k in ('fawaid','sharh'):
        x=h[k].strip()
        if x: out+= [p.strip() for p in SH.split(U(x).replace('\n',' ')) if p.strip()]
    return '\n'.join(out)
ar=[];ur=[];empty_tk=[]
for n,h in enumerate(H,1):
    t=tk(h)
    if not t: empty_tk.append(n)
    ex={}
    if t: ex['k']='(1) '+t
    f=fw(h)
    if f: ex['f']=f
    ur.append([n,U(h['urdu']).strip()+(' (1)' if t else ''),'',ex] if ex else [n,U(h['urdu']).strip()])
    ar.append([n,AR(h['arabic'])])
# sections = the musnads
SEC=[];HEADS=[];NT={};i=0
for si,s in enumerate(S,1):
    a=i+1;i+=len(s['hadiths']);b=i
    nm=urx(s['name']);SEC.append([si,nm,a,b,'']);HEADS.append([a,nm,''])
    if s['introduction'].strip(): NT[str(si)]=[U(s['introduction']).strip()]
assert i==998
AN={'136':'126','_r':[[258,259,369]]}
INTRO=[]
for key in('arz_e_nashir','taqriz','muqaddima_muhaqqiq'):
    L=[p.strip() for p in d['front_matter'][key].replace('\r','').split('\n\n') if p.strip()]
    INTRO.append([L[0],[U(p) for p in L[1:]]])
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
ntb='COLLNT("%s",%s)'%(KEY,jd(NT));nh=hashlib.md5(ntb.encode()).hexdigest()[:6];ntn=f'{KEY}_nt_1_{nh}.js'
open('coll/'+ntn,'w',encoding='utf-8').write(ntb)
s=open('coll/index.js',encoding='utf-8').read(); A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
entry={"key":KEY,"ar":"مسند ابن أبي شيبة (الترجمة الأردية)","ur":"مسند ابن ابی شیبہ (اردو ترجمہ و تخریج)","en":"Musnad Ibn Abi Shaybah (Urdu translation and takhrij)","langs":["ar","ur"],
 "sections":SEC,"heads":HEADS,"count":len(H),"intro":INTRO,"an":AN,
 "sub":{"ur":"ترجمہ، تحقیق، تخریج اور فوائد و مسائل: محمد حسین میمن - تقریظ: شیخ عبد اللہ ناصر رحمانی حفظہ اللہ","ar":"ترجمة وتحقيق وتخريج وفوائد ومسائل: محمد حسين ميمن - تقريظ: الشيخ عبد الله ناصر رحماني حفظه الله","en":"Translation, verification, takhrij and benefits by Muhammad Hussain Memon - foreword by Shaykh Abdullah Nasir Rahmani"},
 "author":["ibnabishayba","ابن أبي شيبة","امام ابن ابی شیبہ","Ibn Abi Shaybah",235],
 "trn":{"ur":"محمد حسین میمن","en":"Muhammad Hussain Memon"},
 "pub":{"ur":"انصار السنہ پبلیکیشنز، لاہور","ar":"أنصار السنة للنشر، لاهور","en":"Ansar as-Sunnah Publications, Lahore"},"showpub":True,
 "ntx":[[1,282,ntn]],
 "files":{"ar":[[a,b,n] for a,b,n,_,_ in FA],"ur":[[a,b,n] for a,b,n,_,_ in FU]}}
A=[e for e in A if e['key']!=KEY]
ix=max(i for i,e in enumerate(A) if e.get('author') and e['author'][0]=='ibnabishayba')
A.insert(ix+1,entry)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+jd(A)+')')
o=json.load(open('offline.json',encoding='utf-8')); o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
F=FA+FU+[[0,0,ntn,len(ntb.encode()),hashlib.md5(ntb.encode()).hexdigest()[:10]]]
o['groups'].append({"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in F],"b":sum(x[3] for x in F)})
open('offline.json','w',encoding='utf-8').write(jd(o))
print('hadith',len(H),'ar files',len(FA),'ur files',len(FU),'empty takhrij+hukm rows',empty_tk,'with notes',sum(1 for r in ur if len(r)>3 and 'f' in r[3]))
