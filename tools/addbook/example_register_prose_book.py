import json,re,hashlib,os,glob
R0=json.load(open('/tmp/tf2/rows_all.json'));R=[[i+1,r[0],r[1]] for i,r in enumerate(R0)];SECS=json.load(open('/tmp/tf2/sections.json')); intro=json.load(open('/tmp/tf/intro.json'))
os.chdir('/home/claude/turath-site')
KEY='tafsirnoor'
for f in glob.glob(f'coll/{KEY}_*'): os.remove(f)
rows=[[r[0],r[1]] for r in R]
secs=SECS
assert R[-1][1].startswith('§ضروری نوٹس') and secs[-1][2]==len(R)
files=[];cur=[];size=0
def flush():
    global cur,size
    if not cur: return
    body='COLLDATA("%s","ur",%s)'%(KEY,json.dumps(cur,ensure_ascii=False,separators=(',',':')))
    h=hashlib.md5(body.encode()).hexdigest()[:6]
    name=f'{KEY}_ur_{len(files)+1}_{h}.js'
    open('coll/'+name,'w').write(body)
    files.append([cur[0][0],cur[-1][0],name,len(body.encode()),hashlib.md5(body.encode()).hexdigest()[:10]]);cur=[];size=0
for r in rows:
    cur.append(r);size+=len(r[1])
    if size>180000: flush()
flush()
entry={"key":KEY,"ar":"تفسير نور الهدى","ur":"تفسیر نور الہدیٰ","en":"Tafsir Noor al-Huda",
"sub":{"ur":"جلد 1 تا 4 — سورۃ الفاتحہ تا سورۃ الاعراف (پارہ 8)؛ جمع و ترتیب: ابو حمزہ عبد الخالق صدیقی، حافظ عبد الرؤف محمدی؛ نظر ثانی: شیخ الحدیث عبد الوحید ساجد حفظہ اللہ",
"ar":"المجلدات 1–4 — من الفاتحة إلى الأعراف؛ جمع وترتيب: أبو حمزة عبد الخالق الصديقي وحافظ عبد الرؤوف محمدي",
"en":"Volumes 1–4 — al-Fatiha to al-Araf; compiled by Abu Hamza Abdul Khaliq Siddiqi and Hafiz Abdul Rauf Muhammadi"},
"sections":secs,"prose":True,"langs":["ur"],"files":{"ur":[[a,b,n] for a,b,n,_,_ in files]},"count":len(rows),
"intro":intro,
"pub":{"ur":"ادارہ انصار السنۃ پبلیکیشنز، لاہور","ar":"مؤسسة أنصار السنة للنشر، لاهور","en":"Ansar as-Sunnah Publications, Lahore"}}
s=open('coll/index.js').read()
A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
A=[e for e in A if e['key']!=KEY]
i=[e['key'] for e in A].index('raheeq')
A.insert(i+1,entry)
open('coll/index.js','w').write('COLLS('+json.dumps(A,ensure_ascii=False,separators=(',',':'))+')')
# offline
o=json.load(open('offline.json'))
o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
g={"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in files],"b":sum(f[3] for f in files)}
k=[x['id'] for x in o['groups']].index('c_raheeq')
o['groups'].insert(k+1,g)
json.dump(o,open('offline.json','w'),ensure_ascii=False,separators=(',',':'))
print(files, secs)
