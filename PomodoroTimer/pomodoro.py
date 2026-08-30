import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from PIL import Image, ImageTk
import os
import sys
import math
import time
import random
import threading
import numpy as np

# カレントディレクトリ・親ディレクトリからのインポートを保証
_cur_dir = os.path.dirname(os.path.abspath(__file__))
if _cur_dir not in sys.path:
    sys.path.insert(0, _cur_dir)

from sound_generator import SoundManager
from data_manager import DataManager, AVAILABLE_CATS, AVAILABLE_ITEMS, THEMES
from google_sync import GoogleSyncManager
from natural_cat_generator import generate_natural_cat, generate_cat_poses

FONT_TITLE = ("Meiryo", 14, "bold")
FONT_MAIN = ("Comic Sans MS", 50, "bold")
FONT_SUB = ("Meiryo", 12, "bold")
FONT_TEXT = ("Meiryo", 10)
FONT_BOLD = ("Meiryo", 10, "bold")
FONT_WIDGET = ("Comic Sans MS", 26, "bold")
GOOGLE_BLUE = "#4285f4"

AVATAR_ICONS = {
    "black": "🐾",
    "white": "🤍",
    "gray": "🩶",
    "calico": "🌸",
    "siamese": "🐱",
    "orange": "🐯",
    "cream": "🍦",
    "ginger": "🦊",
    "tuxedo": "🎩",
    "tortoiseshell": "🍂",
    "sakura": "🌺",
    "mint": "🍃",
    "sky": "☁️",
    "lavender": "🔮",
    "golden": "✨"
}

def hex_to_rgb(hex_str):
    """#RRGGBB 形式を (R, G, B, 255) の RGBA タプルに変換"""
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 6:
        r, g, b = tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
        return (r, g, b, 255)
    return (255, 240, 245, 255)

def make_transparent(img):
    """画像の背景や影を除去し、猫部分のみを透過RGBAにする"""
    img = img.convert("RGBA")
    arr = np.array(img)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    brightness = 0.299 * r + 0.587 * g + 0.114 * b
    
    is_cat = (brightness < 100) & (r < 120) & (g < 120) & (b < 130)
    
    new_arr = np.zeros_like(arr)
    new_arr[is_cat, :3] = arr[is_cat, :3]
    new_arr[is_cat, 3] = 255
    
    res = Image.fromarray(new_arr, mode="RGBA")
    alpha = new_arr[:, :, 3]
    y_idx, x_idx = np.where(alpha != 0)
    if len(x_idx) > 0 and len(y_idx) > 0:
        pad = 10
        x0, y0 = max(0, x_idx.min() - pad), max(0, y_idx.min() - pad)
        x1, y1 = min(img.width, x_idx.max() + pad), min(img.height, y_idx.max() + pad)
        cropped = res.crop((x0, y0, x1, y1))
        max_dim = max(cropped.width, cropped.height)
        square_img = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
        square_img.paste(cropped, ((max_dim - cropped.width) // 2, (max_dim - cropped.height) // 2))
        return square_img
    return res

from natural_cat_generator import generate_natural_cat

def colorize_cat(rgba_img, cat_type):
    """猫のベース画像から、立体陰影・毛並みテクスチャ・有機的な柄を融合して超自然な猫を生成"""
    return generate_natural_cat(rgba_img, cat_type)

def bind_mousewheel_to_all(widget, canvas):
    """マウスホイールでのスクロールをウィジェットとその子要素すべてにバインド"""
    def _on_mousewheel(event):
        canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        
    def _bind_recursive(w):
        try:
            w.bind("<MouseWheel>", _on_mousewheel, add="+")
        except Exception:
            pass
        for child in w.winfo_children():
            _bind_recursive(child)
            
    _bind_recursive(widget)
    canvas.bind("<MouseWheel>", _on_mousewheel, add="+")


class PomodoroApp:
    def __init__(self, root):
        self.root = root
        self.root.title("猫カフェ・ポモドーロ 🐾")
        self.root.geometry("520x750")
        self.root.minsize(500, 700)
        
        # --- データ & サウンド & Google マネージャー ---
        self.data_mgr = DataManager()
        self.sound_mgr = SoundManager()
        self.sound_mgr.se_enabled = self.data_mgr.get_setting("se_enabled")
        self.google_sync = GoogleSyncManager()
        
        # テーマ設定
        self.theme = self.data_mgr.get_current_theme()
        self.root.configure(bg=self.theme["bg"])
        
        # TTK スタイル初期化
        self._update_ttk_styles()
        
        self.is_alive = True
        self.root.protocol("WM_DELETE_WINDOW", self.quit_app)
        
        # タイマー設定
        self.work_mins = self.data_mgr.get_setting("work_minutes")
        self.short_break_mins = self.data_mgr.get_setting("short_break_minutes")
        self.long_break_mins = self.data_mgr.get_setting("long_break_minutes")
        self.long_break_interval = self.data_mgr.get_setting("long_break_interval")
        
        self.time_left = self.work_mins * 60
        self.is_running = False
        self.session_mode = "work"
        self.cycle_count = 1
        self.anim_tick = 0
        self.floating_effects = []
        
        # --- 画像リソースのロード ---
        self._load_images()
        
        # --- UI コンポーネント構築 ---
        self._build_header()
        self._build_tab_bar()
        
        self.content_frame = tk.Frame(self.root, bg=self.theme["bg"])
        self.content_frame.pack(expand=True, fill='both', padx=10, pady=5)
        
        self.tabs = {}
        self._build_cafe_tab()
        self._build_task_tab()
        self._build_shop_tab()
        self._build_stats_tab()
        self._build_settings_tab()
        
        self.current_tab = "cafe"
        self.show_tab("cafe")
        
        # --- ミニウィジェット構築 ---
        self._build_widget()
        
        # BGM初期設定
        bgm = self.data_mgr.get_setting("bgm_type")
        if bgm and bgm != "none":
            self.sound_mgr.set_bgm(bgm)
            
        # イベントループ開始
        self.update_status_display()
        self.update_clock()
        self.animate_loop()
        
        # 初回起動時に相棒猫が未選択なら相棒選択モーダルを開く
        if not self.data_mgr.get_profile().get("starter_chosen", False):
            self.root.after(400, self.open_starter_cat_modal)

    def _update_ttk_styles(self):
        """TTK ウィジェット（Combobox, Spinbox, Scrollbar）のテーマスタイルを更新"""
        style = ttk.Style(self.root)
        try:
            style.theme_use('clam')
        except Exception:
            pass
            
        t = self.theme
        
        # Combobox
        style.configure(
            "TCombobox",
            fieldbackground=t["input_bg"],
            background=t["card"],
            foreground=t["input_fg"],
            arrowcolor=t["text"],
            darkcolor=t["border"],
            lightcolor=t["border"],
            bordercolor=t["border"],
            padding=3
        )
        style.map(
            "TCombobox",
            fieldbackground=[("readonly", t["input_bg"])],
            foreground=[("readonly", t["input_fg"])],
            selectbackground=[("readonly", t["btn"])],
            selectforeground=[("readonly", t["btn_fg"])]
        )
        
        # Spinbox
        style.configure(
            "TSpinbox",
            fieldbackground=t["input_bg"],
            background=t["card"],
            foreground=t["input_fg"],
            arrowcolor=t["text"],
            darkcolor=t["border"],
            lightcolor=t["border"],
            bordercolor=t["border"],
            padding=3
        )
        style.map(
            "TSpinbox",
            fieldbackground=[("readonly", t["input_bg"])],
            foreground=[("readonly", t["input_fg"])]
        )
        
        # Scrollbar
        style.configure(
            "Vertical.TScrollbar",
            background=t["card"],
            troughcolor=t["bg"],
            bordercolor=t["bg"],
            arrowcolor=t["text"],
            gripcount=0
        )
        style.map(
            "Vertical.TScrollbar",
            background=[("active", t["btn"]), ("pressed", t["border"])]
        )
        
        # Combobox のドロップダウン Listbox
        self.root.option_add('*TCombobox*Listbox.background', t["card"])
        self.root.option_add('*TCombobox*Listbox.foreground', t["text"])
        self.root.option_add('*TCombobox*Listbox.selectBackground', t["btn"])
        self.root.option_add('*TCombobox*Listbox.selectForeground', t["btn_fg"])

    def _load_images(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        awake_png = os.path.join(base_dir, "cat_awake.png")
        sleep_png = os.path.join(base_dir, "cat_sleep.png")
        awake_jpg = os.path.join(base_dir, "cat_awake.jpg")
        sleep_jpg = os.path.join(base_dir, "cat_sleep.jpg")
        bg_path = os.path.join(base_dir, "room_bg.jpg")
        
        self.has_images = False
        try:
            img_bg = Image.open(bg_path).resize((480, 270), Image.Resampling.LANCZOS)
            self.bg_photo = ImageTk.PhotoImage(img_bg)
            
            if os.path.exists(awake_png):
                self.base_awake = Image.open(awake_png).convert("RGBA")
            else:
                self.base_awake = make_transparent(Image.open(awake_jpg))
                
            if os.path.exists(sleep_png):
                self.base_sleep = Image.open(sleep_png).convert("RGBA")
            else:
                self.base_sleep = make_transparent(Image.open(sleep_jpg))
                
            # 各モーション・寝相専用ベーススプライトのロード
            def load_or_fallback(fname, fallback):
                fpath = os.path.join(base_dir, fname)
                if os.path.exists(fpath):
                    return Image.open(fpath).convert("RGBA")
                return fallback
                
            base_pose_images = {
                "awake": self.base_awake,
                "sleep": self.base_sleep,
                "walk_0": load_or_fallback("cat_walk_0.png", self.base_awake),
                "walk_1": load_or_fallback("cat_walk_1.png", self.base_awake),
                "dash": load_or_fallback("cat_dash.png", self.base_awake),
                "groom": load_or_fallback("cat_groom.png", self.base_awake),
                "stretch": load_or_fallback("cat_stretch.png", self.base_awake),
                "play": load_or_fallback("cat_play.png", self.base_awake),
                "pounce": load_or_fallback("cat_pounce.png", self.base_awake),
                "sleep_belly": load_or_fallback("cat_sleep_belly.png", self.base_sleep),
                "sleep_stretch": load_or_fallback("cat_sleep_stretch.png", self.base_sleep)
            }
                
            self.cat_textures = {}
            for cat_info in AVAILABLE_CATS:
                c_id = cat_info["id"]
                raw_poses = generate_cat_poses(base_pose_images, None, c_id)
                self.cat_textures[c_id] = {k: ImageTk.PhotoImage(v) for k, v in raw_poses.items()}
                
            self._update_widget_cat_frames()
            self.has_images = True
        except Exception as e:
            print("画像読み込みエラー:", e)
            self.has_images = False

    def _update_widget_cat_frames(self):
        """現在のテーマの背景色に合わせてウィジェット用猫フレームを再合成"""
        if not hasattr(self, 'base_awake') or not hasattr(self, 'base_sleep'):
            return
            
        w_size = (26, 26)
        widget_bg = hex_to_rgb(self.theme["bg"])
        
        prof = self.data_mgr.get_profile()
        av_cat = prof.get("avatar", "black")
        t_aw = generate_natural_cat(self.base_awake, av_cat)
        t_sl = generate_natural_cat(self.base_sleep, av_cat)
        
        def make_widget_frame(img):
            resized = img.resize(w_size, Image.Resampling.LANCZOS)
            bg = Image.new("RGBA", w_size, widget_bg)
            comp = Image.alpha_composite(bg, resized)
            return ImageTk.PhotoImage(comp)
            
        self.widget_cat_frames = {
            "awake": [
                make_widget_frame(t_aw.transpose(Image.FLIP_LEFT_RIGHT)),
                make_widget_frame(t_aw)
            ],
            "sleep": [
                make_widget_frame(t_sl),
                make_widget_frame(t_sl.resize((26, 23), Image.Resampling.LANCZOS))
            ]
        }
        
        if hasattr(self, 'widget_cat'):
            is_sleep = not self.is_running or self.session_mode != "work"
            frame_set = self.widget_cat_frames["sleep"] if is_sleep else self.widget_cat_frames["awake"]
            self.widget_cat.config(image=frame_set[0])

    # --- UI 構築 ---
    def _build_header(self):
        self.header_frame = tk.Frame(self.root, bg=self.theme["header"], pady=6, padx=12)
        self.header_frame.pack(fill='x')
        
        self.header_title_label = tk.Label(self.header_frame, text="🐾 猫カフェ・ポモドーロ", font=FONT_TITLE, fg=self.theme["text"], bg=self.theme["header"])
        self.header_title_label.pack(side='left')
        
        self.right_frame = tk.Frame(self.header_frame, bg=self.theme["header"])
        self.right_frame.pack(side='right')
        
        self.treat_label = tk.Label(self.right_frame, text=f"🐟 {self.data_mgr.get_cafe_data()['treats']}個", font=FONT_SUB, fg=self.theme["accent"], bg=self.theme["header"])
        self.treat_label.pack(side='left', padx=6)
        
        prof = self.data_mgr.get_profile()
        icon = AVATAR_ICONS.get(prof.get("avatar", "black"), "🐾")
        self.account_btn = tk.Button(
            self.right_frame, text=f"{icon} {prof['name'][:8]}", font=FONT_TEXT,
            bg=self.theme["card"], fg=self.theme["text"], relief="flat", padx=8, pady=2,
            cursor="hand2", command=self.open_account_modal
        )
        self.account_btn.pack(side='left', padx=4)

    def _build_tab_bar(self):
        self.tab_bar = tk.Frame(self.root, bg=self.theme["bg"], pady=5)
        self.tab_bar.pack(fill='x', padx=10)
        
        self.tab_buttons = {}
        tab_defs = [
            ("cafe", "🐾 カフェ"),
            ("task", "📋 タスク"),
            ("shop", "🎁 ショップ"),
            ("stats", "📊 統計"),
            ("settings", "⚙️ 設定")
        ]
        
        for tab_id, text in tab_defs:
            btn = tk.Button(
                self.tab_bar, text=text, font=FONT_SUB,
                bg=self.theme["card"], fg=self.theme["text"], relief="flat", padx=6, pady=4,
                cursor="hand2", command=lambda t=tab_id: self.show_tab(t)
            )
            btn.pack(side='left', expand=True, fill='x', padx=2)
            self.tab_buttons[tab_id] = btn

    def show_tab(self, tab_id):
        self.current_tab = tab_id
        for t_id, frame in self.tabs.items():
            if t_id == tab_id:
                frame.pack(fill='both', expand=True)
                self.tab_buttons[t_id].config(bg=self.theme["btn"], fg=self.theme["btn_fg"])
            else:
                frame.pack_forget()
                self.tab_buttons[t_id].config(bg=self.theme["card"], fg=self.theme["text"])
                
        if tab_id == "task":
            self.refresh_task_list()
        elif tab_id == "shop":
            self.refresh_shop_view()
        elif tab_id == "cafe":
            self.refresh_cafe_elements()
        elif tab_id == "stats":
            self.refresh_stats_view()
        elif tab_id == "settings":
            self.refresh_settings_view()

    def apply_theme(self, theme_key):
        """テーマを動的に適用・保存（全タブ・全ウィジェット完全同期）"""
        self.data_mgr.set_setting("theme", theme_key)
        self.theme = self.data_mgr.get_current_theme()
        
        # TTK スタイル更新 (Combobox, Spinbox, Scrollbar, Listbox)
        self._update_ttk_styles()
        
        # ウィジェット用猫フレーム再合成
        self._update_widget_cat_frames()
        
        # メインウィンドウ & ヘッダー
        self.root.configure(bg=self.theme["bg"])
        self.header_frame.configure(bg=self.theme["header"])
        self.header_title_label.configure(bg=self.theme["header"], fg=self.theme["text"])
        if hasattr(self, 'right_frame'):
            self.right_frame.configure(bg=self.theme["header"])
        self.treat_label.configure(bg=self.theme["header"], fg=self.theme["accent"])
        self.account_btn.configure(bg=self.theme["card"], fg=self.theme["text"])
        self.tab_bar.configure(bg=self.theme["bg"])
        self.content_frame.configure(bg=self.theme["bg"])
        
        # 各タブの背景色更新
        for t_id, tab_frame in self.tabs.items():
            try:
                tab_frame.configure(bg=self.theme["bg"])
            except Exception:
                pass
                
        # タブバーのボタン色
        for t_id, btn in self.tab_buttons.items():
            if t_id == self.current_tab:
                btn.config(bg=self.theme["btn"], fg=self.theme["btn_fg"])
            else:
                btn.config(bg=self.theme["card"], fg=self.theme["text"])
                
        # カフェタブ
        self.cat_canvas.configure(bg=self.theme["bg"])
        if hasattr(self, 'info_card'):
            self.info_card.configure(bg=self.theme["card"])
            self.cycle_label.configure(bg=self.theme["card"], fg=self.theme["text"])
            self.total_pomo_label.configure(bg=self.theme["card"], fg=self.theme["work"])
        self.active_task_banner.configure(bg=self.theme["card"], fg=self.theme["text"])
        self.status_label.configure(bg=self.theme["bg"])
        self.timer_label.configure(bg=self.theme["bg"])
        if hasattr(self, 'btn_frame'):
            self.btn_frame.configure(bg=self.theme["bg"])
        self.start_btn.configure(bg=self.theme["btn"], fg=self.theme["btn_fg"])
        self.feed_btn.configure(bg=self.theme["card"], fg=self.theme["accent"])
        self.reset_btn.configure(bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"])
        
        # ウィジェット
        self.widget.configure(bg=self.theme["border"])
        self.widget_bar.configure(bg=self.theme["bg"])
        self.widget_cat.configure(bg=self.theme["bg"])
        self.widget_label.configure(bg=self.theme["bg"])
        self.widget_center_box.configure(bg=self.theme["bg"])
        self.widget_status.configure(bg=self.theme["bg"])
        self.widget_task.configure(bg=self.theme["bg"], fg=self.theme["text"])
        self.widget_play_btn.configure(bg=self.theme["btn"], fg=self.theme["btn_fg"])
        
        # 全タブのUI状態を一括リフレッシュ
        self.refresh_cafe_elements()
        self.refresh_task_list()
        self.refresh_shop_view()
        self.refresh_stats_view()
        self.refresh_settings_view()
        
        self.show_tab(self.current_tab)
        self.update_status_display()

    # --- 1. カフェタブ ---
    def _build_cafe_tab(self):
        tab = tk.Frame(self.content_frame, bg=self.theme["bg"])
        self.tabs["cafe"] = tab
        
        self.canvas_w = 480
        self.canvas_h = 270
        self.cat_canvas = tk.Canvas(tab, width=self.canvas_w, height=self.canvas_h, bg=self.theme["bg"], highlightthickness=0, cursor="hand2")
        self.cat_canvas.pack(pady=(0, 5))
        self.cat_canvas.bind("<Button-1>", self.on_canvas_click)
        
        if self.has_images:
            self.cat_canvas.create_image(self.canvas_w/2, self.canvas_h/2, image=self.bg_photo)
            
        self.cats = []
        self.spawn_cats_and_items()
        
        # インフォメーションカード (セット数 & 本日進捗)
        self.info_card = tk.Frame(tab, bg=self.theme["card"], padx=12, pady=5, relief="flat")
        self.info_card.pack(fill='x', padx=10, pady=(2, 4))
        
        self.cycle_label = tk.Label(self.info_card, text="セット 1/4 🐾 ⚪ ⚪ ⚪", font=FONT_SUB, fg=self.theme["text"], bg=self.theme["card"])
        self.cycle_label.pack(side='left')
        
        prof = self.data_mgr.get_profile()
        done_pomo = self.data_mgr.get_cafe_data()['total_pomodoros']
        self.total_pomo_label = tk.Label(self.info_card, text=f"本日: {done_pomo}/{prof['daily_goal']} 🍅", font=FONT_SUB, fg=self.theme["work"], bg=self.theme["card"])
        self.total_pomo_label.pack(side='right')
        
        # 作業中タスクバナー
        self.active_task_banner = tk.Label(tab, text="作業中: 今日のタスクを計画する 📝", font=FONT_BOLD, fg=self.theme["text"], bg=self.theme["card"], padx=10, pady=4, relief="flat")
        self.active_task_banner.pack(fill='x', padx=10, pady=(0, 4))
        
        self.status_label = tk.Label(tab, text="おしごと (停止中)", font=FONT_SUB, fg=self.theme["work"], bg=self.theme["bg"])
        self.status_label.pack(pady=(2, 0))
        
        self.timer_label = tk.Label(tab, text=self.format_time(self.time_left), font=FONT_MAIN, fg=self.theme["work"], bg=self.theme["bg"])
        self.timer_label.pack(pady=(0, 0))
        
        self.btn_frame = tk.Frame(tab, bg=self.theme["bg"])
        self.btn_frame.pack(pady=6)
        
        self.start_btn = tk.Button(self.btn_frame, text="▶ 開始", command=self.toggle_timer, bg=self.theme["btn"], fg=self.theme["btn_fg"], font=FONT_SUB, relief="flat", padx=18, pady=5, cursor="hand2")
        self.start_btn.pack(side="left", padx=5)
        
        self.feed_btn = tk.Button(self.btn_frame, text="🐟 おやつをあげる", command=self.feed_active_cat, bg=self.theme["card"], fg=self.theme["accent"], font=FONT_SUB, relief="flat", padx=14, pady=5, cursor="hand2")
        self.feed_btn.pack(side="left", padx=5)
        
        self.reset_btn = tk.Button(self.btn_frame, text="↺ リセット", command=self.reset_timer, bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"], font=FONT_SUB, relief="flat", padx=14, pady=5, cursor="hand2")
        self.reset_btn.pack(side="left", padx=5)

    def feed_active_cat(self):
        """相棒猫またはカフェの猫におやつをあげる"""
        avatar = self.data_mgr.get_profile().get("avatar", "black")
        ok, msg = self.data_mgr.feed_cat_treat(avatar)
        if ok:
            self.sound_mgr.play_se("level_up")
            messagebox.showinfo("🐟 おやつタイム", msg)
            self.refresh_cafe_elements()
            if self.cats:
                cat = self.cats[0]
                heart_id = self.cat_canvas.create_text(cat["x"], cat["y"] - 25, text="💖 ごちそうさまニャ！", font=("Meiryo", 11, "bold"), fill=self.theme["work"])
                self.floating_effects.append({"id": heart_id, "x": cat["x"], "y": cat["y"] - 25, "life": 30})
        else:
            messagebox.showwarning("🐟 おやつ", msg)

    def spawn_cats_and_items(self):
        self.cat_canvas.delete("cat")
        self.cat_canvas.delete("item")
        self.cats.clear()
        
        if not self.has_images:
            self.cat_canvas.create_text(self.canvas_w/2, self.canvas_h/2, text="(=^・^=)", font=("Meiryo", 20), fill=self.theme["accent"], tags="cat")
            return
            
        unlocked_items = self.data_mgr.get_cafe_data().get("unlocked_items", ["cushion"])
        item_positions = {
            "cushion": (75, 205, "🛋️"),
            "toy_mouse": (165, 225, "🐭"),
            "scratcher": (395, 175, "🪵"),
            "treat_bowl": (240, 225, "🥣"),
            "cat_tree": (390, 105, "🏰")
        }
        for item_id in unlocked_items:
            if item_id in item_positions:
                x, y, icon = item_positions[item_id]
                self.cat_canvas.create_text(x, y, text=icon, font=("Segoe UI Emoji", 22), tags="item")
                
        unlocked_cats = self.data_mgr.get_cafe_data().get("unlocked_cats", ["black"])
        
        # 床面の自然なスポーン位置候補 (重なり防止グリッド)
        spawn_slots = [
            (115, 185), (200, 175), (285, 180), (355, 195),
            (145, 215), (250, 215), (320, 220), (85, 155),
            (180, 145), (265, 145), (340, 155), (410, 215)
        ]
        random.shuffle(spawn_slots)
        
        sleep_pose_types = ["sleep_curl", "sleep_belly", "sleep_stretch"]
        
        for idx, cat_id in enumerate(unlocked_cats):
            if cat_id in self.cat_textures:
                if idx < len(spawn_slots):
                    x, y = spawn_slots[idx]
                else:
                    x = random.randint(70, 410)
                    y = random.randint(145, 225)
                    
                sp_type = random.choice(sleep_pose_types)
                canvas_id = self.cat_canvas.create_image(x, y, image=self.cat_textures[cat_id][f"{sp_type}_0"], tags="cat")
                self.cats.append({
                    "type": cat_id,
                    "id": canvas_id,
                    "x": x,
                    "y": y,
                    "state": "sleep",
                    "sleep_pose": sp_type,
                    "state_timer": random.randint(20, 80),
                    "dx": 0,
                    "dy": 0,
                    "facing": random.choice(["r", "l"])
                })

    def refresh_cafe_elements(self):
        self.treat_label.config(text=f"🐟 {self.data_mgr.get_cafe_data()['treats']}個", fg=self.theme["accent"])
        prof = self.data_mgr.get_profile()
        done_pomo = self.data_mgr.get_cafe_data()['total_pomodoros']
        
        if hasattr(self, 'info_card'):
            self.info_card.config(bg=self.theme["card"])
            self.cycle_label.config(fg=self.theme["text"], bg=self.theme["card"])
            self.total_pomo_label.config(text=f"本日: {done_pomo}/{prof['daily_goal']} 🍅", fg=self.theme["work"], bg=self.theme["card"])
            self.active_task_banner.config(bg=self.theme["card"], fg=self.theme["text"])
            self.btn_frame.config(bg=self.theme["bg"])
            self.start_btn.config(bg=self.theme["btn"], fg=self.theme["btn_fg"])
            self.feed_btn.config(bg=self.theme["card"], fg=self.theme["accent"])
            self.reset_btn.config(bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"])
            
        icon = AVATAR_ICONS.get(prof.get("avatar", "black"), "🐾")
        self.account_btn.config(text=f"{icon} {prof['name'][:8]}")
        
        active_t = self.data_mgr.get_active_task()
        if active_t:
            done_mark = " (完了)" if active_t["is_done"] else ""
            self.active_task_banner.config(text=f"作業中: {active_t['title']}{done_mark}")
        else:
            self.active_task_banner.config(text="作業中タスクなし 📝")
        self.spawn_cats_and_items()

    def on_canvas_click(self, event):
        clicked_cat = None
        for cat in self.cats:
            if abs(event.x - cat["x"]) < 30 and abs(event.y - cat["y"]) < 30:
                clicked_cat = cat
                break
                
        target_x = event.x
        target_y = event.y
        cat_msg = random.choice(["ゴロゴロ…♪ ❤️", "ニャ〜ン♪ ✨", "すりすり…🐾", "大好きニャ！💖"])
        if clicked_cat:
            target_x = clicked_cat["x"]
            target_y = clicked_cat["y"]
            clicked_cat["state"] = "sit"
            clicked_cat["state_timer"] = 40
            aff = self.data_mgr.pet_cat(clicked_cat["type"])
            cat_msg = f"{cat_msg} (親愛度 Lv.{aff})"
            
        self.sound_mgr.play_se("meow")
        heart_id = self.cat_canvas.create_text(target_x, target_y - 22, text=cat_msg, font=("Meiryo", 9, "bold"), fill=self.theme["work"])
        self.floating_effects.append({"id": heart_id, "x": target_x, "y": target_y - 22, "life": 25})

    # --- 2. タスクタブ ＆ Google 連携 ---
    def _build_task_tab(self):
        tab = tk.Frame(self.content_frame, bg=self.theme["bg"])
        self.tabs["task"] = tab
        
        self.task_sync_bar = tk.Frame(tab, bg=self.theme["card"], padx=8, pady=6, relief="groove", bd=1)
        self.task_sync_bar.pack(fill='x', pady=(0, 4))
        
        g_status = "🟢 接続中" if self.google_sync.is_authenticated() else "⚪ 未連携 (デモ利用可)"
        self.sync_status_lbl = tk.Label(self.task_sync_bar, text=f"Google連携: {g_status}", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["text"])
        self.sync_status_lbl.pack(side='left', padx=4)
        
        self.btn_tasks_sync = tk.Button(
            self.task_sync_bar, text="🔄 Tasksから同期", font=("Meiryo", 8, "bold"),
            bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"], relief="flat", padx=6, pady=2,
            cursor="hand2", command=self.sync_google_tasks
        )
        self.btn_tasks_sync.pack(side='right', padx=3)
        
        self.btn_cal_sync = tk.Button(
            self.task_sync_bar, text="📅 今日の予定", font=("Meiryo", 8, "bold"),
            bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"], relief="flat", padx=6, pady=2,
            cursor="hand2", command=self.open_calendar_modal
        )
        self.btn_cal_sync.pack(side='right', padx=3)
        
        # タスク追加フォーム (拡張版)
        self.task_add_frame = tk.Frame(tab, bg=self.theme["card"], padx=10, pady=8, relief="flat", bd=0)
        self.task_add_frame.pack(fill='x', pady=4)
        
        self.task_add_title = tk.Label(self.task_add_frame, text="＋ 新しいタスクを追加", font=FONT_BOLD, bg=self.theme["card"], fg=self.theme["text"])
        self.task_add_title.pack(anchor='w', pady=(0, 4))
        
        self.top_input_row = tk.Frame(self.task_add_frame, bg=self.theme["card"])
        self.top_input_row.pack(fill='x', pady=2)
        
        self.task_entry = tk.Entry(self.top_input_row, font=FONT_TEXT, bg=self.theme["input_bg"], fg=self.theme["input_fg"], insertbackground=self.theme["text"], relief="solid", bd=1)
        self.task_entry.pack(side='left', fill='x', expand=True, padx=(0, 6))
        self.task_entry.bind("<Return>", lambda e: self.add_new_task())
        
        self.task_target_lbl = tk.Label(self.top_input_row, text="目標🍅:", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["text"])
        self.task_target_lbl.pack(side='left', padx=2)
        self.task_target_spin = ttk.Spinbox(self.top_input_row, from_=1, to=12, width=3, font=FONT_TEXT)
        self.task_target_spin.set(2)
        self.task_target_spin.pack(side='left', padx=(0, 6))
        
        self.bottom_opts_row = tk.Frame(self.task_add_frame, bg=self.theme["card"])
        self.bottom_opts_row.pack(fill='x', pady=2)
        
        self.task_tag_lbl = tk.Label(self.bottom_opts_row, text="タグ:", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["sub_text"])
        self.task_tag_lbl.pack(side='left', padx=(0, 2))
        self.task_tag_var = tk.StringVar(value="💼 仕事")
        self.task_tag_combo = ttk.Combobox(self.bottom_opts_row, textvariable=self.task_tag_var, values=["💼 仕事", "📚 勉強", "🎨 創作", "🏠 その他"], state="readonly", width=8, font=FONT_TEXT)
        self.task_tag_combo.pack(side='left', padx=(0, 8))
        
        self.task_prio_lbl = tk.Label(self.bottom_opts_row, text="優先度:", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["sub_text"])
        self.task_prio_lbl.pack(side='left', padx=(0, 2))
        self.task_prio_var = tk.StringVar(value="⚡ 中")
        self.task_prio_combo = ttk.Combobox(self.bottom_opts_row, textvariable=self.task_prio_var, values=["🔥 高", "⚡ 中", "☕ 低"], state="readonly", width=6, font=FONT_TEXT)
        self.task_prio_combo.pack(side='left', padx=(0, 8))
        
        self.task_add_btn = tk.Button(self.bottom_opts_row, text="追加 ＋", command=self.add_new_task, bg=self.theme["btn"], fg=self.theme["btn_fg"], font=FONT_BOLD, relief="flat", padx=12, pady=1, cursor="hand2")
        self.task_add_btn.pack(side='right')

        # フィルターバー
        self.filter_frame = tk.Frame(tab, bg=self.theme["bg"])
        self.filter_frame.pack(fill='x', pady=(4, 2))
        self.task_filter = "all"
        
        self.filter_btns = {}
        filters = [("all", "すべて"), ("active", "未完了"), ("done", "完了済")]
        for f_key, f_text in filters:
            f_btn = tk.Button(
                self.filter_frame, text=f_text, font=("Meiryo", 8),
                bg=self.theme["btn"] if f_key == "all" else self.theme["card"],
                fg=self.theme["btn_fg"] if f_key == "all" else self.theme["text"],
                relief="flat", padx=8, pady=2, cursor="hand2",
                command=lambda k=f_key: self.set_task_filter(k)
            )
            f_btn.pack(side='left', padx=2)
            self.filter_btns[f_key] = f_btn
        
        list_container = tk.Frame(tab, bg=self.theme["bg"])
        list_container.pack(fill='both', expand=True, pady=4)
        
        self.task_canvas = tk.Canvas(list_container, bg=self.theme["bg"], highlightthickness=0)
        self.task_scrollbar = ttk.Scrollbar(list_container, orient="vertical", command=self.task_canvas.yview)
        self.task_inner_frame = tk.Frame(self.task_canvas, bg=self.theme["bg"])
        
        self.task_inner_frame.bind("<Configure>", lambda e: self.task_canvas.configure(scrollregion=self.task_canvas.bbox("all")))
        self.task_canvas_window = self.task_canvas.create_window((0, 0), window=self.task_inner_frame, anchor="nw")
        self.task_canvas.bind("<Configure>", lambda e: self.task_canvas.itemconfig(self.task_canvas_window, width=e.width))
        
        self.task_canvas.configure(yscrollcommand=self.task_scrollbar.set)
        self.task_canvas.pack(side="left", fill="both", expand=True)
        self.task_scrollbar.pack(side="right", fill="y")
        
        bind_mousewheel_to_all(self.task_inner_frame, self.task_canvas)

    def set_task_filter(self, f_key):
        self.task_filter = f_key
        for k, btn in self.filter_btns.items():
            if k == f_key:
                btn.config(bg=self.theme["btn"], fg=self.theme["btn_fg"])
            else:
                btn.config(bg=self.theme["card"], fg=self.theme["text"])
        self.refresh_task_list()

    def refresh_task_list(self):
        for widget in self.task_inner_frame.winfo_children():
            widget.destroy()
            
        g_status = "🟢 接続中" if self.google_sync.is_authenticated() else "⚪ 未連携 (デモ利用可)"
        self.sync_status_lbl.config(text=f"Google連携: {g_status}", bg=self.theme["card"], fg=self.theme["text"])
        self.task_sync_bar.config(bg=self.theme["card"])
        self.btn_tasks_sync.config(bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"])
        self.btn_cal_sync.config(bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"])
        
        # タスク追加フォームのテーマ更新
        self.task_add_frame.config(bg=self.theme["card"])
        self.task_add_title.config(bg=self.theme["card"], fg=self.theme["text"])
        self.top_input_row.config(bg=self.theme["card"])
        self.task_entry.config(bg=self.theme["input_bg"], fg=self.theme["input_fg"], insertbackground=self.theme["text"])
        self.task_target_lbl.config(bg=self.theme["card"], fg=self.theme["text"])
        self.bottom_opts_row.config(bg=self.theme["card"])
        self.task_tag_lbl.config(bg=self.theme["card"], fg=self.theme["sub_text"])
        self.task_prio_lbl.config(bg=self.theme["card"], fg=self.theme["sub_text"])
        self.task_add_btn.config(bg=self.theme["btn"], fg=self.theme["btn_fg"])
        
        # フィルターバーのテーマ更新
        self.filter_frame.config(bg=self.theme["bg"])
        for k, btn in self.filter_btns.items():
            if k == self.task_filter:
                btn.config(bg=self.theme["btn"], fg=self.theme["btn_fg"])
            else:
                btn.config(bg=self.theme["card"], fg=self.theme["text"])
                
        self.task_canvas.config(bg=self.theme["bg"])
        self.task_inner_frame.config(bg=self.theme["bg"])
        
        tasks = self.data_mgr.get_tasks()
        active_task = self.data_mgr.get_active_task()
        active_id = active_task["id"] if active_task else None
        
        # フィルター適用
        if self.task_filter == "active":
            tasks = [t for t in tasks if not t["is_done"]]
        elif self.task_filter == "done":
            tasks = [t for t in tasks if t["is_done"]]
            
        if not tasks:
            empty_lbl = tk.Label(self.task_inner_frame, text="該当するタスクはありません 🐾", font=FONT_TEXT, fg=self.theme["sub_text"], bg=self.theme["bg"], pady=20)
            empty_lbl.pack()
            return
            
        for t in tasks:
            t_id = t["id"]
            is_active = (t_id == active_id)
            card_bg = self.theme["header"] if is_active else self.theme["card"]
            
            card = tk.Frame(self.task_inner_frame, bg=card_bg, padx=10, pady=7, relief="flat", bd=0)
            card.pack(fill='x', pady=3, padx=2)
            
            top_line = tk.Frame(card, bg=card_bg)
            top_line.pack(fill='x')
            
            chk_var = tk.BooleanVar(value=t["is_done"])
            chk = tk.Checkbutton(top_line, variable=chk_var, bg=card_bg, activebackground=card_bg, command=lambda tid=t_id: self.toggle_task(tid))
            chk.pack(side='left')
            
            # タグと優先度バッジ
            tag_text = t.get("tag", "💼 仕事")
            prio_text = t.get("priority", "⚡ 中")
            tk.Label(top_line, text=tag_text, font=("Meiryo", 8), bg=self.theme["bg"], fg=self.theme["text"], padx=4).pack(side='left', padx=2)
            tk.Label(top_line, text=prio_text, font=("Meiryo", 8), bg=self.theme["bg"], fg=self.theme["accent"], padx=4).pack(side='left', padx=2)
            
            if t.get("google_id"):
                g_badge = tk.Label(top_line, text="G", font=("Segoe UI", 8, "bold"), bg=self.theme["btn_sec"], fg=GOOGLE_BLUE, padx=4)
                g_badge.pack(side='left', padx=(0, 4))
                
            strike = " (済)" if t["is_done"] else ""
            t_title = t["title"] + strike
            lbl_title = tk.Label(top_line, text=t_title, font=FONT_BOLD if is_active else FONT_TEXT, bg=card_bg, fg=self.theme["sub_text"] if t["is_done"] else self.theme["text"], anchor='w')
            lbl_title.pack(side='left', fill='x', expand=True, padx=4)
            
            pomo_str = f"🍅 {t['completed_pomo']}/{t['target_pomo']}"
            lbl_pomo = tk.Label(top_line, text=pomo_str, font=FONT_TEXT, bg=card_bg, fg=self.theme["work"])
            lbl_pomo.pack(side='left', padx=4)
            
            if not is_active and not t["is_done"]:
                select_btn = tk.Button(top_line, text="選択", font=("Meiryo", 8), bg=self.theme["btn"], fg=self.theme["btn_fg"], relief="flat", padx=6, cursor="hand2", command=lambda tid=t_id: self.select_task(tid))
                select_btn.pack(side='left', padx=2)
            elif is_active:
                tag = tk.Label(top_line, text="作業中", font=("Meiryo", 8, "bold"), bg=self.theme["work"], fg="#fff", padx=5)
                tag.pack(side='left', padx=2)
                
            del_btn = tk.Button(top_line, text="✕", font=("Meiryo", 8), bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"], relief="flat", padx=5, cursor="hand2", command=lambda tid=t_id: self.delete_task(tid))
            del_btn.pack(side='right')

            # 進捗プログレスバー
            prog_ratio = min(1.0, float(t['completed_pomo']) / max(1, t['target_pomo']))
            prog_frame = tk.Frame(card, bg=self.theme["border"], height=4)
            prog_frame.pack(fill='x', pady=(4, 1))
            prog_fill = tk.Frame(prog_frame, bg=self.theme["work"], height=4)
            prog_fill.place(relx=0, rely=0, relwidth=prog_ratio, relheight=1.0)

        bind_mousewheel_to_all(self.task_inner_frame, self.task_canvas)

    def add_new_task(self):
        title = self.task_entry.get().strip()
        if not title:
            return
        try:
            target = int(self.task_target_spin.get())
        except ValueError:
            target = 1
        tag = self.task_tag_var.get()
        prio = self.task_prio_var.get()
        self.data_mgr.add_task(title, target, tag=tag, priority=prio)
        self.task_entry.delete(0, 'end')
        self.refresh_task_list()
        self.refresh_cafe_elements()

    def toggle_task(self, task_id):
        t = self.data_mgr.toggle_task_done(task_id)
        if t and t["is_done"]:
            self.sound_mgr.play_se("level_up")
            if t.get("google_id"):
                threading.Thread(target=lambda: self.google_sync.complete_task(t["google_id"]), daemon=True).start()
        self.refresh_task_list()
        self.refresh_cafe_elements()

    def select_task(self, task_id):
        self.data_mgr.set_active_task(task_id)
        self.refresh_task_list()
        self.refresh_cafe_elements()

    def delete_task(self, task_id):
        self.data_mgr.delete_task(task_id)
        self.refresh_task_list()
        self.refresh_cafe_elements()

    def sync_google_tasks(self):
        tasks = self.google_sync.fetch_tasks()
        existing_google_ids = {t.get("google_id") for t in self.data_mgr.get_tasks() if t.get("google_id")}
        
        added_count = 0
        for g_task in tasks:
            if g_task["id"] not in existing_google_ids:
                self.data_mgr.add_task(g_task["title"], target_pomo=g_task.get("target_pomo", 2), google_id=g_task["id"])
                added_count += 1
                
        self.refresh_task_list()
        self.refresh_cafe_elements()
        self.sound_mgr.play_se("level_up")
        
        mode_str = "Google Tasks" if self.google_sync.is_authenticated() else "Google Tasks (サンプルデモ)"
        messagebox.showinfo("同期完了", f"{mode_str} から {added_count} 件のタスクを取り込みました！📝")

    def open_calendar_modal(self):
        modal = tk.Toplevel(self.root)
        modal.title("📅 今日のGoogleカレンダー予定")
        modal.geometry("420x450")
        modal.configure(bg=self.theme["bg"])
        modal.transient(self.root)
        modal.grab_set()

        tk.Label(modal, text="📅 今日のGoogleカレンダー予定", font=FONT_TITLE, bg=self.theme["bg"], fg=self.theme["text"]).pack(pady=10)
        
        events = self.google_sync.fetch_today_events()
        container = tk.Frame(modal, bg=self.theme["card"], padx=10, pady=10, relief="groove", bd=1)
        container.pack(fill='both', expand=True, padx=15, pady=5)
        
        if not events:
            tk.Label(container, text="今日の予定はありません ✨", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["sub_text"]).pack(pady=30)
        else:
            for ev in events:
                row = tk.Frame(container, bg=self.theme["card"], pady=4)
                row.pack(fill='x')
                time_str = f"[{ev['start']}]" if ev['start'] else ""
                tk.Label(row, text=f"{time_str} {ev['summary']}", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["text"], anchor='w').pack(side='left', fill='x', expand=True)
                add_btn = tk.Button(
                    row, text="タスク化 ＋", font=("Meiryo", 8), bg=self.theme["btn"], fg=self.theme["btn_fg"], relief="flat", padx=6, cursor="hand2",
                    command=lambda s=ev['summary']: self.add_event_as_task(s, modal)
                )
                add_btn.pack(side='right')

        close_btn = tk.Button(modal, text="閉じる", font=FONT_TEXT, bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"], relief="flat", padx=15, pady=4, command=modal.destroy)
        close_btn.pack(pady=10)

    def add_event_as_task(self, summary, modal):
        self.data_mgr.add_task(summary, target_pomo=2)
        self.sound_mgr.play_se("level_up")
        self.refresh_task_list()
        self.refresh_cafe_elements()
        messagebox.showinfo("タスク追加", f"「{summary}」をタスクに追加しました！")

    # --- 最初の相棒猫選択モーダル ---
    def open_starter_cat_modal(self):
        """最初の一匹を15種類の中から自由に選ぶモーダル"""
        modal = tk.Toplevel(self.root)
        modal.title("🐾 最初の相棒猫を選ぼう！")
        modal.geometry("460x580")
        modal.configure(bg=self.theme["bg"])
        modal.transient(self.root)
        modal.grab_set()

        tk.Label(modal, text="🐾 最初の相棒猫を選んでね！", font=FONT_TITLE, bg=self.theme["bg"], fg=self.theme["text"]).pack(pady=(12, 4))
        tk.Label(modal, text="15種類の中からお好きな猫を【無料】で最初の相棒にできます！\n選んだ猫はすぐにカフェに登場します ✨", font=FONT_TEXT, bg=self.theme["bg"], fg=self.theme["sub_text"], justify='center').pack(pady=(0, 8))

        container = tk.Frame(modal, bg=self.theme["bg"])
        container.pack(fill='both', expand=True, padx=10, pady=5)

        c_canvas = tk.Canvas(container, bg=self.theme["bg"], highlightthickness=0)
        s_bar = ttk.Scrollbar(container, orient="vertical", command=c_canvas.yview)
        c_inner = tk.Frame(c_canvas, bg=self.theme["bg"])

        c_inner.bind("<Configure>", lambda e: c_canvas.configure(scrollregion=c_canvas.bbox("all")))
        win = c_canvas.create_window((0, 0), window=c_inner, anchor="nw")
        c_canvas.bind("<Configure>", lambda e: c_canvas.itemconfig(win, width=e.width))

        c_canvas.configure(yscrollcommand=s_bar.set)
        c_canvas.pack(side="left", fill="both", expand=True)
        s_bar.pack(side="right", fill="y")

        def choose_starter(cid):
            self.data_mgr.set_starter_cat(cid)
            self._update_widget_cat_frames()
            self.sound_mgr.play_se("level_up")
            messagebox.showinfo("相棒決定！", "最初の相棒猫を設定しました！🐾")
            modal.destroy()
            self.refresh_cafe_elements()
            self.refresh_shop_view()

        cur_avatar = self.data_mgr.get_profile().get("avatar", "black")
        for cat in AVAILABLE_CATS:
            cid = cat["id"]
            card = tk.Frame(c_inner, bg=self.theme["card"], padx=10, pady=8, relief="solid", bd=1 if cid == cur_avatar else 0)
            card.pack(fill='x', pady=3, padx=4)

            tk.Label(card, text=cat["name"], font=FONT_BOLD, bg=self.theme["card"], fg=self.theme["text"]).pack(side='left')
            tk.Label(card, text=f" - {cat['desc']}", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["sub_text"]).pack(side='left', padx=4)

            btn_text = "相棒中 🌟" if cid == cur_avatar else "この子にする！🐾"
            btn = tk.Button(
                card, text=btn_text, font=FONT_TEXT,
                bg=self.theme["btn"] if cid != cur_avatar else self.theme["btn_sec"],
                fg=self.theme["btn_fg"] if cid != cur_avatar else self.theme["btn_sec_fg"],
                relief="flat", padx=8, pady=2, cursor="hand2",
                command=lambda c=cid: choose_starter(c)
            )
            btn.pack(side='right')

        bind_mousewheel_to_all(c_inner, c_canvas)

    # --- アカウント設定モーダル ---
    def open_account_modal(self):
        modal = tk.Toplevel(self.root)
        modal.title("👤 アカウント設定 & Google連携")
        modal.geometry("460x580")
        modal.configure(bg=self.theme["bg"])
        modal.transient(self.root)
        modal.grab_set()

        prof = self.data_mgr.get_profile()

        tk.Label(modal, text="👤 ユーザープロフィール & 連携設定", font=FONT_TITLE, bg=self.theme["bg"], fg=self.theme["text"]).pack(pady=(12, 6))

        p_card = tk.Frame(modal, bg=self.theme["card"], padx=15, pady=12, relief="groove", bd=1)
        p_card.pack(fill='x', padx=15, pady=5)

        tk.Label(p_card, text="ユーザー名:", font=FONT_BOLD, bg=self.theme["card"], fg=self.theme["text"]).grid(row=0, column=0, sticky='w', pady=6)
        name_entry = tk.Entry(p_card, font=FONT_TEXT, width=18, bg=self.theme["input_bg"], fg=self.theme["input_fg"], insertbackground=self.theme["text"])
        name_entry.insert(0, prof.get("name", "にゃんこマスター"))
        name_entry.grid(row=0, column=1, sticky='e', padx=5)

        tk.Label(p_card, text="相棒アバター猫:", font=FONT_BOLD, bg=self.theme["card"], fg=self.theme["text"]).grid(row=1, column=0, sticky='w', pady=6)
        avatar_var = tk.StringVar(value=prof.get("avatar", "black"))
        avatar_choices = [f"{c['id']} ({c['name']})" for c in AVAILABLE_CATS]
        avatar_combo = ttk.Combobox(p_card, textvariable=avatar_var, values=avatar_choices, state="readonly", width=18, font=FONT_TEXT)
        for opt in avatar_choices:
            if opt.startswith(prof.get("avatar", "black")):
                avatar_combo.set(opt)
                break
        avatar_combo.grid(row=1, column=1, sticky='e', padx=5)

        tk.Label(p_card, text="1日の目標ポモドーロ:", font=FONT_BOLD, bg=self.theme["card"], fg=self.theme["text"]).grid(row=2, column=0, sticky='w', pady=6)
        goal_spin = ttk.Spinbox(p_card, from_=1, to=20, width=5, font=FONT_TEXT)
        goal_spin.set(prof.get("daily_goal", 4))
        goal_spin.grid(row=2, column=1, sticky='e', padx=5)

        g_card = tk.Frame(modal, bg=self.theme["card"], padx=15, pady=12, relief="groove", bd=1)
        g_card.pack(fill='x', padx=15, pady=8)

        tk.Label(g_card, text="🌐 Google アカウント連携", font=FONT_SUB, bg=self.theme["card"], fg=self.theme["text"]).pack(anchor='w')
        
        is_auth = self.google_sync.is_authenticated()
        status_text = f"連携中: {self.google_sync.get_user_email() or '接続済み'}" if is_auth else "未接続 (Google Tasks / Calendar)"
        status_color = self.theme["break"] if is_auth else self.theme["sub_text"]
        
        status_lbl = tk.Label(g_card, text=status_text, font=FONT_TEXT, bg=self.theme["card"], fg=status_color)
        status_lbl.pack(anchor='w', pady=(2, 6))

        btn_g_frame = tk.Frame(g_card, bg=self.theme["card"])
        btn_g_frame.pack(fill='x', pady=4)

        if not is_auth:
            login_btn = tk.Button(
                btn_g_frame, text="Google アカウントと連携する 🌐",
                font=FONT_BOLD, bg=GOOGLE_BLUE, fg="#fff", relief="flat", padx=10, pady=5, cursor="hand2",
                command=lambda: self.start_google_login(modal)
            )
            login_btn.pack(side='left', fill='x', expand=True, padx=2)
        else:
            logout_btn = tk.Button(
                btn_g_frame, text="連携を解除する",
                font=FONT_TEXT, bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"], relief="flat", padx=10, pady=4, cursor="hand2",
                command=lambda: self.disconnect_google(modal)
            )
            logout_btn.pack(side='left', padx=2)

        help_btn = tk.Button(
            g_card, text="ℹ️ credentials.json の配置方法ガイド",
            font=("Meiryo", 8), bg=self.theme["card"], fg=GOOGLE_BLUE, relief="flat", cursor="hand2",
            command=self.show_google_guide
        )
        help_btn.pack(anchor='w', pady=(4, 0))

        def save_profile():
            raw_av = avatar_var.get().split()[0]
            new_name = name_entry.get().strip() or "にゃんこマスター"
            try:
                new_goal = int(goal_spin.get())
            except ValueError:
                new_goal = 4
            self.data_mgr.update_profile(name=new_name, avatar=raw_av, daily_goal=new_goal)
            self._update_widget_cat_frames()
            self.refresh_cafe_elements()
            self.refresh_task_list()
            messagebox.showinfo("更新完了", "プロフィールを更新しました！🐾")
            modal.destroy()

        save_btn = tk.Button(modal, text="💾 プロフィールを保存", font=FONT_SUB, bg=self.theme["btn"], fg=self.theme["btn_fg"], relief="flat", padx=15, pady=6, cursor="hand2", command=save_profile)
        save_btn.pack(pady=10)

    def start_google_login(self, modal):
        if not self.google_sync.has_credentials_file():
            self.show_google_guide()
            return
            
        success, msg = self.google_sync.login()
        if success:
            self.data_mgr.update_profile(google_connected=True, email=self.google_sync.get_user_email() or "")
            self.sound_mgr.play_se("level_up")
            messagebox.showinfo("連携成功", msg)
            modal.destroy()
            self.refresh_task_list()
        else:
            messagebox.showerror("連携失敗", msg)

    def disconnect_google(self, modal):
        self.google_sync.logout()
        self.data_mgr.update_profile(google_connected=False, email="")
        messagebox.showinfo("解除完了", "Googleアカウントとの連携を解除しました。")
        modal.destroy()
        self.refresh_task_list()

    def show_google_guide(self):
        guide = (
            "【Google 連携のセットアップ方法】\n\n"
            "1. Google Cloud Console (https://console.cloud.google.com/) にアクセス\n"
            "2. 新規プロジェクトを作成し、「Google Tasks API」と「Google Calendar API」を有効化\n"
            "3. 「OAuth 同意画面」を設定（ユーザータイプ：外部、テストユーザーにご自身のGmailを追加）\n"
            "4. 「認証情報」➔「OAuth クライアント IDの作成」➔ アプリケーションの種類：「デスクトップ アプリ」\n"
            "5. ダウンロードした JSON ファイルを「credentials.json」という名前に変更して\n"
            "   PomodoroTimer フォルダ直下に配置してください。\n\n"
            "※ credentials.json が無い状態でも、デモモードでGoogle連携の動作をそのまま体験いただけます！"
        )
        messagebox.showinfo("Google 連携ガイド", guide)

    # --- 3. ショップ & 育成タブ ---
    def _build_shop_tab(self):
        tab = tk.Frame(self.content_frame, bg=self.theme["bg"])
        self.tabs["shop"] = tab
        
        container = tk.Frame(tab, bg=self.theme["bg"])
        container.pack(fill='both', expand=True)
        
        self.shop_canvas = tk.Canvas(container, bg=self.theme["bg"], highlightthickness=0)
        self.shop_scrollbar = ttk.Scrollbar(container, orient="vertical", command=self.shop_canvas.yview)
        self.shop_inner = tk.Frame(self.shop_canvas, bg=self.theme["bg"])
        
        self.shop_inner.bind("<Configure>", lambda e: self.shop_canvas.configure(scrollregion=self.shop_canvas.bbox("all")))
        self.shop_win = self.shop_canvas.create_window((0, 0), window=self.shop_inner, anchor="nw")
        self.shop_canvas.bind("<Configure>", lambda e: self.shop_canvas.itemconfig(self.shop_win, width=e.width))
        
        self.shop_canvas.configure(yscrollcommand=self.shop_scrollbar.set)
        self.shop_canvas.pack(side="left", fill="both", expand=True)
        self.shop_scrollbar.pack(side="right", fill="y")
        
        bind_mousewheel_to_all(self.shop_inner, self.shop_canvas)

    def refresh_shop_view(self):
        for widget in self.shop_inner.winfo_children():
            widget.destroy()
            
        self.shop_canvas.config(bg=self.theme["bg"])
        self.shop_inner.config(bg=self.theme["bg"])
        
        cafe_data = self.data_mgr.get_cafe_data()
        treats = cafe_data["treats"]
        
        banner = tk.Frame(self.shop_inner, bg=self.theme["card"], padx=12, pady=10, relief="groove", bd=1)
        banner.pack(fill='x', pady=5, padx=4)
        tk.Label(banner, text="🎁 カフェショップ & 育成", font=FONT_SUB, bg=self.theme["card"], fg=self.theme["text"]).pack(anchor='w')
        tk.Label(banner, text="ポモドーロを1回完了するごとに おやつ🐟 が1つもらえます！\nおやつを集めて新しい猫や家具をアンロックしよう！", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["sub_text"], justify='left').pack(anchor='w', pady=(2, 6))
        
        starter_btn = tk.Button(
            banner, text="🐾 最初の相棒猫を選び直す (無料)", font=FONT_BOLD,
            bg=self.theme["btn"], fg=self.theme["btn_fg"], relief="flat", padx=10, pady=4, cursor="hand2",
            command=self.open_starter_cat_modal
        )
        starter_btn.pack(anchor='w')
        
        tk.Label(self.shop_inner, text="🐾 新しい猫を迎える", font=FONT_SUB, bg=self.theme["bg"], fg=self.theme["text"]).pack(anchor='w', pady=(10, 2), padx=4)
        
        unlocked_cats = cafe_data.get("unlocked_cats", ["black"])
        for cat in AVAILABLE_CATS:
            c_id = cat["id"]
            is_unlocked = c_id in unlocked_cats
            
            card = tk.Frame(self.shop_inner, bg=self.theme["card"], padx=12, pady=9, relief="solid", bd=0)
            card.pack(fill='x', pady=3, padx=4)
            
            tk.Label(card, text=cat["name"], font=FONT_BOLD, bg=self.theme["card"], fg=self.theme["text"]).pack(side='left')
            tk.Label(card, text=f" - {cat['desc']}", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["sub_text"]).pack(side='left', padx=5)
            
            if is_unlocked:
                tk.Label(card, text="在籍中 ✨", font=FONT_BOLD, bg=self.theme["card"], fg=self.theme["break"]).pack(side='right')
            else:
                can_buy = treats >= cat["cost"]
                btn = tk.Button(
                    card, text=f"迎える (🐟 {cat['cost']}個)",
                    font=FONT_TEXT, bg=self.theme["btn"] if can_buy else self.theme["btn_sec"],
                    fg=self.theme["btn_fg"] if can_buy else self.theme["btn_sec_fg"],
                    relief="flat", padx=8, pady=2, cursor="hand2" if can_buy else "arrow",
                    state="normal" if can_buy else "disabled",
                    command=lambda cid=c_id: self.buy_cat(cid)
                )
                btn.pack(side='right')
                
        tk.Label(self.shop_inner, text="🛋️ 家具とおもちゃ", font=FONT_SUB, bg=self.theme["bg"], fg=self.theme["text"]).pack(anchor='w', pady=(12, 2), padx=4)
        
        unlocked_items = cafe_data.get("unlocked_items", ["cushion"])
        for item in AVAILABLE_ITEMS:
            i_id = item["id"]
            is_unlocked = i_id in unlocked_items
            
            card = tk.Frame(self.shop_inner, bg=self.theme["card"], padx=12, pady=9, relief="solid", bd=0)
            card.pack(fill='x', pady=3, padx=4)
            
            tk.Label(card, text=f"{item['icon']} {item['name']}", font=FONT_BOLD, bg=self.theme["card"], fg=self.theme["text"]).pack(side='left')
            tk.Label(card, text=f" - {item['desc']}", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["sub_text"]).pack(side='left', padx=5)
            
            if is_unlocked:
                tk.Label(card, text="設置済み ✨", font=FONT_BOLD, bg=self.theme["card"], fg=self.theme["break"]).pack(side='right')
            else:
                can_buy = treats >= item["cost"]
                btn = tk.Button(
                    card, text=f"設置 (🐟 {item['cost']}個)",
                    font=FONT_TEXT, bg=self.theme["btn"] if can_buy else self.theme["btn_sec"],
                    fg=self.theme["btn_fg"] if can_buy else self.theme["btn_sec_fg"],
                    relief="flat", padx=8, pady=2, cursor="hand2" if can_buy else "arrow",
                    state="normal" if can_buy else "disabled",
                    command=lambda iid=i_id: self.buy_item(iid)
                )
                btn.pack(side='right')

        bind_mousewheel_to_all(self.shop_inner, self.shop_canvas)

    def buy_cat(self, cat_id):
        success, msg = self.data_mgr.unlock_cat(cat_id)
        if success:
            self.sound_mgr.play_se("level_up")
            messagebox.showinfo("お迎え成功！", msg)
            self.refresh_shop_view()
            self.refresh_cafe_elements()
        else:
            messagebox.showwarning("購入できません", msg)

    def buy_item(self, item_id):
        success, msg = self.data_mgr.unlock_item(item_id)
        if success:
            self.sound_mgr.play_se("level_up")
            messagebox.showinfo("設置完了！", msg)
            self.refresh_shop_view()
            self.refresh_cafe_elements()
        else:
            messagebox.showwarning("購入できません", msg)

    # --- 4. 統計＆実績タブ ---
    def _build_stats_tab(self):
        tab = tk.Frame(self.content_frame, bg=self.theme["bg"])
        self.tabs["stats"] = tab
        
        # スクロール対応キャンバス
        self.stats_canvas = tk.Canvas(tab, bg=self.theme["bg"], highlightthickness=0)
        self.stats_scrollbar = ttk.Scrollbar(tab, orient="vertical", command=self.stats_canvas.yview)
        self.stats_scroll_frame = tk.Frame(self.stats_canvas, bg=self.theme["bg"])
        
        self.stats_scroll_frame.bind(
            "<Configure>",
            lambda e: self.stats_canvas.configure(scrollregion=self.stats_canvas.bbox("all"))
        )
        self.stats_canvas_window = self.stats_canvas.create_window((0, 0), window=self.stats_scroll_frame, anchor="nw")
        self.stats_canvas.bind(
            "<Configure>",
            lambda e: self.stats_canvas.itemconfig(self.stats_canvas_window, width=e.width)
        )
        self.stats_canvas.configure(yscrollcommand=self.stats_scrollbar.set)
        
        self.stats_canvas.pack(side="left", fill="both", expand=True)
        self.stats_scrollbar.pack(side="right", fill="y")
        bind_mousewheel_to_all(self.stats_scroll_frame, self.stats_canvas)
        
        # 1. サマリーカード (4つの主要KPI)
        self.stats_kpi_card = tk.Frame(self.stats_scroll_frame, bg=self.theme["card"], padx=12, pady=12, relief="flat", bd=0)
        self.stats_kpi_card.pack(fill="x", padx=6, pady=6)
        
        self.kpi_title = tk.Label(self.stats_kpi_card, text="📊 集中パフォーマンス・サマリー", font=FONT_SUB, bg=self.theme["card"], fg=self.theme["text"])
        self.kpi_title.pack(anchor="w", pady=(0, 8))
        
        self.kpi_grid = tk.Frame(self.stats_kpi_card, bg=self.theme["card"])
        self.kpi_grid.pack(fill="x")
        
        self.kpi_labels = {}
        self.kpi_cells = []
        self.kpi_cell_titles = []
        kpi_items = [
            ("total_pomo", "🍅 累計ポモドーロ", "0 回"),
            ("total_time", "⏱️ 総集中時間", "0 分"),
            ("today_pomo", "🎯 本日の達成", "0 / 4"),
            ("streak", "🔥 連続達成日数", "1 日")
        ]
        for idx, (k_id, title, default_val) in enumerate(kpi_items):
            r, c = idx // 2, idx % 2
            cell = tk.Frame(self.kpi_grid, bg=self.theme["bg"], padx=10, pady=8, relief="flat")
            cell.grid(row=r, column=c, padx=4, pady=4, sticky="nsew")
            self.kpi_grid.grid_columnconfigure(c, weight=1)
            self.kpi_cells.append(cell)
            
            lbl_title = tk.Label(cell, text=title, font=FONT_TEXT, bg=self.theme["bg"], fg=self.theme["sub_text"])
            lbl_title.pack(anchor="w")
            self.kpi_cell_titles.append(lbl_title)
            
            lbl_val = tk.Label(cell, text=default_val, font=FONT_SUB, bg=self.theme["bg"], fg=self.theme["work"])
            lbl_val.pack(anchor="w", pady=(2, 0))
            self.kpi_labels[k_id] = lbl_val

        # 2. 週間推移バーグラフカード
        self.stats_chart_card = tk.Frame(self.stats_scroll_frame, bg=self.theme["card"], padx=12, pady=12, relief="flat", bd=0)
        self.stats_chart_card.pack(fill="x", padx=6, pady=6)
        
        self.chart_title = tk.Label(self.stats_chart_card, text="📈 週間集中レポート (直近7日間)", font=FONT_SUB, bg=self.theme["card"], fg=self.theme["text"])
        self.chart_title.pack(anchor="w", pady=(0, 6))
        
        self.chart_canvas = tk.Canvas(self.stats_chart_card, height=150, bg=self.theme["bg"], highlightthickness=0)
        self.chart_canvas.pack(fill="x", pady=4)

        # 3. 実績＆トロフィーバッジカード
        self.stats_ach_card = tk.Frame(self.stats_scroll_frame, bg=self.theme["card"], padx=12, pady=12, relief="flat", bd=0)
        self.stats_ach_card.pack(fill="x", padx=6, pady=6)
        
        self.ach_title = tk.Label(self.stats_ach_card, text="🏆 実績・称号バッジ", font=FONT_SUB, bg=self.theme["card"], fg=self.theme["text"])
        self.ach_title.pack(anchor="w", pady=(0, 8))
        
        self.ach_list_frame = tk.Frame(self.stats_ach_card, bg=self.theme["card"])
        self.ach_list_frame.pack(fill="x")

    def refresh_stats_view(self):
        """統計画面のKPI・グラフ・実績リストを最新データで再描画"""
        if not hasattr(self, 'stats_canvas'):
            return
            
        self.stats_canvas.config(bg=self.theme["bg"])
        self.stats_scroll_frame.config(bg=self.theme["bg"])
        self.stats_kpi_card.config(bg=self.theme["card"])
        self.kpi_title.config(bg=self.theme["card"], fg=self.theme["text"])
        self.kpi_grid.config(bg=self.theme["card"])
        
        for cell in self.kpi_cells:
            cell.config(bg=self.theme["bg"])
        for lbl_t in self.kpi_cell_titles:
            lbl_t.config(bg=self.theme["bg"], fg=self.theme["sub_text"])
            
        self.stats_chart_card.config(bg=self.theme["card"])
        self.chart_title.config(bg=self.theme["card"], fg=self.theme["text"])
        self.chart_canvas.config(bg=self.theme["bg"])
        self.stats_ach_card.config(bg=self.theme["card"])
        self.ach_title.config(bg=self.theme["card"], fg=self.theme["text"])
        self.ach_list_frame.config(bg=self.theme["card"])
        
        stats = self.data_mgr.get_stats_data()
        cafe = self.data_mgr.get_cafe_data()
        prof = self.data_mgr.get_profile()
        
        total_pomo = cafe["total_pomodoros"]
        total_mins = stats.get("total_minutes", total_pomo * self.work_mins)
        streak = stats.get("streak_days", 1)
        daily_hist = stats.get("daily_history", {})
        
        import time, datetime
        today_str = time.strftime("%Y-%m-%d")
        today_done = daily_hist.get(today_str, total_pomo)
        
        hours = total_mins // 60
        mins = total_mins % 60
        time_str = f"{hours}時間 {mins}分" if hours > 0 else f"{mins}分"
        
        self.kpi_labels["total_pomo"].config(text=f"{total_pomo} 回", fg=self.theme["work"], bg=self.theme["bg"])
        self.kpi_labels["total_time"].config(text=time_str, fg=self.theme["work"], bg=self.theme["bg"])
        self.kpi_labels["today_pomo"].config(text=f"{today_done} / {prof['daily_goal']} 🍅", fg=self.theme["work"], bg=self.theme["bg"])
        self.kpi_labels["streak"].config(text=f"{streak} 日間連続 🔥", fg=self.theme["accent"], bg=self.theme["bg"])
        
        # グラフ描画 (直近7日間)
        self.chart_canvas.delete("all")
        cw = self.chart_canvas.winfo_width()
        if cw < 50:
            cw = 460
        ch = 150
        
        today_date = datetime.date.today()
        days_data = []
        for i in range(6, -1, -1):
            d = today_date - datetime.timedelta(days=i)
            d_str = d.strftime("%Y-%m-%d")
            d_label = d.strftime("%m/%d") if i != 0 else "今日"
            val = daily_hist.get(d_str, 0)
            if i == 0 and val == 0 and total_pomo > 0:
                val = today_done
            days_data.append((d_label, val))
            
        max_val = max(max([v for _, v in days_data]), 4)
        bar_w = (cw - 60) / 7.0
        
        # 目標ライン
        goal_y = ch - 30 - (float(prof['daily_goal']) / max_val) * (ch - 60)
        self.chart_canvas.create_line(30, goal_y, cw - 10, goal_y, fill=self.theme["border"], dash=(4, 4))
        self.chart_canvas.create_text(25, goal_y, text=f"{prof['daily_goal']}", font=("Meiryo", 8), fill=self.theme["sub_text"])
        
        for idx, (label, val) in enumerate(days_data):
            bx = 35 + idx * bar_w
            bar_height = (float(val) / max_val) * (ch - 60)
            by1 = ch - 25
            by0 = by1 - bar_height
            
            # バー
            color = self.theme["work"] if idx == 6 else self.theme["btn"]
            self.chart_canvas.create_rectangle(bx, by0, bx + bar_w - 12, by1, fill=color, outline="")
            
            # 数値
            if val > 0:
                self.chart_canvas.create_text(bx + (bar_w - 12)/2, by0 - 8, text=str(val), font=("Meiryo", 8, "bold"), fill=self.theme["text"])
            # 日付ラベル
            self.chart_canvas.create_text(bx + (bar_w - 12)/2, ch - 12, text=label, font=("Meiryo", 8), fill=self.theme["sub_text"])

        # 実績バッジ一覧の描画
        for w in self.ach_list_frame.winfo_children():
            w.destroy()
            
        achievements = self.data_mgr.get_achievements()
        for ach in achievements:
            is_unlocked = ach.get("unlocked", False)
            card_bg = self.theme["header"] if is_unlocked else self.theme["bg"]
            
            row = tk.Frame(self.ach_list_frame, bg=card_bg, padx=10, pady=8, relief="flat")
            row.pack(fill="x", pady=3)
            
            icon = "🏆" if is_unlocked else "🔒"
            status_text = "解除済み ✨" if is_unlocked else "未解除"
            status_color = self.theme["accent"] if is_unlocked else self.theme["sub_text"]
            
            left_box = tk.Frame(row, bg=card_bg)
            left_box.pack(side="left", fill="x", expand=True)
            
            tk.Label(left_box, text=f"{icon} {ach['name']}", font=FONT_BOLD, bg=card_bg, fg=self.theme["text"]).pack(anchor="w")
            tk.Label(left_box, text=ach['desc'], font=FONT_TEXT, bg=card_bg, fg=self.theme["sub_text"]).pack(anchor="w")
            
            tk.Label(row, text=status_text, font=FONT_BOLD, bg=card_bg, fg=status_color).pack(side="right", padx=6)

    # --- 5. 設定タブ ---
    def _build_settings_tab(self):
        tab = tk.Frame(self.content_frame, bg=self.theme["bg"])
        self.tabs["settings"] = tab
        
        self.settings_card = tk.Frame(tab, bg=self.theme["card"], padx=15, pady=15, relief="groove", bd=1)
        self.settings_card.pack(fill='both', expand=True, pady=5)
        
        self.settings_title = tk.Label(self.settings_card, text="⚙️ ポモドーロ & サウンド & テーマ設定", font=FONT_SUB, bg=self.theme["card"], fg=self.theme["text"])
        self.settings_title.pack(anchor='w', pady=(0, 10))
        
        self.settings_theme_lbl = tk.Label(self.settings_card, text="🎨 アプリのテーマカラー", font=FONT_BOLD, bg=self.theme["card"], fg=self.theme["text"])
        self.settings_theme_lbl.pack(anchor='w', pady=(5, 4))
        
        self.theme_frame = tk.Frame(self.settings_card, bg=self.theme["card"])
        self.theme_frame.pack(fill='x', pady=2)
        
        cur_theme_key = self.data_mgr.get_setting("theme")
        self.theme_var = tk.StringVar(value=cur_theme_key)
        
        self.theme_combo = ttk.Combobox(self.theme_frame, textvariable=self.theme_var, values=[f"{k} ({v['name']})" for k, v in THEMES.items()], state="readonly", width=26, font=FONT_TEXT)
        for opt in self.theme_combo["values"]:
            if opt.startswith(cur_theme_key):
                self.theme_combo.set(opt)
                break
        self.theme_combo.pack(side='left', padx=(0, 8))
        
        def on_theme_change():
            t_key = self.theme_var.get().split()[0]
            self.apply_theme(t_key)
            messagebox.showinfo("テーマ変更", f"テーマを「{THEMES[t_key]['name']}」に変更しました！")
            
        self.theme_apply_btn = tk.Button(self.theme_frame, text="適用 🎨", font=FONT_BOLD, bg=self.theme["btn"], fg=self.theme["btn_fg"], relief="flat", padx=8, pady=2, cursor="hand2", command=on_theme_change)
        self.theme_apply_btn.pack(side='left')

        # 時間設定グリッド
        self.grid_frame = tk.Frame(self.settings_card, bg=self.theme["card"])
        self.grid_frame.pack(fill='x', pady=(15, 5))
        
        self.lbl_work = tk.Label(self.grid_frame, text="作業時間 (分):", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["text"])
        self.lbl_work.grid(row=0, column=0, sticky='w', pady=6)
        self.spin_work = ttk.Spinbox(self.grid_frame, from_=1, to=90, width=5, font=FONT_TEXT)
        self.spin_work.set(self.data_mgr.get_setting("work_minutes"))
        self.spin_work.grid(row=0, column=1, sticky='e', padx=10)
        
        self.lbl_short = tk.Label(self.grid_frame, text="短い休憩時間 (分):", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["text"])
        self.lbl_short.grid(row=1, column=0, sticky='w', pady=6)
        self.spin_short_break = ttk.Spinbox(self.grid_frame, from_=1, to=30, width=5, font=FONT_TEXT)
        self.spin_short_break.set(self.data_mgr.get_setting("short_break_minutes"))
        self.spin_short_break.grid(row=1, column=1, sticky='e', padx=10)
        
        self.lbl_long = tk.Label(self.grid_frame, text="長い休憩時間 (分):", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["text"])
        self.lbl_long.grid(row=2, column=0, sticky='w', pady=6)
        self.spin_long_break = ttk.Spinbox(self.grid_frame, from_=1, to=60, width=5, font=FONT_TEXT)
        self.spin_long_break.set(self.data_mgr.get_setting("long_break_minutes"))
        self.spin_long_break.grid(row=2, column=1, sticky='e', padx=10)
        
        self.lbl_interval = tk.Label(self.grid_frame, text="長休憩までのサイクル数:", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["text"])
        self.lbl_interval.grid(row=3, column=0, sticky='w', pady=6)
        self.spin_interval = ttk.Spinbox(self.grid_frame, from_=2, to=8, width=5, font=FONT_TEXT)
        self.spin_interval.set(self.data_mgr.get_setting("long_break_interval"))
        self.spin_interval.grid(row=3, column=1, sticky='e', padx=10)
        
        # サウンド
        self.lbl_sound_title = tk.Label(self.settings_card, text="サウンド設定", font=FONT_BOLD, bg=self.theme["card"], fg=self.theme["text"])
        self.lbl_sound_title.pack(anchor='w', pady=(15, 5))
        
        self.se_var = tk.BooleanVar(value=self.data_mgr.get_setting("se_enabled"))
        self.chk_se = tk.Checkbutton(self.settings_card, text="効果音 (SE) を鳴らす (ニャー・チャイム)", variable=self.se_var, font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["text"], activebackground=self.theme["card"])
        self.chk_se.pack(anchor='w', pady=2)
        
        self.bgm_frame = tk.Frame(self.settings_card, bg=self.theme["card"])
        self.bgm_frame.pack(fill='x', pady=4)
        self.lbl_bgm = tk.Label(self.bgm_frame, text="環境音 BGM:", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["text"])
        self.lbl_bgm.pack(side='left')
        
        self.bgm_var = tk.StringVar(value=self.data_mgr.get_setting("bgm_type"))
        self.bgm_combo = ttk.Combobox(self.bgm_frame, textvariable=self.bgm_var, values=["none", "lofi", "fire", "rain", "purr", "forest", "wave"], state="readonly", width=14, font=FONT_TEXT)
        self.bgm_combo.pack(side='left', padx=10)
        
        self.lbl_bgm_hint = tk.Label(self.settings_card, text="※ lofi=チルピアノ / fire=焚き火 / rain=雨 / purr=猫ゴロゴロ / forest=森 / wave=波", font=("Meiryo", 8), bg=self.theme["card"], fg=self.theme["sub_text"])
        self.lbl_bgm_hint.pack(anchor='w', pady=(0, 6))
        
        # 天候・パーティクル演出設定
        self.weather_frame = tk.Frame(self.settings_card, bg=self.theme["card"])
        self.weather_frame.pack(fill='x', pady=4)
        self.lbl_weather = tk.Label(self.weather_frame, text="カフェの天候演出:", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["text"])
        self.lbl_weather.pack(side='left')
        
        self.weather_var = tk.StringVar(value=self.data_mgr.get_setting("weather") or "auto")
        self.weather_combo = ttk.Combobox(self.weather_frame, textvariable=self.weather_var, values=["auto (時間連動)", "sakura (桜吹雪)", "rain (静かな雨)", "stars (星空・流星)", "clear (木漏れ日)"], state="readonly", width=18, font=FONT_TEXT)
        self.weather_combo.pack(side='left', padx=10)
        
        self.save_settings_btn = tk.Button(self.settings_card, text="💾 設定を保存する", font=FONT_SUB, bg=self.theme["btn"], fg=self.theme["btn_fg"], relief="flat", padx=15, pady=6, cursor="hand2", command=self.save_settings)
        self.save_settings_btn.pack(pady=(16, 0))

    def refresh_settings_view(self):
        if not hasattr(self, 'settings_card'):
            return
        self.tabs["settings"].config(bg=self.theme["bg"])
        self.settings_card.config(bg=self.theme["card"])
        self.settings_title.config(bg=self.theme["card"], fg=self.theme["text"])
        self.settings_theme_lbl.config(bg=self.theme["card"], fg=self.theme["text"])
        self.theme_frame.config(bg=self.theme["card"])
        self.theme_apply_btn.config(bg=self.theme["btn"], fg=self.theme["btn_fg"])
        self.grid_frame.config(bg=self.theme["card"])
        self.lbl_work.config(bg=self.theme["card"], fg=self.theme["text"])
        self.lbl_short.config(bg=self.theme["card"], fg=self.theme["text"])
        self.lbl_long.config(bg=self.theme["card"], fg=self.theme["text"])
        self.lbl_interval.config(bg=self.theme["card"], fg=self.theme["text"])
        self.lbl_sound_title.config(bg=self.theme["card"], fg=self.theme["text"])
        self.chk_se.config(bg=self.theme["card"], fg=self.theme["text"], activebackground=self.theme["card"])
        self.bgm_frame.config(bg=self.theme["card"])
        self.lbl_bgm.config(bg=self.theme["card"], fg=self.theme["text"])
        self.lbl_bgm_hint.config(bg=self.theme["card"], fg=self.theme["sub_text"])
        self.weather_frame.config(bg=self.theme["card"])
        self.lbl_weather.config(bg=self.theme["card"], fg=self.theme["text"])
        self.save_settings_btn.config(bg=self.theme["btn"], fg=self.theme["btn_fg"])

    def save_settings(self):
        try:
            w_m = int(self.spin_work.get())
            sb_m = int(self.spin_short_break.get())
            lb_m = int(self.spin_long_break.get())
            interval = int(self.spin_interval.get())
        except ValueError:
            messagebox.showerror("入力エラー", "時間は数値で指定してください。")
            return
            
        self.data_mgr.set_setting("work_minutes", w_m)
        self.data_mgr.set_setting("short_break_minutes", sb_m)
        self.data_mgr.set_setting("long_break_minutes", lb_m)
        self.data_mgr.set_setting("long_break_interval", interval)
        self.data_mgr.set_setting("se_enabled", self.se_var.get())
        self.data_mgr.set_setting("bgm_type", self.bgm_var.get())
        w_val = self.weather_var.get().split()[0]
        self.data_mgr.set_setting("weather", w_val)
        
        self.work_mins = w_m
        self.short_break_mins = sb_m
        self.long_break_mins = lb_m
        self.long_break_interval = interval
        self.sound_mgr.se_enabled = self.se_var.get()
        self.sound_mgr.set_bgm(self.bgm_var.get())
        
        if not self.is_running:
            self.reset_timer()
            
        messagebox.showinfo("保存完了", "設定を保存しました！🐾")

    # --- 5. ミニウィジェット ---
    def _build_widget(self):
        self.widget = tk.Toplevel(self.root)
        self.widget.overrideredirect(True)
        self.widget.attributes("-topmost", True)
        self.widget.attributes("-alpha", 0.94)
        self.widget.configure(bg=self.theme["border"])
        self.widget.withdraw()

        screen_w = self.root.winfo_screenwidth()
        screen_h = self.root.winfo_screenheight()
        self.widget.geometry(f"+{screen_w - 290}+{screen_h - 100}")

        self.widget_bar = tk.Frame(self.widget, bg=self.theme["bg"], padx=8, pady=4, cursor="hand2")
        self.widget_bar.pack(fill='both', expand=True, padx=1, pady=1)

        if self.has_images:
            self.widget_cat = tk.Label(self.widget_bar, image=self.widget_cat_frames["sleep"][0], bg=self.theme["bg"])
        else:
            self.widget_cat = tk.Label(self.widget_bar, text="(=^・^=)", font=("Meiryo", 9), fg=self.theme["accent"], bg=self.theme["bg"])
        self.widget_cat.pack(side='left', padx=(0, 4))

        self.widget_label = tk.Label(self.widget_bar, text=self.format_time(self.time_left), font=("Comic Sans MS", 14, "bold"), fg=self.theme["work"], bg=self.theme["bg"])
        self.widget_label.pack(side='left', padx=(0, 5))

        self.widget_center_box = tk.Frame(self.widget_bar, bg=self.theme["bg"])
        self.widget_center_box.pack(side='left', fill='y', padx=(0, 4))

        self.widget_status = tk.Label(self.widget_center_box, text="おしごと", font=("Meiryo", 7, "bold"), fg=self.theme["work"], bg=self.theme["bg"], anchor='w')
        self.widget_status.pack(anchor='w')

        self.widget_task = tk.Label(self.widget_center_box, text="タスクなし", font=("Meiryo", 7), fg=self.theme["text"], bg=self.theme["bg"], anchor='w')
        self.widget_task.pack(anchor='w')

        self.widget_play_btn = tk.Button(
            self.widget_bar, text="▶", font=("Segoe UI", 9, "bold"),
            bg=self.theme["btn"], fg=self.theme["btn_fg"], relief="flat", padx=5, pady=0,
            cursor="hand2", command=self.toggle_timer
        )
        self.widget_play_btn.pack(side='right', padx=(2, 0))

        self.menu = tk.Menu(self.root, tearoff=0)
        self.menu.add_command(label="アプリを開く (復帰)", command=self.restore_from_widget)
        self.menu.add_command(label="タイマー開始 / 停止", command=self.toggle_timer)
        self.menu.add_separator()
        self.menu.add_command(label="終了 (Quit)", command=self.quit_app)

        self.offset_x = 0
        self.offset_y = 0
        bind_widgets = (self.widget, self.widget_bar, self.widget_cat, self.widget_label, self.widget_center_box, self.widget_status, self.widget_task)
        for w in bind_widgets:
            w.bind("<Button-1>", self.click_window)
            w.bind("<B1-Motion>", self.drag_window)
            w.bind("<Double-Button-1>", lambda e: self.restore_from_widget())
            w.bind("<Button-3>", self.show_menu)

        self.root.bind("<Unmap>", self.on_minimize)
        self.root.bind("<Map>", self.on_restore)

    def restore_from_widget(self):
        self.root.deiconify()
        self.root.state('normal')
        self.root.lift()
        self.widget.withdraw()

    def click_window(self, event):
        self.offset_x = event.x
        self.offset_y = event.y

    def drag_window(self, event):
        x = self.widget.winfo_pointerx() - self.offset_x
        y = self.widget.winfo_pointery() - self.offset_y
        self.widget.geometry(f"+{x}+{y}")

    def show_menu(self, event):
        self.menu.post(event.x_root, event.y_root)

    def quit_app(self):
        self.is_alive = False
        self.is_running = False
        try:
            self.sound_mgr.stop_bgm()
        except Exception:
            pass
        try:
            self.root.quit()
            self.root.destroy()
        except Exception:
            pass

    def on_minimize(self, event):
        if event.widget == self.root and self.root.state() == "iconic":
            self.widget.deiconify()

    def on_restore(self, event):
        if event.widget == self.root and self.root.state() == "normal":
            self.widget.withdraw()

    # --- タイマーコアロジック ---
    def format_time(self, seconds):
        m, s = divmod(seconds, 60)
        return f"{m:02d}:{s:02d}"

    def toggle_timer(self, event=None):
        self.is_running = not self.is_running
        self.start_btn.config(text="⏸ 停止" if self.is_running else "▶ 開始")
        self.update_status_display()

    def reset_timer(self):
        self.is_running = False
        self.session_mode = "work"
        self.time_left = self.work_mins * 60
        self.start_btn.config(text="▶ 開始")
        self.timer_label.config(text=self.format_time(self.time_left))
        self.widget_label.config(text=self.format_time(self.time_left))
        self.update_status_display()

    def switch_mode(self):
        if self.session_mode == "work":
            self.sound_mgr.play_se("work_end")
            self.data_mgr.add_pomodoro_reward()
            self.data_mgr.increment_active_task_pomo()
            
            if self.cycle_count >= self.long_break_interval:
                self.session_mode = "long_break"
                self.time_left = self.long_break_mins * 60
                self.cycle_count = 1
            else:
                self.session_mode = "short_break"
                self.time_left = self.short_break_mins * 60
                self.cycle_count += 1
        else:
            self.sound_mgr.play_se("break_end")
            self.session_mode = "work"
            self.time_left = self.work_mins * 60
            
        self.is_running = False
        self.start_btn.config(text="▶ 開始")
        self.update_status_display()
        self.refresh_cafe_elements()
        
        if self.widget.state() == "normal":
            self.widget.lift()
        else:
            self.root.deiconify()
            self.root.lift()

    def update_status_display(self):
        paws = ""
        for i in range(1, self.long_break_interval + 1):
            if i < self.cycle_count:
                paws += "🐾 "
            elif i == self.cycle_count:
                paws += "🐾 " if self.session_mode != "work" else "⚪ "
            else:
                paws += "⚪ "
                
        self.cycle_label.config(text=f"セット {self.cycle_count}/{self.long_break_interval} {paws}")
        
        if self.session_mode == "work":
            color = self.theme["work"]
            state = "おしごと中！🔥" if self.is_running else "おしごと (停止中)"
            short_state = "🔥 おしごと" if self.is_running else "💤 停止中"
        elif self.session_mode == "short_break":
            color = self.theme["break"]
            state = "短い休憩中 ☕" if self.is_running else "休憩 (停止中)"
            short_state = "☕ 休憩中" if self.is_running else "☕ 停止中"
        else:
            color = self.theme["long_break"]
            state = "長いご褒美休憩 🍰" if self.is_running else "長休憩 (停止中)"
            short_state = "🍰 長休憩" if self.is_running else "🍰 停止中"
            
        self.status_label.config(text=state, fg=color)
        self.timer_label.config(fg=color)
        self.widget_label.config(fg=color)
        self.widget_status.config(text=short_state, fg=color)
        self.widget_play_btn.config(text="⏸" if self.is_running else "▶")
        
        active_t = self.data_mgr.get_active_task()
        t_text = active_t["title"][:9] + "..." if active_t and len(active_t["title"]) > 9 else (active_t["title"] if active_t else "タスクなし")
        self.widget_task.config(text=f"📝 {t_text}")

    def update_clock(self):
        if not getattr(self, 'is_alive', True):
            return
            
        if self.is_running:
            if self.time_left > 0:
                self.time_left -= 1
                t_str = self.format_time(self.time_left)
                self.timer_label.config(text=t_str)
                self.widget_label.config(text=t_str)
            else:
                self.switch_mode()

        if getattr(self, 'is_alive', True):
            try:
                self.root.after(1000, self.update_clock)
            except Exception:
                pass

    # --- アニメーション & 猫の自律エコシステムAI ---
    def process_cat_ai(self, cat):
        # 猫同士のじゃれあい判定 (近くに別の猫がいる場合)
        for other in self.cats:
            if other["id"] != cat["id"]:
                dist = math.hypot(cat["x"] - other["x"], cat["y"] - other["y"])
                if dist < 34 and cat["state"] in ["walk", "dash"] and random.random() < 0.16:
                    cat["state"] = random.choice(["play", "groom"])
                    cat["state_timer"] = random.randint(30, 60)
                    other["state"] = random.choice(["play", "sit"])
                    other["state_timer"] = random.randint(30, 60)
                    # 鼻タッチ・じゃれあいハート
                    hx = (cat["x"] + other["x"]) / 2
                    hy = min(cat["y"], other["y"]) - 18
                    h_id = self.cat_canvas.create_text(hx, hy, text="💖", font=("Segoe UI Emoji", 13), fill=self.theme["work"])
                    self.floating_effects.append({"id": h_id, "x": hx, "y": hy, "life": 22})
                    return

        # 家具インタラクション判定
        unlocked_items = self.data_mgr.get_cafe_data().get("unlocked_items", [])
        if "cushion" in unlocked_items and math.hypot(cat["x"] - 75, cat["y"] - 205) < 32 and random.random() < 0.18:
            cat["state"] = random.choice(["groom", "stretch", "sit"])
            cat["state_timer"] = random.randint(40, 90)
            return
        if "toy_mouse" in unlocked_items and math.hypot(cat["x"] - 165, cat["y"] - 225) < 32 and random.random() < 0.22:
            cat["state"] = random.choice(["play", "pounce"])
            cat["state_timer"] = random.randint(25, 45)
            return
        if "scratcher" in unlocked_items and math.hypot(cat["x"] - 395, cat["y"] - 175) < 32 and random.random() < 0.20:
            cat["state"] = "stretch"
            cat["state_timer"] = random.randint(30, 60)
            return

        if cat["state_timer"] <= 0:
            states = ["walk", "sit", "dash", "groom", "stretch", "play", "pounce"]
            weights = [28, 22, 10, 15, 10, 10, 5]
            new_state = random.choices(states, weights=weights)[0]
            cat["state"] = new_state
            
            if new_state == "walk":
                cat["dx"] = random.choice([-2, -1, 1, 2])
                cat["dy"] = random.choice([-1, 1])
                cat["facing"] = "r" if cat["dx"] > 0 else "l"
                cat["state_timer"] = random.randint(30, 80)
            elif new_state == "dash":
                cat["dx"] = random.choice([-4, -3, 3, 4])
                cat["dy"] = random.choice([-2, 2])
                cat["facing"] = "r" if cat["dx"] > 0 else "l"
                cat["state_timer"] = random.randint(15, 30)
            elif new_state in ["sit", "groom", "stretch", "play", "pounce"]:
                cat["dx"] = 0
                cat["dy"] = 0
                cat["state_timer"] = random.randint(25, 60)
        else:
            cat["state_timer"] -= 1

    def animate_loop(self):
        if not getattr(self, 'is_alive', True):
            return
            
        if self.has_images:
            self.anim_tick += 1
            is_sleep_time = not self.is_running or self.session_mode != "work"
            
            # 時間帯に応じた環境光・ライティング判定
            cur_hour = time.localtime().tm_hour
            time_tag = "night" if (cur_hour >= 19 or cur_hour < 6) else ("evening" if cur_hour >= 17 else ("morning" if cur_hour < 11 else "day"))
            
            # 昼夜ライティングオーバーレイの更新 (100tickごと)
            if self.anim_tick % 60 == 1:
                self.cat_canvas.delete("lighting")
                if time_tag == "night":
                    self.cat_canvas.create_rectangle(0, 0, self.canvas_w, self.canvas_h, fill="#0d1124", stipple="gray25", outline="", tags="lighting")
                elif time_tag == "evening":
                    self.cat_canvas.create_rectangle(0, 0, self.canvas_w, self.canvas_h, fill="#e17055", stipple="gray12", outline="", tags="lighting")
                self.cat_canvas.tag_lower("lighting")
                if hasattr(self, 'bg_photo'):
                    self.cat_canvas.tag_lower(1) # 背景画像を最背面に
            
            for cat in self.cats:
                c_id = cat["type"]
                tex = self.cat_textures[c_id]
                facing = cat.get("facing", "r")
                state = cat.get("state", "sit")
                
                if is_sleep_time:
                    # 多彩な寝相 (丸まり寝 / 仰向けヘソ天寝 / のびのび寝) + 呼吸アニメーション
                    sp_type = cat.get("sleep_pose", "sleep_curl")
                    f_idx = (self.anim_tick // 14) % 2
                    frame_key = f"{sp_type}_{f_idx}"
                    try:
                        if frame_key in tex:
                            self.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                        else:
                            self.cat_canvas.itemconfig(cat["id"], image=tex["sleep_0"])
                    except Exception:
                        pass
                else:
                    self.process_cat_ai(cat)
                    
                    if state in ["walk", "dash"]:
                        cat["x"] += cat["dx"]
                        cat["y"] += cat["dy"]
                        
                        # 床面エリア内（x: 60〜420, y: 135〜235）に厳格制限
                        if cat["x"] < 60:
                            cat["x"] = 60
                            cat["dx"] = abs(cat["dx"])
                            cat["facing"] = "r"
                        elif cat["x"] > 420:
                            cat["x"] = 420
                            cat["dx"] = -abs(cat["dx"])
                            cat["facing"] = "l"
                            
                        if cat["y"] < 135:
                            cat["y"] = 135
                            cat["dy"] = abs(cat["dy"])
                        elif cat["y"] > 235:
                            cat["y"] = 235
                            cat["dy"] = -abs(cat["dy"])
                            
                        facing = cat["facing"]
                        f_idx = (self.anim_tick // 6) % 2
                        frame_key = f"{state}_{facing}_{f_idx}"
                        y_off = 2 if (self.anim_tick % 4 < 2) and state == "dash" else 0
                        try:
                            self.cat_canvas.coords(cat["id"], cat["x"], cat["y"] - y_off)
                            if frame_key in tex:
                                self.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                        except Exception:
                            pass
                            
                        # 肉球足跡エフェクト
                        if self.anim_tick % 14 == 0 and len(self.floating_effects) < 20:
                            paw_id = self.cat_canvas.create_text(cat["x"], cat["y"] + 14, text="🐾", font=("Segoe UI Emoji", 7), fill=self.theme["border"])
                            self.floating_effects.append({"id": paw_id, "x": cat["x"], "y": cat["y"] + 14, "life": 16})
                            
                    elif state == "sit":
                        frame_key = f"sit_{facing}"
                        try:
                            if frame_key in tex:
                                self.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                        except Exception:
                            pass
                            
                    elif state == "groom":
                        # 毛づくろい (3フレーム)
                        f_idx = (self.anim_tick // 8) % 3
                        frame_key = f"groom_{facing}_{f_idx}"
                        try:
                            if frame_key in tex:
                                self.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                        except Exception:
                            pass
                            
                    elif state == "stretch":
                        # 伸びポーズ (2フレーム)
                        f_idx = (self.anim_tick // 12) % 2
                        frame_key = f"stretch_{facing}_{f_idx}"
                        try:
                            if frame_key in tex:
                                self.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                        except Exception:
                            pass
                            
                    elif state == "play":
                        # じゃれる・チョイチョイ (3フレーム)
                        f_idx = (self.anim_tick // 6) % 3
                        frame_key = f"play_{facing}_{f_idx}"
                        try:
                            if frame_key in tex:
                                self.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                        except Exception:
                            pass
                            
                    elif state == "pounce":
                        # 飛びつき・跳ねる (2フレーム)
                        f_idx = (self.anim_tick // 8) % 2
                        frame_key = f"pounce_{facing}_{f_idx}"
                        try:
                            if frame_key in tex:
                                self.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                        except Exception:
                            pass
                        
            if is_sleep_time:
                f_idx = (self.anim_tick // 15) % 2
                try:
                    self.widget_cat.config(image=self.widget_cat_frames["sleep"][f_idx])
                except Exception:
                    pass
            else:
                f_idx = (self.anim_tick // 15) % 2
                try:
                    self.widget_cat.config(image=self.widget_cat_frames["awake"][f_idx])
                except Exception:
                    pass
                
            # 環境パーティクル（天候・時間帯連動）
            if self.anim_tick % 16 == 0 and len(self.floating_effects) < 18:
                px = random.randint(20, self.canvas_w - 20)
                py = random.randint(10, self.canvas_h - 40)
                icons = ["✨", "🌸", "⭐", "🐾", "🍃"] if time_tag != "night" else ["⭐", "✨", "🌌", "🌙", "🐾"]
                p_icon = random.choice(icons)
                p_id = self.cat_canvas.create_text(px, py, text=p_icon, font=("Segoe UI Emoji", 10), fill=self.theme["border"])
                self.floating_effects.append({"id": p_id, "x": px, "y": py, "life": random.randint(30, 60), "dx": random.uniform(-0.6, 0.6)})
                
            for effect in self.floating_effects[:]:
                effect["y"] -= 0.8
                if "dx" in effect:
                    effect["x"] += effect["dx"]
                effect["life"] -= 1
                try:
                    self.cat_canvas.coords(effect["id"], effect["x"], effect["y"])
                    if effect["life"] <= 0:
                        self.cat_canvas.delete(effect["id"])
                        self.floating_effects.remove(effect)
                except Exception:
                    pass
                    
        if getattr(self, 'is_alive', True):
            try:
                self.root.after(50, self.animate_loop)
            except Exception:
                pass


if __name__ == "__main__":
    import sys
    root = tk.Tk()
    app = PomodoroApp(root)
    try:
        root.mainloop()
    except (KeyboardInterrupt, SystemExit):
        app.quit_app()
        sys.exit(0)
