"""Canary song for the app (Wikimedia Commons, free licences only): several searches, the four longest distinct recordings,
each cut to its best 25 seconds of song -> res/raw/birds_canary.mp3, _canary2, _canary3, _canary4; credits -> tools/birds_credits.json"""
import json, subprocess, urllib.request, urllib.parse, os, re
UA = {'User-Agent': 'SalatKhairAlQuroonBuild/1.0 (https://turathkhairalquroon.com; app sounds)'}
OK = re.compile(r'^(cc0|cc-zero|public domain|pd|cc by(-sa)? [0-9.]+|cc-by(-sa)?-[0-9.]+)', re.I)
QS = ['Serinus canaria domestica', 'Serinus canaria song', 'Harzer Roller', 'Kanarienvogel Gesang', 'canary singing', 'canary bird song', 'Timbrado canary', 'Serinus canaria']
out = 'app/src/main/res/raw'
def get(u): return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()
cands = {}
for q in QS:
    api = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({'action': 'query', 'format': 'json', 'generator': 'search',
        'gsrsearch': q + ' filetype:audio', 'gsrnamespace': 6, 'gsrlimit': 30, 'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata|mediatype'})
    try: pages = json.loads(get(api)).get('query', {}).get('pages', {}).values()
    except Exception as e: print('search failed', q, e); continue
    for p in pages:
        t = p['title']
        if not re.search(r'canari|kanarien|harzer|timbrado|serinus canaria', t, re.I): continue
        if re.search(r'bell|ring|music|piano|whistle|call only|alarm|serinus serinus', t, re.I): continue
        ii = (p.get('imageinfo') or [{}])[0]; md = ii.get('extmetadata', {})
        lic = re.sub('<[^>]+>', '', md.get('LicenseShortName', {}).get('value', '')).strip()
        if not OK.match(lic) or 'nc' in lic.lower(): continue
        cands[t] = (ii.get('size', 0), t, ii['url'], lic, re.sub('<[^>]+>', '', md.get('Artist', {}).get('value', '')).strip(), ii.get('descriptionurl'))
print(len(cands), 'candidates'); [print(' ', c[1], c[3], c[0]) for c in sorted(cands.values(), reverse=True)]
credits = json.load(open('tools/birds_credits.json')) if os.path.exists('tools/birds_credits.json') else {}
for k in ['canary', 'canary2']: credits.pop(k, None)
keys = ['canary', 'canary2', 'canary3', 'canary4']; n = 0
for size, title, url, lic, artist, desc in sorted(cands.values(), reverse=True):
    if n >= 4: break
    try:
        open('/tmp/b', 'wb').write(get(url))
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', '/tmp/b'], capture_output=True, text=True).stdout or 0)
        if dur < 12: continue
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', '/tmp/b', '-af', 'astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=/tmp/rms.txt', '-f', 'null', '-'])
        lv = [float(x.split('=')[1]) for x in open('/tmp/rms.txt').read().split() if x.startswith('lavfi.astats.Overall.RMS_level=') and x.split('=')[1] not in ('-inf', 'inf')]
        per = len(lv) / dur
        sec = [sum(lv[int(i * per):int((i + 1) * per)] or [-90]) / max(1, len(lv[int(i * per):int((i + 1) * per)])) for i in range(int(dur))]
        w = min(25, int(dur)); best = max(range(0, int(dur) - w + 1), key=lambda i: sum(sec[i:i + w]))
        k = keys[n]
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(best), '-t', str(w), '-i', '/tmp/b', '-ac', '1', '-ar', '44100', '-b:a', '96k',
                        '-af', f'highpass=f=400,loudnorm=I=-18:TP=-2,afade=t=in:d=1.5,afade=t=out:st={w - 3}:d=3', f'{out}/birds_{k}.mp3'], check=True)
        credits[k] = {'title': title, 'page': desc, 'licence': lic, 'author': artist, 'from_second': best, 'seconds': w}
        print('ok', k, title, lic, artist); n += 1
    except Exception as e: print('fail', title, e)
for k in ['skylark']: credits.pop(k, None)
json.dump(credits, open('tools/birds_credits.json', 'w'), ensure_ascii=False, indent=1)
