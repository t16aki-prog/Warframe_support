import tkinter as tk
from ui.utils import FONT_TITLE, FONT_SUB, FONT_TEXT, AVATAR_ICONS

class HeaderView:
    """ヘッダーおよびタブバー管理クラス"""
    def __init__(self, app):
        self.app = app
        self.tab_buttons = {}
        self._build_header()
        self._build_tab_bar()

    def _build_header(self):
        self.header_frame = tk.Frame(self.app.root, bg=self.app.theme["header"], pady=6, padx=12)
        self.header_frame.pack(fill='x')

        self.header_title_label = tk.Label(
            self.header_frame, text="🐾 猫カフェ・ポモドーロ",
            font=FONT_TITLE, fg=self.app.theme["text"], bg=self.app.theme["header"]
        )
        self.header_title_label.pack(side='left')

        self.right_frame = tk.Frame(self.header_frame, bg=self.app.theme["header"])
        self.right_frame.pack(side='right')

        treats = self.app.data_mgr.get_cafe_data()['treats']
        self.treat_label = tk.Label(
            self.right_frame, text=f"🐟 {treats}個",
            font=FONT_SUB, fg=self.app.theme["accent"], bg=self.app.theme["header"]
        )
        self.treat_label.pack(side='left', padx=6)

        prof = self.app.data_mgr.get_profile()
        icon = AVATAR_ICONS.get(prof.get("avatar", "black"), "🐾")
        self.account_btn = tk.Button(
            self.right_frame, text=f"{icon} {prof['name'][:8]}", font=FONT_TEXT,
            bg=self.app.theme["card"], fg=self.app.theme["text"], relief="flat", padx=8, pady=2,
            cursor="hand2", command=lambda: self.app.task_tab_obj.open_account_modal()
        )
        self.account_btn.pack(side='left', padx=4)

    def _build_tab_bar(self):
        self.tab_bar = tk.Frame(self.app.root, bg=self.app.theme["bg"], pady=5)
        self.tab_bar.pack(fill='x', padx=10)

        tab_defs = [
            ("cafe", "🐾 カフェ"),
            ("task", "📋 タスク"),
            ("shop", "🎁 ショップ"),
            ("stats", "📊 統計"),
            ("settings", "⚙️ 設定")
        ]

        for tab_id, text in tab_defs:
            btn = tk.Button(
                self.tab_bar, text=text, font=FONT_SUB,
                bg=self.app.theme["card"], fg=self.app.theme["text"], relief="flat", padx=6, pady=4,
                cursor="hand2", command=lambda t=tab_id: self.app.show_tab(t)
            )
            btn.pack(side='left', expand=True, fill='x', padx=2)
            self.tab_buttons[tab_id] = btn

    def update_treat_display(self):
        treats = self.app.data_mgr.get_cafe_data()['treats']
        self.treat_label.config(text=f"🐟 {treats}個")

    def update_profile_display(self):
        prof = self.app.data_mgr.get_profile()
        icon = AVATAR_ICONS.get(prof.get("avatar", "black"), "🐾")
        self.account_btn.config(text=f"{icon} {prof['name'][:8]}")

    def update_theme(self, theme):
        self.header_frame.configure(bg=theme["header"])
        self.header_title_label.configure(bg=theme["header"], fg=theme["text"])
        self.right_frame.configure(bg=theme["header"])
        self.treat_label.configure(bg=theme["header"], fg=theme["accent"])
        self.account_btn.configure(bg=theme["card"], fg=theme["text"])
        self.tab_bar.configure(bg=theme["bg"])
