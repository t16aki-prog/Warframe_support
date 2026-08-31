import tkinter as tk
from tkinter import ttk, messagebox
import datetime
from ui.utils import FONT_MAIN, FONT_BOLD, FONT_SUB, FONT_TEXT, bind_mousewheel_to_all

class TaskTab:
    def __init__(self, app):
        self.app = app
        self._build_task_tab()

    def _build_task_tab(self):
        tab = tk.Frame(self.app.content_frame, bg=self.app.theme["bg"])
        self.app.tabs["task"] = tab
        
        self.task_sync_bar = tk.Frame(tab, bg=self.app.theme["card"], padx=8, pady=6, relief="groove", bd=1)
        self.task_sync_bar.pack(fill='x', pady=(0, 4))
        
        g_status = "🟢 接続中" if self.app.google_sync.is_authenticated() else "⚪ 未連携 (デモ利用可)"
        self.sync_status_lbl = tk.Label(self.task_sync_bar, text=f"Google連携: {g_status}", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.sync_status_lbl.pack(side='left', padx=4)
        
        self.btn_tasks_sync = tk.Button(
            self.task_sync_bar, text="🔄 Tasksから同期", font=("Meiryo", 8, "bold"),
            bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"], relief="flat", padx=6, pady=2,
            cursor="hand2", command=self.sync_google_tasks
        )
        self.btn_tasks_sync.pack(side='right', padx=3)
        
        self.btn_cal_sync = tk.Button(
            self.task_sync_bar, text="📅 今日の予定", font=("Meiryo", 8, "bold"),
            bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"], relief="flat", padx=6, pady=2,
            cursor="hand2", command=self.open_calendar_modal
        )
        self.btn_cal_sync.pack(side='right', padx=3)
        
        # タスク追加フォーム (拡張版)
        self.task_add_frame = tk.Frame(tab, bg=self.app.theme["card"], padx=10, pady=8, relief="flat", bd=0)
        self.task_add_frame.pack(fill='x', pady=4)
        
        self.task_add_title = tk.Label(self.task_add_frame, text="＋ 新しいタスクを追加", font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.task_add_title.pack(anchor='w', pady=(0, 4))
        
        self.top_input_row = tk.Frame(self.task_add_frame, bg=self.app.theme["card"])
        self.top_input_row.pack(fill='x', pady=2)
        
        self.task_entry = tk.Entry(self.top_input_row, font=FONT_TEXT, bg=self.app.theme["input_bg"], fg=self.app.theme["input_fg"], insertbackground=self.app.theme["text"], relief="solid", bd=1)
        self.task_entry.pack(side='left', fill='x', expand=True, padx=(0, 6))
        self.task_entry.bind("<Return>", lambda e: self.add_new_task())
        
        self.task_target_lbl = tk.Label(self.top_input_row, text="目標🍅:", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.task_target_lbl.pack(side='left', padx=2)
        self.task_target_spin = ttk.Spinbox(self.top_input_row, from_=1, to=12, width=3, font=FONT_TEXT)
        self.task_target_spin.set(2)
        self.task_target_spin.pack(side='left', padx=(0, 6))
        
        self.bottom_opts_row = tk.Frame(self.task_add_frame, bg=self.app.theme["card"])
        self.bottom_opts_row.pack(fill='x', pady=2)
        
        self.task_tag_lbl = tk.Label(self.bottom_opts_row, text="タグ:", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["sub_text"])
        self.task_tag_lbl.pack(side='left', padx=(0, 2))
        self.task_tag_var = tk.StringVar(value="💼 仕事")
        self.task_tag_combo = ttk.Combobox(self.bottom_opts_row, textvariable=self.task_tag_var, values=["💼 仕事", "📚 勉強", "🎨 創作", "🏠 その他"], state="readonly", width=8, font=FONT_TEXT)
        self.task_tag_combo.pack(side='left', padx=(0, 8))
        
        self.task_prio_lbl = tk.Label(self.bottom_opts_row, text="優先度:", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["sub_text"])
        self.task_prio_lbl.pack(side='left', padx=(0, 2))
        self.task_prio_var = tk.StringVar(value="⚡ 中")
        self.task_prio_combo = ttk.Combobox(self.bottom_opts_row, textvariable=self.task_prio_var, values=["🔥 高", "⚡ 中", "☕ 低"], state="readonly", width=6, font=FONT_TEXT)
        self.task_prio_combo.pack(side='left', padx=(0, 8))
        
        self.task_add_btn = tk.Button(self.bottom_opts_row, text="追加 ＋", command=self.add_new_task, bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"], font=FONT_BOLD, relief="flat", padx=12, pady=1, cursor="hand2")
        self.task_add_btn.pack(side='right')

        # フィルターバー
        self.filter_frame = tk.Frame(tab, bg=self.app.theme["bg"])
        self.filter_frame.pack(fill='x', pady=(4, 2))
        self.task_filter = "all"
        
        self.filter_btns = {}
        filters = [("all", "すべて"), ("active", "未完了"), ("done", "完了済")]
        for f_key, f_text in filters:
            f_btn = tk.Button(
                self.filter_frame, text=f_text, font=("Meiryo", 8),
                bg=self.app.theme["btn"] if f_key == "all" else self.app.theme["card"],
                fg=self.app.theme["btn_fg"] if f_key == "all" else self.app.theme["text"],
                relief="flat", padx=8, pady=2, cursor="hand2",
                command=lambda k=f_key: self.set_task_filter(k)
            )
            f_btn.pack(side='left', padx=2)
            self.filter_btns[f_key] = f_btn
        
        list_container = tk.Frame(tab, bg=self.app.theme["bg"])
        list_container.pack(fill='both', expand=True, pady=4)
        
        self.task_canvas = tk.Canvas(list_container, bg=self.app.theme["bg"], highlightthickness=0)
        self.task_scrollbar = ttk.Scrollbar(list_container, orient="vertical", command=self.task_canvas.yview)
        self.task_inner_frame = tk.Frame(self.task_canvas, bg=self.app.theme["bg"])
        
        self.task_inner_frame.bind("<Configure>", lambda e: self.task_canvas.configure(scrollregion=self.task_canvas.bbox("all")))
        self.task_canvas_window = self.task_canvas.create_window((0, 0), window=self.task_inner_frame, anchor="nw")
        self.task_canvas.bind("<Configure>", lambda e: self.task_canvas.itemconfig(self.task_canvas_window, width=e.width))
        
        self.task_canvas.configure(yscrollcommand=self.task_scrollbar.set)
        self.task_canvas.pack(side="left", fill="both", expand=True)
        self.task_scrollbar.pack(side="right", fill="y")
        
        bind_mousewheel_to_all(self.task_inner_frame, self.task_canvas)

    def set_task_filter(self, f_key):
        self.task_filter = f_key
        for k, btn in self.filter_btns.items():
            if k == f_key:
                btn.config(bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"])
            else:
                btn.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.refresh_task_list()

    def refresh_task_list(self):
        for widget in self.task_inner_frame.winfo_children():
            widget.destroy()
            
        g_status = "🟢 接続中" if self.app.google_sync.is_authenticated() else "⚪ 未連携 (デモ利用可)"
        self.sync_status_lbl.config(text=f"Google連携: {g_status}", bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.task_sync_bar.config(bg=self.app.theme["card"])
        self.btn_tasks_sync.config(bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"])
        self.btn_cal_sync.config(bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"])
        
        # タスク追加フォームのテーマ更新
        self.task_add_frame.config(bg=self.app.theme["card"])
        self.task_add_title.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.top_input_row.config(bg=self.app.theme["card"])
        self.task_entry.config(bg=self.app.theme["input_bg"], fg=self.app.theme["input_fg"], insertbackground=self.app.theme["text"])
        self.task_target_lbl.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.bottom_opts_row.config(bg=self.app.theme["card"])
        self.task_tag_lbl.config(bg=self.app.theme["card"], fg=self.app.theme["sub_text"])
        self.task_prio_lbl.config(bg=self.app.theme["card"], fg=self.app.theme["sub_text"])
        self.task_add_btn.config(bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"])
        
        # フィルターバーのテーマ更新
        self.filter_frame.config(bg=self.app.theme["bg"])
        for k, btn in self.filter_btns.items():
            if k == self.task_filter:
                btn.config(bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"])
            else:
                btn.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
                
        self.task_canvas.config(bg=self.app.theme["bg"])
        self.task_inner_frame.config(bg=self.app.theme["bg"])
        
        tasks = self.app.data_mgr.get_tasks()
        active_task = self.app.data_mgr.get_active_task()
        active_id = active_task["id"] if active_task else None
        
        # フィルター適用
        if self.task_filter == "active":
            tasks = [t for t in tasks if not t["is_done"]]
        elif self.task_filter == "done":
            tasks = [t for t in tasks if t["is_done"]]
            
        if not tasks:
            empty_lbl = tk.Label(self.task_inner_frame, text="該当するタスクはありません 🐾", font=FONT_TEXT, fg=self.app.theme["sub_text"], bg=self.app.theme["bg"], pady=20)
            empty_lbl.pack()
            return
            
        for t in tasks:
            t_id = t["id"]
            is_active = (t_id == active_id)
            card_bg = self.app.theme["header"] if is_active else self.app.theme["card"]
            
            card = tk.Frame(self.task_inner_frame, bg=card_bg, padx=10, pady=7, relief="flat", bd=0)
            card.pack(fill='x', pady=3, padx=2)
            
            top_line = tk.Frame(card, bg=card_bg)
            top_line.pack(fill='x')
            
            chk_var = tk.BooleanVar(value=t["is_done"])
            chk = tk.Checkbutton(top_line, variable=chk_var, bg=card_bg, activebackground=card_bg, command=lambda tid=t_id: self.toggle_task(tid))
            chk.pack(side='left')
            
            # タグと優先度バッジ
            tag_text = t.get("tag", "💼 仕事")
            prio_text = t.get("priority", "⚡ 中")
            tk.Label(top_line, text=tag_text, font=("Meiryo", 8), bg=self.app.theme["bg"], fg=self.app.theme["text"], padx=4).pack(side='left', padx=2)
            tk.Label(top_line, text=prio_text, font=("Meiryo", 8), bg=self.app.theme["bg"], fg=self.app.theme["accent"], padx=4).pack(side='left', padx=2)
            
            if t.get("google_id"):
                g_badge = tk.Label(top_line, text="G", font=("Segoe UI", 8, "bold"), bg=self.app.theme["btn_sec"], fg=GOOGLE_BLUE, padx=4)
                g_badge.pack(side='left', padx=(0, 4))
                
            strike = " (済)" if t["is_done"] else ""
            t_title = t["title"] + strike
            lbl_title = tk.Label(top_line, text=t_title, font=FONT_BOLD if is_active else FONT_TEXT, bg=card_bg, fg=self.app.theme["sub_text"] if t["is_done"] else self.app.theme["text"], anchor='w')
            lbl_title.pack(side='left', fill='x', expand=True, padx=4)
            
            pomo_str = f"🍅 {t['completed_pomo']}/{t['target_pomo']}"
            lbl_pomo = tk.Label(top_line, text=pomo_str, font=FONT_TEXT, bg=card_bg, fg=self.app.theme["work"])
            lbl_pomo.pack(side='left', padx=4)
            
            if not is_active and not t["is_done"]:
                select_btn = tk.Button(top_line, text="選択", font=("Meiryo", 8), bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"], relief="flat", padx=6, cursor="hand2", command=lambda tid=t_id: self.select_task(tid))
                select_btn.pack(side='left', padx=2)
            elif is_active:
                tag = tk.Label(top_line, text="作業中", font=("Meiryo", 8, "bold"), bg=self.app.theme["work"], fg="#fff", padx=5)
                tag.pack(side='left', padx=2)
                
            del_btn = tk.Button(top_line, text="✕", font=("Meiryo", 8), bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"], relief="flat", padx=5, cursor="hand2", command=lambda tid=t_id: self.delete_task(tid))
            del_btn.pack(side='right')

            # 進捗プログレスバー
            prog_ratio = min(1.0, float(t['completed_pomo']) / max(1, t['target_pomo']))
            prog_frame = tk.Frame(card, bg=self.app.theme["border"], height=4)
            prog_frame.pack(fill='x', pady=(4, 1))
            prog_fill = tk.Frame(prog_frame, bg=self.app.theme["work"], height=4)
            prog_fill.place(relx=0, rely=0, relwidth=prog_ratio, relheight=1.0)

        bind_mousewheel_to_all(self.task_inner_frame, self.task_canvas)

    def add_new_task(self):
        title = self.task_entry.get().strip()
        if not title:
            return
        try:
            target = int(self.task_target_spin.get())
        except ValueError:
            target = 1
        tag = self.task_tag_var.get()
        prio = self.task_prio_var.get()
        self.app.data_mgr.add_task(title, target, tag=tag, priority=prio)
        self.task_entry.delete(0, 'end')
        self.refresh_task_list()
        self.app.cafe_tab_obj.refresh_cafe_elements()

    def toggle_task(self, task_id):
        t = self.app.data_mgr.toggle_task_done(task_id)
        if t and t["is_done"]:
            self.app.sound_mgr.play_se("level_up")
            if t.get("google_id"):
                threading.Thread(target=lambda: self.app.google_sync.complete_task(t["google_id"]), daemon=True).start()
        self.refresh_task_list()
        self.app.cafe_tab_obj.refresh_cafe_elements()

    def select_task(self, task_id):
        self.app.data_mgr.set_active_task(task_id)
        self.refresh_task_list()
        self.app.cafe_tab_obj.refresh_cafe_elements()

    def delete_task(self, task_id):
        self.app.data_mgr.delete_task(task_id)
        self.refresh_task_list()
        self.app.cafe_tab_obj.refresh_cafe_elements()

    def sync_google_tasks(self):
        tasks = self.app.google_sync.fetch_tasks()
        existing_google_ids = {t.get("google_id") for t in self.app.data_mgr.get_tasks() if t.get("google_id")}
        
        added_count = 0
        for g_task in tasks:
            if g_task["id"] not in existing_google_ids:
                self.app.data_mgr.add_task(g_task["title"], target_pomo=g_task.get("target_pomo", 2), google_id=g_task["id"])
                added_count += 1
                
        self.refresh_task_list()
        self.app.cafe_tab_obj.refresh_cafe_elements()
        self.app.sound_mgr.play_se("level_up")
        
        mode_str = "Google Tasks" if self.app.google_sync.is_authenticated() else "Google Tasks (サンプルデモ)"
        messagebox.showinfo("同期完了", f"{mode_str} から {added_count} 件のタスクを取り込みました！📝")

    def open_calendar_modal(self):
        modal = tk.Toplevel(self.app.root)
        modal.title("📅 今日のGoogleカレンダー予定")
        modal.geometry("420x450")
        modal.configure(bg=self.app.theme["bg"])
        modal.transient(self.app.root)
        modal.grab_set()

        tk.Label(modal, text="📅 今日のGoogleカレンダー予定", font=FONT_TITLE, bg=self.app.theme["bg"], fg=self.app.theme["text"]).pack(pady=10)
        
        events = self.app.google_sync.fetch_today_events()
        container = tk.Frame(modal, bg=self.app.theme["card"], padx=10, pady=10, relief="groove", bd=1)
        container.pack(fill='both', expand=True, padx=15, pady=5)
        
        if not events:
            tk.Label(container, text="今日の予定はありません ✨", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["sub_text"]).pack(pady=30)
        else:
            for ev in events:
                row = tk.Frame(container, bg=self.app.theme["card"], pady=4)
                row.pack(fill='x')
                time_str = f"[{ev['start']}]" if ev['start'] else ""
                tk.Label(row, text=f"{time_str} {ev['summary']}", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["text"], anchor='w').pack(side='left', fill='x', expand=True)
                add_btn = tk.Button(
                    row, text="タスク化 ＋", font=("Meiryo", 8), bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"], relief="flat", padx=6, cursor="hand2",
                    command=lambda s=ev['summary']: self.add_event_as_task(s, modal)
                )
                add_btn.pack(side='right')

        close_btn = tk.Button(modal, text="閉じる", font=FONT_TEXT, bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"], relief="flat", padx=15, pady=4, command=modal.destroy)
        close_btn.pack(pady=10)

    def add_event_as_task(self, summary, modal):
        self.app.data_mgr.add_task(summary, target_pomo=2)
        self.app.sound_mgr.play_se("level_up")
        self.refresh_task_list()
        self.app.cafe_tab_obj.refresh_cafe_elements()
        messagebox.showinfo("タスク追加", f"「{summary}」をタスクに追加しました！")

    # --- 最初の相棒猫選択モーダル ---
    def open_starter_cat_modal(self):
        """最初の一匹を15種類の中から自由に選ぶモーダル"""
        modal = tk.Toplevel(self.app.root)
        modal.title("🐾 最初の相棒猫を選ぼう！")
        modal.geometry("460x580")
        modal.configure(bg=self.app.theme["bg"])
        modal.transient(self.app.root)
        modal.grab_set()

        tk.Label(modal, text="🐾 最初の相棒猫を選んでね！", font=FONT_TITLE, bg=self.app.theme["bg"], fg=self.app.theme["text"]).pack(pady=(12, 4))
        tk.Label(modal, text="15種類の中からお好きな猫を【無料】で最初の相棒にできます！\n選んだ猫はすぐにカフェに登場します ✨", font=FONT_TEXT, bg=self.app.theme["bg"], fg=self.app.theme["sub_text"], justify='center').pack(pady=(0, 8))

        container = tk.Frame(modal, bg=self.app.theme["bg"])
        container.pack(fill='both', expand=True, padx=10, pady=5)

        c_canvas = tk.Canvas(container, bg=self.app.theme["bg"], highlightthickness=0)
        s_bar = ttk.Scrollbar(container, orient="vertical", command=c_canvas.yview)
        c_inner = tk.Frame(c_canvas, bg=self.app.theme["bg"])

        c_inner.bind("<Configure>", lambda e: c_canvas.configure(scrollregion=c_canvas.bbox("all")))
        win = c_canvas.create_window((0, 0), window=c_inner, anchor="nw")
        c_canvas.bind("<Configure>", lambda e: c_canvas.itemconfig(win, width=e.width))

        c_canvas.configure(yscrollcommand=s_bar.set)
        c_canvas.pack(side="left", fill="both", expand=True)
        s_bar.pack(side="right", fill="y")

        def choose_starter(cid):
            self.app.data_mgr.set_starter_cat(cid)
            self.app._update_widget_cat_frames()
            self.app.sound_mgr.play_se("level_up")
            messagebox.showinfo("相棒決定！", "最初の相棒猫を設定しました！🐾")
            modal.destroy()
            self.app.cafe_tab_obj.refresh_cafe_elements()
            self.app.shop_tab_obj.refresh_view()

        cur_avatar = self.app.data_mgr.get_profile().get("avatar", "black")
        for cat in AVAILABLE_CATS:
            cid = cat["id"]
            card = tk.Frame(c_inner, bg=self.app.theme["card"], padx=10, pady=8, relief="solid", bd=1 if cid == cur_avatar else 0)
            card.pack(fill='x', pady=3, padx=4)

            tk.Label(card, text=cat["name"], font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["text"]).pack(side='left')
            tk.Label(card, text=f" - {cat['desc']}", font=FONT_TEXT, bg=self.app.theme["card"], fg=self.app.theme["sub_text"]).pack(side='left', padx=4)

            btn_text = "相棒中 🌟" if cid == cur_avatar else "この子にする！🐾"
            btn = tk.Button(
                card, text=btn_text, font=FONT_TEXT,
                bg=self.app.theme["btn"] if cid != cur_avatar else self.app.theme["btn_sec"],
                fg=self.app.theme["btn_fg"] if cid != cur_avatar else self.app.theme["btn_sec_fg"],
                relief="flat", padx=8, pady=2, cursor="hand2",
                command=lambda c=cid: choose_starter(c)
            )
            btn.pack(side='right')

        bind_mousewheel_to_all(c_inner, c_canvas)

    # --- アカウント設定モーダル ---
    def open_account_modal(self):
        modal = tk.Toplevel(self.app.root)
        modal.title("👤 アカウント設定 & Google連携")
        modal.geometry("460x580")
        modal.configure(bg=self.app.theme["bg"])
        modal.transient(self.app.root)
        modal.grab_set()

        prof = self.app.data_mgr.get_profile()

        tk.Label(modal, text="👤 ユーザープロフィール & 連携設定", font=FONT_TITLE, bg=self.app.theme["bg"], fg=self.app.theme["text"]).pack(pady=(12, 6))

        p_card = tk.Frame(modal, bg=self.app.theme["card"], padx=15, pady=12, relief="groove", bd=1)
        p_card.pack(fill='x', padx=15, pady=5)

        tk.Label(p_card, text="ユーザー名:", font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["text"]).grid(row=0, column=0, sticky='w', pady=6)
        name_entry = tk.Entry(p_card, font=FONT_TEXT, width=18, bg=self.app.theme["input_bg"], fg=self.app.theme["input_fg"], insertbackground=self.app.theme["text"])
        name_entry.insert(0, prof.get("name", "にゃんこマスター"))
        name_entry.grid(row=0, column=1, sticky='e', padx=5)

        tk.Label(p_card, text="相棒アバター猫:", font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["text"]).grid(row=1, column=0, sticky='w', pady=6)
        avatar_var = tk.StringVar(value=prof.get("avatar", "black"))
        avatar_choices = [f"{c['id']} ({c['name']})" for c in AVAILABLE_CATS]
        avatar_combo = ttk.Combobox(p_card, textvariable=avatar_var, values=avatar_choices, state="readonly", width=18, font=FONT_TEXT)
        for opt in avatar_choices:
            if opt.startswith(prof.get("avatar", "black")):
                avatar_combo.set(opt)
                break
        avatar_combo.grid(row=1, column=1, sticky='e', padx=5)

        tk.Label(p_card, text="1日の目標ポモドーロ:", font=FONT_BOLD, bg=self.app.theme["card"], fg=self.app.theme["text"]).grid(row=2, column=0, sticky='w', pady=6)
        goal_spin = ttk.Spinbox(p_card, from_=1, to=20, width=5, font=FONT_TEXT)
        goal_spin.set(prof.get("daily_goal", 4))
        goal_spin.grid(row=2, column=1, sticky='e', padx=5)

        g_card = tk.Frame(modal, bg=self.app.theme["card"], padx=15, pady=12, relief="groove", bd=1)
        g_card.pack(fill='x', padx=15, pady=8)

        tk.Label(g_card, text="🌐 Google アカウント連携", font=FONT_SUB, bg=self.app.theme["card"], fg=self.app.theme["text"]).pack(anchor='w')
        
        is_auth = self.app.google_sync.is_authenticated()
        status_text = f"連携中: {self.app.google_sync.get_user_email() or '接続済み'}" if is_auth else "未接続 (Google Tasks / Calendar)"
        status_color = self.app.theme["break"] if is_auth else self.app.theme["sub_text"]
        
        status_lbl = tk.Label(g_card, text=status_text, font=FONT_TEXT, bg=self.app.theme["card"], fg=status_color)
        status_lbl.pack(anchor='w', pady=(2, 6))

        btn_g_frame = tk.Frame(g_card, bg=self.app.theme["card"])
        btn_g_frame.pack(fill='x', pady=4)

        if not is_auth:
            login_btn = tk.Button(
                btn_g_frame, text="Google アカウントと連携する 🌐",
                font=FONT_BOLD, bg=GOOGLE_BLUE, fg="#fff", relief="flat", padx=10, pady=5, cursor="hand2",
                command=lambda: self.start_google_login(modal)
            )
            login_btn.pack(side='left', fill='x', expand=True, padx=2)
        else:
            logout_btn = tk.Button(
                btn_g_frame, text="連携を解除する",
                font=FONT_TEXT, bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"], relief="flat", padx=10, pady=4, cursor="hand2",
                command=lambda: self.disconnect_google(modal)
            )
            logout_btn.pack(side='left', padx=2)

        help_btn = tk.Button(
            g_card, text="ℹ️ credentials.json の配置方法ガイド",
            font=("Meiryo", 8), bg=self.app.theme["card"], fg=GOOGLE_BLUE, relief="flat", cursor="hand2",
            command=self.show_google_guide
        )
        help_btn.pack(anchor='w', pady=(4, 0))

        def save_profile():
            raw_av = avatar_var.get().split()[0]
            new_name = name_entry.get().strip() or "にゃんこマスター"
            try:
                new_goal = int(goal_spin.get())
            except ValueError:
                new_goal = 4
            self.app.data_mgr.update_profile(name=new_name, avatar=raw_av, daily_goal=new_goal)
            self.app._update_widget_cat_frames()
            self.app.cafe_tab_obj.refresh_cafe_elements()
            self.refresh_task_list()
            messagebox.showinfo("更新完了", "プロフィールを更新しました！🐾")
            modal.destroy()

        save_btn = tk.Button(modal, text="💾 プロフィールを保存", font=FONT_SUB, bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"], relief="flat", padx=15, pady=6, cursor="hand2", command=save_profile)
        save_btn.pack(pady=10)

    def start_google_login(self, modal):
        if not self.app.google_sync.has_credentials_file():
            self.show_google_guide()
            return
            
        success, msg = self.app.google_sync.login()
        if success:
            self.app.data_mgr.update_profile(google_connected=True, email=self.app.google_sync.get_user_email() or "")
            self.app.sound_mgr.play_se("level_up")
            messagebox.showinfo("連携成功", msg)
            modal.destroy()
            self.refresh_task_list()
        else:
            messagebox.showerror("連携失敗", msg)

    def disconnect_google(self, modal):
        self.app.google_sync.logout()
        self.app.data_mgr.update_profile(google_connected=False, email="")
        messagebox.showinfo("解除完了", "Googleアカウントとの連携を解除しました。")
        modal.destroy()
        self.refresh_task_list()

    def show_google_guide(self):
        guide = (
            "【Google 連携のセットアップ方法】\n\n"
            "1. Google Cloud Console (https://console.cloud.google.com/) にアクセス\n"
            "2. 新規プロジェクトを作成し、「Google Tasks API」と「Google Calendar API」を有効化\n"
            "3. 「OAuth 同意画面」を設定（ユーザータイプ：外部、テストユーザーにご自身のGmailを追加）\n"
            "4. 「認証情報」➔「OAuth クライアント IDの作成」➔ アプリケーションの種類：「デスクトップ アプリ」\n"
            "5. ダウンロードした JSON ファイルを「credentials.json」という名前に変更して\n"
            "   PomodoroTimer フォルダ直下に配置してください。\n\n"
            "※ credentials.json が無い状態でも、デモモードでGoogle連携の動作をそのまま体験いただけます！"
        )
        messagebox.showinfo("Google 連携ガイド", guide)

    def toggle_task(self, task_id):
        t = self.app.data_mgr.toggle_task_done(task_id)
        if t and t["is_done"]:
            self.app.sound_mgr.play_se("level_up")
            if t.get("google_id"):
                threading.Thread(target=lambda: self.app.google_sync.complete_task(t["google_id"]), daemon=True).start()
        self.refresh_task_list()
        self.app.cafe_tab_obj.refresh_cafe_elements()

    def delete_task(self, task_id):
        self.app.data_mgr.delete_task(task_id)
        self.refresh_task_list()
        self.app.cafe_tab_obj.refresh_cafe_elements()

    def refresh_task_list(self):
        for widget in self.task_inner_frame.winfo_children():
            widget.destroy()
            
        g_status = "🟢 接続中" if self.app.google_sync.is_authenticated() else "⚪ 未連携 (デモ利用可)"
        self.sync_status_lbl.config(text=f"Google連携: {g_status}", bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.task_sync_bar.config(bg=self.app.theme["card"])
        self.btn_tasks_sync.config(bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"])
        self.btn_cal_sync.config(bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"])
        
        # タスク追加フォームのテーマ更新
        self.task_add_frame.config(bg=self.app.theme["card"])
        self.task_add_title.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.top_input_row.config(bg=self.app.theme["card"])
        self.task_entry.config(bg=self.app.theme["input_bg"], fg=self.app.theme["input_fg"], insertbackground=self.app.theme["text"])
        self.task_target_lbl.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.bottom_opts_row.config(bg=self.app.theme["card"])
        self.task_tag_lbl.config(bg=self.app.theme["card"], fg=self.app.theme["sub_text"])
        self.task_prio_lbl.config(bg=self.app.theme["card"], fg=self.app.theme["sub_text"])
        self.task_add_btn.config(bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"])
        
        # フィルターバーのテーマ更新
        self.filter_frame.config(bg=self.app.theme["bg"])
        for k, btn in self.filter_btns.items():
            if k == self.task_filter:
                btn.config(bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"])
            else:
                btn.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
                
        self.task_canvas.config(bg=self.app.theme["bg"])
        self.task_inner_frame.config(bg=self.app.theme["bg"])
        
        tasks = self.app.data_mgr.get_tasks()
        active_task = self.app.data_mgr.get_active_task()
        active_id = active_task["id"] if active_task else None
        
        # フィルター適用
        if self.task_filter == "active":
            tasks = [t for t in tasks if not t["is_done"]]
        elif self.task_filter == "done":
            tasks = [t for t in tasks if t["is_done"]]
            
        if not tasks:
            empty_lbl = tk.Label(self.task_inner_frame, text="該当するタスクはありません 🐾", font=FONT_TEXT, fg=self.app.theme["sub_text"], bg=self.app.theme["bg"], pady=20)
            empty_lbl.pack()
            return
            
        for t in tasks:
            t_id = t["id"]
            is_active = (t_id == active_id)
            card_bg = self.app.theme["header"] if is_active else self.app.theme["card"]
            
            card = tk.Frame(self.task_inner_frame, bg=card_bg, padx=10, pady=7, relief="flat", bd=0)
            card.pack(fill='x', pady=3, padx=2)
            
            top_line = tk.Frame(card, bg=card_bg)
            top_line.pack(fill='x')
            
            chk_var = tk.BooleanVar(value=t["is_done"])
            chk = tk.Checkbutton(top_line, variable=chk_var, bg=card_bg, activebackground=card_bg, command=lambda tid=t_id: self.toggle_task(tid))
            chk.pack(side='left')
            
            # タグと優先度バッジ
            tag_text = t.get("tag", "💼 仕事")
            prio_text = t.get("priority", "⚡ 中")
            tk.Label(top_line, text=tag_text, font=("Meiryo", 8), bg=self.app.theme["bg"], fg=self.app.theme["text"], padx=4).pack(side='left', padx=2)
            tk.Label(top_line, text=prio_text, font=("Meiryo", 8), bg=self.app.theme["bg"], fg=self.app.theme["accent"], padx=4).pack(side='left', padx=2)
            
            if t.get("google_id"):
                g_badge = tk.Label(top_line, text="G", font=("Segoe UI", 8, "bold"), bg=self.app.theme["btn_sec"], fg=GOOGLE_BLUE, padx=4)
                g_badge.pack(side='left', padx=(0, 4))
                
            strike = " (済)" if t["is_done"] else ""
            t_title = t["title"] + strike
            lbl_title = tk.Label(top_line, text=t_title, font=FONT_BOLD if is_active else FONT_TEXT, bg=card_bg, fg=self.app.theme["sub_text"] if t["is_done"] else self.app.theme["text"], anchor='w')
            lbl_title.pack(side='left', fill='x', expand=True, padx=4)
            
            pomo_str = f"🍅 {t['completed_pomo']}/{t['target_pomo']}"
            lbl_pomo = tk.Label(top_line, text=pomo_str, font=FONT_TEXT, bg=card_bg, fg=self.app.theme["work"])
            lbl_pomo.pack(side='left', padx=4)
            
            if not is_active and not t["is_done"]:
                select_btn = tk.Button(top_line, text="選択", font=("Meiryo", 8), bg=self.app.theme["btn"], fg=self.app.theme["btn_fg"], relief="flat", padx=6, cursor="hand2", command=lambda tid=t_id: self.select_task(tid))
                select_btn.pack(side='left', padx=2)
            elif is_active:
                tag = tk.Label(top_line, text="作業中", font=("Meiryo", 8, "bold"), bg=self.app.theme["work"], fg="#fff", padx=5)
                tag.pack(side='left', padx=2)
                
            del_btn = tk.Button(top_line, text="✕", font=("Meiryo", 8), bg=self.app.theme["btn_sec"], fg=self.app.theme["btn_sec_fg"], relief="flat", padx=5, cursor="hand2", command=lambda tid=t_id: self.delete_task(tid))
            del_btn.pack(side='right')

            # 進捗プログレスバー
            prog_ratio = min(1.0, float(t['completed_pomo']) / max(1, t['target_pomo']))
            prog_frame = tk.Frame(card, bg=self.app.theme["border"], height=4)
            prog_frame.pack(fill='x', pady=(4, 1))
            prog_fill = tk.Frame(prog_frame, bg=self.app.theme["work"], height=4)
            prog_fill.place(relx=0, rely=0, relwidth=prog_ratio, relheight=1.0)

        bind_mousewheel_to_all(self.task_inner_frame, self.task_canvas)

