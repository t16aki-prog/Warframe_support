import numpy as np
from PIL import Image

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
    if isinstance(base_images_or_awake, dict):
        aw = base_images_or_awake.get("awake", base_images_or_awake.get("walk_0"))
        sl = base_images_or_awake.get("sleep", base_sleep_or_none)
    else:
        aw = base_images_or_awake
        sl = base_sleep_or_none
        
    aw = generate_natural_cat(aw, cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    if sl:
        sl = generate_natural_cat(sl, cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    else:
        sl = aw
    
    poses = {}
    
    def stretch(img, scale_x, scale_y):
        w, h = img.size
        new_w, new_h = max(1, int(w * scale_x)), max(1, int(h * scale_y))
        res = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        bg = Image.new("RGBA", (48, 48), (0,0,0,0))
        bg.paste(res, (24 - new_w//2, 24 - new_h//2))
        return bg
        
    # 1. sit
    poses["sit_r"] = aw.transpose(Image.FLIP_LEFT_RIGHT)
    poses["sit_l"] = aw
    poses["awake_r"] = poses["sit_r"]
    poses["awake_l"] = poses["sit_l"]
    
    # 2. walk
    w, h = 48, 48
    top = aw.crop((0, 0, w, int(h * 0.6)))
    bot = aw.crop((0, int(h * 0.6), w, h))
    
    w0 = Image.new("RGBA", (48, 48))
    w0.paste(top, (0, 0))
    w0.paste(bot.transform(bot.size, Image.AFFINE, (1, -0.3, 0, 0, 1, 0), resample=Image.Resampling.BICUBIC), (0, int(h * 0.6)))
    
    w1 = Image.new("RGBA", (48, 48))
    w1.paste(top, (0, 0))
    w1.paste(bot.transform(bot.size, Image.AFFINE, (1, 0.3, 0, 0, 1, 0), resample=Image.Resampling.BICUBIC), (0, int(h * 0.6)))
    
    poses["walk_r_0"] = w0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["walk_r_1"] = w1.transpose(Image.FLIP_LEFT_RIGHT)
    poses["walk_l_0"] = w0
    poses["walk_l_1"] = w1
    
    # 3. dash
    dash_aw = aw.rotate(-15, resample=Image.Resampling.BICUBIC)
    d0 = stretch(dash_aw, 1.2, 0.8)
    d1 = stretch(dash_aw, 1.1, 0.9)
    poses["dash_r_0"] = d0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["dash_r_1"] = d1.transpose(Image.FLIP_LEFT_RIGHT)
    poses["dash_l_0"] = d0
    poses["dash_l_1"] = d1
    
    # 4. groom
    head = aw.crop((0, 0, w//2, h//2))
    body = aw.copy()
    body.paste(Image.new("RGBA", head.size, (0,0,0,0)), (0, 0)) 
    head_rot = head.rotate(25, resample=Image.Resampling.BICUBIC)
    
    paw = aw.crop((0, h//2, w//2, h))
    
    g0 = body.copy()
    g0.paste(head_rot, (4, 4), head_rot)
    g0.paste(paw.rotate(45), (0, h//3), paw.rotate(45))
    
    g1 = body.copy()
    g1.paste(head_rot, (2, 2), head_rot)
    
    g2 = body.copy()
    g2.paste(head_rot, (0, 0), head_rot)
    g2.paste(paw.rotate(30), (-2, h//3 + 2), paw.rotate(30))

    poses["groom_r_0"] = g0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["groom_r_1"] = g1.transpose(Image.FLIP_LEFT_RIGHT)
    poses["groom_r_2"] = g2.transpose(Image.FLIP_LEFT_RIGHT)
    poses["groom_l_0"] = g0
    poses["groom_l_1"] = g1
    poses["groom_l_2"] = g2
    
    # 5. stretch
    s0 = stretch(aw, 1.3, 0.8)
    s0 = s0.rotate(15, resample=Image.Resampling.BICUBIC)
    s1 = stretch(aw, 1.4, 0.7)
    s1 = s1.rotate(20, resample=Image.Resampling.BICUBIC)
    poses["stretch_r_0"] = s0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["stretch_r_1"] = s1.transpose(Image.FLIP_LEFT_RIGHT)
    poses["stretch_l_0"] = s0
    poses["stretch_l_1"] = s1
    
    # 6. play
    p_base = aw.rotate(-35, resample=Image.Resampling.BICUBIC)
    p0 = Image.new("RGBA", (48, 48))
    p0.paste(p_base, (0, 0))
    p1 = Image.new("RGBA", (48, 48))
    p1.paste(p_base, (-2, -6))
    p2 = Image.new("RGBA", (48, 48))
    p2.paste(p_base, (-4, -10))
    poses["play_r_0"] = p0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["play_r_1"] = p1.transpose(Image.FLIP_LEFT_RIGHT)
    poses["play_r_2"] = p2.transpose(Image.FLIP_LEFT_RIGHT)
    poses["play_l_0"] = p0
    poses["play_l_1"] = p1
    poses["play_l_2"] = p2
    
    # 7. pounce
    po0 = stretch(aw, 0.9, 0.9)
    po0 = po0.rotate(-10, resample=Image.Resampling.BICUBIC)
    po1 = stretch(aw, 1.2, 0.8)
    po1 = po1.rotate(-30, resample=Image.Resampling.BICUBIC)
    po1_bg = Image.new("RGBA", (48, 48))
    po1_bg.paste(po1, (-4, -8))
    poses["pounce_r_0"] = po0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["pounce_r_1"] = po1_bg.transpose(Image.FLIP_LEFT_RIGHT)
    poses["pounce_l_0"] = po0
    poses["pounce_l_1"] = po1_bg
    
    # --- Sleep Poses ---
    
    # A. sleep_curl
    sc0 = sl
    sc1 = stretch(sl, 1.05, 0.95)
    poses["sleep_curl_0"] = sc0
    poses["sleep_curl_1"] = sc1
    poses["sleep_0"] = sc0
    poses["sleep_1"] = sc1
    
    # B. sleep_belly
    sb0 = sl.rotate(180)
    sb0 = stretch(sb0, 1.1, 0.8)
    sb1 = stretch(sb0, 1.05, 0.95)
    poses["sleep_belly_0"] = sb0
    poses["sleep_belly_1"] = sb1
    
    # C. sleep_stretch
    sst0 = stretch(sl, 1.4, 0.7)
    sst1 = stretch(sl, 1.45, 0.65)
    poses["sleep_stretch_0"] = sst0
    poses["sleep_stretch_1"] = sst1
    
    return poses
