import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from PIL import Image, ImageTk
import os
import random
import threading
import numpy as np

from sound_generator import SoundManager
from data_manager import DataManager, AVAILABLE_CATS, AVAILABLE_ITEMS, THEMES
from google_sync import GoogleSyncManager

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

def colorize_cat(rgba_img, cat_type):
    """猫のベース画像から種類に応じた固有の柄（模様・ポイント・バイカラー）を輪郭・顔パーツを保護しながら生成"""
    arr = np.array(rgba_img.convert("RGBA"), dtype=np.uint8)
    alpha = arr[:, :, 3]
    mask = alpha > 40
    
    if not np.any(mask):
        return rgba_img.copy()
        
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    brightness = 0.299 * r + 0.587 * g + 0.114 * b
    
    # 輪郭線（アウトライン、口、目の中の黒など: 明るさ < 25）を判定して保護
    is_outline = mask & (brightness < 24)
    # 耳の内側（ピンク系ピクセル: 赤が強く明るい領域）を保護・識別
    is_inner_ear = mask & (r > 75) & (r > g + 8) & (r > b - 10)
    # 体の毛（ボディフィル）部分
    is_body = mask & ~is_outline & ~is_inner_ear
    
    # 猫の領域の正規化座標 (0.0 〜 1.0)
    y_indices, x_indices = np.where(mask)
    y_min, y_max = y_indices.min(), y_indices.max()
    x_min, x_max = x_indices.min(), x_indices.max()
    h = max(1, y_max - y_min)
    w = max(1, x_max - x_min)
    
    Y, X = np.ogrid[:arr.shape[0], :arr.shape[1]]
    ny = (Y - y_min) / float(h)  # 0: 頭頂部, 1: 足元
    nx = (X - x_min) / float(w)  # 0: 左端 (しっぽ側), 1: 右端 (顔側)
    
    out_r = r.copy()
    out_g = g.copy()
    out_b = b.copy()
    
    def fill(m, cr, cg, cb):
        target = is_body & m
        out_r[target] = cr
        out_g[target] = cg
        out_b[target] = cb

    # --- 15種類の猫固有の毛柄デザイン ---
    if cat_type == "black":
        # くろねこ: シックな漆黒 + 胸元にふんわり小さな白いエンジェルマーク
        fill(mask, 34, 34, 40)
        # 首の下〜胸元に小さな逆三角形の胸毛
        chest = (ny >= 0.44) & (ny <= 0.60) & (np.abs(nx - 0.48) < (0.60 - ny) * 0.8)
        fill(chest, 245, 245, 250)
        
    elif cat_type == "white":
        # しろねこ: 純白 + 耳内側とお鼻がほんのりピンク (輪郭は柔らかいダークグレー)
        fill(mask, 252, 252, 255)
        out_r[is_outline] = 70
        out_g[is_outline] = 70
        out_b[is_outline] = 82
        out_r[is_inner_ear] = 255
        out_g[is_inner_ear] = 185
        out_b[is_inner_ear] = 205

    elif cat_type == "gray":
        # はいいろねこ (ロシアンブルー): 上品なシルバーグレー + 白ソックス足先
        fill(mask, 140, 148, 164)
        back = (nx > 0.62) | (ny < 0.28)
        fill(back, 115, 122, 138)
        socks = (ny > 0.78)
        fill(socks, 245, 246, 252)

    elif cat_type == "calico":
        # みけねこ (三毛): 白ベース + 頭と背中にオレンジ＆黒の斑点
        fill(mask, 252, 252, 255)
        # 頭の右側・背中の丸いぶち
        orange_patch = (
            ((nx > 0.60) & (ny < 0.38)) |  # 右耳・頭右側
            (((nx - 0.42)**2 + (ny - 0.52)**2) < 0.025) |  # 背中の丸ぶち
            ((nx < 0.22) & (ny > 0.55))  # しっぽ元
        )
        fill(orange_patch, 228, 118, 42)
        # 頭の左側・お尻の黒パッチ
        black_patch = (
            ((nx >= 0.38) & (nx <= 0.60) & (ny < 0.35)) |  # 頭左側
            (((nx - 0.28)**2 + (ny - 0.46)**2) < 0.02) |  # 脇腹ぶち
            (nx > 0.72)  # 顔の右端
        )
        fill(black_patch, 38, 38, 44)

    elif cat_type == "siamese":
        # シャムねこ: 全体クリームアイボリー + 耳・顔中心・足先・しっぽが濃いシールブラウン
        fill(mask, 246, 238, 224)
        points = (
            (ny < 0.28) |  # 耳
            ((ny >= 0.28) & (ny <= 0.52) & (np.abs(nx - 0.58) < 0.16)) |  # 顔中心(目・鼻周り)
            (ny > 0.74) |  # 足先(ソックス)
            (nx < 0.20)    # しっぽ
        )
        fill(points, 56, 38, 28)
        out_r[is_outline] = 45
        out_g[is_outline] = 32
        out_b[is_outline] = 26

    elif cat_type == "orange":
        # ちゃとら (茶トラ): あたたかいオレンジ + トラ縞タビー + 白お腹
        fill(mask, 236, 138, 42)
        # 縦〜斜めのトラ縞ストライプ
        stripes = (
            (np.abs(np.sin(nx * 18 + ny * 6)) > 0.65) |
            ((ny < 0.36) & (np.abs(np.sin(nx * 24)) > 0.60))
        )
        fill(stripes, 168, 68, 12)
        belly = (ny > 0.62) & (np.abs(nx - 0.44) < 0.22)
        fill(belly, 255, 248, 236)
        socks = (ny > 0.82)
        fill(socks, 255, 248, 236)

    elif cat_type == "cream":
        # クリームねこ: 淡いミルクティーアイボリー + 背中キャラメル + 白お腹
        fill(mask, 250, 242, 226)
        back = (ny < 0.36) | ((nx > 0.50) & (ny < 0.58))
        fill(back, 224, 196, 154)
        belly = (ny > 0.68)
        fill(belly, 255, 252, 248)

    elif cat_type == "ginger":
        # ジンジャー: 鮮やかな赤狐レッド + 白いお腹＆胸元＆しっぽ先
        fill(mask, 215, 68, 28)
        white_parts = (
            ((ny > 0.55) & (np.abs(nx - 0.44) < 0.25)) |  # お腹
            ((ny >= 0.42) & (ny <= 0.60) & (nx >= 0.45) & (nx <= 0.60)) |  # 胸元
            (nx < 0.16)  # しっぽ先
        )
        fill(white_parts, 255, 250, 244)

    elif cat_type == "tuxedo":
        # はちわれ (タキシード): 漆黒ジャケット + 八の字白顔 + 白胸元・お腹・ソックス
        fill(mask, 34, 38, 48)
        hachiware = (ny >= 0.28) & (ny <= 0.55) & (ny > (np.abs(nx - 0.58) * 1.5 + 0.24))
        fill(hachiware, 255, 255, 255)
        tuxedo_belly = (
            ((ny > 0.50) & (nx > 0.32) & (nx < 0.68)) |  # 胸・お腹
            (ny > 0.78)  # 白靴下
        )
        fill(tuxedo_belly, 255, 255, 255)

    elif cat_type == "tortoiseshell":
        # サビねこ (べっ甲): ダークチャコール + 琥珀オレンジとキャラメルゴールドのまだら
        fill(mask, 44, 36, 34)
        patch_amber = (np.sin(nx * 14 + ny * 12) * np.cos(nx * 8 - ny * 14)) > 0.08
        fill(patch_amber, 212, 112, 38)
        patch_gold = (np.cos(nx * 16 + ny * 18) * np.sin(nx * 10 - ny * 8)) > 0.15
        fill(patch_gold, 226, 178, 68)

    elif cat_type == "sakura":
        # さくらねこ: パステル桜ピンク + チェリーピンクの耳・背中 + 白お腹
        fill(mask, 255, 224, 236)
        cherry = (ny < 0.32) | ((nx > 0.52) & (ny < 0.55)) | (nx < 0.16)
        fill(cherry, 255, 118, 174)
        belly = (ny > 0.66) & (np.abs(nx - 0.44) < 0.24)
        fill(belly, 255, 250, 252)

    elif cat_type == "mint":
        # ミントねこ: パステルミント + エメラルドグリーンのリーフストライプ
        fill(mask, 206, 248, 226)
        leaf_stripes = (np.sin(nx * 18 + ny * 8) > 0.30) | (ny < 0.28)
        fill(leaf_stripes, 58, 182, 132)
        belly = (ny > 0.66) & (np.abs(nx - 0.44) < 0.22)
        fill(belly, 255, 255, 255)

    elif cat_type == "sky":
        # スカイねこ: 青空スカイブルー + ふんわり雲ぶち + マリンブルー耳・しっぽ
        fill(mask, 185, 228, 255)
        clouds = (((nx - 0.42)**2 + (ny - 0.50)**2) < 0.03) | (((nx - 0.62)**2 + (ny - 0.58)**2) < 0.02)
        fill(clouds, 255, 255, 255)
        blue_points = (ny < 0.28) | (nx < 0.16)
        fill(blue_points, 34, 122, 212)

    elif cat_type == "lavender":
        # パステルラベンダー: ライラックパープル + アメジストバイオレットのポイント
        fill(mask, 232, 210, 252)
        amethyst = (ny < 0.30) | (nx > 0.64) | (nx < 0.16)
        fill(amethyst, 142, 72, 224)
        belly = (ny > 0.66) & (np.abs(nx - 0.44) < 0.22)
        fill(belly, 254, 250, 255)

    elif cat_type == "golden":
        # ゴールドキャット: きらめく黄金イエロー + アンバーの星屑タビー + 白胸元
        fill(mask, 255, 216, 80)
        gold_stripes = (np.sin(nx * 18 + ny * 8) > 0.30) | (ny < 0.28)
        fill(gold_stripes, 236, 122, 28)
        chest = (ny > 0.50) & (np.abs(nx - 0.46) < 0.22)
        fill(chest, 255, 250, 222)

    arr[mask, 0] = np.clip(out_r[mask], 0, 255).astype(np.uint8)
    arr[mask, 1] = np.clip(out_g[mask], 0, 255).astype(np.uint8)
    arr[mask, 2] = np.clip(out_b[mask], 0, 255).astype(np.uint8)
    
    return Image.fromarray(arr, mode="RGBA")

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
                
            self.cat_textures = {}
            for cat_info in AVAILABLE_CATS:
                c_id = cat_info["id"]
                t_awake = colorize_cat(self.base_awake, c_id)
                t_sleep = colorize_cat(self.base_sleep, c_id)
                
                img_aw_main = t_awake.resize((48, 48), Image.Resampling.LANCZOS)
                img_sl_main = t_sleep.resize((48, 48), Image.Resampling.LANCZOS)
                
                breath_img = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
                resized_breath = t_sleep.resize((48, 44), Image.Resampling.LANCZOS)
                breath_img.paste(resized_breath, (0, 4))
                
                self.cat_textures[c_id] = {
                    "awake_r": ImageTk.PhotoImage(img_aw_main.transpose(Image.FLIP_LEFT_RIGHT)),
                    "awake_l": ImageTk.PhotoImage(img_aw_main),
                    "sleep_0": ImageTk.PhotoImage(img_sl_main),
                    "sleep_1": ImageTk.PhotoImage(breath_img)
                }
                
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
        t_aw = colorize_cat(self.base_awake, av_cat)
        t_sl = colorize_cat(self.base_sleep, av_cat)
        
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
        
        right_frame = tk.Frame(self.header_frame, bg=self.theme["header"])
        right_frame.pack(side='right')
        
        self.treat_label = tk.Label(right_frame, text=f"🐟 {self.data_mgr.get_cafe_data()['treats']}個", font=FONT_SUB, fg=self.theme["accent"], bg=self.theme["header"])
        self.treat_label.pack(side='left', padx=6)
        
        prof = self.data_mgr.get_profile()
        icon = AVATAR_ICONS.get(prof.get("avatar", "black"), "🐾")
        self.account_btn = tk.Button(
            right_frame, text=f"{icon} {prof['name'][:8]}", font=FONT_TEXT,
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
            ("settings", "⚙️ 設定")
        ]
        
        for tab_id, text in tab_defs:
            btn = tk.Button(
                self.tab_bar, text=text, font=FONT_SUB,
                bg=self.theme["card"], fg=self.theme["text"], relief="flat", padx=10, pady=4,
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
        elif tab_id == "settings":
            self.refresh_settings_view()

    def apply_theme(self, theme_key):
        """テーマを動的に適用・保存"""
        self.data_mgr.set_setting("theme", theme_key)
        self.theme = self.data_mgr.get_current_theme()
        
        # TTK スタイル更新
        self._update_ttk_styles()
        
        # ウィジェット用猫フレーム再合成
        self._update_widget_cat_frames()
        
        # メインウィンドウ & ヘッダー
        self.root.configure(bg=self.theme["bg"])
        self.header_frame.configure(bg=self.theme["header"])
        self.header_title_label.configure(bg=self.theme["header"], fg=self.theme["text"])
        self.treat_label.configure(bg=self.theme["header"], fg=self.theme["accent"])
        self.account_btn.configure(bg=self.theme["card"], fg=self.theme["text"])
        self.tab_bar.configure(bg=self.theme["bg"])
        self.content_frame.configure(bg=self.theme["bg"])
        
        # カフェタブ
        self.tabs["cafe"].configure(bg=self.theme["bg"])
        self.cat_canvas.configure(bg=self.theme["bg"])
        self.cycle_label.configure(bg=self.theme["bg"], fg=self.theme["text"])
        self.active_task_banner.configure(bg=self.theme["card"], fg=self.theme["text"])
        self.status_label.configure(bg=self.theme["bg"])
        self.timer_label.configure(bg=self.theme["bg"])
        self.start_btn.configure(bg=self.theme["btn"], fg=self.theme["btn_fg"])
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
        
        info_bar = tk.Frame(tab, bg=self.theme["bg"])
        info_bar.pack(fill='x', pady=(0, 2))
        
        self.cycle_label = tk.Label(info_bar, text="セット 1/4 🐾 ⚪ ⚪ ⚪", font=FONT_SUB, fg=self.theme["text"], bg=self.theme["bg"])
        self.cycle_label.pack(side='left', padx=10)
        
        prof = self.data_mgr.get_profile()
        done_pomo = self.data_mgr.get_cafe_data()['total_pomodoros']
        self.total_pomo_label = tk.Label(info_bar, text=f"本日: {done_pomo}/{prof['daily_goal']} 🍅", font=FONT_SUB, fg=self.theme["work"], bg=self.theme["bg"])
        self.total_pomo_label.pack(side='right', padx=10)
        
        self.active_task_banner = tk.Label(tab, text="作業中タスク: 今日のタスクを計画する 📝", font=FONT_BOLD, fg=self.theme["text"], bg=self.theme["card"], padx=10, pady=3, relief="groove")
        self.active_task_banner.pack(fill='x', padx=10, pady=(0, 2))
        
        self.status_label = tk.Label(tab, text="おしごと (停止中)", font=FONT_SUB, fg=self.theme["work"], bg=self.theme["bg"])
        self.status_label.pack(pady=(2, 0))
        
        self.timer_label = tk.Label(tab, text=self.format_time(self.time_left), font=FONT_MAIN, fg=self.theme["work"], bg=self.theme["bg"])
        self.timer_label.pack(pady=(0, 0))
        
        btn_frame = tk.Frame(tab, bg=self.theme["bg"])
        btn_frame.pack(pady=5)
        
        self.start_btn = tk.Button(btn_frame, text="▶ 開始", command=self.toggle_timer, bg=self.theme["btn"], fg=self.theme["btn_fg"], font=FONT_SUB, relief="flat", padx=20, pady=5, cursor="hand2")
        self.start_btn.pack(side="left", padx=8)
        
        self.reset_btn = tk.Button(btn_frame, text="↺ リセット", command=self.reset_timer, bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"], font=FONT_SUB, relief="flat", padx=15, pady=5, cursor="hand2")
        self.reset_btn.pack(side="left", padx=8)

    def spawn_cats_and_items(self):
        self.cat_canvas.delete("cat")
        self.cat_canvas.delete("item")
        self.cats.clear()
        
        if not self.has_images:
            self.cat_canvas.create_text(self.canvas_w/2, self.canvas_h/2, text="(=^・^=)", font=("Meiryo", 20), fill=self.theme["accent"], tags="cat")
            return
            
        unlocked_items = self.data_mgr.get_cafe_data().get("unlocked_items", ["cushion"])
        item_positions = {
            "cushion": (70, 220, "🛋️"),
            "toy_mouse": (160, 240, "🐭"),
            "scratcher": (400, 180, "🪵"),
            "treat_bowl": (240, 240, "🥣"),
            "cat_tree": (390, 95, "🏰")
        }
        for item_id in unlocked_items:
            if item_id in item_positions:
                x, y, icon = item_positions[item_id]
                self.cat_canvas.create_text(x, y, text=icon, font=("Segoe UI Emoji", 22), tags="item")
                
        unlocked_cats = self.data_mgr.get_cafe_data().get("unlocked_cats", ["black"])
        for cat_id in unlocked_cats:
            if cat_id in self.cat_textures:
                x = random.randint(50, self.canvas_w - 50)
                y = random.randint(50, self.canvas_h - 50)
                canvas_id = self.cat_canvas.create_image(x, y, image=self.cat_textures[cat_id]["sleep_0"], tags="cat")
                self.cats.append({
                    "type": cat_id,
                    "id": canvas_id,
                    "x": x,
                    "y": y,
                    "state": "sleep",
                    "state_timer": random.randint(20, 80),
                    "dx": 0,
                    "dy": 0,
                    "facing": random.choice(["awake_l", "awake_r"])
                })

    def refresh_cafe_elements(self):
        self.treat_label.config(text=f"🐟 {self.data_mgr.get_cafe_data()['treats']}個", fg=self.theme["accent"])
        prof = self.data_mgr.get_profile()
        done_pomo = self.data_mgr.get_cafe_data()['total_pomodoros']
        self.total_pomo_label.config(text=f"本日: {done_pomo}/{prof['daily_goal']} 🍅", fg=self.theme["work"])
        
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
        if clicked_cat:
            target_x = clicked_cat["x"]
            target_y = clicked_cat["y"]
            clicked_cat["state"] = "sit"
            clicked_cat["state_timer"] = 40
            
        self.sound_mgr.play_se("meow")
        heart_id = self.cat_canvas.create_text(target_x, target_y - 20, text=random.choice(["❤️", "💖", "🐾", "✨"]), font=("Segoe UI Emoji", 18))
        self.floating_effects.append({"id": heart_id, "x": target_x, "y": target_y - 20, "life": 20})

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
        
        self.task_add_frame = tk.Frame(tab, bg=self.theme["card"], padx=10, pady=8, relief="groove", bd=1)
        self.task_add_frame.pack(fill='x', pady=4)
        
        self.task_add_title = tk.Label(self.task_add_frame, text="新しいタスクを追加:", font=FONT_BOLD, bg=self.theme["card"], fg=self.theme["text"])
        self.task_add_title.grid(row=0, column=0, columnspan=3, sticky='w', pady=(0, 4))
        
        self.task_entry = tk.Entry(self.task_add_frame, font=FONT_TEXT, width=22, bg=self.theme["input_bg"], fg=self.theme["input_fg"], insertbackground=self.theme["text"])
        self.task_entry.grid(row=1, column=0, padx=5, sticky='ew')
        self.task_entry.bind("<Return>", lambda e: self.add_new_task())
        
        self.task_target_lbl = tk.Label(self.task_add_frame, text="目標🍅:", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["text"])
        self.task_target_lbl.grid(row=1, column=1, padx=2)
        
        self.task_target_spin = ttk.Spinbox(self.task_add_frame, from_=1, to=12, width=3, font=FONT_TEXT)
        self.task_target_spin.set(2)
        self.task_target_spin.grid(row=1, column=2, padx=4)
        
        self.task_add_btn = tk.Button(self.task_add_frame, text="追加 ＋", command=self.add_new_task, bg=self.theme["btn"], fg=self.theme["btn_fg"], font=FONT_BOLD, relief="flat", padx=8, cursor="hand2")
        self.task_add_btn.grid(row=1, column=3, padx=4)
        
        self.task_add_frame.columnconfigure(0, weight=1)
        
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

    def refresh_task_list(self):
        for widget in self.task_inner_frame.winfo_children():
            widget.destroy()
            
        g_status = "🟢 接続中" if self.google_sync.is_authenticated() else "⚪ 未連携 (デモ利用可)"
        self.sync_status_lbl.config(text=f"Google連携: {g_status}", bg=self.theme["card"], fg=self.theme["text"])
        self.task_sync_bar.config(bg=self.theme["card"])
        self.btn_tasks_sync.config(bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"])
        self.btn_cal_sync.config(bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"])
        self.task_add_frame.config(bg=self.theme["card"])
        self.task_add_title.config(bg=self.theme["card"], fg=self.theme["text"])
        self.task_entry.config(bg=self.theme["input_bg"], fg=self.theme["input_fg"], insertbackground=self.theme["text"])
        self.task_target_lbl.config(bg=self.theme["card"], fg=self.theme["text"])
        self.task_add_btn.config(bg=self.theme["btn"], fg=self.theme["btn_fg"])
        self.task_canvas.config(bg=self.theme["bg"])
        self.task_inner_frame.config(bg=self.theme["bg"])
        
        tasks = self.data_mgr.get_tasks()
        active_task = self.data_mgr.get_active_task()
        active_id = active_task["id"] if active_task else None
        
        if not tasks:
            empty_lbl = tk.Label(self.task_inner_frame, text="タスクがまだありません。\n上の入力欄やGoogle Tasksから追加してください 🐾", font=FONT_TEXT, fg=self.theme["sub_text"], bg=self.theme["bg"], pady=20)
            empty_lbl.pack()
            return
            
        for t in tasks:
            t_id = t["id"]
            is_active = (t_id == active_id)
            card_bg = self.theme["header"] if is_active else self.theme["card"]
            
            card = tk.Frame(self.task_inner_frame, bg=card_bg, padx=10, pady=7, relief="solid", bd=1 if is_active else 0)
            card.pack(fill='x', pady=3, padx=2)
            
            chk_var = tk.BooleanVar(value=t["is_done"])
            chk = tk.Checkbutton(card, variable=chk_var, bg=card_bg, activebackground=card_bg, command=lambda tid=t_id: self.toggle_task(tid))
            chk.pack(side='left')
            
            if t.get("google_id"):
                g_badge = tk.Label(card, text="G", font=("Segoe UI", 8, "bold"), bg=self.theme["btn_sec"], fg=GOOGLE_BLUE, padx=4)
                g_badge.pack(side='left', padx=(0, 4))
                
            strike = " (済)" if t["is_done"] else ""
            t_title = t["title"] + strike
            lbl_title = tk.Label(card, text=t_title, font=FONT_BOLD if is_active else FONT_TEXT, bg=card_bg, fg=self.theme["sub_text"] if t["is_done"] else self.theme["text"], anchor='w')
            lbl_title.pack(side='left', fill='x', expand=True, padx=4)
            
            pomo_str = f"🍅 {t['completed_pomo']}/{t['target_pomo']}"
            lbl_pomo = tk.Label(card, text=pomo_str, font=FONT_TEXT, bg=card_bg, fg=self.theme["work"])
            lbl_pomo.pack(side='left', padx=4)
            
            if not is_active and not t["is_done"]:
                select_btn = tk.Button(card, text="選択", font=("Meiryo", 8), bg=self.theme["btn"], fg=self.theme["btn_fg"], relief="flat", padx=6, cursor="hand2", command=lambda tid=t_id: self.select_task(tid))
                select_btn.pack(side='left', padx=2)
            elif is_active:
                tag = tk.Label(card, text="作業中", font=("Meiryo", 8, "bold"), bg=self.theme["work"], fg="#fff", padx=5)
                tag.pack(side='left', padx=2)
                
            del_btn = tk.Button(card, text="✕", font=("Meiryo", 8), bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"], relief="flat", padx=5, cursor="hand2", command=lambda tid=t_id: self.delete_task(tid))
            del_btn.pack(side='right')

        bind_mousewheel_to_all(self.task_inner_frame, self.task_canvas)

    def add_new_task(self):
        title = self.task_entry.get().strip()
        if not title:
            return
        try:
            target = int(self.task_target_spin.get())
        except ValueError:
            target = 1
        self.data_mgr.add_task(title, target)
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

    # --- 4. 設定タブ ---
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
        self.bgm_frame.pack(fill='x', pady=6)
        self.lbl_bgm = tk.Label(self.bgm_frame, text="環境音 BGM:", font=FONT_TEXT, bg=self.theme["card"], fg=self.theme["text"])
        self.lbl_bgm.pack(side='left')
        
        self.bgm_var = tk.StringVar(value=self.data_mgr.get_setting("bgm_type"))
        self.bgm_combo = ttk.Combobox(self.bgm_frame, textvariable=self.bgm_var, values=["none", "rain", "purr"], state="readonly", width=12, font=FONT_TEXT)
        self.bgm_combo.pack(side='left', padx=10)
        
        self.lbl_bgm_hint = tk.Label(self.settings_card, text="※ rain = 静かな雨音 / purr = 猫のゴロゴロ音", font=("Meiryo", 8), bg=self.theme["card"], fg=self.theme["sub_text"])
        self.lbl_bgm_hint.pack(anchor='w')
        
        self.save_settings_btn = tk.Button(self.settings_card, text="💾 設定を保存する", font=FONT_SUB, bg=self.theme["btn"], fg=self.theme["btn_fg"], relief="flat", padx=15, pady=6, cursor="hand2", command=self.save_settings)
        self.save_settings_btn.pack(pady=(20, 0))

    def refresh_settings_view(self):
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

    # --- アニメーション & 猫の自律AI ---
    def process_cat_ai(self, cat):
        if cat["state_timer"] <= 0:
            states = ["walk", "sit", "dash", "sleep"]
            weights = [40, 30, 10, 20]
            new_state = random.choices(states, weights=weights)[0]
            cat["state"] = new_state
            
            if new_state == "walk":
                cat["dx"] = random.choice([-2, -1, 1, 2])
                cat["dy"] = random.choice([-1, 1])
                cat["state_timer"] = random.randint(30, 80)
            elif new_state == "dash":
                cat["dx"] = random.choice([-4, -3, 3, 4])
                cat["dy"] = random.choice([-2, 2])
                cat["state_timer"] = random.randint(15, 30)
            elif new_state == "sit":
                cat["dx"] = 0
                cat["dy"] = 0
                cat["state_timer"] = random.randint(25, 60)
            elif new_state == "sleep":
                cat["dx"] = 0
                cat["dy"] = 0
                cat["state_timer"] = random.randint(40, 120)
        else:
            cat["state_timer"] -= 1

    def animate_loop(self):
        if not getattr(self, 'is_alive', True):
            return
            
        if self.has_images:
            self.anim_tick += 1
            is_sleep_time = not self.is_running or self.session_mode != "work"
            
            for cat in self.cats:
                c_id = cat["type"]
                tex = self.cat_textures[c_id]
                
                if is_sleep_time:
                    f_idx = (self.anim_tick // 15) % 2
                    try:
                        self.cat_canvas.itemconfig(cat["id"], image=tex[f"sleep_{f_idx}"])
                    except Exception:
                        pass
                else:
                    self.process_cat_ai(cat)
                    
                    if cat["state"] in ["walk", "dash"]:
                        cat["x"] += cat["dx"]
                        cat["y"] += cat["dy"]
                        
                        if cat["x"] < 25 or cat["x"] > self.canvas_w - 25:
                            cat["dx"] *= -1
                            cat["x"] += cat["dx"]
                        if cat["y"] < 25 or cat["y"] > self.canvas_h - 25:
                            cat["dy"] *= -1
                            cat["y"] += cat["dy"]
                            
                        cat["facing"] = "awake_r" if cat["dx"] > 0 else "awake_l"
                        y_off = 2 if (self.anim_tick % 4 < 2) and cat["state"] == "dash" else 0
                        try:
                            self.cat_canvas.coords(cat["id"], cat["x"], cat["y"] - y_off)
                            self.cat_canvas.itemconfig(cat["id"], image=tex[cat["facing"]])
                        except Exception:
                            pass
                    elif cat["state"] == "sit":
                        try:
                            self.cat_canvas.itemconfig(cat["id"], image=tex[cat["facing"]])
                        except Exception:
                            pass
                    elif cat["state"] == "sleep":
                        f_idx = (self.anim_tick // 15) % 2
                        try:
                            self.cat_canvas.itemconfig(cat["id"], image=tex[f"sleep_{f_idx}"])
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
                
            for effect in self.floating_effects[:]:
                effect["y"] -= 1.5
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
