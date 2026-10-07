from core.timer import PomodoroTimer
from core.cat_ai import CatAIEngine
from ui.tabs.settings_tab import SettingsTab
from ui.tabs.stats_tab import StatsTab
from ui.tabs.shop_tab import ShopTab
from ui.tabs.task_tab import TaskTab
from ui.tabs.cafe_tab import CafeTab
from ui.tabs.settings_tab import SettingsTab
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

from scripts.sound_generator import SoundManager
from data_manager import DataManager, AVAILABLE_CATS, AVAILABLE_ITEMS, THEMES
from google_sync import GoogleSyncManager
from core.cat_ai import CatAIEngine
from scripts.natural_cat_generator import generate_natural_cat, generate_cat_poses

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

from scripts.natural_cat_generator import generate_natural_cat

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
        except Exception as e:
            print(f"Error in {os.path.basename(filepath)}: {e}")
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
        
        # 強制終了・クラッシュ時の中断セッション検知
        self.data_mgr.check_and_resolve_interrupted_session()
        
        self.timer = PomodoroTimer(callbacks={
            'on_tick': self._on_timer_tick,
            'on_state_change': self._on_timer_state_change,
            'on_work_end': self._on_work_end,
            'on_break_end': self._on_break_end
        })
        self.timer.sync_settings(
            self.data_mgr.get_setting("work_minutes"),
            self.data_mgr.get_setting("short_break_minutes"),
            self.data_mgr.get_setting("long_break_minutes"),
            self.data_mgr.get_setting("long_break_interval")
        )
        self.timer.reset()
        self.anim_tick = 0
        self.floating_effects = []
        self.canvas_w = 480
        self.canvas_h = 270
        
        # --- 画像リソースのロード ---
        self._load_images()
        
        # --- UI コンポーネント構築 ---
        self._build_header()
        self._build_tab_bar()
        
        self.content_frame = tk.Frame(self.root, bg=self.theme["bg"])
        self.content_frame.pack(expand=True, fill='both', padx=10, pady=5)
        
        self.tabs = {}
        self.cafe_tab_obj = CafeTab(self)
        self.task_tab_obj = TaskTab(self)
        self.shop_tab_obj = ShopTab(self)
        self.stats_tab_obj = StatsTab(self)
        self.settings_tab_obj = SettingsTab(self)
        
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
            self.root.after(400, self.task_tab_obj.open_starter_cat_modal)

    def _update_ttk_styles(self):
        """TTK ウィジェット（Combobox, Spinbox, Scrollbar）のテーマスタイルを更新"""
        style = ttk.Style(self.root)
        try:
            style.theme_use('clam')
        except Exception as e:
            print(f"Error in {os.path.basename(filepath)}: {e}")
            
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
        base_sprites_dir = os.path.join(base_dir, "assets", "base_sprites")
        awake_png = os.path.join(base_sprites_dir, "cat_awake.png")
        sleep_png = os.path.join(base_sprites_dir, "cat_sleep.png")
        awake_jpg = os.path.join(base_sprites_dir, "cat_awake.jpg")
        sleep_jpg = os.path.join(base_sprites_dir, "cat_sleep.jpg")
        bg_path = os.path.join(base_dir, "assets", "backgrounds", "room_bg.jpg")
        
        self.has_images = False
        self.cat_textures = {}
        try:
            raw_bg = Image.open(bg_path).convert("RGB").resize((480, 270), Image.Resampling.LANCZOS)
            white_layer = Image.new("RGB", (480, 270), (255, 255, 255))
            # 背景色を50%薄く（白とブレンド）
            img_bg = Image.blend(raw_bg, white_layer, 0.50)
            self.bg_photo = ImageTk.PhotoImage(img_bg)
            
            if os.path.exists(awake_png):
                self.base_awake = Image.open(awake_png).convert("RGBA")
            else:
                self.base_awake = make_transparent(Image.open(awake_jpg))
                
            if os.path.exists(sleep_png):
                self.base_sleep = Image.open(sleep_png).convert("RGBA")
            else:
                self.base_sleep = make_transparent(Image.open(sleep_jpg))
                
            # 起動時は解放済みの猫のみを初期ロード (高速起動)
            unlocked_cats = self.data_mgr.get_cafe_data().get("unlocked_cats", ["black"])
            for c_id in unlocked_cats:
                self.get_cat_texture(c_id)
                
            self._update_widget_cat_frames()
            self.has_images = True
        except Exception as e:
            print("画像読み込みエラー:", e)
            self.has_images = False

    def get_cat_texture(self, cat_id):
        """猫スプライトのオンデマンド読み込み＆キャッシュ (高速化)"""
        if cat_id in self.cat_textures:
            return self.cat_textures[cat_id]
            
        base_dir = os.path.dirname(os.path.abspath(__file__))
        sprites_dir = os.path.join(base_dir, "sprites")
        cat_sprites_dir = os.path.join(sprites_dir, cat_id)
        
        tex_dict = {}
        if os.path.exists(cat_sprites_dir):
            for fname in os.listdir(cat_sprites_dir):
                if fname.endswith(".png"):
                    pose_k = fname[:-4]
                    fpath = os.path.join(cat_sprites_dir, fname)
                    tex_dict[pose_k] = ImageTk.PhotoImage(Image.open(fpath).convert("RGBA"))
                    
        self.cat_textures[cat_id] = tex_dict
        return tex_dict

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
            is_sleep = not self.timer.is_running or self.timer.session_mode != "work"
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
            cursor="hand2", command=lambda: self.task_tab_obj.open_account_modal()
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
            self.task_tab_obj.refresh_task_list()
        elif tab_id == "shop":
            self.shop_tab_obj.refresh_view()
        elif tab_id == "cafe":
            self.cafe_tab_obj.refresh_cafe_elements()
        elif tab_id == "stats":
            self.stats_tab_obj.refresh_view()
        elif tab_id == "settings":
            self.settings_tab_obj.refresh_view()

    def open_starter_cat_modal(self):
        if hasattr(self, 'task_tab_obj'):
            self.task_tab_obj.open_starter_cat_modal()

    def open_account_modal(self):
        if hasattr(self, 'task_tab_obj'):
            self.task_tab_obj.open_account_modal()

    def refresh_cafe_elements(self):
        if hasattr(self, 'cafe_tab_obj'):
            self.cafe_tab_obj.sync_unlocked_entities()
            self.cafe_tab_obj.refresh_cafe_elements()

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
            except Exception as e:
                print(f"Error in {os.path.basename(filepath)}: {e}")
                
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
        self.cafe_tab_obj.refresh_cafe_elements()
        self.task_tab_obj.refresh_task_list()
        self.shop_tab_obj.refresh_view()
        self.stats_tab_obj.refresh_view()
        self.settings_tab_obj.refresh_view()
        
        self.show_tab(self.current_tab)
        self.update_status_display()

    # --- 2. タスクタブ ＆ Google 連携 ---
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

        self.widget_label = tk.Label(self.widget_bar, text=self.format_time(self.timer.time_left), font=("Comic Sans MS", 14, "bold"), fg=self.theme["work"], bg=self.theme["bg"])
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
        self.timer.is_running = False
        try:
            self.sound_mgr.stop_bgm()
        except Exception as e:
            print(f"Error in {os.path.basename(filepath)}: {e}")
        try:
            self.root.quit()
            self.root.destroy()
        except Exception as e:
            print(f"Error in {os.path.basename(filepath)}: {e}")

    def on_minimize(self, event):
        if event.widget == self.root and self.root.state() == "iconic":
            self.widget.deiconify()

    def on_restore(self, event):
        if event.widget == self.root and self.root.state() == "normal":
            self.widget.withdraw()

    # --- タイマーコアロジック ---

    def _on_timer_tick(self, time_left):
        if not hasattr(self, 'timer_label'): return
        t_str = self.format_time(time_left)
        self.timer_label.config(text=t_str)
        self.widget_label.config(text=t_str)
        if self.timer.session_mode == "work":
            self.data_mgr.add_active_task_time(1)

    def _on_timer_state_change(self):
        if not hasattr(self, 'start_btn'): return
        self.start_btn.config(text="⏸ 停止" if self.timer.is_running else "▶ 開始")
        self.update_status_display()
        is_sleep = not self.timer.is_running or self.timer.session_mode != "work"
        
        # セッション状態の追跡
        if self.timer.is_running:
            self.data_mgr.start_session(self.timer.session_mode)
        else:
            self.data_mgr.cancel_session(was_user_reset=False)
            
        if hasattr(self, 'cafe_tab_obj'):
            self.cafe_tab_obj.update_cat_sleep_mode(is_sleep)
            self.cafe_tab_obj.refresh_cafe_elements()

    def _on_work_end(self):
        self.sound_mgr.play_se("work_end")
        self.data_mgr.finish_session()
        self.data_mgr.add_pomodoro_reward()
        self.data_mgr.increment_active_task_pomo()
        if self.widget.state() == "normal":
            self.widget.lift()
        else:
            self.root.deiconify()
            self.root.lift()

    def _on_break_end(self):
        self.sound_mgr.play_se("break_end")
        if self.widget.state() == "normal":
            self.widget.lift()
        else:
            self.root.deiconify()
            self.root.lift()

    def format_time(self, seconds):
        m, s = divmod(seconds, 60)
        return f"{m:02d}:{s:02d}"

    def toggle_timer(self, event=None):
        self.timer.toggle()
    def reset_timer(self):
        self.data_mgr.cancel_session(was_user_reset=True)
        self.timer.reset()
    def switch_mode(self):
        self.data_mgr.cancel_session(was_user_reset=True)
        self.timer.switch_mode()
    def update_status_display(self):
        paws = ""
        for i in range(1, self.timer.long_break_interval + 1):
            if i < self.timer.cycle_count:
                paws += "🐾 "
            elif i == self.timer.cycle_count:
                paws += "🐾 " if self.timer.session_mode != "work" else "⚪ "
            else:
                paws += "⚪ "
                
        self.cycle_label.config(text=f"セット {self.timer.cycle_count}/{self.timer.long_break_interval} {paws}")
        
        if self.timer.session_mode == "work":
            color = self.theme["work"]
            state = "おしごと中！🔥" if self.timer.is_running else "おしごと (停止中)"
            short_state = "🔥 おしごと" if self.timer.is_running else "💤 停止中"
        elif self.timer.session_mode == "short_break":
            color = self.theme["break"]
            state = "短い休憩中 ☕" if self.timer.is_running else "休憩 (停止中)"
            short_state = "☕ 休憩中" if self.timer.is_running else "☕ 停止中"
        else:
            color = self.theme["long_break"]
            state = "長いご褒美休憩 🍰" if self.timer.is_running else "長休憩 (停止中)"
            short_state = "🍰 長休憩" if self.timer.is_running else "🍰 停止中"
            
        self.status_label.config(text=state, fg=color)
        self.timer_label.config(fg=color)
        self.widget_label.config(fg=color)
        self.widget_status.config(text=short_state, fg=color)
        self.widget_play_btn.config(text="⏸" if self.timer.is_running else "▶")
        
        active_t = self.data_mgr.get_active_task()
        t_text = active_t["title"][:9] + "..." if active_t and len(active_t["title"]) > 9 else (active_t["title"] if active_t else "タスクなし")
        self.widget_task.config(text=f"📝 {t_text}")

    def update_clock(self):
        if getattr(self, 'is_alive', True):
            self.timer.tick()
            self.root.after(1000, self.update_clock)
    # --- アニメーション & 猫の自律エコシステムAI ---
    def process_cat_ai(self, cat):
        unlocked_items = self.data_mgr.get_cafe_data().get("unlocked_items", [])
        effects = CatAIEngine.process_ai(cat, self.cats, unlocked_items)
        
        for eff in effects:
            if eff["type"] == "effect":
                h_id = self.cat_canvas.create_text(eff["x"], eff["y"], text=eff["text"], font=("Segoe UI Emoji", 13), fill=self.theme["work"])
                self.floating_effects.append({"id": h_id, "x": eff["x"], "y": eff["y"], "life": 22})
    def animate_loop(self):
        if not getattr(self, 'is_alive', True):
            return
            
        try:
            if self.has_images:
                self.anim_tick += 1
                is_sleep_time = not self.timer.is_running or self.timer.session_mode != "work"
                
                # 時間帯に応じた環境光・ライティング判定
                cur_hour = time.localtime().tm_hour
                time_tag = "night" if (cur_hour >= 19 or cur_hour < 6) else ("evening" if cur_hour >= 17 else ("morning" if cur_hour < 11 else "day"))
                
                # 昼夜ライティングオーバーレイの更新 (60FPS基準で180フレーム=約3秒ごとに更新)
                if self.anim_tick % 180 == 1:
                    self.cat_canvas.delete("lighting")
                    if time_tag == "night":
                        self.cat_canvas.create_rectangle(0, 0, self.canvas_w, self.canvas_h, fill="#0d1124", stipple="gray25", outline="", tags="lighting")
                    elif time_tag == "evening":
                        self.cat_canvas.create_rectangle(0, 0, self.canvas_w, self.canvas_h, fill="#e17055", stipple="gray12", outline="", tags="lighting")
                    self.cat_canvas.tag_lower("lighting")
                    if hasattr(self, 'bg_photo'):
                        self.cat_canvas.tag_lower(1)
                
                # スプライト切り替え速度を60FPSに合わせて調整 (元の3倍のtickが必要)
                for cat in self.cats:
                    c_id = cat["type"]
                    tex = self.get_cat_texture(c_id)
                    if not tex:
                        continue
                    
                    if is_sleep_time:
                        if cat.get("state") != "sleep":
                            cat["state"] = "sleep"
                            cat["dx"] = 0
                            cat["dy"] = 0
                            
                        sp_type = cat.get("sleep_pose", "sleep_curl")
                        
                        # 時々寝相を変える (1秒に1回判定し、10%の確率で変更)
                        if self.anim_tick % 60 == 0 and random.random() < 0.1:
                            sp_type = random.choice(["sleep_curl", "sleep_belly", "sleep_stretch"])
                            cat["sleep_pose"] = sp_type
                            
                        cfg = self.data_mgr.get_anim_config(sp_type)
                        f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
                        frame_key = f"{sp_type}_{f_idx}"
                        try:
                            if frame_key in tex:
                                self.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                            elif f"{sp_type}_0" in tex:
                                self.cat_canvas.itemconfig(cat["id"], image=tex[f"{sp_type}_0"])
                            elif "sleep_0" in tex:
                                self.cat_canvas.itemconfig(cat["id"], image=tex["sleep_0"])
                        except Exception as e:
                            print(f"Error in {os.path.basename(filepath)}: {e}")
                    else:
                        # 睡眠状態から活動状態への復帰保証
                        if cat.get("state") == "sleep":
                            cat["state"] = random.choice(["sit", "walk"])
                            cat["state_timer"] = random.randint(40, 60)
                            if cat["state"] == "walk":
                                cat["dx"] = random.choice([-1.5, 1.5])
                                cat["dy"] = random.choice([-0.5, 0.5])
                                cat["facing"] = "r" if cat["dx"] > 0 else "l"
                            else:
                                cat["dx"] = 0
                                cat["dy"] = 0
                                
                        # AI処理の頻度調整 (元の3倍遅く判定)
                        if self.anim_tick % 3 == 0:
                            self.process_cat_ai(cat)
                            
                        state = cat.get("state", "sit")
                        facing = cat.get("facing", "r")
                        
                        if state in ["walk", "dash"]:
                            # 60FPSでの滑らかな移動
                            cat["x"] += cat["dx"] * 0.9
                            cat["y"] += cat["dy"] * 0.9
                            
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
                            cfg = self.data_mgr.get_anim_config(state)
                            f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
                            frame_key = f"{state}_{facing}_{f_idx}"
                            y_off = 2 if (self.anim_tick % 12 < 6) and state == "dash" else 0
                            try:
                                self.cat_canvas.coords(cat["id"], cat["x"], cat["y"] - y_off)
                                if frame_key in tex:
                                    self.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                            except Exception as e:
                                print(f"Error in {os.path.basename(filepath)}: {e}")
                                
                            # 肉球足跡エフェクト
                            if self.anim_tick % 36 == 0 and len(self.floating_effects) < 20:
                                paw_id = self.cat_canvas.create_text(cat["x"], cat["y"] + 14, text="🐾", font=("Segoe UI Emoji", 7), fill=self.theme["border"])
                                self.floating_effects.append({"id": paw_id, "x": cat["x"], "y": cat["y"] + 14, "life": 48})
                                
                        elif state == "sit":
                            frame_key = f"sit_{facing}"
                            try:
                                self.cat_canvas.coords(cat["id"], cat["x"], cat["y"])
                                if frame_key in tex:
                                    self.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                                elif f"sit_r" in tex:
                                    self.cat_canvas.itemconfig(cat["id"], image=tex["sit_r"])
                            except Exception as e:
                                print(f"Error in {os.path.basename(filepath)}: {e}")
                                
                        elif state == "groom":
                            cfg = self.data_mgr.get_anim_config(state)
                            f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
                            frame_key = f"groom_{facing}_{f_idx}"
                            try:
                                if frame_key in tex:
                                    self.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                                elif f"sit_{facing}" in tex:
                                    self.cat_canvas.itemconfig(cat["id"], image=tex[f"sit_{facing}"])
                            except Exception as e:
                                print(f"Error in {os.path.basename(filepath)}: {e}")
                                
                        elif state == "stretch":
                            cfg = self.data_mgr.get_anim_config(state)
                            f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
                            frame_key = f"stretch_{facing}_{f_idx}"
                            try:
                                if frame_key in tex:
                                    self.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                                elif f"sit_{facing}" in tex:
                                    self.cat_canvas.itemconfig(cat["id"], image=tex[f"sit_{facing}"])
                            except Exception as e:
                                print(f"Error in {os.path.basename(filepath)}: {e}")
                                
                        elif state == "play":
                            cfg = self.data_mgr.get_anim_config(state)
                            f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
                            frame_key = f"play_{facing}_{f_idx}"
                            try:
                                if frame_key in tex:
                                    self.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                                elif f"sit_{facing}" in tex:
                                    self.cat_canvas.itemconfig(cat["id"], image=tex[f"sit_{facing}"])
                            except Exception as e:
                                print(f"Error in {os.path.basename(filepath)}: {e}")
                                
                        elif state == "pounce":
                            cfg = self.data_mgr.get_anim_config(state)
                            f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
                            frame_key = f"pounce_{facing}_{f_idx}"
                            try:
                                if frame_key in tex:
                                    self.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                                elif f"sit_{facing}" in tex:
                                    self.cat_canvas.itemconfig(cat["id"], image=tex[f"sit_{facing}"])
                            except Exception as e:
                                print(f"Error in {os.path.basename(filepath)}: {e}")
                                
                # 手前の猫（画面下側・Y座標が大きい）が奥の猫（画面上側・Y座標が小さい）の上に重なるようにZソート
                try:
                    for c in sorted(self.cats, key=lambda cat: cat.get("y", 0)):
                        self.cat_canvas.tag_raise(c["id"])
                    # エフェクトを猫の手前に表示
                    self.cat_canvas.tag_raise("effect")
                except Exception as e:
                    print(f"Error in {os.path.basename(filepath)}: {e}")
                            
                if self.cats:
                    cat = self.cats[0]
                    tex = self.get_cat_texture(cat.get("type", "black"))
                    
                    if is_sleep_time:
                        sp_type = cat.get("sleep_pose", "sleep_curl")
                        cfg = self.data_mgr.get_anim_config("sleep")
                        f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
                        frame_key = f"{sp_type}_{f_idx}"
                    else:
                        state = cat.get("state", "sit")
                        facing = cat.get("facing", "r")
                        if state == "sit":
                            frame_key = f"sit_{facing}"
                        else:
                            cfg = self.data_mgr.get_anim_config(state)
                            f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
                            frame_key = f"{state}_{facing}_{f_idx}"
                            
                    if tex and frame_key in tex:
                        try:
                            self.widget_cat.config(image=tex[frame_key])
                        except Exception as e:
                            print(f"Error in {os.path.basename(filepath)}: {e}")
                    
                # 環境パーティクル
                if self.anim_tick % 48 == 0 and len(self.floating_effects) < 18:
                    px = random.randint(20, self.canvas_w - 20)
                    py = random.randint(10, self.canvas_h - 40)
                    icons = ["✨", "🌸", "⭐", "🐾", "🍃"] if time_tag != "night" else ["⭐", "✨", "🌌", "🌙", "🐾"]
                    p_icon = random.choice(icons)
                    p_id = self.cat_canvas.create_text(px, py, text=p_icon, font=("Segoe UI Emoji", 10), fill=self.theme["border"])
                    self.floating_effects.append({"id": p_id, "x": px, "y": py, "life": random.randint(90, 180), "dx": random.uniform(-0.2, 0.2)})
                    
                for effect in self.floating_effects[:]:
                    effect["y"] -= 0.26
                    if "dx" in effect:
                        effect["x"] += effect["dx"]
                    effect["life"] -= 1
                    try:
                        self.cat_canvas.coords(effect["id"], effect["x"], effect["y"])
                        if effect["life"] <= 0:
                            self.cat_canvas.delete(effect["id"])
                            self.floating_effects.remove(effect)
                    except Exception as e:
                        print(f"Error in {os.path.basename(filepath)}: {e}")
        except (KeyboardInterrupt, SystemExit):
            raise
        except Exception as e:
            import traceback
            traceback.print_exc()
        finally:
            if getattr(self, 'is_alive', True):
                try:
                    self.root.after(16, self.animate_loop)
                except Exception as e:
                    print(f"Error in {os.path.basename(filepath)}: {e}")


if __name__ == "__main__":
    import sys
    print("\n" + "=" * 52)
    print(" 🐾 猫カフェ・ポモドーロ (Pomodoro Timer) 起動中 🐾")
    print("=" * 52)
    print("  🖥️  デスクトップ版 : 起動完了")
    print("  🌐 Web版 URL      : http://localhost:3000")
    print("  💡 Web版起動コマンド: cd PomodoroTimer/web && npm run dev")
    print("=" * 52 + "\n", flush=True)
    root = tk.Tk()
    app = PomodoroApp(root)
    try:
        root.mainloop()
    except (KeyboardInterrupt, SystemExit):
        app.quit_app()
        sys.exit(0)
