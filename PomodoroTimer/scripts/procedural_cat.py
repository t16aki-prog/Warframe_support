import os
import math
import numpy as np
from PIL import Image, ImageDraw

# Get cat configurations (if available, otherwise fallback)
try:
    from data_manager import AVAILABLE_CATS
    CAT_DICT = {c["id"]: c for c in AVAILABLE_CATS}
except ImportError:
    CAT_DICT = {}

def get_cat_colors(cat_id):
    c = CAT_DICT.get(cat_id, {})
    base = tuple(c.get("color_tint", (30, 30, 35)))
    
    # Calculate some derived colors
    r, g, b = base
    dark = (max(0, r-30), max(0, g-30), max(0, b-30))
    light = (min(255, r+30), min(255, g+30), min(255, b+30))
    white = (255, 255, 255)
    pink = (255, 180, 180)
    outline = (20, 20, 20)
    
    return {
        "base": base,
        "dark": dark,
        "light": light,
        "white": white,
        "pink": pink,
        "outline": outline
    }

def draw_ellipse(draw, bbox, fill, outline, width=1):
    draw.ellipse(bbox, fill=fill, outline=outline, width=width)

def draw_polygon(draw, xy, fill, outline, width=1):
    draw.polygon(xy, fill=fill, outline=outline)
    
def draw_line(draw, xy, fill, width=1):
    draw.line(xy, fill=fill, width=width)

def generate_frame(state, f_idx, cat_id):
    colors = get_cat_colors(cat_id)
    
    img = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # --- State Machine for Poses ---
    # We define relative coordinates for body parts
    # (x, y) center points, widths, heights, angles
    
    body = {"x": 24, "y": 32, "w": 20, "h": 14, "angle": 0}
    head = {"x": 34, "y": 24, "w": 14, "h": 12, "angle": 0}
    tail = {"x": 14, "y": 30, "w": 14, "h": 4, "angle": -30}
    
    legs = [
        {"x": 18, "y": 38, "w": 4, "h": 8, "angle": 0}, # back left
        {"x": 22, "y": 38, "w": 4, "h": 8, "angle": 0}, # back right
        {"x": 30, "y": 38, "w": 4, "h": 8, "angle": 0}, # front left
        {"x": 34, "y": 38, "w": 4, "h": 8, "angle": 0}, # front right
    ]
    
    ears = [
        {"x": 32, "y": 18, "dir": -1}, # left
        {"x": 38, "y": 18, "dir": 1}   # right
    ]
    
    eyes = [
        {"x": 36, "y": 24}, # right eye (visible in profile)
    ]
    
    # Modify parts based on state
    if state == "sit":
        # 遠くを見つめるように顔を背ける (facing back/profile)
        body = {"x": 24, "y": 32, "w": 16, "h": 18, "angle": 0}
        head = {"x": 28, "y": 18, "w": 14, "h": 12, "angle": 0}
        tail = {"x": 24, "y": 42, "w": 16, "h": 4, "angle": 0} # wrapped around
        legs = [
            {"x": 20, "y": 40, "w": 10, "h": 4, "angle": 0}, # back leg tucked
            {"x": 28, "y": 36, "w": 4, "h": 8, "angle": 0},  # front leg straight
        ]
        ears = [
            {"x": 24, "y": 14, "dir": -1},
            {"x": 32, "y": 14, "dir": 1}
        ]
        eyes = [] # looking away, no eyes visible!
        if f_idx == 1:
            # Ear twitch
            ears[1]["y"] += 1
            
    elif state == "walk":
        if f_idx == 0:
            legs[0]["x"] -= 2; legs[0]["angle"] = 15
            legs[1]["x"] += 2; legs[1]["angle"] = -15
            legs[2]["x"] += 2; legs[2]["angle"] = -15
            legs[3]["x"] -= 2; legs[3]["angle"] = 15
            tail["angle"] = -20
            head["y"] += 1
        else:
            legs[0]["x"] += 2; legs[0]["angle"] = -15
            legs[1]["x"] -= 2; legs[1]["angle"] = 15
            legs[2]["x"] -= 2; legs[2]["angle"] = 15
            legs[3]["x"] += 2; legs[3]["angle"] = -15
            tail["angle"] = -40
            
    elif state == "dash":
        body["w"] = 24; body["h"] = 10; body["y"] += 4
        head["x"] += 4; head["y"] += 6
        tail["angle"] = -90; tail["y"] += 6
        if f_idx == 0:
            legs[0]["x"] -= 6; legs[0]["angle"] = 45; legs[0]["y"] += 2
            legs[1]["x"] -= 4; legs[1]["angle"] = 45; legs[1]["y"] += 2
            legs[2]["x"] += 6; legs[2]["angle"] = -45; legs[2]["y"] += 2
            legs[3]["x"] += 4; legs[3]["angle"] = -45; legs[3]["y"] += 2
        else:
            # tucked in
            legs[0]["x"] += 2; legs[0]["angle"] = -30; legs[0]["y"] += 4
            legs[1]["x"] += 4; legs[1]["angle"] = -30; legs[1]["y"] += 4
            legs[2]["x"] -= 2; legs[2]["angle"] = 30; legs[2]["y"] += 4
            legs[3]["x"] -= 4; legs[3]["angle"] = 30; legs[3]["y"] += 4
            body["y"] -= 2
            
    elif state == "groom":
        body = {"x": 22, "y": 32, "w": 18, "h": 16, "angle": -10}
        head = {"x": 26, "y": 20, "w": 14, "h": 12, "angle": -20}
        tail = {"x": 14, "y": 42, "w": 14, "h": 4, "angle": 0}
        legs = [
            {"x": 18, "y": 40, "w": 10, "h": 4, "angle": 0}, # tucked
            {"x": 24, "y": 38, "w": 4, "h": 8, "angle": 0},  # grounded
        ]
        # grooming paw
        paw_y = 22 if f_idx == 0 else (20 if f_idx == 1 else 24)
        legs.append({"x": 30, "y": paw_y, "w": 6, "h": 4, "angle": -30})
        ears = [{"x": 22, "y": 14, "dir": -1}, {"x": 28, "y": 12, "dir": 1}]
        eyes = [{"x": 30, "y": 20}] # closed eye
        
    elif state == "stretch":
        body = {"x": 22, "y": 32, "w": 22, "h": 12, "angle": -15}
        head = {"x": 34, "y": 34, "w": 14, "h": 12, "angle": 10}
        tail = {"x": 12, "y": 20, "w": 4, "h": 16, "angle": 15}
        legs = [
            {"x": 14, "y": 36, "w": 4, "h": 10, "angle": 0},
            {"x": 18, "y": 36, "w": 4, "h": 10, "angle": 0},
            {"x": 38, "y": 42, "w": 8, "h": 4, "angle": 0},
            {"x": 42, "y": 42, "w": 8, "h": 4, "angle": 0},
        ]
        ears = [{"x": 30, "y": 28, "dir": -1}, {"x": 36, "y": 28, "dir": 1}]
        if f_idx == 1:
            body["w"] = 24
            head["x"] += 2
            
    elif state == "play":
        body = {"x": 24, "y": 28, "w": 16, "h": 20, "angle": -30}
        head = {"x": 36, "y": 16, "w": 14, "h": 12, "angle": -10}
        tail = {"x": 12, "y": 38, "w": 14, "h": 4, "angle": 0}
        legs = [
            {"x": 18, "y": 40, "w": 8, "h": 4, "angle": 0},
            {"x": 22, "y": 40, "w": 8, "h": 4, "angle": 0},
        ]
        paw1_y = 18 if f_idx == 0 else (14 if f_idx == 1 else 22)
        paw2_y = 22 if f_idx == 0 else (26 if f_idx == 1 else 16)
        legs.append({"x": 40, "y": paw1_y, "w": 6, "h": 4, "angle": 10})
        legs.append({"x": 36, "y": paw2_y, "w": 6, "h": 4, "angle": 20})
        ears = [{"x": 32, "y": 10, "dir": -1}, {"x": 38, "y": 8, "dir": 1}]
        eyes = [{"x": 40, "y": 16}]
        
    elif state == "pounce":
        body = {"x": 24, "y": 36, "w": 20, "h": 12, "angle": 10}
        head = {"x": 36, "y": 28, "w": 14, "h": 12, "angle": 0}
        tail = {"x": 12, "y": 36, "w": 4, "h": 12, "angle": -60}
        if f_idx == 0:
            # Wiggle
            body["x"] -= 2
            tail["angle"] = -45
            legs = [
                {"x": 16, "y": 40, "w": 8, "h": 4, "angle": 0},
                {"x": 20, "y": 40, "w": 8, "h": 4, "angle": 0},
                {"x": 32, "y": 40, "w": 8, "h": 4, "angle": 0},
                {"x": 36, "y": 40, "w": 8, "h": 4, "angle": 0},
            ]
        else:
            # Jump
            body["x"] += 4; body["y"] -= 8; body["angle"] = -20
            head["x"] += 4; head["y"] -= 8
            tail["angle"] = -90
            legs = [
                {"x": 14, "y": 34, "w": 8, "h": 4, "angle": 30},
                {"x": 18, "y": 36, "w": 8, "h": 4, "angle": 30},
                {"x": 40, "y": 28, "w": 8, "h": 4, "angle": -30},
                {"x": 44, "y": 30, "w": 8, "h": 4, "angle": -30},
            ]
        ears = [{"x": 32, "y": 22, "dir": -1}, {"x": 38, "y": 22, "dir": 1}]
        eyes = [{"x": 40, "y": 28}]
        
    elif state == "sleep_curl":
        body = {"x": 24, "y": 34, "w": 22, "h": 16, "angle": 0}
        head = {"x": 18, "y": 36, "w": 12, "h": 10, "angle": 30}
        tail = {"x": 24, "y": 40, "w": 18, "h": 6, "angle": 0}
        legs = []
        ears = [{"x": 14, "y": 30, "dir": -1}, {"x": 20, "y": 30, "dir": 1}]
        eyes = []
        if f_idx == 1:
            body["h"] += 2; body["y"] -= 1 # breathing
            
    elif state == "sleep_belly":
        body = {"x": 24, "y": 34, "w": 20, "h": 14, "angle": 0}
        head = {"x": 36, "y": 36, "w": 12, "h": 12, "angle": 90}
        tail = {"x": 10, "y": 38, "w": 12, "h": 4, "angle": 0}
        legs = [
            {"x": 16, "y": 28, "w": 4, "h": 8, "angle": 30},
            {"x": 20, "y": 26, "w": 4, "h": 8, "angle": -30},
            {"x": 28, "y": 28, "w": 4, "h": 8, "angle": 30},
            {"x": 32, "y": 26, "w": 4, "h": 8, "angle": -30},
        ]
        ears = [{"x": 40, "y": 30, "dir": 1}, {"x": 40, "y": 42, "dir": 1}]
        eyes = []
        if f_idx == 1:
            body["h"] += 1; body["y"] -= 1
            
    elif state == "sleep_stretch":
        body = {"x": 24, "y": 36, "w": 26, "h": 10, "angle": 0}
        head = {"x": 40, "y": 38, "w": 14, "h": 10, "angle": 0}
        tail = {"x": 10, "y": 38, "w": 12, "h": 4, "angle": 0}
        legs = [
            {"x": 12, "y": 42, "w": 8, "h": 4, "angle": 0},
            {"x": 36, "y": 42, "w": 8, "h": 4, "angle": 0},
        ]
        ears = [{"x": 36, "y": 34, "dir": -1}, {"x": 42, "y": 34, "dir": 1}]
        eyes = []
        if f_idx == 1:
            body["y"] -= 1

    # --- Render Geometry ---
    
    # We define a helper to draw rotated ellipses
    def draw_rotated_ellipse(x, y, w, h, angle, fill, outline=None):
        if angle == 0:
            draw_ellipse(draw, [x-w/2, y-h/2, x+w/2, y+h/2], fill, outline)
        else:
            # Draw on a temp larger image, rotate, and paste with mask
            temp = Image.new("RGBA", (int(w*2), int(h*2)), (0,0,0,0))
            tdraw = ImageDraw.Draw(temp)
            tdraw.ellipse([w/2, h/2, w/2+w, h/2+h], fill=fill, outline=outline)
            temp = temp.rotate(angle, resample=Image.Resampling.BICUBIC, center=(w, h))
            img.alpha_composite(temp, dest=(int(x-w), int(y-h)))

    # Render Tail
    draw_rotated_ellipse(tail["x"], tail["y"], tail["w"], tail["h"], tail.get("angle", 0), colors["base"], colors["outline"])
    
    # Render Back Legs
    for i, leg in enumerate(legs):
        if i < 2:
            draw_rotated_ellipse(leg["x"], leg["y"], leg["w"], leg["h"], leg.get("angle", 0), colors["dark"], colors["outline"])
            
    # Render Body
    draw_rotated_ellipse(body["x"], body["y"], body["w"], body["h"], body.get("angle", 0), colors["base"], colors["outline"])
    
    # Render Calico / Specific Patterns on Body
    if cat_id == "calico":
        draw_rotated_ellipse(body["x"]-body["w"]/4, body["y"]-body["h"]/4, body["w"]/2, body["h"]/2, body.get("angle", 0), colors["white"], None)
        draw_rotated_ellipse(body["x"]+body["w"]/6, body["y"]-body["h"]/3, body["w"]/2, body["h"]/2, body.get("angle", 0), (40, 40, 40), None)
    elif cat_id == "white":
        pass
    elif cat_id == "siamese":
        pass 
    elif cat_id == "tuxedo":
        draw_rotated_ellipse(body["x"], body["y"]+body["h"]/4, body["w"]/2, body["h"]/2, body.get("angle", 0), colors["white"], None)

    # Render Front Legs
    for i, leg in enumerate(legs):
        if i >= 2:
            draw_rotated_ellipse(leg["x"], leg["y"], leg["w"], leg["h"], leg.get("angle", 0), colors["base"], colors["outline"])

    # Render Head
    draw_rotated_ellipse(head["x"], head["y"], head["w"], head["h"], head.get("angle", 0), colors["base"], colors["outline"])
    
    # Face patterns
    if cat_id == "siamese":
        draw_rotated_ellipse(head["x"], head["y"], head["w"]/2, head["h"]/2, 0, colors["dark"], None)
    elif cat_id == "tuxedo":
        draw_polygon(draw, [(head["x"]-head["w"]/2, head["y"]+head["h"]/2), (head["x"]+head["w"]/2, head["y"]+head["h"]/2), (head["x"], head["y"])], colors["white"], None)

    # Render Ears
    for ear in ears:
        ex, ey = ear["x"], ear["y"]
        ew, eh = 6, 6
        draw_polygon(draw, [(ex-ew/2, ey+eh/2), (ex+ew/2, ey+eh/2), (ex, ey-eh/2)], colors["base"], colors["outline"])
        draw_polygon(draw, [(ex-ew/4, ey+eh/2), (ex+ew/4, ey+eh/2), (ex, ey)], colors["pink"], None)

    # Render Eyes
    for eye in eyes:
        draw_ellipse(draw, [eye["x"]-1, eye["y"]-1, eye["x"]+1, eye["y"]+1], colors["white"], (0, 0, 0))

    return img

def generate_procedural_cat_poses(cat_type):
    poses = {}
    
    states_def = {
        "sit": 2,
        "walk": 2,
        "dash": 2,
        "groom": 3,
        "stretch": 2,
        "play": 3,
        "pounce": 2,
        "sleep_curl": 2,
        "sleep_belly": 2,
        "sleep_stretch": 2,
        "sleep": 2,
        "awake": 2
    }
    
    for state, frames in states_def.items():
        base_state = state
        if state == "sleep": base_state = "sleep_curl"
        if state == "awake": base_state = "walk"
        
        for f in range(frames):
            img_r = generate_frame(base_state, f, cat_type)
            img_l = img_r.transpose(Image.FLIP_LEFT_RIGHT)
            
            if state.startswith("sleep"):
                poses[f"{state}_{f}"] = img_r
            else:
                poses[f"{state}_r_{f}"] = img_r
                poses[f"{state}_l_{f}"] = img_l
                
            if state == "sit" and f == 0:
                poses["sit_r"] = img_r
                poses["sit_l"] = img_l

    return poses
