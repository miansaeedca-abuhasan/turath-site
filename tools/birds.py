"""Birdsong for the app from Wikimedia Commons (free licences only: CC0 / public domain / CC BY / CC BY-SA):
for each bird, the recording with the most song is cut to its best 25 seconds (the loudest stretch), faded and
levelled -> app/src/main/res/raw/birds_<key>.mp3; sources and licences -> tools/birds_credits.json."""
import json, subprocess, urllib.request, urllib.parse, os, re, sys
UA = {'User-Agent': 'SalatKhairAlQuroonBuild/1.0 (https://turathkhairalquroon.com; app sounds)'}
import sys
# more birds (run again with the keys to fetch): each key with several searches, the first that gives a free recording wins
BIRDS = [('canary', 'Serinus canaria'), ('canary', 'canary song'), ('canary', 'Serinus canaria domestica'), ('canary', 'canary bird'),
         ('canary2', 'Serinus serinus song'), ('canary2', 'European Serin'),
         ('goldfinch', 'Carduelis carduelis song'), ('thrush', 'Turdus philomelos song'), ('blackcap', 'Sylvia atricapilla song'),
         ('bulbul', 'Pycnonotus'), ('lark', 'Lullula arborea song'), ('warbler', 'Acrocephalus song'),
         ('finch', 'Fringilla coelebs song'), ('oriole', 'Oriolus oriolus song')]
OK = re.compile(r'^(cc0|cc-zero|public domain|pd|cc by(-sa)? [0-9.]+|cc-by(-sa)?-[0-9.]+)', re.I)
out, credits = 'app/src/main/res/raw', {}
os.makedirs(out, exist_ok=True)
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
done = set()
for key, q in BIRDS:
    if key in done or os.path.exists(f'{out}/birds_{key}.mp3'): continue
    api = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({'action': 'query', 'format': 'json', 'generator': 'search',
        'gsrsearch': q + ' filetype:audio', 'gsrnamespace': 6, 'gsrlimit': 20, 'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata|mediatype'})
    try: pages = json.loads(get(api)).get('query', {}).get('pages', {}).values()
    except Exception as e: print('search failed', key, e); continue
    cands = []
    for p in pages:
        ii = (p.get('imageinfo') or [{}])[0]; md = ii.get('extmetadata', {})
        lic = re.sub('<[^>]+>', '', md.get('LicenseShortName', {}).get('value', ''))
        dur = float(ii.get('duration') or 0)
        if not OK.match(lic.strip()) or 'nc' in lic.lower(): continue
        if re.search(r'bell|ring|music|piano|whistle|call only|alarm', p['title'], re.I): continue
        artist = re.sub('<[^>]+>', '', md.get('Artist', {}).get('value', '')).strip()
        cands.append((ii.get('size', 0), p['title'], ii['url'], lic, artist, ii.get('descriptionurl')))
    cands.sort(reverse=True)
    for size, title, url, lic, artist, desc in cands[:3]:
        try:
            open('/tmp/b', 'wb').write(get(url))
            # loudness per second -> the 25 s with most song
            r = subprocess.run(['ffmpeg', '-i', '/tmp/b', '-af', 'astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=/tmp/rms.txt', '-f', 'null', '-'], capture_output=True)
            lv = [float(x.split('=')[1]) for x in open('/tmp/rms.txt').read().split() if x.startswith('lavfi.astats.Overall.RMS_level=') and x.split('=')[1] not in ('-inf', 'inf')]
            # astats with reset=1 gives one value per audio frame (~0.02-0.1 s); group to seconds by count
            n = len(lv); dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', '/tmp/b'], capture_output=True, text=True).stdout or 0)
            if dur < 8: continue
            per = n / dur
            sec = [sum(lv[int(i * per):int((i + 1) * per)] or [-90]) / max(1, len(lv[int(i * per):int((i + 1) * per)])) for i in range(int(dur))]
            w = min(25, int(dur)); best = max(range(0, int(dur) - w + 1), key=lambda i: sum(sec[i:i + w]))
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(best), '-t', str(w), '-i', '/tmp/b', '-ac', '1', '-ar', '44100', '-b:a', '80k',
                            '-af', f'highpass=f=150,loudnorm=I=-18:TP=-2,afade=t=in:d=1.5,afade=t=out:st={w - 3}:d=3', f'{out}/birds_{key}.mp3'], check=True)
            credits[key] = {'title': title, 'page': desc, 'licence': lic, 'author': artist, 'from_second': best, 'seconds': w}
            print('ok', key, title, lic); done.add(key); break
        except Exception as e: print('fail', key, title, e)
old = json.load(open('tools/birds_credits.json')) if os.path.exists('tools/birds_credits.json') else {}
old.update(credits)
json.dump(old, open('tools/birds_credits.json', 'w'), ensure_ascii=False, indent=1)
