'use client';
import catConfig from '../shared/cat_config.json';
import { useEffect, useRef, useState } from 'react';

// AI Workerからのデータ型
type CatState = 'sit' | 'walk' | 'sleep' | 'stretch' | 'groom' | 'play' | 'dash' | 'pounce';
type Facing = 'l' | 'r';
interface CatData {
  id: string;
  type: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  state: CatState;
  facing: Facing;
}

export default function CatCanvas({ isWorking }: { isWorking: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const [cats, setCats] = useState<CatData[]>([]);
  const animTickRef = useRef(0);

  useEffect(() => {
    // AI Workerの初期化
    workerRef.current = new Worker(new URL('../workers/cat-ai.worker.ts', import.meta.url));
    workerRef.current.onmessage = (e: MessageEvent) => {
      if (e.data.type === 'SYNC') {
        setCats(e.data.cats);
        animTickRef.current = e.data.animTick;
      }
    };
    workerRef.current.postMessage({ command: 'INIT' });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // 動作状態の同期
  useEffect(() => {
    workerRef.current?.postMessage({ command: 'SET_WORK_STATE', workingState: isWorking });
  }, [isWorking]);

  // 描画ループ (Canvasは描画のみに専念)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 必要な全画像をキャッシュするオブジェクト
    const imgCache: Record<string, HTMLImageElement> = {};
    const getImg = (src: string) => {
      if (!imgCache[src]) {
        const img = new Image();
        img.src = src;
        imgCache[src] = img;
      }
      return imgCache[src];
    };

    let animFrameId: number;

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const tick = animTickRef.current;

      // Workerから受け取った状態を描画
      cats.forEach((cat) => {
        const type = cat.type;
        const facing = cat.facing;
        const state = cat.state;
        let frameSrc = `/sprites/${type}/sit_${facing}.png`; // デフォルト

        if (state === 'walk') {
          const f = Math.floor(tick / 15) % 2;
          frameSrc = `/sprites/${type}/walk_${facing}_${f}.png`;
        } else if (state === 'dash') {
          const cfg = catConfig.animations['dash'];
          const f = Math.floor(tick / cfg.speed) % cfg.frames;
          frameSrc = `/sprites/${type}/dash_${facing}_${f}.png`;
        } else if (state === 'play') {
          const cfg = catConfig.animations['play'];
          const f = Math.floor(tick / cfg.speed) % cfg.frames;
          frameSrc = `/sprites/${type}/play_${facing}_${f}.png`;
        } else if (state === 'groom') {
          const cfg = catConfig.animations['groom'];
          const f = Math.floor(tick / cfg.speed) % cfg.frames;
          frameSrc = `/sprites/${type}/groom_${facing}_${f}.png`;
        } else if (state === 'stretch') {
          const cfg = catConfig.animations['stretch'];
          const f = Math.floor(tick / cfg.speed) % cfg.frames;
          frameSrc = `/sprites/${type}/stretch_${facing}_${f}.png`;
        } else if (state === 'sleep') {
          const cfg = catConfig.animations['sleep_curl'];
          const f = Math.floor(tick / cfg.speed) % cfg.frames;
          frameSrc = `/sprites/${type}/sleep_curl_${f}.png`;
        } else if (state === 'sit') {
          frameSrc = `/sprites/${type}/sit_${facing}.png`;
        } else if (state === 'pounce') {
          const cfg = catConfig.animations['pounce'];
          const f = Math.floor(tick / cfg.speed) % cfg.frames;
          frameSrc = `/sprites/${type}/pounce_${facing}_${f}.png`;
        }

        const img = getImg(frameSrc);

        if (img.complete) {
          const yOffset = (state === 'walk' || state === 'dash') ? (tick % 12 < 6 ? -2 : 0) : 0;
          
          ctx.save();
          // 反転は画像自体が facing を持っているので、単純にそのまま描画すればOK (生成済み画像に _l, _r がある)
          ctx.drawImage(img, cat.x, cat.y + yOffset, 32, 32);
          ctx.restore();
        }
      });

      // 環境パーティクル
      if (tick % 60 === 0 && isWorking) {
        ctx.font = '10px serif';
        ctx.fillStyle = 'rgba(255, 100, 150, 0.5)';
        ctx.fillText('🌸', Math.random() * canvas.width, Math.random() * canvas.height);
      }

      animFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => cancelAnimationFrame(animFrameId);
  }, [cats, isWorking]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '150px', backgroundImage: 'url(/backgrounds/room_bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', overflow: 'hidden', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)' }}>
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
      />
      {/* 昼夜を表現するオーバーレイ */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', background: !isWorking ? 'rgba(0,0,0,0.4)' : 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%)', transition: 'background 1s ease' }} />
    </div>
  );
}
