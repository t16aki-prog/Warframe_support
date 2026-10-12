import tkinter as tk
import random
import os
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
from ui.utils import FONT_MAIN, FONT_BOLD, FONT_SUB, FONT_TEXT, AVATAR_ICONS

class CafeTab:
    def __init__(self, app):
        self.app = app
        self.furniture_photos = {}
        self.is_edit_mode = False
        self.dragged_canvas_id = None
        self.dragged_item_key = None
        self._load_furniture_sprites()
        self._build_cafe_tab()

    def _load_furniture_sprites(self):
        base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "assets", "furniture_sprites")
        items = ["cushion", "toy_mouse", "scratcher", "treat_bowl", "cat_tree"]
        for item_id in items:
            p = os.path.join(base_dir, f"{item_id}.png")
            if os.path.exists(p):
                try:
                    img = Image.open(p).convert("RGBA")
                    self.furniture_photos[item_id] = ImageTk.PhotoImage(img)
                except Exception as e:
                    print(f"Failed to load furniture sprite {item_id}:", e)

    def _build_cafe_tab(self):
        tab = tk.Frame(self.app.content_frame, bg=self.app.theme["bg"])
        self.app.tabs["cafe"] = tab
        
        self.canvas_w = 480
        self.canvas_h = 270
        self.app.cat_canvas = tk.Canvas(tab, width=self.canvas_w, height=self.canvas_h, bg=self.app.theme["bg"], highlightthickness=0, cursor="hand2")
        self.app.cat_canvas.pack(pady=(0, 5))
        
        # キャンバスのイベントバインド（クリック・ドラッグ＆ドロップ）
        self.app.cat_canvas.bind("<Button-1>", self.on_canvas_press)
        self.app.cat_canvas.bind("<B1-Motion>", self.on_canvas_motion)
        self.app.cat_canvas.bind("<ButtonRelease-1>", self.on_canvas_release)
        
        if self.app.has_images:
            self.app.cat_canvas.create_image(self.canvas_w/2, self.canvas_h/2, image=self.app.bg_photo)
            
        self.app.cats = []
        self.spawn_cats_and_items()
        
        # インフォメーションカード (セット数 & 本日進捗)
        self.app.info_card = tk.Frame(tab, bg=self.app.theme["card"], padx=12, pady=5, relief="flat")
        self.app.info_card.pack(fill='x', padx=10, pady=(2, 4))
        
        self.app.cycle_label = tk.Label(self.app.info_card, text="セット 1/4 🐾 ⚪ ⚪ ⚪", font=FONT_SUB, fg=self.app.theme["text"], bg=self.app.theme["card"])
        self.app.cycle_label.pack(side='left')
        
        prof = self.app.data_mgr.get_profile()
        done_pomo = self.app.data_mgr.get_cafe_data()['total_pomodoros']
        self.app.total_pomo_label = tk.Label(self.app.info_card, text=f"本日: {done_pomo}/{prof['daily_goal']} 🍅", font=FONT_SUB, fg=self.app.theme["work"], bg=self.app.theme["card"])
        self.app.total_pomo_label.pack(side='right')
        
        # 作業中タスクバナー
        self.app.active_task_banner = tk.Label(tab, text="作業中: 今日のタスクを計画する 📝", font=FONT_BOLD, fg=self.app.theme["text"], bg=self.app.theme["card"], padx=10, pady=4, relief="flat")
        self.app.active_task_banner.pack(fill='x', padx=10, pady=(0, 4))
        
        self.app.status_label = tk.Label(tab, text="おしごと (停止中)", font=FONT_SUB, fg=self.app.theme["work"], bg=self.app.theme["bg"])
        self.app.status_label.pack(pady=(2, 0))
        
        self.app.timer_label = tk.Label(tab, text=self.app.format_time(self.app.timer.time_left), font=FONT_MAIN, fg=self.app.theme["work"], bg=self.app.theme["bg"])
        self.app.timer_label.pack(pady=(0, 0))
        
        self.app.btn_frame = tk.Frame(tab, bg=self.app.theme["bg"])
        self.app.btn_frame.pack(pady=6)
        
        self.app.start_btn = tk.Button(self.app.btn_frame, text="▶ 開始", command=self.app.toggle_timer, bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"], font=FONT_SUB, relief="flat", padx=16, pady=5, cursor="hand2")
        self.app.start_btn.pack(side="left", padx=3)
        
        self.app.feed_btn = tk.Button(self.app.btn_frame, text="🐟 おやつ", command=self.feed_active_cat, bg=self.app.theme["card"], fg=self.app.theme["accent"], font=FONT_SUB, relief="flat", padx=12, pady=5, cursor="hand2")
        self.app.feed_btn.pack(side="left", padx=3)
        
        self.app.layout_edit_btn = tk.Button(self.app.btn_frame, text="🛠️ もようがえ", command=self.toggle_layout_edit_mode, bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"], font=FONT_SUB, relief="flat", padx=12, pady=5, cursor="hand2")
        self.app.layout_edit_btn.pack(side="left", padx=3)
        
        self.app.reset_btn = tk.Button(self.app.btn_frame, text="↺ リセット", command=self.app.reset_timer, bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"], font=FONT_SUB, relief="flat", padx=12, pady=5, cursor="hand2")
        self.app.reset_btn.pack(side="left", padx=3)

    def on_canvas_press(self, event):
        if not self.is_edit_mode:
            self.on_canvas_click(event)
            return
            
        items = self.app.cat_canvas.find_overlapping(event.x-18, event.y-18, event.x+18, event.y+18)
        for itm in reversed(items):
            tags = self.app.cat_canvas.gettags(itm)
            if "item" in tags:
                for t in tags:
                    if t.startswith("item_") and t != "item":
                        self.dragged_item_key = t.replace("item_", "")
                        self.dragged_canvas_id = itm
                        return

    def on_canvas_motion(self, event):
        if self.is_edit_mode and hasattr(self, 'dragged_canvas_id') and self.dragged_canvas_id:
            nx = max(30, min(450, event.x))
            ny = max(70, min(245, event.y))
            self.app.cat_canvas.coords(self.dragged_canvas_id, nx, ny)

    def on_canvas_release(self, event):
        if self.is_edit_mode and hasattr(self, 'dragged_item_key') and self.dragged_item_key:
            nx = max(30, min(450, event.x))
            ny = max(70, min(245, event.y))
            self.app.data_mgr.set_item_position(self.dragged_item_key, nx, ny)
            self.dragged_canvas_id = None
            self.dragged_item_key = None

    def toggle_layout_edit_mode(self):
        self.is_edit_mode = not self.is_edit_mode
        if self.is_edit_mode:
            self.app.layout_edit_btn.config(text="💾 完了", bg=self.app.theme["work"], fg="#ffffff")
            self.app.active_task_banner.config(text="🛠️ もようがえ中: 家具をドラッグして好きな場所に移動できます（完了で保存）")
        else:
            self.app.layout_edit_btn.config(text="🛠️ もようがえ", bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"])
            self.refresh_cafe_elements()

    def feed_active_cat(self):
        """相棒猫またはカフェの猫におやつをあげる"""
        avatar = self.app.data_mgr.get_profile().get("avatar", "black")
        ok, msg = self.app.data_mgr.feed_cat_treat(avatar)
        if ok:
            self.app.sound_mgr.play_se("level_up")
            messagebox.showinfo("🐟 おやつタイム", msg)
            self.refresh_cafe_elements()
            if self.app.cats:
                cat = self.app.cats[0]
                heart_id = self.app.cat_canvas.create_text(cat["x"], cat["y"] - 25, text="💖 ごちそうさまニャ！", font=("Meiryo", 11, "bold"), fill=self.app.theme["work"])
                self.app.floating_effects.append({"id": heart_id, "x": cat["x"], "y": cat["y"] - 25, "life": 30})
        else:
            messagebox.showwarning("🐟 おやつ", msg)

    def spawn_cats_and_items(self):
        """家具と猫の初期スポーン。専用スプライトと保存済み座標を適用"""
        self.app.cat_canvas.delete("cat")
        self.app.cat_canvas.delete("item")
        self.app.cats.clear()
        
        if not self.app.has_images:
            self.app.cat_canvas.create_text(self.canvas_w/2, self.canvas_h/2, text="(=^・^=)", font=("Meiryo", 20), fill=self.app.theme["accent"], tags="cat")
            return
            
        unlocked_items = self.app.data_mgr.get_cafe_data().get("unlocked_items", ["cushion"])
        item_positions = self.app.data_mgr.get_item_positions()
        
        for item_id in unlocked_items:
            pos = item_positions.get(item_id, [200, 200])
            x, y = pos[0], pos[1]
            photo = self.furniture_photos.get(item_id)
            if photo:
                self.app.cat_canvas.create_image(x, y, image=photo, tags=("item", f"item_{item_id}"))
            else:
                emoji_map = {"cushion": "🛋️", "toy_mouse": "🐭", "scratcher": "🪵", "treat_bowl": "🥣", "cat_tree": "🏰"}
                self.app.cat_canvas.create_text(x, y, text=emoji_map.get(item_id, "🛋️"), font=("Segoe UI Emoji", 22), tags=("item", f"item_{item_id}"))
                
        # 同一柄の猫は1匹のみ (重複排除)
        raw_unlocked = self.app.data_mgr.get_cafe_data().get("unlocked_cats", ["black"])
        unlocked_cats = list(dict.fromkeys(raw_unlocked))
        
        # 床面の自然なスポーン位置候補 (重なり防止グリッド)
        spawn_slots = [
            (115, 185), (200, 175), (285, 180), (355, 195),
            (145, 215), (250, 215), (320, 220), (85, 155),
            (180, 145), (265, 145), (340, 155), (410, 215)
        ]
        random.shuffle(spawn_slots)
        
        sleep_pose_types = ["sleep_curl", "sleep_belly", "sleep_stretch"]
        is_sleep_time = not self.app.timer.is_running or self.app.timer.session_mode != "work"
        
        for idx, cat_id in enumerate(unlocked_cats):
            tex_dict = self.app.get_cat_texture(cat_id)
            if not tex_dict:
                continue
                
            if idx < len(spawn_slots):
                x, y = spawn_slots[idx]
            else:
                x = random.randint(70, 410)
                y = random.randint(145, 225)
                
            sp_type = random.choice(sleep_pose_types)
            facing = random.choice(["r", "l"])
            
            if is_sleep_time:
                initial_state = "sleep"
                initial_img = tex_dict.get(f"{sp_type}_0", list(tex_dict.values())[0])
                dx, dy = 0, 0
            else:
                initial_state = random.choice(["walk", "dash", "groom", "play", "sit"])
                if initial_state == "walk":
                    dx = random.choice([-1.5, 1.5])
                    dy = random.choice([-0.5, 0.5])
                    initial_img = tex_dict.get(f"walk_{facing}_0")
                elif initial_state == "dash":
                    dx = random.choice([-3.0, 3.0])
                    dy = random.choice([-1.0, 1.0])
                    initial_img = tex_dict.get(f"dash_{facing}_0")
                elif initial_state == "groom":
                    dx, dy = 0, 0
                    initial_img = tex_dict.get(f"groom_{facing}_0")
                elif initial_state == "play":
                    dx, dy = 0, 0
                    initial_img = tex_dict.get(f"play_{facing}_0")
                else:
                    dx, dy = 0, 0
                    initial_img = tex_dict.get(f"sit_{facing}")
                
            if not initial_img:
                initial_img = list(tex_dict.values())[0]

            canvas_id = self.app.cat_canvas.create_image(x, y, image=initial_img, tags="cat")
            self.app.cats.append({
                "type": cat_id,
                "id": canvas_id,
                "x": x,
                "y": y,
                "state": initial_state,
                "sleep_pose": sp_type,
                "state_timer": random.randint(50, 70),
                "dx": dx,
                "dy": dy,
                "facing": facing
            })

    def update_cat_sleep_mode(self, is_sleep):
        """タイマーの開始・停止に合わせて、既存の猫たちの状態（睡眠/活動）をその場で切り替える"""
        for cat in self.app.cats:
            if is_sleep:
                cat["state"] = "sleep"
                cat["dx"] = 0
                cat["dy"] = 0
                if "sleep_pose" not in cat:
                    cat["sleep_pose"] = random.choice(["sleep_curl", "sleep_belly", "sleep_stretch"])
            else:
                if cat.get("state") == "sleep":
                    cat["state"] = random.choice(["sit", "walk"])
                    cat["state_timer"] = random.randint(40, 60)
                    if cat["state"] == "walk":
                        cat["dx"] = random.choice([-1.5, 1.5])
                        cat["dy"] = random.choice([-0.5, 0.5])
                        cat["facing"] = "r" if cat["dx"] > 0 else "l"
                    else:
                        cat["dx"] = 0
                        cat["dy"] = 0

    def sync_unlocked_entities(self):
        """ショップで新しい猫や家具が購入された際に同期"""
        raw_unlocked = self.app.data_mgr.get_cafe_data().get("unlocked_cats", ["black"])
        unlocked_cats = list(dict.fromkeys(raw_unlocked))
        existing_types = {c["type"] for c in self.app.cats}
        
        for cat_id in unlocked_cats:
            if cat_id not in existing_types:
                tex_dict = self.app.get_cat_texture(cat_id)
                if not tex_dict:
                    continue
                x = random.randint(90, 390)
                y = random.randint(150, 220)
                facing = random.choice(["r", "l"])
                sp_type = random.choice(["sleep_curl", "sleep_belly", "sleep_stretch"])
                is_sleep_time = not self.app.timer.is_running or self.app.timer.session_mode != "work"
                
                if is_sleep_time:
                    state = "sleep"
                    img = tex_dict.get(f"{sp_type}_0", list(tex_dict.values())[0])
                    dx, dy = 0, 0
                else:
                    state = "sit"
                    img = tex_dict.get(f"sit_{facing}", list(tex_dict.values())[0])
                    dx, dy = 0, 0
                    
                canvas_id = self.app.cat_canvas.create_image(x, y, image=img, tags="cat")
                self.app.cats.append({
                    "type": cat_id,
                    "id": canvas_id,
                    "x": x,
                    "y": y,
                    "state": state,
                    "sleep_pose": sp_type,
                    "state_timer": random.randint(50, 70),
                    "dx": dx,
                    "dy": dy,
                    "facing": facing
                })
                
        # 家具の再描画 (専用スプライト)
        self.app.cat_canvas.delete("item")
        unlocked_items = self.app.data_mgr.get_cafe_data().get("unlocked_items", ["cushion"])
        item_positions = self.app.data_mgr.get_item_positions()
        
        for item_id in unlocked_items:
            pos = item_positions.get(item_id, [200, 200])
            x, y = pos[0], pos[1]
            photo = self.furniture_photos.get(item_id)
            if photo:
                self.app.cat_canvas.create_image(x, y, image=photo, tags=("item", f"item_{item_id}"))
            else:
                emoji_map = {"cushion": "🛋️", "toy_mouse": "🐭", "scratcher": "🪵", "treat_bowl": "🥣", "cat_tree": "🏰"}
                self.app.cat_canvas.create_text(x, y, text=emoji_map.get(item_id, "🛋️"), font=("Segoe UI Emoji", 22), tags=("item", f"item_{item_id}"))

    def refresh_cafe_elements(self):
        if hasattr(self.app, 'header_view'):
            self.app.header_view.update_treat_display()
        prof = self.app.data_mgr.get_profile()
        done_pomo = self.app.data_mgr.get_cafe_data()['total_pomodoros']
        
        if hasattr(self.app, 'info_card'):
            self.app.info_card.config(bg=self.app.theme["card"])
            self.app.cycle_label.config(fg=self.app.theme["text"], bg=self.app.theme["card"])
            self.app.total_pomo_label.config(text=f"本日: {done_pomo}/{prof['daily_goal']} 🍅", fg=self.app.theme["work"], bg=self.app.theme["card"])
            self.app.active_task_banner.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
            self.app.btn_frame.config(bg=self.app.theme["bg"])
            self.app.start_btn.config(bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"])
            self.app.feed_btn.config(bg=self.app.theme["card"], fg=self.app.theme["accent"])
            self.app.reset_btn.config(bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"])
            if hasattr(self.app, 'layout_edit_btn') and not self.is_edit_mode:
                self.app.layout_edit_btn.config(bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"])
            
        icon = AVATAR_ICONS.get(prof.get("avatar", "black"), "🐾")
        self.app.account_btn.config(text=f"{icon} {prof['name'][:8]}")
        
        active_t = self.app.data_mgr.get_active_task()
        if not self.is_edit_mode:
            if active_t:
                done_mark = " (完了)" if active_t.get("is_done") else ""
                self.app.active_task_banner.config(text=f"作業中: {active_t['title']}{done_mark}")
            else:
                self.app.active_task_banner.config(text="作業中タスクなし 📝")
        self.sync_unlocked_entities()

    def on_canvas_click(self, event):
        clicked_cat = None
        for cat in self.app.cats:
            if abs(event.x - cat["x"]) < 30 and abs(event.y - cat["y"]) < 30:
                clicked_cat = cat
                break
                
        target_x = event.x
        target_y = event.y
        cat_msg = random.choice(["ゴロゴロ…♪ ❤️", "ニャ〜ン♪ ✨", "すりすり…🐾", "大好きニャ！💖"])
        if clicked_cat:
            target_x = clicked_cat["x"]
            target_y = clicked_cat["y"]
            clicked_cat["state"] = "sit"
            clicked_cat["state_timer"] = 40
            aff = self.app.data_mgr.pet_cat(clicked_cat["type"])
            cat_msg = f"{cat_msg} (親愛度 Lv.{aff})"
            
        self.app.sound_mgr.play_se("meow")
        self.app.floating_effects.append({
            "id": self.app.cat_canvas.create_text(target_x, target_y - 20, text=cat_msg, font=("Meiryo", 10, "bold"), fill=self.app.theme["work"]),
            "x": target_x,
            "y": target_y - 20,
            "life": 35
        })
