import math
import random

class CatAIEngine:
    @staticmethod
    def process_ai(cat, all_cats, unlocked_items):
        """
        猫の自律AIを計算し、状態を更新する。
        各動作は約3秒間持続し、タイマー終了時に必ず別の動作・位置へ切り替えます。
        """
        effects = []
        
        # タイマーが残っている間は現在の動作を継続
        if cat.get("state_timer", 0) > 0 and cat.get("state") != "sleep":
            cat["state_timer"] -= 1
            return effects

        # --- 3秒ごとの状態遷移判定 (state_timer <= 0) ---
        cur_state = cat.get("state", "sit")
        
        # 1. 近くの猫とのじゃれあい判定 (移動後に他の猫と近ければハートエフェクト＆じゃれあい)
        interacted = False
        for other in all_cats:
            if other.get("id") != cat.get("id"):
                dist = math.hypot(cat["x"] - other["x"], cat["y"] - other["y"])
                if dist < 42 and random.random() < 0.35:
                    cat["state"] = "play"
                    cat["state_timer"] = random.randint(55, 65) # 約3秒
                    cat["dx"] = 0
                    cat["dy"] = 0
                    
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

        # 2. 家具インタラクション判定 (家具の近くに到着した場合)
        if "cushion" in unlocked_items and math.hypot(cat["x"] - 75, cat["y"] - 205) < 38 and random.random() < 0.40:
            cat["state"] = random.choice(["groom", "sit"])
            cat["state_timer"] = random.randint(55, 70)
            cat["dx"] = 0
            cat["dy"] = 0
            return effects
            
        if "toy_mouse" in unlocked_items and math.hypot(cat["x"] - 165, cat["y"] - 225) < 38 and random.random() < 0.45:
            cat["state"] = "play"
            cat["state_timer"] = random.randint(55, 70)
            cat["dx"] = 0
            cat["dy"] = 0
            return effects
            
        if "scratcher" in unlocked_items and math.hypot(cat["x"] - 395, cat["y"] - 175) < 38 and random.random() < 0.40:
            cat["state"] = "stretch"
            cat["state_timer"] = random.randint(55, 70)
            cat["dx"] = 0
            cat["dy"] = 0
            return effects

        # 3. 通常の3秒サイクル状態遷移
        # 移動中(walk/dash)だった場合 -> 到着地点で必ず静止アクション(お座り、毛づくろい、背伸び、遊ぶ)を行う
        if cur_state in ["walk", "dash"]:
            candidate_states = ["sit", "groom", "stretch", "play"]
            weights = [35, 25, 20, 20]
        else:
            # 静止アクション中だった場合 -> 新しい場所へ歩く/ダッシュする
            candidate_states = ["walk", "walk", "dash"]
            weights = [50, 30, 20]
            
        new_state = random.choices(candidate_states, weights=weights)[0]
        cat["state"] = new_state
        cat["state_timer"] = random.randint(55, 70) # 20fps × 3s = 60
        
        if new_state == "walk":
            cat["dx"] = random.choice([-1.8, -1.3, 1.3, 1.8])
            cat["dy"] = random.choice([-0.9, -0.4, 0.4, 0.9])
            cat["facing"] = "r" if cat["dx"] > 0 else "l"
        elif new_state == "dash":
            cat["dx"] = random.choice([-3.4, -2.6, 2.6, 3.4])
            cat["dy"] = random.choice([-1.2, 1.2])
            cat["facing"] = "r" if cat["dx"] > 0 else "l"
        elif new_state in ["sit", "groom", "stretch", "play"]:
            cat["dx"] = 0
            cat["dy"] = 0
            if random.random() < 0.5:
                cat["facing"] = "r" if cat.get("facing") == "l" else "l"
                
        return effects
