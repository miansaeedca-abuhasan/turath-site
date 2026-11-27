#!/usr/bin/env python3
"""Registers `qencen` from /tmp/qen/rows_en.json (written by build_en.py). Then: tools/rehash.py, bump sw.js."""
import json,hashlib,os,glob
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
KEY='qencen';D=json.load(open('/tmp/qen/rows_en.json'))
rows=D['rows'];secs=D['sections']
for f in glob.glob(f'coll/{KEY}_*'):os.remove(f)
files=[];cur=[];size=0
def flush():
    global cur,size
    if not cur:return
    body='COLLDATA("%s","en",%s)'%(KEY,json.dumps(cur,ensure_ascii=False,separators=(',',':')))
    h=hashlib.md5(body.encode()).hexdigest()
    name=f'{KEY}_en_{len(files)+1}_{h[:6]}.js';open('coll/'+name,'w').write(body)
    files.append([cur[0][0],cur[-1][0],name,len(body.encode()),h[:10]]);cur=[];size=0
for r in rows:
    cur.append(r);size+=len(r[1])
    if size>180000:flush()
flush()
s=open('coll/index.js').read();A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
q=[e for e in A if e['key']=='qenc'][0]
entry={"key":KEY,"ar":"موسوعة القرآن (الإنجليزية)","ur":"قرآن انسائیکلوپیڈیا (انگریزی)","en":"Quran Encyclopedia",
"sub":{"ur":"تالیف: ڈاکٹر محمد ضیاء الرحمن الاعظمی (انگریزی)","ar":"تأليف: الدكتور محمد ضياء الرحمن الأعظمي (الإنجليزية)","en":"By Dr. Muhammad Diya ar-Rahman al-A‘zami"},
"sections":[[s_[0],s_[1],s_[2],s_[3]] for s_ in secs],"prose":True,"langs":["en"],
"files":{"en":[[a,b,n] for a,b,n,_,_ in files]},"count":len(rows),"grp":q.get('grp'),"author":q.get('author'),
"pub":q.get('pub')}
A=[e for e in A if e['key']!=KEY];A.append(entry)   # later books stand at the registry end (tests/book_order_23nov.js)
open('coll/index.js','w').write('COLLS('+json.dumps(A,ensure_ascii=False,separators=(',',':'))+')')
o=json.load(open('offline.json'));g=o['groups'];g[:]=[x for x in g if x.get('id')!='c_'+KEY]
grp={"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in files],"b":sum(f[3] for f in files)}
g.append(grp)
json.dump(o,open('offline.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(files),'files')
