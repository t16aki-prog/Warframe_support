"""猫カフェ・ポモドーロ (Pomodoro Timer) エントリーポイント
"""
import os
import sys
import tkinter as tk

# Windowsコンソールでの絵文字エンコードエラー防止
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# パス解決
_base_dir = os.path.dirname(os.path.abspath(__file__))
if _base_dir not in sys.path:
    sys.path.insert(0, _base_dir)

from ui.app_window import PomodoroApp


def main():
    print("\n" + "=" * 52)
    print(" 🐾 猫カフェ・ポモドーロ (Pomodoro Timer) 起動中 🐾")
    print("=" * 52)
    print("  🖥️  デスクトップ版 : 起動完了")
    print("  🌐 Web版 URL      : http://localhost:3000")
    print("  💡 Web版起動コマンド: cd PomodoroTimer/web && npm run dev")
    print("=" * 52 + "\n", flush=True)

    root = tk.Tk()
    app = PomodoroApp(root, base_dir=_base_dir)
    try:
        root.mainloop()
    except (KeyboardInterrupt, SystemExit):
        app.quit_app()
        sys.exit(0)


if __name__ == "__main__":
    main()
