import unittest
import os
import sys
import tkinter as tk

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data_manager import DataManager, AVAILABLE_CATS, AVAILABLE_ITEMS
from google_sync import GoogleSyncManager
from scripts.natural_cat_generator import generate_and_save_custom_gacha_sprites

class TestFeatureExpansion(unittest.TestCase):
    def setUp(self):
        self.data_mgr = DataManager(os.path.join(os.path.dirname(__file__), "test_pomo_data.json"))

    def tearDown(self):
        fpath = os.path.join(os.path.dirname(__file__), "test_pomo_data.json")
        if os.path.exists(fpath):
            try:
                os.remove(fpath)
            except Exception:
                pass

    def test_session_interruption_tracking(self):
        """統計: 中断セッションの検知と記録"""
        self.data_mgr.start_session("work")
        state = self.data_mgr.data["stats"]["session_state"]
        self.assertTrue(state["in_progress"])
        self.assertEqual(state["mode"], "work")
        
        # クラッシュ検知
        resolved = self.data_mgr.check_and_resolve_interrupted_session()
        self.assertTrue(resolved)
        self.assertEqual(self.data_mgr.data["stats"]["interrupted_sessions"], 1)
        self.assertFalse(self.data_mgr.data["stats"]["session_state"]["in_progress"])

    def test_custom_cat_and_gacha(self):
        """ショップ: 100おやつRGBガチャとカスタム猫登録"""
        custom_id = "test_custom_cat"
        palette = {
            "base_color": (120, 200, 255),
            "pattern_type": "stripes",
            "pattern_color": (40, 80, 160)
        }
        poses = generate_and_save_custom_gacha_sprites(custom_id, palette)
        self.assertIn("sit_r", poses)
        self.assertIn("walk_r_0", poses)
        self.assertIn("dash_r_0", poses)
        
        cat_info = {
            "id": custom_id,
            "name": "オーロラねこ 🎲",
            "cost": 0,
            "color_tint": (120, 200, 255),
            "desc": "テスト用カスタム猫"
        }
        self.data_mgr.add_custom_cat(cat_info)
        all_cats = self.data_mgr.get_all_available_cats()
        self.assertTrue(any(c["id"] == custom_id for c in all_cats))

    def test_furniture_positions(self):
        """家具: 座標保存・取得"""
        self.data_mgr.set_item_position("cushion", 120, 210)
        positions = self.data_mgr.get_item_positions()
        self.assertEqual(positions["cushion"], [120, 210])

    def test_achievements_expansion(self):
        """統計: 実績判定の拡張"""
        self.data_mgr.data["cafe"]["total_pomodoros"] = 10
        self.data_mgr.check_achievements()
        achs = {a["id"]: a["unlocked"] for a in self.data_mgr.get_achievements()}
        self.assertTrue(achs.get("first_pomo"))
        self.assertTrue(achs.get("pomo_5"))
        self.assertTrue(achs.get("pomo_10"))

    def test_google_sync_methods(self):
        """Google連携: インポート・お試し同期メソッド"""
        gs = GoogleSyncManager(os.path.dirname(__file__))
        ok, msg = gs.enable_easy_demo_sync()
        self.assertTrue(ok)
        tasks = gs.fetch_tasks()
        self.assertGreaterEqual(len(tasks), 1)

if __name__ == "__main__":
    unittest.main()
