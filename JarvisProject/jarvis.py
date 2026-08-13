import os
import time
import speech_recognition as sr
import edge_tts
import asyncio
import pygame
from dotenv import load_dotenv
import google.generativeai as genai
from duckduckgo_search import DDGS

# 環境変数の読み込み
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Jarvisのシステムプロンプト設定
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction="あなたは優秀なAIアシスタント「J.A.R.V.I.S.（ジャービス）」です。丁寧で落ち着いたトーンで、的確に短く答えてください。"
    )
    chat_session = model.start_chat(history=[])
else:
    print("警告: GEMINI_API_KEYが.envに設定されていません。")

# pygameミキサーの初期化（音声再生用）
pygame.mixer.init()

async def generate_speech(text: str, output_file: str = "output.mp3"):
    """edge-ttsを使ってテキストを音声に変換し、mp3ファイルに保存する"""
    # voice="ja-JP-KeitaNeural" (男性の声)
    communicate = edge_tts.Communicate(text, voice="ja-JP-KeitaNeural")
    await communicate.save(output_file)

def speak(text: str):
    """テキストを読み上げる"""
    print(f"JARVIS: {text}")
    # 非同期関数を同期的に実行
    asyncio.run(generate_speech(text, "output.mp3"))
    
    # pygameで音声を再生
    pygame.mixer.music.load("output.mp3")
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        pygame.time.Clock().tick(10)
    
    # 再生が終わったらミキサーからアンロードしてファイルを削除（エラー回避のため）
    pygame.mixer.music.unload()
    try:
        os.remove("output.mp3")
    except OSError:
        pass

def listen() -> str:
    """マイクから音声を拾ってテキストに変換する"""
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("認識準備中... (環境音を測定)")
        r.adjust_for_ambient_noise(source, duration=1)
        print("どうぞ、話しかけてください (Listening...)")
        
        try:
            audio = r.listen(source, timeout=5, phrase_time_limit=10)
            print("認識中...")
            text = r.recognize_google(audio, language="ja-JP")
            print(f"You: {text}")
            return text
        except sr.WaitTimeoutError:
            print("無音が続いたためタイムアウトしました。")
        except sr.UnknownValueError:
            print("音声を認識できませんでした。")
        except sr.RequestError as e:
            print(f"音声認識サービスにアクセスできません: {e}")
        return ""

def search_web(query: str) -> str:
    """DuckDuckGoを使ってウェブ検索を行う"""
    print(f"[システム: '{query}' を検索中...]")
    results = DDGS().text(query, max_results=3)
    if not results:
        return "検索結果が見つかりませんでした。"
    
    context = ""
    for r in results:
        context += f"- {r['title']}: {r['body']}\n"
    return context

def main():
    if not GEMINI_API_KEY:
        speak("システムエラー。Gemini APIキーが設定されていません。.envファイルを確認してください。")
        return

    speak("システムオンライン。お待ちしておりました。")
    
    while True:
        user_input = listen()
        if not user_input:
            continue
            
        if "終了" in user_input or "バイバイ" in user_input:
            speak("システムを終了します。またいつでもお呼びください。")
            break

        # 簡易的な検索トリガー（後でFunction Callingにアップグレード可能）
        if "検索して" in user_input or "調べて" in user_input:
            search_query = user_input.replace("検索して", "").replace("調べて", "").strip()
            if search_query:
                speak(f"はい、{search_query}について検索します。")
                search_result = search_web(search_query)
                prompt = f"以下の検索結果をもとに、ユーザーの質問「{user_input}」に短く答えてください。\n\n【検索結果】\n{search_result}"
                response = chat_session.send_message(prompt)
                speak(response.text)
                continue
        
        # 通常の会話
        response = chat_session.send_message(user_input)
        speak(response.text)

if __name__ == "__main__":
    main()
