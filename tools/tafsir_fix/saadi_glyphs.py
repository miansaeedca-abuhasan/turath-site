#!/usr/bin/env python3
"""Tafsir Saadi (Urdu): InPage glyph letters glued to names become the real honorific wording (owner rule: stray Latin glyph letters are honorifics, never left, never deleted silently).
u,p = علیہ السلام (prophets) · t = رضی اللہ عنہ · y = عنہم · w = عنہما · r = عنہا · g = عنہن · a = رحمہ اللہ · S = رحمہم اللہ · E = صلی اللہ علیہ وسلم
i = علیہما السلام after «X اور Y», علیہا السلام after مریم/حواء; other «i» and «m» (paragraph mark?) are left and reported."""
import re,json,glob,sys,os,collections
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
DRY='--dry' in sys.argv
M={'u':'علیہ السلام','p':'علیہ السلام','t':'رضی اللہ عنہ','y':'رضی اللہ عنہم','w':'رضی اللہ عنہما','r':'رضی اللہ عنہا','g':'رضی اللہ عنہن','a':'رحمہ اللہ','S':'رحمہم اللہ','E':'صلی اللہ علیہ وسلم'}
st=collections.Counter();left=collections.Counter()
RX=re.compile(r'(?<=[؀-ۿ۔ ])([A-Za-z])(?![A-Za-z])')
def fix(t):
    out=[];pos=0
    for m in RX.finditer(t):
        a,b=m.start(),m.end();L=m.group(1)
        if a>0 and t[a-1]==' ' and L not in 'iuptywrgaSE':continue
        pre=t[:a]
        if L=='i':
            prev=re.findall(r'[؀-ۿ]+',pre[-60:])
            if prev and prev[-1] in('مریم','حواء'):w='علیہا السلام'
            elif len(prev)>=3 and 'اور' in prev[-4:-1]:w='علیہما السلام'
            else:left['i']+=1;continue
        elif L in M:w=M[L]
        else:left[L]+=1;continue
        pre_ch=t[a-1] if a>0 else '';nxt=t[b] if b<len(t) else ''
        l='' if pre_ch==' ' else ' ';r='' if (nxt in ' \n۔،.)]»’:؟!' or nxt=='') else ' '
        out.append(t[pos:a]+l+w+r);pos=b;st[L]+=1
    out.append(t[pos:]);return ''.join(out)
for f in sorted(glob.glob('quran/tafsir/ur_saadi_*.js')):
    s=open(f,encoding='utf8').read();a=s.index('{');b=s.rindex('}');d=json.loads(s[a:b+1]);ch=0
    for rows in d.values():
        for r in rows:
            n=fix(r[2])
            if n!=r[2]:r[2]=n;ch+=1
    if ch and not DRY:open(f,'w',encoding='utf8').write(s[:a]+json.dumps(d,ensure_ascii=False,separators=(',',':'))+s[b+1:])
print(dict(st),'left',dict(left))
