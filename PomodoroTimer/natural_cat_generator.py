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
    is_eye_white = mask & (r > 100) & (g > 100) & (b > 100)
    # 体の毛（ボディ）
    is_body = mask & ~is_outline & ~is_inner_ear & ~is_eye_white
    
    # 元画像のシェーディング（平均45を基準とした陰影係数 0.8 〜 1.25）
    body_brights = orig_brightness[is_body]
    avg_b = np.mean(body_brights) if len(body_brights) > 0 else 45.0
    # 陰影の強弱係数
    shade = np.ones_like(orig_brightness)
    shade[mask] = np.clip((orig_brightness[mask] - avg_b) * 0.008 + 1.0, 0.82, 1.22)
    
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
    noise1 = np.sin(nx * 30 + ny * 15) * np.cos(nx * 20 - ny * 25)
    noise2 = np.cos(nx * 45 - ny * 10) * np.sin(nx * 15 + ny * 35)
    noise = noise1 * 0.6 + noise2 * 0.4
    
    # ディザリング用チェッカーパターン (ドット絵の自然なブレンド用)
    dither = ((X % 2) ^ (Y % 2)) * 0.08 - 0.04
    
    # 出力カラーバッファ
    target_r = np.zeros_like(r)
    target_g = np.zeros_like(g)
    target_b = np.zeros_like(b)
    
    def apply_color(m, cr, cg, cb):
        target_r[m] = cr
        target_g[m] = cg
        target_b[m] = cb

    outline_r, outline_g, outline_b = 20, 20, 26
    ear_r, ear_g, ear_b = 255, 190, 210
    
    # --- 15種類の猫固有のリアル＆ナチュラル毛柄設計 ---
    if cat_type == "black":
        # くろねこ: つややかな黒毛 + ほんのり白い胸元のエンジェルマーク
        apply_color(mask, 36, 36, 42)
        # 胸元
        chest_mask = (ny >= 0.45) & (ny <= 0.60) & (np.abs(nx - 0.48) < (0.60 - ny) * 0.7 + noise * 0.03)
        apply_color(chest_mask, 235, 235, 242)
        outline_r, outline_g, outline_b = 15, 15, 18

    elif cat_type == "white":
        # しろねこ: ふんわり純白 + やわらかなシルバーグレー輪郭
        apply_color(mask, 252, 252, 255)
        outline_r, outline_g, outline_b = 85, 85, 98
        ear_r, ear_g, ear_b = 255, 185, 205

    elif cat_type == "gray":
        # はいいろねこ (ロシアンブルー): ビロードのようなシルバーグレー + 白ソックス
        apply_color(mask, 142, 150, 166)
        back = (nx > 0.62) | (ny < 0.28)
        apply_color(back, 118, 126, 142)
        socks = (ny > 0.78 + dither)
        apply_color(socks, 245, 246, 252)
        outline_r, outline_g, outline_b = 48, 52, 60

    elif cat_type == "calico":
        # みけねこ (三毛): 有機的な白・茶・黒のリアルな毛並みパッチ
        apply_color(mask, 252, 252, 254)
        # 茶トラ斑点 (丸みと毛先の揺らぎ)
        patch1 = (((nx - 0.44)**2 + (ny - 0.50)**2) < (0.03 + noise * 0.015)) | \
                 ((nx > 0.62) & (ny < 0.38 + noise * 0.05)) | \
                 ((nx < 0.24) & (ny > 0.55 + noise * 0.04))
        apply_color(patch1, 230, 120, 42)
        # 漆黒斑点
        patch2 = (((nx - 0.28)**2 + (ny - 0.45)**2) < (0.025 + noise * 0.012)) | \
                 ((nx >= 0.38) & (nx <= 0.60) & (ny < 0.34 + noise * 0.04)) | \
                 (nx > 0.76 + noise * 0.04)
        apply_color(patch2, 38, 38, 44)
        outline_r, outline_g, outline_b = 35, 35, 42

    elif cat_type == "siamese":
        # シャムねこ: 自然なグラデーションで広がるシールポイント
        apply_color(mask, 248, 240, 226)
        # 顔中心からの距離
        face_dist = np.sqrt(((nx - 0.58) * 1.6)**2 + ((ny - 0.40) * 1.8)**2)
        face_point = (face_dist < 0.28 + noise * 0.04) & (ny >= 0.26) & (ny <= 0.54)
        points = (ny < 0.26) | face_point | (ny > 0.74 + dither) | (nx < 0.20)
        apply_color(points, 56, 38, 28)
        outline_r, outline_g, outline_b = 42, 30, 24

    elif cat_type == "orange":
        # ちゃとら (茶トラ): 自然な毛流れに沿った美しいタビーストライプ
        apply_color(mask, 238, 140, 42)
        tabby_wave = np.sin(nx * 18 + ny * 6 + noise * 3.0)
        stripes = (tabby_wave > 0.35) | ((ny < 0.36) & (np.sin(nx * 25 + noise * 2.0) > 0.40))
        apply_color(stripes, 168, 66, 12)
        belly = (ny > 0.62 + noise * 0.04) & (np.abs(nx - 0.44) < 0.22)
        apply_color(belly, 255, 248, 236)
        socks = (ny > 0.80 + dither)
        apply_color(socks, 255, 248, 236)
        outline_r, outline_g, outline_b = 55, 25, 10

    elif cat_type == "cream":
        # クリームねこ: ふんわりミルクティー色 + 背中キャラメル
        apply_color(mask, 250, 242, 226)
        back = (ny < 0.36 + noise * 0.04) | ((nx > 0.48) & (ny < 0.58 + noise * 0.04))
        apply_color(back, 225, 196, 154)
        belly = (ny > 0.68 + dither)
        apply_color(belly, 255, 252, 248)
        outline_r, outline_g, outline_b = 65, 52, 42

    elif cat_type == "ginger":
        # ジンジャー: 深みのある赤狐レッド + 白いお腹としっぽ先
        apply_color(mask, 215, 68, 28)
        white_parts = ((ny > 0.55 + noise * 0.04) & (np.abs(nx - 0.44) < 0.25)) | \
                      ((ny >= 0.42) & (ny <= 0.60) & (nx >= 0.45) & (nx <= 0.60)) | \
                      (nx < 0.16 + noise * 0.03)
        apply_color(white_parts, 255, 250, 244)
        outline_r, outline_g, outline_b = 50, 18, 12

    elif cat_type == "tuxedo":
        # はちわれ (タキシード): 額の自然なハの字白割れ + タキシード胸元
        apply_color(mask, 34, 38, 48)
        hachi_curve = np.abs(nx - 0.58) * 1.5 + 0.24 + noise * 0.04
        hachiware = (ny >= 0.28) & (ny <= 0.55) & (ny > hachi_curve)
        apply_color(hachiware, 255, 255, 255)
        tuxedo_belly = ((ny > 0.50 + noise * 0.04) & (nx > 0.32) & (nx < 0.68)) | (ny > 0.78 + dither)
        apply_color(tuxedo_belly, 255, 255, 255)
        outline_r, outline_g, outline_b = 20, 22, 30

    elif cat_type == "tortoiseshell":
        # サビねこ (べっ甲): ランダムな琥珀とゴールドが織りなす極上のモザイク
        apply_color(mask, 44, 36, 34)
        amber_patch = (np.sin(nx * 14 + ny * 12 + noise * 4.0) * np.cos(nx * 8 - ny * 14)) > 0.05
        apply_color(amber_patch, 212, 112, 38)
        gold_patch = (np.cos(nx * 16 + ny * 18 - noise * 3.0) * np.sin(nx * 10 - ny * 8)) > 0.12
        apply_color(gold_patch, 228, 180, 68)
        outline_r, outline_g, outline_b = 26, 20, 18

    elif cat_type == "sakura":
        # さくらねこ: ほんのり桜色 + 花びらのようなチェリーピンクグラデーション
        apply_color(mask, 255, 225, 236)
        cherry = (ny < 0.32 + noise * 0.04) | ((nx > 0.52) & (ny < 0.55 + noise * 0.04)) | (nx < 0.16)
        apply_color(cherry, 255, 118, 174)
        belly = (ny > 0.66 + dither) & (np.abs(nx - 0.44) < 0.24)
        apply_color(belly, 255, 250, 252)
        outline_r, outline_g, outline_b = 75, 45, 60

    elif cat_type == "mint":
        # ミントねこ: 爽やかなパステルミント + 優しいリーフ模様
        apply_color(mask, 206, 248, 226)
        leaf = (np.sin(nx * 18 + ny * 8 + noise * 3.0) > 0.28) | (ny < 0.28 + noise * 0.04)
        apply_color(leaf, 58, 182, 132)
        belly = (ny > 0.66 + dither) & (np.abs(nx - 0.44) < 0.22)
        apply_color(belly, 255, 255, 255)
        outline_r, outline_g, outline_b = 30, 65, 50

    elif cat_type == "sky":
        # スカイねこ: 青空スカイブルー + 雲のふんわり白ぶち + マリンブルー
        apply_color(mask, 185, 228, 255)
        clouds = (((nx - 0.42)**2 + (ny - 0.50)**2) < (0.035 + noise * 0.015)) | \
                 (((nx - 0.62)**2 + (ny - 0.58)**2) < (0.022 + noise * 0.01))
        apply_color(clouds, 255, 255, 255)
        blue_points = (ny < 0.28 + noise * 0.03) | (nx < 0.16)
        apply_color(blue_points, 34, 122, 212)
        outline_r, outline_g, outline_b = 25, 55, 90

    elif cat_type == "lavender":
        # パステルラベンダー: 幻想的なライラック + アメジストバイオレット
        apply_color(mask, 232, 210, 252)
        amethyst = (ny < 0.30 + noise * 0.04) | ((nx > 0.62) & (ny < 0.52 + noise * 0.04)) | (nx < 0.16)
        apply_color(amethyst, 142, 72, 224)
        belly = (ny > 0.66 + dither) & (np.abs(nx - 0.44) < 0.22)
        apply_color(belly, 254, 250, 255)
        outline_r, outline_g, outline_b = 58, 32, 85

    elif cat_type == "golden":
        # ゴールドキャット: きらめく黄金イエロー + アンバーの星屑タビー
        apply_color(mask, 255, 216, 80)
        gold_stripes = (np.sin(nx * 18 + ny * 8 + noise * 3.0) > 0.28) | (ny < 0.28 + noise * 0.04)
        apply_color(gold_stripes, 236, 122, 28)
        chest = (ny > 0.50 + noise * 0.03) & (np.abs(nx - 0.46) < 0.22)
        apply_color(chest, 255, 250, 222)
        outline_r, outline_g, outline_b = 68, 42, 10

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
    
    # 4. 目のハイライト・白目の保護（明るい白目を保つ）
    final_r[is_eye_white] = 255
    final_g[is_eye_white] = 255
    final_b[is_eye_white] = 255

    out_arr = np.zeros_like(arr, dtype=np.uint8)
    out_arr[mask, 0] = np.clip(final_r[mask], 0, 255).astype(np.uint8)
    out_arr[mask, 1] = np.clip(final_g[mask], 0, 255).astype(np.uint8)
    out_arr[mask, 2] = np.clip(final_b[mask], 0, 255).astype(np.uint8)
    out_arr[mask, 3] = alpha[mask].astype(np.uint8)
    
    return Image.fromarray(out_arr, mode="RGBA")
