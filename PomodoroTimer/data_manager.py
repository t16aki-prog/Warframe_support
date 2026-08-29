import json
import os
import time

THEMES = {
    "sakura": {
        "name": "🌸 さくらピンク (Sakura Pink)",
        "bg": "#fff0f5",
        "card": "#ffffff",
        "header": "#ffe4e1",
        "border": "#ffb6c1",
        "text": "#4a4a4a",
        "sub_text": "#777777",
        "input_bg": "#ffffff",
        "input_fg": "#333333",
        "btn": "#ffb6c1",
        "btn_fg": "#ffffff",
        "btn_sec": "#f0d5db",
        "btn_sec_fg": "#4a4a4a",
        "work": "#ff69b4",
        "break": "#3cb371",
        "long_break": "#9370db",
        "accent": "#ff8c00"
    },
    "mint": {
        "name": "🍃 ナチュラルミント (Natural Mint)",
        "bg": "#f0f8f5",
        "card": "#ffffff",
        "header": "#e2f3ec",
        "border": "#90cfbe",
        "text": "#2d3e36",
        "sub_text": "#617d71",
        "input_bg": "#ffffff",
        "input_fg": "#2d3e36",
        "btn": "#7bc5b2",
        "btn_fg": "#ffffff",
        "btn_sec": "#d5ece4",
        "btn_sec_fg": "#2d3e36",
        "work": "#2e8b57",
        "break": "#20b2aa",
        "long_break": "#3a86ff",
        "accent": "#e67e22"
    },
    "sky": {
        "name": "☁️ スカイブルー (Sky Blue)",
        "bg": "#f0f7fc",
        "card": "#ffffff",
        "header": "#e1eef8",
        "border": "#8cbbe8",
        "text": "#243342",
        "sub_text": "#596e82",
        "input_bg": "#ffffff",
        "input_fg": "#243342",
        "btn": "#6ba4dc",
        "btn_fg": "#ffffff",
        "btn_sec": "#d5e6f5",
        "btn_sec_fg": "#243342",
        "work": "#2f74c0",
        "break": "#06d6a0",
        "long_break": "#7b2cbf",
        "accent": "#f39c12"
    },
    "mocha": {
        "name": "☕ カフェラテ・モカ (Cafe Mocha)",
        "bg": "#fbf7f2",
        "card": "#ffffff",
        "header": "#f3ebe1",
        "border": "#caa782",
        "text": "#3d3027",
        "sub_text": "#756254",
        "input_bg": "#ffffff",
        "input_fg": "#3d3027",
        "btn": "#b89065",
        "btn_fg": "#ffffff",
        "btn_sec": "#e8dcce",
        "btn_sec_fg": "#3d3027",
        "work": "#a84e68",
        "break": "#5c8a6f",
        "long_break": "#795548",
        "accent": "#d35400"
    },
    "lavender": {
        "name": "🔮 パステルラベンダー (Pastel Lavender)",
        "bg": "#f7f2fc",
        "card": "#ffffff",
        "header": "#ede3f8",
        "border": "#bfa0ea",
        "text": "#342844",
        "sub_text": "#6c5b82",
        "input_bg": "#ffffff",
        "input_fg": "#342844",
        "btn": "#a880e2",
        "btn_fg": "#ffffff",
        "btn_sec": "#e4d5f5",
        "btn_sec_fg": "#342844",
        "work": "#7d3dc7",
        "break": "#2ec4b6",
        "long_break": "#d946ef",
        "accent": "#f0932b"
    },
    "dark": {
        "name": "🌙 ナイトダーク (Midnight Dark)",
        "bg": "#181824",
        "card": "#242436",
        "header": "#1f1f2e",
        "border": "#ff79c6",
        "text": "#f1f2f6",
        "sub_text": "#a4b0be",
        "input_bg": "#2f3146",
        "input_fg": "#f1f2f6",
        "btn": "#ff79c6",
        "btn_fg": "#181824",
        "btn_sec": "#383852",
        "btn_sec_fg": "#f1f2f6",
        "work": "#ff79c6",
        "break": "#50fa7b",
        "long_break": "#bd93f9",
        "accent": "#ffb86c"
    }
}

DEFAULT_DATA = {
    "profile": {
        "id": "default",
        "name": "にゃんこマスター 🐾",
        "avatar": "black",
        "starter_chosen": False,
        "daily_goal": 4,
        "email": "",
        "google_connected": False
    },
    "settings": {
        "theme": "sakura",
        "work_minutes": 25,
        "short_break_minutes": 5,
        "long_break_minutes": 15,
        "long_break_interval": 4,
        "auto_start_break": False,
        "auto_start_work": False,
        "se_enabled": True,
        "bgm_type": "none"
    },
    "tasks": [
        {
            "id": 1,
            "title": "今日のタスクを計画する 📝",
            "target_pomo": 1,
            "completed_pomo": 0,
            "is_done": False,
            "google_id": None
        }
    ],
    "active_task_id": 1,
    "cafe": {
        "treats": 3,
        "total_pomodoros": 0,
        "unlocked_cats": ["black"],
        "unlocked_items": ["cushion"]
    }
}

AVAILABLE_CATS = [
    {"id": "black", "name": "くろねこ 🐾", "cost": 0, "color_tint": (30, 30, 35), "desc": "クールで人懐っこい黒猫"},
    {"id": "white", "name": "しろねこ 🤍", "cost": 2, "color_tint": (245, 245, 250), "desc": "ふわふわ真っ白なお姫様猫"},
    {"id": "gray", "name": "はいいろねこ 🩶", "cost": 3, "color_tint": (140, 145, 155), "desc": "上品で落ち着いたロシアンブルー風"},
    {"id": "calico", "name": "みけねこ 🌸", "cost": 4, "color_tint": (240, 180, 140), "desc": "三毛柄の縁起の良い招き猫"},
    {"id": "siamese", "name": "シャムねこ 🐱", "cost": 5, "color_tint": (240, 230, 215), "desc": "気品あふれるポイントカラー猫"},
    {"id": "orange", "name": "ちゃとら 🐯", "cost": 6, "color_tint": (230, 140, 60), "desc": "元気いっぱいの茶トラ"},
    {"id": "cream", "name": "クリームねこ 🍦", "cost": 6, "color_tint": (250, 235, 200), "desc": "やさしいミルクティー色の猫"},
    {"id": "ginger", "name": "ジンジャー 🦊", "cost": 7, "color_tint": (215, 80, 40), "desc": "鮮やかな赤毛がチャームポイント"},
    {"id": "tuxedo", "name": "はちわれ 🎩", "cost": 8, "color_tint": (80, 90, 110), "desc": "タキシード柄のおしゃれ猫"},
    {"id": "tortoiseshell", "name": "サビねこ 🍂", "cost": 8, "color_tint": (110, 75, 55), "desc": "個性豊かなべっ甲模様の猫"},
    {"id": "sakura", "name": "さくらねこ 🌸", "cost": 10, "color_tint": (255, 195, 215), "desc": "ほんのり桜色に染まった妖精猫"},
    {"id": "mint", "name": "ミントねこ 🍃", "cost": 10, "color_tint": (160, 225, 195), "desc": "爽やかなパステルグリーンの猫"},
    {"id": "sky", "name": "スカイねこ ☁️", "cost": 12, "color_tint": (160, 205, 250), "desc": "澄んだ青空色のファンタジー猫"},
    {"id": "lavender", "name": "ラベンダー 🔮", "cost": 12, "color_tint": (195, 175, 230), "desc": "幻想的なパステル紫の猫"},
    {"id": "golden", "name": "ゴールドキャット ✨", "cost": 15, "color_tint": (245, 200, 60), "desc": "幸運を呼ぶきらめく黄金猫"}
]

AVAILABLE_ITEMS = [
    {"id": "cushion", "name": "ふかふかクッション", "cost": 0, "icon": "🛋️", "desc": "猫たちのお気に入りのお昼寝場所"},
    {"id": "toy_mouse", "name": "ねずみのおもちゃ", "cost": 3, "icon": "🐭", "desc": "じゃれついて遊べるねずみ"},
    {"id": "scratcher", "name": "つめとぎポール", "cost": 5, "icon": "🪵", "desc": "バリバリ爪を研げる麻紐ポール"},
    {"id": "treat_bowl", "name": "ごちそう皿", "cost": 6, "icon": "🥣", "desc": "いつでもおいしいご飯が入ったお皿"},
    {"id": "cat_tree", "name": "豪華キャットタワー", "cost": 10, "icon": "🏰", "desc": "見晴らし抜群の大きなお城"}
]

class DataManager:
    """設定、タスク、猫カフェデータ、アカウントプロファイルの永続化管理"""
    
    def __init__(self, data_path=None):
        if data_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            data_path = os.path.join(base_dir, "pomodoro_data.json")
        self.data_path = data_path
        self.data = self.load_data()

    def load_data(self):
        if os.path.exists(self.data_path):
            try:
                with open(self.data_path, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                    merged = DEFAULT_DATA.copy()
                    merged.update(loaded)
                    for k in ["profile", "settings", "cafe"]:
                        if k in loaded:
                            d = DEFAULT_DATA[k].copy()
                            d.update(loaded[k])
                            merged[k] = d
                    return merged
            except Exception as e:
                print("Error loading data:", e)
        return json.loads(json.dumps(DEFAULT_DATA))

    def save_data(self):
        try:
            with open(self.data_path, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print("Error saving data:", e)

    # --- アカウント・プロフィール管理 ---
    def get_profile(self):
        return self.data.get("profile", DEFAULT_DATA["profile"])

    def update_profile(self, name=None, avatar=None, daily_goal=None, email=None, google_connected=None):
        profile = self.get_profile()
        if name is not None:
            profile["name"] = name
        if avatar is not None:
            profile["avatar"] = avatar
        if daily_goal is not None:
            profile["daily_goal"] = max(1, daily_goal)
        if email is not None:
            profile["email"] = email
        if google_connected is not None:
            profile["google_connected"] = google_connected
        self.data["profile"] = profile
        self.save_data()
        return profile

    # --- 設定アクセス ---
    def get_setting(self, key):
        return self.data["settings"].get(key, DEFAULT_DATA["settings"].get(key))

    def set_setting(self, key, val):
        self.data["settings"][key] = val
        self.save_data()

    # --- タスク管理 ---
    def get_tasks(self):
        return self.data["tasks"]

    def add_task(self, title, target_pomo=1, google_id=None):
        task_id = int(time.time() * 1000) % 1000000
        new_task = {
            "id": task_id,
            "title": title,
            "target_pomo": max(1, target_pomo),
            "completed_pomo": 0,
            "is_done": False,
            "google_id": google_id
        }
        self.data["tasks"].append(new_task)
        if not self.data.get("active_task_id"):
            self.data["active_task_id"] = task_id
        self.save_data()
        return new_task

    def delete_task(self, task_id):
        self.data["tasks"] = [t for t in self.data["tasks"] if t["id"] != task_id]
        if self.data.get("active_task_id") == task_id:
            self.data["active_task_id"] = self.data["tasks"][0]["id"] if self.data["tasks"] else None
        self.save_data()

    def toggle_task_done(self, task_id):
        for t in self.data["tasks"]:
            if t["id"] == task_id:
                t["is_done"] = not t["is_done"]
                self.save_data()
                return t
        return None

    def get_active_task(self):
        active_id = self.data.get("active_task_id")
        for t in self.data["tasks"]:
            if t["id"] == active_id:
                return t
        if self.data["tasks"]:
            self.data["active_task_id"] = self.data["tasks"][0]["id"]
            return self.data["tasks"][0]
        return None

    def set_active_task(self, task_id):
        self.data["active_task_id"] = task_id
        self.save_data()

    def increment_active_task_pomo(self):
        task = self.get_active_task()
        if task:
            task["completed_pomo"] += 1
            self.save_data()
            return task
        return None

    # --- カフェ・ショップ育成管理 ---
    def get_cafe_data(self):
        return self.data["cafe"]

    def add_pomodoro_reward(self):
        """ポモドーロ完了時のご褒美（おやつ+1、総ポモドーロ+1）"""
        self.data["cafe"]["treats"] += 1
        self.data["cafe"]["total_pomodoros"] += 1
        self.save_data()

    def unlock_cat(self, cat_id):
        cat = next((c for c in AVAILABLE_CATS if c["id"] == cat_id), None)
        if not cat:
            return False, "猫が見つかりません"
        if cat_id in self.data["cafe"]["unlocked_cats"]:
            return False, "すでに迎えている猫です"
        if self.data["cafe"]["treats"] < cat["cost"]:
            return False, f"おやつが足りません (必要: {cat['cost']}個)"
            
        self.data["cafe"]["treats"] -= cat["cost"]
        self.data["cafe"]["unlocked_cats"].append(cat_id)
        self.save_data()
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
        self.save_data()
        return True, f"{item['name']} をカフェに設置しました！✨"

    def set_starter_cat(self, cat_id):
        """最初の相棒猫（コスト0）を設定・変更"""
        cat = next((c for c in AVAILABLE_CATS if c["id"] == cat_id), None)
        if not cat:
            return False, "猫が見つかりません"
            
        unlocked = self.data["cafe"]["unlocked_cats"]
        if cat_id not in unlocked:
            unlocked.append(cat_id)
            
        self.data["profile"]["avatar"] = cat_id
        self.data["profile"]["starter_chosen"] = True
        self.save_data()
        return True, f"最初の相棒猫を「{cat['name']}」に設定しました！🐾"

    def get_current_theme(self):
        theme_key = self.get_setting("theme")
        return THEMES.get(theme_key, THEMES["sakura"])
