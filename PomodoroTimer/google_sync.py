import os
import datetime
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [
    'https://www.googleapis.com/auth/tasks',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'openid'
]

class GoogleSyncManager:
    """Google Tasks (やることリスト) および Google Calendar (予定) との連携マネージャー"""

    def __init__(self, base_dir=None):
        if base_dir is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
        self.base_dir = base_dir
        self.creds_file = os.path.join(base_dir, "credentials.json")
        self.token_file = os.path.join(base_dir, "token.json")
        self.creds = None
        self._load_token()

    def _load_token(self):
        """保存済みトークンを読み込み、必要ならリフレッシュ"""
        if os.path.exists(self.token_file):
            try:
                self.creds = Credentials.from_authorized_user_file(self.token_file, SCOPES)
                if self.creds and self.creds.expired and self.creds.refresh_token:
                    self.creds.refresh(Request())
                    with open(self.token_file, 'w', encoding='utf-8') as token:
                        token.write(self.creds.to_json())
            except Exception as e:
                print("Error loading/refreshing token:", e)
                self.creds = None

    def is_authenticated(self):
        """Google連携が完了しているかどうか"""
        return bool(self.creds and self.creds.valid)

    def has_credentials_file(self):
        """Google Cloudのクライアント情報ファイルが存在するか"""
        return os.path.exists(self.creds_file)

    def login(self):
        """OAuth 2.0 認証フローを実行（ブラウザが起動します）"""
        if not self.has_credentials_file():
            return False, "credentials.json が見つかりません。\nGoogle Cloud Console からダウンロードして PomodoroTimer フォルダに配置してください。"

        try:
            flow = InstalledAppFlow.from_client_secrets_file(self.creds_file, SCOPES)
            self.creds = flow.run_local_server(port=0)
            with open(self.token_file, 'w', encoding='utf-8') as token:
                token.write(self.creds.to_json())
            return True, "Googleアカウントとの連携に成功しました！🎉"
        except Exception as e:
            return False, f"認証エラー: {str(e)}"

    def logout(self):
        """連携を解除（トークン削除）"""
        self.creds = None
        if os.path.exists(self.token_file):
            try:
                os.remove(self.token_file)
            except Exception as e:
                print("Error removing token file:", e)
        return True

    def get_user_email(self):
        """認証ユーザーのメールアドレスを取得"""
        if not self.is_authenticated():
            return None
        try:
            oauth2_service = build('oauth2', 'v2', credentials=self.creds)
            user_info = oauth2_service.userinfo().get().execute()
            return user_info.get('email', '')
        except Exception as e:
            print("Error fetching user email:", e)
            return None

    # --- Google Tasks (やることリスト) 連携 ---
    def fetch_tasks(self, task_list_id='@default'):
        """Google Tasks から未完了タスク一覧を取得"""
        if not self.is_authenticated():
            # 未連携時のデモ/サンプルデータを返す
            return [
                {"id": "demo_task_1", "title": "【サンプル】企画書の作成 📑", "target_pomo": 2, "is_google": True},
                {"id": "demo_task_2", "title": "【サンプル】メール返信とスケジュール確認 ✉️", "target_pomo": 1, "is_google": True},
                {"id": "demo_task_3", "title": "【サンプル】コードレビュー 💻", "target_pomo": 2, "is_google": True}
            ]

        try:
            service = build('tasks', 'v1', credentials=self.creds)
            results = service.tasks().list(tasklist=task_list_id, showCompleted=False).execute()
            items = results.get('items', [])
            tasks = []
            for item in items:
                title = item.get('title', '').strip()
                if title:
                    tasks.append({
                        "id": item['id'],
                        "title": title,
                        "notes": item.get('notes', ''),
                        "due": item.get('due', ''),
                        "target_pomo": 2,
                        "is_google": True
                    })
            return tasks
        except Exception as e:
            print("Error fetching Google Tasks:", e)
            return []

    def complete_task(self, google_task_id, task_list_id='@default'):
        """Google Tasks 上のタスクを完了に更新"""
        if not self.is_authenticated() or google_task_id.startswith("demo_"):
            return True

        try:
            service = build('tasks', 'v1', credentials=self.creds)
            task = service.tasks().get(tasklist=task_list_id, task=google_task_id).execute()
            task['status'] = 'completed'
            service.tasks().update(tasklist=task_list_id, task=google_task_id, body=task).execute()
            return True
        except Exception as e:
            print("Error completing Google Task:", e)
            return False

    def create_task(self, title, notes="", task_list_id='@default'):
        """Google Tasks に新しいタスクを追加"""
        if not self.is_authenticated():
            return "demo_task_" + str(int(datetime.datetime.now().timestamp()))

        try:
            service = build('tasks', 'v1', credentials=self.creds)
            task_body = {'title': title, 'notes': notes}
            result = service.tasks().insert(tasklist=task_list_id, body=task_body).execute()
            return result.get('id')
        except Exception as e:
            print("Error creating Google Task:", e)
            return None

    # --- Google Calendar (予定) 連携 ---
    def fetch_today_events(self):
        """今日の Google カレンダーのイベント（予定）を取得"""
        now = datetime.datetime.utcnow()
        start_of_day = datetime.datetime(now.year, now.month, now.day, 0, 0, 0).isoformat() + 'Z'
        end_of_day = datetime.datetime(now.year, now.month, now.day, 23, 59, 59).isoformat() + 'Z'

        if not self.is_authenticated():
            # サンプル予定データ
            return [
                {"id": "demo_cal_1", "summary": "【サンプル予定】チーム朝会 ☕", "start": "09:30", "end": "10:00"},
                {"id": "demo_cal_2", "summary": "【サンプル予定】集中開発タイム 💻", "start": "14:00", "end": "16:00"},
                {"id": "demo_cal_3", "summary": "【サンプル予定】英語学習 📖", "start": "17:00", "end": "17:30"}
            ]

        try:
            service = build('calendar', 'v3', credentials=self.creds)
            events_result = service.events().list(
                calendarId='primary',
                timeMin=start_of_day,
                timeMax=end_of_day,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            events = events_result.get('items', [])
            result = []
            for event in events:
                summary = event.get('summary', '（無題の予定）')
                start = event.get('start', {}).get('dateTime', event.get('start', {}).get('date', ''))
                end = event.get('end', {}).get('dateTime', event.get('end', {}).get('date', ''))
                
                # 時刻表示のフォーマット (HH:MM)
                start_str = start[11:16] if 'T' in start else "終日"
                end_str = end[11:16] if 'T' in end else ""
                
                result.append({
                    "id": event['id'],
                    "summary": summary,
                    "start": start_str,
                    "end": end_str
                })
            return result
        except Exception as e:
            print("Error fetching Google Calendar events:", e)
            return []
