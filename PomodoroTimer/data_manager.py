import json
import os
import time

THEMES = {
    "sakura": {
        "name": "🌸 プレミアム・サクラ (Premium Sakura)",
        "bg": "#fcf5f7",
        "card": "#ffffff",
        "header": "#f8e6eb",
        "border": "#f4c2d7",
        "text": "#4a3c42",
        "sub_text": "#8c7a82",
        "input_bg": "#fbf7f8",
        "input_fg": "#4a3c42",
        "btn": "#e88bb3",
        "btn_fg": "#ffffff",
        "btn_sec": "#fbeaf0",
        "btn_sec_fg": "#e88bb3",
        "work": "#e66094",
        "break": "#52c48e",
        "long_break": "#917add",
        "accent": "#f39c12"
    },
    "mint": {
        "name": "🍃 エレガント・ミント (Elegant Mint)",
        "bg": "#f4faf7",
        "card": "#ffffff",
        "header": "#e6f5ef",
        "border": "#b8e6d2",
        "text": "#314f44",
        "sub_text": "#729688",
        "input_bg": "#f6fcf9",
        "input_fg": "#314f44",
        "btn": "#61c79e",
        "btn_fg": "#ffffff",
        "btn_sec": "#e1f5eb",
        "btn_sec_fg": "#61c79e",
        "work": "#42b883",
        "break": "#3498db",
        "long_break": "#8e44ad",
        "accent": "#e67e22"
    },
    "sky": {
        "name": "☁️ クラウド・スカイ (Cloud Sky)",
        "bg": "#f5f9fc",
        "card": "#ffffff",
        "header": "#e6f0f9",
        "border": "#b3d4f0",
        "text": "#2c3e50",
        "sub_text": "#7f8c8d",
        "input_bg": "#f8fbfe",
        "input_fg": "#2c3e50",
        "btn": "#5fa1e6",
        "btn_fg": "#ffffff",
        "btn_sec": "#e3effb",
        "btn_sec_fg": "#5fa1e6",
        "work": "#3498db",
        "break": "#2ecc71",
        "long_break": "#9b59b6",
        "accent": "#e74c3c"
    },
    "mocha": {
        "name": "☕ リッチ・モカ (Rich Mocha)",
        "bg": "#faf7f5",
        "card": "#ffffff",
        "header": "#f2ebe6",
        "border": "#dbccbf",
        "text": "#4d3e33",
        "sub_text": "#8a7b71",
        "input_bg": "#fdfcfb",
        "input_fg": "#4d3e33",
        "btn": "#b88a65",
        "btn_fg": "#ffffff",
        "btn_sec": "#f5ece3",
        "btn_sec_fg": "#b88a65",
        "work": "#a85f40",
        "break": "#6b8e23",
        "long_break": "#795548",
        "accent": "#d35400"
    },
    "lavender": {
        "name": "🔮 ロイヤル・ラベンダー (Royal Lavender)",
        "bg": "#f9f7fa",
        "card": "#ffffff",
        "header": "#ede8f2",
        "border": "#d2c3e6",
        "text": "#3f3054",
        "sub_text": "#827596",
        "input_bg": "#fdfcff",
        "input_fg": "#3f3054",
        "btn": "#9777cd",
        "btn_fg": "#ffffff",
        "btn_sec": "#f2ebfb",
        "btn_sec_fg": "#9777cd",
        "work": "#8e44ad",
        "break": "#1abc9c",
        "long_break": "#f368e0",
        "accent": "#f39c12"
    },
    "dark": {
        "name": "🌙 ミッドナイト・ブラック (Midnight Black)",
        "bg": "#12121c",
        "card": "#1e1e2d",
        "header": "#171724",
        "border": "#36364f",
        "text": "#e0e0e6",
        "sub_text": "#8a8a9e",
        "input_bg": "#242436",
        "input_fg": "#e0e0e6",
        "btn": "#6c5ce7",
        "btn_fg": "#ffffff",
        "btn_sec": "#2c2c42",
        "btn_sec_fg": "#6c5ce7",
        "work": "#fd79a8",
        "break": "#00b894",
        "long_break": "#0984e3",
        "accent": "#fab1a0"
    },
    "glass": {
        "name": "❄️ プレミアム・グラス (Premium Glass)",
        "bg": "#f0f2f5",
        "card": "#ffffff",
        "header": "#e6eaf0",
        "border": "#d1d9e6",
        "text": "#2d3436",
        "sub_text": "#636e72",
        "input_bg": "#f8f9fa",
        "input_fg": "#2d3436",
        "btn": "#0984e3",
        "btn_fg": "#ffffff",
        "btn_sec": "#dfe6e9",
        "btn_sec_fg": "#0984e3",
        "work": "#d63031",
        "break": "#00b894",
        "long_break": "#6c5ce7",
        "accent": "#fdcb6e"
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
        "bgm_type": "none",
        "weather": "auto"
    },
    "tasks": [
        {
            "id": 1,
            "title": "今日のタスクを計画する 📝",
            "target_pomo": 1,
            "completed_pomo": 0,
            "is_done": False,
            "tag": "💼 仕事",
            "priority": "⚡ 中",
            "google_id": None
        }
    ],
    "active_task_id": 1,
    "cafe": {
        "treats": 3,
        "total_pomodoros": 0,
        "unlocked_cats": ["black"],
        "unlocked_items": ["cushion"],
        "cat_affection": {"black": 1},
        "custom_cats": [],
        "item_positions": {
            "cushion": [75, 205],
            "toy_mouse": [165, 225],
            "scratcher": [395, 175],
            "treat_bowl": [240, 225],
            "cat_tree": [390, 105]
        }
    },
    "stats": {
        "daily_history": {},
        "total_minutes": 0,
        "streak_days": 1,
        "interrupted_sessions": 0,
        "last_active_date": "",
        "session_state": {"in_progress": False, "mode": "work", "start_time": 0}
    },
    "achievements": [
        {"id": "first_pomo", "name": "はじめの一歩 🍅", "desc": "ポモドーロを1回完了する", "unlocked": False},
        {"id": "pomo_5", "name": "集中ビギナー 🌱", "desc": "累計5回のポモドーロ達成", "unlocked": False},
        {"id": "pomo_10", "name": "集中ランナー 🏃", "desc": "累計10回のポモドーロ達成", "unlocked": False},
        {"id": "pomo_25", "name": "ポモドーロ職人 🍅", "desc": "累計25回のポモドーロ達成", "unlocked": False},
        {"id": "pomo_50", "name": "集中マスター 🔥", "desc": "累計50回のポモドーロ達成", "unlocked": False},
        {"id": "pomo_100", "name": "集中レジェンド 👑", "desc": "累計100回のポモドーロ達成", "unlocked": False},
        {"id": "time_1h", "name": "1時間の集中 ⏱️", "desc": "総集中時間1時間(60分)を突破", "unlocked": False},
        {"id": "time_5h", "name": "5時間の深淵 ⏳", "desc": "総集中時間5時間を突破", "unlocked": False},
        {"id": "time_10h", "name": "10時間の鍛錬 🌟", "desc": "総集中時間10時間を突破", "unlocked": False},
        {"id": "cat_3", "name": "猫たちの友 🐾", "desc": "カフェで猫を3匹以上迎える", "unlocked": False},
        {"id": "cat_5", "name": "賑やかカフェ 🐱", "desc": "カフェで猫を5匹以上迎える", "unlocked": False},
        {"id": "cat_10", "name": "猫パラダイス 🏰", "desc": "カフェで猫を10匹以上迎える", "unlocked": False},
        {"id": "cat_collector", "name": "全猫コンプリート ✨", "desc": "全15種の猫を迎える", "unlocked": False},
        {"id": "cat_gacha", "name": "運命の出逢い 🎲", "desc": "ミステリー猫ガチャで特別な猫を迎える", "unlocked": False},
        {"id": "master_cafe", "name": "インテリアマスター 🛋️", "desc": "家具やおもちゃを3個以上設置する", "unlocked": False},
        {"id": "streak_3", "name": "三日坊主脱出 📅", "desc": "3日間連続でポモドーロ達成", "unlocked": False},
        {"id": "streak_7", "name": "習慣の達人 🔥", "desc": "7日間連続でポモドーロ達成", "unlocked": False},
        {"id": "cat_whisperer", "name": "猫の絆マスター 💖", "desc": "猫との触れ合いで親愛度を高める", "unlocked": False}
    ]
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
        self.anim_config = self._load_animation_config()

    def _load_animation_config(self):
        try:
            config_path = os.path.join(os.path.dirname(__file__), "web", "src", "shared", "cat_config.json")
            if os.path.exists(config_path):
                with open(config_path, 'r', encoding='utf-8') as f:
                    return json.load(f).get("animations", {})
        except Exception as e:
            print(f"Failed to load animation config: {e}")
        return {}

    def get_anim_config(self, state):
        # デフォルトのフォールバック値
        default_config = {"frames": 2, "speed": 18}
        return self.anim_config.get(state, default_config)

    def load_data(self):
        import copy
        if os.path.exists(self.data_path):
            try:
                with open(self.data_path, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                    merged = copy.deepcopy(DEFAULT_DATA)
                    for k, v in loaded.items():
                        if isinstance(v, dict) and k in merged and isinstance(merged[k], dict):
                            merged[k].update(v)
                        else:
                            merged[k] = copy.deepcopy(v)
                    return merged
            except Exception as e:
                print("Error loading data:", e)
        return copy.deepcopy(DEFAULT_DATA)

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

    def add_task(self, title, target_pomo=1, tag="💼 仕事", priority="⚡ 中", google_id=None):
        task_id = int(time.time() * 1000) % 1000000
        new_task = {
            "id": task_id,
            "title": title,
            "target_pomo": max(1, target_pomo),
            "completed_pomo": 0,
            "is_done": False,
            "tag": tag,
            "priority": priority,
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

    def add_active_task_time(self, seconds):
        task = self.get_active_task()
        if task:
            if "time_spent" not in task:
                task["time_spent"] = 0
            task["time_spent"] += seconds
            self.save_data()
            return task
        return None

    # --- カフェ・ショップ育成管理 ---
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
        self.check_achievements()
        self.save_data()

    def feed_cat_treat(self, cat_id):
        """猫におやつをあげて親愛度アップ"""
        if self.data["cafe"]["treats"] <= 0:
            return False, "おやつが足りません (ポモドーロを完了して獲得しよう！🐟)"
            
        self.data["cafe"]["treats"] -= 1
        aff = self.data["cafe"].setdefault("cat_affection", {})
        aff[cat_id] = min(5, aff.get(cat_id, 1) + 1)
        self.check_achievements()
        self.save_data()
        cat = next((c for c in AVAILABLE_CATS if c["id"] == cat_id), {"name": "ねこ"})
        return True, f"{cat['name']} に魚のおやつをあげました！親愛度 Lv.{aff[cat_id]} ❤️"

    def pet_cat(self, cat_id):
        """猫を撫でる"""
        aff = self.data["cafe"].setdefault("cat_affection", {})
        current = aff.get(cat_id, 1)
        self.check_achievements()
        return current

    def check_achievements(self):
        """実績達成条件の判定"""
        if "achievements" not in self.data:
            return
            
        pomo_total = self.data["cafe"].get("total_pomodoros", 0)
        unlocked_cats_count = len(self.data["cafe"].get("unlocked_cats", []))
        unlocked_items_count = len(self.data["cafe"].get("unlocked_items", []))
        total_mins = self.data.get("stats", {}).get("total_minutes", 0)
        streak = self.data.get("stats", {}).get("streak_days", 1)
        total_aff = sum(self.data["cafe"].get("cat_affection", {}).values())
        has_custom_cat = len(self.data["cafe"].get("custom_cats", [])) > 0
        
        for ach in self.data["achievements"]:
            a_id = ach["id"]
            if a_id == "first_pomo" and pomo_total >= 1:
                ach["unlocked"] = True
            elif a_id == "pomo_5" and pomo_total >= 5:
                ach["unlocked"] = True
            elif a_id == "pomo_10" and pomo_total >= 10:
                ach["unlocked"] = True
            elif a_id == "pomo_25" and pomo_total >= 25:
                ach["unlocked"] = True
            elif a_id == "pomo_50" and pomo_total >= 50:
                ach["unlocked"] = True
            elif a_id == "pomo_100" and pomo_total >= 100:
                ach["unlocked"] = True
            elif a_id == "time_1h" and total_mins >= 60:
                ach["unlocked"] = True
            elif a_id == "time_5h" and total_mins >= 300:
                ach["unlocked"] = True
            elif a_id == "time_10h" and total_mins >= 600:
                ach["unlocked"] = True
            elif a_id == "cat_3" and unlocked_cats_count >= 3:
                ach["unlocked"] = True
            elif a_id == "cat_5" and unlocked_cats_count >= 5:
                ach["unlocked"] = True
            elif a_id == "cat_10" and unlocked_cats_count >= 10:
                ach["unlocked"] = True
            elif a_id == "cat_collector" and unlocked_cats_count >= len(AVAILABLE_CATS):
                ach["unlocked"] = True
            elif a_id == "cat_gacha" and has_custom_cat:
                ach["unlocked"] = True
            elif a_id == "master_cafe" and unlocked_items_count >= 3:
                ach["unlocked"] = True
            elif a_id == "streak_3" and streak >= 3:
                ach["unlocked"] = True
            elif a_id == "streak_7" and streak >= 7:
                ach["unlocked"] = True
            elif a_id == "cat_whisperer" and total_aff >= 6:
                ach["unlocked"] = True

    # --- ポモドーロセッション＆中断（未達成）検知 ---
    def start_session(self, mode="work"):
        """タイマー開始時のセッション記録"""
        stats = self.data.setdefault("stats", {})
        stats["session_state"] = {
            "in_progress": True,
            "mode": mode,
            "start_time": time.time()
        }
        self.save_data()

    def finish_session(self):
        """ポモドーロ正常完了時のセッション終了"""
        stats = self.data.setdefault("stats", {})
        stats["session_state"] = {"in_progress": False, "mode": "work", "start_time": 0}
        self.save_data()

    def cancel_session(self, was_user_reset=True):
        """ユーザーによるリセットまたは中断"""
        stats = self.data.setdefault("stats", {})
        if stats.get("session_state", {}).get("in_progress", False):
            if stats.get("session_state", {}).get("mode") == "work":
                stats["interrupted_sessions"] = stats.get("interrupted_sessions", 0) + 1
        stats["session_state"] = {"in_progress": False, "mode": "work", "start_time": 0}
        self.save_data()

    def check_and_resolve_interrupted_session(self):
        """アプリ起動時のクラッシュ／強制終了検知（未完了のまま終了したセッションを未達成として記録）"""
        stats = self.data.setdefault("stats", {})
        state = stats.get("session_state", {})
        if state.get("in_progress", False) and state.get("mode") == "work":
            stats["interrupted_sessions"] = stats.get("interrupted_sessions", 0) + 1
            print(f"[DataManager] 前回のポモドーロが強制終了されたため、未達成として記録しました (累計中断: {stats['interrupted_sessions']}回)")
            stats["session_state"] = {"in_progress": False, "mode": "work", "start_time": 0}
            self.save_data()
            return True
        return False

    # --- 家具アイテム配置座標の保存・取得 ---
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
        self.save_data()

    # --- ガチャ / カスタム猫の登録・取得 ---
    def add_custom_cat(self, cat_info):
        """ガチャで生成された完全ランダム猫を登録"""
        custom_cats = self.data["cafe"].setdefault("custom_cats", [])
        custom_cats.append(cat_info)
        c_id = cat_info["id"]
        if c_id not in self.data["cafe"]["unlocked_cats"]:
            self.data["cafe"]["unlocked_cats"].append(c_id)
        self.data["cafe"].setdefault("cat_affection", {})[c_id] = 1
        self.check_achievements()
        self.save_data()

    def get_all_available_cats(self):
        """基本猫15種 + ガチャで生まれたカスタム猫"""
        customs = self.data["cafe"].get("custom_cats", [])
        return AVAILABLE_CATS + customs

    def get_stats_data(self):
        if "stats" not in self.data:
            self.data["stats"] = {"daily_history": {}, "total_minutes": 0, "streak_days": 1, "interrupted_sessions": 0, "last_active_date": "", "session_state": {"in_progress": False}}
        return self.data["stats"]

    def get_achievements(self):
        if "achievements" not in self.data:
            self.data["achievements"] = []
        return self.data["achievements"]

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
        self.check_achievements()
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
        self.check_achievements()
        self.save_data()
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
        self.save_data()
        return True, f"最初の相棒猫を「{cat['name']}」に設定しました！🐾"

    def get_current_theme(self):
        theme_key = self.get_setting("theme")
        return THEMES.get(theme_key, THEMES["sakura"])
