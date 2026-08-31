import os
import wave
import struct
import math
import random
import threading
import winsound

class SoundGenerator:
    """Python標準ライブラリのみでWAV音声ファイルを生成するクラス"""
    
    @staticmethod
    def generate_all(sounds_dir):
        os.makedirs(sounds_dir, exist_ok=True)
        
        files = {
            "work_end.wav": SoundGenerator.create_chime_sound,
            "break_end.wav": SoundGenerator.create_break_sound,
            "meow.wav": SoundGenerator.create_meow_sound,
            "purr_bgm.wav": SoundGenerator.create_purr_sound,
            "rain_bgm.wav": SoundGenerator.create_rain_sound,
            "forest_bgm.wav": SoundGenerator.create_forest_sound,
            "wave_bgm.wav": SoundGenerator.create_wave_sound,
            "lofi_bgm.wav": SoundGenerator.create_lofi_sound,
            "fire_bgm.wav": SoundGenerator.create_fire_sound,
            "level_up.wav": SoundGenerator.create_levelup_sound
        }
        
        for fname, func in files.items():
            path = os.path.join(sounds_dir, fname)
            if not os.path.exists(path):
                try:
                    func(path)
                except Exception as e:
                    print(f"Error generating sound {fname}: {e}")

    @staticmethod
    def _write_wav(path, samples, sample_rate=22050):
        with wave.open(path, "w") as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            
            # クリッピング防止と16bit整数化
            max_val = max(max(abs(s) for s in samples), 0.001)
            norm = 30000.0 / max_val if max_val > 30000 else 1.0
            
            data = bytearray()
            for s in samples:
                val = int(max(-32767, min(32767, s * norm)))
                data.extend(struct.pack("<h", val))
            wav_file.writeframes(data)

    @staticmethod
    def create_chime_sound(path):
        """作業終了用：優しいマリンバ/チャイム音 (C5 -> E5 -> G5 -> C6)"""
        sr = 22050
        duration = 2.0
        total_samples = int(sr * duration)
        samples = [0.0] * total_samples
        
        notes = [523.25, 659.25, 783.99, 1046.50]  # C5, E5, G5, C6
        note_dur = 0.35
        
        for idx, freq in enumerate(notes):
            start_sample = int(idx * 0.25 * sr)
            for i in range(int(sr * note_dur * 2)):
                if start_sample + i >= total_samples:
                    break
                t = i / sr
                # 減衰エンベロープ
                env = math.exp(-t * 4.0)
                # 基音 + 倍音
                val = (math.sin(2 * math.pi * freq * t) * 0.7 +
                       math.sin(4 * math.pi * freq * t) * 0.25 +
                       math.sin(6 * math.pi * freq * t) * 0.1) * env * 15000
                samples[start_sample + i] += val
                
        SoundGenerator._write_wav(path, samples, sr)

    @staticmethod
    def create_break_sound(path):
        """休憩終了用：爽やかなベル音 (G5 -> C6 -> E6)"""
        sr = 22050
        duration = 1.8
        total_samples = int(sr * duration)
        samples = [0.0] * total_samples
        
        notes = [783.99, 1046.50, 1318.51]  # G5, C6, E6
        for idx, freq in enumerate(notes):
            start_sample = int(idx * 0.22 * sr)
            for i in range(int(sr * 0.8)):
                if start_sample + i >= total_samples:
                    break
                t = i / sr
                env = math.exp(-t * 3.5)
                val = (math.sin(2 * math.pi * freq * t) * 0.6 +
                       math.sin(3 * math.pi * freq * t) * 0.3 +
                       math.sin(5 * math.pi * freq * t) * 0.15) * env * 16000
                samples[start_sample + i] += val
                
        SoundGenerator._write_wav(path, samples, sr)

    @staticmethod
    def create_meow_sound(path):
        """可愛い猫の鳴き声 (ニャー音 / ピッチ変調とフォルマント近似)"""
        sr = 22050
        duration = 0.55
        total_samples = int(sr * duration)
        samples = [0.0] * total_samples
        
        for i in range(total_samples):
            t = i / sr
            # ピッチカーブ: 550Hzから上がって800Hzへ、そして500Hzへ下降
            if t < 0.2:
                pitch = 500 + 400 * math.sin((t / 0.2) * (math.pi / 2))
            else:
                pitch = 900 - 450 * ((t - 0.2) / 0.35)
                
            # エンベロープ
            if t < 0.05:
                env = t / 0.05
            else:
                env = math.exp(-(t - 0.05) * 3.5)
                
            # 母音感を持たせるための複数ハーモニクス
            val = (math.sin(2 * math.pi * pitch * t) * 0.5 +
                   math.sin(4 * math.pi * pitch * t) * 0.35 +
                   math.sin(6 * math.pi * pitch * t) * 0.15 +
                   math.sin(8 * math.pi * pitch * t) * 0.1) * env * 18000
            samples[i] = val
            
        SoundGenerator._write_wav(path, samples, sr)

    @staticmethod
    def create_purr_sound(path):
        """猫のゴロゴロ音 (低周波パルス変調・2.5秒ループ)"""
        sr = 22050
        duration = 2.5
        total_samples = int(sr * duration)
        samples = [0.0] * total_samples
        
        for i in range(total_samples):
            t = i / sr
            purr_rate = 24.0
            pulse = (math.sin(2 * math.pi * purr_rate * t) + 1.0) * 0.5
            pulse = math.pow(pulse, 2.0)
            
            base = (math.sin(2 * math.pi * 75 * t) * 0.6 +
                    math.sin(2 * math.pi * 110 * t) * 0.3 +
                    (random.random() * 2 - 1) * 0.1)
                    
            val = base * pulse * 14000
            samples[i] = val
            
        SoundGenerator._write_wav(path, samples, sr)

    @staticmethod
    def create_rain_sound(path):
        """静かな雨の音 (ピンクノイズフィルタリング・3秒ループ)"""
        sr = 22050
        duration = 3.0
        total_samples = int(sr * duration)
        samples = [0.0] * total_samples
        
        last_out = 0.0
        for i in range(total_samples):
            white = (random.random() * 2.0 - 1.0)
            last_out = last_out * 0.88 + white * 0.12
            lfo = 1.0 + 0.15 * math.sin(2 * math.pi * 0.5 * (i / sr))
            samples[i] = last_out * lfo * 16000
            
        SoundGenerator._write_wav(path, samples, sr)

    @staticmethod
    def create_levelup_sound(path):
        """ファンファーレ / レベルアップ・タスク完了音"""
        sr = 22050
        duration = 1.2
        total_samples = int(sr * duration)
        samples = [0.0] * total_samples
        
        notes = [523.25, 659.25, 783.99, 1046.50]  # C, E, G, High C
        for idx, freq in enumerate(notes):
            start_sample = int(idx * 0.12 * sr)
            dur = 0.5 if idx == 3 else 0.2
            for i in range(int(sr * dur)):
                if start_sample + i >= total_samples:
                    break
                t = i / sr
                env = math.exp(-t * (3.0 if idx == 3 else 6.0))
                val = (math.sin(2 * math.pi * freq * t) * 0.7 +
                       math.sin(4 * math.pi * freq * t) * 0.3) * env * 17000
                samples[start_sample + i] += val
                
        SoundGenerator._write_wav(path, samples, sr)

    @staticmethod
    def create_forest_sound(path):
        """森の鳥のさえずりと風の音 (心地よい自然音)"""
        sr = 22050
        duration = 6.0
        total_samples = int(sr * duration)
        samples = [0.0] * total_samples
        
        # 優しい風のホワイトノイズ
        for i in range(total_samples):
            t = i / sr
            wind = (random.random() * 2 - 1) * (0.15 + 0.1 * math.sin(2 * math.pi * 0.2 * t))
            samples[i] = wind * 2500
            
        # 鳥のさえずり（ピピピッ、チチチッ）
        bird_times = [0.5, 1.8, 3.2, 4.5]
        for bt in bird_times:
            start_i = int(bt * sr)
            base_f = random.choice([2600, 3100, 3500])
            chirp_len = int(0.25 * sr)
            for j in range(chirp_len):
                if start_i + j >= total_samples:
                    break
                tj = j / sr
                freq = base_f + math.sin(tj * 60) * 800
                env = math.sin(math.pi * (j / chirp_len)) ** 2
                samples[start_i + j] += math.sin(2 * math.pi * freq * tj) * env * 8000
                
        SoundGenerator._write_wav(path, samples, sr)

    @staticmethod
    def create_wave_sound(path):
        """穏やかな波の音 (周期的なピンクノイズの押し寄せと引き)"""
        sr = 22050
        duration = 6.0
        total_samples = int(sr * duration)
        samples = [0.0] * total_samples
        
        last_val = 0.0
        for i in range(total_samples):
            t = i / sr
            # 6秒周期の波のうねり
            wave_mod = (math.sin(2 * math.pi * (t / 5.0) - math.pi/2) + 1.0) / 2.0
            white = random.random() * 2 - 1
            last_val = (last_val * 0.96) + (white * 0.04) # ローパスフィルター
            samples[i] = last_val * wave_mod * 16000
            
        SoundGenerator._write_wav(path, samples, sr)

    @staticmethod
    def create_lofi_sound(path):
        """Lo-Fi チルピアノ (Cmaj7 -> Am7 -> Dm7 -> G7 の温かいピアノコード進行 + レコードノイズ)"""
        sr = 22050
        duration = 8.0
        total_samples = int(sr * duration)
        samples = [0.0] * total_samples
        
        # 4つのコード (周波数Hz)
        chords = [
            [261.63, 329.63, 392.00, 493.88],  # Cmaj7 (C4, E4, G4, B4)
            [220.00, 261.63, 329.63, 392.00],  # Am7 (A3, C4, E4, G4)
            [293.66, 349.23, 440.00, 523.25],  # Dm7 (D4, F4, A4, C5)
            [196.00, 246.94, 293.66, 349.23]   # G7 (G3, B3, D4, F4)
        ]
        
        for c_idx, chord in enumerate(chords):
            c_start = int(c_idx * 2.0 * sr)
            for freq in chord:
                for j in range(int(1.9 * sr)):
                    if c_start + j >= total_samples:
                        break
                    tj = j / sr
                    # ピアノの減衰エンベロープ
                    env = math.exp(-tj * 1.8) * 0.25
                    # 暖かみのある三角波+正弦波
                    val = (math.sin(2 * math.pi * freq * tj) * 0.7 + math.sin(4 * math.pi * freq * tj) * 0.2) * env * 14000
                    samples[c_start + j] += val

        # レコードのプチプチノイズ (Vinyl crackle)
        for i in range(total_samples):
            if random.random() < 0.003:
                samples[i] += (random.random() * 2 - 1) * 6000
                
        SoundGenerator._write_wav(path, samples, sr)

    @staticmethod
    def create_fire_sound(path):
        """焚き火の音 (パチパチ爆ぜる木と暖炉の温かな低音)"""
        sr = 22050
        duration = 6.0
        total_samples = int(sr * duration)
        samples = [0.0] * total_samples
        
        last_val = 0.0
        for i in range(total_samples):
            # 低音の暖炉の風
            white = random.random() * 2 - 1
            last_val = (last_val * 0.95) + (white * 0.05)
            samples[i] = last_val * 7000
            
            # 木のパチパチ音 (Crackle / Pop)
            if random.random() < 0.008:
                pop_len = random.randint(10, 40)
                pop_amp = random.uniform(8000, 22000)
                for k in range(pop_len):
                    if i + k < total_samples:
                        samples[i + k] += (random.random() * 2 - 1) * pop_amp * (1.0 - k / pop_len)
                        
        SoundGenerator._write_wav(path, samples, sr)


class SoundManager:
    """サウンドの再生・環境音BGMループ制御を行うマネージャ"""
    
    def __init__(self, sounds_dir=None):
        if sounds_dir is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            sounds_dir = os.path.join(base_dir, "sounds")
        self.sounds_dir = sounds_dir
        SoundGenerator.generate_all(self.sounds_dir)
        
        self.se_enabled = True
        self.current_bgm = "none"
        self._bgm_thread = None
        self._bgm_stop_event = threading.Event()

    def play_se(self, sound_name):
        """効果音を非同期再生 (例: 'meow', 'work_end', 'break_end', 'level_up')"""
        if not self.se_enabled:
            return
            
        path = os.path.join(self.sounds_dir, f"{sound_name}.wav")
        if os.path.exists(path):
            try:
                winsound.PlaySound(path, winsound.SND_ASYNC | winsound.SND_FILENAME)
            except Exception as e:
                print(f"Error playing SE {sound_name}: {e}")

    def set_bgm(self, bgm_type):
        """BGMを設定 ('none', 'rain', 'purr', 'forest', 'wave', 'lofi', 'fire')"""
        if self.current_bgm == bgm_type:
            return
            
        self.stop_bgm()
        self.current_bgm = bgm_type
        
        bgm_map = {
            "rain": "rain_bgm.wav",
            "purr": "purr_bgm.wav",
            "forest": "forest_bgm.wav",
            "wave": "wave_bgm.wav",
            "lofi": "lofi_bgm.wav",
            "fire": "fire_bgm.wav"
        }
        
        if bgm_type in bgm_map:
            self._start_bgm_loop(os.path.join(self.sounds_dir, bgm_map[bgm_type]))

    def _start_bgm_loop(self, wav_path):
        if not os.path.exists(wav_path):
            return
            
        self._bgm_stop_event.clear()
        
        def _loop():
            try:
                winsound.PlaySound(wav_path, winsound.SND_ASYNC | winsound.SND_LOOP | winsound.SND_FILENAME)
            except Exception as e:
                print("BGM error:", e)

        self._bgm_thread = threading.Thread(target=_loop, daemon=True)
        self._bgm_thread.start()

    def stop_bgm(self):
        """BGMを停止"""
        self._bgm_stop_event.set()
        try:
            winsound.PlaySound(None, winsound.SND_PURGE)
        except Exception:
            pass
        self.current_bgm = "none"
