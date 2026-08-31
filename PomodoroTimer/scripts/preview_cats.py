import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from pomodoro import colorize_cat
from data_manager import AVAILABLE_CATS

base_dir = os.path.dirname(os.path.abspath(__file__))
awake_png = os.path.join(base_dir, "cat_awake.png")
sleep_png = os.path.join(base_dir, "cat_sleep.png")

img_aw = Image.open(awake_png).convert("RGBA")
img_sl = Image.open(sleep_png).convert("RGBA")

# 15種類の猫を 5x3 のグリッド画像として保存
grid_w, grid_h = 5, 3
thumb_size = 120
sheet = Image.new("RGBA", (grid_w * thumb_size, grid_h * thumb_size + 40), (245, 240, 245, 255))
draw = ImageDraw.Draw(sheet)

for idx, cat in enumerate(AVAILABLE_CATS):
    col = idx % grid_w
    row = idx // grid_w
    x = col * thumb_size
    y = row * thumb_size
    
    tex_aw = colorize_cat(img_aw, cat["id"]).resize((thumb_size - 10, thumb_size - 10), Image.Resampling.LANCZOS)
    sheet.paste(tex_aw, (x + 5, y + 5), tex_aw)
    draw.text((x + 10, y + thumb_size - 18), cat["name"].split()[0], fill=(50, 50, 60, 255))

preview_path = os.path.join(base_dir, "cats_preview.png")
sheet.save(preview_path)
print(f"Generated cats preview sheet: {preview_path}")
