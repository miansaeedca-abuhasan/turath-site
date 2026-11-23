import sys,os,json,re,hashlib
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','muwatta'))
from reg import register
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','..'))
D=json.load(open('/tmp/jf_built.json'))
KEY='jamulfawaid'
rows=D['rows'];secs=D['secs'];heads=D['heads'];NT={int(k):v for k,v in D['NT'].items()};AN=D['an'];intro=D['intro']
AR=[[r[0],r[1]] for r in rows]
UR=[[r[0],r[2],"",r[3]] if r[3] else [r[0],r[2]] for r in rows]
# printed numbers: runs of consecutive integers are written as [first row, first printed number, count]
an={};runs=[];i=1;n=len(rows)
vals={int(k):v for k,v in AN.items()}
def num(v): return int(v) if re.fullmatch(r'\d+',v) else None
ids=sorted(vals)
j=0
while j<len(ids):
    k=ids[j];v=num(vals[k]);c=1
    while v is not None and j+c<len(ids) and ids[j+c]==k+c and num(vals[ids[j+c]])==v+c: c+=1
    if c>=3: runs.append([k,v,c])
    else:
        for t in range(c): an[str(ids[j+t])]=vals[ids[j+t]]
    j+=c
if runs: an['_r']=runs
NTF=[];cur={};size=0
def flushnt():
    global cur,size
    if not cur: return
    body='COLLNT("%s",%s)'%(KEY,json.dumps({str(k):v for k,v in cur.items()},ensure_ascii=False,separators=(',',':')))
    h=hashlib.md5(body.encode()).hexdigest()[:6];nm='%s_nt_%d_%s.js'%(KEY,len(NTF)+1,h)
    NTF.append([min(cur),max(cur),nm,body]);cur={};size=0
for k in sorted(NT):
    cur[k]=NT[k];size+=len(json.dumps(NT[k],ensure_ascii=False).encode())
    if size>180000: flushnt()
flushnt()
entry={"key":KEY,"ar":"جمع الفوائد من جامع الأصول ومجمع الزوائد","ur":"جمع الفوائد من جامع الأصول ومجمع الزوائد (اردو شرح)","en":"Jam' al-Fawa'id min Jami' al-Usul wa Majma' az-Zawa'id (Urdu commentary)",
"langs":["ar","ur"],"sections":secs,"heads":heads,"count":len(rows),"an":an,"grp":"ar","parts":True,"nj":True,"ntx":[[a,b,n] for a,b,n,_ in NTF],
"sub":{"ur":"ترجمہ: مولانا محمد احمد ولد پیر — تخریج و شرح: شیخ الحدیث حافظ محمد عباس انجم گوندلوی","ar":"ترجمة: مولانا محمد احمد ولد پیر — التخريج والشرح: الشيخ محمد عباس انجم گوندلوی","en":"Translation: Maulana Muhammad Ahmad Wald Peer — takhrij and commentary: Shaykh al-Hadith Hafiz Muhammad Abbas Anjum Gondalwi"},
"author":["maghribi","المغربي","امام محمد بن سلیمان المغربی","Al-Maghribi",1094],
"trn":{"ur":"مولانا محمد احمد ولد پیر","en":"Maulana Muhammad Ahmad Wald Peer"},
"shn":{"ur":"شیخ الحدیث حافظ محمد عباس انجم گوندلوی","en":"Shaykh al-Hadith Hafiz Muhammad Abbas Anjum Gondalwi"},
"intro":intro,
"pub":{"ur":"انصار السنہ پبلیکیشنز، لاہور","ar":"أنصار السنة للنشر، لاهور","en":"Ansar as-Sunnah Publications, Lahore"}}
f=register(KEY,entry,{'ar':AR,'ur':UR},after='c_sharhsunnaur')
for a,b,n,body in NTF: open('coll/'+n,'w',encoding='utf8').write(body)
oj=json.load(open('offline.json',encoding='utf8'))
g=[x for x in oj['groups'] if x['id']=='c_'+KEY][0]
for a,b,n,body in NTF:
    sz=len(body.encode());g['f'].append(['coll/'+n,hashlib.md5(body.encode()).hexdigest()[:10],'coll/'+n,sz]);g['b']+=sz
json.dump(oj,open('offline.json','w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
s=open('coll/index.js',encoding='utf8').read()
L=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
e=[x for x in L if x['key']==KEY][0];L=[x for x in L if x['key']!=KEY]
i=[x['key'] for x in L].index('sharhsunnaur');L.insert(i+1,e)
open('coll/index.js','w',encoding='utf8').write('COLLS('+json.dumps(L,ensure_ascii=False,separators=(',',':'))+')')
print({k:len(v) for k,v in f.items()},'ntfiles',len(NTF),'an runs',len(runs),'an single',len(an)-1)
