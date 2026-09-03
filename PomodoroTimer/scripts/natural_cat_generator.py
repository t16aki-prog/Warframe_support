import numpy as np
from PIL import Image
from scripts.chibi_cat_generator import generate_chibi_cat

def generate_natural_cat(rgba_img, cat_type):
    """猫学・遺伝学的特徴に厳格に基づいた本物の毛柄・毛並みレンダリング"""
    arr = np.array(rgba_img.convert("RGBA"), dtype=np.float32)
    alpha = arr[:, :, 3]
    mask = alpha > 30
    
    if not np.any(mask):
        return rgba_img.copy()
        
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    orig_brightness = (0.299 * r + 0.587 * g + 0.114 * b)
    
    min_b = orig_brightness[mask].min() if np.any(mask) else 0
    max_b = orig_brightness[mask].max() if np.any(mask) else 255
    norm_b = (orig_brightness - min_b) / max(1.0, (max_b - min_b))
    
    # 動的閾値による特徴抽出
    is_outline = mask & (norm_b < 0.15)
    is_inner_ear = mask & (r > g + 2) & (r > b + 2) & (norm_b > 0.4) & (norm_b < 0.8)
    is_eye_white = mask & (norm_b > 0.85)
    
    # ボディ
    is_body = mask & ~is_outline & ~is_inner_ear & ~is_eye_white
    
    y_indices, x_indices = np.where(mask)
    y_min, y_max = y_indices.min(), y_indices.max()
    x_min, x_max = x_indices.min(), x_indices.max()
    h = max(1, y_max - y_min)
    w = max(1, x_max - x_min)
    
    Y, X = np.ogrid[:arr.shape[0], :arr.shape[1]]
    ny = (Y - y_min) / float(h)  # 0: 頭頂, 1: 足元
    nx = (X - x_min) / float(w)  # 0: しっぽ, 1: 顔
    
    # 微細なアグーチ毛並みノイズ
    fur_grain = np.sin(nx * 40 + ny * 25) * np.cos(nx * 20 - ny * 35) * 0.12
    dither = ((X % 2) ^ (Y % 2)) * 0.04 - 0.02
    
    # 立体陰影 (動的に強調)
    body_norm = norm_b[is_body]
    avg_norm = np.mean(body_norm) if len(body_norm) > 0 else 0.5
    shade = np.ones_like(orig_brightness)
    shade[mask] = np.clip((norm_b[mask] - avg_norm) * 0.6 + 1.0, 0.6, 1.4)
    
    target_r = np.zeros_like(r)
    target_g = np.zeros_like(g)
    target_b = np.zeros_like(b)
    
    def apply_color(m, cr, cg, cb):
        target_r[m] = cr
        target_g[m] = cg
        target_b[m] = cb

    outline_r, outline_g, outline_b = 18, 18, 22
    ear_r, ear_g, ear_b = 255, 185, 205
    
    # ==========================================
    # 🧬 15猫種の遺伝的・学術的毛柄モデリング
    # ==========================================
    
    if cat_type == "black":
        # 1. 漆黒猫 (Solid Black): 遺伝子 a/a (ノンアグーチ), B/B (ブラック)
        apply_color(mask, 32, 32, 38)
        angel_mark = (ny >= 0.46) & (ny <= 0.58) & (np.abs(nx - 0.48) < 0.06 + fur_grain * 0.02)
        apply_color(angel_mark, 245, 245, 250)
        outline_r, outline_g, outline_b = 12, 12, 16
        
    elif cat_type == "white":
        # 2. 純白猫 (Solid White): 遺伝子 W (優性白)
        apply_color(mask, 253, 253, 255)
        outline_r, outline_g, outline_b = 85, 88, 100
        ear_r, ear_g, ear_b = 255, 180, 200
        
    elif cat_type == "gray":
        # 3. ロシアンブルー (Russian Blue): 遺伝子 a/a, B/B, d/d
        apply_color(mask, 132, 142, 160)
        back = (nx > 0.60) | (ny < 0.28)
        apply_color(back, 110, 118, 135)
        socks = (ny > 0.78 + dither)
        apply_color(socks, 248, 248, 252)
        outline_r, outline_g, outline_b = 40, 45, 55
        
    elif cat_type == "orange":
        # 4. 茶トラ (Red Mackerel Tabby): 遺伝子 O, A/-, Mc/-
        apply_color(mask, 240, 138, 36)
        tabby_stripes = (np.sin(nx * 22 + ny * 8 + fur_grain * 3.0) > 0.25) | \
                        ((ny < 0.32) & (np.sin(nx * 32) > 0.30))
        apply_color(tabby_stripes, 162, 56, 8)
        white_under = ((ny > 0.58 + fur_grain * 0.03) & (np.abs(nx - 0.44) < 0.26)) | (ny > 0.78 + dither)
        apply_color(white_under, 255, 248, 238)
        outline_r, outline_g, outline_b = 48, 18, 6
        
    elif cat_type == "calico":
        # 5. 三毛猫 (Calico): 遺伝子 O/o, S/-
        apply_color(mask, 252, 252, 254)
        patch_orange = (((nx - 0.44)**2 + (ny - 0.48)**2) < (0.032 + fur_grain * 0.015)) | \
                       ((nx > 0.60) & (ny < 0.36 + fur_grain * 0.04))
        apply_color(patch_orange, 235, 120, 38)
        patch_black = (((nx - 0.26)**2 + (ny - 0.46)**2) < (0.026 + fur_grain * 0.012)) | \
                      ((nx >= 0.38) & (nx <= 0.56) & (ny < 0.32 + fur_grain * 0.04))
        apply_color(patch_black, 34, 34, 40)
        outline_r, outline_g, outline_b = 30, 30, 36
        
    elif cat_type == "tortoiseshell":
        # 6. サビ猫 (Tortoiseshell): 遺伝子 O/o, s/s
        apply_color(mask, 38, 32, 30)
        amber_mosaic = (np.sin(nx * 15 + ny * 12 + fur_grain * 4.0) * np.cos(nx * 8 - ny * 14)) > 0.02
        apply_color(amber_mosaic, 216, 108, 32)
        gold_flecks = (np.cos(nx * 18 + ny * 16 - fur_grain * 3.0) * np.sin(nx * 10 - ny * 8)) > 0.08
        apply_color(gold_flecks, 234, 185, 62)
        outline_r, outline_g, outline_b = 20, 16, 14
        
    elif cat_type == "siamese":
        # 7. シャム (Seal Point Siamese): 遺伝子 cs/cs
        apply_color(mask, 248, 238, 224)
        face_dist = np.sqrt(((nx - 0.58) * 1.5)**2 + ((ny - 0.38) * 1.8)**2)
        face_mask = (face_dist < 0.26 + fur_grain * 0.03) & (ny >= 0.24) & (ny <= 0.54)
        seal_points = (ny < 0.25) | face_mask | (ny > 0.74 + dither) | (nx < 0.18)
        apply_color(seal_points, 52, 34, 24)
        outline_r, outline_g, outline_b = 36, 24, 18
        
    elif cat_type == "tuxedo":
        # 8. ハチワレ / タキシード (Tuxedo Bicolor): 遺伝子 a/a, S/-
        apply_color(mask, 28, 32, 42)
        hachi_curve = np.abs(nx - 0.58) * 1.4 + 0.24 + fur_grain * 0.03
        hachiware = (ny >= 0.25) & (ny <= 0.55) & (ny > hachi_curve)
        apply_color(hachiware, 255, 255, 255)
        chest_socks = ((ny > 0.46 + fur_grain * 0.03) & (nx > 0.30) & (nx < 0.68)) | (ny > 0.76 + dither)
        apply_color(chest_socks, 255, 255, 255)
        outline_r, outline_g, outline_b = 15, 18, 24
        
    elif cat_type == "cream":
        # 9. クリーム (Cream Dilute): 遺伝子 e/e, d/d
        apply_color(mask, 250, 242, 226)
        back = (ny < 0.36 + fur_grain * 0.03) | ((nx > 0.48) & (ny < 0.58 + fur_grain * 0.03))
        apply_color(back, 222, 192, 146)
        belly = (ny > 0.68 + dither)
        apply_color(belly, 255, 252, 248)
        outline_r, outline_g, outline_b = 58, 46, 36
        
    elif cat_type == "ginger":
        # 10. ジンジャー (Deep Ginger Red)
        apply_color(mask, 218, 62, 22)
        white_accents = ((ny > 0.54 + fur_grain * 0.03) & (np.abs(nx - 0.44) < 0.25)) | (nx < 0.16)
        apply_color(white_accents, 255, 250, 244)
        outline_r, outline_g, outline_b = 45, 14, 8
        
    elif cat_type == "sakura":
        # 11. さくら (Sakura Pink)
        apply_color(mask, 255, 226, 238)
        cherry = (ny < 0.32 + fur_grain * 0.03) | ((nx > 0.52) & (ny < 0.56 + fur_grain * 0.03)) | (nx < 0.16)
        apply_color(cherry, 255, 114, 170)
        belly = (ny > 0.65 + dither) & (np.abs(nx - 0.44) < 0.24)
        apply_color(belly, 255, 250, 252)
        outline_r, outline_g, outline_b = 68, 38, 54
        
    elif cat_type == "mint":
        # 12. ミント (Pastel Mint)
        apply_color(mask, 202, 248, 222)
        leaf = (np.sin(nx * 18 + ny * 8 + fur_grain * 3.0) > 0.24) | (ny < 0.28)
        apply_color(leaf, 54, 186, 128)
        belly = (ny > 0.65 + dither) & (np.abs(nx - 0.44) < 0.24)
        apply_color(belly, 255, 255, 255)
        outline_r, outline_g, outline_b = 26, 58, 44
        
    elif cat_type == "sky":
        # 13. スカイ (Sky Blue)
        apply_color(mask, 180, 224, 255)
        clouds = (((nx - 0.42)**2 + (ny - 0.50)**2) < (0.036 + fur_grain * 0.015))
        apply_color(clouds, 255, 255, 255)
        blue_pt = (ny < 0.28) | (nx < 0.16)
        apply_color(blue_pt, 30, 118, 216)
        outline_r, outline_g, outline_b = 22, 48, 84
        
    elif cat_type == "lavender":
        # 14. パステルラベンダー (Pastel Lavender)
        apply_color(mask, 228, 206, 252)
        amethyst = (ny < 0.30) | ((nx > 0.60) & (ny < 0.52)) | (nx < 0.16)
        apply_color(amethyst, 138, 68, 224)
        belly = (ny > 0.65 + dither) & (np.abs(nx - 0.44) < 0.24)
        apply_color(belly, 254, 250, 255)
        outline_r, outline_g, outline_b = 52, 28, 78
        
    elif cat_type == "golden":
        # 15. ゴールドキャット (Golden Star Tabby)
        apply_color(mask, 255, 216, 76)
        gold_st = (np.sin(nx * 18 + ny * 8 + fur_grain * 3.0) > 0.24) | (ny < 0.28)
        apply_color(gold_st, 236, 118, 24)
        chest = (ny > 0.48) & (np.abs(nx - 0.46) < 0.24)
        apply_color(chest, 255, 250, 218)
        outline_r, outline_g, outline_b = 62, 38, 6

    # 陰影合成
    final_r = target_r * shade
    final_g = target_g * shade
    final_b = target_b * shade
    
    # 輪郭線
    final_r[is_outline] = outline_r
    final_g[is_outline] = outline_g
    final_b[is_outline] = outline_b
    
    # 耳の内側
    final_r[is_inner_ear] = ear_r
    final_g[is_inner_ear] = ear_g
    final_b[is_inner_ear] = ear_b
    
    # 目のハイライト
    final_r[is_eye_white] = 255
    final_g[is_eye_white] = 255
    final_b[is_eye_white] = 255

    out_arr = np.zeros_like(arr, dtype=np.uint8)
    out_arr[mask, 0] = np.clip(final_r[mask], 0, 255).astype(np.uint8)
    out_arr[mask, 1] = np.clip(final_g[mask], 0, 255).astype(np.uint8)
    out_arr[mask, 2] = np.clip(final_b[mask], 0, 255).astype(np.uint8)
    out_arr[mask, 3] = alpha[mask].astype(np.uint8)
    
    return Image.fromarray(out_arr, mode="RGBA")


def generate_cat_poses(base_images_or_awake, base_sleep_or_none, cat_type):
    """
    動いている時・寝ている時の全モーション専用ベース画像から、15種類の猫固有の極上テクスチャを個別合成したスプライト辞書を生成
    """
    if isinstance(base_images_or_awake, dict):
        base_dict = base_images_or_awake
    else:
        # 後方互換性
        aw = base_images_or_awake
        sl = base_sleep_or_none
        base_dict = {
            "awake": aw,
            "sleep": sl,
            "walk_0": aw,
            "walk_1": aw,
            "dash_0": aw,
            "dash_1": aw,
            "groom": aw,
            "stretch_0": aw,
            "stretch_1": aw,
            "play": aw,
            "pounce": aw,
            "sleep_belly": sl,
            "sleep_stretch": sl
        }
        
    poses = {}
    
    # 1. 優雅なお座り (sit) - ふわふわの巻き尻尾ポーズ
    sit_base = base_dict.get("sit", base_dict["awake"])
    tex_sit = generate_chibi_cat(sit_base, cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    poses["sit_r"] = tex_sit
    poses["sit_l"] = tex_sit.transpose(Image.FLIP_LEFT_RIGHT)
    poses["awake_r"] = poses["sit_r"]
    poses["awake_l"] = poses["sit_l"]
    
    # 2. 歩行 (walk) - 専用歩行ベース画像 0 & 1 (ベース画像は右向き)
    tex_w0 = generate_natural_cat(base_dict["walk_0"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    tex_w1 = generate_natural_cat(base_dict["walk_1"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    poses["walk_r_0"] = tex_w0
    poses["walk_r_1"] = tex_w1
    poses["walk_l_0"] = tex_w0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["walk_l_1"] = tex_w1.transpose(Image.FLIP_LEFT_RIGHT)
    
    # 3. ダッシュ (dash) - 専用AI画像 (ベース画像は右向き)
    d_f0 = generate_chibi_cat(base_dict["dash_0"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    d_f1 = generate_chibi_cat(base_dict["dash_1"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    poses["dash_r_0"] = d_f0
    poses["dash_r_1"] = d_f1
    poses["dash_l_0"] = d_f0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["dash_l_1"] = d_f1.transpose(Image.FLIP_LEFT_RIGHT)
    
    # 4. 毛づくろい (groom) - 専用AI画像 (ベース画像は右向き)
    gr_0 = generate_chibi_cat(base_dict["groom"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    gr_0_flip = gr_0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["groom_r_0"] = gr_0
    poses["groom_r_1"] = gr_0
    poses["groom_r_2"] = gr_0
    poses["groom_l_0"] = gr_0_flip
    poses["groom_l_1"] = gr_0_flip
    poses["groom_l_2"] = gr_0_flip
    
    # 5. 背のびポーズ (stretch) - 専用AI画像 (2コマ, ベース画像は右向き)
    st_0 = generate_chibi_cat(base_dict["stretch_0"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    st_1 = generate_chibi_cat(base_dict["stretch_1"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    poses["stretch_r_0"] = st_0
    poses["stretch_r_1"] = st_1
    poses["stretch_l_0"] = st_0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["stretch_l_1"] = st_1.transpose(Image.FLIP_LEFT_RIGHT)
    
    # 6. オモチャ遊び (play) - 専用AI画像 (ベース画像は右向き)
    pl_0 = generate_chibi_cat(base_dict["play"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    pl_0_flip = pl_0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["play_r_0"] = pl_0
    poses["play_r_1"] = pl_0
    poses["play_r_2"] = pl_0
    poses["play_l_0"] = pl_0_flip
    poses["play_l_1"] = pl_0_flip
    poses["play_l_2"] = pl_0_flip
    
    # 7. 飛びつき・跳ねる (pounce) - 専用ジャンプベース画像 (ベース画像は右向き)
    tex_po = generate_natural_cat(base_dict["pounce"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    po_0 = tex_po.copy()
    po_1 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    po_1.paste(tex_po, (0, -2))
    poses["pounce_r_0"] = po_0
    poses["pounce_r_1"] = po_1
    poses["pounce_l_0"] = po_0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["pounce_l_1"] = po_1.transpose(Image.FLIP_LEFT_RIGHT)
    
    # --- 寝姿レパートリー (Sleep Poses) ---
    
    # A. 丸まり寝 (sleep_curl) - 専用丸まりベース画像 + 呼吸 (微小Yオフセット)
    tex_sl = generate_natural_cat(base_dict["sleep"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    sl_c0 = tex_sl.copy()
    sl_c1 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    sl_c1.paste(tex_sl, (0, 1))
    poses["sleep_curl_0"] = sl_c0
    poses["sleep_curl_1"] = sl_c1
    poses["sleep_0"] = sl_c0
    poses["sleep_1"] = sl_c1
    
    # B. 仰向けヘソ天寝 (sleep_belly) - 専用ヘソ天ベース画像 + 呼吸
    tex_sb = generate_natural_cat(base_dict["sleep_belly"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    sb_0 = tex_sb.copy()
    sb_1 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    sb_1.paste(tex_sb, (0, 1))
    poses["sleep_belly_0"] = sb_0
    poses["sleep_belly_1"] = sb_1
    
    # C. 体を広げて伸ばして寝る (sleep_stretch) - 専用のびのびベース画像 + 呼吸
    tex_ss = generate_natural_cat(base_dict["sleep_stretch"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    ss_0 = tex_ss.copy()
    ss_1 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    ss_1.paste(tex_ss, (0, 1))
    poses["sleep_stretch_0"] = ss_0
    poses["sleep_stretch_1"] = ss_1
    
    return poses
