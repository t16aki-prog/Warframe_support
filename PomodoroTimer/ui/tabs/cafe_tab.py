import tkinter as tk
import random
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
from ui.utils import FONT_MAIN, FONT_BOLD, FONT_SUB, FONT_TEXT, AVATAR_ICONS

class CafeTab:
    def __init__(self, app):
        self.app = app
        self._build_cafe_tab()

    def _build_cafe_tab(self):
        tab = tk.Frame(self.app.content_frame, bg=self.app.theme["bg"])
        self.app.tabs["cafe"] = tab
        
        self.canvas_w = 480
        self.canvas_h = 270
        self.app.cat_canvas = tk.Canvas(tab, width=self.canvas_w, height=self.canvas_h, bg=self.app.theme["bg"], highlightthickness=0, cursor="hand2")
        self.app.cat_canvas.pack(pady=(0, 5))
        self.app.cat_canvas.bind("<Button-1>", self.on_canvas_click)
        
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
        
        self.app.start_btn = tk.Button(self.app.btn_frame, text="▶ 開始", command=self.app.toggle_timer, bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"], font=FONT_SUB, relief="flat", padx=18, pady=5, cursor="hand2")
        self.app.start_btn.pack(side="left", padx=5)
        
        self.app.feed_btn = tk.Button(self.app.btn_frame, text="🐟 おやつをあげる", command=self.feed_active_cat, bg=self.app.theme["card"], fg=self.app.theme["accent"], font=FONT_SUB, relief="flat", padx=14, pady=5, cursor="hand2")
        self.app.feed_btn.pack(side="left", padx=5)
        
        self.app.reset_btn = tk.Button(self.app.btn_frame, text="↺ リセット", command=self.app.reset_timer, bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"], font=FONT_SUB, relief="flat", padx=14, pady=5, cursor="hand2")
        self.app.reset_btn.pack(side="left", padx=5)

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
        self.app.cat_canvas.delete("cat")
        self.app.cat_canvas.delete("item")
        self.app.cats.clear()
        
        if not self.app.has_images:
            self.app.cat_canvas.create_text(self.canvas_w/2, self.canvas_h/2, text="(=^・^=)", font=("Meiryo", 20), fill=self.app.theme["accent"], tags="cat")
            return
            
        unlocked_items = self.app.data_mgr.get_cafe_data().get("unlocked_items", ["cushion"])
        item_positions = {
            "cushion": (75, 205, "🛋️"),
            "toy_mouse": (165, 225, "🐭"),
            "scratcher": (395, 175, "🪵"),
            "treat_bowl": (240, 225, "🥣"),
            "cat_tree": (390, 105, "🏰")
        }
        for item_id in unlocked_items:
            if item_id in item_positions:
                x, y, icon = item_positions[item_id]
                self.app.cat_canvas.create_text(x, y, text=icon, font=("Segoe UI Emoji", 22), tags="item")
                
        unlocked_cats = self.app.data_mgr.get_cafe_data().get("unlocked_cats", ["black"])
        
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
            if cat_id in self.app.cat_textures:
                if idx < len(spawn_slots):
                    x, y = spawn_slots[idx]
                else:
                    x = random.randint(70, 410)
                    y = random.randint(145, 225)
                    
                sp_type = random.choice(sleep_pose_types)
                facing = random.choice(["r", "l"])
                
                if is_sleep_time:
                    initial_state = "sleep"
                    initial_img = self.app.cat_textures[cat_id].get(f"{sp_type}_0")
                else:
                    initial_state = "sit"
                    initial_img = self.app.cat_textures[cat_id].get(f"sit_{facing}")
                    
                if not initial_img:
                    # フォールバック
                    initial_img = self.app.cat_textures[cat_id].get(f"{sp_type}_0", list(self.app.cat_textures[cat_id].values())[0])

                canvas_id = self.app.cat_canvas.create_image(x, y, image=initial_img, tags="cat")
                self.app.cats.append({
                    "type": cat_id,
                    "id": canvas_id,
                    "x": x,
                    "y": y,
                    "state": initial_state,
                    "sleep_pose": sp_type,
                    "state_timer": random.randint(20, 80),
                    "dx": 0,
                    "dy": 0,
                    "facing": facing
                })

    def refresh_cafe_elements(self):
        self.app.treat_label.config(text=f"🐟 {self.app.data_mgr.get_cafe_data()['treats']}個", fg=self.app.theme["accent"])
        prof = self.app.data_mgr.get_profile()
        done_pomo = self.app.data_mgr.get_cafe_data()['total_pomodoros']
        
        if hasattr(self, 'info_card'):
            self.app.info_card.config(bg=self.app.theme["card"])
            self.app.cycle_label.config(fg=self.app.theme["text"], bg=self.app.theme["card"])
            self.app.total_pomo_label.config(text=f"本日: {done_pomo}/{prof['daily_goal']} 🍅", fg=self.app.theme["work"], bg=self.app.theme["card"])
            self.app.active_task_banner.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
            self.app.btn_frame.config(bg=self.app.theme["bg"])
            self.app.start_btn.config(bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"])
            self.app.feed_btn.config(bg=self.app.theme["card"], fg=self.app.theme["accent"])
            self.app.reset_btn.config(bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"])
            
        icon = AVATAR_ICONS.get(prof.get("avatar", "black"), "🐾")
        self.app.account_btn.config(text=f"{icon} {prof['name'][:8]}")
        
        active_t = self.app.data_mgr.get_active_task()
        if active_t:
            done_mark = " (完了)" if active_t["is_done"] else ""
            self.app.active_task_banner.config(text=f"作業中: {active_t['title']}{done_mark}")
        else:
            self.app.active_task_banner.config(text="作業中タスクなし 📝")
        self.spawn_cats_and_items()

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
        heart_id = self.app.cat_canvas.create_text(target_x, target_y - 22, text=cat_msg, font=("Meiryo", 9, "bold"), fill=self.app.theme["work"])
        self.app.floating_effects.append({"id": heart_id, "x": target_x, "y": target_y - 22, "life": 25})

