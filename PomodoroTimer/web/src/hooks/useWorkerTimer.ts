import { useState, useEffect, useRef } from 'react';

export function useWorkerTimer(initialSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Next.js環境でブラウザ側のみWorkerをインスタンス化
    workerRef.current = new Worker(new URL('../workers/timer.worker.ts', import.meta.url));

    workerRef.current.onmessage = (e: MessageEvent) => {
      if (e.data.type === 'TICK') {
        setTimeLeft(e.data.timeRemaining);
      } else if (e.data.type === 'DONE') {
        setIsRunning(false);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const toggleTimer = () => {
    if (!workerRef.current) return;
    
    if (isRunning) {
      workerRef.current.postMessage({ command: 'PAUSE' });
      setIsRunning(false);
    } else {
      workerRef.current.postMessage({ command: 'START', initialTime: timeLeft });
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ command: 'STOP' });
    }
    setIsRunning(false);
    setTimeLeft(initialSeconds);
  };

  return { timeLeft, isRunning, toggleTimer, resetTimer, setTimeLeft };
}
