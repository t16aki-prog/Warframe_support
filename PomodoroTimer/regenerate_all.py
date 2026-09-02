import os
import sys
from PIL import Image

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from data_manager import AVAILABLE_CATS
from scripts.natural_cat_generator import generate_cat_poses

base_dir = r"e:\Oasobi\PomodoroTimer"
sprites_dir = os.path.join(base_dir, "sprites")
web_sprites_dir = os.path.join(base_dir, "web", "public", "sprites")

os.makedirs(sprites_dir, exist_ok=True)
os.makedirs(web_sprites_dir, exist_ok=True)

base_sprites_dir = os.path.join(base_dir, "assets", "base_sprites")
awake_png = os.path.join(base_sprites_dir, "cat_awake.png")
sleep_png = os.path.join(base_sprites_dir, "cat_sleep.png")

def load_or_fallback(fname, fallback):
    fpath = os.path.join(base_sprites_dir, fname)
    if os.path.exists(fpath):
        return Image.open(fpath).convert("RGBA")
    return fallback

base_awake = Image.open(awake_png).convert("RGBA")
base_sleep = Image.open(sleep_png).convert("RGBA")

base_pose_images = {
    "awake": base_awake,
    "sleep": base_sleep,
    "walk_0": load_or_fallback("cat_walk_0.png", base_awake),
    "walk_1": load_or_fallback("cat_walk_1.png", base_awake),
    "dash": load_or_fallback("cat_dash.png", base_awake),
    "groom": load_or_fallback("cat_groom.png", base_awake),
    "stretch": load_or_fallback("cat_stretch.png", base_awake),
    "play": load_or_fallback("cat_play.png", base_awake),
    "pounce": load_or_fallback("cat_pounce.png", base_awake),
    "sleep_belly": load_or_fallback("cat_sleep_belly.png", base_sleep),
    "sleep_stretch": load_or_fallback("cat_sleep_stretch.png", base_sleep)
}

print("Regenerating all sprites...")

for cat_info in AVAILABLE_CATS:
    c_id = cat_info["id"]
    print(f"  -> {c_id}")
    poses = generate_cat_poses(base_pose_images, None, c_id)
    
    cat_sprites_dir = os.path.join(sprites_dir, c_id)
    os.makedirs(cat_sprites_dir, exist_ok=True)
    
    web_cat_sprites_dir = os.path.join(web_sprites_dir, c_id)
    os.makedirs(web_cat_sprites_dir, exist_ok=True)
    
    for pose_name, img in poses.items():
        if "pounce" in pose_name:
            continue
        fname = f"{pose_name}.png"
        img.save(os.path.join(cat_sprites_dir, fname))
        img.save(os.path.join(web_cat_sprites_dir, fname))

print("Done!")
