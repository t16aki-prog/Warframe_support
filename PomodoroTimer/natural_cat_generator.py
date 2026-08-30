import numpy as np
from PIL import Image

def generate_natural_cat(rgba_img, cat_type):
    """猫のベース画像から、立体陰影・毛並みテクスチャ・有機的な柄を融合して超自然な猫を生成"""
    arr = np.array(rgba_img.convert("RGBA"), dtype=np.float32)
    alpha = arr[:, :, 3]
    mask = alpha > 40
    
    if not np.any(mask):
        return rgba_img.copy()
        
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    orig_brightness = (0.299 * r + 0.587 * g + 0.114 * b)
    
    # 輪郭線（アウトライン、口、目の中の黒など）
    is_outline = mask & (orig_brightness < 22)
    # 耳の内側（ピンク系ピクセル）
    is_inner_ear = mask & (r > 75) & (r > g + 8) & (r > b - 10)
    # 目の白目・ハイライト
    is_eye_white = mask & (r > 110) & (g > 110) & (b > 110)
    # 体の毛（ボディ）
    is_body = mask & ~is_outline & ~is_inner_ear & ~is_eye_white
    
    # 元画像のシェーディング（立体陰影の係数 0.78 〜 1.25）
    body_brights = orig_brightness[is_body]
    avg_b = np.mean(body_brights) if len(body_brights) > 0 else 45.0
    shade = np.ones_like(orig_brightness)
    shade[mask] = np.clip((orig_brightness[mask] - avg_b) * 0.0085 + 1.0, 0.78, 1.25)
    
    # 正規化座標
    y_indices, x_indices = np.where(mask)
    y_min, y_max = y_indices.min(), y_indices.max()
    x_min, x_max = x_indices.min(), x_indices.max()
    h = max(1, y_max - y_min)
    w = max(1, x_max - x_min)
    
    Y, X = np.ogrid[:arr.shape[0], :arr.shape[1]]
    ny = (Y - y_min) / float(h)  # 0: 頭頂, 1: 足元
    nx = (X - x_min) / float(w)  # 0: しっぽ, 1: 顔
    
    # 有機的な毛並みノイズ (フラクタルパーリン風)
    noise1 = np.sin(nx * 28 + ny * 16) * np.cos(nx * 18 - ny * 24)
    noise2 = np.cos(nx * 42 - ny * 12) * np.sin(nx * 16 + ny * 32)
    noise = noise1 * 0.6 + noise2 * 0.4
    
    # ディザリング用チェッカーパターン
    dither = ((X % 2) ^ (Y % 2)) * 0.08 - 0.04
    
    target_r = np.zeros_like(r)
    target_g = np.zeros_like(g)
    target_b = np.zeros_like(b)
    
    def apply_color(m, cr, cg, cb):
        target_r[m] = cr
        target_g[m] = cg
        target_b[m] = cb

    outline_r, outline_g, outline_b = 20, 20, 26
    ear_r, ear_g, ear_b = 255, 185, 205
    
    # --- 15種類の猫固有のリアル＆ナチュラル毛柄設計 ---
    if cat_type == "black":
        # くろねこ: つややかな黒毛 + ほんのり白い胸元のエンジェルマーク
        apply_color(mask, 34, 34, 40)
        chest_mask = (ny >= 0.44) & (ny <= 0.62) & (np.abs(nx - 0.48) < (0.62 - ny) * 0.7 + noise * 0.03)
        apply_color(chest_mask, 238, 238, 245)
        outline_r, outline_g, outline_b = 14, 14, 18

    elif cat_type == "white":
        # しろねこ: ふんわり純白 + やわらかなシルバーグレー輪郭
        apply_color(mask, 253, 253, 255)
        outline_r, outline_g, outline_b = 82, 85, 96
        ear_r, ear_g, ear_b = 255, 180, 200

    elif cat_type == "gray":
        # はいいろねこ (ロシアンブルー): ビロードのようなシルバーグレー + 白ソックス
        apply_color(mask, 138, 146, 162)
        back = (nx > 0.60) | (ny < 0.28)
        apply_color(back, 112, 120, 136)
        socks = (ny > 0.76 + dither)
        apply_color(socks, 245, 246, 252)
        outline_r, outline_g, outline_b = 45, 48, 56

    elif cat_type == "calico":
        # みけねこ (三毛): 有機的な白・茶・黒のリアルな毛並みパッチ
        apply_color(mask, 252, 252, 254)
        patch1 = (((nx - 0.44)**2 + (ny - 0.50)**2) < (0.032 + noise * 0.016)) | \
                 ((nx > 0.60) & (ny < 0.38 + noise * 0.05)) | \
                 ((nx < 0.24) & (ny > 0.54 + noise * 0.04))
        apply_color(patch1, 232, 118, 40)
        patch2 = (((nx - 0.28)**2 + (ny - 0.45)**2) < (0.026 + noise * 0.012)) | \
                 ((nx >= 0.38) & (nx <= 0.58) & (ny < 0.34 + noise * 0.04)) | \
                 (nx > 0.75 + noise * 0.04)
        apply_color(patch2, 36, 36, 42)
        outline_r, outline_g, outline_b = 32, 32, 38

    elif cat_type == "siamese":
        # シャムねこ: 自然なグラデーションで広がるシールポイント
        apply_color(mask, 248, 238, 224)
        face_dist = np.sqrt(((nx - 0.58) * 1.6)**2 + ((ny - 0.40) * 1.8)**2)
        face_point = (face_dist < 0.28 + noise * 0.04) & (ny >= 0.26) & (ny <= 0.55)
        points = (ny < 0.26) | face_point | (ny > 0.74 + dither) | (nx < 0.20)
        apply_color(points, 54, 36, 26)
        outline_r, outline_g, outline_b = 40, 28, 22

    elif cat_type == "orange":
        # ちゃとら (茶トラ): 自然な毛流れに沿った美しいタビーストライプ
        apply_color(mask, 240, 138, 38)
        tabby_wave = np.sin(nx * 18 + ny * 6 + noise * 3.0)
        stripes = (tabby_wave > 0.32) | ((ny < 0.36) & (np.sin(nx * 26 + noise * 2.0) > 0.38))
        apply_color(stripes, 165, 62, 10)
        belly = (ny > 0.60 + noise * 0.04) & (np.abs(nx - 0.44) < 0.24)
        apply_color(belly, 255, 248, 236)
        socks = (ny > 0.78 + dither)
        apply_color(socks, 255, 248, 236)
        outline_r, outline_g, outline_b = 52, 22, 8

    elif cat_type == "cream":
        # クリームねこ: ふんわりミルクティー色 + 背中キャラメル
        apply_color(mask, 250, 242, 226)
        back = (ny < 0.36 + noise * 0.04) | ((nx > 0.48) & (ny < 0.58 + noise * 0.04))
        apply_color(back, 224, 194, 150)
        belly = (ny > 0.68 + dither)
        apply_color(belly, 255, 252, 248)
        outline_r, outline_g, outline_b = 62, 50, 40

    elif cat_type == "ginger":
        # ジンジャー: 深みのある赤狐レッド + 白いお腹としっぽ先
        apply_color(mask, 216, 66, 26)
        white_parts = ((ny > 0.54 + noise * 0.04) & (np.abs(nx - 0.44) < 0.26)) | \
                      ((ny >= 0.40) & (ny <= 0.60) & (nx >= 0.44) & (nx <= 0.60)) | \
                      (nx < 0.16 + noise * 0.03)
        apply_color(white_parts, 255, 250, 244)
        outline_r, outline_g, outline_b = 48, 16, 10

    elif cat_type == "tuxedo":
        # はちわれ (タキシード): 額の自然なハの字白割れ + タキシード胸元
        apply_color(mask, 32, 36, 46)
        hachi_curve = np.abs(nx - 0.58) * 1.5 + 0.24 + noise * 0.04
        hachiware = (ny >= 0.26) & (ny <= 0.56) & (ny > hachi_curve)
        apply_color(hachiware, 255, 255, 255)
        tuxedo_belly = ((ny > 0.48 + noise * 0.04) & (nx > 0.30) & (nx < 0.68)) | (ny > 0.76 + dither)
        apply_color(tuxedo_belly, 255, 255, 255)
        outline_r, outline_g, outline_b = 18, 20, 28

    elif cat_type == "tortoiseshell":
        # サビねこ (べっ甲): ランダムな琥珀とゴールドが織りなす極上のモザイク
        apply_color(mask, 42, 34, 32)
        amber_patch = (np.sin(nx * 14 + ny * 12 + noise * 4.0) * np.cos(nx * 8 - ny * 14)) > 0.04
        apply_color(amber_patch, 214, 110, 36)
        gold_patch = (np.cos(nx * 16 + ny * 18 - noise * 3.0) * np.sin(nx * 10 - ny * 8)) > 0.10
        apply_color(gold_patch, 230, 182, 65)
        outline_r, outline_g, outline_b = 24, 18, 16

    elif cat_type == "sakura":
        # さくらねこ: ほんのり桜色 + 花びらのようなチェリーピンクグラデーション
        apply_color(mask, 255, 226, 238)
        cherry = (ny < 0.32 + noise * 0.04) | ((nx > 0.52) & (ny < 0.56 + noise * 0.04)) | (nx < 0.16)
        apply_color(cherry, 255, 116, 172)
        belly = (ny > 0.65 + dither) & (np.abs(nx - 0.44) < 0.25)
        apply_color(belly, 255, 250, 252)
        outline_r, outline_g, outline_b = 72, 42, 58

    elif cat_type == "mint":
        # ミントねこ: 爽やかなパステルミント + 優しいリーフ模様
        apply_color(mask, 204, 248, 224)
        leaf = (np.sin(nx * 18 + ny * 8 + noise * 3.0) > 0.26) | (ny < 0.28 + noise * 0.04)
        apply_color(leaf, 56, 184, 130)
        belly = (ny > 0.65 + dither) & (np.abs(nx - 0.44) < 0.24)
        apply_color(belly, 255, 255, 255)
        outline_r, outline_g, outline_b = 28, 62, 48

    elif cat_type == "sky":
        # スカイねこ: 青空スカイブルー + 雲のふんわり白ぶち + マリンブルー
        apply_color(mask, 182, 226, 255)
        clouds = (((nx - 0.42)**2 + (ny - 0.50)**2) < (0.036 + noise * 0.015)) | \
                 (((nx - 0.62)**2 + (ny - 0.58)**2) < (0.024 + noise * 0.01))
        apply_color(clouds, 255, 255, 255)
        blue_points = (ny < 0.28 + noise * 0.03) | (nx < 0.16)
        apply_color(blue_points, 32, 120, 214)
        outline_r, outline_g, outline_b = 24, 52, 88

    elif cat_type == "lavender":
        # パステルラベンダー: 幻想的なライラック + アメジストバイオレット
        apply_color(mask, 230, 208, 252)
        amethyst = (ny < 0.30 + noise * 0.04) | ((nx > 0.60) & (ny < 0.52 + noise * 0.04)) | (nx < 0.16)
        apply_color(amethyst, 140, 70, 224)
        belly = (ny > 0.65 + dither) & (np.abs(nx - 0.44) < 0.24)
        apply_color(belly, 254, 250, 255)
        outline_r, outline_g, outline_b = 55, 30, 82

    elif cat_type == "golden":
        # ゴールドキャット: きらめく黄金イエロー + アンバーの星屑タビー
        apply_color(mask, 255, 216, 78)
        gold_stripes = (np.sin(nx * 18 + ny * 8 + noise * 3.0) > 0.26) | (ny < 0.28 + noise * 0.04)
        apply_color(gold_stripes, 236, 120, 26)
        chest = (ny > 0.48 + noise * 0.03) & (np.abs(nx - 0.46) < 0.24)
        apply_color(chest, 255, 250, 220)
        outline_r, outline_g, outline_b = 65, 40, 8

    # 1. ボディに陰影（Shading）を乗算合成して立体感を付与
    final_r = target_r * shade
    final_g = target_g * shade
    final_b = target_b * shade
    
    # 2. 輪郭線（アウトライン）の適用
    final_r[is_outline] = outline_r
    final_g[is_outline] = outline_g
    final_b[is_outline] = outline_b
    
    # 3. 耳の内側（ピンク）の適用
    final_r[is_inner_ear] = ear_r
    final_g[is_inner_ear] = ear_g
    final_b[is_inner_ear] = ear_b
    
    # 4. 目のハイライト・白目の保護
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
            "dash": aw,
            "groom": aw,
            "stretch": aw,
            "play": aw,
            "pounce": aw,
            "sleep_belly": sl,
            "sleep_stretch": sl
        }
        
    poses = {}
    
    # 1. 立ち・座り (sit)
    tex_sit = generate_natural_cat(base_dict["awake"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    poses["sit_r"] = tex_sit.transpose(Image.FLIP_LEFT_RIGHT)
    poses["sit_l"] = tex_sit
    poses["awake_r"] = poses["sit_r"]
    poses["awake_l"] = poses["sit_l"]
    
    # 2. 歩行 (walk) - 専用歩行ベース画像 0 & 1
    tex_w0 = generate_natural_cat(base_dict["walk_0"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    tex_w1 = generate_natural_cat(base_dict["walk_1"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    poses["walk_r_0"] = tex_w0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["walk_r_1"] = tex_w1.transpose(Image.FLIP_LEFT_RIGHT)
    poses["walk_l_0"] = tex_w0
    poses["walk_l_1"] = tex_w1
    
    # 3. ダッシュ (dash) - 専用疾走ベース画像
    tex_dash = generate_natural_cat(base_dict["dash"], cat_type).resize((50, 46), Image.Resampling.LANCZOS)
    d_f0 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    d_f0.paste(tex_dash, (-1, 2))
    d_f1 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    d_f1.paste(tex_dash.resize((50, 44), Image.Resampling.LANCZOS), (-1, 4))
    poses["dash_r_0"] = d_f0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["dash_r_1"] = d_f1.transpose(Image.FLIP_LEFT_RIGHT)
    poses["dash_l_0"] = d_f0
    poses["dash_l_1"] = d_f1
    
    # 4. 毛づくろい (groom / 顔洗い) - 専用前足持ち上げベース画像
    tex_gr = generate_natural_cat(base_dict["groom"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    gr_0 = tex_gr.copy()
    gr_1 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    gr_1.paste(tex_gr.rotate(-8, resample=Image.Resampling.BICUBIC), (0, 0))
    gr_2 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    gr_2.paste(tex_gr.rotate(6, resample=Image.Resampling.BICUBIC), (0, 0))
    poses["groom_r_0"] = gr_0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["groom_r_1"] = gr_1.transpose(Image.FLIP_LEFT_RIGHT)
    poses["groom_r_2"] = gr_2.transpose(Image.FLIP_LEFT_RIGHT)
    poses["groom_l_0"] = gr_0
    poses["groom_l_1"] = gr_1
    poses["groom_l_2"] = gr_2
    
    # 5. 猫の伸びポーズ (stretch) - 専用背伸びベース画像
    tex_st = generate_natural_cat(base_dict["stretch"], cat_type).resize((52, 42), Image.Resampling.LANCZOS)
    st_0 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    st_0.paste(tex_st, (-2, 6))
    st_1 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    st_1.paste(tex_st.resize((54, 40), Image.Resampling.LANCZOS), (-3, 8))
    poses["stretch_r_0"] = st_0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["stretch_r_1"] = st_1.transpose(Image.FLIP_LEFT_RIGHT)
    poses["stretch_l_0"] = st_0
    poses["stretch_l_1"] = st_1
    
    # 6. じゃれる・チョイチョイ (play) - 専用前足浮かしベース画像
    tex_pl = generate_natural_cat(base_dict["play"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    pl_0 = tex_pl.copy()
    pl_1 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    pl_1.paste(tex_pl.rotate(8, resample=Image.Resampling.BICUBIC), (2, -2))
    pl_2 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    pl_2.paste(tex_pl.rotate(14, resample=Image.Resampling.BICUBIC), (3, -3))
    poses["play_r_0"] = pl_0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["play_r_1"] = pl_1.transpose(Image.FLIP_LEFT_RIGHT)
    poses["play_r_2"] = pl_2.transpose(Image.FLIP_LEFT_RIGHT)
    poses["play_l_0"] = pl_0
    poses["play_l_1"] = pl_1
    poses["play_l_2"] = pl_2
    
    # 7. 飛びつき・跳ねる (pounce) - 専用ジャンプベース画像
    tex_po = generate_natural_cat(base_dict["pounce"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    po_0 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    po_0.paste(tex_po.resize((48, 42), Image.Resampling.LANCZOS), (0, 6))
    po_1 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    po_1.paste(tex_po, (0, -4))
    poses["pounce_r_0"] = po_0.transpose(Image.FLIP_LEFT_RIGHT)
    poses["pounce_r_1"] = po_1.transpose(Image.FLIP_LEFT_RIGHT)
    poses["pounce_l_0"] = po_0
    poses["pounce_l_1"] = po_1
    
    # --- 寝姿レパートリー (Sleep Poses) ---
    
    # A. 丸まり寝 (sleep_curl) - 専用丸まりベース画像 + 呼吸
    tex_sl = generate_natural_cat(base_dict["sleep"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    sl_c0 = tex_sl.copy()
    sl_c1 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    sl_c1.paste(tex_sl.resize((48, 44), Image.Resampling.LANCZOS), (0, 4))
    poses["sleep_curl_0"] = sl_c0
    poses["sleep_curl_1"] = sl_c1
    poses["sleep_0"] = sl_c0
    poses["sleep_1"] = sl_c1
    
    # B. 仰向けヘソ天寝 (sleep_belly) - 専用ヘソ天ベース画像 + 呼吸
    tex_sb = generate_natural_cat(base_dict["sleep_belly"], cat_type).resize((48, 48), Image.Resampling.LANCZOS)
    sb_0 = tex_sb.copy()
    sb_1 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    sb_1.paste(tex_sb.resize((48, 45), Image.Resampling.LANCZOS), (0, 3))
    poses["sleep_belly_0"] = sb_0
    poses["sleep_belly_1"] = sb_1
    
    # C. 体を広げて伸ばして寝る (sleep_stretch) - 専用のびのびベース画像 + 呼吸
    tex_ss = generate_natural_cat(base_dict["sleep_stretch"], cat_type).resize((52, 44), Image.Resampling.LANCZOS)
    ss_0 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    ss_0.paste(tex_ss, (-2, 4))
    ss_1 = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    ss_1.paste(tex_ss.resize((52, 42), Image.Resampling.LANCZOS), (-2, 6))
    poses["sleep_stretch_0"] = ss_0
    poses["sleep_stretch_1"] = ss_1
    
    return poses
