#!/usr/bin/env python3
"""Difa-e-Sahaba wa Ahl al-Bayt (Urdu) `difaesahabaur` (owner 27-11-2026). Input: the owner's JSON `Difae_Sahaba_w_Ahle_Bait_Mukammal.json`
(book/author/translator/publisher, front_matter{arz_e_nashir,taqriz,muqaddima}, chapters[{title,sections[{heading,text,footnotes[{number,text}]}]}]).
Marks in the text: ➀-➉ (1-10), ⑪-⑳, ㉑-㉟, ㊱-㊿, «51⃝» (51+); front matter ❶❷… restart per page, notes are tail lines «❶ …» of the text.
Rows: 3 front rows + one row per JSON section (`§heading` + paragraphs + `(n)` marks, notes in ext.fn).  Sections of the registry = 3 front + 11 chapters.
Cleaning: ” “ -> ’’ ‘‘ (the file uses ” as opening, “ as closing), verse refs «﴾ (X: n)» -> «﴾ [X: n]», dotted leaders in headings, حضرت before رضی اللہ عنہ… -> سیدنا/سیدہ.
Then: python3 tools/order_tail.py ; python3 tools/rehash.py ; bump sw.js ; tests/difae_sahaba_full.js"""
import json,re,sys,os,hashlib,glob
SRC=sys.argv[1]
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','..'))
KEY='difaesahabaur'
d=json.load(open(SRC,encoding='utf-8'))
def cls(): return ''.join(chr(a)+'-'+chr(b) for a,b in [(0x2776,0x277f),(0x2780,0x2789),(0x2460,0x2473),(0x3251,0x325f),(0x32b1,0x32bf),(0x2793,0x2793)])
MK=re.compile(r'[ ]?(['+cls()+r']|[۰-۹0-9]+⃝)')
def val(m):
    if m.endswith('⃝'): return int(m[:-1].translate(str.maketrans('۰۱۲۳۴۵۶۷۸۹','0123456789')))
    o=ord(m)
    if 0x2776<=o<=0x277f: return o-0x2776+1
    if 0x2780<=o<=0x2789: return o-0x2780+1
    if o==0x2793: return 10
    if 0x2460<=o<=0x2473: return o-0x2460+1
    if 0x3251<=o<=0x325f: return o-0x3251+21
    if 0x32b1<=o<=0x32bf: return o-0x32b1+36
rep=[]
SUR=str.maketrans({'ة':'ۃ','ي':'ی','ك':'ک','ى':'ی'})
def quotes(t): return t.replace('”','’’').replace('“','‘‘')
def verse(t):
    def f(m):
        ref=m.group(2).translate(SUR)
        return m.group(1)+' ['+ref+']'
    return re.sub(r'(﴾)\s*\(([^()\n]{2,40}?:\s*[۰-۹0-9]+(?:\s*[-–]\s*[۰-۹0-9]+)?)\)',f,t)
NAME=r'(?:[^\s۔،؛:؟!”“\'’‘()\[\]]+\s){0,4}?'
def sayyidna(t):
    t=re.sub(r'حضرت (?=('+NAME+r')رضی اللہ عنہا)',r'سیدہ ',t)
    t=re.sub(r'حضرت (?=('+NAME+r')رضی اللہ عنہ[مٰما]*(?![ا-ی]))',r'سیدنا ',t)
    return t
def clean(t): return sayyidna(verse(quotes(t)))
def heading(h):
    h=re.sub(r'\s*[.۔]{3,}\s*',' ',h.strip());h=re.sub(r'^([۰-۹]+)\s+',r'\1۔ ',h);h=re.sub(r'\s+',' ',h)
    return clean(h)
def marks_to_n(text):
    """-> (text with (n) marks renumbered 1..k in reading order, k)"""
    c=[0]
    def f(m): c[0]+=1;return '(%d)'%c[0]
    return MK.sub(f,text),c[0]
FIX={}   # (chapter,section) -> function(text, notes) for the few source slips, filled below after the PDF check

PASSAGE44 = ("\n\nاگر یہ کہا جائے کہ نبی کریم صلی اللہ علیہ وسلم کے اس فرمان کی کیا تو جیہ ہوگی؟ [آپ کا فرمان ہے:]\n"
 "”بیشک تمہارے پیچھے ایسے ایام ہیں جن میں صبر کرنا ایسے ہے جیسے انگارے کو پکڑ لینا۔ ان ایام میں نیک اعمال کرنے والے کا اجر ایسے ہی ہوگا جیسے اس جیسے نیک اعمال کرنے والے پچاس افراد کا عمل۔“ تو صحابہ نے عرض کیا: کیا ان میں سے پچاس نیک افراد کا عمل؟ تو آپ نے فرمایا:\n"
 "”تم میں سے پچاس افراد۔“ ⑪\n"
 "جواب: یہ فضیلت ایک متعین معاملہ میں ہے؛ اس سے مطلقاً فضیلت ثابت نہیں ہوتی اور وہ معاملہ یہ ہے کہ ان دنوں میں صبر کرنے والے کا اجر صحابہ کرام رضی اللہ عنہم میں سے پچاس صبر کرنے والوں کے اجر کے برابر ہے۔ پس پتا چلا یہ ایک خاص فضیلت ہے جو کہ ایک متعین مسئلہ میں ہے۔ یہ فضیلت مطلق طور پر نہیں۔\n"
 "حافظ ابن حجر رحمہ اللہ فرماتے ہیں: ”یہ حدیث کہ ’ان میں سے ایک عامل کا اجر تم میں سے پچاس کے اجر کے برابر ہوگا‘ اس میں کسی غیر صحابی کی صحابی پر فضیلت کی کوئی دلیل نہیں۔ اس لیے کہ صرف اجر زیادہ ہونے کے ثبوت سے مطلق طور پر افضلیت کا ثبوت لازم نہیں آتا۔ نیز یہ کہ اجر میں تفاضل اس جیسے عمل کی نسبت سے ہوتا ہے۔ جب کہ وہ لوگ جو نبی کریم صلی اللہ علیہ وسلم کی زیارت کی سعادت حاصل کرپائے ہیں؛ کوئی فضیلت اس سعادت کا مقابلہ نہیں کرسکتی۔“ [فتح الباری ۷/۷]")
def _fix_ch3s3(t,nn):
    # printed p.44 passage (PDF p.42) is missing in the JSON; transcribed from the page image; note 11 already in JSON
    return t.rstrip()+PASSAGE44,nn
FIX[(2,2)]=_fix_ch3s3

def _ch3s1(t,nn):   # stray ➀ glued to the verse end (printed p.31 has no note there)
    assert '﴾ ➀ (' in t; return t.replace('﴾ ➀ (','﴾ (',1),nn
def _ch3s9(t,nn):   # printed p.54: the unmarked page-foot block (Imam Malik…) is an unnumbered note, listed first
    nn=[dict(nn[2],number=None),nn[0],nn[1]]; return t,nn
def _ch3s10(t,nn):  # printed p.57: marks 1-7 + the last mark = note 9 (Ibn Kathir); note 8 (Ibn Mas'ud block) is an unmarked page-foot block
    nn=[dict(nn[7],number=None)]+nn[:7]+[dict(nn[8],number=8)]; return t,nn
def _ch4s1(t,nn):   # printed p.99: the treaty text has no mark, Abu Basir carries 71 (note 71 = al-Kafi), the chest-clearing hadith 72
    a='عمل پیرا ہوں گے۔“ ۷۱⃝';b='کم عرصہ میں پڑھا کرتا تھا۔“ ۷۲⃝'
    assert a in t and b in t
    return t.replace(a,'عمل پیرا ہوں گے۔“',1).replace(b,'کم عرصہ میں پڑھا کرتا تھا۔“ ۷۱⃝',1),nn

def _ch8s3(t,nn):   # printed p.334: the page-foot note «صحیح بخاری: ۴۹۱۶» has no mark in the print; it is the Bukhari hadith of Umar (verse of the wives) -> mark put at the end of that quotation (placement is ours)
    a='تو اس پر یہ آیت نازل ہوئی۔“'; assert t.count(a)==1; return t.replace(a,a+' ➀',1),nn
STASH={}
def _ch9s2(t,nn):   # printed p.346: note 2 belongs to the next part (mark after «الخ۔» there)
    STASH['n']=nn[1]; return t,nn[:1]
def _ch9s3(t,nn):
    # printed p.346 (PDF 344): «… پھر حضرت عثمان …… الخ۔ ❷» then a new line «پھر اس کے بعد…»; the JSON dropped «…… الخ۔ ❷» and the word «سب» (لوگوں میں سب سے افضل) -> restored from the page image
    a='لوگوں میں سے افضل سیدنا ابو بکر رضی اللہ عنہ ہیں، پھر سیدنا عمر رضی اللہ عنہ، پھر سیدنا عثمان رضی اللہ عنہ پھر اس کے بعد'
    assert t.count(a)==1 and 'n' in STASH
    t=t.replace('➁','➂').replace('➀','➁')
    t=t.replace(a,'لوگوں میں سب سے افضل سیدنا ابو بکر رضی اللہ عنہ ہیں، پھر سیدنا عمر رضی اللہ عنہ، پھر سیدنا عثمان رضی اللہ عنہ ...... الخ۔ ➀\nپھر اس کے بعد',1)
    return t,[dict(STASH['n'],number=1),dict(nn[0],number=2),dict(nn[1],number=3)]
FIX[(7,2)]=_ch8s3;FIX[(8,1)]=_ch9s2;FIX[(8,2)]=_ch9s3
FIX[(2,0)]=_ch3s1;FIX[(2,8)]=_ch3s9;FIX[(2,9)]=_ch3s10;FIX[(3,0)]=_ch4s1
rows=[];secs=[];fixes=[]
def add_row(text,notes):
    rows.append([len(rows)+1,text,notes])
# ---- front matter
FRONT=[('arz_e_nashir','عرض ناشر'),('taqriz','تقریظ (از فضیلۃ الشیخ ابو الحسن مبشر احمد ربانی حفظہ اللہ)'),('muqaddima','مقدمہ')]
for k,title in FRONT:
    L=d['front_matter'][k].split('\n');tail=[]
    while L and re.match(r'^[❶-❿]\s',L[-1]): tail.insert(0,L.pop())
    body='\n'.join(L);body,n=marks_to_n(body)
    assert n==len(tail),(k,n,len(tail))
    notes=['(%d) %s'%(i+1,clean(re.sub(r'^[❶-❿]\s*','',t).strip())) for i,t in enumerate(tail)]
    add_row('§'+title+'\n'+clean(body),'\n'.join(notes))
    secs.append([len(rows),title,len(rows),len(rows),''])
# ---- chapters
for ci,ch in enumerate(d['chapters']):
    first=len(rows)+1
    for si,s in enumerate(ch['sections']):
        t=s['text'];nn=[dict(f) for f in s['footnotes']]
        t=re.sub(r'﴿[^﴾]*﴾',lambda m:MK.sub(lambda q:' '+str(val(q.group(1))).translate(str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹')),m.group(0)),t)   # circled numbers inside ﴿…﴾ are AYAH numbers (checked on printed pp.194-195), not footnote marks
        ms=[val(m.group(1)) for m in MK.finditer(t)]
        fx=FIX.get((ci,si))
        if fx: t,nn=fx(t,nn)
        ms=[val(m.group(1)) for m in MK.finditer(t)]
        if ms!=[f['number'] for f in nn if f['number'] is not None]: rep.append('علامات اور حواشی کی ترتیب برابر نہیں: باب %d حصہ %d «%s» — علامات %d، حواشی %d'%(ci+1,si+1,s['heading'][:30],len(ms),len(nn)))
        t,_=marks_to_n(t)
        notes='\n'.join(('(%d) %s'%(f['number'],clean(MK.sub(lambda q:' '+str(val(q.group(1))).translate(str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹')),re.sub(r'\s+',' ',f['text']).strip())))) if f['number'] is not None else clean(MK.sub(lambda q:' '+str(val(q.group(1))).translate(str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹')),re.sub(r'\s+',' ',f['text']).strip())) for f in nn)
        add_row('§'+heading(s['heading'])+'\n'+clean(t),notes)
    secs.append([first,clean(ch['title']),first,len(rows),''])
secs=[[i+1,a[1],a[2],a[3],a[4]] for i,a in enumerate(secs)]
def jd(x): return json.dumps(x,ensure_ascii=False,separators=(',',':'))
for f in glob.glob(f'coll/{KEY}_*'): os.remove(f)
files=[];cur=[];size=0
def fl():
    global cur,size
    if not cur: return
    body='COLLDATA("%s","ur",%s)'%(KEY,jd([[r[0],r[1],'',{'fn':r[2]}] if r[2] else [r[0],r[1]] for r in cur]))
    h=hashlib.md5(body.encode()).hexdigest()[:6];name=f'{KEY}_ur_{len(files)+1}_{h}.js'
    open('coll/'+name,'w',encoding='utf-8').write(body)
    files.append([cur[0][0],cur[-1][0],name,len(body.encode()),hashlib.md5(body.encode()).hexdigest()[:10]]);cur=[];size=0
for r in rows:
    cur.append(r);size+=len(r[1])+len(r[2])
    if size>90000: fl()
fl()
entry={"key":KEY,"ar":"الدفاع عن الصحابة وأهل البيت رضي الله عنهم (ترجمة أردية)","ur":"دفاع صحابہ و اہل بیت رضی اللہ عنہم اجمعین","en":"Defence of the Companions and Ahl al-Bayt (Urdu)",
"sub":{"ur":"تالیف: قسم الدراسات والبحوث، جمعیۃ آل و اصحاب؛ ترجمہ: الشیخ شفیق الرحمٰن الدراوی؛ ناشر: دار المعرفہ، پاکستان — شبہات اور ان کا ردّ",
"ar":"تأليف: قسم الدراسات والبحوث بجمعية آل وأصحاب؛ ترجمة: الشيخ شفيق الرحمن الدراوي؛ النشر: دار المعرفة، باكستان — الشبهات والرد عليها",
"en":"By the Research Department of Jam‘iyyat Aal wa Ashab; translated by Shaykh Shafiq ur-Rahman ad-Darawi; Dar al-Ma‘rifah, Pakistan — doubts about the Companions and their refutation"},
"sections":secs,"prose":True,"langs":["ur"],"files":{"ur":[[a,b,n] for a,b,n,_,_ in files]},"count":len(rows),
"pub":{"ur":"دار المعرفہ، پاکستان","ar":"دار المعرفة، باكستان","en":"Dar al-Ma‘rifah, Pakistan"}}
s=open('coll/index.js',encoding='utf-8').read()
A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')]);A=[e for e in A if e['key']!=KEY];A.append(entry)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+jd(A)+')')
o=json.load(open('offline.json',encoding='utf-8'));o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
o['groups'].append({"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in files],"b":sum(x[3] for x in files)})
open('offline.json','w',encoding='utf-8').write(jd(o))
rep.append('شمار: rows %d، حصے (sections) %d، فائلیں %d، حواشی والے rows %d'%(len(rows),len(secs),len(files),sum(1 for r in rows if r[2])))
open('tools/addbook/difae/report.txt','w',encoding='utf-8').write('\n'.join(rep)+'\n');print('\n'.join(rep))
