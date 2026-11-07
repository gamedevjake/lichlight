#!/usr/bin/env python3
"""Measure swing-whoosh waveform onsets. Read-only. Does not rewrite assets."""
import json
import math
import os
import struct
import wave

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SFX = os.path.join(ROOT, 'assets', 'sfx')
FILES = [
    'player_swing_light_01.wav',
    'player_swing_light_02.wav',
    'player_swing_light_03.wav',
    'player_swing_light_04.wav',
    'player_swing_heavy_01.wav',
    'player_swing_heavy_02.wav',
    'player_swing_heavy_03.wav',
]


def db(x):
    if x <= 1e-12:
        return -120.0
    return 20.0 * math.log10(x)


def load(path):
    with wave.open(path, 'rb') as w:
        ch = w.getnchannels()
        sw = w.getsampwidth()
        rate = w.getframerate()
        n = w.getnframes()
        raw = w.readframes(n)
    if sw != 2:
        raise SystemExit('expected 16-bit wav: ' + path)
    count = n * ch
    samples = struct.unpack('<' + 'h' * count, raw)
    if ch == 1:
        mono = [s / 32768.0 for s in samples]
    else:
        mono = []
        for i in range(n):
            acc = 0.0
            for c in range(ch):
                acc += samples[i * ch + c]
            mono.append(acc / ch / 32768.0)
    return rate, ch, mono


def first_sample(mono, rate, thresh_db):
    thr = 10 ** (thresh_db / 20.0)
    for i, s in enumerate(mono):
        if abs(s) > thr:
            return i / rate * 1000.0
    return None


def rms_windows(mono, rate, win_ms, hop_ms):
    win = max(1, int(rate * win_ms / 1000.0))
    hop = max(1, int(rate * hop_ms / 1000.0))
    out = []
    i = 0
    while i + win <= len(mono):
        acc = 0.0
        for s in mono[i:i + win]:
            acc += s * s
        out.append((i / rate * 1000.0, math.sqrt(acc / win)))
        i += hop
    return out


def first_rms(windows, thresh_db):
    thr = 10 ** (thresh_db / 20.0)
    for t, r in windows:
        if r > thr:
            return t
    return None


def analyze(name):
    rate, ch, mono = load(os.path.join(SFX, name))
    peak = max(abs(s) for s in mono) if mono else 0
    peak_i = max(range(len(mono)), key=lambda i: abs(mono[i])) if mono else 0
    w5 = rms_windows(mono, rate, 5, 1)
    w10 = rms_windows(mono, rate, 10, 2)
    peak_rms = max(w10, key=lambda p: p[1]) if w10 else (0, 0)
    # envelope: mean RMS in bands
    bands = [(0, 10), (10, 20), (20, 40), (40, 80), (80, 160), (160, 320), (320, 1000)]
    env = []
    for a, b in bands:
        chunk = [s for t, s in ((i / rate * 1000.0, mono[i]) for i in range(len(mono))) if a <= t < b]
        if not chunk:
            continue
        acc = sum(s * s for s in chunk) / len(chunk)
        env.append({'ms': [a, b], 'rms_db': round(db(math.sqrt(acc)), 2)})
    return {
        'file': name,
        'rate': rate,
        'channels': ch,
        'samples': len(mono),
        'duration_ms': round(len(mono) / rate * 1000.0, 2),
        'peak_dbfs': round(db(peak), 2),
        'peak_ms': round(peak_i / rate * 1000.0, 2),
        'first_sample_minus40_ms': None if first_sample(mono, rate, -40) is None else round(first_sample(mono, rate, -40), 2),
        'first_sample_minus30_ms': None if first_sample(mono, rate, -30) is None else round(first_sample(mono, rate, -30), 2),
        'first_sample_minus20_ms': None if first_sample(mono, rate, -20) is None else round(first_sample(mono, rate, -20), 2),
        'rms5_minus40_ms': None if first_rms(w5, -40) is None else round(first_rms(w5, -40), 2),
        'rms5_minus30_ms': None if first_rms(w5, -30) is None else round(first_rms(w5, -30), 2),
        'rms5_minus20_ms': None if first_rms(w5, -20) is None else round(first_rms(w5, -20), 2),
        'rms10_peak_ms': round(peak_rms[0], 2),
        'rms10_peak_dbfs': round(db(peak_rms[1]), 2),
        'envelope_rms_db': env,
    }


def main():
    rows = [analyze(n) for n in FILES]
    print(json.dumps(rows, indent=2))


if __name__ == '__main__':
    main()
