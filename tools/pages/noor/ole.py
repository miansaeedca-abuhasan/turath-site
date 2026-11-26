import struct
class OLE:
    def __init__(s,path):
        s.d=open(path,'rb').read(); d=s.d
        s.ss=1<<struct.unpack('<H',d[30:32])[0]; s.ms=1<<struct.unpack('<H',d[32:34])[0]
        nfat,dirs,_,cut,mfs,nmf,dif0,ndif=struct.unpack('<IIIIIIII',d[44:76])
        s.cut=cut
        difat=list(struct.unpack('<109I',d[76:76+436]))
        sec=dif0
        for _ in range(ndif):
            b=s.sec(sec); n=s.ss//4
            v=struct.unpack('<%dI'%n,b); difat+=v[:-1]; sec=v[-1]
        fat=[]
        for x in difat[:nfat]:
            fat+=struct.unpack('<%dI'%(s.ss//4),s.sec(x))
        s.fat=fat
        s.dirdata=s.chain(dirs)
        s.ents=[]
        for i in range(len(s.dirdata)//128):
            e=s.dirdata[i*128:(i+1)*128]
            nl=struct.unpack('<H',e[64:66])[0]
            nm=e[:max(nl-2,0)].decode('utf-16-le','ignore')
            t=e[66]; st=struct.unpack('<I',e[116:120])[0]; sz=struct.unpack('<Q',e[120:128])[0]&0xffffffff
            l,r,c=struct.unpack('<III',e[68:80])
            s.ents.append((nm,t,st,sz,l,r,c))
        root=s.ents[0]; s.mini=s.chain(root[2])[:root[3]] if root[3] else b''
        s.minifat=struct.unpack('<%dI'%(len(mm:=s.chain(mfs))//4),mm) if nmf else ()
    def sec(s,i): o=512+i*s.ss if s.ss==512 else (i+1)*s.ss; return s.d[o:o+s.ss]
    def chain(s,st):
        out=[];seen=0
        while st<0xFFFFFFFA and seen<10**7:
            out.append(s.sec(st)); st=s.fat[st]; seen+=1
        return b''.join(out)
    def mchain(s,st):
        out=[]
        while st<0xFFFFFFFA:
            out.append(s.mini[st*s.ms:(st+1)*s.ms]); st=s.minifat[st]
        return b''.join(out)
    def streams(s):
        res={}
        def walk(i,path):
            if i==0xFFFFFFFF: return
            nm,t,st,sz,l,r,c=s.ents[i]
            walk(l,path);walk(r,path)
            if t==2: res[path+'/'+nm]=(st,sz)
            elif t==1: walk(c,path+'/'+nm)
        walk(s.ents[0][6],'')
        return res
    def read(s,st,sz):
        return (s.mchain(st) if sz<s.cut else s.chain(st))[:sz]
