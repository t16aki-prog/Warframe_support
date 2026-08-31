import sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

base_dir = r"e:\Oasobi\PomodoroTimer"
sprites_dir = os.path.join(base_dir, "sprites")
os.makedirs(sprites_dir, exist_ok=True)

# 1. 完璧なプロポーションのベースポーズ（48x48〜64x64内に見切れゼロで収まるピクセルアート）
# 原寸450x450を余裕あるマージン（360x360相当）で縮小配置

def create_flawless_base_poses():
    """見切れ・歪みゼロの美しいベースポーズ画像を生成"""
    awake_path = os.path.join(base_dir, "assets", "base_sprites", "cat_awake.png")
    sleep_path = os.path.join(base_dir, "assets", "base_sprites", "cat_sleep.png")
    groom_path = os.path.join(base_dir, "assets", "base_sprites", "cat_groom.png")
    stretch_path = os.path.join(base_dir, "assets", "base_sprites", "cat_stretch.png")
    play_path = os.path.join(base_dir, "assets", "base_sprites", "cat_play.png")
    
    img_aw = Image.open(awake_path).convert("RGBA")
    img_sl = Image.open(sleep_path).convert("RGBA")
    img_gr = Image.open(groom_path).convert("RGBA") if os.path.exists(groom_path) else img_aw
    img_st = Image.open(stretch_path).convert("RGBA") if os.path.exists(stretch_path) else img_aw
    img_pl = Image.open(play_path).convert("RGBA") if os.path.exists(play_path) else img_aw
    
    # 余裕を持ったキャンバスサイズ 450x450（中身は 320x320 程度に収めて絶対に見切れないようにする）
    CANVAS_SIZE = (450, 450)
    
    def fit_centered(img, scale=0.72, offset_y=0, offset_x=0):
        w, h = img.size
        # 余白トリミング
        bbox = img.getbbox()
        if bbox:
            cropped = img.crop(bbox)
        else:
            cropped = img
        cw, ch = cropped.size
        target_w = int(CANVAS_SIZE[0] * scale)
        target_h = int(target_w * (ch / cw)) if cw > ch else int(CANVAS_SIZE[1] * scale)
        if target_h > int(CANVAS_SIZE[1] * scale):
            target_h = int(CANVAS_SIZE[1] * scale)
            target_w = int(target_h * (cw / ch))
            
        resized = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        canvas = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
        px = (CANVAS_SIZE[0] - target_w) // 2 + offset_x
        py = (CANVAS_SIZE[1] - target_h) // 2 + offset_y
        canvas.paste(resized, (px, py), resized)
        return canvas

    bases = {}
    
    # A. 立ち・座り (awake / sit)
    bases["awake"] = fit_centered(img_aw, scale=0.72, offset_y=10)
    
    # B. 丸まり寝 (sleep_curl)
    bases["sleep"] = fit_centered(img_sl, scale=0.72, offset_y=10)
    
    # C. 歩行 0 & 1 (walk_0, walk_1) - 軽やかな足運び、見切れなし
    w0_rot = img_aw.rotate(3, resample=Image.Resampling.BICUBIC, center=(225, 380))
    bases["walk_0"] = fit_centered(w0_rot, scale=0.72, offset_y=6)
    
    w1_rot = img_aw.rotate(-3, resample=Image.Resampling.BICUBIC, center=(225, 380))
    bases["walk_1"] = fit_centered(w1_rot, scale=0.72, offset_y=12)
    
    # D. ダッシュ (dash) - 前傾姿勢、安全マージン内
    d_rot = img_aw.rotate(-6, resample=Image.Resampling.BICUBIC, center=(225, 380))
    bases["dash"] = fit_centered(d_rot, scale=0.70, offset_y=15, offset_x=5)
    
    # E. 毛づくろい (groom) - 新規ベース画像を使用
    bases["groom"] = fit_centered(img_gr, scale=0.65, offset_y=12)
    
    # F. 伸び (stretch) - 新規ベース画像を使用
    bases["stretch"] = fit_centered(img_st, scale=0.60, offset_y=16)
    
    # G. じゃれる (play) - 新規ベース画像を使用
    bases["play"] = fit_centered(img_pl, scale=0.65, offset_y=-5)
    
    # H. 飛びつき (pounce) - playを傾けて表現
    po_base = img_pl.rotate(-15, resample=Image.Resampling.BICUBIC, center=(225, 225))
    bases["pounce"] = fit_centered(po_base, scale=0.62, offset_y=-2)
    
    # I. 仰向けヘソ天寝 (sleep_belly) - お腹を上にして手足ポテッ
    sb_base = img_sl.transpose(Image.FLIP_TOP_BOTTOM).rotate(-6, resample=Image.Resampling.BICUBIC, center=(225, 225))
    bases["sleep_belly"] = fit_centered(sb_base, scale=0.70, offset_y=10)
    
    # J. のびのび寝 (sleep_stretch) - 横長に伸びて寝る
    ss_base = img_sl.resize((int(img_sl.width * 1.15), int(img_sl.height * 0.85)), Image.Resampling.LANCZOS)
    bases["sleep_stretch"] = fit_centered(ss_base, scale=0.72, offset_y=10)
    
    # ベース画像をPNGとして保存
    for k, img in bases.items():
        if k in ["walk_0", "walk_1", "dash", "groom", "stretch", "play", "pounce", "sleep_belly", "sleep_stretch"]:
            img.save(os.path.join(base_dir, f"cat_{k}.png"))
            
    return bases

def render_genetically_accurate_cat(rgba_img, cat_type):
    """
    猫学・遺伝学的特徴に厳格に基づいた本物の毛柄・毛並みレンダリング
    """
    arr = np.array(rgba_img.convert("RGBA"), dtype=np.float32)
    alpha = arr[:, :, 3]
    mask = alpha > 30
    
    if not np.any(mask):
        return rgba_img.copy()
        
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    orig_brightness = (0.299 * r + 0.587 * g + 0.114 * b)
    
    # 輪郭線 (AI生成画像はアンチエイリアスで少し明るい場合があるため閾値を60に緩和)
    is_outline = mask & (orig_brightness < 60)
    # 耳の内側 (厳密に赤みが強い部分だけを抽出)
    is_inner_ear = mask & (r > 70) & (r > g + 20) & (r > b - 5)
    # 目のハイライト (オリジナル画像には存在しないため、全体が白飛びするのを防ぐべく無効化)
    is_eye_white = np.zeros_like(mask)
    # ボディ
    is_body = mask & ~is_outline & ~is_inner_ear
    
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
    
    # 立体陰影
    body_brights = orig_brightness[is_body]
    avg_b = np.mean(body_brights) if len(body_brights) > 0 else 45.0
    shade = np.ones_like(orig_brightness)
    shade[mask] = np.clip((orig_brightness[mask] - avg_b) * 0.008 + 1.0, 0.80, 1.22)
    
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
        # ベルベットのようなつややかな黒 + 胸元に小さなエンジェルマーク
        apply_color(mask, 32, 32, 38)
        angel_mark = (ny >= 0.46) & (ny <= 0.58) & (np.abs(nx - 0.48) < 0.06 + fur_grain * 0.02)
        apply_color(angel_mark, 245, 245, 250)
        outline_r, outline_g, outline_b = 12, 12, 16
        
    elif cat_type == "white":
        # 2. 純白猫 (Solid White): 遺伝子 W (優性白)
        # ふんわりシルキーな純白 + 柔らかなピンク耳
        apply_color(mask, 253, 253, 255)
        outline_r, outline_g, outline_b = 85, 88, 100
        ear_r, ear_g, ear_b = 255, 180, 200
        
    elif cat_type == "gray":
        # 3. ロシアンブルー (Russian Blue): 遺伝子 a/a, B/B, d/d (ブラックのダイリュート/希釈)
        # ビロードのようなシルバーブルー + 白ソックス
        apply_color(mask, 132, 142, 160)
        back = (nx > 0.60) | (ny < 0.28)
        apply_color(back, 110, 118, 135)
        socks = (ny > 0.78 + dither)
        apply_color(socks, 248, 248, 252)
        outline_r, outline_g, outline_b = 40, 45, 55
        
    elif cat_type == "orange":
        # 4. 茶トラ (Red Mackerel Tabby): 遺伝子 O (オレンジ), A/- (アグーチ), Mc/- (マッカレルタビー)
        # 額のM字、マッカレル縞模様、ホワイトマズル・胸元・腹部
        apply_color(mask, 240, 138, 36)
        # 背骨の縦線 & 垂直な肋骨ストライプ
        tabby_stripes = (np.sin(nx * 22 + ny * 8 + fur_grain * 3.0) > 0.25) | \
                        ((ny < 0.32) & (np.sin(nx * 32) > 0.30)) # 額のM字
        apply_color(tabby_stripes, 162, 56, 8)
        # ホワイトマズル & お腹 & ソックス (Kit白斑)
        white_under = ((ny > 0.58 + fur_grain * 0.03) & (np.abs(nx - 0.44) < 0.26)) | (ny > 0.78 + dither)
        apply_color(white_under, 255, 248, 238)
        outline_r, outline_g, outline_b = 48, 18, 6
        
    elif cat_type == "calico":
        # 5. 三毛猫 (Calico): 遺伝子 O/o (ヘテロ接合), S/- (高比率白斑)
        # 白地70%の上に、独立した鮮やかなオレンジ茶トラ斑点と漆黒斑点
        apply_color(mask, 252, 252, 254)
        # 茶トラパッチ (縞模様入り)
        patch_orange = (((nx - 0.44)**2 + (ny - 0.48)**2) < (0.032 + fur_grain * 0.015)) | \
                       ((nx > 0.60) & (ny < 0.36 + fur_grain * 0.04))
        apply_color(patch_orange, 235, 120, 38)
        # 漆黒パッチ
        patch_black = (((nx - 0.26)**2 + (ny - 0.46)**2) < (0.026 + fur_grain * 0.012)) | \
                      ((nx >= 0.38) & (nx <= 0.56) & (ny < 0.32 + fur_grain * 0.04))
        apply_color(patch_black, 34, 34, 40)
        outline_r, outline_g, outline_b = 30, 30, 36
        
    elif cat_type == "tortoiseshell":
        # 6. サビ猫 (Tortoiseshell): 遺伝子 O/o, s/s (白斑なし)
        # 全身に黒とオレンジ・ゴールドが細密に混ざり合うべっ甲模様
        apply_color(mask, 38, 32, 30)
        amber_mosaic = (np.sin(nx * 15 + ny * 12 + fur_grain * 4.0) * np.cos(nx * 8 - ny * 14)) > 0.02
        apply_color(amber_mosaic, 216, 108, 32)
        gold_flecks = (np.cos(nx * 18 + ny * 16 - fur_grain * 3.0) * np.sin(nx * 10 - ny * 8)) > 0.08
        apply_color(gold_flecks, 234, 185, 62)
        outline_r, outline_g, outline_b = 20, 16, 14
        
    elif cat_type == "siamese":
        # 7. シャム (Seal Point Siamese): 遺伝子 cs/cs (温度感受性チロシナーゼ)
        # 体幹はフォーンベージュ、末端部（顔・耳・足先・尾）が滑らかなシールブラウン
        apply_color(mask, 248, 238, 224)
        face_dist = np.sqrt(((nx - 0.58) * 1.5)**2 + ((ny - 0.38) * 1.8)**2)
        face_mask = (face_dist < 0.26 + fur_grain * 0.03) & (ny >= 0.24) & (ny <= 0.54)
        seal_points = (ny < 0.25) | face_mask | (ny > 0.74 + dither) | (nx < 0.18)
        apply_color(seal_points, 52, 34, 24)
        outline_r, outline_g, outline_b = 36, 24, 18
        
    elif cat_type == "tuxedo":
        # 8. ハチワレ / タキシード (Tuxedo Bicolor): 遺伝子 a/a, S/- (中比率白斑)
        # 額の逆V字ハチワレマスク + 白い胸当て + 白ソックス
        apply_color(mask, 28, 32, 42)
        hachi_curve = np.abs(nx - 0.58) * 1.4 + 0.24 + fur_grain * 0.03
        hachiware = (ny >= 0.25) & (ny <= 0.55) & (ny > hachi_curve)
        apply_color(hachiware, 255, 255, 255)
        chest_socks = ((ny > 0.46 + fur_grain * 0.03) & (nx > 0.30) & (nx < 0.68)) | (ny > 0.76 + dither)
        apply_color(chest_socks, 255, 255, 255)
        outline_r, outline_g, outline_b = 15, 18, 24
        
    elif cat_type == "cream":
        # 9. クリーム (Cream Dilute): 遺伝子 e/e, d/d
        # まろやかなミルクティーベージュ + ホワイトチェスト
        apply_color(mask, 250, 242, 226)
        back = (ny < 0.36 + fur_grain * 0.03) | ((nx > 0.48) & (ny < 0.58 + fur_grain * 0.03))
        apply_color(back, 222, 192, 146)
        belly = (ny > 0.68 + dither)
        apply_color(belly, 255, 252, 248)
        outline_r, outline_g, outline_b = 58, 46, 36
        
    elif cat_type == "ginger":
        # 10. ジンジャー (Deep Ginger Red)
        # 鮮烈な赤狐レッド + ホワイトマズルとしっぽ先
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


def build_flawless_sprites_suite():
    """全15猫種 × 全ポーズの完全無欠スプライト（600ファイル）を一括生成"""
    from data_manager import AVAILABLE_CATS
    
    base_dict = create_flawless_base_poses()
    print("Base poses created without clipping!")
    
    # スプライト出力サイズ: 48x48
    SPRITE_SZ = (48, 48)
    
    total = 0
    for cat_info in AVAILABLE_CATS:
        c_id = cat_info["id"]
        cat_dir = os.path.join(sprites_dir, c_id)
        os.makedirs(cat_dir, exist_ok=True)
        
        # 1. 立ち・座り
        tex_sit = render_genetically_accurate_cat(base_dict["awake"], c_id).resize(SPRITE_SZ, Image.Resampling.LANCZOS)
        sit_r = tex_sit.transpose(Image.FLIP_LEFT_RIGHT)
        sit_l = tex_sit
        sit_r.save(os.path.join(cat_dir, f"sit_r.png"))
        sit_l.save(os.path.join(cat_dir, f"sit_l.png"))
        sit_r.save(os.path.join(cat_dir, f"awake_r.png"))
        sit_l.save(os.path.join(cat_dir, f"awake_l.png"))
        total += 4
        
        # 2. 歩行 0 & 1
        tex_w0 = render_genetically_accurate_cat(base_dict["walk_0"], c_id).resize(SPRITE_SZ, Image.Resampling.LANCZOS)
        tex_w1 = render_genetically_accurate_cat(base_dict["walk_1"], c_id).resize(SPRITE_SZ, Image.Resampling.LANCZOS)
        tex_w0.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(cat_dir, f"walk_r_0.png"))
        tex_w1.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(cat_dir, f"walk_r_1.png"))
        tex_w0.save(os.path.join(cat_dir, f"walk_l_0.png"))
        tex_w1.save(os.path.join(cat_dir, f"walk_l_1.png"))
        total += 4
        
        # 3. ダッシュ
        tex_dash = render_genetically_accurate_cat(base_dict["dash"], c_id).resize(SPRITE_SZ, Image.Resampling.LANCZOS)
        d_f0 = tex_dash
        d_f1 = tex_dash.rotate(-3, resample=Image.Resampling.BICUBIC, center=(24, 24))
        d_f0.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(cat_dir, f"dash_r_0.png"))
        d_f1.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(cat_dir, f"dash_r_1.png"))
        d_f0.save(os.path.join(cat_dir, f"dash_l_0.png"))
        d_f1.save(os.path.join(cat_dir, f"dash_l_1.png"))
        total += 4
        
        # 4. 毛づくろい (3フレーム)
        tex_gr = render_genetically_accurate_cat(base_dict["groom"], c_id).resize(SPRITE_SZ, Image.Resampling.LANCZOS)
        gr_0 = tex_gr
        gr_1 = tex_gr.rotate(-6, resample=Image.Resampling.BICUBIC, center=(24, 24))
        gr_2 = tex_gr.rotate(4, resample=Image.Resampling.BICUBIC, center=(24, 24))
        for idx, gr_f in enumerate([gr_0, gr_1, gr_2]):
            gr_f.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(cat_dir, f"groom_r_{idx}.png"))
            gr_f.save(os.path.join(cat_dir, f"groom_l_{idx}.png"))
            total += 2
            
        # 5. 伸び (2フレーム)
        tex_st = render_genetically_accurate_cat(base_dict["stretch"], c_id).resize(SPRITE_SZ, Image.Resampling.LANCZOS)
        st_0 = tex_st
        st_1 = tex_st.rotate(-2, resample=Image.Resampling.BICUBIC, center=(24, 24))
        st_0.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(cat_dir, f"stretch_r_0.png"))
        st_1.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(cat_dir, f"stretch_r_1.png"))
        st_0.save(os.path.join(cat_dir, f"stretch_l_0.png"))
        st_1.save(os.path.join(cat_dir, f"stretch_l_1.png"))
        total += 4
        
        # 6. じゃれる (3フレーム)
        tex_pl = render_genetically_accurate_cat(base_dict["play"], c_id).resize(SPRITE_SZ, Image.Resampling.LANCZOS)
        pl_0 = tex_pl
        pl_1 = tex_pl.rotate(5, resample=Image.Resampling.BICUBIC, center=(24, 24))
        pl_2 = tex_pl.rotate(9, resample=Image.Resampling.BICUBIC, center=(24, 24))
        for idx, pl_f in enumerate([pl_0, pl_1, pl_2]):
            pl_f.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(cat_dir, f"play_r_{idx}.png"))
            pl_f.save(os.path.join(cat_dir, f"play_l_{idx}.png"))
            total += 2
            
        # 7. 飛びつき (2フレーム)
        tex_po = render_genetically_accurate_cat(base_dict["pounce"], c_id).resize(SPRITE_SZ, Image.Resampling.LANCZOS)
        po_0 = tex_po
        po_1 = tex_po.rotate(-4, resample=Image.Resampling.BICUBIC, center=(24, 24))
        po_0.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(cat_dir, f"pounce_r_0.png"))
        po_1.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(cat_dir, f"pounce_r_1.png"))
        po_0.save(os.path.join(cat_dir, f"pounce_l_0.png"))
        po_1.save(os.path.join(cat_dir, f"pounce_l_1.png"))
        total += 4
        
        # 8. 丸まり寝
        tex_sl = render_genetically_accurate_cat(base_dict["sleep"], c_id).resize(SPRITE_SZ, Image.Resampling.LANCZOS)
        sl_0 = tex_sl
        sl_1 = Image.new("RGBA", SPRITE_SZ, (0, 0, 0, 0))
        sl_1.paste(tex_sl.resize((48, 44), Image.Resampling.LANCZOS), (0, 4))
        sl_0.save(os.path.join(cat_dir, f"sleep_curl_0.png"))
        sl_1.save(os.path.join(cat_dir, f"sleep_curl_1.png"))
        sl_0.save(os.path.join(cat_dir, f"sleep_0.png"))
        sl_1.save(os.path.join(cat_dir, f"sleep_1.png"))
        total += 4
        
        # 9. 仰向けヘソ天寝
        tex_sb = render_genetically_accurate_cat(base_dict["sleep_belly"], c_id).resize(SPRITE_SZ, Image.Resampling.LANCZOS)
        sb_0 = tex_sb
        sb_1 = Image.new("RGBA", SPRITE_SZ, (0, 0, 0, 0))
        sb_1.paste(tex_sb.resize((48, 45), Image.Resampling.LANCZOS), (0, 3))
        sb_0.save(os.path.join(cat_dir, f"sleep_belly_0.png"))
        sb_1.save(os.path.join(cat_dir, f"sleep_belly_1.png"))
        total += 2
        
        # 10. のびのび寝
        tex_ss = render_genetically_accurate_cat(base_dict["sleep_stretch"], c_id).resize(SPRITE_SZ, Image.Resampling.LANCZOS)
        ss_0 = tex_ss
        ss_1 = Image.new("RGBA", SPRITE_SZ, (0, 0, 0, 0))
        ss_1.paste(tex_ss.resize((48, 45), Image.Resampling.LANCZOS), (0, 3))
        ss_0.save(os.path.join(cat_dir, f"sleep_stretch_0.png"))
        ss_1.save(os.path.join(cat_dir, f"sleep_stretch_1.png"))
        total += 2
        
    print(f"Generated {total} flawless, genetically accurate cat sprites in {sprites_dir}!")

if __name__ == "__main__":
    build_flawless_sprites_suite()
