"""On the CI emulator: for every release copy of the app (shrunk / not shrunk) open Qibla -> Camera and take a screenshot,
so a black camera picture shows here and not only on a phone. Output: shots/cam_<name>.png and shots/cam_<name>.log"""
import subprocess, time, re, os, json, glob
os.makedirs('shots', exist_ok=True)
def sh(*a, inp=None): return subprocess.run(['adb', *a], input=inp, capture_output=True).stdout
def tap_text(t):
    sh('shell', 'uiautomator', 'dump', '/sdcard/ui.xml'); x = sh('shell', 'cat', '/sdcard/ui.xml').decode('utf-8', 'ignore')
    ms = list(re.finditer(r'text="' + re.escape(t) + r'"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', x))
    if not ms: print('not found', t); return False
    a, b, c, d = max((tuple(map(int, m.groups())) for m in ms), key=lambda q: q[1])
    sh('shell', 'input', 'tap', str((a + c) // 2), str((b + d) // 2)); return True
place = json.dumps({"n": "Mississauga", "c": "CA", "lat": 43.589, "lng": -79.644, "tz": "America/Toronto"}).replace('"', '&quot;')
xml = '<?xml version="1.0" encoding="utf-8" standalone="yes" ?>\n<map><string name="lang">en</string><string name="place">' + place + '</string></map>\n'
for apk in sorted(glob.glob('/tmp/variants/*.apk')):
    name = os.path.basename(apk)[:-4]
    sh('uninstall', 'org.turath.salat'); sh('logcat', '-c')
    print(name, sh('install', '-r', '-g', apk).decode().strip())
    sh('shell', 'am', 'start', '-n', 'org.turath.salat/.MainActivity'); time.sleep(4)
    sh('shell', 'am', 'force-stop', 'org.turath.salat')
    sh('shell', 'run-as org.turath.salat sh -c "mkdir -p shared_prefs && cat > shared_prefs/salat.xml"', inp=xml.encode())
    sh('shell', 'am', 'start', '-n', 'org.turath.salat/.MainActivity'); time.sleep(7)
    tap_text('Qibla'); time.sleep(2)
    tap_text('Camera'); time.sleep(8)
    open(f'shots/cam_{name}.png', 'wb').write(sh('exec-out', 'screencap', '-p'))
    open(f'shots/cam_{name}.log', 'wb').write(sh('logcat', '-d', '-v', 'brief', '*:W'))
