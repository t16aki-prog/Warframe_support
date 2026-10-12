"""PomodoroTimer セッション統計・中断検知・実績管理モジュール"""

import time
from .constants import AVAILABLE_CATS


class StatsManager:
    """ポモドーロ実行セッション状態、未達成・中断検知、および実績達成判定を担当"""

    def __init__(self, storage):
        self.storage = storage

    @property
    def data(self):
        return self.storage.data

    def start_session(self, mode="work"):
        """タイマー開始時のセッション記録"""
        stats = self.data.setdefault("stats", {})
        stats["session_state"] = {
            "in_progress": True,
            "mode": mode,
            "start_time": time.time()
        }
        self.storage.save_data()

    def finish_session(self):
        """ポモドーロ正常完了時のセッション終了"""
        stats = self.data.setdefault("stats", {})
        stats["session_state"] = {"in_progress": False, "mode": "work", "start_time": 0}
        self.storage.save_data()

    def cancel_session(self, was_user_reset=True):
        """ユーザーによるリセットまたは中断"""
        stats = self.data.setdefault("stats", {})
        if stats.get("session_state", {}).get("in_progress", False):
            if stats.get("session_state", {}).get("mode") == "work":
                stats["interrupted_sessions"] = stats.get("interrupted_sessions", 0) + 1
        stats["session_state"] = {"in_progress": False, "mode": "work", "start_time": 0}
        self.storage.save_data()

    def check_and_resolve_interrupted_session(self):
        """アプリ起動時のクラッシュ／強制終了検知（未完了のまま終了したセッションを未達成として記録）"""
        stats = self.data.setdefault("stats", {})
        state = stats.get("session_state", {})
        if state.get("in_progress", False) and state.get("mode") == "work":
            stats["interrupted_sessions"] = stats.get("interrupted_sessions", 0) + 1
            print(f"[DataManager] 前回のポモドーロが強制終了されたため、未達成として記録しました (累計中断: {stats['interrupted_sessions']}回)")
            stats["session_state"] = {"in_progress": False, "mode": "work", "start_time": 0}
            self.storage.save_data()
            return True
        return False

    def get_stats_data(self):
        if "stats" not in self.data:
            self.data["stats"] = {
                "daily_history": {},
                "total_minutes": 0,
                "streak_days": 1,
                "interrupted_sessions": 0,
                "last_active_date": "",
                "session_state": {"in_progress": False}
            }
        return self.data["stats"]

    def get_achievements(self):
        if "achievements" not in self.data:
            self.data["achievements"] = []
        return self.data["achievements"]

    def check_achievements(self):
        """実績達成条件の判定"""
        if "achievements" not in self.data:
            return

        pomo_total = self.data.get("cafe", {}).get("total_pomodoros", 0)
        unlocked_cats_count = len(self.data.get("cafe", {}).get("unlocked_cats", []))
        unlocked_items_count = len(self.data.get("cafe", {}).get("unlocked_items", []))
        total_mins = self.data.get("stats", {}).get("total_minutes", 0)
        streak = self.data.get("stats", {}).get("streak_days", 1)
        total_aff = sum(self.data.get("cafe", {}).get("cat_affection", {}).values())
        has_custom_cat = len(self.data.get("cafe", {}).get("custom_cats", [])) > 0

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
