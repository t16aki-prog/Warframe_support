import os
import sys
from PIL import Image

_cur_dir = os.path.dirname(os.path.abspath(__file__))
_parent_dir = os.path.dirname(_cur_dir)
if _cur_dir not in sys.path:
    sys.path.insert(0, _cur_dir)
if _parent_dir not in sys.path:
    sys.path.insert(0, _parent_dir)

from data_manager import AVAILABLE_CATS
from scripts.natural_cat_generator import generate_cat_poses

def regenerate():
    base_dir = os.path.join(_parent_dir, "assets", "base_sprites")
    sprites_dir = os.path.join(_parent_dir, "sprites")
    web_sprites_dir = os.path.join(_parent_dir, "web", "public", "sprites")
    
    os.makedirs(sprites_dir, exist_ok=True)
    os.makedirs(web_sprites_dir, exist_ok=True)
    
    def load_img(fname):
        return Image.open(os.path.join(base_dir, fname)).convert("RGBA")
        
    base_pose_images = {
        "awake": load_img("cat_awake.png"),
        "sleep": load_img("cat_sleep.png"),
        "walk_0": load_img("cat_walk_0.png"),
        "walk_1": load_img("cat_walk_1.png"),
        "sit": load_img("cat_sit.png"),
        "dash_0": load_img("cat_dash_0.png"),
        "dash_1": load_img("cat_dash_1.png"),
        "groom": load_img("cat_groom.png"),
        "stretch_0": load_img("cat_stretch_0.png"),
        "stretch_1": load_img("cat_stretch_1.png"),
        "play": load_img("cat_play.png"),
        "pounce": load_img("cat_pounce.png"),
        "sleep_belly": load_img("cat_sleep_belly.png"),
        "sleep_stretch": load_img("cat_sleep_stretch.png")
    }
    
    for cat_info in AVAILABLE_CATS:
        c_id = cat_info["id"]
        print(f"Generating clean sprites for: {c_id}...")
        poses = generate_cat_poses(base_pose_images, None, c_id)
        
        target_dir = os.path.join(sprites_dir, c_id)
        web_target_dir = os.path.join(web_sprites_dir, c_id)
        os.makedirs(target_dir, exist_ok=True)
        os.makedirs(web_target_dir, exist_ok=True)
        
        for pose_name, img in poses.items():
            out_path = os.path.join(target_dir, f"{pose_name}.png")
            img.save(out_path, "PNG")
            web_out_path = os.path.join(web_target_dir, f"{pose_name}.png")
            img.save(web_out_path, "PNG")
            
    print("All sprites successfully regenerated without distortions!")

if __name__ == "__main__":
    regenerate()
