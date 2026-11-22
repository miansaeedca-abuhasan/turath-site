import json,re,collections
D='/mnt/user-data/attachments/c78c1915-dfa8-5395-875d-805b90bb4e15/'
FILES={1:'36852003-Mouta-Imam-Malik-Vol-1.json',2:'57f82571-Mouta-Imam-Malik-Vol-2.json',3:'c4d96bf5-Mouta-Imam-Malik-Vol-3.json'}
def load():
    seq=[]   # (vol,hissa_idx,hissa_title,page,block)
    for v,f in FILES.items():
        d=json.load(open(D+f,encoding='utf8'))
        for hi,h in enumerate(d['hissay']):
            for p in h['safhat']:
                for b in p['blocks']:
                    seq.append((v,hi,h['unwan'],p['safha'],b))
    return seq
