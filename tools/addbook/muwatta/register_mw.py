import sys,json,re,hashlib,os;sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)));sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from reg import register
import build_mw as B
o,rows,secs,heads,REPT,fx=B.build_all()
intro=B.build_front(o)
# drop a first paragraph that only repeats the part title
for t,p in intro:
    if p and re.sub(r'\s+','',p[0])==re.sub(r'\s+','',t): p.pop(0)
NT={};S2=[]
for s in secs:
    s=list(s)
    if len(s)>5:
        NT[s[0]]=s[5]['nt']
    S2.append(s[:5])
AR=[[r['id'],r['ar']] for r in rows]
def urrow(r):
    kk={}
    if r['k']: kk.update(r['k'])
    if r['f']: kk['f']=r['f']
    return [r['id'],r['ur'],"",kk] if kk else [r['id'],r['ur']]
UR=[urrow(r) for r in rows]
NTF=[];cur={};size=0;lo=None
def flushnt():
    global cur,size,lo
    if not cur: return
    body='COLLNT("muwattaansar",%s)'%json.dumps({str(k):v for k,v in cur.items()},ensure_ascii=False,separators=(',',':'))
    h=hashlib.md5(body.encode()).hexdigest()[:6];nm='muwattaansar_nt_%d_%s.js'%(len(NTF)+1,h)
    NTF.append([min(cur),max(cur),nm,body]);cur={};size=0
for k in sorted(NT):
    cur[k]=NT[k];size+=len(json.dumps(NT[k],ensure_ascii=False).encode())
    if size>180000: flushnt()
flushnt()
entry={"key":"muwattaansar","ar":"موطأ الإمام مالك (الترجمة الأردية)","ur":"موطا امام مالک (اردو ترجمہ و تخریج)","en":"Muwatta Imam Malik (Urdu translation and takhrij)",
"langs":["ar","ur"],"sections":S2,"heads":heads,"count":len(rows),"ntx":[[a,b,n] for a,b,n,_ in NTF],
"sub":{"ur":"عربی متن، اردو ترجمہ، تخریج اور فوائد؛ ترجمہ: حافظ ابو سعید محمد محمود؛ تحقیق: ڈاکٹر سلیم ہلالی، شیخ البانی، احمد علی سلیمان",
"ar":"النص والترجمة الأردية والتخريج والفوائد؛ ترجمة: حافظ أبو سعيد محمد محمود؛ التحقيق: د. سليم الهلالي، الشيخ الألباني، أحمد علي سليمان",
"en":"Arabic text, Urdu translation, takhrij and notes; translated by Hafiz Abu Sa'eed Muhammad Mahmood; research of Dr. Salim al-Hilali, Shaykh al-Albani and Ahmad Ali Sulayman"},
"author":["malik","الإمام مالك","امام مالک","Imam Malik",179],
"trn":{"ur":"حافظ ابو سعید محمد محمود","en":"Hafiz Abu Sa'eed Muhammad Mahmood"},
"intro":intro,
"pub":{"ur":"انصار السنہ پبلیکیشنز، لاہور","ar":"أنصار السنة للنشر، لاهور","en":"Ansar as-Sunnah Publications, Lahore"}}
os.chdir('/home/claude/turath-site')
f=register('muwattaansar',entry,{'ar':AR,'ur':UR},after='c_malik')
for a,b,n,body in NTF: open('coll/'+n,'w',encoding='utf8').write(body)
oj=json.load(open('offline.json',encoding='utf8'))
g=[x for x in oj['groups'] if x['id']=='c_muwattaansar'][0]
for a,b,n,body in NTF:
    sz=len(body.encode());g['f'].append(['coll/'+n,hashlib.md5(body.encode()).hexdigest()[:10],'coll/'+n,sz]);g['b']+=sz
json.dump(oj,open('offline.json','w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
print({k:len(v) for k,v in f.items()},'ntfiles',[(a,b,n) for a,b,n,_ in NTF],'notes',len(NT),'intro',[(t,len(p)) for t,p in intro])
# keep both Imam Malik books side by side in the registry order (one author's books stay together)
s=open('coll/index.js',encoding='utf8').read()
L=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
e=[x for x in L if x['key']=='muwattaansar'][0];L=[x for x in L if x['key']!='muwattaansar']
i=[x['key'] for x in L].index('malik');L.insert(i+1,e)
open('coll/index.js','w',encoding='utf8').write('COLLS('+json.dumps(L,ensure_ascii=False,separators=(',',':'))+')')
