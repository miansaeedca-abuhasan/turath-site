#!/usr/bin/env python3
"""Sahih al-Jami' as-Saghir wa Ziyadatuh (Albani) — Arabic library book `sh10757` from the owner's EPUB (turath id 10757, 25-11-2026).
rows: hadith = «N - [k -] text»+takhrij line (own row, number kept for numbering_fix), h2 = heading row, volume title row, footnote (hamesh) = own row.
usage: python3 tools/addbook/sahihjami/build_ar.py <epub-extract-dir>   then tools/numbering_fix.py sh10757, tools/pages/build.py sh10757, tools/order_tail.py?, tools/rehash.py"""
import re,glob,html,json,os,sys,hashlib
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','..'))
D=sys.argv[1];KEY='sh10757'
fs=sorted(glob.glob(D+'/OEBPS/text/*.xhtml'))
P=[]
for f in fs:
    t=open(f,encoding='utf-8').read();b=t[t.find('<body'):]
    for a,at,c in re.findall(r'<(h2|p)([^>]*)>(.*?)</\1>',b,re.S):
        P.append((a,at,re.sub(r'\s+',' ',re.sub(r'<[^>]+>','',html.unescape(c))).strip()))
NUM=re.compile(r'^[٠-٩]+\s*(?:/\s*[٠-٩]+\s*)?-')   # «N -» or the bracketed extra hadith «N / 1 -[…]»
TK=re.compile(r'^\(?(صحيح|حسن|ضعيف|موضوع)')
rows=[];secs=[];state=None;pend=[]   # state: 'h' open hadith text, 't' takhrij line added; pend = footnotes of the open hadith (placed after it)
def fl():
    global pend
    rows.extend(pend);pend=[]
FN=re.compile(r'^([٠-٩]+)\s*(?:-\s*)?(?=\S)')
for a,at,t in P:
    if not t: continue
    if 'text-center' in at: continue                      # page header «الجزء: N - الصفحة: M»
    if t=='.' and rows and not pend: rows[-1]+='.';continue   # the full stop of a heading / entry printed as its own paragraph
    if a=='h2':
        fl();rows.append(t);secs.append([len(secs)+1,t,len(rows),len(rows)]);state='x';continue
    if 'hamesh' in at or t.startswith('*'):
        pend.append(FN.sub(r'(\1) ',t) if 'hamesh' in at else t);continue   # footnote: «(١) …» so it is never taken as a numbered hadith
    if NUM.match(t):
        fl();rows.append(t);state='h';continue
    if re.match(r'^المجلد',t) and len(t)<20:
        fl();rows.append(t);state='x';continue
    if TK.match(t) and state=='h':
        rows[-1]+='\n'+t;state='t';continue
    if state in('h','t'): rows[-1]+=' '+t;continue   # continuation across a page break / second paragraph of one hadith
    fl();rows.append(t);state='x'
fl()
# sections: start = heading row, end = row before next heading
for i,s in enumerate(secs): s.append('');s[3]=(secs[i+1][2]-1) if i+1<len(secs) else len(rows)
# heading rows: a h2 that is the first row of a volume: keep as is
data=[[i+1,r] for i,r in enumerate(rows)]
json.dump(data,open('/tmp/sj/rows_ar.json','w'),ensure_ascii=False)
# letters check: every letter of the epub body (without page headers) is in the rows
N=lambda s:re.sub(r'[^ء-ي٠-٩0-9]','',s)
src=N(''.join(t for a,at,t in P if 'text-center' not in at));dst=N(''.join(rows))
print('rows',len(rows),'secs',len(secs),'letters src',len(src),'dst',len(dst),'equal',src==dst)
files=[];cur=[];size=0
for f in glob.glob('coll/%s_ar_*'%KEY): os.remove(f)
def flush():
    global cur,size
    if not cur:return
    body='COLLDATA("%s","ar",%s)'%(KEY,json.dumps(cur,ensure_ascii=False,separators=(',',':')))
    h=hashlib.md5(body.encode()).hexdigest()
    name='%s_ar_%d_%s.js'%(KEY,len(files)+1,h[:6]);open('coll/'+name,'w',encoding='utf-8').write(body)
    files.append([cur[0][0],cur[-1][0],name,len(body.encode()),h[:10]]);cur=[];size=0
for r in data:
    cur.append(r);size+=len(r[1])
    if size>90000:flush()
flush()
entry={"key":KEY,"ar":"صحيح الجامع الصغير وزيادته","ur":"صحیح الجامع الصغیر و زیادتہ","en":"Sahih al-Jami as-Saghir wa Ziyadatuh (Al-Albani)",
"sections":[[s[0],s[1],s[2],s[3]] for s in secs],"langs":["ar"],"files":{"ar":[[a,b,n] for a,b,n,_,_ in files]},"count":len(rows),"an":{},"grp":"ar",
"author":["albani","الألباني","علامہ البانی","Al-Albani",1420]}
s=open('coll/index.js',encoding='utf-8').read();A=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
A=[e for e in A if e['key']!=KEY]
i=[e['key'] for e in A].index('sh9442');A.insert(i+1,entry)
open('coll/index.js','w',encoding='utf-8').write('COLLS('+json.dumps(A,ensure_ascii=False,separators=(',',':'))+')')
o=json.load(open('offline.json',encoding='utf-8'));o['groups']=[g for g in o['groups'] if g['id']!='c_'+KEY]
g={"id":"c_"+KEY,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":[['coll/'+n,h,'coll/'+n,sz] for a,b,n,sz,h in files],"b":sum(f[3] for f in files)}
k=[x['id'] for x in o['groups']].index('c_sh9442');o['groups'].insert(k+1,g)
json.dump(o,open('offline.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(files)
