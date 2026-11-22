#!/usr/bin/env python3
"""Tafsir Ibn Kathir (Urdu, quran/tafsir/ur_ibnkathir_N.js): the printed symbols (ؓ ؒ ؑ) become the written words, «حضرت» before a Companion becomes «سيدنا / سيدہ»,
and the Arabic-spelled durood (صلى الله عليه وسلم) becomes the Urdu spelling (صلی اللہ علیہ وسلم).  Usage: ibnkathir_honorifics.py [--dry]"""
import re,json,sys,os,glob,collections
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
DRY='--dry' in sys.argv
STOP=set('ہے ہیں تھا تھے تھی ہوں کہ نے اور سے کی کا کے میں پر تو ہی بھی جب وہ یہ کو کر کہتے فرماتے فرمایا فرماتی ہو گے گا گی کیا ہوا ہوئے ہوئی لیکن مگر پھر کہا کہی روایت مروی ہے۔ بروایت حدیث ہم تم آپ ان اس ایک دو جس جو جن اگر یا تھیں سے۔ بقول بیان نزدیک وقت عرض'.split())
FEM=set('عائشہ خدیجہ فاطمہ حفصہ زینب میمونہ جویریہ صفیہ سودہ رملہ اسماء صدیقہ ام المومنین مومنین امرأۃ صاحبہ بنت سمیہ ربیع'.split())
PLU=set('صحابہ اصحاب صحابۂ کرام مہاجرین انصار راشدین مبشرہ شہداء صحابہؓ'.split())
DUAL_RE=re.compile(r'(?:ابن|عبداللہ بن|عبد اللہ بن)\s*(?:عباس|عمر|عمرو|زبیر|الزبیر|العاص)$|اسامہ بن زید$|حسن بن علی$|حسین بن علی$|بنت ابی بکر$|بنت ابو بکر$')
PROPH_F=set('مریم ہاجرہ سارہ آسیہ'.split());PROPH_P=set('انبیاء رسولوں پیغمبروں رسل ملائکہ فرشتوں'.split())
st=collections.Counter()
def toks(s):return re.findall(r'\S+|\s+',s)
def span_back(words,i):
    """words[i] is the marker; return (start index of the name span) going back over the name words."""
    j=i-1;n=0
    while j>=0 and n<6:
        w=words[j]
        if w.strip()=='' :j-=1;continue
        if w in STOP or re.search(r'[۔،؛:؟!()\[\]“”‘’]$',w):break
        if w=='حضرت':return j
        n+=1;j-=1
    return j+1
def fix_text(t,names):
    w=toks(t)
    out=list(w)
    i=0
    # words as a list of (token) with markers possibly glued to the previous word
    t=re.sub(r'(\S)(ؓ|ؒ|ؑ)',r'\1 \2',t)
    w=toks(t)
    idx=[k for k,x in enumerate(w) if x[:1] in('ؓ','ؒ','ؑ') and (len(x)==1 or x[1] in '۔،؛:)')]
    for k in idx:
        m=w[k][0];suf=w[k][1:]
        j=span_back(w,k)
        name=[x for x in w[j:k] if x.strip()]
        hz=bool(name) and name[0]=='حضرت'
        core=[x for x in name if x!='حضرت']
        cj=' '.join(core)
        if m=='ؓ':
            prevw=[x for x in w[:k] if x.strip()][-1:]
            if any(x in PLU for x in core[-2:]) or (not core and prevw and prevw[0] in ('ہوئے','تھے','ہیں','لائے','گئے')) :ph='رضی اللہ عنہم'
            elif any(x in FEM for x in core):ph='رضی اللہ عنہا'
            elif DUAL_RE.search(cj):ph='رضی اللہ عنہما'
            elif hz and 'اور' in core:ph='رضی اللہ عنہما'
            else:ph='رضی اللہ عنہ'
            w[k]=ph+suf
            if hz:
                w[j]='سیدہ' if ph.endswith('عنہا') else 'سیدنا'
                if ph.endswith('عنہما') and 'اور' in core:
                    for q in range(j,k):
                        if w[q]=='حضرت':w[q]='سیدنا'
                if core: names.add(core[0] if core[0] not in('ابن','ابو','ام','عبداللہ','عبد') else ' '.join(core[:2]))
            else:
                if core: names.add(core[0] if core[0] not in('ابن','ابو','ام','عبداللہ','عبد') else ' '.join(core[:2]))
            st['ؓ']+=1
        elif m=='ؒ':
            ph='رحمہم اللہ' if (core and core[-1] in('علماء','ائمہ','محدثین','سلف','فقہاء','مفسرین')) else 'رحمہ اللہ'
            w[k]=ph+suf
            if hz:
                w[j]='امام' if not(core and core[0]=='امام') else ''
                if w[j]=='' and j+1<len(w) and w[j+1].strip()=='':w[j+1]=''
            st['ؒ']+=1
        else:
            if core and (core[-1] in PROPH_F or any(x in PROPH_F for x in core)):ph='علیہا السلام'
            elif core and core[-1] in PROPH_P:ph='علیہم السلام'
            elif hz and 'اور' in core or (len(core)>=3 and core[-2] in('و','اور')):ph='علیہما السلام'
            else:ph='علیہ السلام'
            w[k]=ph+suf;st['ؑ']+=1
    return ''.join(w)
def run(files,names):
    for f in files:
        s=open(f,encoding='utf8').read();a=s.index('{');b=s.rindex('}')
        head,body,tail=s[:a],s[a:b+1],s[b+1:]
        d=json.loads(body)
        for sn,rows in d.items():
            for r in rows:
                t=r[2]
                t=t.replace('صلى الله عليه وسلم','صلی اللہ علیہ وسلم').replace('صلي الله عليه وسلم','صلی اللہ علیہ وسلم')
                t=fix_text(t,names);r[2]=t
        yield f,head,d,tail
files=sorted(glob.glob('quran/tafsir/ur_ibnkathir_*.js'))
names=set();res=list(run(files,names))
# second pass: plain «حضرت <Companion name>» (no symbol in the source) -> «سيدنا»
cnt=collections.Counter();left=collections.Counter()
for f,head,d,tail in res:
    for sn,rows in d.items():
        for r in rows:
            def sub(m):
                ws=m.group(1).split(' ');first=ws[0];key2=' '.join(ws[:2])
                if len(ws)>2 and ws[1] in('بن','ابن') and ' '.join(ws[2:3]) in('عبدالعزیز','عبد'):left['umar2']+=1;return m.group(0)
                if key2 in names or (first in names and first not in('ابن','ابو','ام','عبداللہ','عبد')):
                    cnt['plain']+=1;return 'سیدنا '+m.group(1)
                left[key2 if first in('ابن','ابو','ام','عبداللہ','عبد') else first]+=1;return m.group(0)
            r[2]=re.sub(r'(?<![\u0600-\u06FF])حضرت (\S+(?: \S+){0,2})',sub,r[2])
            # the printed text already wrote the single form after a pair / a woman: make it match
            r[2]=re.sub(r'((?:ابن|عبداللہ بن|عبد اللہ بن) (?:عباس|عمر|عمرو|الزبیر|زبیر)) رضی اللہ عنہ(?!ما)',lambda m:m.group(1)+' رضی اللہ عنہما',r[2])
            r[2]=re.sub(r'((?:عائشہ|خدیجہ|فاطمہ|حفصہ|زینب|میمونہ|جویریہ|صفیہ|ام سلمہ|ام حبیبہ)(?: (?:صدیقہ|بنت \S+|رضی))?) رضی اللہ عنہ(?![ماا])',lambda m:m.group(1)+' رضی اللہ عنہا',r[2])
print('symbols converted',dict(st),'plain حضرت->سیدنا',cnt['plain'])
print('حضرت left (top):',left.most_common(25))
if not DRY:
    for f,head,d,tail in res:
        open(f,'w',encoding='utf8').write(head+json.dumps(d,ensure_ascii=False,separators=(',',':'))+tail)
    print('written',len(res),'files')
