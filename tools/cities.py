"""GeoNames cities1000 (CC BY 4.0) -> app/src/main/assets/cities.tsv:
name, ascii name, country code, latitude, longitude, time zone, population, a name in Arabic script (if GeoNames has one)."""
import sys, re, os
src, out = sys.argv[1], sys.argv[2]
AR = re.compile(r'^[؀-ۿ\s]+$')
os.makedirs(os.path.dirname(out), exist_ok=True)
n = 0
with open(src, encoding='utf-8') as f, open(out, 'w', encoding='utf-8') as o:
    for line in f:
        c = line.rstrip('\n').split('\t')
        if len(c) < 18 or not c[17]: continue
        ar = next((a for a in c[3].split(',') if AR.match(a) and len(a) > 1), '')
        o.write('\t'.join([c[1], c[2], c[8], '%.4f' % float(c[4]), '%.4f' % float(c[5]), c[17], c[14] or '0', ar]) + '\n'); n += 1
print('cities', n)
