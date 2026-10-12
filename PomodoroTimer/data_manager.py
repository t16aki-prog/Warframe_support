"""PomodoroTimer 統合データ管理ファサード (DataManager)

各責務に分割されたモジュール (StorageManager, TaskManager, CafeManager, StatsManager)
を統括し、既存のコードおよび外部インターフェースに対する完全な後方互換性を提供します。
"""

from data.constants import THEMES, DEFAULT_DATA, AVAILABLE_CATS, AVAILABLE_ITEMS
from data.storage import StorageManager
from data.task_manager import TaskManager
from data.stats_manager import StatsManager
from data.cafe_manager import CafeManager


class DataManager:
    """設定、タスク、猫カフェデータ、アカウントプロファイルの永続化管理ファサード"""

    def __init__(self, data_path=None):
        self._storage = StorageManager(data_path)
        self._stats = StatsManager(self._storage)
        self._tasks = TaskManager(self._storage)
        self._cafe = CafeManager(self._storage, self._stats, self.get_setting)

    @property
    def data_path(self):
        return self._storage.data_path

    @property
    def data(self):
        return self._storage.data

    @property
    def anim_config(self):
        return self._storage.anim_config

    def get_anim_config(self, state):
        return self._storage.get_anim_config(state)

    def load_data(self):
        return self._storage.load_data()

    def save_data(self):
        self._storage.save_data()

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

    def get_current_theme(self):
        theme_key = self.get_setting("theme")
        return THEMES.get(theme_key, THEMES["sakura"])

    # --- タスク管理 (TaskManagerへ委譲) ---
    def get_tasks(self):
        return self._tasks.get_tasks()

    def add_task(self, title, target_pomo=1, tag="💼 仕事", priority="⚡ 中", google_id=None):
        return self._tasks.add_task(title, target_pomo, tag, priority, google_id)

    def delete_task(self, task_id):
        self._tasks.delete_task(task_id)

    def toggle_task_done(self, task_id):
        return self._tasks.toggle_task_done(task_id)

    def get_active_task(self):
        return self._tasks.get_active_task()

    def set_active_task(self, task_id):
        self._tasks.set_active_task(task_id)

    def increment_active_task_pomo(self):
        return self._tasks.increment_active_task_pomo()

    def add_active_task_time(self, seconds):
        return self._tasks.add_active_task_time(seconds)

    # --- カフェ・ショップ育成管理 (CafeManagerへ委譲) ---
    def get_cafe_data(self):
        return self._cafe.get_cafe_data()

    def add_pomodoro_reward(self):
        self._cafe.add_pomodoro_reward()

    def feed_cat_treat(self, cat_id):
        return self._cafe.feed_cat_treat(cat_id)

    def pet_cat(self, cat_id):
        return self._cafe.pet_cat(cat_id)

    def get_item_positions(self):
        return self._cafe.get_item_positions()

    def set_item_position(self, item_id, x, y):
        self._cafe.set_item_position(item_id, x, y)

    def add_custom_cat(self, cat_info):
        self._cafe.add_custom_cat(cat_info)

    def get_all_available_cats(self):
        return self._cafe.get_all_available_cats()

    def unlock_cat(self, cat_id):
        return self._cafe.unlock_cat(cat_id)

    def unlock_item(self, item_id):
        return self._cafe.unlock_item(item_id)

    def set_starter_cat(self, cat_id):
        return self._cafe.set_starter_cat(cat_id)

    # --- 統計・セッション・実績 (StatsManagerへ委譲) ---
    def start_session(self, mode="work"):
        self._stats.start_session(mode)

    def finish_session(self):
        self._stats.finish_session()

    def cancel_session(self, was_user_reset=True):
        self._stats.cancel_session(was_user_reset)

    def check_and_resolve_interrupted_session(self):
        return self._stats.check_and_resolve_interrupted_session()

    def get_stats_data(self):
        return self._stats.get_stats_data()

    def get_achievements(self):
        return self._stats.get_achievements()

    def check_achievements(self):
        self._stats.check_achievements()
