from tkinter import ttk

class ThemeManager:
    """TTK スタイルおよびテーマ適用管理クラス"""
    @staticmethod
    def update_ttk_styles(root, theme):
        """TTK ウィジェット（Combobox, Spinbox, Scrollbar）のテーマスタイルを更新"""
        style = ttk.Style(root)
        try:
            style.theme_use('clam')
        except Exception:
            pass

        t = theme

        # Combobox
        style.configure(
            "TCombobox",
            fieldbackground=t["input_bg"],
            background=t["card"],
            foreground=t["input_fg"],
            arrowcolor=t["text"],
            darkcolor=t["border"],
            lightcolor=t["border"],
            bordercolor=t["border"],
            padding=3
        )
        style.map(
            "TCombobox",
            fieldbackground=[("readonly", t["input_bg"])],
            foreground=[("readonly", t["input_fg"])],
            selectbackground=[("readonly", t["btn"])],
            selectforeground=[("readonly", t["btn_fg"])]
        )

        # Spinbox
        style.configure(
            "TSpinbox",
            fieldbackground=t["input_bg"],
            background=t["card"],
            foreground=t["input_fg"],
            arrowcolor=t["text"],
            darkcolor=t["border"],
            lightcolor=t["border"],
            bordercolor=t["border"],
            padding=3
        )
        style.map(
            "TSpinbox",
            fieldbackground=[("readonly", t["input_bg"])],
            foreground=[("readonly", t["input_fg"])]
        )

        # Scrollbar
        style.configure(
            "Vertical.TScrollbar",
            background=t["card"],
            troughcolor=t["bg"],
            bordercolor=t["bg"],
            arrowcolor=t["text"],
            gripcount=0
        )
        style.map(
            "Vertical.TScrollbar",
            background=[("active", t["btn"]), ("pressed", t["border"])]
        )

        # Listbox colors
        root.option_add('*TCombobox*Listbox.background', t["card"])
        root.option_add('*TCombobox*Listbox.foreground', t["text"])
        root.option_add('*TCombobox*Listbox.selectBackground', t["btn"])
        root.option_add('*TCombobox*Listbox.selectForeground', t["btn_fg"])
