from core.timer import PomodoroTimer

class TimerController:
    """タイマーイベント・セッション管理・通知を統括するコントローラー"""
    def __init__(self, app):
        self.app = app
        self.timer = PomodoroTimer(callbacks={
            'on_tick': self._on_timer_tick,
            'on_state_change': self._on_timer_state_change,
            'on_work_end': self._on_work_end,
            'on_break_end': self._on_break_end
        })
        self.sync_settings()

    def sync_settings(self):
        self.timer.sync_settings(
            self.app.data_mgr.get_setting("work_minutes"),
            self.app.data_mgr.get_setting("short_break_minutes"),
            self.app.data_mgr.get_setting("long_break_minutes"),
            self.app.data_mgr.get_setting("long_break_interval")
        )

    def _on_timer_tick(self, time_left):
        t_str = self.format_time(time_left)
        if hasattr(self.app, 'timer_label'):
            self.app.timer_label.config(text=t_str)
        if hasattr(self.app, 'widget_obj'):
            self.app.widget_obj.widget_label.config(text=t_str)
        if self.timer.session_mode == "work":
            self.app.data_mgr.add_active_task_time(1)

    def _on_timer_state_change(self):
        if hasattr(self.app, 'start_btn'):
            self.app.start_btn.config(text="⏸ 停止" if self.timer.is_running else "▶ 開始")
        self.app.update_status_display()
        is_sleep = not self.timer.is_running or self.timer.session_mode != "work"

        if self.timer.is_running:
            self.app.data_mgr.start_session(self.timer.session_mode)
        else:
            self.app.data_mgr.cancel_session(was_user_reset=False)

        if hasattr(self.app, 'cafe_tab_obj'):
            self.app.cafe_tab_obj.update_cat_sleep_mode(is_sleep)
            self.app.cafe_tab_obj.refresh_cafe_elements()

    def _on_work_end(self):
        self.app.sound_mgr.play_se("work_end")
        self.app.data_mgr.finish_session()
        self.app.data_mgr.add_pomodoro_reward()
        self.app.data_mgr.increment_active_task_pomo()
        if hasattr(self.app, 'header_view'):
            self.app.header_view.update_treat_display()
        if self.app.widget.state() == "normal":
            self.app.widget.lift()
        else:
            self.app.root.deiconify()
            self.app.root.lift()

    def _on_break_end(self):
        self.app.sound_mgr.play_se("break_end")
        if self.app.widget.state() == "normal":
            self.app.widget.lift()
        else:
            self.app.root.deiconify()
            self.app.root.lift()

    def format_time(self, seconds):
        m, s = divmod(seconds, 60)
        return f"{m:02d}:{s:02d}"

    def toggle(self):
        self.timer.toggle()

    def reset(self):
        self.app.data_mgr.cancel_session(was_user_reset=True)
        self.timer.reset()

    def switch_mode(self):
        self.app.data_mgr.cancel_session(was_user_reset=True)
        self.timer.switch_mode()
