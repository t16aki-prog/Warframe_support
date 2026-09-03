import tkinter as tk
from tkinter import ttk
import time, datetime
from ui.utils import FONT_MAIN, FONT_BOLD, FONT_SUB, FONT_TEXT, bind_mousewheel_to_all

class StatsTab:
    def __init__(self, app):
        self.app = app
        tab = tk.Frame(self.app.content_frame, bg=self.app.theme["bg"])
        self.app.tabs["stats"] = tab
        
        # スクロール対応キャンバス
        self.stats_canvas = tk.Canvas(tab, bg=self.app.theme["bg"], highlightthickness=0)
        self.stats_scrollbar = ttk.Scrollbar(tab, orient="vertical", command=self.stats_canvas.yview)
        self.stats_scroll_frame = tk.Frame(self.stats_canvas, bg=self.app.theme["bg"])
        
        self.stats_scroll_frame.bind(
            "<Configure>",
            lambda e: self.stats_canvas.configure(scrollregion=self.stats_canvas.bbox("all"))
        )
        self.stats_canvas_window = self.stats_canvas.create_window((0, 0), window=self.stats_scroll_frame, anchor="nw")
        self.stats_canvas.bind(
            "<Configure>",
            lambda e: self.stats_canvas.itemconfig(self.stats_canvas_window, width=e.width)
        )
        self.stats_canvas.configure(yscrollcommand=self.stats_scrollbar.set)
        
        self.stats_canvas.pack(side="left", fill="both", expand=True)
        self.stats_scrollbar.pack(side="right", fill="y")
        bind_mousewheel_to_all(self.stats_scroll_frame, self.stats_canvas)
        
        # 1. サマリーカード (4つの主要KPI)
        self.stats_kpi_card = tk.Frame(self.stats_scroll_frame, bg=self.app.theme["card"], padx=12, pady=12, relief="flat", bd=0)
        self.stats_kpi_card.pack(fill="x", padx=6, pady=6)
        
        self.kpi_title = tk.Label(self.stats_kpi_card, text="📊 集中パフォーマンス・サマリー", font=FONT_SUB, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.kpi_title.pack(anchor="w", pady=(0, 8))
        
        self.kpi_grid = tk.Frame(self.stats_kpi_card, bg=self.app.theme["card"])
        self.kpi_grid.pack(fill="x")
        
        self.kpi_labels = {}
        self.kpi_cells = []
        self.kpi_cell_titles = []
        kpi_items = [
            ("total_pomo", "🍅 累計ポモドーロ", "0 回"),
            ("total_time", "⏱️ 総集中時間", "0 分"),
            ("today_pomo", "🎯 本日の達成", "0 / 4"),
            ("streak", "🔥 連続達成日数", "1 日"),
            ("interrupted", "⚠️ 中断・未達成", "0 回")
        ]
        for idx, (k_id, title, default_val) in enumerate(kpi_items):
            if idx < 4:
                r, c = idx // 2, idx % 2
                span = 1
            else:
                r, c = 2, 0
                span = 2
            cell = tk.Frame(self.kpi_grid, bg=self.app.theme["bg"], padx=10, pady=7, relief="flat")
            cell.grid(row=r, column=c, columnspan=span, padx=4, pady=3, sticky="nsew")
            self.kpi_grid.grid_columnconfigure(c, weight=1)
            self.kpi_cells.append(cell)
            
            lbl_title = tk.Label(cell, text=title, font=FONT_TEXT, bg=self.app.theme["bg"], fg=self.app.theme["sub_text"])
            lbl_title.pack(anchor="w")
            self.kpi_cell_titles.append(lbl_title)
            
            lbl_val = tk.Label(cell, text=default_val, font=FONT_SUB, bg=self.app.theme["bg"], fg=self.app.theme["work"])
            lbl_val.pack(anchor="w", pady=(2, 0))
            self.kpi_labels[k_id] = lbl_val

        # 2. 週間推移バーグラフカード
        self.stats_chart_card = tk.Frame(self.stats_scroll_frame, bg=self.app.theme["card"], padx=12, pady=12, relief="flat", bd=0)
        self.stats_chart_card.pack(fill="x", padx=6, pady=6)
        
        self.chart_title = tk.Label(self.stats_chart_card, text="📈 週間集中レポート (直近7日間)", font=FONT_SUB, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.chart_title.pack(anchor="w", pady=(0, 6))
        
        self.chart_canvas = tk.Canvas(self.stats_chart_card, height=150, bg=self.app.theme["bg"], highlightthickness=0)
        self.chart_canvas.pack(fill="x", pady=4)

        # 3. 実績＆トロフィーバッジカード
        self.stats_ach_card = tk.Frame(self.stats_scroll_frame, bg=self.app.theme["card"], padx=12, pady=12, relief="flat", bd=0)
        self.stats_ach_card.pack(fill="x", padx=6, pady=6)
        
        self.ach_title = tk.Label(self.stats_ach_card, text="🏆 実績・称号バッジ", font=FONT_SUB, bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.ach_title.pack(anchor="w", pady=(0, 8))
        
        self.ach_list_frame = tk.Frame(self.stats_ach_card, bg=self.app.theme["card"])
        self.ach_list_frame.pack(fill="x")

    def refresh_view(self):
        """統計画面のKPI・グラフ・実績リストを最新データで再描画"""
        if not hasattr(self, 'stats_canvas'):
            return
            
        self.stats_canvas.config(bg=self.app.theme["bg"])
        self.stats_scroll_frame.config(bg=self.app.theme["bg"])
        self.stats_kpi_card.config(bg=self.app.theme["card"])
        self.kpi_title.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.kpi_grid.config(bg=self.app.theme["card"])
        
        for cell in self.kpi_cells:
            cell.config(bg=self.app.theme["bg"])
        for lbl_t in self.kpi_cell_titles:
            lbl_t.config(bg=self.app.theme["bg"], fg=self.app.theme["sub_text"])
            
        self.stats_chart_card.config(bg=self.app.theme["card"])
        self.chart_title.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.chart_canvas.config(bg=self.app.theme["bg"])
        self.stats_ach_card.config(bg=self.app.theme["card"])
        self.ach_title.config(bg=self.app.theme["card"], fg=self.app.theme["text"])
        self.ach_list_frame.config(bg=self.app.theme["card"])
        
        stats = self.app.data_mgr.get_stats_data()
        cafe = self.app.data_mgr.get_cafe_data()
        prof = self.app.data_mgr.get_profile()
        
        total_pomo = cafe["total_pomodoros"]
        total_mins = stats.get("total_minutes", total_pomo * self.app.data_mgr.get_setting('work_minutes'))
        streak = stats.get("streak_days", 1)
        daily_hist = stats.get("daily_history", {})
        
        today_str = time.strftime("%Y-%m-%d")
        today_done = daily_hist.get(today_str, total_pomo)
        
        hours = total_mins // 60
        mins = total_mins % 60
        time_str = f"{hours}時間 {mins}分" if hours > 0 else f"{mins}分"
        
        interrupted = stats.get("interrupted_sessions", 0)
        
        self.kpi_labels["total_pomo"].config(text=f"{total_pomo} 回", fg=self.app.theme["work"], bg=self.app.theme["bg"])
        self.kpi_labels["total_time"].config(text=time_str, fg=self.app.theme["work"], bg=self.app.theme["bg"])
        self.kpi_labels["today_pomo"].config(text=f"{today_done} / {prof['daily_goal']} 🍅", fg=self.app.theme["work"], bg=self.app.theme["bg"])
        self.kpi_labels["streak"].config(text=f"{streak} 日間連続 🔥", fg=self.app.theme["accent"], bg=self.app.theme["bg"])
        self.kpi_labels["interrupted"].config(text=f"{interrupted} 回", fg=self.app.theme["sub_text"] if interrupted == 0 else self.app.theme["accent"], bg=self.app.theme["bg"])
        
        # グラフ描画 (直近7日間)
        self.chart_canvas.delete("all")
        cw = self.chart_canvas.winfo_width()
        if cw < 50:
            cw = 460
        ch = 150
        
        today_date = datetime.date.today()
        days_data = []
        for i in range(6, -1, -1):
            d = today_date - datetime.timedelta(days=i)
            d_str = d.strftime("%Y-%m-%d")
            d_label = d.strftime("%m/%d") if i != 0 else "今日"
            val = daily_hist.get(d_str, 0)
            if i == 0 and val == 0 and total_pomo > 0:
                val = today_done
            days_data.append((d_label, val))
            
        max_val = max(max([v for _, v in days_data]), 4)
        bar_w = (cw - 60) / 7.0
        
        # 目標ライン
        goal_y = ch - 30 - (float(prof['daily_goal']) / max_val) * (ch - 60)
        self.chart_canvas.create_line(30, goal_y, cw - 10, goal_y, fill=self.app.theme["border"], dash=(4, 4))
        self.chart_canvas.create_text(25, goal_y, text=f"{prof['daily_goal']}", font=("Meiryo", 8), fill=self.app.theme["sub_text"])
        
        for idx, (label, val) in enumerate(days_data):
            bx = 35 + idx * bar_w
            bar_height = (float(val) / max_val) * (ch - 60)
            by1 = ch - 25
            by0 = by1 - bar_height
            
            # バー
            color = self.app.theme["work"] if idx == 6 else self.app.theme["btn"]
            self.chart_canvas.create_rectangle(bx, by0, bx + bar_w - 12, by1, fill=color, outline="")
            
            # 数値
            if val > 0:
                self.chart_canvas.create_text(bx + (bar_w - 12)/2, by0 - 8, text=str(val), font=("Meiryo", 8, "bold"), fill=self.app.theme["text"])
            # 日付ラベル
            self.chart_canvas.create_text(bx + (bar_w - 12)/2, ch - 12, text=label, font=("Meiryo", 8), fill=self.app.theme["sub_text"])

        # 実績バッジ一覧の描画
        for w in self.ach_list_frame.winfo_children():
            w.destroy()
            
        achievements = self.app.data_mgr.get_achievements()
        for ach in achievements:
            is_unlocked = ach.get("unlocked", False)
            card_bg = self.app.theme["header"] if is_unlocked else self.app.theme["bg"]
            
            row = tk.Frame(self.ach_list_frame, bg=card_bg, padx=10, pady=8, relief="flat")
            row.pack(fill="x", pady=3)
            
            icon = "🏆" if is_unlocked else "🔒"
            status_text = "解除済み ✨" if is_unlocked else "未解除"
            status_color = self.app.theme["accent"] if is_unlocked else self.app.theme["sub_text"]
            
            left_box = tk.Frame(row, bg=card_bg)
            left_box.pack(side="left", fill="x", expand=True)
            
            tk.Label(left_box, text=f"{icon} {ach['name']}", font=FONT_BOLD, bg=card_bg, fg=self.app.theme["text"]).pack(anchor="w")
            tk.Label(left_box, text=ach['desc'], font=FONT_TEXT, bg=card_bg, fg=self.app.theme["sub_text"]).pack(anchor="w")
            
            tk.Label(row, text=status_text, font=FONT_BOLD, bg=card_bg, fg=status_color).pack(side="right", padx=6)
