"""Canary song (Wikimedia Commons): the long recording of a domestic canary by Frank Vincentz (CC BY-SA 3.0) gives three
different 25-second stretches with the most song; «Canari hartz 2» (a Harz roller, CC BY-SA 4.0) the fourth."""
import json, subprocess, urllib.request, urllib.parse, time
UA = {'User-Agent': 'SalatKhairAlQuroonBuild/1.0 (https://turathkhairalquroon.com; app sounds)'}
out = 'app/src/main/res/raw'
def get(u): return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=120).read()
def info(title):
    api = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({'action': 'query', 'format': 'json', 'titles': title, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata'})
    p = list(json.loads(get(api))['query']['pages'].values())[0]; return p['imageinfo'][0]
def levels(f):
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f, '-af', 'highpass=f=1000,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=/tmp/rms.txt', '-f', 'null', '-'])
    lv = [float(x.split('=')[1]) for x in open('/tmp/rms.txt').read().split() if x.startswith('lavfi.astats.Overall.RMS_level=') and x.split('=')[1] not in ('-inf', 'inf')]
    per = len(lv) / dur
    return dur, [sum(lv[int(i * per):int((i + 1) * per)] or [-90]) / max(1, len(lv[int(i * per):int((i + 1) * per)])) for i in range(int(dur))]
def cut(f, start, w, key):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(start), '-t', str(w), '-i', f, '-ac', '1', '-ar', '44100', '-b:a', '96k',
                    '-af', f'highpass=f=400,loudnorm=I=-18:TP=-2,afade=t=in:d=1.5,afade=t=out:st={w - 3}:d=3', f'{out}/birds_{key}.mp3'], check=True)
credits = json.load(open('tools/birds_credits.json'))
for k in ['canary', 'canary2', 'canary3', 'canary4', 'skylark']: credits.pop(k, None)
t1 = 'File:Serinus canaria forma domestica - audio 01 ies.ogg'
ii = info(t1); open('/tmp/c1', 'wb').write(get(ii['url'])); time.sleep(3)
dur, sec = levels('/tmp/c1'); w = 25; used = []
for key in ['canary', 'canary2', 'canary3']:
    best = max((i for i in range(0, int(dur) - w) if all(abs(i - u) >= w for u in used)), key=lambda i: sum(sec[i:i + w]))
    used.append(best); cut('/tmp/c1', best, w, key)
    credits[key] = {'title': t1, 'page': ii.get('descriptionurl'), 'licence': 'CC BY-SA 3.0', 'author': 'Frank Vincentz', 'from_second': best, 'seconds': w}
    print('ok', key, best)
t2 = 'File:Canari hartz 2.ogg'
try:
    ii = info(t2); open('/tmp/c2', 'wb').write(get(ii['url']))
    dur, sec = levels('/tmp/c2'); w = min(25, int(dur)); best = max(range(0, int(dur) - w + 1), key=lambda i: sum(sec[i:i + w]))
    cut('/tmp/c2', best, w, 'canary4')
    credits['canary4'] = {'title': t2, 'page': ii.get('descriptionurl'), 'licence': 'CC BY-SA 4.0', 'author': 'Commons', 'from_second': best, 'seconds': w}
    print('ok canary4', dur)
except Exception as e: print('fail canary4', e)
json.dump(credits, open('tools/birds_credits.json', 'w'), ensure_ascii=False, indent=1)
