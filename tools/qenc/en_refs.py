#!/usr/bin/env python3
"""Quran Encyclopedia (English) – owner 27-11-2026: Quran references «(Quran, Surah-2, Al-Baqara, Verses-1-4)» -> «[Al-Baqara: 1-4]»
(same order as the Urdu book: name, then verse numbers, at the end of the verse). Several references in one bracket
(«…Verse-231; Surah-65, At-Talaq, Verse-1») become «[Al-Baqara: 231] [At-Talaq: 1]». Rewrites coll/qencen_en_* (run tools/rehash.py after)."""
import re,glob
BR=re.compile(r'\(\s*Quran\s*,?\s*([^()]*?)\)')
PC=re.compile(r'(?:Surah\s*-?\s*(\d+)\s*,?\s*)?([A-Za-z][^,()0-9]*?[A-Za-z’\'])?\s*,?\s*(?:Verses?)?\s*-?\s*(\d[\d\-–, ]*)\s*$')
def nv(v): return re.sub(r'\s*,\s*',', ',v.replace('–','-').strip(' -,'))
def one(piece):
    m=PC.match(piece.strip())
    if not m: return None
    num,name,v=m.groups()
    if name and re.fullmatch(r'Verses?',name.strip(),re.I): name=None
    if not name and not num: return None
    return '[%s: %s]'%(name.strip() if name else 'Surah '+num,nv(v))
def sub(m):
    body=m.group(1)
    pieces=[p for p in re.split(r'\s*(?:;|\band\b)\s*',body) if p.strip()]
    outs=[one(p) for p in pieces]
    if not outs or any(o is None for o in outs): return m.group(0)
    return ' '.join(outs)
tot=left=0
for f in sorted(glob.glob('coll/qencen_en_*.js')):
    t=open(f,encoding='utf-8').read(); n=BR.sub(sub,t)
    tot+=len(BR.findall(t))-len(BR.findall(n)); left+=len(BR.findall(n))
    if n!=t: open(f,'w',encoding='utf-8').write(n)
print('converted',tot,'left',left)
