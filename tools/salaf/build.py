#!/usr/bin/env python3
"""Rebuild the extra part of the «سلف صالحین» book (siyar) from tools/salaf/add/*.json.
Base rows 1..2174 / sections 1..907 stay untouched (tools/salaf/base). Each addition is a person from
Siyar A'lam an-Nubala (sh10906): Arabic = chosen sentences copied verbatim (rank marks and footnote marks removed),
Urdu = hand-written translation, every row labelled with volume/page and linked to the source row."""
import json,re,glob,hashlib,os,sys,subprocess
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
from seg import row,segs
from pages import locate
B='tools/salaf/base/'
md=lambda b:hashlib.md5(b).hexdigest()[:6]
CLEAN=[(r'\s*\*+\s*(\([^)\d]*\))?',' '),(r'\s*\([\d٠-٩]+[)»]\s*',' '),(r'\s*\(\d+»\s*',' ')]
def clean(t):
    for a,b in CLEAN: t=re.sub(a,b,t)
    return re.sub(r'\s+([،:؛.])',r'\1',re.sub(r'\s{2,}',' ',t)).strip()
def cutfrom(text,sub):
    # drop everything before `sub` (written without vowel marks) - used to trim a chain of narrators from the start of a sentence
    keep=[(i,c) for i,c in enumerate(text) if not re.match(r'[\u064b-\u0652\u0670]',c)]
    flat=''.join(c for i,c in keep);k=flat.find(sub)
    if k<0: raise SystemExit('cut text not found: '+sub)
    return text[keep[k][0]:]
def L(p):
    t=open(p,encoding='utf8').read();return json.loads(t[t.index('",[')+2:t.rindex(')')])
def label(pg):
    byj={}
    for j,p in pg: byj.setdefault(j,[]).append(p)
    out=[]
    for j,ps in byj.items():
        ps=sorted(set(ps));out.append('%d/%s'%(j,'، '.join(str(p) for p in ps)))
    return 'مصدر: سیر اعلام النبلاء ('+'؛ '.join(out)+')'
def main():
    meta=json.load(open(B+'meta.json',encoding='utf8'))
    ar=L(B+'siyar_ar.js');ur=L(B+'siyar_ur.js')
    n=meta['count'];sec=meta['sections'];heads=meta['heads'];kind=meta['kind']
    ar2=[];ur2=[]
    for f in sorted(glob.glob('tools/salaf/add/*.json')):
        for P in json.load(open(f,encoding='utf8')):
            first=n+1;sid=len(sec)+1
            rep=P.get('replace')   # a person who already has a short entry in the book: the detailed text takes over THAT section (same place, same title); the old short rows are no longer part of any section
            if P.get('head') and not rep: heads.append([sid,P['head'][0],P['head'][1]])
            S=segs(row(P['row']));PG=locate(S)
            for para in P['paras']:
                sg=para['s'];fr=para.get('from',{});txt=' '.join(clean(cutfrom(S[i],fr[str(i)]) if str(i) in fr else S[i]) for i in sg)
                pg=[PG[i] for i in sg]
                n+=1
                ar2.append([n,txt,label(pg),['sh10906',P['row']]]);ur2.append([n,para['ur']])
                kind+='0'
            if rep:
                o=[x for x in sec if x[0]==rep][0];o[2]=first;o[3]=n
            else: sec.append([sid,P['ur'],first,n,P['ar']])
    for f in sorted(glob.glob('tools/salaf/bio/*.json')):
        for P in json.load(open(f,encoding='utf8')):
            n+=1;rep=P['replace'];first=n
            fns=[];UD=str.maketrans('0123456789','۰۱۲۳۴۵۶۷۸۹')
            def conv(m):
                fns.append(m.group(1).strip());return '\x01%d\x02'%len(fns)
            lines=[]
            for part in P['parts']:
                lines.append('§'+part['h'])
                for para in part['p']:
                    s=re.sub(r'\{\{(.+?)\}\}',conv,para,flags=re.S)
                    s=s.translate(UD)
                    lines.append(re.sub('\x01(\\d+)\x02',lambda m:'('+m.group(1).translate(str.maketrans('۰۱۲۳۴۵۶۷۸۹','0123456789'))+')',s))
            fnl=[P['fnlead']] if P.get('fnlead') else []
            fnl+=['(%d) %s'%(i+1,re.sub(r'(?<=[۰-۹])/(?=[۰-۹])','؍',x.translate(UD))) for i,x in enumerate(fns)]
            ur2.append([n,'\n'.join(lines),'',{'fn':'\n'.join(fnl)}])
            A=P['arabic'];S=segs(row(A['row']));PG=locate(S);ps=[];cur=None
            for i,sg in enumerate(S):
                c=clean(sg)
                if not c: continue
                if cur is not None and PG[i]==cur[0]: cur[1].append(c)
                else:
                    cur=[PG[i],[c]];ps.append(cur)
            ar2.append([n,'\n'.join(' '.join(x[1]) for x in ps),A['label'],['sh10906',A['row']]])
            kind+='0'
            o=[x for x in sec if x[0]==rep][0];o[2]=first;o[3]=n
    old=glob.glob('coll/siyar_ar_2_*.js')+glob.glob('coll/siyar_ur_2_*.js')
    for o in old: os.remove(o)
    files={}
    for lg,rows in (('ar',ar2),('ur',ur2)):
        body=json.dumps(rows,ensure_ascii=False,separators=(',',':'))
        data=('COLLDATA("siyar","%s",%s);'%(lg,body)).encode()
        fn='siyar_%s_2_%s.js'%(lg,md(data));open('coll/'+fn,'wb').write(data);files[lg]=fn
    idx=open('coll/index.js',encoding='utf8').read()
    j=json.loads(idx[idx.index('(')+1:idx.rindex(')')])
    s=[x for x in j if x['key']=='siyar'][0]
    s['sections']=sec;s['heads']=heads;s['kind']=kind;s['count']=n
    s['files']={'ar':[[1,2174,'siyar_ar_1_83891d.js'],[2175,n,files['ar']]],'ur':[[1,2174,'siyar_ur_1_9cd2c3.js'],[2175,n,files['ur']]]}
    open('coll/index.js','w',encoding='utf8').write('COLLS('+json.dumps(j,ensure_ascii=False,separators=(',',':'))+')')
    o=json.load(open('offline.json',encoding='utf8'));g=[x for x in o['groups'] if x['id']=='c_siyar'][0]
    g['f']=[x for x in g['f'] if '_1_' in x[0]]
    for fn in files.values():
        p='coll/'+fn;h=md5=hashlib.md5(open(p,'rb').read()).hexdigest()[:10];g['f'].append([p,h,p,os.path.getsize(p)])
    g['b']=sum(x[3] for x in g['f'])
    open('offline.json','w',encoding='utf8').write(json.dumps(o,ensure_ascii=False,separators=(',',':')))
    subprocess.check_call(['python3','tools/rehash.py'])
    subprocess.check_call(['sed','-i','1s/turath-[0-9]*/turath-'+__import__('time').strftime('%Y%m%d%H%M')+'/','sw.js'])
    print('rows',n,'sections',len(sec))
main()
