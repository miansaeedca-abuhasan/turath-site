"""Third narrator tab «مختصر تعارف از: تراث خیرالقرون»: the opening sentences of the sahabi's entry in Usd al-Ghaba (Urdu) and
Al-Isaba (Urdu) already on the site, copied as they stand (footnote marks removed, cut before the chain of narrators), with the source line.
turath_map.json = section number -> {u: Usd al-Ghaba row id, i: Isaba row id}; ids were checked by hand against the isnad of each section."""
import json,re,os
def _rows(key):
    s=open('coll/index.js',encoding='utf8').read();reg=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
    e=[x for x in reg if x['key']==key][0];out={}
    for a,b,f in e['files']['ur']:
        t=open('coll/'+f,encoding='utf8').read()
        for r in json.loads(t[t.index(',[[')+1:t.rindex(')')]):out[r[0]]=r[1]
    return out
STOP=re.compile(r'اذنا|اذن |اخبرنا|(انہوں نے.*){2,}|خبر دی|اجاز[ۃة]|باسنادہ|اپنی سند|کی سند سے|بسند|حدیث بیان کی|نے ہمیں')
BAD=re.compile(r'تذکرہ (آئے گا|ہوگا|ہونا|ہو چکا|گزر)|میں گزر چکے|سابقہ عنوان')
def intro(raw,k,maxc=650):
    lines=raw.split('\n');h=re.sub(r'\(\d+\)','',re.sub(r'^§\s*[۰-۹]+\s*۔\s*','',lines[0])).strip()
    num=re.match(r'^§\s*([۰-۹]+)',lines[0]).group(1)
    body=re.sub(r'\s+',' ',re.sub(r'\(\d+\)','',' '.join(l.strip() for l in lines[1:] if l.strip()))).strip()
    if k=='i' and re.match(r'^(بن|ابن|ثم|از)\b',body):body=h+' '+body
    out=[];n=0
    for s in [x.strip() for x in body.split('۔') if x.strip()]:
        if out and (STOP.search(s) or n+len(s)>maxc):break
        if not out and STOP.search(s):
            s=STOP.split(s)[0].strip(' ،:')
            if len(s)<25:break
        out.append(s);n+=len(s)+1
        if n>=330:break
    txt='۔ '.join(out)+('۔' if out else '')
    return num,txt
def ok(t):return len(t)>=45 and not BAD.search(t[:140])
def build():
    M=json.load(open('tools/humaydi2/turath_map.json'));U=_rows('asadghabaur');I=_rows('asabahur');res={}
    for sec,m in M.items():
        ps=[]
        for k,rows,name in (('u',U,'اسد الغابہ فی معرفۃ الصحابہ (اردو)'),('i',I,'الاصابہ فی تمییز الصحابہ (اردو)')):
            if m.get(k):
                num,t=intro(rows[m[k]],k)
                if ok(t):ps+=[t,'ماخذ: %s، ترجمہ نمبر %s'%(name,num)]
        if ps:res[int(sec)]=ps
    return res
