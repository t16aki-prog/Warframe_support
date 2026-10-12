import tkinter as tk

class MiniWidget:
    """デスクトップ常駐ミニウィジェット管理クラス"""
    def __init__(self, app):
        self.app = app
        self.widget = tk.Toplevel(app.root)
        self.widget.overrideredirect(True)
        self.widget.attributes("-topmost", True)
        self.widget.attributes("-alpha", 0.94)
        self.widget.configure(bg=app.theme["border"])
        self.widget.withdraw()

        screen_w = app.root.winfo_screenwidth()
        screen_h = app.root.winfo_screenheight()
        self.widget.geometry(f"+{screen_w - 290}+{screen_h - 100}")

        self.widget_bar = tk.Frame(self.widget, bg=app.theme["bg"], padx=8, pady=4, cursor="hand2")
        self.widget_bar.pack(fill='both', expand=True, padx=1, pady=1)

        if app.image_loader.has_images and "sleep" in app.image_loader.widget_cat_frames:
            self.widget_cat = tk.Label(self.widget_bar, image=app.image_loader.widget_cat_frames["sleep"][0], bg=app.theme["bg"])
        else:
            self.widget_cat = tk.Label(self.widget_bar, text="(=^・^=)", font=("Meiryo", 9), fg=app.theme["accent"], bg=app.theme["bg"])
        self.widget_cat.pack(side='left', padx=(0, 4))

        self.widget_label = tk.Label(
            self.widget_bar,
            text=app.format_time(app.timer.time_left),
            font=("Comic Sans MS", 14, "bold"),
            fg=app.theme["work"],
            bg=app.theme["bg"]
        )
        self.widget_label.pack(side='left', padx=(0, 5))

        self.widget_center_box = tk.Frame(self.widget_bar, bg=app.theme["bg"])
        self.widget_center_box.pack(side='left', fill='y', padx=(0, 4))

        self.widget_status = tk.Label(self.widget_center_box, text="おしごと", font=("Meiryo", 7, "bold"), fg=app.theme["work"], bg=app.theme["bg"], anchor='w')
        self.widget_status.pack(anchor='w')

        self.widget_task = tk.Label(self.widget_center_box, text="タスクなし", font=("Meiryo", 7), fg=app.theme["text"], bg=app.theme["bg"], anchor='w')
        self.widget_task.pack(anchor='w')

        self.widget_play_btn = tk.Button(
            self.widget_bar, text="▶", font=("Segoe UI", 9, "bold"),
            bg=app.theme["btn"], fg=app.theme["btn_fg"], relief="flat", padx=5, pady=0,
            cursor="hand2", command=app.toggle_timer
        )
        self.widget_play_btn.pack(side='right', padx=(2, 0))

        # コンテキストメニュー
        self.menu = tk.Menu(app.root, tearoff=0)
        self.menu.add_command(label="アプリを開く (復帰)", command=self.restore_from_widget)
        self.menu.add_command(label="タイマー開始 / 停止", command=app.toggle_timer)
        self.menu.add_separator()
        self.menu.add_command(label="終了 (Quit)", command=app.quit_app)

        # ウィンドウ移動 & クリックイベント
        self.offset_x = 0
        self.offset_y = 0
        bind_widgets = (self.widget, self.widget_bar, self.widget_cat, self.widget_label, self.widget_center_box, self.widget_status, self.widget_task)
        for w in bind_widgets:
            w.bind("<Button-1>", self.click_window)
            w.bind("<B1-Motion>", self.drag_window)
            w.bind("<Double-Button-1>", lambda e: self.restore_from_widget())
            w.bind("<Button-3>", self.show_menu)

        app.root.bind("<Unmap>", self.on_minimize)
        app.root.bind("<Map>", self.on_restore)

    def restore_from_widget(self):
        self.app.root.deiconify()
        self.app.root.state('normal')
        self.app.root.lift()
        self.widget.withdraw()

    def click_window(self, event):
        self.offset_x = event.x
        self.offset_y = event.y

    def drag_window(self, event):
        x = self.widget.winfo_pointerx() - self.offset_x
        y = self.widget.winfo_pointery() - self.offset_y
        self.widget.geometry(f"+{x}+{y}")

    def show_menu(self, event):
        self.menu.post(event.x_root, event.y_root)

    def on_minimize(self, event):
        if event.widget == self.app.root and self.app.root.state() == "iconic":
            self.widget.deiconify()

    def on_restore(self, event):
        if event.widget == self.app.root and self.app.root.state() == "normal":
            self.widget.withdraw()

    def update_theme(self, theme):
        """ウィジェットの配色更新"""
        self.widget.configure(bg=theme["border"])
        self.widget_bar.configure(bg=theme["bg"])
        self.widget_cat.configure(bg=theme["bg"])
        self.widget_label.configure(bg=theme["bg"])
        self.widget_center_box.configure(bg=theme["bg"])
        self.widget_status.configure(bg=theme["bg"])
        self.widget_task.configure(bg=theme["bg"], fg=theme["text"])
        self.widget_play_btn.configure(bg=theme["btn"], fg=theme["btn_fg"])

    def update_cat_image(self, is_sleep):
        """ウィジェットの猫アイコンを更新"""
        if hasattr(self.app.image_loader, 'widget_cat_frames') and self.app.image_loader.widget_cat_frames:
            frame_set = self.app.image_loader.widget_cat_frames["sleep"] if is_sleep else self.app.image_loader.widget_cat_frames["awake"]
            self.widget_cat.config(image=frame_set[0])
