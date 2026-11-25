"""Urdu translation for the Jami hadith shown in the topics folder.
Jami has no Urdu text of its own; a hadith gets the Urdu of a translated sub-book that holds the same hadith (coll/jx_<book>: book row -> Jami numbers).
Priority = the books that start at the Companion (like Jami's text) first; Bukhari / Muslim (long chains) last. Commentary («§وضاحت», «امام … کہتے ہیں») is dropped.
Output: topics/ju/<k>_<h>.js (300 Jami numbers per file) + topics/ju/idx_<h>.js (manifest; its name is patched into index.html)."""
import json,re,glob,os,hashlib
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'))
PRI=['abudawud','tirmidhi','nasai','ibnmajah','malik','darimi','shamail','bukhari','muslim']
def rows(f):
    s=open(f,encoding='utf8').read();return json.loads(s[s.index('[['):s.rindex(']')+1])
reg=json.loads((lambda s:s[s.index('(')+1:s.rindex(')')])(open('coll/index.js',encoding='utf8').read()))
reg=reg if isinstance(reg,list) else reg.get('list',reg)
RG={x['key']:x for x in reg}
def clean(t):
    t=t.split('\n§')[0]
    ps=[p.strip() for p in t.split('\n') if p.strip() and not p.startswith('§')]
    ps=[p for p in ps if not re.match(r'^امام \S+ (?:کہتے|فرماتے) ہیں',p)]
    t=' '.join(ps).strip()
    t=re.sub(r'\s*[۰-۹0-9]+\s*؎\s*[:：]?','',t)
    return t
TR={}
for k in PRI:
    x=RG.get(k)
    if not x or 'ur' not in x.get('files',{}): continue
    ur={}
    for f in x['files']['ur']:
        for r in rows('coll/'+f[2]): ur[r[0]]=r[1]
    jxf=glob.glob('coll/jx_%s_*.js'%k)
    if not jxf: continue
    for r in rows(jxf[0]):
        no,js=r[0],r[1]
        t=ur.get(no)
        if not t: continue
        t=clean(t)
        if len(t)<25 or t.startswith('۔') or 'کے مانند' in t[:120] and len(t)<220: continue
        for j in js.split(','):
            j=int(j)
            if j not in TR: TR[j]=[k,no,t]
# only the hadith that are in some topic
used=set()
for f in glob.glob('topics/*.js'):
    if '/index_' in f: continue
    s=open(f,encoding='utf8').read();d=json.loads(s[s.index(',')+1:s.rindex(')')])
    for kk in d['h']:
        for b in kk[2]: used.update(b[1])
for f in glob.glob('topics/ju/*'): os.remove(f)
os.makedirs('topics/ju',exist_ok=True)
CH={}
for j in used:
    if j in TR: CH.setdefault(j//300,{})[j]=TR[j]
man={}
for c,dct in sorted(CH.items()):
    body='TOPICJ(%d,%s);'%(c,json.dumps(dct,ensure_ascii=False,separators=(',',':')))
    fn='%d_%s.js'%(c,hashlib.md5(body.encode()).hexdigest()[:8]);open('topics/ju/'+fn,'w',encoding='utf8').write(body);man[c]=fn
mb='TOPICJX(%s);'%json.dumps(man,separators=(',',':'))
mn='idx_%s.js'%hashlib.md5(mb.encode()).hexdigest()[:8];open('topics/ju/'+mn,'w').write(mb)
h=open('index.html',encoding='utf8').read();h=re.sub(r"topics/ju/idx_[0-9a-f]{8}\.js","topics/ju/"+mn,h);open('index.html','w',encoding='utf8').write(h)
print('used',len(used),'with Urdu',sum(len(v) for v in CH.values()),'files',len(man),'bytes',sum(os.path.getsize('topics/ju/'+f) for f in os.listdir('topics/ju')))
