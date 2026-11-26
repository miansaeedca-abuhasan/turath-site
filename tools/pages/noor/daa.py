#!/usr/bin/env python3
"""PowerISO .daa -> .iso -> files (Tafseer_Final.daa of the owner: 15 volumes of InPage files of Tafseer Noor al-Huda).
usage: daa.py <file.daa> <outdir>       header: chunk table at 0x4c, 3 bytes per chunk: size = (b1|b2<<8) + b0*65536 ... see below; chunks are raw deflate, 64 KB each.
The 24-bit entry is read little-endian: size = (entry>>8) + (entry&0xff)*65536; the data starts at the u32 at 0x18."""
import sys,zlib,struct,os
src,out=sys.argv[1],sys.argv[2]
d=open(src,'rb').read()
hdr=struct.unpack('<12I',d[16:64]); start,csize,isosize=hdr[2],hdr[5],hdr[6]
n=(isosize+csize-1)//csize
raw=[int.from_bytes(d[0x4c+i*3:0x4c+i*3+3],'little') for i in range(n)]
p=start;iso=bytearray()
for r in raw:
    s=(r>>8)+(r&0xff)*65536
    o=zlib.decompressobj(-15)
    try: x=o.decompress(d[p:p+s])
    except Exception: x=b''
    iso+=x.ljust(csize,b'\0'); p+=s
iso=bytes(iso[:isosize]); os.makedirs(out,exist_ok=True); open(out+'/t.iso','wb').write(iso)
# ISO 9660 (Joliet) extraction
def rd(off,n): return iso[off:off+n]
sec=16;root=None;joliet=False
while True:
    v=rd(sec*2048,2048)
    if v[0]==255: break
    if v[0]==2 and v[88:91] in (b'%/@',b'%/C',b'%/E'): root=v[156:190];joliet=True
    if v[0]==1 and root is None: root=v[156:190]
    sec+=1
def recs(lba,ln):
    data=rd(lba*2048,ln);i=0
    while i<len(data):
        l=data[i]
        if l==0: i=(i//2048+1)*2048;continue
        r=data[i:i+l];i+=l;nl=r[32];nm=r[33:33+nl]
        nm=nm.decode('utf-16-be','ignore') if joliet else nm.decode('latin1').split(';')[0]
        if nm in('\x00','\x01',''): continue
        yield nm,struct.unpack('<I',r[2:6])[0],struct.unpack('<I',r[10:14])[0],bool(r[25]&2)
cnt=0
def walk(lba,ln,path):
    global cnt
    for nm,l,s,isd in recs(lba,ln):
        p=path+'/'+nm
        if isd: walk(l,s,p)
        else:
            f=out+'/x'+p;os.makedirs(os.path.dirname(f),exist_ok=True);open(f,'wb').write(rd(l*2048,s));cnt+=1
walk(struct.unpack('<I',root[2:6])[0],struct.unpack('<I',root[10:14])[0],'')
print(cnt,'files')
