import time
import threading
import psutil
import tkinter as tk

# Configuration (設定)
UPDATE_INTERVAL = 1.0  # seconds (速度を更新する間隔・秒)
WARNING_THRESHOLD_MBPS = 1.0  # Mbps (文字が赤くなる警告しきい値)

class NetworkMonitorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("NetMonitor")
        
        # 枠なし、常に最前面に表示 (Borderless and always on top)
        self.root.overrideredirect(True)
        self.root.attributes("-topmost", True)
        self.root.attributes("-alpha", 0.85) # 少し透明にする (Slight transparency)
        
        # 画面の右下あたりに初期配置 (Initial position)
        screen_width = root.winfo_screenwidth()
        screen_height = root.winfo_screenheight()
        self.root.geometry(f"+{screen_width - 150}+{screen_height - 150}")
        self.root.configure(bg='black')

        self.label = tk.Label(
            root, 
            text="計測中...", 
            font=("Consolas", 11, "bold"), 
            fg="white", 
            bg="black",
            padx=10,
            pady=8
        )
        self.label.pack()

        # ドラッグで移動できるようにする (Enable dragging)
        self.offset_x = 0
        self.offset_y = 0
        self.label.bind("<Button-1>", self.click_window)
        self.label.bind("<B1-Motion>", self.drag_window)
        
        # 右クリックメニュー (Right-click menu)
        self.menu = tk.Menu(self.root, tearoff=0)
        self.menu.add_command(label="終了", command=self.quit_app)
        self.label.bind("<Button-3>", self.show_menu)
        
        self.running = True
        self.max_recv = 0
        self.max_sent = 0
        self.monitor_thread = threading.Thread(target=self.get_network_speed, daemon=True)
        self.monitor_thread.start()

    def click_window(self, event):
        self.offset_x = event.x
        self.offset_y = event.y

    def drag_window(self, event):
        x = self.root.winfo_pointerx() - self.offset_x
        y = self.root.winfo_pointery() - self.offset_y
        self.root.geometry(f"+{x}+{y}")

    def show_menu(self, event):
        self.menu.post(event.x_root, event.y_root)

    def quit_app(self):
        self.running = False
        self.root.quit()

    def get_network_speed(self):
        io = psutil.net_io_counters()
        bytes_recv_old = io.bytes_recv
        bytes_sent_old = io.bytes_sent
        
        while self.running:
            time.sleep(UPDATE_INTERVAL)
            io_new = psutil.net_io_counters()
            
            bytes_recv_new = io_new.bytes_recv
            bytes_sent_new = io_new.bytes_sent
            
            recv_speed = (bytes_recv_new - bytes_recv_old) / UPDATE_INTERVAL
            sent_speed = (bytes_sent_new - bytes_sent_old) / UPDATE_INTERVAL
            
            self.max_recv = max(self.max_recv, recv_speed)
            self.max_sent = max(self.max_sent, sent_speed)
            
            bytes_recv_old = bytes_recv_new
            bytes_sent_old = bytes_sent_new
            
            recv_mbps = (recv_speed * 8) / (1024 * 1024)
            
            def format_speed(speed_bytes):
                if speed_bytes < 1024 * 1024:
                    return f"{speed_bytes / 1024:6.1f} KB/s"
                else:
                    return f"{speed_bytes / (1024 * 1024):6.1f} MB/s"
            
            recv_str = format_speed(recv_speed)
            sent_str = format_speed(sent_speed)
            max_recv_str = format_speed(self.max_recv).strip()
            max_sent_str = format_speed(self.max_sent).strip()
            
            display_text = f"↓ {recv_str} (Max: {max_recv_str})\n↑ {sent_str} (Max: {max_sent_str})"
            
            # 速度がしきい値を下回った場合は文字を赤くする (Change color to red if slow)
            if recv_mbps < WARNING_THRESHOLD_MBPS:
                color = "#ff5555" # 赤 (Red)
            else:
                color = "#55ff55" # 緑 (Green)

            # GUIの更新をメインスレッドに安全に渡す (Update GUI safely)
            try:
                self.root.after(0, self.update_label, display_text, color)
            except Exception:
                pass

    def update_label(self, text, color):
        self.label.config(text=text, fg=color)

if __name__ == "__main__":
    root = tk.Tk()
    app = NetworkMonitorApp(root)
    root.mainloop()
