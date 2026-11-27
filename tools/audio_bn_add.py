#!/usr/bin/env python3
"""Adds Bengali audio (owner's batch files): per book a durations .txt + word-times .zip -> audio/en/idx.js ("bn" section) and audio/bn/w<book>.js.
Usage: audio_bn_add.py <dir with Jami_Kamil_BookNN_Readalong_Bengali_Durations.txt / _Word_Timings.zip>"""
import sys,json,zipfile,re,os,glob
root=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..');src=sys.argv[1]
os.makedirs(root+'/audio/bn',exist_ok=True)
t=open(root+'/audio/en/idx.js').read();j=json.loads(t[t.index('(')+1:t.rindex(')')])
bn=j.setdefault('bn',{'hbase':'https://audio.jami-al-kamil.com/bn/','cbase':'audio/bn/ch/'});bn.setdefault('books',{})
tot=0;ALLW={}
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
    if bk in (66,67): need=sorted(h)   # books 66 and 67 are interleaved in the owner's files (like the English Talkhis): each holds only its own hadith; merged below
    assert sorted(h)==need,('durations',bk,[n for n in need if n not in h][:10],[n for n in h if n not in need][:10])
    miss=[n for n in need if n not in W];assert not miss,('words',bk,miss[:10])
    bad=[n for n in need if W[n] and W[n][-1][2]>h[n]+1.5];assert not bad,('words past duration',bk,bad[:10])
    bn['books'][str(bk)]={'from':fr,'to':to,'w':1,'h':{str(n):h[n] for n in need},'c':{}}
    ALLW[bk]={str(n):W[n] for n in need}
    open(root+'/audio/bn/w%d.js'%bk,'w').write('window.ENAUD_W('+json.dumps(ALLW[bk],separators=(',',':'),ensure_ascii=False)+')')
    tot+=len(need);print('book',bk,fr,to,len(need))
if '67' in bn['books'] and '66' in bn['books']:   # merge 67 into 66: one entry covering 16129-16546 (no overlap of hadith numbers)
    a,b=bn['books']['66'],bn['books'].pop('67');assert not set(a['h'])&set(b['h'])
    a['from']=min(a['from'],b['from']);a['to']=max(a['to'],b['to']);a['h'].update(b['h'])
    a['h']=dict(sorted(a['h'].items(),key=lambda x:int(x[0])))
    m=dict(ALLW[66]);m.update(ALLW[67])
    open(root+'/audio/bn/w66.js','w').write('window.ENAUD_W('+json.dumps(m,separators=(',',':'),ensure_ascii=False)+')')
    if os.path.exists(root+'/audio/bn/w67.js'): os.remove(root+'/audio/bn/w67.js')
open(root+'/audio/en/idx.js','w').write('window.ENAUD_IDX('+json.dumps(j,separators=(',',':'),ensure_ascii=False)+')')
print('total hadith',tot,'books',len(bn['books']))
