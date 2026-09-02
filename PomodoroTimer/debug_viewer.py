import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk
import os
import json
import sys

# Ensure local imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scripts.natural_cat_generator import generate_cat_poses
from data_manager import AVAILABLE_CATS

class CatDebugViewer:
    def __init__(self, root):
        self.root = root
        self.root.title("Cat Animation Debugger")
        self.root.geometry("400x500")

        self.anim_tick = 0
        self.current_state = "walk"
        self.facing = "r"
        self.cat_type = "black"

        self.textures = {}
        self.anim_config = self.load_config()

        self._load_sprites()
        self._build_ui()
        self._animate()

    def load_config(self):
        try:
            with open("web/src/shared/cat_config.json", "r", encoding="utf-8") as f:
                return json.load(f).get("animations", {})
        except Exception:
            return {}

    def get_anim_config(self, state):
        cfg = self.anim_config.get(state, {})
        return {
            "frames": cfg.get("frames", 2),
            "speed": cfg.get("speed", 18)
        }

    def _load_sprites(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        base_sprites_dir = os.path.join(base_dir, "assets", "base_sprites")
        
        def load_or_fallback(fname, fallback):
            fpath = os.path.join(base_sprites_dir, fname)
            if os.path.exists(fpath):
                return Image.open(fpath).convert("RGBA")
            return fallback

        awake_path = os.path.join(base_sprites_dir, "cat_awake.png")
        if os.path.exists(awake_path):
            base_awake = Image.open(awake_path).convert("RGBA")
        else:
            base_awake = Image.new("RGBA", (48, 48))
            
        sleep_path = os.path.join(base_sprites_dir, "cat_sleep.png")
        if os.path.exists(sleep_path):
            base_sleep = Image.open(sleep_path).convert("RGBA")
        else:
            base_sleep = Image.new("RGBA", (48, 48))

        base_pose_images = {
            "awake": base_awake,
            "sleep": base_sleep,
            "walk_0": load_or_fallback("cat_walk_0.png", base_awake),
            "walk_1": load_or_fallback("cat_walk_1.png", base_awake),
            "dash_0": load_or_fallback("cat_dash_0.png", base_awake),
            "dash_1": load_or_fallback("cat_dash_1.png", base_awake),
            "groom": load_or_fallback("cat_groom.png", base_awake),
            "stretch_0": load_or_fallback("cat_stretch_0.png", base_awake),
            "stretch_1": load_or_fallback("cat_stretch_1.png", base_awake),
            "play": load_or_fallback("cat_play.png", base_awake),
            "pounce": load_or_fallback("cat_pounce.png", base_awake),
            "sleep_belly": load_or_fallback("cat_sleep_belly.png", base_sleep),
            "sleep_stretch": load_or_fallback("cat_sleep_stretch.png", base_sleep)
        }

        print(f"Generating textures for {self.cat_type}...")
        raw_poses = generate_cat_poses(base_pose_images, base_sleep, self.cat_type)
        
        # Scale up images 3x for debugging
        self.textures = {}
        for k, v in raw_poses.items():
            scaled = v.resize((v.width * 3, v.height * 3), Image.Resampling.NEAREST)
            self.textures[k] = ImageTk.PhotoImage(scaled)
        print("Done.")

    def _build_ui(self):
        ctrl_frame = tk.Frame(self.root, pady=10)
        ctrl_frame.pack(fill="x")

        # Cat type
        tk.Label(ctrl_frame, text="Cat Type:").grid(row=0, column=0, padx=5, pady=2)
        self.cat_var = tk.StringVar(value=self.cat_type)
        cat_ids = [c["id"] for c in AVAILABLE_CATS]
        cat_combo = ttk.Combobox(ctrl_frame, textvariable=self.cat_var, values=cat_ids, state="readonly", width=12)
        cat_combo.grid(row=0, column=1, padx=5, pady=2)
        cat_combo.bind("<<ComboboxSelected>>", self.on_cat_change)

        # Facing
        tk.Label(ctrl_frame, text="Facing:").grid(row=0, column=2, padx=5, pady=2)
        self.facing_var = tk.StringVar(value=self.facing)
        facing_combo = ttk.Combobox(ctrl_frame, textvariable=self.facing_var, values=["r", "l"], state="readonly", width=5)
        facing_combo.grid(row=0, column=3, padx=5, pady=2)
        facing_combo.bind("<<ComboboxSelected>>", self.on_facing_change)

        # Canvas
        self.canvas = tk.Canvas(self.root, width=150, height=150, bg="#2d2d30", highlightthickness=2, highlightbackground="#555")
        self.canvas.pack(pady=10)
        self.cat_id = self.canvas.create_image(75, 75, anchor="center")

        # States
        states_frame = tk.LabelFrame(self.root, text="Select Animation State", padx=10, pady=10)
        states_frame.pack(fill="both", expand=True, padx=10, pady=10)

        states = ["sit", "walk", "dash", "groom", "stretch", "play", "pounce", "sleep_curl", "sleep_belly", "sleep_stretch"]
        
        r, c = 0, 0
        for s in states:
            btn = tk.Button(states_frame, text=s, width=12, command=lambda st=s: self.set_state(st))
            btn.grid(row=r, column=c, padx=5, pady=5)
            c += 1
            if c > 1:
                c = 0
                r += 1

    def on_cat_change(self, event):
        self.cat_type = self.cat_var.get()
        self._load_sprites()

    def on_facing_change(self, event):
        self.facing = self.facing_var.get()

    def set_state(self, state):
        self.current_state = state
        self.anim_tick = 0  # Reset animation on state change
        print(f"State set to: {state}")

    def _animate(self):
        self.anim_tick += 1
        cfg = self.get_anim_config(self.current_state)
        
        if self.current_state == "sit":
            frame_key = f"sit_{self.facing}"
        elif self.current_state.startswith("sleep"):
            f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
            frame_key = f"{self.current_state}_{f_idx}"
        else:
            f_idx = (self.anim_tick // cfg["speed"]) % cfg["frames"]
            frame_key = f"{self.current_state}_{self.facing}_{f_idx}"

        img = self.textures.get(frame_key)
        if img:
            self.canvas.itemconfig(self.cat_id, image=img)
        else:
            print(f"Warning: Missing texture for {frame_key}")

        # 60 FPS update
        self.root.after(16, self._animate)

if __name__ == "__main__":
    root = tk.Tk()
    app = CatDebugViewer(root)
    root.mainloop()
