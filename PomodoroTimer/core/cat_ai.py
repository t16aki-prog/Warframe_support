import math
import random

class CatAIEngine:
    @staticmethod
    def process_ai(cat, all_cats, unlocked_items):
        """
        猫の自律AIを計算し、状態を更新する。
        副作用として発生したUIエフェクトのリストを返す。
        戻り値: list of dict (例: [{"type": "effect", "text": "💖", "x": 100, "y": 100}])
        """
        effects = []
        
        # 猫同士のじゃれあい判定
        for other in all_cats:
            if other["id"] != cat["id"]:
                dist = math.hypot(cat["x"] - other["x"], cat["y"] - other["y"])
                if dist < 34 and cat["state"] in ["walk", "dash"] and random.random() < 0.16:
                    cat["state"] = random.choice(["play", "groom"])
                    cat["state_timer"] = random.randint(30, 60)
                    other["state"] = random.choice(["play", "sit"])
                    other["state_timer"] = random.randint(30, 60)
                    
                    hx = (cat["x"] + other["x"]) / 2
                    hy = min(cat["y"], other["y"]) - 18
                    effects.append({"type": "effect", "text": "💖", "x": hx, "y": hy})
                    return effects

        # 家具インタラクション判定
        if "cushion" in unlocked_items and math.hypot(cat["x"] - 75, cat["y"] - 205) < 32 and random.random() < 0.18:
            cat["state"] = random.choice(["groom", "stretch", "sit"])
            cat["state_timer"] = random.randint(40, 90)
            return effects
            
        if "toy_mouse" in unlocked_items and math.hypot(cat["x"] - 165, cat["y"] - 225) < 32 and random.random() < 0.22:
            cat["state"] = "play"
            cat["state_timer"] = random.randint(25, 45)
            return effects
            
        if "scratcher" in unlocked_items and math.hypot(cat["x"] - 395, cat["y"] - 175) < 32 and random.random() < 0.20:
            cat["state"] = "stretch"
            cat["state_timer"] = random.randint(30, 60)
            return effects

        # ランダムな状態遷移 (約3秒 = 60カウントごとに必ず別の動作・位置へ切り替え)
        cur_state = cat.get("state", "sit")
        if cat.get("state_timer", 0) <= 0 or cur_state == "sleep":
            # 直前の状態とは必ず異なる動作を選択
            if cur_state in ["walk", "dash"]:
                # 移動後はその場所でアクション（毛づくろい、背伸び、オモチャ、お座り）を行う
                candidate_states = ["groom", "stretch", "play", "sit", "sit"]
                weights = [25, 20, 25, 15, 15]
            else:
                # 静止アクション後は別の場所へ移動する（歩く、ダッシュ）
                candidate_states = ["walk", "walk", "dash", "play", "groom"]
                weights = [50, 30, 10, 5, 5]
                
            new_state = random.choices(candidate_states, weights=weights)[0]
            cat["state"] = new_state
            
            # 約3秒間持続 (20回/秒判定 × 3秒 = 約60カウント)
            cat["state_timer"] = random.randint(50, 70)
            
            if new_state == "walk":
                cat["dx"] = random.choice([-1.6, -1.2, 1.2, 1.6])
                cat["dy"] = random.choice([-0.8, -0.4, 0.4, 0.8])
                cat["facing"] = "r" if cat["dx"] > 0 else "l"
            elif new_state == "dash":
                cat["dx"] = random.choice([-3.2, -2.4, 2.4, 3.2])
                cat["dy"] = random.choice([-1.0, 1.0])
                cat["facing"] = "r" if cat["dx"] > 0 else "l"
            elif new_state in ["sit", "groom", "stretch", "play"]:
                cat["dx"] = 0
                cat["dy"] = 0
                # 向きを時々反転させて自然に見せる
                if random.random() < 0.5:
                    cat["facing"] = "r" if cat.get("facing") == "l" else "l"
        else:
            cat["state_timer"] -= 1
            
        return effects
