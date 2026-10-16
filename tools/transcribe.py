"""What is said in the recordings the owner sent (tools/incoming/*): Arabic speech to text with timings -> tools/incoming_log.txt"""
import glob, subprocess, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel('small', device='cpu', compute_type='int8')
with open('tools/incoming_log.txt', 'w') as o:
    for f in sorted(glob.glob('tools/incoming/*')):
        pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
        audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
        segs, info = m.transcribe(audio, language='ar', vad_filter=False, word_timestamps=False)
        o.write(f'== {f} ({info.duration:.1f}s)\n')
        for s in segs: o.write(f'{s.start:7.2f}-{s.end:7.2f} {s.text}\n')
        o.flush()
