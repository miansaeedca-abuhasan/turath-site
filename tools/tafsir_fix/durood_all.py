#!/usr/bin/env python3
# Durood in every Urdu tafsir (quran/tafsir/ur_*): one written form «صلی اللہ علیہ وسلم».
# Arabic-spelled, abbreviations (صلعم), misspellings, «وآلہ» -> standard. Quranic pause mark ؐ is NOT touched.
import re,json,glob,sys,collections
DRY='--dry' in sys.argv
D='صلی اللہ علیہ وسلم'
U=r'؀-ۿ'
pats=[
 r'صل[ىي]\s*[اﷲ]لل?[هہ]\s*علي[هہ]\s*و\s?سلم',          # Arabic spelling (glued or spaced)
 r'صل[ىی]\s*[اﷲ]لل?[هہّٰ]*\s*علي[هہ]\s*و\s?سلم',
 r'صل[ىیي]\s+الله\s+عليه\s+وسلم',
 r'صلی\s+اللّٰہ\s+علیہ\s+وسلم',
 r'(?<![%s])صل\s?عم(?![%s])'%(U,U),
 r'صلی\s+اللہ\s+(?:تعالیٰ\s+)?علیہ\s+و?آ?\s?لہ\s+و\s?سلم',
 r'صلی\s+اللہ\s+علیہ\s*و\s+سلم',
 r'صلی\s+اللہ\s+علیہو\s*سلم',
 r'صل\s+اللہ\s+علیہ\s+وسلم',
 r'صلی\s+اللہ\s+تعالیٰ\s+علیہ\s+وسلم',
 r'صلی\s+اللہ\s+علیہ\s+اسلم',
 r'صلی\s+اللہ\s+علیہ\s+و\s?آلہ\s+وسلم',
 r'صلی\s+اللہ\s+علیہ\s+وآلہ\s+وسلم',
 r'صلی\s+اللہ\s+علیہ\s+والہ\s+وسلم',
]
rx=re.compile('|'.join('(?:%s)'%p for p in pats))
st=collections.Counter()
def fix2(t):
    res=[];pos=0
    for m in re.finditer(r'[ \t]*(%s)[ \t]*'%rx.pattern,t):
        a,b=m.start(),m.end();res.append(t[pos:a])
        pre=t[a-1] if a>0 else '';post=t[b] if b<len(t) else ''
        l='' if (pre in '([«“‘"\n' or pre=='' or not res or ''.join(res)=='' ) else ' '
        r='' if (post in ')]»”’،۔.؟!:؛,\n"' or post=='') else ' '
        res.append(l+D+r);pos=b;st['n']+=1
    res.append(t[pos:]);return ''.join(res)
def extra(t):
    # «صلی اللہ علیہ <word without وسلم>»: the printed text dropped «وسلم»
    t,n=re.subn(r'صلی اللہ علیہم(?= کی نبوت)',D,t);st['m']+=n
    t,n=re.subn(r'صلی اللہ علیہ(?= (?:کی زندگی|ان کے))',D,t);st['k']+=n
    # truncated forms: «صلی اللہ علیہ» followed directly by a particle / broken «وسلم»
    t,n=re.subn(r'صلی اللہ علیہ(?: اللہ علیہ| ؛| ووسلم| وسل| سلم| صلم)(?: وسلم)?(?![\u0600-\u06FF])',D,t);st['t']+=n
    t,n=re.subn(r'(?<![\u0600-\u06FF])صلی اللہ علیہ(?= (?:کی|کا|کے|نے|سے|پر|کو|اپنے|جن|ان|کا)(?![\u0600-\u06FF]))',D,t);st['t2']+=n
    t=re.sub(r'صلی اللہ علیہ(?= والذی)',D,t)
    t=t.replace('ابوبکر صل اللہ علیہ یا','ابوبکر صلی اللہ علیہ یا')
    return t
for f in sorted(glob.glob('quran/tafsir/ur_*.js')):
    s=open(f,encoding='utf8').read();a=s.index('{');b=s.rindex('}')
    d=json.loads(s[a:b+1]);ch=0
    for sn,rows in d.items():
        for r in rows:
            t=extra(fix2(r[2]))
            if t!=r[2]:ch+=1;r[2]=t
    if ch and not DRY:open(f,'w',encoding='utf8').write(s[:a]+json.dumps(d,ensure_ascii=False,separators=(',',':'))+s[b+1:])
    if ch:print(f,ch)
print(dict(st))
