"""On the CI emulator: install the app, give it a city, open every tab in Urdu / Arabic / English and take screenshots
(shots/*.png) plus the crash log, so the build can be checked without a phone."""
import subprocess, time, re, os, json
os.makedirs('shots', exist_ok=True)
# can the map servers be reached from here, and how fast (for the mosque finder)
q = '[out:json][timeout:60];(nwr["amenity"="place_of_worship"]["religion"="muslim"](43.139,-80.264,44.039,-79.024);nwr["religion"="muslim"]["amenity"](43.139,-80.264,44.039,-79.024);nwr["religion"="muslim"]["office"](43.139,-80.264,44.039,-79.024);nwr["building"="mosque"](43.139,-80.264,44.039,-79.024);nwr["amenity"~"community_centre|social_centre|place_of_worship"]["name"~"islam|muslim|masjid|mosque|musall",i](43.139,-80.264,44.039,-79.024););out center tags;'
with open('shots/overpass.txt', 'w') as o:
    for u in ['https://maps.mail.ru/osm/tools/overpass/api/interpreter', 'https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']:
        r = subprocess.run(['curl', '-s', '-A', 'SalatKhairAlQuroon/1.0 (https://turathkhairalquroon.com)', '-o', '/tmp/op.json', '-w', '%{http_code} %{time_total}', '--max-time', '70', '--data-urlencode', 'data=' + q, u], capture_output=True, text=True)
        n = open('/tmp/op.json').read().count('"type"') if os.path.exists('/tmp/op.json') else 0
        o.write(f'{u} {r.stdout} elements~{n}\n')
    r = subprocess.run(['curl', '-s', '-A', 'SalatKhairAlQuroon/1.0 (turathkhairalquroon@gmail.com)', '-o', '/tmp/nm.json', '-w', '%{http_code} %{time_total}', '--max-time', '40',
        'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=50&bounded=1&extratags=1&q=mosque&viewbox=-80.264,44.039,-79.024,43.139'], capture_output=True, text=True)
    o.write(f'nominatim {r.stdout} results~{open("/tmp/nm.json").read().count("osm_id") if os.path.exists("/tmp/nm.json") else 0}\n')
    r = subprocess.run(['curl', '-s', '-A', 'SalatKhairAlQuroon/1.0', '-o', '/tmp/ph.json', '-w', '%{http_code} %{time_total}', '--max-time', '40',
        'https://photon.komoot.io/api/?limit=50&osm_tag=amenity:place_of_worship&q=mosque&lat=43.589&lon=-79.644'], capture_output=True, text=True)
    o.write(f'photon {r.stdout} results~{open("/tmp/ph.json").read().count("osm_id") if os.path.exists("/tmp/ph.json") else 0}\n')
print(open('shots/overpass.txt').read())
def sh(*a, inp=None):
    return subprocess.run(['adb', *a], input=inp, capture_output=True).stdout
def tap_text(t):
    no_anr()
    sh('shell', 'uiautomator', 'dump', '/sdcard/ui.xml'); x = sh('shell', 'cat', '/sdcard/ui.xml').decode('utf-8', 'ignore')
    ms = list(re.finditer(r'text="' + re.escape(t) + r'"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', x))
    if not ms: print('not found', t); return False
    a, b, c, d = max((tuple(map(int, m.groups())) for m in ms), key=lambda q: q[1])   # the lowest one: the bottom bar
    sh('shell', 'input', 'tap', str((a + c) // 2), str((b + d) // 2)); return True
def no_anr():
    # the emulator's own launcher sometimes stalls: close its «isn't responding» box
    for _ in range(3):
        sh('shell', 'uiautomator', 'dump', '/sdcard/ui.xml'); x = sh('shell', 'cat', '/sdcard/ui.xml').decode('utf-8', 'ignore')
        m = re.search(r'text="Wait"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', x)
        if "isn't responding" not in x or not m: return
        a, b, c, d = map(int, m.groups()); sh('shell', 'input', 'tap', str((a + c) // 2), str((b + d) // 2)); time.sleep(2)
def shot(name):
    time.sleep(3); no_anr(); open(f'shots/{name}.png', 'wb').write(sh('exec-out', 'screencap', '-p'))
apk = 'app/build/outputs/apk/debug/app-debug.apk'
print(sh('install', '-r', '-g', apk).decode())
sh('shell', 'am', 'start', '-n', 'org.turath.salat/.MainActivity'); time.sleep(6); shot('00_first_start')
tabs = {'ur': ['آج', 'اوقات', 'یاد دہانی', 'کیلنڈر', 'قبلہ', 'مساجد'], 'ar': ['اليوم', 'المواقيت', 'التنبيهات', 'التقويم', 'القبلة', 'المساجد'], 'en': ['Today', 'Times', 'Reminders', 'Calendar', 'Qibla', 'Mosques']}
menu = {'ur': 'مینو', 'ar': 'القائمة', 'en': 'Menu'}
def tap_desc(t):
    sh('shell', 'uiautomator', 'dump', '/sdcard/ui.xml'); x = sh('shell', 'cat', '/sdcard/ui.xml').decode('utf-8', 'ignore')
    m = re.search(r'content-desc="' + re.escape(t) + r'"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', x)
    if not m: print('no desc', t); return False
    a, b, c, d = map(int, m.groups()); sh('shell', 'input', 'tap', str((a + c) // 2), str((b + d) // 2)); return True
def from_menu(lang, item):
    tap_text(tabs[lang][0]); time.sleep(2)
    if tap_desc(menu[lang]): time.sleep(2); return tap_text(item)
    return False
place = json.dumps({"n": "Mississauga", "c": "CA", "lat": 43.589, "lng": -79.644, "tz": "America/Toronto"}).replace('"', '&quot;')
for lang in ['ur', 'ar', 'en']:
    sh('shell', 'am', 'force-stop', 'org.turath.salat')
    xml = f'<?xml version="1.0" encoding="utf-8" standalone="yes" ?>\n<map><string name="lang">{lang}</string><string name="place">{place}</string><boolean name="monthu" value="true" /><boolean name="beed" value="true" /></map>\n'
    sh('shell', 'run-as org.turath.salat sh -c "mkdir -p shared_prefs && cat > shared_prefs/salat.xml"', inp=xml.encode())
    sh('shell', 'am', 'start', '-n', 'org.turath.salat/.MainActivity'); time.sleep(8)
    shot(f'{lang}_1_home')
    for i, t in enumerate(tabs[lang][1:5], 2):
        if tap_text(t):
            if i == 5:
                # turn the (emulated) compass round, so the qibla is found and lost again
                for k in range(24):
                    a = k * 15 * 3.14159 / 180
                    subprocess.run(['adb', 'emu', 'sensor', 'set', 'magnetic-field', f'{30*__import__("math").sin(a):.2f}:{30*__import__("math").cos(a):.2f}:-40'], capture_output=True)
                    time.sleep(0.4)
            shot(f'{lang}_{i}_{t}')
    cam = {'ur': 'کیمرہ', 'ar': 'الكاميرا', 'en': 'Camera'}[lang]
    if tap_text(cam): time.sleep(4); shot(f'{lang}_6_camera')
    tap_text(tabs[lang][0]); time.sleep(1)
    if tap_desc(menu[lang]): shot(f'{lang}_7_menu'); sh('shell', 'input', 'keyevent', '4'); time.sleep(1)
    subprocess.run(['adb', 'emu', 'geo', 'fix', '-79.644', '43.589'], capture_output=True)
    if tap_text(tabs[lang][5]): time.sleep(40); shot(f'{lang}_8_mosques')
    if lang == 'ur':
        for name, item in [('settings', 'ترتیبات'), ('durood', 'درود کی یاد دہانی'), ('look', 'ایپ اور ویجٹ کی شکل'), ('fasting', 'روزے، تکبیرات اور جمعہ')]:
            if from_menu(lang, item):
                shot(f'ur_9_{name}'); sh('shell', 'input', 'swipe', '540', '1800', '540', '400', '400'); shot(f'ur_9_{name}_b')
                sh('shell', 'input', 'keyevent', '4'); time.sleep(1)
        if from_menu(lang, 'آواز کا والیم'): shot('ur_9_volume'); sh('shell', 'input', 'keyevent', '4')
        tap_text('یاد دہانی'); time.sleep(1)
        if tap_desc('نئی یاد دہانی'): shot('ur_9_reminder_editor'); sh('shell', 'input', 'keyevent', '4')
        tap_text('اوقات'); time.sleep(1)
        tap_text('کیلنڈر'); time.sleep(2)
        if tap_desc('نیا واقعہ'): shot('ur_9_event_editor'); sh('shell', 'input', 'keyevent', '4')
        sh('shell', 'input', 'tap', '540', '900'); shot('ur_9_day_sheet'); sh('shell', 'input', 'keyevent', '4')
# random taps and swipes over the whole app (in English): any crash shows in the log below
sh('shell', 'am', 'force-stop', 'org.turath.salat'); sh('shell', 'am', 'start', '-n', 'org.turath.salat/.MainActivity'); time.sleep(5)
print(sh('shell', 'monkey', '-p', 'org.turath.salat', '--pct-syskeys', '0', '--pct-appswitch', '0', '--throttle', '120', '-s', '7', '3000').decode()[-1500:])
print(sh('shell', 'monkey', '-p', 'org.turath.salat', '--pct-syskeys', '0', '--pct-appswitch', '0', '--throttle', '120', '-s', '11', '3000').decode()[-1500:])
# a home-screen widget cannot be placed from adb; the widget is checked by its update code running without errors
open('shots/logcat.txt', 'wb').write(sh('logcat', '-d', '-v', 'brief', 'AndroidRuntime:E', 'salat:V', '*:S'))
print(open('shots/logcat.txt').read()[-3000:])

# the RELEASE apk (the one installed on phones): the mosque tab with a location fix, left open for 40 s, then random taps; a crash shows in logcat_release.txt
sh('logcat', '-c')
rel = 'app/build/outputs/apk/release/app-release.apk'
sh('uninstall', 'org.turath.salat')
print(sh('install', '-r', '-g', rel).decode())
xml = '<?xml version="1.0" encoding="utf-8" standalone="yes" ?>\n<map><string name="lang">en</string><string name="place">' + place + '</string></map>\n'
sh('shell', 'run-as org.turath.salat sh -c "mkdir -p shared_prefs && cat > shared_prefs/salat.xml"', inp=xml.encode())
sh('shell', 'am', 'start', '-n', 'org.turath.salat/.MainActivity'); time.sleep(6)
subprocess.run(['adb', 'emu', 'geo', 'fix', '-79.644', '43.589'], capture_output=True)
if tap_text('Mosques'): time.sleep(45); shot('rel_mosques')
print(sh('shell', 'monkey', '-p', 'org.turath.salat', '--pct-syskeys', '0', '--pct-appswitch', '0', '--throttle', '150', '-s', '5', '2000').decode()[-800:])
open('shots/logcat_release.txt', 'wb').write(sh('logcat', '-d', '-v', 'brief', 'AndroidRuntime:E', 'salat:V', '*:S'))
print(open('shots/logcat_release.txt').read()[-3000:])
