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
    mask = alpha > 30
    if not np.any(mask):
        return base_img

    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    orig_b = 0.299 * r + 0.587 * g + 0.114 * b
    mean_b = orig_b[mask].mean()
    
    # ベース画像の明暗判定 (cat_play, cat_groom などの暗いベース画像にも対応)
    is_dark_base = mean_b < 100
    
    if is_dark_base:
        # 暗いベース画像: 最も暗い部分(b < 15)を輪郭、それ以外をボディと判定
        is_outline = mask & (orig_b < 15)
        is_body = mask & ~is_outline
        brightness = np.ones_like(orig_b, dtype=np.float32)
    else:
        # 明るいベース画像: 暗い部分(b < 80)を輪郭、明るい部分をボディと判定
        is_outline = mask & (orig_b < 80)
        is_body = mask & ~is_outline
        brightness = np.clip(orig_b / 255.0, 0.45, 1.0)
    
    # ベースカラーと模様の設定
    base_color = (255, 255, 255)
    pattern_color = None
    pattern_mask = None
    
    h, w = mask.shape
    y_idx, x_idx = np.indices((h, w))
    
    # 模様用のシンプルなノイズ
    fur_grain = np.sin(x_idx * 0.5) * np.cos(y_idx * 0.5) + np.sin(y_idx * 1.5)
    
    if cat_type == "black":
        base_color = (35, 34, 42)
    elif cat_type == "white":
        base_color = (252, 252, 254)
    elif cat_type == "gray":
        base_color = (130, 134, 142)
        pattern_color = (95, 98, 105)
        pattern_mask = is_body & ((x_idx % 4 == 0) | (y_idx % 6 == 0))
    elif cat_type == "calico":
        base_color = (255, 255, 255)
        # 三毛の模様: 頭部のオレンジ斑点 + 背中の黒斑点
        spot_orange = ((x_idx - 32)**2 + (y_idx - 9)**2 < 36) | (((x_idx - 16)**2 + (y_idx - 38)**2 < 30))
        spot_black = (((x_idx - 18)**2 + (y_idx - 25)**2 < 42)) | ((x_idx - 38)**2 + (y_idx - 40)**2 < 20)
        pattern_mask = is_body & spot_orange
        pattern_color = (235, 125, 45) # orange
        pattern_mask2 = is_body & spot_black & (~spot_orange)
        pattern_color2 = (42, 38, 48) # black
    elif cat_type == "siamese":
        base_color = (248, 242, 234)
        # シャム: 顔の中心と耳・尾のポイントカラー
        face_point = ((x_idx - 34)**2 + (y_idx - 13)**2 < 28) | (y_idx < 6) | (x_idx < 10)
        pattern_mask = is_body & face_point
        pattern_color = (65, 48, 38)
    elif cat_type == "orange":
        base_color = (242, 138, 52)
        pattern_mask = is_body & ((x_idx % 4 == 0) | (y_idx % 5 == 0))
        pattern_color = (205, 95, 25)
    elif cat_type == "tuxedo":
        base_color = (32, 35, 45)
        # タキシード: 胸元・お腹・足元の白
        white_tux = ((x_idx - 28)**2 + (y_idx - 26)**2 < 35) | ((y_idx > 33) & (x_idx > 22) & (x_idx < 35))
        pattern_mask = is_body & white_tux
        pattern_color = (255, 255, 255)
    elif cat_type == "cream":
        base_color = (252, 244, 230)
        pattern_mask = is_body & ((x_idx % 5 == 0) | (y_idx < 12))
        pattern_color = (226, 198, 156)
    elif cat_type == "ginger":
        base_color = (218, 68, 26)
        pattern_mask = is_body & ((x_idx % 4 == 0) | (y_idx % 5 == 0))
        pattern_color = (175, 45, 15)
    elif cat_type == "tortoiseshell":
        base_color = (42, 38, 45)
        pattern_mask = is_body & (((x_idx * 3 + y_idx * 5) % 7) < 3)
        pattern_color = (195, 95, 35)
    elif cat_type == "sakura":
        base_color = (255, 230, 240)
        pattern_mask = is_body & ((x_idx % 4 == 0) | (y_idx < 10))
        pattern_color = (255, 125, 175)
    elif cat_type == "mint":
        base_color = (210, 248, 226)
        pattern_mask = is_body & ((x_idx % 4 == 0) | (y_idx < 10))
        pattern_color = (60, 192, 135)
    elif cat_type == "sky":
        base_color = (190, 228, 255)
        pattern_mask = is_body & ((x_idx % 4 == 0) | (y_idx < 10))
        pattern_color = (35, 125, 225)
    elif cat_type == "lavender":
        base_color = (232, 212, 255)
        pattern_mask = is_body & ((x_idx % 4 == 0) | (y_idx < 10))
        pattern_color = (145, 75, 230)
    elif cat_type == "golden":
        base_color = (255, 218, 80)
        pattern_mask = is_body & ((x_idx % 4 == 0) | (y_idx % 5 == 0))
        pattern_color = (235, 125, 25)
    
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
