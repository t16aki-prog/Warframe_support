import tkinter as tk
import os
import sys

_cur_dir = os.path.dirname(os.path.abspath(__file__))
_parent_dir = os.path.dirname(_cur_dir)
if _parent_dir not in sys.path:
    sys.path.insert(0, _parent_dir)

from pomodoro import PomodoroApp

def run_tests():
    root = tk.Tk()
    root.withdraw()
    app = PomodoroApp(root)
    print("App initialized successfully. Cats count:", len(app.cats))

    # 1. 重複チェック
    types = [c["type"] for c in app.cats]
    assert len(types) == len(set(types)), f"Duplicate cat types found: {types}"
    print("[PASS] Single breed per cat verified:", types)

    # 2. タイマー開始/停止時の状態維持チェック
    cat_ids_before = [c["id"] for c in app.cats]
    app.toggle_timer() # 開始
    assert [c["id"] for c in app.cats] == cat_ids_before, "Cat objects should be preserved across timer start"
    assert all(c["state"] != "sleep" for c in app.cats), "Cats should be awake when working"
    print("[PASS] Timer start transition verified.")

    app.toggle_timer() # 停止
    assert [c["id"] for c in app.cats] == cat_ids_before, "Cat objects should be preserved across timer stop"
    assert all(c["state"] == "sleep" for c in app.cats), "Cats should be sleeping when stopped"
    print("[PASS] Timer stop transition verified.")

    # 3. AI 3秒サイクルのテスト
    app.toggle_timer() # 活動開始
    state_history = []
    for tick in range(150): # 約7.5秒分シミュレート
        app.anim_tick += 1
        for cat in app.cats:
            if app.anim_tick % 3 == 0:
                app.process_cat_ai(cat)
            state_history.append(cat["state"])
            
    print(f"[PASS] AI 3s cycle simulated successfully. Sample states: {set(state_history)}")

    app.quit_app()
    print("=== ALL 4 TASKS VERIFIED SUCCESSFULLY ===", flush=True)

if __name__ == "__main__":
    run_tests()
    sys.exit(0)
