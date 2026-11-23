#!/usr/bin/env python3
"""Adds Bengali audio (owner's batch files): per book a durations .txt + word-times .zip -> audio/en/idx.js ("bn" section) and audio/bn/w<book>.js.
Usage: audio_bn_add.py <dir with Jami_Kamil_BookNN_Readalong_Bengali_Durations.txt / _Word_Timings.zip>"""
import sys,json,zipfile,re,os,glob
root=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..');src=sys.argv[1]
os.makedirs(root+'/audio/bn',exist_ok=True)
t=open(root+'/audio/en/idx.js').read();j=json.loads(t[t.index('(')+1:t.rindex(')')])
bn=j.setdefault('bn',{'hbase':'https://audio.jami-al-kamil.com/bn/','cbase':'audio/bn/ch/'});bn['books']={}
tot=0
for tf in sorted(glob.glob(src+'/*_Durations.txt')):
    bk=int(re.search(r'Book0*(\d+)_',tf).group(1));zf=tf.replace('Durations.txt','Word_Timings.zip')
    lines=open(tf,encoding='utf8').read().split('\n')
    m=re.search(r'(\d+)،\s*حدیث\s*(\d+)\s*سے\s*(\d+)',lines[0]);assert m and int(m.group(1))==bk,(tf,lines[0])
    fr,to=int(m.group(2)),int(m.group(3));h={}
    for l in lines:
        mm=re.match(r'^\s*0*(\d+):\s*([\d.]+)\s*$',l)
        if mm:h[int(mm.group(1))]=float(mm.group(2))
    z=zipfile.ZipFile(zf);W={}
    for n in z.namelist():
        if n.endswith('.json') and 'hadith_' in n:
            d=json.loads(z.read(n));num=int(d['number'])
            L=[[w['word'].strip(),round(w['start'],2),round(w['end'],2)] for w in d['words'] if w['word'].strip()]
            for k in range(1,len(L)):
                if L[k][1]<L[k-1][1]: L[k][1]=min(L[k-1][2],L[k][2])
            W[num]=L
    need=list(range(fr,to+1))
    assert sorted(h)==need,('durations',bk,[n for n in need if n not in h][:10],[n for n in h if n not in need][:10])
    miss=[n for n in need if n not in W];assert not miss,('words',bk,miss[:10])
    bad=[n for n in need if W[n] and W[n][-1][2]>h[n]+1.5];assert not bad,('words past duration',bk,bad[:10])
    bn['books'][str(bk)]={'from':fr,'to':to,'w':1,'h':{str(n):h[n] for n in need},'c':{}}
    open(root+'/audio/bn/w%d.js'%bk,'w').write('window.ENAUD_W('+json.dumps({str(n):W[n] for n in need},separators=(',',':'),ensure_ascii=False)+')')
    tot+=len(need);print('book',bk,fr,to,len(need))
open(root+'/audio/en/idx.js','w').write('window.ENAUD_IDX('+json.dumps(j,separators=(',',':'),ensure_ascii=False)+')')
print('total hadith',tot,'books',len(bn['books']))
