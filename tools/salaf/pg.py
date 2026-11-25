#!/usr/bin/env python3
"""Page lookup in the owner's EPUBs (extracted to SCR/ep<id>/OEBPS/text): pg.py <id> <word> <word>… -> (juz,page) of every page that holds ALL words (diacritics ignored).
Printed volume/page of the epub header «الجزء: N - الصفحة: M»."""
import glob,re,os,pickle,html,sys
SCR=os.environ.get('SALAF_SCR','/tmp/claude-0/-home-claude/c78c1915-dfa8-5395-875d-805b90bb4e15/scratchpad')
N=lambda t:re.sub(r'[^ء-ي ]','',re.sub(r'[ً-ْٰـ]','',t)).replace('أ','ا').replace('إ','ا').replace('آ','ا').replace('ى','ي').replace('ة','ه')
def load(b):
    c='%s/pg%s.pkl'%(SCR,b)
    if os.path.exists(c): return pickle.load(open(c,'rb'))
    P=[]
    for f in glob.glob('%s/ep%s/OEBPS/text/*.xhtml'%(SCR,b)):
        t=open(f,encoding='utf8').read();m=re.search(r'الجزء:\s*(\d+)\s*-\s*الصفحة:\s*(\d+)',t)
        if not m: continue
        P.append((int(m.group(1)),int(m.group(2)),N(html.unescape(re.sub(r'<[^>]+>',' ',t[t.find('<body'):])))))
    P.sort(key=lambda x:(x[0],x[1]));pickle.dump(P,open(c,'wb'));return P
def find(b,*ws):
    ws=[N(w) for w in ws];return [(p[0],p[1]) for p in load(b) if all(w in p[2] for w in ws)]
if __name__=='__main__':
    print(find(sys.argv[1],*sys.argv[2:]))
