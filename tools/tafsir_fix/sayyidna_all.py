#!/usr/bin/env python3
"""Urdu tafsirs (Ibn Kathir symbols are done first by ibnkathir_honorifics.py): «حضرت <Companion>» -> «سیدنا / سیدہ <Companion>» (owner 22-11-2026 «جو درست ہو کریں»).
A name counts as a Companion only if the SAME tafsirs write it with «رضی اللہ عنہ/ا/ما/م» and never with «علیہ السلام»; Tabi'in / imams (رحمہ اللہ nearby) and prophets are never changed.
Usage: sayyidna_all.py [--dry]"""
import re,json,sys,os,glob,collections
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
DRY='--dry' in sys.argv
FEM=set('عائشہ خدیجہ فاطمہ حفصہ زینب میمونہ جویریہ صفیہ سودہ رملہ اسماء سمیہ ام'.split())
files=sorted(glob.glob('quran/tafsir/ur_*.js'))
data=[]
for f in files:
    s=open(f,encoding='utf8').read();a=s.index('{');b=s.rindex('}');data.append((f,s[:a],json.loads(s[a:b+1]),s[b+1:]))
W=r'[؀-ۿ]+'
rad=collections.Counter();pro=collections.Counter()
for f,h,d,t in data:
    for rows in d.values():
        for r in rows:
            for m in re.finditer(r'(?<![؀-ۿ])(?:حضرت |سیدنا |سیدہ )?('+W+r')(?: (?:بن|بنت) ('+W+r'))? رضی اللہ عن',r[2]):rad[m.group(1)]+=1
            for m in re.finditer(r'(?<![؀-ۿ])('+W+r') علیہ السلام',r[2]):pro[m.group(1)]+=1
names={n for n,c in rad.items() if c>=3 and pro[n]==0 and n not in('اللہ','آپ','وہ','یہ','کہ','ان','اس','سے','جو','نے','کو','کی','کے','کا','ہی','بھی','تو','اور','میں','پر','ہے','ہیں','کر','ہو','ہم','تم','انہوں','ام','ابو','ابن','عبد','عبداللہ','مریم','آسیہ','ہاجرہ','سارہ','بن','بنت','بر')}
cnt=collections.Counter();left=collections.Counter()
SKIPAFTER=re.compile(r'^\s*(?:\S+\s+){0,3}?رحمہ اللہ')
def fix(t):
    t=t.replace('حضرت حضرت ','حضرت ')   # printed doubling
    t=re.sub(r'سیدنا (?=(?:عائشہ|میمونہ|حفصہ|خدیجہ|فاطمہ|زینب|سودہ|صفیہ|جویریہ|ام سلمہ|ام حبیبہ|ام المومنین|اسماء)(?![\u0600-\u06FF]))','سیدہ ',t)   # wrong gender
    def sub(m):
        first=m.group(1);rest=t[m.end():m.end()+60]
        nx=re.match(r'\s*(\S+)(?:\s+(\S+))?(?:\s+(\S+))?',rest);w1,w2,w3=(nx.groups() if nx else (None,)*3)
        w1=w1 or '';w2=w2 or '';w3=w3 or ''
        if first=='عبداللہ' and w1=='بن' and re.sub(r'[\u064B-\u0652]','',w2) in('عباس','عمر','عمرو','مسعود','زبیر','الزبیر','سلام','رواحہ','جعفر','ارقم','انیس','حذافہ'):cnt['n']+=1;return 'سیدنا '+first
        if first=='ابن' and w1 in('عباس','عمر','مسعود','زبیر','الزبیر','عمرو','ام'):cnt['n']+=1;return 'سیدنا '+first
        if first=='ابو' and w1 in('ذر','بکر','ہریرہ','سعید','موسیٰ','الدرداء','عبیدہ','طلحہ','ایوب','سفیان','جحیفہ','قتادہ','امامہ','ہریرۃ','درداء','بکرہ','لبابہ'):cnt['n']+=1;return 'سیدنا '+first
        if first=='ام' and w1 in('سلمہ','حبیبہ','المومنین','ایمن','سلیم','عطیہ','ہانی','حرام','سلیمہ'):cnt['n']+=1;return 'سیدہ '+first
        if first not in names or first in('ابو','ابی','ام','عبداللہ','عبد','ابن'):left[first]+=1;return m.group(0)
        if first in('سعید','قتادہ','عکرمہ','عروہ','ربیع','سفیان','عطیہ','مجاہد','عاصم','عدی','حسن','جعفر','عامر','زید','سالم','ثابت','حمزہ','خالد','کعب','احمد','بشر','بکر','جریر','حارث') and not re.match(r'\s*(?:\S+\s+){0,3}?رضی اللہ عن',rest):left['ambiguous-no-radi:'+first]+=1;return m.group(0)
        if w1 in('بصری','بنانی','ہجویری','صادق'):left['tabii:'+first]+=1;return m.group(0)
        if SKIPAFTER.match(rest) or re.match(r'\s*(?:\S+\s+){0,3}?علیہ(?:ما|م)? السلام',rest):left['tabii/prophet:'+first]+=1;return m.group(0)
        if re.match(r'\s*(?:بن|بنت)\s+(?:عبدالعزیز|عبد العزیز)',rest):left['umar2']+=1;return m.group(0)
        cnt['n']+=1;cnt['f:'+first]+=1;return ('سیدہ ' if first in FEM else 'سیدنا ')+first
    return re.sub(r'(?<![ء-يٱ-ۓ])حضرت ('+W+')',sub,t)
for f,h,d,t in data:
    for rows in d.values():
        for r in rows:r[2]=fix(r[2])
if '--list' in sys.argv:
    c=collections.Counter()
    for f,h,d,t in data:
        for rows in d.values():
            for r in rows:
                for m in re.finditer(r'(?<![\u0600-\u06FF])حضرت ('+W+r')( \S+)?',r[2]):
                    if m.group(1) in names:c[m.group(1)+(m.group(2) or '')]+=1
    print(c.most_common(90));print(sorted(names))
print('companion names',len(names),'changed',cnt['n']);print(sorted(((k,v) for k,v in cnt.items() if k.startswith('f:')),key=lambda x:-x[1])[:60]);print('left (top)',left.most_common(30))
if not DRY:
    for f,h,d,t in data:open(f,'w',encoding='utf8').write(h+json.dumps(d,ensure_ascii=False,separators=(',',':'))+t)
