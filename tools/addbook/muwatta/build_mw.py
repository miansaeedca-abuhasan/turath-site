import sys,json,re,collections;sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)));sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import common
common.seg_fix=lambda t:t.replace('؁','').replace('ـ','')
from common import *
import parse as P
AN='\ue000'
def prot(t): return t.replace('آنحضرت',AN)
def unprot(t): return t.replace(AN,'آنحضرت')
def quotes(t):
    o=[]
    for i,ch in enumerate(t):
        if ch not in '”“"': o.append(ch);continue
        prev=t[i-1] if i else ' ';nxt=t[i+1] if i+1<len(t) else ' '
        o.append('’’' if (prev in ' \n(:،[' or i==0) and nxt not in ' \n' else '‘‘')
    return ''.join(o)
VR=re.compile(r'\s*﴿\s*([^﴾]*?)\s*﴾\s*[\(\[]([^()\[\]]{2,40})[\)\]]\s*(?:’’(.*?)‘‘)?',re.S)
def verses(t):
    t=re.sub(r'\s*﴿\s*([۰-۹]+)\s*﴾',r' \1',t)
    def f(m):
        v,ref,tr=m.group(1),m.group(2),m.group(3)
        v=re.sub(r'\s*﴿\s*([۰-۹]+)\s*﴾',r' \1',v)
        ref=re.sub(r'(?<=[۰-۹])\s*[_ـ]\s*(?=[۰-۹])','-',ref)
        line=verse_line('﴿ '+v+' ﴾ ('+ref+')') or m.group(0)
        out='\n'+line+'\n'
        if tr is not None: out+='’’'+tr.strip()+'‘‘\n'
        return out
    return VR.sub(f,t)
CUT=['رضی اللہ','رحمہ','علیہ السلام','علیہا السلام','صلی اللہ','۔','’’','‘‘',':','«','»','؟']
def sayy2(t):
    out=t;pos=0
    for m in list(re.finditer(r'رضی اللہ عنہ[مما]',t)):
        a=max(0,m.start()-90);w=t[a:m.start()]
        for c in CUT:
            i=w.rfind(c)
            if i>=0: w=w[i+len(c):];a=m.start()-len(w)
        w2=re.sub(r'(?<!\w)حضرت(?=\s)','سیدنا',w)
        if w2!=w: out=out[:a+(len(out)-len(t))]+w2+out[m.start()+(len(out)-len(t)):] if False else out
    return out
def sayy2(t):
    reps=[]
    for m in re.finditer(r'رضی اللہ عنہ[مما]',t):
        a=max(0,m.start()-90);w=t[a:m.start()]
        for c in CUT:
            i=w.rfind(c)
            if i>=0: w=w[i+len(c):]
        a=m.start()-len(w)
        for h in re.finditer(r'(?<!\w)حضرت(?=\s)',w): reps.append(a+h.start())
    for p in sorted(set(reps),reverse=True): t=t[:p]+'سیدنا'+t[p+4:]
    return t
def U(t): return sayy2(unprot(urx(prot(quotes(t)))))
def ar_fix(t,stop=False):
    t=ar_clean(t)
    t=re.sub(r'\s+([\.،:؟])',r'\1',t) if False else t
    t=re.sub(r'\s+\.(»?)$',r'.\1',t).strip()
    if stop and t and not re.search(r'[\.:؟»\)\]]$',t): t+='.'
    return t
AR2UR=[('صلى الله عليه وسلم','صلی اللہ علیہ وسلم'),('صلي الله عليه وسلم','صلی اللہ علیہ وسلم'),('رضي الله عنهما','رضی اللہ عنہما'),('رضي الله عنهم','رضی اللہ عنہم'),('رضي الله عنها','رضی اللہ عنہا'),('رضي الله عنه','رضی اللہ عنہ'),('رحمه الله','رحمہ اللہ'),('عليه السلام','علیہ السلام')]
def ar2ur(l):
    if isar(l): return l
    for a,b in AR2UR: l=l.replace(a,b)
    return l
def ulines(t):
    out=[]
    for l in t.split('\n'):
        l=l.strip()
        if not l: continue
        if l[0]=='§': out.append('§'+U(l[1:]).strip());continue
        l=ar2ur(re.sub(r'(?<=[۰-۹])\s*[_ـ]\s*(?=[۰-۹])','-',l))
        v=verse_line(l)
        if v: out.append(v);continue
        out.extend(x.strip() for x in verses(U(l)).split('\n') if x.strip())
    return out
def ayat_lines(b):
    ln=verse_line('﴿ '+b['matn'].strip('﴿﴾ ')+' ﴾ '+b.get('hawala','').strip()) or ('﴿ '+ar_clean(b['matn'].strip('﴿﴾ '))+' ﴾ '+b.get('hawala',''))
    out=[ln]
    tr=(b.get('tarjuma') or '').strip().strip('“”’‘"').strip()
    if tr: out.append('’’'+U(tr)+'‘‘')
    return out
def takh(s):
    s=final_clean((s or '').replace('\n',' '))
    s=re.sub(r'^\[\s*[۰-۹0-9]+\s*\]\s*','',s)
    s=re.sub(r'(?<=[۰-۹])\s*[_ـ]\s*(?=[۰-۹])','-',s)
    return U(s).translate(U2E)
def isar(l):
    isu=re.search(r'[ٹڈڑںےہھگچپژکیۃ]',l)
    return bool(re.search(r'[ً-ْ]',l)) and not isu

def fa_lines(f):
    out=[]
    for x in f:
        if isinstance(x,tuple) and x[0]=='ayat': out.extend(ayat_lines(x[1]))
        elif isinstance(x,str): out.extend(ulines(x))
    return out
def unit_lines(u):
    """bab-level / kitab-level unit -> lines"""
    if isinstance(u,tuple) and u[0]=='h': return ['§'+U(u[1]).strip()]
    if isinstance(u,tuple) and u[0]=='ayat': return ayat_lines(u[1])
    if isinstance(u,str):
        if u[:1]!='§' and '\n' not in u and isar(u): return [ar_fix(u)]
        return ulines(u)
    return []
def build_all():
    o=P.build();fx=P.fixnums(o)
    rows=[];secs=[];heads=[];REPT=[];sid=0;prev=0
    for k in o['kitabs']:
        kit_nt=[]
        if k['khulasa'] or k['intro']:
            kit_nt=['§کتاب کا تعارف']+ulines(k['khulasa'] or '')
            for u in k['intro']: kit_nt+=unit_lines(u)
        first_bab=True
        for b in k['babs']:
            sid+=1
            nt=[]
            if first_bab and kit_nt: nt+=kit_nt
            if b['khulasa']: nt+=['§خلاصۃ الباب']+ulines(b['khulasa'])
            first=None;last=None;seen_h=False
            for u in b['units']:
                if isinstance(u,tuple) and u[0]=='H':
                    h=u[1];n=int(h['num']);seen_h=True
                    ar=[ar_fix(h['ar'],True)];ur=[x for x in ulines(h['ur'])];nh=len(ur)
                    for ma,mu in h['malik']:
                        if ma: ar.append(ar_fix(ma))
                        if mu: ur+=ulines(mu)
                    tk=takh(h['tk']);fw=fa_lines(h['f'])
                    kk={}
                    if tk: ur[nh-1]=ur[nh-1]+' (1)';kk['k']='(1) '+tk
                    rows.append({'id':n,'ar':'\n'.join(ar),'ur':'\n'.join(ur),'k':kk,'f':'\n'.join(fw),'pg':h['pg']})
                    if first is None: first=n
                    last=n;prev=n
                else:
                    if not seen_h: nt+=unit_lines(u)
                    else: REPT.append('unit after H')
            first_bab=False
            empty=False
            if first is None: empty=True;REPT.append('empty bab');first=prev+1;last=prev
            ar_t=b['ar'].strip();ur_t=U(b['ur']).strip() if b['ur'] else ar_t
            sec=[sid,ur_t,first,last,ar_fix(ar_t)]
            if nt or empty: sec.append(dict(({'nt':nt} if nt else {}),**({'e':1} if empty else {})))
            secs.append(sec)
            if len([1 for s in secs if s[0]==sid])==1 and b is k['babs'][0]: heads.append([sid,U(k['ur']).strip(),ar_fix(k['ar'])])
    return o,rows,secs,heads,REPT,fx
if __name__=='__main__':
    o,rows,secs,heads,REPT,fx=build_all()
    print('rows',len(rows),'secs',len(secs),'heads',len(heads),collections.Counter(REPT))
    json.dump({'rows':rows,'secs':secs,'heads':heads},open('/tmp/built_mw.json','w'),ensure_ascii=False)

FN=re.compile(r'^\s*\(\s*([۰-۹0-9]+)\s*\)(?!\s*…)\s*\.*\s*')
def build_front(o):
    intro=[]
    for f in o['front']:
        paras=[];notes=[];title=f['title']
        for pf,b,pg in f['blocks']:
            q=b['qism']
            if q=='surkhi':
                t=U(b.get('matn') or b.get('urdu') or b.get('arabic') or '').strip()
                if t!=U(title).strip(): paras.append('§'+t)
                continue
            if q=='ayat': paras.extend(ayat_lines(b));continue
            if q=='hadith':
                paras.append(ar_fix(b['arabic'],True));paras.extend(ulines(b['urdu']));continue
            txt=(b.get('matn') or '').strip()
            if not txt: continue
            m=FN.match(txt)
            if m and b.get('zaban')!='arabic':
                n=int(m.group(1).translate(U2E));notes.append('(%d) '%n+' '.join(ulines(txt[m.end():])));continue
            if b.get('zaban')=='arabic' or isar(txt): paras.append(ar_fix(txt));continue
            ls=ulines(txt)
            if pf and paras and not paras[-1].startswith('§') and not P.complete(paras[-1]) and not P.complete('') is False and ls and not ls[0].startswith('﴿'):
                paras[-1]=P.jn(paras[-1],ls[0]);ls=ls[1:]
            paras.extend(ls)
        if notes: paras+=['§حواشی']+notes
        intro.append([U(title).strip(),paras])
    return intro
