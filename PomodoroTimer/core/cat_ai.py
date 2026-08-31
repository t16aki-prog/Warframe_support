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
            cat["state"] = random.choice(["play", "pounce"])
            cat["state_timer"] = random.randint(25, 45)
            return effects
            
        if "scratcher" in unlocked_items and math.hypot(cat["x"] - 395, cat["y"] - 175) < 32 and random.random() < 0.20:
            cat["state"] = "stretch"
            cat["state_timer"] = random.randint(30, 60)
            return effects

        # ランダムな状態遷移
        if cat["state_timer"] <= 0:
            states = ["walk", "sit", "dash", "groom", "stretch", "play", "pounce"]
            weights = [28, 22, 10, 15, 10, 10, 5]
            new_state = random.choices(states, weights=weights)[0]
            cat["state"] = new_state
            
            if new_state == "walk":
                cat["dx"] = random.choice([-2, -1, 1, 2])
                cat["dy"] = random.choice([-1, 1])
                cat["facing"] = "r" if cat["dx"] > 0 else "l"
                cat["state_timer"] = random.randint(30, 80)
            elif new_state == "dash":
                cat["dx"] = random.choice([-4, -3, 3, 4])
                cat["dy"] = random.choice([-2, 2])
                cat["facing"] = "r" if cat["dx"] > 0 else "l"
                cat["state_timer"] = random.randint(15, 30)
            elif new_state in ["sit", "groom", "stretch", "play", "pounce"]:
                cat["dx"] = 0
                cat["dy"] = 0
                cat["state_timer"] = random.randint(25, 60)
        else:
            cat["state_timer"] -= 1
            
        return effects
