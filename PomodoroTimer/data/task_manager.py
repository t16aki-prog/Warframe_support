"""PomodoroTimer タスク管理モジュール"""

import time


class TaskManager:
    """タスクのCRUDおよび進捗時間の管理を担当"""

    def __init__(self, storage):
        self.storage = storage

    @property
    def data(self):
        return self.storage.data

    def get_tasks(self):
        return self.data["tasks"]

    def add_task(self, title, target_pomo=1, tag="💼 仕事", priority="⚡ 中", google_id=None):
        task_id = int(time.time() * 1000) % 1000000
        new_task = {
            "id": task_id,
            "title": title,
            "target_pomo": max(1, target_pomo),
            "completed_pomo": 0,
            "is_done": False,
            "tag": tag,
            "priority": priority,
            "google_id": google_id
        }
        self.data["tasks"].append(new_task)
        if not self.data.get("active_task_id"):
            self.data["active_task_id"] = task_id
        self.storage.save_data()
        return new_task

    def delete_task(self, task_id):
        self.data["tasks"] = [t for t in self.data["tasks"] if t["id"] != task_id]
        if self.data.get("active_task_id") == task_id:
            self.data["active_task_id"] = self.data["tasks"][0]["id"] if self.data["tasks"] else None
        self.storage.save_data()

    def toggle_task_done(self, task_id):
        for t in self.data["tasks"]:
            if t["id"] == task_id:
                t["is_done"] = not t["is_done"]
                self.storage.save_data()
                return t
        return None

    def get_active_task(self):
        active_id = self.data.get("active_task_id")
        for t in self.data["tasks"]:
            if t["id"] == active_id:
                return t
        if self.data["tasks"]:
            self.data["active_task_id"] = self.data["tasks"][0]["id"]
            return self.data["tasks"][0]
        return None

    def set_active_task(self, task_id):
        self.data["active_task_id"] = task_id
        self.storage.save_data()

    def increment_active_task_pomo(self):
        task = self.get_active_task()
        if task:
            task["completed_pomo"] += 1
            self.storage.save_data()
            return task
        return None

    def add_active_task_time(self, seconds):
        task = self.get_active_task()
        if task:
            if "time_spent" not in task:
                task["time_spent"] = 0
            task["time_spent"] += seconds
            self.storage.save_data()
            return task
        return None
