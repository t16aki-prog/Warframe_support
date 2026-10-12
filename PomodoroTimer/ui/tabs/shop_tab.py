import tkinter as tk
import random
import time
import os
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
from ui.utils import FONT_MAIN, FONT_TITLE, FONT_BOLD, FONT_SUB, FONT_TEXT, bind_mousewheel_to_all
from data_manager import AVAILABLE_CATS, AVAILABLE_ITEMS
from scripts.natural_cat_generator import generate_and_save_custom_gacha_sprites

class ShopTab:
    def __init__(self, app):
        self.app = app
        tab = tk.Frame(self.app.content_frame, bg=self.app.theme["bg"])
        self.app.tabs["shop"] = tab
        
        container = tk.Frame(tab, bg=self.app.theme["bg"])
        container.pack(fill='both', expand=True)
        
        self.shop_canvas = tk.Canvas(container, bg=self.app.theme["bg"], highlightthickness=0)
        self.shop_scrollbar = ttk.Scrollbar(container, orient="vertical", command=self.shop_canvas.yview)
        self.shop_inner = tk.Frame(self.shop_canvas, bg=self.app.theme["bg"])
        
        self.shop_inner.bind("<Configure>", lambda e: self.shop_canvas.configure(scrollregion=self.shop_canvas.bbox("all")))
        self.shop_win = self.shop_canvas.create_window((0, 0), window=self.shop_inner, anchor="nw")
        self.shop_canvas.bind("<Configure>", lambda e: self.shop_canvas.itemconfig(self.shop_win, width=e.width))
        
        self.shop_canvas.configure(yscrollcommand=self.shop_scrollbar.set)
        self.shop_canvas.pack(side="left", fill="both", expand=True)
        self.shop_scrollbar.pack(side="right", fill="y")
        
        self.preview_anim_job = None
        bind_mousewheel_to_all(self.shop_inner, self.shop_canvas)

    def refresh_view(self):
        for widget in self.shop_inner.winfo_children():
            widget.destroy()
            
        self.shop_canvas.config(bg=self.app.theme["bg"])
        self.shop_inner.config(bg=self.app.theme["bg"])
        
        cafe_data = self.app.data_mgr.get_cafe_data()
        treats = cafe_data["treats"]
        
        # 1. カフェショップ案内バナー
        banner = tk.Frame(self.shop_inner, bg=self.app.theme["card"], padx=12, pady=10, relief="groove", bd=1)
        banner.pack(fill='x', pady=5, padx=4)
        tk.Label(banner, text="🎁 カフェショップ & 育成", font=FONT_SUB, bg=self.app.theme["card"], fg=self.app.theme["text"]).pack(anchor='w')
        tk.Label(banner, text="ポモドーロを1回完了するごとに おやつ🐟 が1つもらえます！\nおやつを集めて新しい猫や家具をアンロックしよう！", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["sub_text"], justify='left').pack(anchor='w', pady=(2, 6))
        
        starter_btn = tk.Button(
            banner, text="🐾 最初の相棒猫を選び直す (無料)", font=FONT_BOLD,
            bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"], relief="flat", padx=10, pady=4, cursor="hand2",
            command=self.app.open_starter_cat_modal
        )
        starter_btn.pack(anchor='w')
        
        # 2. 🎲 RGB完全ランダム猫ガチャ (100おやつ)
        gacha_card = tk.Frame(self.shop_inner, bg=self.app.theme["header"], padx=12, pady=10, relief="solid", bd=1)
        gacha_card.pack(fill='x', pady=6, padx=4)
        
        g_top = tk.Frame(gacha_card, bg=self.app.theme["header"])
        g_top.pack(fill='x')
        tk.Label(g_top, text="🎲 神秘のRGBミステリー猫ガチャ (🐟 100個)", font=FONT_BOLD, bg=self.app.theme["header"], fg=self.app.theme["text"]).pack(side='left')
        
        can_gacha = (treats >= 100)
        gacha_btn = tk.Button(
            g_top, text="✨ ガチャを引く (🐟 100)", font=FONT_BOLD,
            bg=self.app.theme["work"] if can_gacha else self.app.theme["btn_sec"],
            fg="#ffffff" if can_gacha else self.app.theme["btn_sec_fg"],
            relief="flat", padx=10, pady=3, cursor="hand2" if can_gacha else "arrow",
            command=self.pull_mystery_gacha
        )
        gacha_btn.pack(side='right')
        
        tk.Label(
            gacha_card,
            text="完全ランダムなRGB色相と模様を持つ、世界に1匹だけの特別な猫をプロシージャル生成してお迎えします！",
            font=FONT_TEXT, bg=self.app.theme["header"], fg=self.app.theme["sub_text"], justify='left'
        ).pack(anchor='w', pady=(3, 0))

        # 3. 🐾 猫の一覧 (プレビュー機能付き)
        tk.Label(self.shop_inner, text="🐾 新しい猫を迎える", font=FONT_SUB, bg=self.app.theme["bg"], fg=self.app.theme["text"]).pack(anchor='w', pady=(10, 2), padx=4)
        
        unlocked_cats = cafe_data.get("unlocked_cats", ["black"])
        all_cats = self.app.data_mgr.get_all_available_cats()
        
        for cat in all_cats:
            c_id = cat["id"]
            is_unlocked = c_id in unlocked_cats
            
            card = tk.Frame(self.shop_inner, bg=self.app.theme["card"], padx=10, pady=8, relief="solid", bd=0)
            card.pack(fill='x', pady=3, padx=4)
            
            # 左側: 名前と説明
            left_f = tk.Frame(card, bg=self.app.theme["card"])
            left_f.pack(side='left', fill='x', expand=True)
            
            title_text = cat.get("name", c_id)
            tk.Label(left_f, text=title_text, font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["text"]).pack(side='left')
            tk.Label(left_f, text=f" - {cat.get('desc', '個性豊かな猫')}", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["sub_text"]).pack(side='left', padx=5)
            
            # 右側操作ボタン群
            right_f = tk.Frame(card, bg=self.app.theme["card"])
            right_f.pack(side='right')
            
            # プレビューボタン (迎える前でも後でも常に見れる)
            prev_btn = tk.Button(
                right_f, text="👁️ 見る", font=("Meiryo", 8),
                bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"],
                relief="flat", padx=6, pady=2, cursor="hand2",
                command=lambda cid=c_id, cname=title_text: self.open_cat_preview_modal(cid, cname)
            )
            prev_btn.pack(side='left', padx=(0, 6))
            
            if is_unlocked:
                tk.Label(right_f, text="在籍中 ✨", font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["break"]).pack(side='left')
            else:
                cost = cat.get("cost", 5)
                can_buy = treats >= cost
                btn = tk.Button(
                    right_f, text=f"迎える (🐟 {cost}個)",
                    font=FONT_TEXT, bg=self.app.theme["btn"] if can_buy else self.app.theme["btn_sec"],
                    fg=self.app.theme["btn_fg"] if can_buy else self.app.theme["btn_sec_fg"],
                    relief="flat", padx=8, pady=2, cursor="hand2" if can_buy else "arrow",
                    state="normal" if can_buy else "disabled",
                    command=lambda cid=c_id: self.buy_cat(cid)
                )
                btn.pack(side='left')
                
        # 4. 🛋️ 家具とおもちゃ
        tk.Label(self.shop_inner, text="🛋️ 家具とおもちゃ", font=FONT_SUB, bg=self.app.theme["bg"], fg=self.app.theme["text"]).pack(anchor='w', pady=(14, 2), padx=4)
        
        unlocked_items = cafe_data.get("unlocked_items", ["cushion"])
        for item in AVAILABLE_ITEMS:
            i_id = item["id"]
            is_unlocked = i_id in unlocked_items
            
            card = tk.Frame(self.shop_inner, bg=self.app.theme["card"], padx=10, pady=8, relief="solid", bd=0)
            card.pack(fill='x', pady=3, padx=4)
            
            left_f = tk.Frame(card, bg=self.app.theme["card"])
            left_f.pack(side='left', fill='x', expand=True)
            
            tk.Label(left_f, text=f"{item['icon']} {item['name']}", font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["text"]).pack(side='left')
            tk.Label(left_f, text=f" - {item['desc']}", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["sub_text"]).pack(side='left', padx=5)
            
            if is_unlocked:
                tk.Label(card, text="設置済み ✨", font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["break"]).pack(side='right')
            else:
                can_buy = treats >= item["cost"]
                btn = tk.Button(
                    card, text=f"設置 (🐟 {item['cost']}個)",
                    font=FONT_TEXT, bg=self.app.theme["btn"] if can_buy else self.app.theme["btn_sec"],
                    fg=self.app.theme["btn_fg"] if can_buy else self.app.theme["btn_sec_fg"],
                    relief="flat", padx=8, pady=2, cursor="hand2" if can_buy else "arrow",
                    state="normal" if can_buy else "disabled",
                    command=lambda iid=i_id: self.buy_item(iid)
                )
                btn.pack(side='right')

        bind_mousewheel_to_all(self.shop_inner, self.shop_canvas)

    def buy_cat(self, cat_id):
        success, msg = self.app.data_mgr.unlock_cat(cat_id)
        if success:
            self.app.sound_mgr.play_se("level_up")
            messagebox.showinfo("お迎え成功！", msg)
            self.refresh_view()
            self.app.refresh_cafe_elements()
        else:
            messagebox.showwarning("購入できません", msg)

    def buy_item(self, item_id):
        success, msg = self.app.data_mgr.unlock_item(item_id)
        if success:
            self.app.sound_mgr.play_se("level_up")
            messagebox.showinfo("設置完了！", msg)
            self.refresh_view()
            self.app.refresh_cafe_elements()
        else:
            messagebox.showwarning("購入できません", msg)

    # --- プレビューモーダル (アニメーション確認) ---
    def open_cat_preview_modal(self, cat_id, cat_name):
        modal = tk.Toplevel(self.app.root)
        modal.title(f"🐾 猫プレビュー - {cat_name}")
        modal.geometry("340x360")
        modal.resizable(False, False)
        modal.configure(bg=self.app.theme["bg"])
        modal.transient(self.app.root)
        modal.grab_set()

        tk.Label(modal, text=f"🐾 {cat_name}", font=FONT_TITLE, bg=self.app.theme["bg"], fg=self.app.theme["text"]).pack(pady=(12, 2))
        
        # プレビュー表示用キャンバス (96x96 で見やすく拡大表示)
        pv_canvas = tk.Canvas(modal, width=120, height=120, bg=self.app.theme["card"], highlightthickness=1, highlightbackground=self.app.theme["border"])
        pv_canvas.pack(pady=8)
        
        poses = ["sit_r", "walk_r_0", "walk_r_1", "dash_r_0", "dash_r_1", "groom_r_0", "play_r_0", "stretch_r_0", "sleep_curl_0", "sleep_belly_0"]
        pose_photos = []
        
        # スプライトPNGから高精細に読み込み・拡大
        base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "sprites", cat_id)
        for p_name in poses:
            p_file = os.path.join(base_dir, f"{p_name}.png")
            if os.path.exists(p_file):
                try:
                    p_img = Image.open(p_file).convert("RGBA").resize((96, 96), Image.Resampling.NEAREST)
                    pose_photos.append(ImageTk.PhotoImage(p_img))
                except Exception as e:
                    print(f"Error loading pose {p_name} for {cat_id}: {e}")
        
        # フォールバック: テクスチャ辞書
        if not pose_photos:
            tex_dict = self.app.get_cat_texture(cat_id)
            if tex_dict:
                for p_name in poses:
                    if p_name in tex_dict and hasattr(tex_dict[p_name], 'resize'):
                        resized = tex_dict[p_name].resize((96, 96), Image.Resampling.NEAREST)
                        pose_photos.append(ImageTk.PhotoImage(resized))
        
        if not pose_photos:
            tk.Label(modal, text="プレビュー画像を読み込み中...", font=FONT_TEXT, bg=self.app.theme["bg"], fg=self.app.theme["sub_text"]).pack()
            return
            
        modal.pose_photos = pose_photos  # ガベージコレクション防止
        img_item = pv_canvas.create_image(60, 60, image=pose_photos[0])
        
        pose_idx = [0]
        status_lbl = tk.Label(modal, text=f"ポーズ: {poses[0]}", font=FONT_TEXT, bg=self.app.theme["bg"], fg=self.app.theme["accent"])
        status_lbl.pack(pady=2)

        def update_frame():
            if not modal.winfo_exists():
                return
            pose_idx[0] = (pose_idx[0] + 1) % len(pose_photos)
            pv_canvas.itemconfig(img_item, image=pose_photos[pose_idx[0]])
            cur_p = poses[pose_idx[0]].split("_")[0]
            status_lbl.config(text=f"モーション: {cur_p} ({pose_idx[0]+1}/{len(pose_photos)})")
            modal.after(450, update_frame)

        modal.after(450, update_frame)
        
        close_btn = tk.Button(
            modal, text="とじる", font=FONT_BOLD,
            bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"],
            relief="flat", padx=16, pady=4, cursor="hand2", command=modal.destroy
        )
        close_btn.pack(pady=10)

    # --- 🎲 RGB完全ランダム猫ガチャ ---
    def pull_mystery_gacha(self):
        cafe_data = self.app.data_mgr.get_cafe_data()
        treats = cafe_data["treats"]
        if treats < 100:
            messagebox.showwarning("おやつ不足", f"ミステリーガチャを引くには おやつ🐟 が100個必要です！\n(現在: {treats}個 / あと{100 - treats}個)")
            return

        # 100おやつ消費
        cafe_data["treats"] -= 100
        
        # 完全ランダムRGBパレットと模様の生成
        r = random.randint(40, 255)
        g = random.randint(40, 255)
        b = random.randint(40, 255)
        base_rgb = (r, g, b)
        
        pattern_type = random.choice(["stripes", "spots", "socks", "mask", "calico", "solid"])
        pr = random.randint(20, 240)
        pg = random.randint(20, 240)
        pb = random.randint(20, 240)
        pattern_rgb = (pr, pg, pb)
        
        palette_dict = {
            "base_color": base_rgb,
            "pattern_type": pattern_type,
            "pattern_color": pattern_rgb
        }
        
        custom_id = f"custom_{int(time.time())}_{random.randint(100, 999)}"
        titles = ["ミラクル", "ルミナス", "ギャラクシー", "オーロラ", "ネオン", "コスモ", "ファンタジー", "ジュエル", "コズミック", "ステラ", "プリズム", "オパール"]
        cat_name = f"{random.choice(titles)}ねこ 🎲"
        
        # スプライトを即座にプロシージャル生成
        try:
            generate_and_save_custom_gacha_sprites(custom_id, palette_dict)
        except Exception as e:
            print("Gacha sprite generation error:", e)
            
        cat_info = {
            "id": custom_id,
            "name": cat_name,
            "cost": 0,
            "color_tint": base_rgb,
            "desc": f"RGB({r},{g},{b}) {pattern_type}模様の神秘的な限定猫"
        }
        
        self.app.data_mgr.add_custom_cat(cat_info)
        self.app.sound_mgr.play_se("level_up")
        
        # UIリフレッシュ
        self.refresh_view()
        self.app.refresh_cafe_elements()
        
        # お祝いモーダル
        self.open_gacha_result_modal(cat_info)

    def open_gacha_result_modal(self, cat_info):
        modal = tk.Toplevel(self.app.root)
        modal.title("🎉 ガチャ結果！新しい特別な猫が誕生しました！")
        modal.geometry("360x380")
        modal.resizable(False, False)
        modal.configure(bg=self.app.theme["bg"])
        modal.transient(self.app.root)
        modal.grab_set()

        tk.Label(modal, text="✨ NEW CAT UNLOCKED! ✨", font=FONT_TITLE, bg=self.app.theme["bg"], fg=self.app.theme["accent"]).pack(pady=(15, 2))
        tk.Label(modal, text=f"🐾 {cat_info['name']}", font=FONT_TITLE, bg=self.app.theme["bg"], fg=self.app.theme["text"]).pack(pady=2)
        
        pv_canvas = tk.Canvas(modal, width=120, height=120, bg=self.app.theme["card"], highlightthickness=2, highlightbackground=self.app.theme["accent"])
        pv_canvas.pack(pady=10)
        
        c_id = cat_info["id"]
        p_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "sprites", c_id, "sit_r.png")
        if os.path.exists(p_file):
            try:
                p_img = Image.open(p_file).convert("RGBA").resize((96, 96), Image.Resampling.NEAREST)
                photo = ImageTk.PhotoImage(p_img)
                pv_canvas.create_image(60, 60, image=photo)
                modal.result_photo = photo
            except Exception as e:
                print(f"Error loading preview for {c_id}: {e}")
            
        tk.Label(modal, text=cat_info["desc"], font=FONT_TEXT, bg=self.app.theme["bg"], fg=self.app.theme["sub_text"]).pack(pady=4)
        tk.Label(modal, text="カフェに新しい猫が合流しました！🐾", font=FONT_BOLD, bg=self.app.theme["bg"], fg=self.app.theme["work"]).pack(pady=4)
        
        tk.Button(
            modal, text="カフェへ行く 🐾", font=FONT_BOLD,
            bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"],
            relief="flat", padx=16, pady=5, cursor="hand2",
            command=lambda: [modal.destroy(), self.app.show_tab("cafe")]
        ).pack(pady=10)

