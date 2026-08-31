// timer.worker.ts
// このWorkerはバックグラウンド（ウィンドウ最小化時）でも正確に時を刻むために独立して動作します。

let intervalId: NodeJS.Timeout | null = null;
let expectedNextTick = 0;
let timeRemaining = 0;

self.onmessage = (e: MessageEvent) => {
  const { command, initialTime } = e.data;

  if (command === 'START') {
    if (intervalId) clearInterval(intervalId);
    timeRemaining = initialTime;
    expectedNextTick = performance.now() + 1000;
    
    intervalId = setInterval(() => {
      const now = performance.now();
      const drift = now - expectedNextTick;
      
      if (timeRemaining > 0) {
        timeRemaining--;
        self.postMessage({ type: 'TICK', timeRemaining });
      } else {
        if (intervalId) clearInterval(intervalId);
        self.postMessage({ type: 'DONE' });
      }
      
      expectedNextTick += 1000;
    }, 1000);
  } else if (command === 'PAUSE' || command === 'STOP') {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }
};
