"""Registers the topics files in offline.json (run after tools/topics/build.py) and prints the cache name to bump in sw.js if needed."""
import json,hashlib,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
o=json.load(open('offline.json'))
files=['topics/'+f for f in sorted(os.listdir('topics')) if f.endswith('.js')]+['topics/w/'+f for f in sorted(os.listdir('topics/w'))]+['topics/r/'+f for f in sorted(os.listdir('topics/r'))]+['topics/ju/'+f for f in sorted(os.listdir('topics/ju'))]
F=[];tot=0
for f in files:
    b=open(f,'rb').read();F.append([f,hashlib.md5(b).hexdigest()[:10],f,len(b)]);tot+=len(b)
o['groups']=[g for g in o['groups'] if g.get('id')!='topics']
o['groups'].append({"id":"topics","k":"books","n":{"ur":"موضوعات","en":"Topics","ar":"المواضيع"},"f":F,"b":tot})
json.dump(o,open('offline.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(F),'files',tot,'bytes')
