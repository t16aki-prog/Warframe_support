"""PomodoroTimer 猫カフェ・ショップ・ガチャ育成管理モジュール"""

import time
from .constants import AVAILABLE_CATS, AVAILABLE_ITEMS


class CafeManager:
    """猫カフェのデータ、親愛度、ショップアイテム・猫のアンロック、配置管理を担当"""

    def __init__(self, storage, stats_manager, settings_getter):
        self.storage = storage
        self.stats_manager = stats_manager
        self.get_setting = settings_getter

    @property
    def data(self):
        return self.storage.data

    def get_cafe_data(self):
        if "cat_affection" not in self.data["cafe"]:
            self.data["cafe"]["cat_affection"] = {}
        return self.data["cafe"]

    def add_pomodoro_reward(self):
        """ポモドーロ完了時のご褒美（おやつ+1、総ポモドーロ+1、統計・実績更新）"""
        self.data["cafe"]["treats"] += 1
        self.data["cafe"]["total_pomodoros"] += 1

        # 統計データ更新
        today_str = time.strftime("%Y-%m-%d")
        if "stats" not in self.data:
            self.data["stats"] = {"daily_history": {}, "total_minutes": 0, "streak_days": 1, "last_active_date": ""}

        daily = self.data["stats"]["daily_history"]
        daily[today_str] = daily.get(today_str, 0) + 1

        work_m = self.get_setting("work_minutes")
        self.data["stats"]["total_minutes"] += work_m

        # 連続記録 (Streak) の更新
        last_date = self.data["stats"].get("last_active_date", "")
        if last_date != today_str:
            self.data["stats"]["last_active_date"] = today_str

        # 実績チェック
        self.stats_manager.check_achievements()
        self.storage.save_data()

    def feed_cat_treat(self, cat_id):
        """猫におやつをあげて親愛度アップ"""
        if self.data["cafe"]["treats"] <= 0:
            return False, "おやつが足りません (ポモドーロを完了して獲得しよう！🐟)"

        self.data["cafe"]["treats"] -= 1
        aff = self.data["cafe"].setdefault("cat_affection", {})
        aff[cat_id] = min(5, aff.get(cat_id, 1) + 1)
        self.stats_manager.check_achievements()
        self.storage.save_data()
        cat = next((c for c in AVAILABLE_CATS if c["id"] == cat_id), {"name": "ねこ"})
        return True, f"{cat['name']} に魚のおやつをあげました！親愛度 Lv.{aff[cat_id]} ❤️"

    def pet_cat(self, cat_id):
        """猫を撫でる"""
        aff = self.data["cafe"].setdefault("cat_affection", {})
        current = aff.get(cat_id, 1)
        self.stats_manager.check_achievements()
        return current

    def get_item_positions(self):
        default_pos = {
            "cushion": [75, 205],
            "toy_mouse": [165, 225],
            "scratcher": [395, 175],
            "treat_bowl": [240, 225],
            "cat_tree": [390, 105]
        }
        return self.data["cafe"].setdefault("item_positions", default_pos)

    def set_item_position(self, item_id, x, y):
        positions = self.get_item_positions()
        positions[item_id] = [int(x), int(y)]
        self.storage.save_data()

    def add_custom_cat(self, cat_info):
        """ガチャで生成された完全ランダム猫を登録"""
        custom_cats = self.data["cafe"].setdefault("custom_cats", [])
        custom_cats.append(cat_info)
        c_id = cat_info["id"]
        if c_id not in self.data["cafe"]["unlocked_cats"]:
            self.data["cafe"]["unlocked_cats"].append(c_id)
        self.data["cafe"].setdefault("cat_affection", {})[c_id] = 1
        self.stats_manager.check_achievements()
        self.storage.save_data()

    def get_all_available_cats(self):
        """基本猫15種 + ガチャで生まれたカスタム猫"""
        customs = self.data["cafe"].get("custom_cats", [])
        return AVAILABLE_CATS + customs

    def unlock_cat(self, cat_id):
        all_cats = self.get_all_available_cats()
        cat = next((c for c in all_cats if c["id"] == cat_id), None)
        if not cat:
            return False, "猫が見つかりません"
        if cat_id in self.data["cafe"]["unlocked_cats"]:
            return False, "すでに迎えている猫です"
        if self.data["cafe"]["treats"] < cat["cost"]:
            return False, f"おやつが足りません (必要: {cat['cost']}個)"

        self.data["cafe"]["treats"] -= cat["cost"]
        self.data["cafe"]["unlocked_cats"].append(cat_id)
        self.data["cafe"].setdefault("cat_affection", {})[cat_id] = 1
        self.stats_manager.check_achievements()
        self.storage.save_data()
        return True, f"{cat['name']} をカフェに迎えました！🐾"

    def unlock_item(self, item_id):
        item = next((i for i in AVAILABLE_ITEMS if i["id"] == item_id), None)
        if not item:
            return False, "アイテムが見つかりません"
        if item_id in self.data["cafe"]["unlocked_items"]:
            return False, "すでに設置されているアイテムです"
        if self.data["cafe"]["treats"] < item["cost"]:
            return False, f"おやつが足りません (必要: {item['cost']}個)"

        self.data["cafe"]["treats"] -= item["cost"]
        self.data["cafe"]["unlocked_items"].append(item_id)
        self.stats_manager.check_achievements()
        self.storage.save_data()
        return True, f"{item['name']} をカフェに設置しました！✨"

    def set_starter_cat(self, cat_id):
        """最初の相棒猫（コスト0）を設定・変更"""
        all_cats = self.get_all_available_cats()
        cat = next((c for c in all_cats if c["id"] == cat_id), None)
        if not cat:
            return False, "猫が見つかりません"

        unlocked = self.data["cafe"]["unlocked_cats"]
        if cat_id not in unlocked:
            unlocked.append(cat_id)
        self.data["cafe"].setdefault("cat_affection", {})[cat_id] = 1

        self.data["profile"]["avatar"] = cat_id
        self.data["profile"]["starter_chosen"] = True
        self.storage.save_data()
        return True, f"最初の相棒猫を「{cat['name']}」に設定しました！🐾"
