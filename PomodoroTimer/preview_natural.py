import os
from PIL import Image, ImageDraw
import numpy as np
from natural_cat_generator import generate_natural_cat
from data_manager import AVAILABLE_CATS

base_dir = os.path.dirname(os.path.abspath(__file__))
awake_png = os.path.join(base_dir, "cat_awake.png")
sleep_png = os.path.join(base_dir, "cat_sleep.png")

img_aw = Image.open(awake_png).convert("RGBA")
img_sl = Image.open(sleep_png).convert("RGBA")

grid_w, grid_h = 5, 3
thumb_size = 120
sheet_aw = Image.new("RGBA", (grid_w * thumb_size, grid_h * thumb_size), (245, 240, 245, 255))
sheet_sl = Image.new("RGBA", (grid_w * thumb_size, grid_h * thumb_size), (245, 240, 245, 255))

for idx, cat in enumerate(AVAILABLE_CATS):
    col = idx % grid_w
    row = idx // grid_w
    x = col * thumb_size
    y = row * thumb_size
    
    t_aw = generate_natural_cat(img_aw, cat["id"]).resize((thumb_size - 10, thumb_size - 10), Image.Resampling.LANCZOS)
    t_sl = generate_natural_cat(img_sl, cat["id"]).resize((thumb_size - 10, thumb_size - 10), Image.Resampling.LANCZOS)
    
    sheet_aw.paste(t_aw, (x + 5, y + 5), t_aw)
    sheet_sl.paste(t_sl, (x + 5, y + 5), t_sl)

sheet_aw.save(os.path.join(base_dir, "natural_awake_preview.png"))
sheet_sl.save(os.path.join(base_dir, "natural_sleep_preview.png"))
print("Generated natural cat previews successfully!")
