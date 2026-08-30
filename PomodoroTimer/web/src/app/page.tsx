'use client';
import { useState, useEffect } from 'react';
import CatCanvas from '@/components/CatCanvas';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState('light');

  // タイマー機能
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '2rem' }}>
      
      <div className="glass-card animate-float" style={{ textAlign: 'center', width: '400px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🐾 猫カフェ・ポモドーロ</h1>
        
        {/* ReactのCanvasAPIを利用した60FPS猫アニメーション */}
        <div style={{ marginBottom: '1.5rem' }}>
          <CatCanvas isWorking={isRunning} />
        </div>

        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--accent)', fontFamily: 'monospace' }}>
          {formatTime(timeLeft)}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button onClick={toggleTimer}>
            {isRunning ? '⏸ 一時停止' : '▶ スタート'}
          </button>
          <button onClick={() => setTimeLeft(25 * 60)} style={{ backgroundColor: 'var(--text-secondary)' }}>
            🔄 リセット
          </button>
        </div>
      </div>

      <button onClick={toggleTheme} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' }}>
        🌗 テーマ切り替え
      </button>
      
    </div>
  );
}
