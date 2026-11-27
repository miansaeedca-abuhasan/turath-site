#!/usr/bin/env python3
"""English / Bengali chapter + group titles of `adabaalien` (owner 27-11-2026: no Urdu headings in the English UI).
Source = the site's own Al-Jami al-Kamil data (api toc?book=jami / jami_bn; the section's first hadith number decides the chapter, group title from the hadith record).
/tmp/q/adab_titles.json is written by a one-off playwright fetch (see tests/adab_titles_lang.js for what must hold). Usage: python3 tools/addbook/adabaali_titles.py <titles.json>"""
import json,sys,os,re
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
T=json.load(open(sys.argv[1]))
s=open('coll/index.js').read();A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
e=[x for x in A if x['key']=='adabaalien'][0]
assert len(T['sec'])==len(e['sections'])==467 and len(T['heads'])==len(e['heads'])
SEC={'en':[],'bn':[]};HD={'en':[],'bn':[]}
for t,sec in zip(T['sec'],e['sections']):
    te,tb=t['toc_en'],t['toc_bn']
    assert te and tb and te['nums'][0]<=t['n'] and t['n'] in te['nums']
    SEC['en'].append(te['t']);SEC['bn'].append(tb['t'])
for h in T['heads']:
    HD['en'].append(h['g_en']);HD['bn'].append(h['g_bn'])
AR=re.compile('[؀-ۿ]')
for L in ('en',):
    assert not any(AR.search(x or '') for x in SEC[L]+HD[L]),'Arabic letters in English titles'
assert all(SEC['en']+SEC['bn']+HD['en']+HD['bn'])
e['secL']=SEC;e['headsL']=HD
open('coll/index.js','w').write('COLLS('+json.dumps(A,ensure_ascii=False,separators=(',',':'))+')')
print('secL',len(SEC['en']),'headsL',len(HD['en']))
