"""Arabic passages of «ہندو سے محدث مدینہ بننے تک کا سفر»: typed with Urdu letters (ک ی ہ ۃ) in the file -> Arabic letters, wrapped «⁠…» (U+2060 forces the Arabic font in rich0)."""
import re
URL=set('کے میں ہے کی سے اور نے کو ہیں تھا کہ جو ہو ہوا ہوئی ہوئے نہیں بھی پر کر لیے ایک یہ وہ اس ان ہم آپ تھے تھی گیا گئی گئے دیا جا رہا رہی رہے کیا کیے والے والی والا بہت لیکن کیونکہ'.split())
URDU_ONLY=re.compile('[ٹڈڑںےۓگچپژ]')
MARK=re.compile('[ۃأإؤئءآةىيً-ْ]')
ARW=set('فی من علی إلی الی عن أن ان إن لا ما ثم أو او أما اما بعد و ذلک ذالک ہذا هذا هذه کل بن ابن أبو ابو رسول اللہ الله صلی علیہ وسلم آلہ وآلہ وصحبہ اجمعین ونحن فہل نرجع لمعرفۃ'.split())
FINAL_A=set('علی إلی حتی متی أولی أخری الکبری الصغری الدنیا'.split())   # words that really end in alif maqsura; Dunya is written with plain ya
FINAL_A.discard('الدنیا')
FIX={}   # the print itself has «ذالك» (author's spelling): kept as printed
def conv(w):
    w=FIX.get(w,w)
    if w in FINAL_A or (w.endswith('ی') and w[:-1]+'ی' in FINAL_A): return w.replace('ک','ك').replace('ہ','ه').replace('ھ','ه').replace('ۃ','ة')[:-1]+'ى' if w.endswith('ی') else w
    r=w.replace('ک','ك').replace('ھ','ه').replace('ہ','ه').replace('ۃ','ة')
    return r.replace('ی','ي')
def conv_final(w):
    base=re.sub('[ً-ْ]','',w)
    c=conv(w)
    if base in FINAL_A and c.endswith('ي'): c=c[:-1]+'ى'
    return c
URX=set('کا صفحات اردو رحمہ حفظہ رحمہما ڈاکٹر دکتور مولانا طبع اول دوم سوم چہارم پنجم ششم فیصل آباد عمر مدیر نے'.split())
HON=set('صلی اللہ علیہ وسلم صلى الله عليه رحمہ رضی عنہ'.split())
def tok_arabic(t):
    b=t.strip('،۔؟!:؛,.()«»﴿﴾-')
    if not b: return None   # neutral
    if URDU_ONLY.search(b) or b in URL or b in URX: return 'U'
    if re.search('[0-9۰-۹]',b): return None
    return 'A' if (MARK.search(b) or b.startswith(('ال','وال','بال','لل','فال')) or b in ARW) else '?'
def seg_arabic(seg,minw=4):
    ts=[t for t in seg.split() if t]
    fl=[tok_arabic(t) for t in ts]
    if 'U' in fl: return False
    if all((t.strip('،۔؟!:؛,.()-') in HON) or f is None for t,f in zip(ts,fl)): return False
    n=fl.count('A');m=fl.count('?')
    return n>=minw and n>=0.4*(n+m)
def wrap(seg):
    out=' '.join(conv_final(t) for t in seg.split(' '))
    return '«⁠'+out+'»'
def arabize_line(ln):
    if '«' in ln or '﴿' in ln: return ln,[]
    log=[]
    if ln.startswith('§'): return ln,[]
    m=re.match(r'^(§?)((?:\(?\d+[\-:۔)]\s*|\d+۔\s*)?)(.*)$',ln,re.S)
    pre,lead,rest=m.group(1),m.group(2),m.group(3)
    # whole remainder
    if seg_arabic(rest,3):
        log.append(rest);return pre+lead+wrap(rest),log
    # tail after the last colon
    k=rest.rfind(': ')
    if k>0 and seg_arabic(rest[k+2:],4):
        log.append(rest[k+2:]);return pre+lead+rest[:k+2]+wrap(rest[k+2:]),log
    # parenthesised Arabic
    def par(mm):
        inner=mm.group(1)
        if seg_arabic(inner,4): log.append(inner);return '('+wrap(inner)+')'
        return mm.group(0)
    new=re.sub(r'\(([^()]{12,})\)',par,rest)
    return pre+lead+new,log
def arabize(text):
    out=[];log=[]
    for ln in text.split('\n'):
        a,l=arabize_line(ln);out.append(a);log+=l
    return '\n'.join(out),log
