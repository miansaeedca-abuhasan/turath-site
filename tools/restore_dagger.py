import sys,glob,json,re,collections,os,hashlib
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from restore_dagger_lib import *
BOOKS={
 'humaydiur':['*Musnad-Humaidi.json'],
 'bukhari':['*Sahih_Bukhari_Arabic_With_Urdu_Translation_Mukammal.docx'],
 'tirmidhi':['*Sun_an_Tirmizi_Mukammal.docx'],
 'ibnkhuzaymahur':['*Ibn-e-Khuzaima-Vol-?.json','*Ibn-e-Khuzaima-Vol-?_Corrected.json'],
 'khalqafaalur':['*Khalq_Afaal_Ebad_Bukhari_27-10-21.docx'],
 'musnadishaq':['*Musnad-Ishaaq.json'],
 'musnadibrahim':['*Musnad-Ibrahim-Bin-Adham.json'],
 'musnadsarrajur':['*Musnad-Siraj.json'],
 'musnadshafiiur':['*Musnad-Shafai-Vo-?.json'],
 'shaansahabaur':['*Shaan-e-Sahaba.json'],
 'saheefaaliur':['*Saheefa-Ali-bin-Abi-Talib.json'],
 'fazailnasai':['*Fazail-ul-Sahaba-01.json'],
 'zuhdwaki':['*Kitab-u-Zuhad-Li-Wakee.json'],
 'raheeq':['*Ar-Raheeq_Al-Makhtum.json'],
}
def run(key,write=False):
    files=sorted({f for g in BOOKS[key] for f in glob.glob(A+g)})
    lex=Lex(files)
    os.chdir('/home/claude/turath-site')
    stats=collections.Counter();renames=[]
    for f in sorted(glob.glob(f'coll/{key}_ur_*.js')):
        s=open(f,encoding='utf8').read()
        n=restore_raw(s,lex,stats)
        if n!=s and write:
            h=hashlib.md5(n.encode()).hexdigest()
            nf=re.sub(r'_[0-9a-f]{6}\.js$','_'+h[:6]+'.js',f)
            open(nf,'w',encoding='utf8').write(n)
            if nf!=f: os.remove(f)
            renames.append((f,nf,h[:10],len(n.encode())))
    return stats,renames,files,lex
if __name__=='__main__':
    for key in (sys.argv[1:] or BOOKS):
        st,_,files,lex=run(key)
        agg=collections.Counter()
        for (b,k),c in st.items(): agg[k]+=c
        src=sum(len(re.findall('[یى]ٰ',open(f,encoding='utf8',errors='ignore').read())) for f in files if f.endswith('.json'))
        print(key,len(files),'src files; restored',agg['restored'],'keep-plain',agg['p'],'unresolved',agg['u'],'badpos',agg['badpos'])
        print('   unresolved top:',sorted(((c,b) for (b,k),c in st.items() if k=='u'),reverse=True)[:8])
