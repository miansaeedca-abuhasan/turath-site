import json,hashlib,os,glob,re
os.chdir('/home/claude/turath-site')
d=json.load(open('/tmp/tf/final_rows.json'));R=[[i+1,r[0]] for i,r in enumerate(d['rows'])];SEC=d['sec']
U={1:'الفاتحہ، البقرہ',2:'البقرہ',3:'البقرہ، آل عمران',4:'آل عمران، النساء',5:'النساء',6:'النساء، المائدہ',7:'المائدہ، الانعام',8:'الانعام، الاعراف',9:'الاعراف، الانفال',10:'الانفال، التوبہ',11:'التوبہ، یونس، ہود',12:'ہود، یوسف',13:'الرعد، ابراہیم، الحجر',14:'الحجر، النحل',15:'بنی اسرائیل، الکہف',16:'الکہف، مریم، طٰہٰ',17:'الانبیاء، الحج',18:'المؤمنون، النور، الفرقان',19:'الفرقان، الشعراء، النمل',20:'النمل، القصص، العنکبوت',21:'العنکبوت، الروم، لقمان، السجدہ، الاحزاب',22:'الاحزاب، سبا، فاطر، یٰس',23:'یٰس، الصافات، ص، الزمر',24:'الزمر، المؤمن، حٰم السجدہ',25:'حٰم السجدہ، الشوریٰ، الزخرف، الدخان، الجاثیہ',26:'الاحقاف تا الذاریات',27:'الذاریات تا الحدید',28:'المجادلہ تا التحریم',29:'الملک تا المرسلات',30:'النبأ تا الناس'}
A={1:'الفاتحة والبقرة',2:'البقرة',3:'البقرة وآل عمران',4:'آل عمران والنساء',5:'النساء',6:'النساء والمائدة',7:'المائدة والأنعام',8:'الأنعام والأعراف',9:'الأعراف والأنفال',10:'الأنفال والتوبة',11:'التوبة ويونس وهود',12:'هود ويوسف',13:'الرعد وإبراهيم والحجر',14:'الحجر والنحل',15:'الإسراء والكهف',16:'الكهف ومريم وطه',17:'الأنبياء والحج',18:'المؤمنون والنور والفرقان',19:'الفرقان والشعراء والنمل',20:'النمل والقصص والعنكبوت',21:'العنكبوت إلى الأحزاب',22:'الأحزاب إلى يس',23:'يس إلى الزمر',24:'الزمر إلى فصلت',25:'فصلت إلى الجاثية',26:'الأحقاف إلى الذاريات',27:'الذاريات إلى الحديد',28:'المجادلة إلى التحريم',29:'الملك إلى المرسلات',30:'النبأ إلى الناس'}
secs=[]
for k,(p,st) in enumerate(SEC):
    en=SEC[k+1][1]-1 if k+1<len(SEC) else len(R)
    secs.append([k+1,'پارہ %d — %s'%(p,U[p]),st,en,A[p]])
KEY='tafsirnoor'
for f in glob.glob(f'coll/{KEY}_*'): os.remove(f)
files=[];cur=[];size=0
def flush():
    global cur,size
    if not cur:return
    body='COLLDATA("%s","ur",%s)'%(KEY,json.dumps(cur,ensure_ascii=False,separators=(',',':')))
    h=hashlib.md5(body.encode()).hexdigest()[:6];name=f'{KEY}_ur_{len(files)+1}_{h}.js'
    open('coll/'+name,'w',encoding='utf8').write(body)
    files.append([cur[0][0],cur[-1][0],name,len(body.encode()),hashlib.md5(body.encode()).hexdigest()[:10]]);cur=[];size=0
for r in R:
    cur.append(r);size+=len(r[1])
    if size>180000:flush()
flush()
s=open('coll/index.js',encoding='utf8').read()
Aj=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
e=[x for x in Aj if x['key']==KEY][0]
e['sections']=secs;e['files']={"ur":[[a,b,n] for a,b,n,_,_ in files]};e['count']=len(R)
e['sub']={"ur":"جلد 1 تا 15 — سورۃ الفاتحہ تا سورۃ الناس (پارہ 1 تا 30)؛ جمع و ترتیب: ابو حمزہ عبد الخالق صدیقی، حافظ عبد الرؤف محمدی؛ نظر ثانی: شیخ الحدیث عبد الوحید ساجد حفظہ اللہ","ar":"المجلدات 1–15 — من الفاتحة إلى الناس (الأجزاء 1–30)؛ جمع وترتيب: أبو حمزة عبد الخالق الصديقي وحافظ عبد الرؤوف محمدي","en":"Volumes 1–15 — al-Fatiha to an-Nas (Parts 1–30); compiled by Abu Hamza Abdul Khaliq Siddiqi and Hafiz Abdul Rauf Muhammadi"}
open('coll/index.js','w',encoding='utf8').write('COLLS('+json.dumps(Aj,ensure_ascii=False,separators=(',',':'))+')')
o=json.load(open('offline.json'))
g=[x for x in o['groups'] if x['id']=='c_'+KEY][0]
g['f']=[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in files];g['b']=sum(f[3] for f in files)
json.dump(o,open('offline.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(R),len(files),sum(f[3] for f in files)//1024,'KB',secs[:2],secs[-1])
