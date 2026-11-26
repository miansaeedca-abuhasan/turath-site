#!/usr/bin/env python3
"""Tabaqat Ibn Sa'd (Urdu, Nafees Academy Karachi, 8 parts in 4 JSON files) -> coll book `tabaqatur` (owner 25-11-2026).
Input: folder with the 4 owner files  *TabqatIbneSaad{1,2,3,4}Of4_Mukammal*.json  (list of {page, content}; each page = running header
«طبقات ابن سعد (حصہ X) <printed page> <running title>», body paragraphs, footnotes at the end).
Steps: strip headers; footnotes (numeric «(N)» tail lines whose number also stands in the text, or symbols ❶ ❷ ✿) -> `(n)` marks + row notes (ext.fn);
paragraphs broken by a page end are joined; headings = lines ending with «:» that are not narrative («... فرمایا:») and short person lines (…رحمہ اللہ);
rows = headings + paragraphs, cut before a heading after ~3500 characters; sections = printed-page ranges of each part.
Writes coll/tabaqatur_ur_<n>_<md5>.js, registry entry (after sh146), offline.json group c_tabaqatur, tools/tabaqat/report.txt.
Then: python3 tools/rehash.py ; bump sw.js ; tests/tabaqat_book.js"""
import json,re,glob,hashlib,os,sys,collections
SRC=sys.argv[1] if len(sys.argv)>1 else '/mnt/user-data/attachments/c78c1915-dfa8-5395-875d-805b90bb4e15'
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
KEY='tabaqatur'
FILES=[glob.glob(SRC+'/*TabqatIbneSaad%dOf4_Mukammal*.json'%i)[0] for i in (1,2,3,4)]
RUN={'اخبار النبی صلی اللہ علیہ وسلم','مہاجرین و انصار','تابعین و تبع تابعین','صالحات و صحابیات','دور آخر کے صحابہ رضی اللہ عنہم','اصحاب کوفہ و تابعین','خلفائے راشدین اور صحابہ کرام کے','خلفائے راشدین اور صحابہ کرام'}
PARTS={'اول':1,'دوم':2,'سوم':3,'چہارم':4,'پنجم':5,'ششم':6,'ہفتم':7,'ہشتم':8}
PN={1:'اول',2:'دوم',3:'سوم',4:'چہارم',5:'پنجم',6:'ششم',7:'ہفتم',8:'ہشتم'}
H0=re.compile(r'^طبقات ابن سعد \(حصہ ([^)]*?)\s*\)\s*(.*)$')
FN=re.compile(r'^\(\s*([۰-۹0-9]+)\s*\)')
UD=str.maketrans('۰۱۲۳۴۵۶۷۸۹','0123456789'); DU=str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹')
SYM='❶❷✿'
rep=[]
def pages():
    out=[]
    for fi,f in enumerate(FILES):
        for p in json.load(open(f,encoding='utf-8')):
            L=p['content'].split('\n');m=H0.match(L[0])
            if not m:
                rep.append('صفحہ بغیر ہیڈر (سرورق / حقوق / اشتہار) شامل نہیں کیا: فائل %d صفحہ %d — %s'%(fi+1,p['page'],p['content'][:40].replace('\n',' ')));continue
            part=PARTS[m.group(1).strip()];rest=m.group(2).strip();i=1;num=None
            if re.fullmatch(r'[۰-۹]+',rest): num=rest;rest=''
            elif re.fullmatch(r'[۰-۹]+ .*',rest): num,rest=rest.split(' ',1)
            elif i<len(L) and re.fullmatch(r'[۰-۹]+',L[i].strip()): num=L[i].strip();i+=1
            if rest in RUN: rest=''
            if not rest and i<len(L) and L[i].strip() in RUN: i+=1
            out.append(dict(file=fi+1,pdf=p['page'],part=part,num=num,body=L[i:]))
    return out
def split_tail(B):
    k=len(B)
    while k>0 and not B[k-1].strip(): k-=1
    notes=[];j=k
    while j>0 and B[j-1].strip() and B[j-1].strip()[0] in SYM: j-=1
    if j<k: notes=[(B[i].strip()[0],B[i].strip()[1:].strip()) for i in range(j,k)];k=j
    t=k
    while t>0 and FN.match(B[t-1].strip()): t-=1
    cand=B[t:k];nums=[int(FN.match(x.strip()).group(1).translate(UD)) for x in cand]
    for s in range(len(nums)):
        if nums[s:]==list(range(1,len(nums)-s+1)):
            body=B[:t]+cand[:s];ns=nums[s:]
            if all(any(re.search(r'\S\s*\(\s*'+str(n).translate(DU)+r'\s*\)',l.strip()) for l in body) for n in ns):
                return body,[(n,FN.sub('',x.strip(),1).strip()) for n,x in zip(ns,cand[s:])]+notes
            break
    return B[:k],notes
# ---- headings
PERS=re.compile(r'(رضی اللہ عن[ہاما]+|رحمہ اللہ|رحمہا اللہ|رحمۃ اللہ علیہ[ا-ی]*|رحمہم اللہ|علیہ السلام|علیہا السلام|علیہم السلام)')
NARR=re.compile(r'( نے |سے مروی|سے روایت|روایت کی|روایت کرتے|فرمایا|فرمائی|کہا|کہتے|کہتی|کہتا|کہہ|پوچھا|جواب|شعر|اشعار|نازل|بتایا|بیان کیا|یوں|حسب ذیل|ذیل|بولے|ہیں:|ہے:|تھا:|تھے:|ہوئی:|ہوئے:|دیا:|لیا:|کیا:|سنا:|ہو گیا|لکھا|آیت|مضمون|ارشاد|حدیث|یہ ہے|اس کے|کے بعد|اور )')
TERM=set('۔.؟!”’»)"')
def is_head(s):
    if not s or len(s)>110: return False
    if s.endswith(':'):
        if s[0] in '“”"’‘﴿' or '۔' in s[:-1]: return False
        if PERS.search(s) and not re.search(r'(سے مروی|سے روایت|فرمایا|کہا|کہتے|کہتی|روایت|نے )',s): return True
        return not NARR.search(' '+s+' ')
    if len(s)<=60 and s[-1] not in TERM and PERS.search(s) and not re.search(r'[A-Za-z0-9۰-۹\(\)﴿﴾“”"’‘]',s) and not NARR.search(' '+s+' ') and not re.match(r'(رضی|رحمۃ|رحمہ)',s): return True
    return False
# ---- stream
paras=[]
for p in pages():
    body,notes=split_tail(p['body']);notes=[(('S%d'%SYM.index(k) if isinstance(k,str) and k in SYM else k),v) for k,v in notes];nd=dict(notes);used=set();PRE='%d:%d:'%(p['file'],p['pdf'])
    for l in body:
        s=l.strip()
        if not s: continue
        if nd:
            s=re.sub('['+SYM+']',lambda m:(used.add('S%d'%SYM.index(m.group())) or '\x01'+PRE+'S%d\x02'%SYM.index(m.group())) if ('S%d'%SYM.index(m.group()) in nd and 'S%d'%SYM.index(m.group()) not in used) else m.group(),s)
            def mk(m,s=s):
                n=int(m.group(1).translate(UD))
                if n in nd and n not in used and s[:m.start()].strip(): used.add(n);return '\x01'+PRE+'%d\x02'%n
                return m.group(0)
            s=re.sub(r'\(\s*([۰-۹]+)\s*\)',mk,s)
        paras.append(dict(part=p['part'],page=p['num'],pdf=p['pdf'],file=p['file'],text=s,notes={PRE+str(k):v for k,v in notes}))
    for k,v in notes:
        if k not in used:
            # a note whose mark the scan lost: put the mark after the first word of the note that stands on this page, else at the end of the page's first paragraph
            pg=[q for q in paras if q['file']==p['file'] and q['pdf']==p['pdf']]
            term=re.split(r'[:：]',v)[0].strip() if ':' in v else ''
            tgt=next((q for q in pg if term and term in q['text']),None)
            if tgt:
                tgt['text']=tgt['text'].replace(term,term+' \x01'+PRE+'%s\x02'%k,1)
            elif pg: pg[0]['text']+=' \x01'+PRE+'%s\x02'%k
            rep.append('حاشیہ کی علامت متن میں نہیں ملی، %s رکھی گئی: حصہ %d صفحہ %s (فائل %d پی ڈی ایف %d) — حاشیہ %s: %s'%('لفظ کے بعد' if tgt else 'پہلے پیراگراف کے آخر میں',p['part'],p['num'],p['file'],p['pdf'],k,v[:40]))
    for q in [q for q in paras if q['file']==p['file'] and q['pdf']==p['pdf']]:
        for m in re.finditer('['+SYM+']',q['text']):
            rep.append('علامت %s کا حاشیہ فائل میں نہیں ہے، علامت ہٹا دی گئی (پی ڈی ایف میں دیکھا جائے): حصہ %d صفحہ %s (فائل %d پی ڈی ایف %d) — %s'%(m.group(),p['part'],p['num'],p['file'],p['pdf'],q['text'][max(0,m.start()-40):m.start()+15]))
        q['text']=re.sub('['+SYM+']','',q['text'])
# join paragraphs broken by a page end
out=[]
for i,q in enumerate(paras):
    if out and q['file']==out[-1]['file'] and q['part']==out[-1]['part'] and q['pdf']!=out[-1]['pdf'] and q.get('first') is None:
        pass
    out.append(q)
# first line of each page flag
seen=set()
for q in out:
    k=(q['file'],q['pdf']);q['first']=k not in seen;seen.add(k)
J=[]
for q in out:
    if J and q['first'] and J[-1]['part']==q['part'] and J[-1]['file']==q['file'] and J[-1]['kind']=='p':
        a=re.sub('\x01[^\x02]*\x02','',J[-1]['text']).rstrip()
        if len(a)>=40 and a[-1] not in TERM and a[-1]!=':' and not is_head(re.sub('\x01[^\x02]*\x02','',q['text']).strip()):
            J[-1]['text']+=' '+q['text'];J[-1]['notes'].update(q['notes']);J[-1]['joined']=J[-1].get('joined',0)+1;continue
    t=re.sub('\x01[^\x02]*\x02','',q['text']).strip()
    q=dict(q);q['kind']='h' if is_head(t) else 'p';J.append(q)
# ---- rows
def noteid(page,notes,k): return (page,k)
rows=[];secs=[];cur=[];curlen=0;info=[]
def flush():
    global cur,curlen
    if not cur: return
    lines=[];fn=[];n=[0]
    for q in cur:
        t=q['text']
        def sub(m):
            n[0]+=1;fn.append('(%d) %s'%(n[0],re.sub(r'\s+',' ',q['notes'][m.group(1)]).strip()));return '(%d)'%n[0]
        t=re.sub('\x01([^\x02]*)\x02',sub,t)
        t=re.sub(r' +(\(\d+\))',r'\1',t)
        if q['kind']=='h':
            t=t.rstrip()
            t=re.sub(r'\s*:\s*((?:\(\d+\))*)$',r'\1',t)
            t='§'+t
        lines.append(t)
    rows.append(dict(id=len(rows)+1,text='\n'.join(lines),fn='\n'.join(fn),part=cur[0]['part'],p0=cur[0]['page'],p1=cur[-1]['page']))
    cur=[];curlen=0
for q in J:
    if q['kind']=='h' and curlen>=3500 or (curlen>=9000 and cur and q['kind']=='p') or (cur and q['part']!=cur[0]['part']): flush()
    cur.append(q);curlen+=len(q['text'])
flush()
# ---- sections: printed-page ranges of each part (about 30 printed pages)
def pgn(x):
    try: return int(x.translate(UD))
    except: return None
PNAME={1:'اخبار النبی صلی اللہ علیہ وسلم',2:'اخبار النبی صلی اللہ علیہ وسلم',3:'سیرت خلفائے راشدین اور صحابہ کرام',4:'مہاجرین و انصار',5:'تابعین و تبع تابعین',6:'اصحاب کوفہ و تابعین',7:'دور آخر کے صحابہ، تابعین و فقہاء',8:'صالحات و صحابیات'}
SEC=[]
i=0
while i<len(rows):
    pt=rows[i]['part'];j=i;a=pgn(rows[i]['p0'])
    while j+1<len(rows) and rows[j+1]['part']==pt and (pgn(rows[j+1]['p0']) or 0)-(a or 0)<30: j+=1
    b=pgn(rows[j]['p1']) or pgn(rows[j]['p0'])
    SEC.append([len(SEC)+1,'حصہ %s: %s — صفحہ %s تا %s'%(PN[pt],PNAME[pt],str(a).translate(DU),str(b).translate(DU)),rows[i]['id'],rows[j]['id'],'']);i=j+1
# ---- files
def jd(x): return json.dumps(x,ensure_ascii=False,separators=(',',':'))
for f in glob.glob(f'coll/{KEY}_*'): os.remove(f)
files=[];cur_=[];size=0
def fl():
    global cur_,size
    if not cur_: return
    body='COLLDATA("%s","ur",%s)'%(KEY,jd([[r['id'],r['text'],'',{'fn':r['fn']}] if r['fn'] else [r['id'],r['text']] for r in cur_]))
    h=hashlib.md5(body.encode()).hexdigest()[:6];name=f'{KEY}_ur_{len(files)+1}_{h}.js'
    open('coll/'+name,'w',encoding='utf-8').write(body)
    files.append([cur_[0]['id'],cur_[-1]['id'],name,len(body.encode()),hashlib.md5(body.encode()).hexdigest()[:10]]);cur_=[];size=0
for r in rows:
    cur_.append(r);size+=len(r['text'])+len(r['fn'])
    if size>90000: fl()
fl()
sub={'ur':'تصنیف: امام محمد بن سعد رحمہ اللہ؛ ترجمہ: علامہ عبد اللہ العمادی (حصے 1 تا 5)، مولوی نذیر الحق میرٹھی (حصہ 6)، محمد راغب رحمانی (حصے 7، 8)؛ اضافہ عنوانات و حواشی: مولانا عبد المنان؛ ناشر: نفیس اکیڈمی، کراچی — مکمل 8 حصے',
 'ar':'تأليف: الإمام محمد بن سعد رحمه الله؛ ترجمة: علامة عبد الله العمادي (الأجزاء 1–5)، مولوي نذير الحق الميرتهي (الجزء 6)، محمد راغب رحماني (الجزآن 7، 8)؛ إضافة العناوين والحواشي: مولانا عبد المنان؛ النشر: نفيس أكيدمي، كراتشي — الأجزاء الثمانية كاملة',
 'en':'By Imam Muhammad ibn Sa‘d (may Allah have mercy on him); translated by Allama Abdullah al-Imadi (parts 1–5), Maulvi Nazir ul-Haq Meerathi (part 6), Muhammad Raghib Rahmani (parts 7, 8); headings and notes added by Maulana Abdul Mannan; Nafees Academy, Karachi — all 8 parts'}
entry={"key":KEY,"ar":"الطبقات الكبرى لابن سعد (ترجمة أردية)","ur":"طبقات ابن سعد (اردو)","en":"Al-Tabaqat al-Kubra of Ibn Sa‘d (Urdu)","sub":sub,
"sections":SEC,"prose":True,"langs":["ur"],"files":{"ur":[[a,b,n] for a,b,n,_,_ in files]},"count":len(rows),
"pub":{"ur":"نفیس اکیڈمی، اردو بازار، کراچی","ar":"نفيس أكيدمي، كراتشي","en":"Nafees Academy, Urdu Bazar, Karachi"},
"author":["ibnsad","ابن سعد","امام ابن سعد","Ibn Sa‘d",230]}
s=open('coll/index.js',encoding='utf-8').read()
A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')]);A=[e for e in A if e['key']!=KEY]
A.insert([e['key'] for e in A].index('sh146')+1,entry)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+jd(A)+')')
o=json.load(open('offline.json',encoding='utf-8'));o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
g={"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in files],"b":sum(x[3] for x in files)}
k=[x['id'] for x in o['groups']].index('c_sh146');o['groups'].insert(k+1,g)
open('offline.json','w',encoding='utf-8').write(jd(o))
nh=sum(1 for q in J if q['kind']=='h');nfn=sum(1 for r in rows if r['fn'])
rep.append('')
rep.append('شمار: صفحات %d، پیراگراف %d (صفحے کے آخر میں ٹوٹے ہوئے %d جوڑے گئے)، عنوان %d، حصے (rows) %d، ابواب %d، حواشی والے rows %d'%(len(set((q['file'],q['pdf']) for q in out)),len(J),sum(q.get('joined',0) for q in J),nh,len(rows),len(SEC),nfn))
open('tools/tabaqat/report.txt','w',encoding='utf-8').write('\n'.join(rep)+'\n')
print(rep[-1]);print('files',len(files),'bytes',sum(x[3] for x in files),'report lines',len(rep))
