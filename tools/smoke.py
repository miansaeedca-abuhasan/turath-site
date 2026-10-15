"""On the CI emulator: install the app, give it a city, open every tab in Urdu / Arabic / English and take screenshots
(shots/*.png) plus the crash log, so the build can be checked without a phone."""
import subprocess, time, re, os, json
os.makedirs('shots', exist_ok=True)
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
tabs = {'ur': ['آج', 'اوقات', 'یاد دہانی', 'کیلنڈر', 'قبلہ و مساجد'], 'ar': ['اليوم', 'المواقيت', 'التنبيهات', 'التقويم', 'القبلة والمساجد'], 'en': ['Today', 'Times', 'Reminders', 'Calendar', 'Qibla']}
place = json.dumps({"n": "Mississauga", "c": "CA", "lat": 43.589, "lng": -79.644, "tz": "America/Toronto"}).replace('"', '&quot;')
for lang in ['ur', 'ar', 'en']:
    sh('shell', 'am', 'force-stop', 'org.turath.salat')
    xml = f'<?xml version="1.0" encoding="utf-8" standalone="yes" ?>\n<map><string name="lang">{lang}</string><string name="place">{place}</string><boolean name="monthu" value="true" /><boolean name="beed" value="true" /></map>\n'
    sh('shell', 'run-as org.turath.salat sh -c "mkdir -p shared_prefs && cat > shared_prefs/salat.xml"', inp=xml.encode())
    sh('shell', 'am', 'start', '-n', 'org.turath.salat/.MainActivity'); time.sleep(8)
    shot(f'{lang}_1_home')
    sh('shell', 'input', 'swipe', '540', '1800', '540', '500', '400'); shot(f'{lang}_1b_home_scrolled')
    for i, t in enumerate(tabs[lang][1:], 2):
        if tap_text(t): shot(f'{lang}_{i}_{t}')
    mq = {'ur': 'قریبی مساجد', 'ar': 'المساجد القريبة', 'en': 'Mosques nearby'}[lang]
    if tap_text(mq): time.sleep(35); shot(f'{lang}_7_mosques')
    if lang == 'ur':
        tap_text(tabs[lang][0]); time.sleep(2)
        sh('shell', 'uiautomator', 'dump', '/sdcard/ui.xml'); x = sh('shell', 'cat', '/sdcard/ui.xml').decode('utf-8', 'ignore')
        m = re.search(r'content-desc="ترتیبات"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', x)
        if m:
            a, b, c, d = map(int, m.groups()); sh('shell', 'input', 'tap', str((a + c) // 2), str((b + d) // 2)); shot('ur_6_settings')
            sh('shell', 'input', 'swipe', '540', '1800', '540', '400', '400'); shot('ur_6b_settings')
            sh('shell', 'input', 'keyevent', '4')
# a home-screen widget cannot be placed from adb; the widget is checked by its update code running without errors
open('shots/logcat.txt', 'wb').write(sh('logcat', '-d', '-v', 'brief', 'AndroidRuntime:E', 'salat:V', '*:S'))
print(open('shots/logcat.txt').read()[-3000:])
