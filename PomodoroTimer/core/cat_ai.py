import math
import random

class CatAIEngine:
    @staticmethod
    def process_ai(cat, all_cats, unlocked_items):
        """
        猫の自律AIを計算し、状態を更新する。
        「約3秒の移動 (walk/dash) ➔ 約3秒の静止ポーズ (sit/groom/stretch/play) ➔ 再び移動」
        という交互サイクルを確実に実行します。
        """
        effects = []
        
        # 睡眠中の場合はAIの通常ルーチンはスキップ
        if cat.get("state") == "sleep":
            return effects
            
        # タイマーが残っている間は現在の動作を継続
        if cat.get("state_timer", 0) > 0:
            cat["state_timer"] -= 1
            return effects

        # --- 3秒ごとの状態遷移判定 (state_timer <= 0) ---
        cur_state = cat.get("state", "sit")
        
        # 1. 移動中 (walk / dash) だった場合 ➔ 到着地点で静止アクションへ遷移
        if cur_state in ["walk", "dash"]:
            cat["dx"] = 0
            cat["dy"] = 0
            cat["state_timer"] = random.randint(55, 65) # 約3秒 (20fps基準で60)
            
            # (A) 近くの猫とのじゃれあい判定
            interacted = False
            for other in all_cats:
                if other.get("id") != cat.get("id") and other.get("state") != "sleep":
                    dist = math.hypot(cat["x"] - other["x"], cat["y"] - other["y"])
                    if dist < 45 and random.random() < 0.45:
                        cat["state"] = "play"
                        other["state"] = "groom"
                        other["state_timer"] = random.randint(55, 65)
                        other["dx"] = 0
                        other["dy"] = 0
                        
                        hx = (cat["x"] + other["x"]) / 2
                        hy = min(cat["y"], other["y"]) - 20
                        effects.append({"type": "effect", "text": "💖", "x": hx, "y": hy})
                        interacted = True
                        break
                        
            if interacted:
                return effects

            # (B) 家具の近くに到着した場合のインタラクション
            if "cushion" in unlocked_items and math.hypot(cat["x"] - 75, cat["y"] - 205) < 40 and random.random() < 0.50:
                cat["state"] = random.choice(["sit", "groom"])
                return effects
                
            if "toy_mouse" in unlocked_items and math.hypot(cat["x"] - 165, cat["y"] - 225) < 40 and random.random() < 0.55:
                cat["state"] = "play"
                effects.append({"type": "effect", "text": "✨", "x": cat["x"], "y": cat["y"] - 20})
                return effects
                
            if "scratcher" in unlocked_items and math.hypot(cat["x"] - 395, cat["y"] - 175) < 40 and random.random() < 0.50:
                cat["state"] = "stretch"
                return effects

            # (C) 通常の静止アクション選択
            candidate_states = ["sit", "groom", "stretch", "play"]
            weights = [40, 25, 20, 15]
            cat["state"] = random.choices(candidate_states, weights=weights)[0]
            if random.random() < 0.3:
                cat["facing"] = "r" if cat.get("facing") == "l" else "l"
            return effects

        # 2. 静止中 (sit, groom, stretch, play) だった場合 ➔ 新しい場所へ移動 (walk / dash)
        else:
            is_dash = random.random() < 0.25
            cat["state"] = "dash" if is_dash else "walk"
            cat["state_timer"] = random.randint(55, 65) # 約3秒
            
            # 部屋の中央 (x=240, y=185) に向かう軽いバイアスを計算して壁際スタックを防止
            target_cx = 240 + random.randint(-80, 80)
            target_cy = 185 + random.randint(-30, 30)
            
            angle = math.atan2(target_cy - cat["y"], target_cx - cat["x"])
            # ランダムなゆらぎを加える
            angle += random.uniform(-0.6, 0.6)
            
            speed = random.uniform(2.6, 3.4) if is_dash else random.uniform(1.3, 1.8)
            cat["dx"] = math.cos(angle) * speed
            cat["dy"] = math.sin(angle) * (speed * 0.5) # Y方向の奥行き感
            
            cat["facing"] = "r" if cat["dx"] >= 0 else "l"
            return effects

