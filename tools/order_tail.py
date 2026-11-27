#!/usr/bin/env python3
"""Owner 26-11-2026: the order of the book list stays as it was on 23-11-2026 (tools/order_23nov.json).
Every book added after that date stands AT THE END of the registry, in the order added: new hadith books first (after all older translated books),
then the sahaba books (Isaba, Usd al-Ghaba, Tabaqat) last.  Run after any build script that inserts a registry entry: python3 tools/order_tail.py ; then tools/rehash.py"""
import json,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
TAIL=['tadabburur','tadabburar','tadabburen','ibnwahbur','qiraatkhalfur','ibnabishaibaur','shuabimanur','sahihjamiur','sh10757','asabahur','asadghabaur','tabaqatur']
s=open('coll/index.js',encoding='utf-8').read();A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
base=json.load(open('tools/order_23nov.json'))
by={e['key']:e for e in A}
old=[by[k] for k in base if k in by]
extra=[e for e in A if e['key'] not in base and e['key'] not in TAIL]   # anything else new keeps its relative order, before the fixed tail
new=old+extra+[by[k] for k in TAIL if k in by]
assert len(new)==len(A)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+json.dumps(new,ensure_ascii=False,separators=(',',':'))+')')
print('registry',len(new),'tail',[e['key'] for e in new[-len(TAIL):]])
