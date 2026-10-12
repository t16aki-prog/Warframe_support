import os
import numpy as np
from PIL import Image, ImageTk
from scripts.natural_cat_generator import generate_natural_cat

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


class ImageLoader:
    """画像リソースのロード・スプライトキャッシュ管理クラス"""
    def __init__(self, base_dir=None):
        if base_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.base_dir = base_dir
        self.cat_textures = {}
        self.bg_photo = None
        self.base_awake = None
        self.base_sleep = None
        self.widget_cat_frames = {}
        self.has_images = False

    def load_base_images(self, unlocked_cats=None):
        """基本画像と解放済み猫スプライトの初期ロード"""
        if unlocked_cats is None:
            unlocked_cats = ["black"]

        base_sprites_dir = os.path.join(self.base_dir, "assets", "base_sprites")
        awake_png = os.path.join(base_sprites_dir, "cat_awake.png")
        sleep_png = os.path.join(base_sprites_dir, "cat_sleep.png")
        awake_jpg = os.path.join(base_sprites_dir, "cat_awake.jpg")
        sleep_jpg = os.path.join(base_sprites_dir, "cat_sleep.jpg")
        bg_path = os.path.join(self.base_dir, "assets", "backgrounds", "room_bg.jpg")

        try:
            raw_bg = Image.open(bg_path).convert("RGB").resize((480, 270), Image.Resampling.LANCZOS)
            white_layer = Image.new("RGB", (480, 270), (255, 255, 255))
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

            for c_id in unlocked_cats:
                self.get_cat_texture(c_id)

            self.has_images = True
        except Exception as e:
            print("画像読み込みエラー:", e)
            self.has_images = False

    def get_cat_texture(self, cat_id):
        """猫スプライトのオンデマンド読み込み＆キャッシュ (高速化)"""
        if cat_id in self.cat_textures:
            return self.cat_textures[cat_id]

        sprites_dir = os.path.join(self.base_dir, "sprites")
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

    def update_widget_cat_frames(self, theme_bg, avatar_cat="black"):
        """現在のテーマの背景色に合わせてウィジェット用猫フレームを再合成"""
        if self.base_awake is None or self.base_sleep is None:
            return

        w_size = (26, 26)
        widget_bg = hex_to_rgb(theme_bg)

        t_aw = generate_natural_cat(self.base_awake, avatar_cat)
        t_sl = generate_natural_cat(self.base_sleep, avatar_cat)

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
