class PomodoroTimer:
    def __init__(self, callbacks=None):
        """
        純粋なタイマーのロジックと状態を管理するクラス
        callbacks: {
            'on_tick': func(time_left_seconds),
            'on_state_change': func(),
            'on_work_end': func(),
            'on_break_end': func()
        }
        """
        self.callbacks = callbacks or {}
        
        # 設定値（初期値は仮。sync_settingsで上書きされる）
        self.work_mins = 25
        self.short_break_mins = 5
        self.long_break_mins = 15
        self.long_break_interval = 4
        
        # 状態
        self.is_running = False
        self.session_mode = "work"
        self.time_left = self.work_mins * 60
        self.cycle_count = 1

    def sync_settings(self, work, short_break, long_break, interval):
        self.work_mins = work
        self.short_break_mins = short_break
        self.long_break_mins = long_break
        self.long_break_interval = interval

    def reset(self):
        self.is_running = False
        self.session_mode = "work"
        self.time_left = self.work_mins * 60
        self.cycle_count = 1
        if 'on_state_change' in self.callbacks:
            self.callbacks['on_state_change']()

    def toggle(self):
        self.is_running = not self.is_running
        if 'on_state_change' in self.callbacks:
            self.callbacks['on_state_change']()

    def tick(self):
        if not self.is_running:
            return

        if self.time_left > 0:
            self.time_left -= 1
            if 'on_tick' in self.callbacks:
                self.callbacks['on_tick'](self.time_left)
        else:
            self.is_running = False
            self.switch_mode()

    def switch_mode(self):
        old_mode = self.session_mode
        
        if self.session_mode == "work":
            # 完了イベントを発火
            if 'on_work_end' in self.callbacks:
                self.callbacks['on_work_end']()
                
            if self.cycle_count >= self.long_break_interval:
                self.session_mode = "long_break"
                self.time_left = self.long_break_mins * 60
                self.cycle_count = 1
            else:
                self.session_mode = "short_break"
                self.time_left = self.short_break_mins * 60
                self.cycle_count += 1
        else:
            if 'on_break_end' in self.callbacks:
                self.callbacks['on_break_end']()
                
            self.session_mode = "work"
            self.time_left = self.work_mins * 60

        if 'on_state_change' in self.callbacks:
            self.callbacks['on_state_change']()
