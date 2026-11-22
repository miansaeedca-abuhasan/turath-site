import sys;sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from load import *
U2E=str.maketrans('۰۱۲۳۴۵۶۷۸۹','0123456789')
TERM=re.compile(r'[۔؟!.][\s’‘”“\)\]»﴾"…]*$|[’‘”“]\s*$|[۔؟!][\s]*\)\s*$')
def complete(t):
    t=(t or '').rstrip()
    return bool(TERM.search(t)) or not t
def jn(a,b):
    a=a.rstrip();b=b.lstrip()
    return a+' '+b if a and b else a+b
def build():
    seq=load()
    out={'front':[], 'kitabs':[]}
    cur=None  # current open unit descriptor
    prev_page=None
    kit=None;bab=None;H=None;tail=None   # tail = (container,key) of the open text to extend
    log=collections.Counter()
    front=None
    recent=collections.deque(maxlen=8)
    def nz(t): return re.sub(r'\s+','',t or '')
    for idx,(v,hi,title,pg,b) in enumerate(seq):
        q=b['qism'];pgkey=(v,hi,pg)
        pf = pgkey!=prev_page   # first block on a new page
        if pf: seenl=set()
        _zl=b.get('zaban') or ('urdu' if q in('faida','khulasa') else q)
        pfl = _zl not in seenl   # first block of its language on this page
        seenl.add(_zl)
        prev_page=pgkey
        if hi<3 and v==1:      # front matter parts
            if pf or not out['front'] or out['front'][-1]['title']!=title:
                pass
            if not out['front'] or out['front'][-1]['title']!=title: out['front'].append({'title':title,'blocks':[],'pages':[]})
            f=out['front'][-1];f['blocks'].append((pf,b,pg))
            if pg not in f['pages']: f['pages'].append(pg)
            continue
        # ---------- main ----------
        if q in('paragraph','faida','khulasa'):
            piece=nz(b.get('matn') or b.get('urdu') or b.get('arabic'))
            if len(piece)>=(12 if pf else 25) and any(piece in r for r in recent):
                log['dup piece dropped']+=1;continue
        if q=='hadith' and H is not None and b['number']==H['num'] and nz(b['arabic']) in nz(H['ar']) and len(nz(b['arabic']))>=12 and nz(b['urdu']) in nz(H['ur']):
            log['dup hadith piece dropped']+=1;continue
        recent.append(nz(b.get('matn') or b.get('urdu') or b.get('arabic')))
        if q=='hadith': recent.append(nz(b.get('arabic'))+'|');recent.append(nz(b.get('urdu')))
        if q=='surkhi':
            if 'kitab_number' in b:
                kit={'no':int(b['kitab_number']),'ar':b['arabic'],'ur':b['urdu'],'title':title,'intro':[],'khulasa':'', 'babs':[]}
                out['kitabs'].append(kit);bab=None;H=None;tail=None;mode='kintro'
                continue
            a=b.get('arabic','')
            if a:   # a bab
                m=re.match(r'^(\d+)\s*-\s*(.*)$',a,re.S)
                bab={'no':int(m.group(1)) if m else None,'ar':m.group(2) if m else a,'ur':b.get('urdu',''),'khulasa':'','units':[],'kit':kit}
                kit['babs'].append(bab);H=None;tail=None;continue
            # a sub-heading inside running text
            hd=b.get('urdu') or b.get('matn')
            if H is not None:
                H['f'].append('§'+hd);tail=None
            else:
                (bab['units'] if bab else kit['intro']).append(('h',hd));tail=None
            continue
        if q=='khulasa':
            tgt=bab if bab is not None else kit
            if pf and tail and tail[0] is tgt and tail[1]=='khulasa' and not complete(tgt['khulasa']):
                tgt['khulasa']=jn(tgt['khulasa'],b['matn'])
            else:
                tgt['khulasa']=b['matn'] if not tgt['khulasa'] else tgt['khulasa']+'\n'+b['matn'];log['khulasa multi']+= bool(tgt['khulasa'].count('\n'))
            tail=(tgt,'khulasa');continue
        if q=='hadith':
            n=b['number']
            tk=(b.get('takhreej') or '').strip()
            mark=bool(re.match(r'^(\[|\()',tk))
            cont = H is not None and n==H['num'] and (not tk or not mark or not H['tk'])
            if cont:
                H['ar']=jn(H['ar'],b['arabic']);H['ur']=jn(H['ur'],b['urdu']);log['hadith cont']+=1;tail=('H','ur')
                if tk: H['tk']=jn(H['tk'],tk) if H['tk'] else tk
            else:
                H={'num':n,'ar':b['arabic'],'ur':b['urdu'],'tk':b['takhreej'],'f':[],'malik':[],'bab':bab,'pg':pg}
                bab['units'].append(('H',H));log['hadith']+=1;tail=('H','ur')
                if b.get('tukra'): log['hadith tukra new']+=1
            continue
        # paragraph / faida / ayat
        txt=b.get('matn') or b.get('urdu') or b.get('arabic') or ''
        zb=b.get('zaban')
        if q=='ayat':
            line='﴿'+b['matn'].strip('﴿﴾ ')+'﴾ '+b.get('hawala','')+'\n’’'+b.get('tarjuma','')+'‘‘'
            if H is not None: H['f'].append(('ayat',b));
            else: (bab['units'] if bab else kit['intro']).append(('ayat',b))
            tail=None;continue
        if kit is None: log['text before kit']+=1;continue
        # continuation across a page break
        if pfl and tail is not None:
            kind,key=tail
            if kind=='H' and zb=='arabic' and not H['malik'] and not H['f'] and not complete(H['ar']):
                H['ar']=jn(H['ar'],txt);log['cont hadith arabic']+=1;continue
            if kind=='H' and key=='ur' and not complete(H['ur']) and zb!='arabic':
                H['ur']=jn(H['ur'],txt);log['cont hadith urdu']+=1;continue
            if kind=='Hf' and not complete(H['f'][-1] if isinstance(H['f'][-1],str) else '') and zb!='arabic' and isinstance(H['f'][-1],str):
                H['f'][-1]=jn(H['f'][-1],txt);log['cont faida']+=1;continue
            if kind in('Mu','Ma') and H['malik'] and zb=='arabic' and not complete(H['malik'][-1][0]):
                H['malik'][-1][0]=jn(H['malik'][-1][0],txt);log['cont malik ar (after ur)']+=1;continue
            if kind=='Mu' and not complete(H['malik'][-1][1]) and zb!='arabic':
                H['malik'][-1][1]=jn(H['malik'][-1][1],txt);log['cont malik ur']+=1;continue
            if kind=='Ma' and not complete(H['malik'][-1][0]) and (zb=='arabic' or not re.search(r'[ٹڈڑںےہھگچپژ]',txt)):
                H['malik'][-1][0]=jn(H['malik'][-1][0],txt);log['cont malik ar']+=1;continue
            if kind=='KI' and kit['intro'] and isinstance(kit['intro'][-1],str) and not complete(kit['intro'][-1]):
                kit['intro'][-1]=jn(kit['intro'][-1],txt);log['cont kitab intro']+=1;continue
            if kind=='BU' and bab['units'] and isinstance(bab['units'][-1],str) and not complete(bab['units'][-1]):
                bab['units'][-1]=jn(bab['units'][-1],txt);log['cont bab text']+=1;continue
        if bab is None:
            kit['intro'].append(txt);tail=('KI',0);continue
        if H is None:
            bab['units'].append(txt);tail=('BU',0);log['bab text before hadith']+=1;continue
        if q=='faida':
            H['f'].append(txt);tail=('Hf',0);continue
        # paragraph
        if zb=='arabic' or (b.get('arabic') and not b.get('matn')):
            H['malik'].append([txt,'']);tail=('Ma',0);log['malik ar']+=1;continue
        # urdu paragraph
        if H['malik'] and H['malik'][-1][1]=='' :
            H['malik'][-1][1]=txt;tail=('Mu',0);continue
        if H['f']:
            H['f'].append(txt);tail=('Hf',0);log['faida extra para']+=1;continue
        if H['malik']:
            # a second Urdu paragraph of the Malik translation
            H['malik'][-1][1]+='\n'+txt;tail=('Mu',0);log['malik extra ur']+=1;continue
        # no faida, no malik: a second paragraph of the translation?
        log['para after hadith (no faida)']+=1
        H['ur']+='\n'+txt;tail=('H','ur')
    out['log']=log
    return out
if __name__=='__main__':
    o=build();print(o['log'])
    print(len(o['kitabs']),sum(len(k['babs']) for k in o['kitabs']),sum(1 for k in o['kitabs'] for b in k['babs'] for u in b['units'] if isinstance(u,tuple) and u[0]=='H'))

def fixnums(o):
    prev=0;fixes=[]
    flat=[u[1] for k in o['kitabs'] for b in k['babs'] for u in b['units'] if isinstance(u,tuple) and u[0]=='H']
    def realnum(h):
        m=re.match(r'^\[(\d+)\]',h['tk'] or '')
        return int(h['num']) if h['num'] else (int(m.group(1)) if m else None)
    def nextnum(h):
        i=[x is h for x in flat].index(True)
        for x in flat[i+1:]:
            if x['num']: return int(x['num'])
        return None
    for k in o['kitabs']:
        for b in k['babs']:
            nu=[];lastb=None
            for u in b['units']:
                if not(isinstance(u,tuple) and u[0]=='H'): nu.append(u);continue
                h=u[1];orig=h['num']
                if not orig:
                    if lastb is not None:
                        lastb['malik'].append([h['ar'],h['ur']]);lastb['f'].extend(h['f']);lastb['malik'].extend(h['malik']);fixes.append((k['no'],'blank->malik',h['pg']));continue
                    nn=nextnum(h)
                    if nn==prev+2:
                        orig=str(prev+1);h['num']=orig;fixes.append((k['no'],'blank-own-row',h['pg'],orig))
                    else:
                        nu.append(h['ar']);nu.append(h['ur'])
                        for x in h['f']: nu.append(x if isinstance(x,str) else x)
                        fixes.append((k['no'],'blank->bab note',h['pg']));continue
                m=re.match(r'^\[(\d+)\]',h['tk'] or '')
                cands=[int(orig)]+([int(m.group(1))] if m else [])
                n=prev+1 if prev+1 in cands else int(orig)
                if n!=prev+1 and k['no']==20 and int(orig)==prev: n=prev+1
                if n!=int(orig): fixes.append((k['no'],orig,n,bool(m)))
                elif n!=prev+1: fixes.append((k['no'],'GAP',prev,n))
                h['num']=str(n);prev=n;lastb=h;nu.append(u)
            b['units']=nu
    return fixes
