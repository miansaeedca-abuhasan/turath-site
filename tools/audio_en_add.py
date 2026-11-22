#!/usr/bin/env python3
"""Adds English audio of Book 2 (Batch files from the owner): durations (.txt) + word times (.zip)  ->  audio/en/idx.js (book key) and audio/en/w<key>.js.
Usage: audio_en_add.py <key> <from> <to> <durations.txt>... -- <words.zip>..."""
import sys,json,zipfile,re,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
key,fr,to=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]);a=sys.argv[4:];i=a.index('--');txts,zips=a[:i],a[i+1:]
h={}
for f in txts:
    for l in open(f,encoding='utf8'):
        m=re.match(r'^\s*0*(\d+):\s*([\d.]+)\s*$',l)
        if m:h[int(m.group(1))]=float(m.group(2))
W={};FIX=[]
for f in zips:
    z=zipfile.ZipFile(f)
    for n in z.namelist():
        if not n.endswith('.json') or 'hadith_' not in n:continue   # chapter-title files (chapter_NNN) are not used here
        d=json.loads(z.read(n));num=int(d['number']);L=[[w['word'],round(w['start'],2),round(w['end'],2)] for w in d['words']]
        k=1
        while k<len(L):
            if L[k][1]<L[k-1][1]-1.0:   # the speech-to-text jumped far back (a repeated phrase): spread the confused words evenly between the last good word and the next good one
                pe=L[k-1][2];j=k
                while j<len(L) and L[j][1]<pe-0.01: j+=1
                if j>=len(L): j=len(L);te=max(pe,h.get(num,pe))
                else: te=L[j][1]
                seg=L[k:j];tot=sum(len(x[0]) for x in seg) or 1;t=pe
                for x in seg:
                    d=(te-pe)*len(x[0])/tot;x[1]=round(t,2);x[2]=round(t+d,2);t+=d
                FIX.append(num);k=j;continue
            if L[k][1]<L[k-1][1]-0.01: L[k][1]=min(L[k-1][2],L[k][2])   # slightly early start: where the previous word ends (as in the earlier batches)
            k+=1
        W[num]=L
need=list(range(fr,to+1))
miss=[n for n in need if n not in h or n not in W or len(W[n])<8];assert not miss,('missing',miss[:20])
extra=[n for n in list(h)+list(W) if n<fr or n>to];assert not extra,('outside range',extra[:10])
for n in need:
    e=W[n][-1][2];assert e<=h[n]+1.5,('word times run past duration',n,e,h[n])
t=open('audio/en/idx.js').read();j=json.loads(t[t.index('(')+1:t.rindex(')')])
j['books'][key]={'from':fr,'to':to,'w':1,'h':{str(n):h[n] for n in need},'c':{}}
open('audio/en/idx.js','w').write('window.ENAUD_IDX('+json.dumps(j,separators=(',',':'),ensure_ascii=False)+')')
open('audio/en/w%s.js'%key,'w').write('window.ENAUD_W('+json.dumps({str(n):W[n] for n in need},separators=(',',':'),ensure_ascii=False)+')')
print('repaired runs in hadith:',sorted(set(FIX)));print('added',len(need),'hadith',fr,'-',to,'word file KB',os.path.getsize('audio/en/w%s.js'%key)//1024)
