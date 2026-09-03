import os
import sys
import tkinter as tk

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pomodoro import PomodoroApp

def test_full_ui():
    root = tk.Tk()
    root.withdraw()
    app = PomodoroApp(root)
    
    # 1. Check all tab switching
    for tab_id in ["cafe", "task", "shop", "stats", "settings"]:
        app.show_tab(tab_id)
        root.update()
        print(f"[UI Test] Tab '{tab_id}' rendered successfully.")
        
    # 2. Check task tab filtering and task items
    app.show_tab("task")
    app.task_tab_obj.set_task_filter("done")
    app.task_tab_obj.set_task_filter("all")
    app.task_tab_obj.set_task_filter("active")
    root.update()
    print("[UI Test] Task filtering and rendering OK.")

    # 3. Check layout edit mode in cafe tab
    app.show_tab("cafe")
    app.cafe_tab_obj.toggle_layout_edit_mode()
    app.cafe_tab_obj.toggle_layout_edit_mode()
    root.update()
    print("[UI Test] Layout edit mode OK.")

    # 4. Check shop preview modal
    app.show_tab("shop")
    app.shop_tab_obj.open_cat_preview_modal("calico", "三毛猫")
    root.update()
    for w in root.winfo_children():
        if isinstance(w, tk.Toplevel):
            w.destroy()
    root.update()
    print("[UI Test] Shop preview modal OK.")

    # 5. Check stats tab rendering
    app.show_tab("stats")
    app.stats_tab_obj.refresh_view()
    root.update()
    print("[UI Test] Stats tab rendering OK.")

    root.destroy()
    print("All UI integration tests passed successfully!")

if __name__ == "__main__":
    test_full_ui()
