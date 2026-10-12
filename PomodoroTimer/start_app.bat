@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ====================================================
echo  🐾 猫カフェ・ポモドーロ 起動中... 🐾
echo ====================================================
start "" pythonw pomodoro.py
if errorlevel 1 (
    python pomodoro.py
)
