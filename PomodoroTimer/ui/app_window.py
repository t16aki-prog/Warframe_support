import os
import tkinter as tk

from core.image_loader import ImageLoader
from core.timer_controller import TimerController
from data_manager import DataManager
from scripts.sound_generator import SoundManager
from google_sync import GoogleSyncManager

from ui.theme_manager import ThemeManager
from ui.header import HeaderView
from ui.widget import MiniWidget
from ui.animation_engine import AnimationEngine
from ui.tabs.cafe_tab import CafeTab
from ui.tabs.task_tab import TaskTab
from ui.tabs.shop_tab import ShopTab
from ui.tabs.stats_tab import StatsTab
from ui.tabs.settings_tab import SettingsTab


class PomodoroApp:
    """猫カフェ・ポモドーロ メインアプリケーションウィンドウ"""
    def __init__(self, root, base_dir):
        self.root = root
        self.base_dir = base_dir
        self.root.title("猫カフェ・ポモドーロ 🐾")
        self.root.geometry("520x750")
        self.root.minsize(500, 700)

        # 1. データ & サウンド & Google マネージャー
        self.data_mgr = DataManager()
        self.sound_mgr = SoundManager()
        self.sound_mgr.se_enabled = self.data_mgr.get_setting("se_enabled")
        self.google_sync = GoogleSyncManager()

        # 2. テーマ & TTKスタイル設定
        self.theme = self.data_mgr.get_current_theme()
        self.root.configure(bg=self.theme["bg"])
        ThemeManager.update_ttk_styles(self.root, self.theme)

        self.is_alive = True
        self.root.protocol("WM_DELETE_WINDOW", self.quit_app)

        # 3. 中断セッション検知
        self.data_mgr.check_and_resolve_interrupted_session()

        # 4. タイマーコントローラー初期化 (UI構築後にresetを呼ぶ)
        self.timer_ctrl = TimerController(self)
        self.timer = self.timer_ctrl.timer

        # 5. 画像リソース & スプライトローダー
        self.image_loader = ImageLoader(base_dir=self.base_dir)
        unlocked_cats = self.data_mgr.get_cafe_data().get("unlocked_cats", ["black"])
        self.image_loader.load_base_images(unlocked_cats)
        self.has_images = self.image_loader.has_images
        self.bg_photo = self.image_loader.bg_photo
        self.cat_textures = self.image_loader.cat_textures

        prof = self.data_mgr.get_profile()
        self.image_loader.update_widget_cat_frames(self.theme["bg"], prof.get("avatar", "black"))

        # 6. UIコンポーネント構築
        self.header_view = HeaderView(self)
        self.treat_label = self.header_view.treat_label
        self.account_btn = self.header_view.account_btn

        self.content_frame = tk.Frame(self.root, bg=self.theme["bg"])
        self.content_frame.pack(expand=True, fill='both', padx=10, pady=5)

        self.tabs = {}
        self.cafe_tab_obj = CafeTab(self)
        self.task_tab_obj = TaskTab(self)
        self.shop_tab_obj = ShopTab(self)
        self.stats_tab_obj = StatsTab(self)
        self.settings_tab_obj = SettingsTab(self)

        self.current_tab = "cafe"
        self.show_tab("cafe")

        # 7. ミニウィジェット & アニメーションエンジン
        self.widget_obj = MiniWidget(self)
        self.widget = self.widget_obj.widget
        self.widget_cat = self.widget_obj.widget_cat
        self.widget_label = self.widget_obj.widget_label
        self.widget_status = self.widget_obj.widget_status
        self.widget_task = self.widget_obj.widget_task
        self.widget_play_btn = self.widget_obj.widget_play_btn

        self.anim_engine = AnimationEngine(self)

        # 8. タイマー初期化
        self.timer.reset()

        # 9. BGM初期設定
        bgm = self.data_mgr.get_setting("bgm_type")
        if bgm and bgm != "none":
            self.sound_mgr.set_bgm(bgm)

        # 10. イベントループ開始
        self.update_status_display()
        self.update_clock()
        self.anim_engine.animate_loop()

        # 初回起動時の相棒選択
        if not self.data_mgr.get_profile().get("starter_chosen", False):
            self.root.after(400, self.task_tab_obj.open_starter_cat_modal)

    def show_tab(self, tab_id):
        self.current_tab = tab_id
        for t_id, frame in self.tabs.items():
            if t_id == tab_id:
                frame.pack(fill='both', expand=True)
                self.header_view.tab_buttons[t_id].config(bg=self.theme["btn"], fg=self.theme["btn_fg"])
            else:
                frame.pack_forget()
                self.header_view.tab_buttons[t_id].config(bg=self.theme["card"], fg=self.theme["text"])

        if tab_id == "task":
            self.task_tab_obj.refresh_task_list()
        elif tab_id == "shop":
            self.shop_tab_obj.refresh_view()
        elif tab_id == "cafe":
            self.cafe_tab_obj.refresh_cafe_elements()
        elif tab_id == "stats":
            self.stats_tab_obj.refresh_view()
        elif tab_id == "settings":
            self.settings_tab_obj.refresh_view()

    def get_cat_texture(self, cat_id):
        return self.image_loader.get_cat_texture(cat_id)

    def open_starter_cat_modal(self):
        if hasattr(self, 'task_tab_obj'):
            self.task_tab_obj.open_starter_cat_modal()

    def open_account_modal(self):
        if hasattr(self, 'task_tab_obj'):
            self.task_tab_obj.open_account_modal()

    def refresh_cafe_elements(self):
        if hasattr(self, 'cafe_tab_obj'):
            self.cafe_tab_obj.sync_unlocked_entities()
            self.cafe_tab_obj.refresh_cafe_elements()
        if hasattr(self, 'header_view'):
            self.header_view.update_treat_display()
            self.header_view.update_profile_display()

    def apply_theme(self, theme_key):
        """テーマを動的に適用・保存（全タブ・全ウィジェット完全同期）"""
        self.data_mgr.set_setting("theme", theme_key)
        self.theme = self.data_mgr.get_current_theme()

        ThemeManager.update_ttk_styles(self.root, self.theme)
        prof = self.data_mgr.get_profile()
        self.image_loader.update_widget_cat_frames(self.theme["bg"], prof.get("avatar", "black"))

        self.root.configure(bg=self.theme["bg"])
        self.header_view.update_theme(self.theme)
        self.content_frame.configure(bg=self.theme["bg"])

        for t_id, tab_frame in self.tabs.items():
            try:
                tab_frame.configure(bg=self.theme["bg"])
            except Exception:
                pass

        for t_id, btn in self.header_view.tab_buttons.items():
            if t_id == self.current_tab:
                btn.config(bg=self.theme["btn"], fg=self.theme["btn_fg"])
            else:
                btn.config(bg=self.theme["card"], fg=self.theme["text"])

        self.cat_canvas.configure(bg=self.theme["bg"])
        if hasattr(self, 'info_card'):
            self.info_card.configure(bg=self.theme["card"])
            self.cycle_label.configure(bg=self.theme["card"], fg=self.theme["text"])
            self.total_pomo_label.configure(bg=self.theme["card"], fg=self.theme["work"])
        self.active_task_banner.configure(bg=self.theme["card"], fg=self.theme["text"])
        self.status_label.configure(bg=self.theme["bg"])
        self.timer_label.configure(bg=self.theme["bg"])
        if hasattr(self, 'btn_frame'):
            self.btn_frame.configure(bg=self.theme["bg"])
        self.start_btn.configure(bg=self.theme["btn"], fg=self.theme["btn_fg"])
        self.feed_btn.configure(bg=self.theme["card"], fg=self.theme["accent"])
        self.reset_btn.configure(bg=self.theme["btn_sec"], fg=self.theme["btn_sec_fg"])

        self.widget_obj.update_theme(self.theme)

        self.cafe_tab_obj.refresh_cafe_elements()
        self.task_tab_obj.refresh_task_list()
        self.shop_tab_obj.refresh_view()
        self.stats_tab_obj.refresh_view()
        self.settings_tab_obj.refresh_view()

        self.show_tab(self.current_tab)
        self.update_status_display()

    def format_time(self, seconds):
        return self.timer_ctrl.format_time(seconds)

    def toggle_timer(self, event=None):
        self.timer_ctrl.toggle()

    def reset_timer(self):
        self.timer_ctrl.reset()

    def switch_mode(self):
        self.timer_ctrl.switch_mode()

    def update_status_display(self):
        if not hasattr(self, 'cycle_label') or not hasattr(self, 'status_label'):
            return

        paws = ""
        for i in range(1, self.timer.long_break_interval + 1):
            if i < self.timer.cycle_count:
                paws += "🐾 "
            elif i == self.timer.cycle_count:
                paws += "🐾 " if self.timer.session_mode != "work" else "⚪ "
            else:
                paws += "⚪ "

        self.cycle_label.config(text=f"セット {self.timer.cycle_count}/{self.timer.long_break_interval} {paws}")

        if self.timer.session_mode == "work":
            color = self.theme["work"]
            state = "おしごと中！🔥" if self.timer.is_running else "おしごと (停止中)"
            short_state = "🔥 おしごと" if self.timer.is_running else "💤 停止中"
        elif self.timer.session_mode == "short_break":
            color = self.theme["break"]
            state = "短い休憩中 ☕" if self.timer.is_running else "休憩 (停止中)"
            short_state = "☕ 休憩中" if self.timer.is_running else "☕ 停止中"
        else:
            color = self.theme["long_break"]
            state = "長いご褒美休憩 🍰" if self.timer.is_running else "長休憩 (停止中)"
            short_state = "🍰 長休憩" if self.timer.is_running else "🍰 停止中"

        self.status_label.config(text=state, fg=color)
        self.timer_label.config(fg=color)
        self.widget_label.config(fg=color)
        self.widget_status.config(text=short_state, fg=color)
        self.widget_play_btn.config(text="⏸" if self.timer.is_running else "▶")

        active_t = self.data_mgr.get_active_task()
        t_text = active_t["title"][:9] + "..." if active_t and len(active_t["title"]) > 9 else (active_t["title"] if active_t else "タスクなし")
        self.widget_task.config(text=f"📝 {t_text}")

    def update_clock(self):
        if getattr(self, 'is_alive', True):
            self.timer.tick()
            self.root.after(1000, self.update_clock)

    def quit_app(self):
        self.is_alive = False
        self.timer.is_running = False
        try:
            self.sound_mgr.stop_bgm()
        except Exception:
            pass
        try:
            self.root.quit()
            self.root.destroy()
        except Exception:
            pass
