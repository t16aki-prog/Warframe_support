FONT_MAIN = ("Meiryo", 14)
FONT_TITLE = ("Meiryo", 14, "bold")
FONT_BOLD = ("Meiryo", 12, "bold")
FONT_SUB = ("Meiryo", 11, "bold")
FONT_TEXT = ("Meiryo", 10)
GOOGLE_BLUE = "#4285f4"

def bind_mousewheel_to_all(widget, canvas):
    def _on_mousewheel(event):
        canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        
    def _bind_recursive(w):
        try:
            w.bind("<MouseWheel>", _on_mousewheel, add="+")
        except Exception:
            pass
        for child in w.winfo_children():
            _bind_recursive(child)
            
    _bind_recursive(widget)
    canvas.bind("<MouseWheel>", _on_mousewheel, add="+")

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
