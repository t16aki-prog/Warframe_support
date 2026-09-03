import tkinter as tk
from tkinter import ttk, messagebox
from ui.utils import FONT_MAIN, FONT_BOLD, FONT_SUB, FONT_TEXT, bind_mousewheel_to_all
from data_manager import AVAILABLE_CATS, AVAILABLE_ITEMS

class ShopTab:
    def __init__(self, app):
        self.app = app
        tab = tk.Frame(self.app.content_frame, bg=self.app.theme["bg"])
        self.app.tabs["shop"] = tab
        
        container = tk.Frame(tab, bg=self.app.theme["bg"])
        container.pack(fill='both', expand=True)
        
        self.shop_canvas = tk.Canvas(container, bg=self.app.theme["bg"], highlightthickness=0)
        self.shop_scrollbar = ttk.Scrollbar(container, orient="vertical", command=self.shop_canvas.yview)
        self.shop_inner = tk.Frame(self.shop_canvas, bg=self.app.theme["bg"])
        
        self.shop_inner.bind("<Configure>", lambda e: self.shop_canvas.configure(scrollregion=self.shop_canvas.bbox("all")))
        self.shop_win = self.shop_canvas.create_window((0, 0), window=self.shop_inner, anchor="nw")
        self.shop_canvas.bind("<Configure>", lambda e: self.shop_canvas.itemconfig(self.shop_win, width=e.width))
        
        self.shop_canvas.configure(yscrollcommand=self.shop_scrollbar.set)
        self.shop_canvas.pack(side="left", fill="both", expand=True)
        self.shop_scrollbar.pack(side="right", fill="y")
        
        bind_mousewheel_to_all(self.shop_inner, self.shop_canvas)

    def refresh_view(self):
        for widget in self.shop_inner.winfo_children():
            widget.destroy()
            
        self.shop_canvas.config(bg=self.app.theme["bg"])
        self.shop_inner.config(bg=self.app.theme["bg"])
        
        cafe_data = self.app.data_mgr.get_cafe_data()
        treats = cafe_data["treats"]
        
        banner = tk.Frame(self.shop_inner, bg=self.app.theme["card"], padx=12, pady=10, relief="groove", bd=1)
        banner.pack(fill='x', pady=5, padx=4)
        tk.Label(banner, text="🎁 カフェショップ & 育成", font=FONT_SUB, bg=self.app.theme["card"], fg=self.app.theme["text"]).pack(anchor='w')
        tk.Label(banner, text="ポモドーロを1回完了するごとに おやつ🐟 が1つもらえます！\nおやつを集めて新しい猫や家具をアンロックしよう！", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["sub_text"], justify='left').pack(anchor='w', pady=(2, 6))
        
        starter_btn = tk.Button(
            banner, text="🐾 最初の相棒猫を選び直す (無料)", font=FONT_BOLD,
            bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"], relief="flat", padx=10, pady=4, cursor="hand2",
            command=self.app.open_starter_cat_modal
        )
        starter_btn.pack(anchor='w')
        
        tk.Label(self.shop_inner, text="🐾 新しい猫を迎える", font=FONT_SUB, bg=self.app.theme["bg"], fg=self.app.theme["text"]).pack(anchor='w', pady=(10, 2), padx=4)
        
        unlocked_cats = cafe_data.get("unlocked_cats", ["black"])
        for cat in AVAILABLE_CATS:
            c_id = cat["id"]
            is_unlocked = c_id in unlocked_cats
            
            card = tk.Frame(self.shop_inner, bg=self.app.theme["card"], padx=12, pady=9, relief="solid", bd=0)
            card.pack(fill='x', pady=3, padx=4)
            
            tk.Label(card, text=cat["name"], font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["text"]).pack(side='left')
            tk.Label(card, text=f" - {cat['desc']}", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["sub_text"]).pack(side='left', padx=5)
            
            if is_unlocked:
                tk.Label(card, text="在籍中 ✨", font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["break"]).pack(side='right')
            else:
                can_buy = treats >= cat["cost"]
                btn = tk.Button(
                    card, text=f"迎える (🐟 {cat['cost']}個)",
                    font=FONT_TEXT, bg=self.app.theme["btn"] if can_buy else self.app.theme["btn_sec"],
                    fg=self.app.theme["btn_fg"] if can_buy else self.app.theme["btn_sec_fg"],
                    relief="flat", padx=8, pady=2, cursor="hand2" if can_buy else "arrow",
                    state="normal" if can_buy else "disabled",
                    command=lambda cid=c_id: self.buy_cat(cid)
                )
                btn.pack(side='right')
                
        tk.Label(self.shop_inner, text="🛋️ 家具とおもちゃ", font=FONT_SUB, bg=self.app.theme["bg"], fg=self.app.theme["text"]).pack(anchor='w', pady=(12, 2), padx=4)
        
        unlocked_items = cafe_data.get("unlocked_items", ["cushion"])
        for item in AVAILABLE_ITEMS:
            i_id = item["id"]
            is_unlocked = i_id in unlocked_items
            
            card = tk.Frame(self.shop_inner, bg=self.app.theme["card"], padx=12, pady=9, relief="solid", bd=0)
            card.pack(fill='x', pady=3, padx=4)
            
            tk.Label(card, text=f"{item['icon']} {item['name']}", font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["text"]).pack(side='left')
            tk.Label(card, text=f" - {item['desc']}", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["sub_text"]).pack(side='left', padx=5)
            
            if is_unlocked:
                tk.Label(card, text="設置済み ✨", font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["break"]).pack(side='right')
            else:
                can_buy = treats >= item["cost"]
                btn = tk.Button(
                    card, text=f"設置 (🐟 {item['cost']}個)",
                    font=FONT_TEXT, bg=self.app.theme["btn"] if can_buy else self.app.theme["btn_sec"],
                    fg=self.app.theme["btn_fg"] if can_buy else self.app.theme["btn_sec_fg"],
                    relief="flat", padx=8, pady=2, cursor="hand2" if can_buy else "arrow",
                    state="normal" if can_buy else "disabled",
                    command=lambda iid=i_id: self.buy_item(iid)
                )
                btn.pack(side='right')

        bind_mousewheel_to_all(self.shop_inner, self.shop_canvas)

    def buy_cat(self, cat_id):
        success, msg = self.app.data_mgr.unlock_cat(cat_id)
        if success:
            self.app.sound_mgr.play_se("level_up")
            messagebox.showinfo("お迎え成功！", msg)
            self.refresh_view()
            self.app.refresh_cafe_elements()
        else:
            messagebox.showwarning("購入できません", msg)

    def buy_item(self, item_id):
        success, msg = self.app.data_mgr.unlock_item(item_id)
        if success:
            self.app.sound_mgr.play_se("level_up")
            messagebox.showinfo("設置完了！", msg)
            self.refresh_view()
            self.app.refresh_cafe_elements()
        else:
            messagebox.showwarning("購入できません", msg)
