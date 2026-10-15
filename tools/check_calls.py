"""Whisper on each short call, to check it holds the phrase it is named after -> tools/check_calls.txt"""
import glob, subprocess, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel('small', device='cpu', compute_type='int8')
with open('tools/check_calls.txt', 'w') as o:
    for f in sorted(glob.glob('app/src/main/res/raw/short_*.mp3')) + ['app/src/main/res/raw/adhan_daghriri2.mp3']:
        pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
        segs, _ = m.transcribe(np.frombuffer(pcm, dtype=np.float32), language='ar', beam_size=5, initial_prompt='الله أكبر أشهد أن لا إله إلا الله حي على الصلاة الصلاة خير من النوم')
        t = ' '.join(s.text.strip() for s in segs)
        o.write(f.split('/')[-1] + '\t' + t + '\n'); print(f, t, flush=True)
