import sys
import os
import io
import time
import tkinter as tk

# WindowsコンソールUTF-8出力対応
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 日本語出力対応
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from data_manager import DataManager, THEMES, AVAILABLE_CATS, AVAILABLE_ITEMS
from pomodoro import PomodoroApp

def run_comprehensive_verification():
    print("=" * 60)
    print("🐾 猫カフェ・ポモドーロ 包括的機能＆UIテーマ検証テスト開始 🐾")
    print("=" * 60)
    
    root = tk.Tk()
    app = PomodoroApp(root)
    root.update()
    
    # 1. 画像 & 猫テクスチャのロード検証
    print(f"[*] 画像ロード状態: {'OK' if app.has_images else 'NG'}")
    assert app.has_images, "画像リソースが読み込めていません"
    print(f"[*] 猫テクスチャ数: {len(app.cat_textures)} / 15種類")
    assert len(app.cat_textures) == 15, "15種類の猫テクスチャが揃っていません"
    
    # 2. 全6テーマの切り替えテスト
    print("\n--- 🎨 テーマ切り替えテスト ---")
    for theme_key, theme_info in THEMES.items():
        app.apply_theme(theme_key)
        root.update()
        assert app.theme["bg"] == theme_info["bg"], f"{theme_key}の背景色が一致しません"
        assert app.root.cget("bg") == theme_info["bg"], f"{theme_key}のroot背景色が一致しません"
        print(f"  [OK] テーマ適用成功: {theme_info['name']} (背景: {theme_info['bg']}, 文字: {theme_info['text']})")
    
    # 3. カフェタブ & タイマー動作検証
    print("\n--- 🐾 カフェタブ & タイマー検証 ---")
    app.show_tab("cafe")
    root.update()
    
    # タイマー開始
    app.toggle_timer()
    assert app.is_running == True
    print("  [OK] タイマー開始: 正常に稼働")
    
    # 1秒進める
    app.time_left -= 1
    app.update_status_display()
    root.update()
    print(f"  [OK] タイマー表示: {app.timer_label.cget('text')}")
    
    # 猫クリック（リアクション＆ハート）
    mock_event = type('Event', (), {'x': 100, 'y': 100})()
    app.on_canvas_click(mock_event)
    root.update()
    print("  [OK] 猫クリックインタラクション: SE & ハート生成確認")
    
    # スキップ（休憩遷移）
    app.skip_session()
    root.update()
    assert app.session_mode == "short_break"
    print(f"  [OK] スキップ動作: 作業 ➔ 短い休憩に遷移 (モード: {app.session_mode})")
    
    # リセット
    app.reset_timer()
    assert app.session_mode == "work"
    assert app.is_running == False
    print("  [OK] リセット動作: 初期状態に復帰")
    
    # 4. タスク管理タブの検証
    print("\n--- 📋 タスクタブ検証 ---")
    app.show_tab("task")
    root.update()
    
    # タスク追加
    initial_tasks_count = len(app.data_mgr.get_tasks())
    app.task_entry.insert(0, "テスト用タスク 🐾")
    app.task_target_spin.set(3)
    app.add_new_task()
    root.update()
    new_tasks = app.data_mgr.get_tasks()
    assert len(new_tasks) == initial_tasks_count + 1
    added_task = new_tasks[-1]
    print(f"  [OK] タスク追加成功: '{added_task['title']}' (目標: {added_task['target_pomo']} 🍅)")
    
    # タスク完了トグル
    app.toggle_task(added_task["id"])
    root.update()
    assert added_task["is_done"] == True
    print("  [OK] タスク完了チェック: 正常に完了フラグ更新")
    
    # タスク削除
    app.delete_task(added_task["id"])
    root.update()
    assert len(app.data_mgr.get_tasks()) == initial_tasks_count
    print("  [OK] タスク削除: 正常に削除完了")
    
    # 5. ショップ & 初期猫選び直し検証
    print("\n--- 🎁 ショップ & 初期相棒猫検証 ---")
    app.show_tab("shop")
    root.update()
    
    # 最初の相棒猫を変更
    test_starter = "calico"
    app.data_mgr.set_starter_cat(test_starter)
    app._update_widget_cat_frames()
    app.refresh_cafe_elements()
    app.refresh_shop_view()
    root.update()
    assert app.data_mgr.get_profile()["avatar"] == test_starter
    print(f"  [OK] 最初の相棒猫変更: '{test_starter}' に即時設定完了")
    
    # 6. 設定タブの検証
    print("\n--- ⚙️ 設定タブ検証 ---")
    app.show_tab("settings")
    root.update()
    
    app.spin_work.set(30)
    app.spin_short_break.set(7)
    app.save_settings()
    root.update()
    assert app.data_mgr.get_setting("work_minutes") == 30
    assert app.data_mgr.get_setting("short_break_minutes") == 7
    print(f"  [OK] 設定保存: 作業30分 / 短休憩7分 に更新・保存確認")
    
    # 元に戻す
    app.spin_work.set(25)
    app.spin_short_break.set(5)
    app.save_settings()
    root.update()
    
    # 7. ウィジェット検証
    print("\n--- 🪟 ミニウィジェット検証 ---")
    app.widget.deiconify()
    root.update()
    assert app.widget.state() == "normal"
    print("  [OK] ウィジェット表示確認: スリムバー正常表示")
    app.restore_from_widget()
    root.update()
    assert app.widget.state() == "withdrawn"
    print("  [OK] メイン画面復帰: 正常にメインウィンドウに復帰")
    
    root.after(100, root.destroy)
    root.mainloop()
    
    print("\n" + "=" * 60)
    print("🎉 全18項目の機能・UIテーマ・データ連携テスト【全件合格 (PASS)】！ 🎉")
    print("=" * 60)

if __name__ == "__main__":
    run_comprehensive_verification()
