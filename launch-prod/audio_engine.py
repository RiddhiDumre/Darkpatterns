import os
import subprocess
import numpy as np
import wave

SR = 48000
DURATION = 16.0
TOTAL_SAMPLES = int(SR * DURATION)

def synthesize_sfx():
    sfx_left = np.zeros(TOTAL_SAMPLES, dtype=np.float32)
    sfx_right = np.zeros(TOTAL_SAMPLES, dtype=np.float32)

    def add_sound(t_start, sig_l, sig_r=None):
        if sig_r is None:
            sig_r = sig_l
        idx = int(t_start * SR)
        n = min(len(sig_l), TOTAL_SAMPLES - idx)
        if n > 0 and idx >= 0:
            sfx_left[idx:idx+n] += sig_l[:n]
            sfx_right[idx:idx+n] += sig_r[:n]

    def make_click(duration=0.035):
        t = np.linspace(0, duration, int(SR * duration), endpoint=False)
        sig = np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 220) + np.sin(2 * np.pi * 4400 * t) * np.exp(-t * 350) * 0.4
        return sig * 0.7

    def make_whoosh(duration=0.4, f0=250, f1=1400):
        t = np.linspace(0, duration, int(SR * duration), endpoint=False)
        freq = np.linspace(f0, f1, len(t))
        tone = np.sin(2 * np.pi * freq * t) * (np.sin(np.pi * t / duration) ** 2)
        noise = np.random.normal(0, 0.18, len(t)) * (np.sin(np.pi * t / duration) ** 2)
        return (tone * 0.4 + noise * 0.5) * 0.8

    def make_sonar(duration=0.6, freq=1760):
        t = np.linspace(0, duration, int(SR * duration), endpoint=False)
        sig = np.sin(2 * np.pi * freq * t) * np.exp(-t * 8) + np.sin(2 * np.pi * (freq * 1.5) * t) * np.exp(-t * 12) * 0.3
        return sig * 0.45

    def make_riser(duration=1.2, f0=180, f1=1200):
        t = np.linspace(0, duration, int(SR * duration), endpoint=False)
        freq = f0 * ((f1 / f0) ** (t / duration))
        phase = 2 * np.pi * np.cumsum(freq) / SR
        env = (t / duration) ** 1.8
        sig = np.sin(phase) * env * 0.4
        noise = np.random.normal(0, 0.15, len(t)) * env * 0.3
        return sig + noise

    def make_drop_slam(duration=1.2):
        t = np.linspace(0, duration, int(SR * duration), endpoint=False)
        # 808 sub kick
        sub_freq = 130 * np.exp(-t * 6.0) + 42
        sub_phase = 2 * np.pi * np.cumsum(sub_freq) / SR
        sub = np.sin(sub_phase) * np.exp(-t * 3.0) * 1.2
        # Transient click/zap
        zap = np.sin(2 * np.pi * 3200 * np.exp(-t * 35) * t) * np.exp(-t * 40) * 0.8
        # Glass alarm chime
        chime = (np.sin(2 * np.pi * 1046.5 * t) * np.exp(-t * 4) +
                 np.sin(2 * np.pi * 2093.0 * t) * np.exp(-t * 6) * 0.5) * 0.5
        return sub + zap + chime

    def make_tick(freq=2800, duration=0.02):
        t = np.linspace(0, duration, int(SR * duration), endpoint=False)
        return np.sin(2 * np.pi * freq * t) * np.exp(-t * 350) * 0.5

    def make_staccato_hit(freq=350, duration=0.45):
        t = np.linspace(0, duration, int(SR * duration), endpoint=False)
        thump = np.sin(2 * np.pi * (freq * np.exp(-t * 8) + 55) * t) * np.exp(-t * 7) * 0.9
        edge = np.sin(2 * np.pi * (freq * 3.2) * t) * np.exp(-t * 18) * 0.4
        return thump + edge

    def make_toggle_snap(duration=0.15):
        t = np.linspace(0, duration, int(SR * duration), endpoint=False)
        p1 = np.sin(2 * np.pi * 900 * t) * np.exp(-t * 60)
        p2 = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90) * 0.5
        return (p1 + p2) * 0.7

    def make_clean_bell(duration=1.6):
        t = np.linspace(0, duration, int(SR * duration), endpoint=False)
        # Major pentatonic harmony (C6, E6, G6)
        c6 = np.sin(2 * np.pi * 1046.50 * t) * np.exp(-t * 2.5) * 0.5
        e6 = np.sin(2 * np.pi * 1318.51 * t) * np.exp(-t * 2.8) * 0.4
        g6 = np.sin(2 * np.pi * 1567.98 * t) * np.exp(-t * 3.2) * 0.35
        c7 = np.sin(2 * np.pi * 2093.00 * t) * np.exp(-t * 4.0) * 0.2
        return c6 + e6 + g6 + c7

    def make_logo_slam(duration=1.8):
        t = np.linspace(0, duration, int(SR * duration), endpoint=False)
        sub = np.sin(2 * np.pi * (100 * np.exp(-t * 4) + 36) * t) * np.exp(-t * 2.2) * 1.1
        top = np.sin(2 * np.pi * 880 * t) * np.exp(-t * 5) * 0.4 + np.sin(2 * np.pi * 1760 * t) * np.exp(-t * 7) * 0.2
        return sub + top

    # Place cues along the beat timeline
    # 0.8s: User clicks specimen
    add_sound(0.80, make_click(0.04))
    add_sound(0.85, make_whoosh(0.35, 300, 900))

    # 2.0s: Radar initialization
    add_sound(2.00, make_sonar(0.5, 1500))
    add_sound(3.00, make_sonar(0.5, 1800))

    # 4.8s - 5.95s: Rising snare & frequency roll into the drop
    add_sound(4.80, make_riser(1.18, 150, 1100))
    for t_snare in [4.8, 5.1, 5.35, 5.55, 5.7, 5.82, 5.92]:
        add_sound(t_snare, make_click(0.02) * 0.6)

    # 6.00s: THE DROP (Beat 12)
    add_sound(6.00, make_drop_slam(1.4))

    # 7.4s - 8.3s: Severity slider ratchet notch ticks
    slider_times = [7.35, 7.55, 7.72, 7.86, 7.98, 8.08, 8.16, 8.24, 8.30]
    for i, st in enumerate(slider_times):
        f = 1600 + i * 220
        add_sound(st, make_tick(f, 0.025))

    # 9.0s, 9.7s, 10.4s: Deceptive tactics staccato strikes
    add_sound(9.00, make_staccato_hit(420, 0.45))
    add_sound(9.70, make_staccato_hit(480, 0.45))
    add_sound(10.40, make_staccato_hit(560, 0.45))

    # 11.45s: Ethical fix toggle snap
    add_sound(11.45, make_toggle_snap(0.2))

    # 12.6s - 13.6s: Odometer rolling down
    odo_times = np.linspace(12.6, 13.6, 14)
    for i, ot in enumerate(odo_times):
        add_sound(ot, make_tick(2200 - i * 40, 0.02) * 0.4)

    # 14.00s: Certified Honest UX bell
    bell = make_clean_bell(1.8)
    add_sound(14.00, bell * 0.9, bell * 0.85)

    # 15.00s: Final Logo Slam
    slam = make_logo_slam(1.8)
    add_sound(15.00, slam * 1.0, slam * 0.95)

    return sfx_left, sfx_right

def main():
    music_src = os.path.expanduser("~/.gemini/config/skills/brag/assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3")
    work_dir = "/Users/riddhidumre/Desktop/Brain Dump/Week chalenge/dark patterns/launch-prod"
    raw_music_path = os.path.join(work_dir, "raw_music.wav")

    # Extract 16s starting at 3.012s (exact downbeat)
    cmd = [
        "ffmpeg", "-y",
        "-ss", "3.012",
        "-t", str(DURATION),
        "-i", music_src,
        "-ar", str(SR),
        "-ac", "2",
        raw_music_path
    ]
    subprocess.check_call(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Read extracted music
    with wave.open(raw_music_path, "rb") as wf:
        nframes = wf.getnframes()
        data = np.frombuffer(wf.readframes(nframes), dtype=np.int16).reshape(-1, 2)
        music_l = (data[:, 0] / 32768.0).astype(np.float32)
        music_r = (data[:, 1] / 32768.0).astype(np.float32)

    # Pad or trim to TOTAL_SAMPLES
    if len(music_l) < TOTAL_SAMPLES:
        pad = TOTAL_SAMPLES - len(music_l)
        music_l = np.pad(music_l, (0, pad))
        music_r = np.pad(music_r, (0, pad))
    else:
        music_l = music_l[:TOTAL_SAMPLES]
        music_r = music_r[:TOTAL_SAMPLES]

    # Synthesize SFX
    sfx_l, sfx_r = synthesize_sfx()

    # Mix according to Chan's direction: music * 0.52 + sfx * 0.65
    mix_l = music_l * 0.52 + sfx_l * 0.65
    mix_r = music_r * 0.52 + sfx_r * 0.65

    # Clean 0.3s fade-out at the very end (15.7s to 16.0s)
    fade_len = int(0.3 * SR)
    fade_curve = np.linspace(1.0, 0.0, fade_len) ** 2
    mix_l[-fade_len:] *= fade_curve
    mix_r[-fade_len:] *= fade_curve

    # Peak normalization to 0.93 (-0.6 dBTP)
    max_peak = max(np.max(np.abs(mix_l)), np.max(np.abs(mix_r)))
    if max_peak > 0:
        gain = 0.93 / max_peak
        mix_l *= gain
        mix_r *= gain

    # Convert to 16-bit PCM
    out_l = (mix_l * 32767).clip(-32768, 32767).astype(np.int16)
    out_r = (mix_r * 32767).clip(-32768, 32767).astype(np.int16)
    stereo = np.empty((TOTAL_SAMPLES, 2), dtype=np.int16)
    stereo[:, 0] = out_l
    stereo[:, 1] = out_r

    master_path = os.path.join(work_dir, "master_audio.wav")
    with wave.open(master_path, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(stereo.tobytes())

    print(f"Master audio track generated successfully: {master_path}")

if __name__ == "__main__":
    main()
