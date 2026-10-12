@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo ====================================================
echo  🐾 Windows起動時の自動起動（スタートアップ）登録
echo ====================================================

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut(\"$([Environment]::GetFolderPath('Startup'))\PomodoroTimer.lnk\"); $s.TargetPath = \"$((Get-Item .).FullName)\start_app.bat\"; $s.WorkingDirectory = \"$((Get-Item .).FullName)\"; $s.WindowStyle = 7; $s.Save()"

if %errorlevel% equ 0 (
    echo [OK] スタートアップに登録完了しました！次回PC起動時から自動起動します。
) else (
    echo [NG] 登録に失敗しました。
)
pause
