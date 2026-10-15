"""Where each phrase of the adhan is in each recording (to cut short calls for alarms): faster-whisper with word
times, plus the pauses (ffmpeg silencedetect) -> tools/adhan_words.json"""
import json, glob, subprocess, re
from faster_whisper import WhisperModel
m = WhisperModel('small', device='cpu', compute_type='int8')
res = {}
for f in sorted(glob.glob('app/src/main/res/raw/adhan_*.mp3')):
    import numpy as np
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
    segs, _ = m.transcribe(np.frombuffer(pcm, dtype=np.float32), language='ar', word_timestamps=True, vad_filter=False, beam_size=5)
    words = [(round(w.start, 2), round(w.end, 2), w.word) for s in segs for w in (s.words or [])]
    sil = subprocess.run(['ffmpeg', '-i', f, '-af', 'silencedetect=noise=-38dB:d=0.8', '-f', 'null', '-'], capture_output=True, text=True).stderr
    pauses = [float(x) for x in re.findall(r'silence_(?:start|end): ([0-9.]+)', sil)]
    res[f.split('/')[-1]] = {'words': words, 'pauses': pauses}
    print(f, len(words))
json.dump(res, open('tools/adhan_words.json', 'w'), ensure_ascii=False, indent=0)
