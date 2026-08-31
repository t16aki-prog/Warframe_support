'use client';
import { useState } from 'react';
import CatCanvas from '@/components/CatCanvas';
import { useWorkerTimer } from '@/hooks/useWorkerTimer';

export default function Home() {
  const { timeLeft, isRunning, toggleTimer, resetTimer } = useWorkerTimer(25 * 60);
  const [theme, setTheme] = useState('light');

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
          <button onClick={resetTimer} style={{ backgroundColor: 'var(--text-secondary)' }}>
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
