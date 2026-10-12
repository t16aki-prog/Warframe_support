FONT_MAIN = ("Meiryo", 14)
FONT_TITLE = ("Meiryo", 14, "bold")
FONT_BOLD = ("Meiryo", 12, "bold")
FONT_SUB = ("Meiryo", 11, "bold")
FONT_TEXT = ("Meiryo", 10)
GOOGLE_BLUE = "#4285f4"

def bind_mousewheel_to_all(widget, canvas):
    def _on_mousewheel(event):
        try:
            if hasattr(event, 'delta') and event.delta:
                # Windows / macOS
                canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
            elif getattr(event, 'num', None) == 5:
                # Linux scroll down
                canvas.yview_scroll(1, "units")
            elif getattr(event, 'num', None) == 4:
                # Linux scroll up
                canvas.yview_scroll(-1, "units")
        except Exception:
            pass

    def _bind_to_mousewheel(event=None):
        try:
            canvas.bind_all("<MouseWheel>", _on_mousewheel)
            canvas.bind_all("<Button-4>", _on_mousewheel)
            canvas.bind_all("<Button-5>", _on_mousewheel)
        except Exception:
            pass

    def _unbind_from_mousewheel(event=None):
        try:
            canvas.unbind_all("<MouseWheel>")
            canvas.unbind_all("<Button-4>")
            canvas.unbind_all("<Button-5>")
        except Exception:
            pass

    # Canvas & コンテナへのEnter/Leaveバインド
    canvas.bind("<Enter>", _bind_to_mousewheel, add="+")
    canvas.bind("<Leave>", _unbind_from_mousewheel, add="+")
    widget.bind("<Enter>", _bind_to_mousewheel, add="+")
    widget.bind("<Leave>", _unbind_from_mousewheel, add="+")

    def _bind_recursive(w):
        try:
            w.bind("<Enter>", _bind_to_mousewheel, add="+")
            w.bind("<Leave>", _unbind_from_mousewheel, add="+")
            w.bind("<MouseWheel>", _on_mousewheel, add="+")
        except Exception:
            pass
        for child in w.winfo_children():
            _bind_recursive(child)

    _bind_recursive(widget)


AVATAR_ICONS = {
    "black": "🐾",
    "white": "🤍",
    "gray": "🩶",
    "calico": "🌸",
    "siamese": "🐱",
    "orange": "🐯",
    "cream": "🍦",
    "ginger": "🦊",
    "tuxedo": "🎩",
    "tortoiseshell": "🍂",
    "sakura": "🌺",
    "mint": "🍃",
    "sky": "☁️",
    "lavender": "🔮",
    "golden": "✨"
}
