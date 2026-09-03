import tkinter as tk
from tkinter import ttk, messagebox
import json

from ui.utils import FONT_MAIN, FONT_BOLD, FONT_SUB, FONT_TEXT
from data_manager import THEMES

class SettingsTab:
    def __init__(self, app):
        self.app = app
        
        tab = tk.Frame(self.app.content_frame, bg=self.app.theme["bg"])
        self.app.tabs["settings"] = tab
        
        self.settings_card = tk.Frame(tab, bg=self.app.theme["card"], padx=15, pady=15, relief="groove", bd=1)
        self.settings_card.pack(fill='both', expand=True, pady=5)
        
        self.settings_title = tk.Label(self.settings_card, text="⚙️ ポモドーロ & サウンド & テーマ設定", font=FONT_SUB, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.settings_title.pack(anchor='w', pady=(0, 10))
        
        self.settings_theme_lbl = tk.Label(self.settings_card, text="🎨 アプリのテーマカラー", font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.settings_theme_lbl.pack(anchor='w', pady=(5, 4))
        
        self.theme_frame = tk.Frame(self.settings_card, bg=self.app.theme["card"])
        self.theme_frame.pack(fill='x', pady=2)
        
        cur_theme_key = self.app.data_mgr.get_setting("theme")
        self.theme_var = tk.StringVar(value=cur_theme_key)
        
        self.theme_combo = ttk.Combobox(self.theme_frame, textvariable=self.theme_var, values=[f"{k} ({v['name']})" for k, v in THEMES.items()], state="readonly", width=26, font=FONT_TEXT)
        for opt in self.theme_combo["values"]:
            if opt.startswith(cur_theme_key):
                self.theme_combo.set(opt)
                break
        self.theme_combo.pack(side='left', padx=(0, 8))
        
        def on_theme_change():
            t_key = self.theme_var.get().split()[0]
            self.app.apply_theme(t_key)
            messagebox.showinfo("テーマ変更", f"テーマを「{THEMES[t_key]['name']}」に変更しました！")
            
        self.theme_apply_btn = tk.Button(self.theme_frame, text="適用 🎨", font=FONT_BOLD, bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"], relief="flat", padx=8, pady=2, cursor="hand2", command=on_theme_change)
        self.theme_apply_btn.pack(side='left')

        # 時間設定グリッド
        self.grid_frame = tk.Frame(self.settings_card, bg=self.app.theme["card"])
        self.grid_frame.pack(fill='x', pady=(15, 5))
        
        self.lbl_work = tk.Label(self.grid_frame, text="作業時間 (分):", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.lbl_work.grid(row=0, column=0, sticky='w', pady=6)
        self.spin_work = ttk.Spinbox(self.grid_frame, from_=1, to=90, width=5, font=FONT_TEXT)
        self.spin_work.set(self.app.data_mgr.get_setting("work_minutes"))
        self.spin_work.grid(row=0, column=1, sticky='e', padx=10)
        
        self.lbl_short = tk.Label(self.grid_frame, text="短い休憩時間 (分):", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.lbl_short.grid(row=1, column=0, sticky='w', pady=6)
        self.spin_short_break = ttk.Spinbox(self.grid_frame, from_=1, to=30, width=5, font=FONT_TEXT)
        self.spin_short_break.set(self.app.data_mgr.get_setting("short_break_minutes"))
        self.spin_short_break.grid(row=1, column=1, sticky='e', padx=10)
        
        self.lbl_long = tk.Label(self.grid_frame, text="長い休憩時間 (分):", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.lbl_long.grid(row=2, column=0, sticky='w', pady=6)
        self.spin_long_break = ttk.Spinbox(self.grid_frame, from_=1, to=60, width=5, font=FONT_TEXT)
        self.spin_long_break.set(self.app.data_mgr.get_setting("long_break_minutes"))
        self.spin_long_break.grid(row=2, column=1, sticky='e', padx=10)
        
        self.lbl_interval = tk.Label(self.grid_frame, text="長休憩までのサイクル数:", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.lbl_interval.grid(row=3, column=0, sticky='w', pady=6)
        self.spin_interval = ttk.Spinbox(self.grid_frame, from_=2, to=8, width=5, font=FONT_TEXT)
        self.spin_interval.set(self.app.data_mgr.get_setting("long_break_interval"))
        self.spin_interval.grid(row=3, column=1, sticky='e', padx=10)
        
        # サウンド
        self.lbl_sound_title = tk.Label(self.settings_card, text="サウンド設定", font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.lbl_sound_title.pack(anchor='w', pady=(15, 5))
        
        self.se_var = tk.BooleanVar(value=self.app.data_mgr.get_setting("se_enabled"))
        self.chk_se = tk.Checkbutton(self.settings_card, text="効果音 (SE) を鳴らす (ニャー・チャイム)", variable=self.se_var, font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["text"], activebackground=self.app.theme["card"])
        self.chk_se.pack(anchor='w', pady=2)
        
        self.bgm_frame = tk.Frame(self.settings_card, bg=self.app.theme["card"])
        self.bgm_frame.pack(fill='x', pady=4)
        self.lbl_bgm = tk.Label(self.bgm_frame, text="環境音 BGM:", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.lbl_bgm.pack(side='left')
        
        self.bgm_var = tk.StringVar(value=self.app.data_mgr.get_setting("bgm_type"))
        self.bgm_combo = ttk.Combobox(self.bgm_frame, textvariable=self.bgm_var, values=["none", "lofi", "fire", "rain", "purr", "forest", "wave"], state="readonly", width=14, font=FONT_TEXT)
        self.bgm_combo.pack(side='left', padx=10)
        
        self.lbl_bgm_hint = tk.Label(self.settings_card, text="※ lofi=チルピアノ / fire=焚き火 / rain=雨 / purr=猫ゴロゴロ / forest=森 / wave=波", font=("Meiryo", 8), bg=self.app.theme["card"], fg=self.app.theme["sub_text"])
        self.lbl_bgm_hint.pack(anchor='w', pady=(0, 6))
        
        # 天候・パーティクル演出設定
        self.weather_frame = tk.Frame(self.settings_card, bg=self.app.theme["card"])
        self.weather_frame.pack(fill='x', pady=4)
        self.lbl_weather = tk.Label(self.weather_frame, text="カフェの天候演出:", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.lbl_weather.pack(side='left')
        
        self.weather_var = tk.StringVar(value=self.app.data_mgr.get_setting("weather") or "auto")
        self.weather_combo = ttk.Combobox(self.weather_frame, textvariable=self.weather_var, values=["auto (時間連動)", "sakura (桜吹雪)", "rain (静かな雨)", "stars (星空・流星)", "clear (木漏れ日)"], state="readonly", width=18, font=FONT_TEXT)
        self.weather_combo.pack(side='left', padx=10)
        
        self.save_settings_btn = tk.Button(self.settings_card, text="💾 設定を保存する", font=FONT_SUB, bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"], relief="flat", padx=15, pady=6, cursor="hand2", command=self.save_settings)
        self.save_settings_btn.pack(pady=(16, 0))

    def refresh_view(self):
        self.app.tabs["settings"].config(bg=self.app.theme["bg"])
        self.settings_card.config(bg=self.app.theme["card"])
        self.settings_title.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.settings_theme_lbl.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.theme_frame.config(bg=self.app.theme["card"])
        self.theme_apply_btn.config(bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"])
        self.grid_frame.config(bg=self.app.theme["card"])
        self.lbl_work.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.lbl_short.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.lbl_long.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.lbl_interval.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.lbl_sound_title.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.chk_se.config(bg=self.app.theme["card"], fg=self.app.theme["text"], activebackground=self.app.theme["card"])
        self.bgm_frame.config(bg=self.app.theme["card"])
        self.lbl_bgm.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.lbl_bgm_hint.config(bg=self.app.theme["card"], fg=self.app.theme["sub_text"])
        self.weather_frame.config(bg=self.app.theme["card"])
        self.lbl_weather.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.save_settings_btn.config(bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"])

    def save_settings(self):
        try:
            w_m = int(self.spin_work.get())
            sb_m = int(self.spin_short_break.get())
            lb_m = int(self.spin_long_break.get())
            interval = int(self.spin_interval.get())
        except ValueError:
            messagebox.showerror("入力エラー", "時間は数値で指定してください。")
            return
            
        self.app.data_mgr.set_setting("work_minutes", w_m)
        self.app.data_mgr.set_setting("short_break_minutes", sb_m)
        self.app.data_mgr.set_setting("long_break_minutes", lb_m)
        self.app.data_mgr.set_setting("long_break_interval", interval)
        self.app.data_mgr.set_setting("se_enabled", self.se_var.get())
        self.app.data_mgr.set_setting("bgm_type", self.bgm_var.get())
        w_val = self.weather_var.get().split()[0]
        self.app.data_mgr.set_setting("weather", w_val)
        
        # update timer module
        self.app.timer.sync_settings(w_m, sb_m, lb_m, interval)
        self.app.sound_mgr.se_enabled = self.se_var.get()
        self.app.sound_mgr.set_bgm(self.bgm_var.get())
        
        if not self.app.timer.is_running:
            self.app.reset_timer()
            
        messagebox.showinfo("保存完了", "設定を保存しました！🐾")
