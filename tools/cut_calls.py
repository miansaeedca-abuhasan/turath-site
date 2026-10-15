"""Short calls for alarms, cut from the adhans in res/raw at the phrase times found by tools/adhan_words.py (Whisper word
times and the pauses); each cut edge moved to the quietest moment nearby, with short fades."""
import subprocess, numpy as np, sys
R = 'app/src/main/res/raw/'
# name: (adhan file, approximate start, approximate end)
CUTS = {
    'short_takbir': ('adhan_makkah', 0.0, 11.3), 'short_shahada': ('adhan_makkah', 30.2, 42.6), 'short_hayya': ('adhan_makkah', 105.6, 116.3),
    'short_khayr_mulla': ('adhan_makkah_fajr', 172.3, 185.1),
    'short_shahada_bukhari': ('adhan_madinah_fajr', 44.2, 60.5), 'short_hayya_bukhari': ('adhan_madinah_fajr', 137.5, 150.0),
    'short_khayr_bukhari': ('adhan_madinah_fajr', 213.5, 234.0),
    'short_shahada_nabet': ('adhan_nabet', 27.1, 40.6), 'short_hayya_nabet': ('adhan_nabet', 95.5, 110.7),
    'short_shahada_maghribi': ('adhan_maghribi', 34.8, 44.1), 'short_hayya_maghribi': ('adhan_maghribi', 96.1, 102.4),
    'short_shahada_basit': ('adhan_basit', 38.0, 45.8), 'short_hayya_basit': ('adhan_basit', 106.4, 116.0),
    'short_shahada_daghriri': ('adhan_daghriri', 31.5, 46.5), 'short_hayya_daghriri': ('adhan_daghriri', 94.5, 111.5),
}
def pcm(f):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', R + f + '.mp3', '-ac', '1', '-ar', '8000', '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(b, dtype=np.float32)
def quiet(x, t, lo, hi):          # the quietest 50 ms between t+lo and t+hi
    sr, w = 8000, 400
    best, at = 9e9, t
    for s in np.arange(max(0, t + lo), t + hi, 0.05):
        i = int(s * sr); e = float(np.sqrt(np.mean(x[i:i + w] ** 2))) if i + w < len(x) else 9e9
        if e < best: best, at = e, s
    return at
cache = {}
for name, (src, a, b) in CUTS.items():
    x = cache.setdefault(src, pcm(src))
    s = quiet(x, a, -1.2, 0.4); e = quiet(x, b, -0.6, 1.5)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '%.2f' % s, '-to', '%.2f' % e, '-i', R + src + '.mp3', '-ac', '1', '-ar', '44100', '-b:a', '48k',
                    '-af', 'afade=t=in:d=0.12,afade=t=out:st=%.2f:d=0.5' % max(0, e - s - 0.5), R + name + '.mp3'], check=True)
    print('%-26s %-20s %6.1f-%6.1f  (%.1f s)' % (name, src, s, e, e - s))
