import os
from PIL import Image, ImageDraw

def create_cushion_sprite():
    img = Image.new("RGBA", (48, 36), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Shadow
    d.ellipse([4, 18, 44, 34], fill=(0, 0, 0, 45))
    # Outer Cushion
    d.ellipse([4, 6, 44, 30], fill=(255, 195, 210, 255), outline=(210, 130, 150, 255), width=2)
    # Inner Puff
    d.ellipse([10, 10, 38, 26], fill=(255, 225, 235, 255))
    # Button center
    d.ellipse([22, 16, 26, 20], fill=(230, 140, 165, 255))
    # Button stitches
    d.line([16, 18, 32, 18], fill=(210, 130, 150, 255), width=1)
    d.line([24, 12, 24, 24], fill=(210, 130, 150, 255), width=1)
    return img

def create_toy_mouse_sprite():
    img = Image.new("RGBA", (40, 28), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Shadow
    d.ellipse([6, 16, 32, 26], fill=(0, 0, 0, 45))
    # Tail
    d.arc([22, 4, 38, 22], start=220, end=40, fill=(255, 170, 190, 255), width=2)
    # Body
    d.polygon([(8, 16), (26, 8), (28, 22)], fill=(160, 165, 175, 255), outline=(100, 105, 115, 255))
    # Nose
    d.ellipse([6, 14, 10, 18], fill=(255, 150, 170, 255))
    # Eye
    d.ellipse([14, 12, 17, 15], fill=(30, 30, 35, 255))
    # Ear
    d.ellipse([20, 7, 26, 14], fill=(255, 180, 195, 255), outline=(130, 135, 145, 255), width=1)
    return img

def create_scratcher_sprite():
    img = Image.new("RGBA", (36, 60), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Shadow
    d.ellipse([2, 48, 34, 58], fill=(0, 0, 0, 45))
    # Base
    d.ellipse([4, 46, 32, 56], fill=(165, 120, 85, 255), outline=(120, 80, 50, 255), width=2)
    # Pole Post
    d.rectangle([13, 10, 23, 48], fill=(225, 205, 160, 255), outline=(175, 150, 105, 255), width=1)
    # Sisal rope lines
    for y in range(12, 48, 3):
        d.line([13, y, 23, y+1], fill=(185, 160, 115, 255), width=1)
    # Top Cap
    d.ellipse([11, 6, 25, 14], fill=(185, 140, 95, 255), outline=(135, 95, 60, 255), width=1)
    # Hanging feather ball
    d.line([12, 10, 6, 22], fill=(190, 190, 190, 255), width=1)
    d.ellipse([4, 22, 9, 27], fill=(255, 100, 130, 255))
    return img

def create_treat_bowl_sprite():
    img = Image.new("RGBA", (40, 28), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Shadow
    d.ellipse([4, 14, 36, 26], fill=(0, 0, 0, 45))
    # Outer Bowl
    d.ellipse([4, 6, 36, 22], fill=(70, 160, 225, 255), outline=(40, 110, 175, 255), width=2)
    # Bowl Rim
    d.ellipse([6, 7, 34, 18], fill=(235, 245, 255, 255))
    # Fish Food Pellets
    d.ellipse([11, 10, 29, 16], fill=(215, 145, 75, 255))
    d.ellipse([14, 11, 20, 15], fill=(245, 180, 90, 255))
    d.ellipse([21, 11, 27, 15], fill=(245, 180, 90, 255))
    # Paw print on bowl
    d.ellipse([18, 17, 22, 20], fill=(255, 255, 255, 220))
    d.ellipse([16, 15, 18, 17], fill=(255, 255, 255, 220))
    d.ellipse([22, 15, 24, 17], fill=(255, 255, 255, 220))
    return img

def create_cat_tree_sprite():
    img = Image.new("RGBA", (64, 84), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Shadow
    d.ellipse([4, 68, 60, 82], fill=(0, 0, 0, 45))
    # Base Box
    d.rounded_rectangle([10, 52, 54, 76], radius=4, fill=(195, 160, 125, 255), outline=(145, 110, 75, 255), width=2)
    # Cat Door in box
    d.ellipse([24, 58, 40, 74], fill=(65, 45, 30, 255))
    # Main Pillar
    d.rectangle([27, 16, 37, 52], fill=(225, 205, 160, 255), outline=(175, 150, 105, 255), width=1)
    for y in range(18, 52, 4):
        d.line([27, y, 37, y+1], fill=(185, 160, 115, 255), width=1)
    # Middle Platform
    d.rounded_rectangle([4, 38, 32, 46], radius=3, fill=(215, 180, 145, 255), outline=(155, 120, 85, 255), width=1)
    # Top Platform / Bed
    d.ellipse([14, 6, 50, 22], fill=(245, 210, 180, 255), outline=(165, 130, 95, 255), width=2)
    d.ellipse([18, 9, 46, 19], fill=(255, 235, 215, 255))
    # Hanging mouse toy
    d.line([44, 20, 48, 32], fill=(180, 180, 180, 255), width=1)
    d.ellipse([46, 32, 52, 38], fill=(255, 140, 160, 255))
    return img

def main():
    base_dir = os.path.join("PomodoroTimer", "assets", "furniture_sprites")
    web_dir = os.path.join("PomodoroTimer", "web", "public", "furniture")
    os.makedirs(base_dir, exist_ok=True)
    os.makedirs(web_dir, exist_ok=True)
    
    sprites = {
        "cushion.png": create_cushion_sprite(),
        "toy_mouse.png": create_toy_mouse_sprite(),
        "scratcher.png": create_scratcher_sprite(),
        "treat_bowl.png": create_treat_bowl_sprite(),
        "cat_tree.png": create_cat_tree_sprite()
    }
    
    for name, img in sprites.items():
        p1 = os.path.join(base_dir, name)
        p2 = os.path.join(web_dir, name)
        img.save(p1, "PNG")
        img.save(p2, "PNG")
        print(f"Saved {name}: {img.size}")
        
    print("All furniture sprites created successfully!")

if __name__ == "__main__":
    main()
