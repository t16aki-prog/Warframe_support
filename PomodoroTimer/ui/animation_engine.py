import time
import random
import os
from core.cat_ai import CatAIEngine

class AnimationEngine:
    """カフェアニメーション・自律猫AI・環境エフェクト管理クラス"""
    def __init__(self, app):
        self.app = app
        self.anim_tick = 0
        self.floating_effects = []
        self.canvas_w = 480
        self.canvas_h = 270

    def process_cat_ai(self, cat):
        unlocked_items = self.app.data_mgr.get_cafe_data().get("unlocked_items", [])
        effects = CatAIEngine.process_ai(cat, self.app.cats, unlocked_items)

        for eff in effects:
            if eff["type"] == "effect":
                h_id = self.app.cat_canvas.create_text(
                    eff["x"], eff["y"], text=eff["text"],
                    font=("Segoe UI Emoji", 13), fill=self.app.theme["work"]
                )
                self.floating_effects.append({"id": h_id, "x": eff["x"], "y": eff["y"], "life": 22})

    def animate_loop(self):
        if not getattr(self.app, 'is_alive', True):
            return

        try:
            if self.app.image_loader.has_images:
                self.anim_tick += 1
                is_sleep_time = not self.app.timer.is_running or self.app.timer.session_mode != "work"

                # 時間帯に応じた環境光・ライティング判定
                cur_hour = time.localtime().tm_hour
                time_tag = "night" if (cur_hour >= 19 or cur_hour < 6) else ("evening" if cur_hour >= 17 else ("morning" if cur_hour < 11 else "day"))

                # 昼夜ライティングオーバーレイの更新 (60FPS基準で180フレーム=約3秒ごとに更新)
                if self.anim_tick % 180 == 1:
                    self.app.cat_canvas.delete("lighting")
                    if time_tag == "night":
                        self.app.cat_canvas.create_rectangle(0, 0, self.canvas_w, self.canvas_h, fill="#0d1124", stipple="gray25", outline="", tags="lighting")
                    elif time_tag == "evening":
                        self.app.cat_canvas.create_rectangle(0, 0, self.canvas_w, self.canvas_h, fill="#e17055", stipple="gray12", outline="", tags="lighting")
                    self.app.cat_canvas.tag_lower("lighting")
                    if hasattr(self.app.image_loader, 'bg_photo') and self.app.image_loader.bg_photo:
                        self.app.cat_canvas.tag_lower(1)

                # 猫スプライトの更新
                for cat in self.app.cats:
                    c_id = cat["type"]
                    tex = self.app.image_loader.get_cat_texture(c_id)
                    if not tex:
                        continue

                    if is_sleep_time:
                        if cat.get("state") != "sleep":
                            cat["state"] = "sleep"
                            cat["dx"] = 0
                            cat["dy"] = 0

                        sp_type = cat.get("sleep_pose", "sleep_curl")
                        if self.anim_tick % 60 == 0 and random.random() < 0.1:
                            sp_type = random.choice(["sleep_curl", "sleep_belly", "sleep_stretch"])
                            cat["sleep_pose"] = sp_type

                        cfg = self.app.data_mgr.get_anim_config(sp_type)
                        f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
                        frame_key = f"{sp_type}_{f_idx}"
                        try:
                            if frame_key in tex:
                                self.app.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                            elif f"{sp_type}_0" in tex:
                                self.app.cat_canvas.itemconfig(cat["id"], image=tex[f"{sp_type}_0"])
                            elif "sleep_0" in tex:
                                self.app.cat_canvas.itemconfig(cat["id"], image=tex["sleep_0"])
                        except Exception:
                            pass
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

                        if self.anim_tick % 3 == 0:
                            self.process_cat_ai(cat)

                        state = cat.get("state", "sit")
                        facing = cat.get("facing", "r")

                        if state in ["walk", "dash"]:
                            cat["x"] += cat["dx"] * 0.9
                            cat["y"] += cat["dy"] * 0.9

                            if cat["x"] < 60:
                                cat["x"] = 60
                                cat["dx"] = abs(cat["dx"])
                                cat["facing"] = "r"
                            elif cat["x"] > 420:
                                cat["x"] = 420
                                cat["dx"] = -abs(cat["dx"])
                                cat["facing"] = "l"

                            if cat["y"] < 135:
                                cat["y"] = 135
                                cat["dy"] = abs(cat["dy"])
                            elif cat["y"] > 235:
                                cat["y"] = 235
                                cat["dy"] = -abs(cat["dy"])

                            facing = cat["facing"]
                            cfg = self.app.data_mgr.get_anim_config(state)
                            f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
                            frame_key = f"{state}_{facing}_{f_idx}"
                            y_off = 2 if (self.anim_tick % 12 < 6) and state == "dash" else 0
                            try:
                                self.app.cat_canvas.coords(cat["id"], cat["x"], cat["y"] - y_off)
                                if frame_key in tex:
                                    self.app.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                            except Exception:
                                pass

                            if self.anim_tick % 36 == 0 and len(self.floating_effects) < 20:
                                paw_id = self.app.cat_canvas.create_text(cat["x"], cat["y"] + 14, text="🐾", font=("Segoe UI Emoji", 7), fill=self.app.theme["border"])
                                self.floating_effects.append({"id": paw_id, "x": cat["x"], "y": cat["y"] + 14, "life": 48})

                        elif state == "sit":
                            frame_key = f"sit_{facing}"
                            try:
                                self.app.cat_canvas.coords(cat["id"], cat["x"], cat["y"])
                                if frame_key in tex:
                                    self.app.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                                elif f"sit_r" in tex:
                                    self.app.cat_canvas.itemconfig(cat["id"], image=tex["sit_r"])
                            except Exception:
                                pass

                        elif state in ["groom", "stretch", "play", "pounce"]:
                            cfg = self.app.data_mgr.get_anim_config(state)
                            f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
                            frame_key = f"{state}_{facing}_{f_idx}"
                            try:
                                if frame_key in tex:
                                    self.app.cat_canvas.itemconfig(cat["id"], image=tex[frame_key])
                                elif f"sit_{facing}" in tex:
                                    self.app.cat_canvas.itemconfig(cat["id"], image=tex[f"sit_{facing}"])
                            except Exception:
                                pass

                # Zソート
                try:
                    for c in sorted(self.app.cats, key=lambda cat: cat.get("y", 0)):
                        self.app.cat_canvas.tag_raise(c["id"])
                    self.app.cat_canvas.tag_raise("effect")
                except Exception:
                    pass

                # ウィジェット用猫の同期
                if self.app.cats:
                    cat = self.app.cats[0]
                    tex = self.app.image_loader.get_cat_texture(cat.get("type", "black"))

                    if is_sleep_time:
                        sp_type = cat.get("sleep_pose", "sleep_curl")
                        cfg = self.app.data_mgr.get_anim_config("sleep")
                        f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
                        frame_key = f"{sp_type}_{f_idx}"
                    else:
                        state = cat.get("state", "sit")
                        facing = cat.get("facing", "r")
                        if state == "sit":
                            frame_key = f"sit_{facing}"
                        else:
                            cfg = self.app.data_mgr.get_anim_config(state)
                            f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
                            frame_key = f"{state}_{facing}_{f_idx}"

                    if tex and frame_key in tex:
                        try:
                            self.app.widget_obj.widget_cat.config(image=tex[frame_key])
                        except Exception:
                            pass

                # パーティクル更新
                if self.anim_tick % 48 == 0 and len(self.floating_effects) < 18:
                    px = random.randint(20, self.canvas_w - 20)
                    py = random.randint(10, self.canvas_h - 40)
                    icons = ["✨", "🌸", "⭐", "🐾", "🍃"] if time_tag != "night" else ["⭐", "✨", "🌌", "🌙", "🐾"]
                    p_icon = random.choice(icons)
                    p_id = self.app.cat_canvas.create_text(px, py, text=p_icon, font=("Segoe UI Emoji", 10), fill=self.app.theme["border"])
                    self.floating_effects.append({"id": p_id, "x": px, "y": py, "life": random.randint(90, 180), "dx": random.uniform(-0.2, 0.2)})

                for effect in self.floating_effects[:]:
                    effect["y"] -= 0.26
                    if "dx" in effect:
                        effect["x"] += effect["dx"]
                    effect["life"] -= 1
                    try:
                        self.app.cat_canvas.coords(effect["id"], effect["x"], effect["y"])
                        if effect["life"] <= 0:
                            self.app.cat_canvas.delete(effect["id"])
                            self.floating_effects.remove(effect)
                    except Exception:
                        pass
        except (KeyboardInterrupt, SystemExit):
            raise
        except Exception as e:
            print("Animation loop error:", e)
        finally:
            if getattr(self.app, 'is_alive', True):
                try:
                    self.app.root.after(16, self.animate_loop)
                except Exception:
                    pass
