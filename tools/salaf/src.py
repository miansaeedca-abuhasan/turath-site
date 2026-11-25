#!/usr/bin/env python3
"""Look up passages in the Arabic books of the site (coll/<key>_ar_*.js). usage: src.py <key> <words…> [--n 5] ; prints row id + text start"""
import json,re,glob,sys
def rows(key):
    for f in sorted(glob.glob('coll/%s_ar_*.js'%key)):
        t=open(f,encoding='utf8').read()
        for r in json.loads(t[t.index('",[')+2:t.rindex(')')]): yield r
def norm(t): return re.sub(r'[ً-ْٰـ]','',t).replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ى','ي').replace('ة','ه')
if __name__=='__main__':
    key=sys.argv[1];ws=[norm(w) for w in sys.argv[2:] if not w.startswith('--')];n=5
    if '--n' in sys.argv: n=int(sys.argv[sys.argv.index('--n')+1]);ws=[norm(w) for w in sys.argv[2:sys.argv.index('--n')]]
    k=0
    for r in rows(key):
        x=norm(r[1])
        if all(w in x for w in ws):
            print(r[0],len(r[1]),r[1][:300].replace('\n',' '));k+=1
            if k>=n:break
