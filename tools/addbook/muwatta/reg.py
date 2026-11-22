import json,hashlib,os,glob
def chunk(key,lang,rows,limit=180000):
    out=[];cur=[];size=0
    def flush():
        nonlocal cur,size
        if not cur: return
        body='COLLDATA("%s","%s",%s)'%(key,lang,json.dumps(cur,ensure_ascii=False,separators=(',',':')))
        hh=hashlib.md5(body.encode()).hexdigest()
        name=f'{key}_{lang}_{len(out)+1}_{hh[:6]}.js'
        open('coll/'+name,'w',encoding='utf8').write(body)
        out.append([cur[0][0],cur[-1][0],name,len(body.encode()),hh[:10]]);cur=[];size=0
    for r in rows:
        cur.append(r);size+=len(json.dumps(r,ensure_ascii=False).encode())
        if size>limit: flush()
    flush();return out
def register(key,entry,langrows,after=None,extra_files=None):
    os.chdir('/home/claude/turath-site')
    for f in glob.glob(f'coll/{key}_*'): os.remove(f)
    files={l:chunk(key,l,r) for l,r in langrows.items()}
    entry['files']={l:[[a,c,n] for a,c,n,_,_ in fl] for l,fl in files.items()}
    s=open('coll/index.js',encoding='utf8').read()
    L=json.loads(s[s.index('COLLS(')+6:s.rindex(')')])
    L=[e for e in L if e['key']!=key];L.append(entry)
    open('coll/index.js','w',encoding='utf8').write('COLLS('+json.dumps(L,ensure_ascii=False,separators=(',',':'))+')')
    o=json.load(open('offline.json',encoding='utf8'))
    o['groups']=[g for g in o['groups'] if g['id']!='c_'+key]
    fl=[['coll/'+n,h,'coll/'+n,sz] for l in files for a,c,n,sz,h in files[l]]
    g={"id":"c_"+key,"k":"books","n":{"ur":entry['ur'],"en":entry['en'],"ar":entry['ar']},"f":fl,"b":sum(f[3] for f in fl)}
    k=[x['id'] for x in o['groups']].index(after)+1 if after else len(o['groups'])
    o['groups'].insert(k,g)
    json.dump(o,open('offline.json','w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
    return files
