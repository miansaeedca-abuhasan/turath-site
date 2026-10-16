"""What is said in the recordings the owner sent (tools/incoming/*): Arabic speech to text with timings -> tools/incoming_log.txt"""
import glob
from faster_whisper import WhisperModel
m = WhisperModel('small', device='cpu', compute_type='int8')
with open('tools/incoming_log.txt', 'w') as o:
    for f in sorted(glob.glob('tools/incoming/*')):
        segs, info = m.transcribe(f, language='ar', vad_filter=False, word_timestamps=False)
        o.write(f'== {f} ({info.duration:.1f}s)\n')
        for s in segs: o.write(f'{s.start:7.2f}-{s.end:7.2f} {s.text}\n')
        o.flush()
