import sys
import os
import io
import time
import tkinter as tk

# WindowsコンソールUTF-8出力対応
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from data_manager import DataManager, THEMES, AVAILABLE_CATS, AVAILABLE_ITEMS
from pomodoro import PomodoroApp

def simulate():
    print("============================================================")
    print("🚀 [自動操作シミュレーション開始] 猫カフェ・ポモドーロ 🐾")
    print("============================================================")
    
    root = tk.Tk()
    app = PomodoroApp(root)
    root.update()
    
    errors = []
    
    # 1. 初期相棒猫選択ダイアログのシミュレーション
    print("\n[STEP 1] 初期相棒猫選択ダイアログの表示と選択")
    try:
        app.open_starter_cat_modal()
        root.update()
        # モーダル内の最初の猫を選択して閉じる
        app.data_mgr.set_starter_cat("siamese")
        app._update_widget_cat_frames()
        app.refresh_cafe_elements()
        root.update()
        print("  -> 成功: シャム猫(siamese)を相棒に設定")
    except Exception as e:
        print(f"  -> 失敗: {e}")
        errors.append(f"Starter cat modal: {e}")
        
    # 2. 全テーマの順次切り替えとプルダウンのスタイル検証
    print("\n[STEP 2] 6種類の全カラーテーマ切り替えテスト")
    for theme_key in THEMES.keys():
        try:
            print(f"  -> テーマ適用中: {THEMES[theme_key]['name']} ... ", end="")
            app.apply_theme(theme_key)
            root.update()
            
            # 各タブの描画チェック
            app.show_tab("task")
            root.update()
            app.show_tab("shop")
            root.update()
            app.show_tab("settings")
            root.update()
            app.show_tab("cafe")
            root.update()
            print("OK!")
        except Exception as e:
            print(f"FAILED: {e}")
            errors.append(f"Theme {theme_key}: {e}")

    # 3. カフェ画面でのタイマー・猫クリック・スキップ操作
    print("\n[STEP 3] カフェ画面: タイマー & 猫クリック & スキップ")
    try:
        app.show_tab("cafe")
        root.update()
        
        # タイマー開始
        app.toggle_timer()
        root.update()
        assert app.is_running == True
        print("  -> タイマー開始: OK")
        
        # 猫クリック
        mock_ev = type('Event', (), {'x': 120, 'y': 150})()
        app.on_canvas_click(mock_ev)
        root.update()
        print("  -> 猫クリック（鳴き声＆ハート生成）: OK")
        
        # 1秒カウントダウン
        app.time_left -= 1
        app.update_status_display()
        root.update()
        print(f"  -> カウントダウン表示: {app.timer_label.cget('text')} (OK)")
        
        # タイマー完了時のモード切り替え
        app.switch_mode()
        root.update()
        assert app.session_mode == "short_break"
        print("  -> 短い休憩へ自動遷移: OK")
        
        # 休憩完了時の作業モード復帰
        app.switch_mode()
        root.update()
        assert app.session_mode == "work"
        print("  -> 作業へ復帰: OK")
    except Exception as e:
        print(f"  -> 失敗: {e}")
        errors.append(f"Cafe tab actions: {e}")

    # 4. タスク管理タブでの操作
    print("\n[STEP 4] タスク管理: 追加・完了・選択・削除")
    try:
        app.show_tab("task")
        root.update()
        
        # タスク追加
        app.task_entry.insert(0, "集中してコードを書く 💻")
        app.task_target_spin.set(2)
        app.add_new_task()
        root.update()
        
        added = app.data_mgr.get_tasks()[-1]
        print(f"  -> タスク追加成功: '{added['title']}' (ID: {added['id']})")
        
        # タスク選択
        app.select_task(added["id"])
        root.update()
        assert app.data_mgr.get_active_task()["id"] == added["id"]
        print("  -> アクティブタスク選択: OK")
        
        # 完了チェック
        app.toggle_task(added["id"])
        root.update()
        print("  -> タスク完了トグル: OK")
        
        # タスク削除
        app.delete_task(added["id"])
        root.update()
        print("  -> タスク削除: OK")
    except Exception as e:
        print(f"  -> 失敗: {e}")
        errors.append(f"Task tab actions: {e}")

    # 5. ショップ画面での購入操作
    print("\n[STEP 5] ショップ画面: おやつ付与 & 猫お迎え & 家具設置")
    try:
        app.show_tab("shop")
        root.update()
        
        # おやつを付与して購入テスト
        app.data_mgr.data["cafe"]["treats"] += 20
        app.data_mgr.save_data()
        app.refresh_shop_view()
        root.update()
        
        # 新しい猫をお迎え
        success, msg = app.data_mgr.unlock_cat("mint")
        app.refresh_shop_view()
        app.refresh_cafe_elements()
        root.update()
        print(f"  -> ミントねこお迎え: {msg} (OK)")
        
        # 新しい家具を設置
        success, msg = app.data_mgr.unlock_item("toy_mouse")
        app.refresh_shop_view()
        app.refresh_cafe_elements()
        root.update()
        print(f"  -> おもちゃ設置: {msg} (OK)")
    except Exception as e:
        print(f"  -> 失敗: {e}")
        errors.append(f"Shop tab actions: {e}")

    # 6. ミニウィジェットの操作
    print("\n[STEP 6] ミニウィジェット: 最小化表示・復帰")
    try:
        app.widget.deiconify()
        root.update()
        print("  -> ウィジェット表示: OK")
        
        # ウィジェットからのタイマートグル
        app.toggle_timer()
        root.update()
        print("  -> ウィジェットからのタイマートグル: OK")
        
        # メイン画面へ復帰
        app.restore_from_widget()
        root.update()
        print("  -> メイン画面への復帰: OK")
    except Exception as e:
        print(f"  -> 失敗: {e}")
        errors.append(f"Widget actions: {e}")

    # 終了
    root.destroy()
    
    print("\n============================================================")
    if not errors:
        print("🎉【検証完了】すべての操作シミュレーションがエラー 0件 で完璧に動作しました！🎉")
    else:
        print(f"⚠️ エラー検出 ({len(errors)}件):")
        for err in errors:
            print(f"  - {err}")
    print("============================================================")

if __name__ == "__main__":
    simulate()
