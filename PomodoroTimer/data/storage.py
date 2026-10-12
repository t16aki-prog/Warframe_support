"""PomodoroTimer データ永続化・ファイルI/O管理モジュール"""

import os
import json
import copy
from .constants import DEFAULT_DATA


class StorageManager:
    """JSONファイルストレージおよび設定ファイルの読み書きを担当"""

    def __init__(self, data_path=None):
        if data_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_path = os.path.join(base_dir, "pomodoro_data.json")
        self.data_path = data_path
        self.data = self.load_data()
        self.anim_config = self._load_animation_config()

    def _load_animation_config(self):
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            config_path = os.path.join(base_dir, "web", "src", "shared", "cat_config.json")
            if os.path.exists(config_path):
                with open(config_path, 'r', encoding='utf-8') as f:
                    return json.load(f).get("animations", {})
        except Exception as e:
            print(f"Failed to load animation config: {e}")
        return {}

    def get_anim_config(self, state):
        default_config = {"frames": 2, "speed": 18}
        return self.anim_config.get(state, default_config)

    def load_data(self):
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
