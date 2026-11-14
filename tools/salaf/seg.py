# usage: python3 tools/salaf/seg.py ROW [maxchars]  -> numbered segments of a sh10906 row
import json,sys,re
def L(p):
    t=open(p,encoding='utf8').read();return json.loads(t[t.index('",[')+2:t.rindex(')')])
def row(n):
    idx=open('coll/index.js',encoding='utf8').read()
    j=json.loads(idx[idx.index('(')+1:idx.rindex(')')])
    sh=[x for x in j if x['key']=='sh10906'][0]
    for f in sh['files']['ar']:
        if f[0]<=n<=f[1]:
            for r in L('coll/'+f[2]):
                if r[0]==n: return r[1]
def segs(t): return [s.strip() for s in re.split(r'(?<=[\.\n])\s+',t) if s.strip()]
if __name__=='__main__':
    n=int(sys.argv[1]);m=int(sys.argv[2]) if len(sys.argv)>2 else 160
    for i,s in enumerate(segs(row(n))): print(i,len(s),s[:m])
