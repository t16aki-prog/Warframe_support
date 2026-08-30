'use client';
import { useEffect, useRef } from 'react';

// 猫の自律AIを簡略化したキャンバス描画コンポーネント
export default function CatCanvas({ isWorking }: { isWorking: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 画像アセットの事前読み込み
    const img = new Image();
    img.src = '/sprites/calico_walk_r_0.png'; // 仮のベーススプライト

    let animFrameId: number;
    let x = 50;
    let dx = 1;
    let tick = 0;

    const renderLoop = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 簡単な自律移動AI (60FPS)
      if (isWorking) {
        x += dx * 0.5; // 滑らかな移動
        if (x > canvas.width - 40 || x < 10) dx *= -1;
      }

      // 猫の描画 (画像の読み込みが完了している場合)
      if (img.complete) {
        // 歩行時の上下バウンド
        const yOffset = isWorking && tick % 20 < 10 ? -2 : 0;
        
        ctx.save();
        if (dx < 0) {
          // 反転
          ctx.translate(x + 32, 50 + yOffset);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, 32, 32);
        } else {
          ctx.drawImage(img, x, 50 + yOffset, 32, 32);
        }
        ctx.restore();
      }

      // 環境パーティクル
      if (tick % 30 === 0) {
        ctx.font = '10px serif';
        ctx.fillStyle = 'rgba(255, 100, 150, 0.5)';
        ctx.fillText('🌸', Math.random() * canvas.width, Math.random() * canvas.height);
      }

      animFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => cancelAnimationFrame(animFrameId);
  }, [isWorking]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '150px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)' }}>
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
      />
      {/* 昼夜を表現するオーバーレイ */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)' }} />
    </div>
  );
}
