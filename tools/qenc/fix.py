#!/usr/bin/env python3
"""Quran Encyclopedia (Urdu, coll/qenc_ur_*): owner rulings 27-11-2026.
 * Arabic phrases (inside « » “ ” " " ’’ ‘‘, numbered title lines, doxology lines) get real Arabic letters and ONE « » (marker ⁠ forces the Arabic font)
 * lines that are not headings lose their § (poetry = , Arabic doxology line = )
 * «االلہ» typing slip -> اللہ, stray tatweel removed
 * section borders: «جلد دوم» divider (row 368) opens the section «حرف ص»
Usage: fix.py [--dry]"""
import re,sys,json,os,glob,hashlib,datetime,collections
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
sys.path.insert(0,'tools/qenc')
from arlib import *
DRY='--dry' in sys.argv
st=collections.Counter()
QRE=re.compile(r'(«[^»\n]{1,900}»|“[^”\n]{1,900}”|"[^"\n]{1,900}"|’’[^’‘\n]{1,900}‘‘)')
DOX=re.compile(r'^(و?صلی اللہ|الحمد للہ|بسم اللہ|وصلى|المدينة النبوية|الأحد)')
POETRY={(4,5),(4,6),(4,8),(4,9),(4,20),(6,4),(6,9),(6,14),(6,18),(6,28)}
def wrap(m):
    s=m.group(0)
    if arabic_phrase(s):
        inner=re.sub(r'^(«|“|"|’’)\s*|\s*(»|”|"|‘‘)$','',s)
        inner=re.sub(r'\s+',' ',inner.replace('\xa0',' ')).strip()
        st['quote']+=1
        return '«⁠'+to_ar(inner)+'»'
    if s[0]=='«' and re.search(r'[أإٱة]|[ً-ْ]',s) and not is_u_phrase(s):
        st['guil']+=1;return '«⁠'+to_ar(s[1:-1].strip())+'»'
    return s
def is_u_phrase(s):return any(is_u(w) for w in s.split())

def zone_unquoted(seg):
    """vocalized Arabic runs that stand in the Urdu text without brackets: real Arabic letters + one « » (single words: letters only, the site wraps them)"""
    ws=seg.split(' ');k=[cls(w) for w in ws];n=len(ws);out=[];i=0
    def okp(w):return not re.search(r'[0-9٠-٩۰-۹A-Za-z\[\]()]',w)
    while i<n:
        if k[i]!='S':out.append(ws[i]);i+=1;continue
        last=i;cnt=1;t=i+1
        while t<n:
            if k[t]=='S':last=t;cnt+=1;t+=1
            elif k[t]=='C':t+=1
            elif k[t]=='P' and okp(ws[t]):t+=1
            elif k[t]=='A' and any(k[u]=='S' for u in range(t+1,min(n,t+3))):t+=1
            else:break
        run=ws[i:last+1]
        if cnt>=2:
            st['zone']+=1
            m1=re.match(r'^([^ء-ٰٱ-ۓً-ْ]*)(.*)$',run[0]);run[0]=m1.group(2);pre=m1.group(1)
            tail=''
            if '۔' in run[-1]:j=run[-1].index('۔');tail=run[-1][j:];run[-1]=run[-1][:j]
            m2=re.match(r'^(.*?[ء-ٰٱ-ۓً-ْ])([^ء-ٰٱ-ۓً-ْ]*)$',run[-1]);run[-1]=m2.group(1);post=m2.group(2)
            out.append(pre+'«\u2060'+to_ar(' '.join(run))+'»'+post+(' '+tail if tail else ''))
        else:out.append(' '.join(run))
        i=last+1
    return ' '.join(out)
def fix_unq(body):
    parts=re.split(r'(﴿[^﴾]*﴾|«[^»]*»)',body)
    return ''.join(p if (p.startswith('﴿') or p.startswith('«')) else zone_unquoted(p) for p in parts)
def fix_line(l,rid,i):
    head=l.startswith('§');body=l[1:] if head else l
    body=re.sub(r'(?<![هھ])ـ+','',body.replace('االلہ','اللہ').replace('\u2060',''))
    body=re.sub(r'([وو])اللہ(?=تعالی)',r'\1 اللہ',body)
    body=re.sub(r'اللہ(?=تعال[یٰی])','اللہ ',body)
    body=body.lstrip('\ue020\ue021')
    front=3<=rid<=10
    if front and i>0:
        if (rid,i) in POETRY:return ''+body
        if DOX.match(body.strip()) or (arabic_phrase(body) and len(body.split())>=4 and not re.search('[۰-۹0-9]',body)):
            st['dox']+=1;return ''+to_ar(body.strip().rstrip('.')+('.' if body.strip().endswith('.') else ''))
        if head:
            keep=(len(body)<=45 and re.search(r':-?$',body) and len(body)>=5) or re.match(r'^\(\S+\)\s',body) or body.startswith(('جلدیں','ایک اہم','طبع'))
            if not keep:head=False;st['unhead']+=1
    # numbered Arabic title lines: (۱) أبو هریرة في ضوء مرویاته
    m=re.match(r'^(\(?[۰-۹0-9]+\)?\s*[-\.]?\s*)(.+)$',body)
    if m and not re.search(r'[«﴿]',m.group(2)) and arabic_phrase(m.group(2)) and len(m.group(2).split())<=14:
        body=m.group(1)+'«⁠'+to_ar(m.group(2).strip())+'»';st['title']+=1
    else:
        parts=re.split(r'(﴿[^﴾]*﴾)',body)
        body=''.join(p if p.startswith('﴿') else QRE.sub(wrap,p) for p in parts)
        body=fix_unq(body)
    return ('§' if head else '')+body
def fix_row(r):
    L=r[1].split('\n');rid=r[0]
    if rid<=2:return
    r[1]='\n'.join(fix_line(l,rid,i) for i,l in enumerate(L))
def main():
    idx=open('coll/index.js',encoding='utf8').read();off=json.load(open('offline.json',encoding='utf8'))
    J=json.loads(idx[idx.index('COLLS(')+6:idx.rindex(')')]);e=[x for x in J if x['key']=='qenc'][0]
    ex=[]
    for a,b,fn in e['files']['ur']:
        f='coll/'+fn;t=open(f,encoding='utf8').read();p=t.index(',[[')+1;q=t.rindex(']]')+2
        rows=json.loads(t[p:q])
        for r in rows:
            o=r[1];fix_row(r)
            if r[1]!=o:st['rows']+=1;ex.append((o,r[1]))
        if DRY:continue
        t2=t[:p]+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+t[q:]
        h=hashlib.md5(t2.encode()).hexdigest();nf=re.sub(r'_[0-9a-f]{6}\.js$','_'+h[:6]+'.js',fn)
        if nf!=fn:
            open('coll/'+nf,'w',encoding='utf8').write(t2);os.remove(f);idx=idx.replace(fn,nf)
            for g in off['groups']:
                for x in g['f']:
                    if x[0]=='coll/'+fn:g['b']+=len(t2.encode())-x[3];x[0]=x[2]='coll/'+nf;x[1]=h[:10];x[3]=len(t2.encode())
    if not DRY:
        # volume divider belongs to the start of volume 2
        idx=idx.replace('["ش"','["ش"')
        open('coll/index.js','w',encoding='utf8').write(idx)
        off['v']=datetime.datetime.now(datetime.UTC).strftime('%Y%m%d%H%M');open('offline.json','w',encoding='utf8').write(json.dumps(off,ensure_ascii=False,separators=(',',':')))
    print(dict(st))
    json.dump(ex,open('/tmp/q/changes.json','w'),ensure_ascii=False)
main()
