from PIL import Image
import numpy as np

def generate_chibi_cat(base_img, cat_type):
    """
    AI生成のChibiスタイル猫用着色アルゴリズム。
    元の画像の形状（アウトラインや目の位置）を完全に活かしつつ、
    白色の部分（ボディ）のみを猫のベースカラーに置き換え、
    一部の猫（三毛、トラ）にはランダムなノイズで模様を付加します。
    """
    # Resize to exactly 48x48 if not already, to be safe
    if base_img.size != (48, 48):
        base_img = base_img.resize((48, 48), Image.Resampling.LANCZOS)
    
    arr = np.array(base_img.convert("RGBA"))
    alpha = arr[:, :, 3]
    
    # マスク（透明でない部分）
    mask = alpha > 128
    if not np.any(mask):
        return base_img

    # ボディ判定（元の画像でRGBが全体的に明るい、つまり白色の部分）
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    # AI画像は白猫で、輪郭が黒（またはグレー）、目は黒やピンク
    is_body = mask & (r > 150) & (g > 150) & (b > 150)
    
    # ベースカラーと模様の設定
    base_color = (255, 255, 255)
    pattern_color = None
    pattern_mask = None
    
    h, w = mask.shape
    y_idx, x_idx = np.indices((h, w))
    
    # 模様用のシンプルなノイズ
    fur_grain = np.sin(x_idx * 0.5) * np.cos(y_idx * 0.5) + np.sin(y_idx * 1.5)
    
    if cat_type == "black":
        base_color = (32, 32, 34)
    elif cat_type == "gray":
        base_color = (120, 124, 130)
        pattern_color = (100, 104, 110)
        pattern_mask = fur_grain > 0
    elif cat_type == "calico":
        base_color = (255, 255, 255)
        # 三毛の模様: ランダムなオレンジと黒の斑点
        pattern_mask = is_body & (np.sin(x_idx * 0.2 + y_idx * 0.3) > 0.6)
        pattern_color = (235, 122, 45) # orange
        
        pattern_mask2 = is_body & (np.cos(x_idx * 0.3 - y_idx * 0.2) > 0.6)
        pattern_color2 = (42, 42, 42) # black
    elif cat_type == "siamese":
        base_color = (250, 240, 230)
        # シャムの模様: 端の方（x < 10 or x > 38 or y > 38）を焦げ茶に
        pattern_mask = is_body & ((x_idx < 12) | (x_idx > 36) | (y_idx > 36) | (y_idx < 12))
        pattern_color = (70, 50, 40)
    elif cat_type == "orange":
        base_color = (235, 122, 45)
        pattern_mask = is_body & (fur_grain > 0.2)
        pattern_color = (200, 100, 30)
    elif cat_type == "tuxedo":
        base_color = (28, 32, 42)
        # タキシード: お腹周りを白に
        pattern_mask = is_body & (y_idx > 24) & (x_idx > 12) & (x_idx < 36)
        pattern_color = (255, 255, 255)
    elif cat_type == "cream":
        base_color = (250, 242, 226)
        pattern_mask = is_body & (fur_grain > 0)
        pattern_color = (222, 192, 146)
    elif cat_type == "ginger":
        base_color = (218, 62, 22)
        pattern_mask = is_body & (fur_grain > 0.2)
        pattern_color = (180, 50, 18)
    elif cat_type == "tortoiseshell":
        base_color = (38, 38, 38)
        pattern_mask = is_body & (fur_grain > 0)
        pattern_color = (180, 80, 30)
    elif cat_type == "sakura":
        base_color = (255, 226, 238)
        pattern_mask = is_body & (fur_grain > 0)
        pattern_color = (255, 114, 170)
    elif cat_type == "mint":
        base_color = (202, 248, 222)
        pattern_mask = is_body & (fur_grain > 0)
        pattern_color = (54, 186, 128)
    elif cat_type == "sky":
        base_color = (180, 224, 255)
        pattern_mask = is_body & (fur_grain > 0)
        pattern_color = (30, 118, 216)
    elif cat_type == "lavender":
        base_color = (228, 206, 252)
        pattern_mask = is_body & (fur_grain > 0)
        pattern_color = (138, 68, 224)
    elif cat_type == "golden":
        base_color = (255, 216, 76)
        pattern_mask = is_body & (fur_grain > 0)
        pattern_color = (236, 118, 24)
    elif cat_type == "white":
        base_color = (255, 255, 255)
    
    # 陰影を計算 (元の画像の明暗を利用)
    brightness = r.astype(np.float32) / 255.0
    # ボディ部分は1.0、線は0.0になる
    
    out_arr = arr.copy()
    
    # 色の適用
    # まずベースカラー
    out_arr[is_body, 0] = np.clip(base_color[0] * brightness[is_body], 0, 255)
    out_arr[is_body, 1] = np.clip(base_color[1] * brightness[is_body], 0, 255)
    out_arr[is_body, 2] = np.clip(base_color[2] * brightness[is_body], 0, 255)
    
    # 模様1
    if pattern_mask is not None:
        out_arr[pattern_mask, 0] = np.clip(pattern_color[0] * brightness[pattern_mask], 0, 255)
        out_arr[pattern_mask, 1] = np.clip(pattern_color[1] * brightness[pattern_mask], 0, 255)
        out_arr[pattern_mask, 2] = np.clip(pattern_color[2] * brightness[pattern_mask], 0, 255)
        
    # 模様2 (三毛など)
    if cat_type == "calico" and 'pattern_mask2' in locals():
        out_arr[pattern_mask2, 0] = np.clip(pattern_color2[0] * brightness[pattern_mask2], 0, 255)
        out_arr[pattern_mask2, 1] = np.clip(pattern_color2[1] * brightness[pattern_mask2], 0, 255)
        out_arr[pattern_mask2, 2] = np.clip(pattern_color2[2] * brightness[pattern_mask2], 0, 255)
        
    return Image.fromarray(out_arr, mode="RGBA")
